// Fits and scores the edge model on settled Kalshi markets.
//   node scripts/backtest.mjs            (set NODE_USE_ENV_PROXY=1 behind a proxy)
// Writes src/data/model.js (the weights the live scanner uses) and
// src/data/backtest.json (the numbers shown on the Edge page).

import fs from 'node:fs';
import { kget, num, batchCandles, setPace } from '../src/lib/kalshi/client.js';
import { features, predict, edge, sigmoid, FEATURES } from '../src/lib/kalshi/model.js';

setPace(450, 8);

const DAYS = parseInt(process.env.BT_DAYS || '50', 10);
const PAGES_PER_WINDOW = parseInt(process.env.BT_PAGES || '2', 10);
// Far too many markets settle to read them all, so the first pages of every
// two-hour slice are sampled. Short slices keep any one time of day from dominating.
const WINDOW = parseInt(process.env.BT_WINDOW_HOURS || '2', 10) * 3600;
const MIN_VOLUME = 3000;
// Each market is scored once, a fixed number of hours after it opened. The moment
// is chosen without looking at when or how the market ended: scoring "N hours
// before close" would leak the outcome, because many markets close early only
// when YES has happened.
const AGES = [30, 54, 102];
const HOUR = 3600;

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const ts = (iso) => Math.floor(new Date(iso).getTime() / 1000);

async function collect() {
  const now = Math.floor(Date.now() / 1000);
  const cutoff = ts((await kget('/historical/cutoff')).market_settled_ts);
  const start = Math.max(cutoff + HOUR, now - DAYS * 86400);
  const picked = [];
  let seen = 0;
  for (let day = start; day < now - HOUR; day += WINDOW) {
    let cursor;
    for (let page = 0; page < PAGES_PER_WINDOW; page++) {
      const d = await kget('/markets', {
        status: 'settled', mve_filter: 'exclude', limit: 1000,
        min_settled_ts: day, max_settled_ts: Math.min(day + WINDOW, now), cursor,
      });
      seen += d.markets.length;
      for (const m of d.markets) {
        if (m.market_type !== 'binary' || (m.result !== 'yes' && m.result !== 'no')) continue;
        if (num(m.volume_fp) < MIN_VOLUME) continue;
        const open = ts(m.open_time);
        const close = Math.min(ts(m.close_time), m.settlement_ts ? ts(m.settlement_ts) : Infinity);
        const age = AGES[hash(m.ticker) % AGES.length];
        const asof = open + age * HOUR;
        if (asof >= close) continue; // already closed by then: nothing to score
        picked.push({ ticker: m.ticker, event: m.event_ticker, y: m.result === 'yes' ? 1 : 0, close, age, asof, volume: num(m.volume_fp) });
      }
      cursor = d.cursor;
      if (!cursor || d.markets.length < 1000) break;
    }
    process.stderr.write(`\r${new Date(day * 1000).toISOString().slice(0, 10)} seen ${seen} kept ${picked.length}   `);
  }
  // At most three markets per event, so one strike ladder cannot dominate.
  const byEvent = {};
  for (const m of picked.sort((a, b) => b.volume - a.volume)) (byEvent[m.event] ||= []).push(m);
  return { markets: Object.values(byEvent).flatMap((l) => l.slice(0, 3)), seen, start, end: now };
}

async function addFeatures(markets) {
  const buckets = {};
  for (const m of markets) (buckets[Math.floor(m.asof / 86400)] ||= []).push(m);
  const rows = [];
  let done = 0;
  for (const [b, list] of Object.entries(buckets)) {
    const from = b * 86400 - 48 * HOUR;
    const to = (+b + 1) * 86400;
    const candles = await batchCandles(list.map((m) => m.ticker), from, to, 60);
    for (const m of list) {
      const cs = (candles[m.ticker] || []).filter((c) => c.t <= m.asof && c.t > m.asof - 48 * HOUR);
      const last = cs[cs.length - 1];
      if (!last || cs.length < 12 || m.asof - last.t > 2 * HOUR) continue;
      if (cs.filter((c) => c.t > m.asof - 24 * HOUR).reduce((v, c) => v + c.vol, 0) < 200) continue; // was it trading?
      const { bid, ask } = last;
      if (!(bid >= 0.03 && ask <= 0.97 && ask > bid && ask - bid <= 0.1)) continue;
      const f = features(cs, bid, ask);
      rows.push({ ...m, bid, ask, mid: f.mid, x: f.x });
    }
    done += list.length;
    process.stderr.write(`\rcandles ${done}/${markets.length} usable ${rows.length}   `);
  }
  return rows;
}

