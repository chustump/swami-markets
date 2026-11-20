import { NextResponse } from "next/server";
import { SYMBOLS, TIMEFRAMES } from "@/lib/symbols";

export const dynamic = "force-dynamic";

const LIMIT = 500;

async function getJson(url) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`${new URL(url).host} responded ${r.status}`);
  return r.json();
}

// Merge candles into larger buckets (e.g. 1h -> 4h).
function aggregate(candles, sec) {
  const out = [];
  for (const c of candles) {
    const t = Math.floor(c.time / sec) * sec;
    const last = out[out.length - 1];
    if (last && last.time === t) {
      last.high = Math.max(last.high, c.high); last.low = Math.min(last.low, c.low);
      last.close = c.close; last.volume += c.volume;
    } else out.push({ ...c, time: t });
  }
  return out;
}

async function fromBinance(sym, tf) {
  const rows = await getJson(`https://data-api.binance.vision/api/v3/klines?symbol=${sym.binance}&interval=${tf.id}&limit=${LIMIT}`);
  return rows.map(k => ({ time: Math.floor(k[0] / 1000), open: +k[1], high: +k[2], low: +k[3], close: +k[4], volume: +k[5] }));
}

async function fromCoinbase(sym, tf) {
  const gran = tf.id === "4h" ? 3600 : tf.sec;
  const rows = await getJson(`https://api.exchange.coinbase.com/products/${sym.coinbase}/candles?granularity=${gran}`);
  const candles = rows.map(k => ({ time: k[0], low: +k[1], high: +k[2], open: +k[3], close: +k[4], volume: +k[5] })).sort((a, b) => a.time - b.time);
  return tf.id === "4h" ? aggregate(candles, tf.sec) : candles;
}

async function fromYahoo(sym, tf) {
  const cfg = { "15m": ["15m", "30d"], "1h": ["60m", "6mo"], "4h": ["60m", "2y"], "1d": ["1d", "2y"] }[tf.id];
  const d = await getJson(`https://query1.finance.yahoo.com/v8/finance/chart/${sym.yahoo}?interval=${cfg[0]}&range=${cfg[1]}`);
  const res = d?.chart?.result?.[0];
  const q = res?.indicators?.quote?.[0];
  if (!res?.timestamp || !q) throw new Error("Yahoo returned no data");
  let candles = [];
  res.timestamp.forEach((t, i) => {
    if (q.open[i] == null || q.close[i] == null || q.high[i] == null || q.low[i] == null) return;
    candles.push({ time: t, open: q.open[i], high: q.high[i], low: q.low[i], close: q.close[i], volume: q.volume[i] || 0 });
  });
  if (tf.id === "4h") candles = aggregate(candles, tf.sec);
  return candles;
}

// Deterministic random walk so the app is usable when no data source is reachable.
function simulated(sym, tf) {
  let seed = 0;
  for (const ch of sym.id + tf.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const vol = (sym.type === "crypto" ? 0.012 : 0.006) * Math.sqrt(tf.sec / 3600);
  const now = Math.floor(Date.now() / 1000 / tf.sec) * tf.sec;
  const candles = [];
  let price = sym.base * (0.75 + rnd() * 0.3), drift = 0;
  for (let i = LIMIT - 1; i >= 0; i--) {
    if (rnd() < 0.03) drift = (rnd() - 0.5) * vol * 0.6;
    const open = price;
    const close = open * (1 + drift + (rnd() + rnd() + rnd() - 1.5) * vol);
    const high = Math.max(open, close) * (1 + rnd() * vol * 0.5);
    const low = Math.min(open, close) * (1 - rnd() * vol * 0.5);
    candles.push({ time: now - i * tf.sec, open, high, low, close, volume: Math.round(1000 + rnd() * 9000) });
    price = close;
  }
  return candles;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sym = SYMBOLS.find(s => s.id === searchParams.get("symbol"));
  const tf = TIMEFRAMES.find(t => t.id === (searchParams.get("tf") || "1h"));
  if (!sym || !tf) return NextResponse.json({ error: "Unknown symbol or timeframe" }, { status: 400 });

  const sources = sym.type === "crypto"
    ? [["Binance", fromBinance], ["Coinbase", fromCoinbase]]
    : [["Yahoo Finance", fromYahoo]];
  const errors = [];
  for (const [name, fn] of sources) {
    try {
      const candles = (await fn(sym, tf)).slice(-LIMIT);
      if (candles.length < 60) throw new Error(`${name} returned too few candles`);
      return NextResponse.json({ symbol: sym.id, tf: tf.id, source: name, simulated: false, candles });
    } catch (e) { errors.push(e.message); }
  }
  return NextResponse.json({ symbol: sym.id, tf: tf.id, source: "Simulated", simulated: true, errors, candles: simulated(sym, tf) });
}
