// Technical indicator + signal engine for Swami Signals.
// Pure functions over candles: [{ time (unix sec), open, high, low, close, volume }].

export function ema(values, period) {
  const out = new Array(values.length).fill(null);
  if (values.length < period) return out;
  const k = 2 / (period + 1);
  let prev = 0;
  for (let i = 0; i < period; i++) prev += values[i];
  prev /= period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

// Wilder RSI
export function rsi(closes, period = 14) {
  const out = new Array(closes.length).fill(null);
  if (closes.length <= period) return out;
  let gain = 0, loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gain += d; else loss -= d;
  }
  gain /= period; loss /= period;
  out[period] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    gain = (gain * (period - 1) + Math.max(d, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-d, 0)) / period;
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  return out;
}

// Wilder ATR
export function atr(candles, period = 10) {
  const out = new Array(candles.length).fill(null);
  if (candles.length <= period) return out;
  const tr = candles.map((c, i) => i === 0 ? c.high - c.low
    : Math.max(c.high - c.low, Math.abs(c.high - candles[i - 1].close), Math.abs(c.low - candles[i - 1].close)));
  let prev = 0;
  for (let i = 1; i <= period; i++) prev += tr[i];
  prev /= period;
  out[period] = prev;
  for (let i = period + 1; i < candles.length; i++) {
    prev = (prev * (period - 1) + tr[i]) / period;
    out[i] = prev;
  }
  return out;
}

export function macd(closes, fast = 12, slow = 26, signal = 9) {
  const f = ema(closes, fast), s = ema(closes, slow);
  const line = closes.map((_, i) => (f[i] == null || s[i] == null ? null : f[i] - s[i]));
  const start = line.findIndex(v => v != null);
  const hist = new Array(closes.length).fill(null);
  if (start < 0) return { line, hist };
  const sig = ema(line.slice(start), signal);
  for (let i = start; i < closes.length; i++) {
    const sv = sig[i - start];
    if (sv != null) hist[i] = line[i] - sv;
  }
  return { line, hist };
}

// Sensitivity 1 (few, slow signals) .. 10 (many, fast signals) -> ATR band multiplier.
export const sensitivityToMult = s => 5 - 0.35 * Math.min(10, Math.max(1, s));

/**
 * ATR trailing-stop trend engine. A signal fires on the bar whose CLOSE crosses
 * the trailing stop. Only closed bars are evaluated (the last, still-forming
 * candle is skipped), so a printed signal never moves or disappears.
 */
export function computeSignals(candles, sensitivity = 5, { lastBarClosed = false } = {}) {
  const n = candles.length;
  const end = lastBarClosed ? n : n - 1; // exclusive
  const mult = sensitivityToMult(sensitivity);
  const a = atr(candles, 10);
  const closes = candles.map(c => c.close);
  const e200 = ema(closes, 200);
  const stop = new Array(n).fill(null);
  const trend = new Array(n).fill(0);
  const signals = [];
  let up = null, dn = null, dir = 0;
  for (let i = 0; i < end; i++) {
    if (a[i] == null) continue;
    const c = candles[i], mid = (c.high + c.low) / 2;
    const rawUp = mid + mult * a[i], rawDn = mid - mult * a[i];
    const prevClose = candles[i - 1].close;
    const prevUp = up, prevDn = dn;
    up = prevUp == null || rawUp < prevUp || prevClose > prevUp ? rawUp : prevUp;
    dn = prevDn == null || rawDn > prevDn || prevClose < prevDn ? rawDn : prevDn;
    const prevDir = dir;
    if (dir === 0) dir = c.close >= mid ? 1 : -1;
    else if (dir === -1 && prevUp != null && c.close > prevUp) dir = 1;
    else if (dir === 1 && prevDn != null && c.close < prevDn) dir = -1;
    trend[i] = dir;
    stop[i] = dir === 1 ? dn : up;
    if (prevDir !== 0 && dir !== prevDir) {
      const withTrend = e200[i] != null && (dir === 1 ? c.close > e200[i] : c.close < e200[i]);
      signals.push({ i, time: c.time, type: dir === 1 ? "buy" : "sell", price: c.close, stop: stop[i], strong: withTrend });
    }
  }
  return { stop, trend, signals, mult };
}

// Entry / stop / targets for the active (most recent) signal.
export function riskLevels(candles, engine) {
  const sig = engine.signals[engine.signals.length - 1];
  if (!sig) return null;
  const long = sig.type === "buy";
  const risk = Math.abs(sig.price - sig.stop);
  if (!(risk > 0)) return null;
  const s = long ? 1 : -1;
  let lastStop = sig.stop;
  for (let i = candles.length - 1; i >= sig.i; i--) if (engine.stop[i] != null) { lastStop = engine.stop[i]; break; }
  return {
    side: long ? "LONG" : "SHORT", entry: sig.price, initialStop: sig.stop, trailingStop: lastStop, risk,
    tp1: sig.price + s * risk, tp2: sig.price + s * 2 * risk, tp3: sig.price + s * 3 * risk,
    barsAgo: candles.length - 1 - sig.i, time: sig.time,
  };
}

