import { kget, num, seriesOf, batchCandles, batchOrderbooks } from './client.js';
import { features, predict, edge, imbalance, fee } from './model.js';
import { newsFor } from './news.js';
import weights from '../../data/model.js';
import backtest from '../../data/backtest.json';

const HOUR = 3600;
const r3 = (v) => +(+v).toFixed(3);

const CATEGORIES = [
  ['Sports', /NFL|NBA|NCAA|MLB|NHL|EPL|LALIGA|UFC|PGA|ATP|WTA|SOCCER|MATCH|GAME|F1|NASCAR|TENNIS|GOLF|LIGA|SERIEA|BUNDES|UCL|WNBA|CFB|BOX|CRICKET|RUGBY|VALORANT|LOL|CS2|DOTA/],
  ['Crypto', /BTC|ETH|SOL|XRP|DOGE|CRYPTO|COIN/],
  ['Economics', /FED|CPI|GDP|JOBS|PAYROLL|UNEMP|RATE|INFL|RECESSION|TARIFF|PCE|MORTGAGE|GAS|OIL|WTI|BRENT/],
  ['Financials', /NASDAQ|INX|SP500|DOW|GOLD|SILVER|TSLA|NVDA|AAPL|EURUSD|USDJPY|TREASURY|STOCK/],
  ['Weather', /HIGH|LOW|TEMP|RAIN|SNOW|HURR|WEATHER|TORNADO/],
  ['Politics', /PRES|SENATE|HOUSE|GOV|ELECT|TRUMP|CONGRESS|SCOTUS|MAYOR|APPROVAL|CABINET|SHUTDOWN|NOMINEE|PRIMARY/],
  ['Culture', /OSCAR|GRAMMY|EMMY|BILLBOARD|SPOTIFY|NETFLIX|BOXOFFICE|MOVIE|ALBUM|SONG|TWEET|MENTION|TIME|ROTTEN/],
];
export function categoryOf(series, fallback) {
  if (fallback) return fallback;
  for (const [name, re] of CATEGORIES) if (re.test(series)) return name;
  return 'Other';
}

export const marketUrl = (m) => `https://kalshi.com/markets/${seriesOf(m).toLowerCase()}`;

// Whether the held-out backtest shows the model beating the market price.
export const modelBeatsMarket = backtest?.test?.brierDiffCI ? backtest.test.brierDiffCI[1] < 0 : false;

function confidence(net, f, vol24, candleCount) {
  let level = 'Low';
  if (net >= 0.05 && f.spread <= 0.02 && vol24 >= 5000 && candleCount >= 24) level = 'High';
  else if (net >= 0.02 && f.spread <= 0.04 && vol24 >= 1000) level = 'Medium';
  // Without backtest evidence of real edge, nothing is called High.
  if (level === 'High' && !modelBeatsMarket) level = 'Medium';
  return level;
}

const flat = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const cents = (v) => `${Math.abs(v * 100).toFixed(Math.abs(v) < 0.1 ? 1 : 0)}¢`;

function reasons(m, f, sc, e, extras, hours) {
  const w = weights.coef;
  const out = [];
  const tilt = w[0] + (w[1] - 1) * f.x[1];
  if (Math.abs(tilt) > 0.03)
    out.push(
      tilt > 0
        ? `Settled markets priced near ${Math.round(f.mid * 100)}¢ resolved YES a little more often than the price implied.`
        : `Settled markets priced near ${Math.round(f.mid * 100)}¢ resolved YES a little less often than the price implied.`
    );
  const move = f.mid - sc.mid24;
  if (Math.abs(move) >= 0.01) {
    const c = w[2] * f.x[2] + w[4] * f.x[4];
    const dir = move > 0 ? 'up' : 'down';
    out.push(
      Math.abs(c) < 0.02
        ? `Price is ${dir} ${cents(move)} in 24h; the model gives that little weight.`
        : c * move > 0
          ? `Price is ${dir} ${cents(move)} in 24h, and moves like this have tended to keep going.`
          : `Price is ${dir} ${cents(move)} in 24h, and moves like this have tended to give some back.`
    );
  }
  if (f.volumeSurge > 0.7) out.push('Trading in the last 6 hours is running well above the day before.');
  if (Math.abs(f.oiChange) > 0.15) out.push(`Open interest is ${f.oiChange > 0 ? 'up' : 'down'} ${Math.round(Math.abs(f.oiChange) * 100)}% in 24h.`);
  if (Math.abs(extras.imbalance) > 0.3)
    out.push(`The order book leans ${extras.imbalance > 0 ? 'toward buyers' : 'toward sellers'}: ${Math.round(((Math.abs(extras.imbalance) + 1) / 2) * 100)}% of size near the top is on the ${extras.imbalance > 0 ? 'bid' : 'ask'}.`);
  if (extras.newsCount) out.push(`${extras.newsCount} relevant headline${extras.newsCount > 1 ? 's' : ''} this week, tone ${extras.news > 0.2 ? 'positive' : extras.news < -0.2 ? 'negative' : 'mixed'}.`);
  out.push(`Costs already taken out: ${cents(e.fee)} fee and a ${cents(f.spread)} spread.`);
  if (hours < 12) out.push(`Closes in about ${Math.max(1, Math.round(hours))}h, so there is little time for the price to move.`);
  return out;
}

