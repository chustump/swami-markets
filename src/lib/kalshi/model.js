// The scoring model. Deliberately small: the market price is the starting point
// and a handful of signals nudge it. The live scanner and the backtest both call
// features() and predict() from this file, so the numbers on the page describe
// the same model that is making the picks.

import weights from '../../data/model.js';

export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const logit = (p) => Math.log(p / (1 - p));
export const sigmoid = (z) => 1 / (1 + Math.exp(-z));
const safe = (p) => clamp(p, 0.01, 0.99);

// Kalshi's standard taker fee per contract: 7% of price x (1 - price).
export const FEE_RATE = 0.07;
export const fee = (price) => FEE_RATE * price * (1 - price);

export const FEATURES = ['bias', 'price', 'trend24h', 'momentum6h', 'trendOnVolume'];

// candles: hourly, oldest first, ending at the moment being scored.
export function features(candles, bid, ask) {
  const mid = safe((bid + ask) / 2);
  const now = candles.length ? candles[candles.length - 1].t : 0;
  const at = (hoursAgo) => {
    const cutoff = now - hoursAgo * 3600;
    let pick = null;
    for (const c of candles) if (c.t <= cutoff && c.mid > 0) pick = c;
    return pick;
  };
  const c24 = at(24) || candles.find((c) => c.mid > 0);
  const c6 = at(6) || c24;
  const trend24h = c24 ? logit(mid) - logit(safe(c24.mid)) : 0;
  const momentum6h = c6 ? logit(mid) - logit(safe(c6.mid)) : 0;

  const vol = (fromH, toH) =>
    candles.filter((c) => c.t > now - fromH * 3600 && c.t <= now - toH * 3600).reduce((s, c) => s + c.vol, 0);
  const recentRate = vol(6, 0) / 6;
  const earlierRate = vol(30, 6) / 24;
  const volumeSurge = clamp(Math.log((recentRate + 1) / (earlierRate + 1)), -2, 2);

  const oiNow = candles.length ? candles[candles.length - 1].oi : 0;
  const oiThen = c24 ? c24.oi : oiNow;
  const oiChange = oiThen > 0 ? clamp((oiNow - oiThen) / oiThen, -1, 3) : 0;

  return {
    mid,
    trend24h: clamp(trend24h, -3, 3),
    momentum6h: clamp(momentum6h, -3, 3),
    volumeSurge,
    oiChange,
    spread: ask - bid,
    x: [1, logit(mid), clamp(trend24h, -3, 3), clamp(momentum6h, -3, 3), clamp(trend24h, -3, 3) * volumeSurge],
  };
}

// extras are live-only nudges (order book imbalance, news) that cannot be
// reconstructed for settled markets and so are not part of the backtest.
export function predict(f, extras = {}, w = weights.coef) {
  let z = 0;
  for (let i = 0; i < w.length; i++) z += w[i] * f.x[i];
  const base = sigmoid(z);
  z += (weights.live?.imbalance ?? 0) * (extras.imbalance || 0);
  z += (weights.live?.news ?? 0) * (extras.news || 0);
  return { base, prob: sigmoid(z) };
}

// Net edge in dollars per contract after crossing the spread and paying the fee.
export function edge(prob, bid, ask) {
  const yes = ask > 0 && ask < 1 ? prob - ask - fee(ask) : -1;
  const noPrice = 1 - bid;
  const no = bid > 0 && bid < 1 ? 1 - prob - noPrice - fee(noPrice) : -1;
  return yes >= no
    ? { side: 'YES', price: ask, fee: fee(ask), net: yes, gross: prob - ask }
    : { side: 'NO', price: noPrice, fee: fee(noPrice), net: no, gross: 1 - prob - noPrice };
}

export function imbalance(ob, levels = 5) {
  if (!ob) return 0;
  const b = ob.bids.slice(0, levels).reduce((s, l) => s + l.q, 0);
  const a = ob.asks.slice(0, levels).reduce((s, l) => s + l.q, 0);
  return b + a > 0 ? (b - a) / (b + a) : 0;
}