// Auto trend lines: connect the two most recent confirmed swing highs / lows.
export function trendLines(candles, wing = 5, lookback = 160) {
  const n = candles.length, from = Math.max(wing, n - lookback);
  const highs = [], lows = [];
  for (let i = from; i < n - wing; i++) {
    let isH = true, isL = true;
    for (let j = i - wing; j <= i + wing; j++) {
      if (j === i) continue;
      if (candles[j].high >= candles[i].high) isH = false;
      if (candles[j].low <= candles[i].low) isL = false;
    }
    if (isH) highs.push(i);
    if (isL) lows.push(i);
  }
  const line = (idx, key) => {
    if (idx.length < 2) return null;
    const a = idx[idx.length - 2], b = idx[idx.length - 1];
    const slope = (candles[b][key] - candles[a][key]) / (b - a);
    return {
      from: { time: candles[a].time, value: candles[a][key] },
      to: { time: candles[n - 1].time, value: candles[b][key] + slope * (n - 1 - b) },
      slope,
    };
  };
  return { resistance: line(highs, "high"), support: line(lows, "low") };
}

/**
 * Backtest the signals: act on the open of the bar AFTER the signal bar,
 * always in the market (long on buy, short on sell), fee charged per side.
 */
export function backtest(candles, signals, { feePct = 0.05, allowShort = true } = {}) {
  const fee = feePct / 100;
  const trades = [];
  for (let k = 0; k < signals.length; k++) {
    const s = signals[k], ei = s.i + 1;
    if (ei >= candles.length) break;
    const long = s.type === "buy";
    if (!long && !allowShort) continue;
    const next = signals[k + 1];
    const xi = next && next.i + 1 < candles.length ? next.i + 1 : null;
    const entry = candles[ei].open;
    const exit = xi != null ? candles[xi].open : candles[candles.length - 1].close;
    const gross = long ? exit / entry - 1 : 1 - exit / entry;
    trades.push({ side: long ? "LONG" : "SHORT", entryTime: candles[ei].time, exitTime: candles[xi ?? candles.length - 1].time, entry, exit, ret: gross - 2 * fee, open: xi == null });
  }
  let eq = 1, peak = 1, maxDD = 0, gw = 0, gl = 0, wins = 0;
  for (const t of trades) {
    eq *= 1 + t.ret;
    peak = Math.max(peak, eq);
    maxDD = Math.max(maxDD, 1 - eq / peak);
    if (t.ret > 0) { wins++; gw += t.ret; } else gl -= t.ret;
  }
  const first = trades[0];
  const hold = first ? candles[candles.length - 1].close / first.entry - 1 : 0;
  return {
    trades, count: trades.length,
    winRate: trades.length ? wins / trades.length : 0,
    profitFactor: gl > 0 ? gw / gl : gw > 0 ? Infinity : 0,
    totalReturn: eq - 1, maxDrawdown: maxDD, buyHold: hold,
    avgTrade: trades.length ? trades.reduce((a, t) => a + t.ret, 0) / trades.length : 0,
  };
}

// Pick the sensitivity with the best in-sample result (needs >= 4 trades).
export function autoTune(candles, opts) {
  let best = { sensitivity: 5, score: -Infinity };
  for (let s = 1; s <= 10; s++) {
    const bt = backtest(candles, computeSignals(candles, s, opts).signals);
    if (bt.count < 4) continue;
    if (bt.totalReturn > best.score) best = { sensitivity: s, score: bt.totalReturn };
  }
  return best.sensitivity;
}

// Confluence: several independent reads combined into one -100..+100 score.
export function confluence(candles, engine) {
  const closes = candles.map(c => c.close);
  const i = candles.length - 1;
  const last = closes[i];
  const e50 = ema(closes, 50)[i], e200 = ema(closes, 200)[i];
  const r = rsi(closes, 14)[i];
  const h = macd(closes).hist[i];
  let t = 0;
  for (let j = i; j >= 0; j--) if (engine.trend[j]) { t = engine.trend[j]; break; }
  const items = [
    { name: "Trailing-stop trend", value: t > 0 ? "Up" : t < 0 ? "Down" : "—", vote: t, weight: 30 },
    { name: "Price vs EMA 200", value: e200 == null ? "n/a" : last > e200 ? "Above" : "Below", vote: e200 == null ? 0 : last > e200 ? 1 : -1, weight: 20 },
    { name: "EMA 50 vs EMA 200", value: e50 == null || e200 == null ? "n/a" : e50 > e200 ? "Bullish" : "Bearish", vote: e50 == null || e200 == null ? 0 : e50 > e200 ? 1 : -1, weight: 20 },
    { name: "MACD histogram", value: h == null ? "n/a" : h > 0 ? "Positive" : "Negative", vote: h == null ? 0 : h > 0 ? 1 : -1, weight: 15 },
    { name: "RSI (14)", value: r == null ? "n/a" : r.toFixed(1), vote: r == null ? 0 : r > 55 ? 1 : r < 45 ? -1 : 0, weight: 15 },
  ];
  const score = Math.round(items.reduce((a, x) => a + x.vote * x.weight, 0));
  const label = score >= 60 ? "Strong Bullish" : score >= 20 ? "Bullish" : score > -20 ? "Neutral" : score > -60 ? "Bearish" : "Strong Bearish";
  return { score, label, items, rsi: r, ema50: e50, ema200: e200, overbought: r != null && r > 70, oversold: r != null && r < 30 };
}

export function analyze(candles, sensitivity, opts) {
  const engine = computeSignals(candles, sensitivity, opts);
  return {
    engine,
    levels: riskLevels(candles, engine),
    lines: trendLines(candles),
    stats: backtest(candles, engine.signals),
    conf: confluence(candles, engine),
  };
}