export function scoreMarket(m, candles, ob, news) {
  const bid = num(m.yes_bid_dollars);
  const ask = num(m.yes_ask_dollars);
  const now = Math.floor(Date.now() / 1000);
  const cs = candles?.length ? candles : [{ t: now, bid, ask, mid: (bid + ask) / 2, vol: 0, oi: num(m.open_interest_fp) }];
  const f = features(cs, bid, ask);
  const extras = { imbalance: imbalance(ob), news: news?.tone || 0, newsCount: news?.items?.length || 0 };
  const p = predict(f, extras);
  const e = edge(p.prob, bid, ask);
  const hours = (new Date(m.close_time).getTime() / 1000 - now) / HOUR;
  const vol24 = num(m.volume_24h_fp);
  const before = cs.filter((c) => c.t <= cs[cs.length - 1].t - 24 * HOUR && c.mid > 0).pop() || cs.find((c) => c.mid > 0) || cs[0];
  const sc = { mid24: before.mid || f.mid };
  const series = seriesOf(m);
  return {
    ticker: m.ticker,
    event: m.event_ticker,
    series,
    title: m.title,
    // Kalshi often repeats the title in the subtitle; keep it only when it adds something.
    subtitle: m.yes_sub_title && !flat(m.title).includes(flat(m.yes_sub_title)) ? m.yes_sub_title : '',
    category: categoryOf(series, m._category),
    url: marketUrl(m),
    bid, ask,
    mid: r3(f.mid),
    last: num(m.last_price_dollars),
    volume24h: Math.round(vol24),
    openInterest: Math.round(num(m.open_interest_fp)),
    closeTime: m.close_time,
    hoursToClose: +hours.toFixed(1),
    signals: {
      change24h: r3(f.mid - sc.mid24),
      trend24h: r3(f.trend24h),
      momentum6h: r3(f.momentum6h),
      volumeSurge: r3(f.volumeSurge),
      oiChange: r3(f.oiChange),
      imbalance: r3(extras.imbalance),
      spread: r3(f.spread),
      newsTone: extras.news,
    },
    prob: r3(p.prob),
    probBacktested: r3(p.base),
    side: e.side,
    price: r3(e.price),
    fee: r3(e.fee),
    edge: r3(e.net),
    edgeBeforeCosts: r3(e.gross),
    confidence: e.net > 0 ? confidence(e.net, f, vol24, cs.length) : 'None',
    reasons: reasons(m, f, sc, e, extras, hours),
    news: news?.items || [],
    spark: cs.slice(-48).map((c) => r3(c.mid)),
  };
}

// The open-market list is long and Kalshi's public rate limit is tight, so it is
// read in close-date slices, nearest first. Whatever has arrived by the deadline
// is what gets scored; `complete` says whether that was everything.
async function candidates(deadline, maxDays) {
  const now = Math.floor(Date.now() / 1000);
  const edges = [HOUR, 2 * 86400, 5 * 86400, 10 * 86400, maxDays * 86400].filter((e, i, a) => i === 0 || e > a[i - 1]);
  const keep = [];
  let pages = 0;
  let complete = true;
  for (let i = 0; i < edges.length - 1 && complete; i++) {
    let cursor;
    for (;;) {
      const ms = deadline - Date.now();
      if (ms < 400) { complete = false; break; }
      const d = await kget(
        '/markets',
        { status: 'open', mve_filter: 'exclude', limit: 1000, min_close_ts: now + edges[i], max_close_ts: now + edges[i + 1], cursor },
        { signal: AbortSignal.timeout(ms), retries: 3 }
      ).catch(() => null);
      if (!d) { complete = false; break; }
      pages++;
      for (const m of d.markets || []) {
        const bid = num(m.yes_bid_dollars);
        const ask = num(m.yes_ask_dollars);
        if (m.market_type !== 'binary' || bid < 0.03 || ask > 0.97 || ask <= bid || ask - bid > 0.08) continue;
        if (num(m.volume_24h_fp) < 500) continue;
        keep.push(m);
      }
      cursor = d.cursor;
      if (!cursor || (d.markets || []).length < 1000) break;
    }
  }
  return { keep, pages, complete };
}