// Logistic regression, shrunk toward "the market price is right" ([0,1,0,0,0]).
function fit(rows, lambda = 2) {
  const prior = [0, 1, 0, 0, 0];
  let w = [...prior];
  for (let it = 0; it < 4000; it++) {
    const g = w.map((wi, i) => (lambda * (wi - prior[i])) / rows.length);
    for (const r of rows) {
      const p = sigmoid(r.x.reduce((s, xi, i) => s + xi * w[i], 0));
      for (let i = 0; i < w.length; i++) g[i] += ((p - r.y) * r.x[i]) / rows.length;
    }
    w = w.map((wi, i) => wi - 0.3 * g[i]);
  }
  return w.map((v) => +v.toFixed(4));
}

function score(rows, w) {
  const n = rows.length;
  const r4 = (v) => +v.toFixed(4);
  let bm = 0, bk = 0;
  const diffs = [];
  const preds = rows.map((r) => {
    const p = predict({ x: r.x }, {}, w).base;
    bm += (p - r.y) ** 2;
    bk += (r.mid - r.y) ** 2;
    diffs.push((p - r.y) ** 2 - (r.mid - r.y) ** 2);
    return p;
  });
  const mean = diffs.reduce((s, d) => s + d, 0) / n;
  const sd = Math.sqrt(diffs.reduce((s, d) => s + (d - mean) ** 2, 0) / (n - 1));

  const bins = Array.from({ length: 10 }, () => ({ n: 0, pred: 0, market: 0, hit: 0 }));
  rows.forEach((r, i) => {
    const b = bins[Math.min(9, Math.floor(preds[i] * 10))];
    b.n++; b.pred += preds[i]; b.market += r.mid; b.hit += r.y;
  });

  const pnl = [0.02, 0.05].map((threshold) => {
    let trades = 0, wins = 0, profit = 0, staked = 0, fees = 0;
    rows.forEach((r, i) => {
      const e = edge(preds[i], r.bid, r.ask);
      if (e.net < threshold) return;
      const won = e.side === 'YES' ? r.y === 1 : r.y === 0;
      trades++; wins += won ? 1 : 0; staked += e.price + e.fee; fees += e.fee;
      profit += (won ? 1 : 0) - e.price - e.fee;
    });
    return { threshold, trades, winRate: trades ? r4(wins / trades) : null, profit: r4(profit), staked: r4(staked), fees: r4(fees), roi: staked ? r4(profit / staked) : null };
  });

  return {
    n,
    brierModel: r4(bm / n),
    brierMarket: r4(bk / n),
    brierDiff: r4(mean),
    brierDiffCI: [r4(mean - 1.96 * sd / Math.sqrt(n)), r4(mean + 1.96 * sd / Math.sqrt(n))],
    calibration: bins.map((b, i) => ({ bin: `${i * 10}-${i * 10 + 10}%`, n: b.n, predicted: b.n ? r4(b.pred / b.n) : null, market: b.n ? r4(b.market / b.n) : null, actual: b.n ? r4(b.hit / b.n) : null })),
    pnl,
  };
}

// BT_CACHE=<file> saves the collected market list so a rerun can skip the slow part.
const cacheFile = process.env.BT_CACHE;
const collected = cacheFile && fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : await collect();
if (cacheFile && !fs.existsSync(cacheFile)) fs.writeFileSync(cacheFile, JSON.stringify(collected));
const { markets, seen, start, end } = collected;
const rows = (await addFeatures(markets)).sort((a, b) => a.close - b.close);
const split = Math.floor(rows.length * 0.6);
const train = rows.slice(0, split);
const test = rows.slice(split);
const coef = fit(train);
const day = (t) => new Date(t * 1000).toISOString().slice(0, 10);

const report = {
  generated: new Date().toISOString(),
  window: { from: day(start), to: day(end) },
  sample: { settledMarketsSeen: seen, candidates: markets.length, usable: rows.length, train: train.length, test: test.length, trainThrough: day(train[train.length - 1].close) },
  rules: { minVolume: MIN_VOLUME, scoredHoursAfterOpen: AGES, minVolumePrior24h: 200, maxPerEvent: 3, priceRange: [0.03, 0.97], maxSpread: 0.1, sampleWindowHours: WINDOW / 3600, pagesPerWindow: PAGES_PER_WINDOW },
  features: FEATURES,
  coef,
  test: score(test, coef),
  train: score(train, coef),
  hoursToCloseMedian: Math.round(test.map((r) => (r.close - r.asof) / HOUR).sort((a, b) => a - b)[Math.floor(test.length / 2)]),
};

fs.writeFileSync('src/data/backtest.json', JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(
  'src/data/model.js',
  `// Written by scripts/backtest.mjs. coef order: ${FEATURES.join(', ')}.\nexport default ${JSON.stringify({ coef, live: { imbalance: 0.12, news: 0.08 }, fitted: report.generated })};\n`
);
console.error('\n' + JSON.stringify({ coef, sample: report.sample, test: { ...report.test, calibration: undefined } }, null, 1));
