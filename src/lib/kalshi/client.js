// Thin client for Kalshi's public market-data API. Read-only: this file never
// sends credentials and has no code path that places or cancels orders.

const BASE = process.env.KALSHI_API_BASE || 'https://api.elections.kalshi.com/trade-api/v2';
// Gap between requests. The live scan makes a short burst; long jobs should slow down.
let minGapMs = parseInt(process.env.KALSHI_MIN_GAP_MS || '300', 10);
let maxRetries = 4;
export function setPace(gapMs, retries) {
  minGapMs = gapMs;
  maxRetries = retries;
}

let nextSlot = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Each request takes the next start slot, so starts are spaced by minGapMs but
// several may be in flight at once. The public rate limit is tight.
async function turn() {
  const now = Date.now();
  const at = Math.max(now, nextSlot);
  nextSlot = at + minGapMs;
  if (at > now) await sleep(at - now);
}

export async function kget(path, params = {}, { retries = maxRetries, signal } = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) v.forEach((x) => qs.append(k, x));
    else qs.set(k, v);
  }
  const url = `${BASE}${path}${qs.size ? `?${qs}` : ''}`;
  for (let attempt = 0; ; attempt++) {
    await turn();
    let r;
    try {
      r = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: signal || AbortSignal.timeout(15000),
        cache: 'no-store',
      });
    } catch (err) {
      // A stalled or dropped connection: try again unless the caller cancelled.
      if (signal?.aborted || attempt >= retries) throw err;
      continue;
    }
    if (r.status === 429 && attempt < retries) {
      await sleep(Math.min(15000, 600 * 2 ** attempt));
      continue;
    }
    if (!r.ok) throw new Error(`Kalshi ${r.status} on ${path}`);
    return r.json();
  }
}

export const num = (x) => {
  const n = parseFloat(x);
  return Number.isFinite(n) ? n : 0;
};

export function seriesOf(m) {
  return (m.event_ticker || m.ticker || '').split('-')[0];
}

export function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// Hourly candles for up to 100 markets per request (10,000 periods per request).
export async function batchCandles(tickers, startTs, endTs, interval = 60, opts) {
  const periods = Math.ceil((endTs - startTs) / (interval * 60)) + 1;
  const per = Math.max(1, Math.min(100, Math.floor(10000 / periods)));
  const out = {};
  for (const group of chunk(tickers, per)) {
    const d = await kget(
      '/markets/candlesticks',
      { market_tickers: group.join(','), start_ts: startTs, end_ts: endTs, period_interval: interval },
      opts
    );
    for (const m of d.markets || []) out[m.market_ticker || m.ticker] = (m.candlesticks || []).map(candle);
  }
  return out;
}

export function candle(c) {
  const bid = num(c.yes_bid?.close_dollars);
  const ask = num(c.yes_ask?.close_dollars);
  const last = c.price?.close_dollars ? num(c.price.close_dollars) : null;
  // A quote is only a price when both sides are real and reasonably close. An
  // empty book reads as 0 / 1 and would otherwise look like a 50 cent market.
  const quoted = bid > 0 && ask < 1 && ask > bid && ask - bid <= 0.3;
  return {
    t: c.end_period_ts,
    bid,
    ask,
    mid: quoted ? (bid + ask) / 2 : last || 0,
    last,
    vol: num(c.volume_fp),
    oi: num(c.open_interest_fp),
  };
}

export async function batchOrderbooks(tickers, opts) {
  const out = {};
  for (const group of chunk(tickers, 100)) {
    const d = await kget('/markets/orderbooks', { tickers: group }, opts);
    for (const o of d.orderbooks || []) out[o.ticker] = book(o.orderbook_fp);
  }
  return out;
}

// Kalshi returns resting YES bids and NO bids. A NO bid at x is a YES ask at 1 - x.
export function book(ob) {
  const lv = (rows) => (rows || []).map(([p, q]) => ({ p: num(p), q: num(q) }));
  const bids = lv(ob?.yes_dollars).sort((a, b) => b.p - a.p);
  const asks = lv(ob?.no_dollars)
    .map((l) => ({ p: +(1 - l.p).toFixed(4), q: l.q }))
    .sort((a, b) => a.p - b.p);
  return { bids, asks };
}