// budgetMs is a hard ceiling: every step is skipped or cut off when time runs out.
// A request on Netlify gets about 8 seconds; the background refresh gets far more.
export async function scan({ budgetMs = 8000, pool = 80, picks = 12, maxDays = 30 } = {}) {
  const started = Date.now();
  const left = () => started + budgetMs - Date.now();
  const within = (reserve) => ({ signal: AbortSignal.timeout(Math.max(300, left() - reserve)), retries: 2 });

  const { keep, pages, complete } = await candidates(started + budgetMs * 0.6, maxDays);
  // Most-traded first, but no more than a few markets per event or a dozen per
  // series, so one busy slate of games cannot crowd everything else out.
  const perEvent = {};
  const perSeries = {};
  const top = [];
  for (const m of keep.sort((a, b) => num(b.volume_24h_fp) - num(a.volume_24h_fp))) {
    const series = seriesOf(m);
    if ((perEvent[m.event_ticker] || 0) >= 3 || (perSeries[series] || 0) >= 12) continue;
    perEvent[m.event_ticker] = (perEvent[m.event_ticker] || 0) + 1;
    perSeries[series] = (perSeries[series] || 0) + 1;
    top.push(m);
    if (top.length >= pool) break;
  }
  const tickers = top.map((m) => m.ticker);
  const byTicker = Object.fromEntries(top.map((m) => [m.ticker, m]));
  const now = Math.floor(Date.now() / 1000);

  let candles = {};
  let books = {};
  if (tickers.length && left() > 1500) candles = await batchCandles(tickers, now - 48 * HOUR, now, 60, within(900)).catch(() => ({}));
  if (tickers.length && left() > 1200) books = await batchOrderbooks(tickers, within(600)).catch(() => ({}));

  let scored = top.map((m) => scoreMarket(m, candles[m.ticker], books[m.ticker]));
  // One market per event: the side of the ladder with the most edge.
  const best = {};
  for (const s of scored) if (!best[s.event] || s.edge > best[s.event].edge) best[s.event] = s;
  scored = Object.values(best).sort((a, b) => b.edge - a.edge);

  // For the leaders only, and only with time to spare: the event's full title
  // and category from Kalshi, then headlines.
  const leaders = scored.slice(0, picks);
  const events = {};
  if (left() > 9000) {
    for (const s of leaders) {
      if (left() < 5000) break;
      const d = await kget(`/events/${encodeURIComponent(s.event)}`, {}, within(4000)).catch(() => null);
      if (d?.event) events[s.event] = d.event;
    }
  }
  if (left() > 1500) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), Math.max(500, left() - 500));
    const enriched = await Promise.all(
      leaders.map(async (s) => {
        const ev = events[s.event];
        const news = await newsFor(`${ev?.title || s.title} ${s.subtitle}`, { signal: ctl.signal });
        if (!news.items.length && !ev) return s;
        const again = scoreMarket({ ...byTicker[s.ticker], _category: ev?.category }, candles[s.ticker], books[s.ticker], news);
        return ev ? { ...again, eventTitle: ev.title } : again;
      })
    );
    clearTimeout(timer);
    scored = [...enriched, ...scored.slice(picks)].sort((a, b) => b.edge - a.edge);
  }

  return {
    generated: new Date().toISOString(),
    tookMs: Date.now() - started,
    universe: { pagesRead: pages, complete, liquid: keep.length, scored: top.length, closingWithinDays: maxDays },
    modelBeatsMarket,
    markets: scored,
  };
}

export async function detail(ticker) {
  const now = Math.floor(Date.now() / 1000);
  // Each lookup gets a few seconds and one retry; a slow one is dropped, not waited for.
  const quick = () => ({ signal: AbortSignal.timeout(6000), retries: 1 });
  const { market } = await kget(`/markets/${encodeURIComponent(ticker)}`, {}, quick());
  const [event, candles, books, trades] = await Promise.all([
    kget(`/events/${encodeURIComponent(market.event_ticker)}`, {}, quick()).then((d) => d.event).catch(() => null),
    batchCandles([ticker], now - 7 * 86400, now, 60, quick()).then((c) => c[ticker] || []).catch(() => []),
    batchOrderbooks([ticker], quick()).then((b) => b[ticker]).catch(() => null),
    kget('/markets/trades', { ticker, limit: 40 }, quick()).then((d) => d.trades || []).catch(() => []),
  ]);
  const topic = `${event?.title || market.title} ${market.yes_sub_title || ''}`;
  const news = await newsFor(topic, { signal: AbortSignal.timeout(2500) });
  const scored = scoreMarket({ ...market, _category: event?.category }, candles.filter((c) => c.t > now - 48 * HOUR), books, news);
  return {
    ...scored,
    eventTitle: event?.title || '',
    rules: market.rules_primary || '',
    chart: candles.map((c) => ({ t: c.t, mid: r3(c.mid), bid: c.bid, ask: c.ask, vol: Math.round(c.vol) })),
    book: books ? { bids: books.bids.slice(0, 8), asks: books.asks.slice(0, 8) } : null,
    trades: trades.slice(0, 20).map((t) => ({
      t: t.created_time,
      price: num(t.yes_price_dollars ?? t.price_dollars ?? t.yes_price),
      size: num(t.count_fp ?? t.count),
      taker: t.taker_side,
    })),
    feeAt: { yes: r3(fee(scored.ask)), no: r3(fee(1 - scored.bid)) },
  };
}
