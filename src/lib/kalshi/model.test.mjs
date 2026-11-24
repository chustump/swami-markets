import test from 'node:test';
import assert from 'node:assert/strict';
import { features, predict, edge, fee, imbalance } from './model.js';
import { scoreHeadline, keywords } from './news.js';
import { book } from './client.js';

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} vs ${b}`);

test('fee is 7% of price times (1 - price)', () => {
  near(fee(0.5), 0.0175);
  near(fee(0.1), 0.0063);
  near(fee(0.9), fee(0.1));
});

test('edge buys the cheaper side and subtracts spread and fee', () => {
  const yes = edge(0.6, 0.48, 0.5);
  assert.equal(yes.side, 'YES');
  near(yes.net, 0.6 - 0.5 - fee(0.5));
  const no = edge(0.3, 0.48, 0.5);
  assert.equal(no.side, 'NO');
  near(no.price, 0.52);
  near(no.net, 0.7 - 0.52 - fee(0.52));
  // Model agrees with the market: paying the spread and fee is a loss either way.
  assert.ok(edge(0.49, 0.48, 0.5).net < 0);
});

test('with neutral weights the model returns the market mid', () => {
  const candles = Array.from({ length: 30 }, (_, i) => ({ t: i * 3600, mid: 0.4, bid: 0.39, ask: 0.41, vol: 10, oi: 100 }));
  const f = features(candles, 0.39, 0.41);
  near(f.trend24h, 0);
  near(predict(f, {}, [0, 1, 0, 0, 0]).base, 0.4, 1e-9);
});

test('trend is measured in log-odds against the price 24 hours earlier', () => {
  const candles = Array.from({ length: 30 }, (_, i) => ({ t: i * 3600, mid: i < 6 ? 0.3 : 0.5, bid: 0.49, ask: 0.51, vol: 10, oi: 100 }));
  const f = features(candles, 0.49, 0.51);
  near(f.trend24h, Math.log(0.5 / 0.5) - Math.log(0.3 / 0.7), 1e-9);
  assert.ok(f.momentum6h === 0);
});

test('order book: NO bids become YES asks, and imbalance leans to the bigger side', () => {
  const ob = book({ yes_dollars: [['0.40', '300'], ['0.38', '100']], no_dollars: [['0.55', '100']] });
  near(ob.asks[0].p, 0.45);
  assert.equal(ob.bids[0].p, 0.4);
  near(imbalance(ob), (400 - 100) / 500);
  assert.equal(imbalance(null), 0);
});

test('headline scoring: relevance from shared keywords, tone from a word list', () => {
  const keys = keywords('Will the Fed cut rates in December?');
  assert.deepEqual(keys, ['fed', 'cut', 'rates', 'december']);
  const s = scoreHeadline('Fed officials signal December rates cut is likely', keys);
  assert.equal(s.relevance, 1);
  assert.ok(s.tone <= 1 && s.tone >= -1);
  assert.equal(scoreHeadline('Local bakery wins award', keys).relevance, 0);
});
