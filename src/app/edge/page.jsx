"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Swami from "../../components/Swami";
import SwamiGuide from "../../components/SwamiGuide";
import SiteHeader from "../../components/SiteHeader";
import { Scene, Reveal } from "../../components/Scene";
import { swamiSay } from "../../components/swamiBus";
import { T, FONT } from "../../lib/theme";
import backtest from "../../data/backtest.json";

const NAV = [
  { k: "home", l: "🔮 Home", href: "/" },
  { k: "top5", l: "🔥 Top 5", href: "/?tab=top5" },
  { k: "h2h", l: "⚔️ H2H", href: "/?tab=h2h" },
  { k: "ask", l: "💬 Ask", href: "/?tab=ask" },
  { k: "all", l: "📋 All", href: "/?tab=all" },
  { k: "edge", l: "🧿 Edge", href: "/edge" },
];

const c = (v, d = 0) => `${(v * 100).toFixed(d)}¢`;
const pct = (v, d = 0) => `${(v * 100).toFixed(d)}%`;
const signed = (v, d = 1) => `${v >= 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(d)}¢`;
const sideCol = (s) => (s === "YES" ? T.green : T.red);
const confCol = { High: T.green, Medium: T.yellow, Low: T.muted, None: T.dim };
const name = (m) => `${m.title}${m.subtitle ? ` · ${m.subtitle}` : ""}`;

function closesIn(h) {
  if (h < 1) return "under 1h";
  if (h < 48) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 760);
    h();
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
}

function Spark({ data, w = 84, h = 26 }) {
  if (!data || data.length < 2) return <svg width={w} height={h} aria-hidden="true" />;
  const lo = Math.min(...data), hi = Math.max(...data), span = hi - lo || 0.01;
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - lo) / span) * (h - 4)).toFixed(1)}`).join(" ");
  const up = data[data.length - 1] >= data[0];
  return <svg width={w} height={h} aria-hidden="true"><polyline points={pts} fill="none" stroke={up ? T.green : T.red} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></svg>;
}

// Price history with volume bars, the live price and the Swami's estimate.
function Chart({ chart, prob }) {
  const [hover, setHover] = useState(null);
  const W = 640, H = 240, L = 34, R = 10, Tp = 12, B = 46;
  const pts = (chart || []).filter((p) => p.mid > 0);
  if (pts.length < 3) return <div style={{ padding: 30, textAlign: "center", color: T.muted, fontSize: 13 }}>Not enough price history to draw a chart yet.</div>;
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const vals = pts.map((p) => p.mid).concat(prob);
  const lo = Math.max(0, Math.min(...vals) - 0.04), hi = Math.min(1, Math.max(...vals) + 0.04);
  const x = (t) => L + ((t - t0) / (t1 - t0 || 1)) * (W - L - R);
  const y = (v) => Tp + (1 - (v - lo) / (hi - lo)) * (H - Tp - B);
  const maxVol = Math.max(1, ...pts.map((p) => p.vol));
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.mid).toFixed(1)}`).join(" ");
  const ticks = [lo, (lo + hi) / 2, hi];
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = t0 + ((((e.clientX - r.left) / r.width) * W - L) / (W - L - R)) * (t1 - t0);
    setHover(pts.reduce((a, b) => (Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a)));
  };
  const day = (t) => new Date(t * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", touchAction: "pan-y" }} onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label="Price history, last 7 days">
        <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.purple} stopOpacity=".35" /><stop offset="100%" stopColor={T.purple} stopOpacity="0" /></linearGradient></defs>
        {ticks.map((v) => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={T.border} strokeWidth="1" /><text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill={T.muted} fontFamily={FONT.mono}>{Math.round(v * 100)}¢</text></g>)}
        {pts.map((p) => <rect key={p.t} x={x(p.t) - 1.2} width="2.4" y={H - 20 - (p.vol / maxVol) * 22} height={(p.vol / maxVol) * 22} fill={T.gold} opacity=".45" />)}
        <path d={`${line} L${x(t1)} ${H - B} L${x(t0)} ${H - B} Z`} fill="url(#area)" />
        <path d={line} fill="none" stroke={T.purple} strokeWidth="2" strokeLinejoin="round" />
        <line x1={L} x2={W - R} y1={y(prob)} y2={y(prob)} stroke={T.gold} strokeWidth="1.5" strokeDasharray="5 5" />
        <text x={W - R} y={y(prob) - 5} textAnchor="end" fontSize="11" fill={T.gold} fontWeight="700">Swami {Math.round(prob * 100)}%</text>
        <text x={L} y={H - 4} fontSize="11" fill={T.muted}>{day(t0)}</text>
        <text x={W - R} y={H - 4} fontSize="11" fill={T.muted} textAnchor="end">{day(t1)}</text>
        {hover && <g><line x1={x(hover.t)} x2={x(hover.t)} y1={Tp} y2={H - B} stroke={T.soft} strokeWidth="1" opacity=".5" /><circle cx={x(hover.t)} cy={y(hover.mid)} r="4" fill={T.text} /></g>}
      </svg>
      <div style={{ fontSize: 11.5, color: T.muted, minHeight: 18, fontFamily: FONT.mono }}>
        {hover ? `${new Date(hover.t * 1000).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric" })} · ${c(hover.mid, 1)} · ${hover.vol.toLocaleString()} contracts` : "Purple: price. Gold bars: hourly volume. Dashed: the Swami's estimate."}
      </div>
    </div>
  );
}

function Stat({ label, value, color, sub }) {
  return (
    <div style={{ background: "#ffffff07", border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 12px", minWidth: 0 }}>
      <div style={{ fontSize: 10, letterSpacing: 1, color: T.muted, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 700, color: color || T.text, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 10.5, color: T.muted, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function Book({ book }) {
  if (!book || (!book.bids.length && !book.asks.length)) return <div style={{ fontSize: 12.5, color: T.muted }}>The order book is empty right now.</div>;
  const max = Math.max(1, ...book.bids.map((l) => l.q), ...book.asks.map((l) => l.q));
  const row = (l, col, key) => (
    <div key={key} style={{ position: "relative", display: "flex", justifyContent: "space-between", fontFamily: FONT.mono, fontSize: 12, padding: "3px 8px" }}>
      <div style={{ position: "absolute", inset: 0, width: `${(l.q / max) * 100}%`, background: col + "22", borderRadius: 4 }} />
      <span style={{ position: "relative", color: col }}>{c(l.p, 1)}</span><span style={{ position: "relative", color: T.soft }}>{Math.round(l.q).toLocaleString()}</span>
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <div><div style={{ fontSize: 10.5, color: T.muted, marginBottom: 4 }}>BUYERS OF YES (bids)</div>{book.bids.map((l, i) => row(l, T.green, i))}</div>
      <div><div style={{ fontSize: 10.5, color: T.muted, marginBottom: 4 }}>SELLERS OF YES (asks)</div>{book.asks.map((l, i) => row(l, T.red, i))}</div>
    </div>
  );
}

function Detail({ m, onClose, mob }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let off = false;
    setD(null); setErr(false);
    fetch(`/api/kalshi/market/${encodeURIComponent(m.ticker)}`).then((r) => r.json()).then((j) => { if (!off) (j.error ? setErr(true) : setD(j)); }).catch(() => !off && setErr(true));
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { off = true; window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [m.ticker, onClose]);
  const v = d || m;
  const h3 = { fontFamily: FONT.display, fontSize: 18, fontWeight: 700, margin: "22px 0 10px" };
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(5,2,12,.7)", backdropFilter: "blur(4px)", zIndex: 199 }} />
      <aside className="sheet" role="dialog" aria-modal="true" aria-label={name(m)} style={mob
        ? { position: "fixed", left: 0, right: 0, bottom: 0, maxHeight: "92vh", overflowY: "auto", background: T.sf, borderTop: `2px solid ${T.gold}`, borderRadius: "22px 22px 0 0", padding: "16px 16px 40px", zIndex: 200 }
        : { position: "fixed", top: 0, right: 0, bottom: 0, width: "min(620px, 92vw)", overflowY: "auto", background: T.sf, borderLeft: `1px solid ${T.gold}55`, padding: "22px 26px 60px", zIndex: 200, boxShadow: "-30px 0 80px #000a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div>
            <div className="eyebrow">{v.category} · closes in {closesIn(v.hoursToClose)}</div>
            {d?.eventTitle && d.eventTitle !== v.title && <div style={{ fontSize: 12.5, color: T.muted, marginTop: 6 }}>{d.eventTitle}</div>}
            <h2 className="display" style={{ fontSize: mob ? 22 : 26, fontWeight: 700, margin: "4px 0 0", lineHeight: 1.2 }}>{name(v)}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "#ffffff10", border: `1px solid ${T.border}`, color: T.soft, width: 36, height: 36, borderRadius: 18, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ margin: "16px 0", padding: 14, borderRadius: 14, background: v.edge > 0 ? sideCol(v.side) + "14" : "#ffffff08", border: `1px solid ${v.edge > 0 ? sideCol(v.side) + "55" : T.border}` }}>
          {v.edge > 0
            ? <div style={{ fontSize: 15, lineHeight: 1.5 }}>The Swami would lean <b style={{ color: sideCol(v.side) }}>{v.side}</b> at {c(v.price, 1)}: an estimated <b style={{ fontFamily: FONT.mono }}>{signed(v.edge)}</b> per contract after the fee. Confidence: <b style={{ color: confCol[v.confidence] }}>{v.confidence}</b>.</div>
            : <div style={{ fontSize: 15, lineHeight: 1.5 }}>No edge here. After the fee and the spread, neither side is priced below the Swami's estimate.</div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4, 1fr)", gap: 8 }}>
          <Stat label="Market" value={`${c(v.bid, 1)} / ${c(v.ask, 1)}`} sub="bid / ask for YES" />
          <Stat label="Swami says" value={pct(v.prob, 1)} color={T.gold} sub="chance of YES" />
          <Stat label="Fee + spread" value={`${c(v.fee, 1)} + ${c(v.signals.spread, 1)}`} sub="per contract" />
          <Stat label="Edge after costs" value={signed(v.edge)} color={v.edge > 0 ? T.green : T.muted} sub={`${signed(v.edgeBeforeCosts)} before fee`} />
        </div>

        <h3 style={h3}>Last 7 days</h3>
        {d ? <Chart chart={d.chart} prob={v.prob} /> : err ? <div style={{ color: T.muted, fontSize: 13 }}>The chart could not be loaded from Kalshi just now.</div> : <div className="shimmer" style={{ height: 200 }} />}

        <h3 style={h3}>Why, in plain words</h3>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
          {v.reasons.map((r, i) => <li key={i} style={{ display: "flex", gap: 8, fontSize: 13.5, color: T.soft, lineHeight: 1.5 }}><span style={{ color: T.gold }}>✦</span><span>{r}</span></li>)}
        </ul>

        <h3 style={h3}>Signals</h3>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(3, 1fr)", gap: 8 }}>
          <Stat label="24h move" value={signed(v.signals.change24h)} color={v.signals.change24h >= 0 ? T.green : T.red} />
          <Stat label="Volume, last 6h" value={v.signals.volumeSurge > 0.3 ? "Rising" : v.signals.volumeSurge < -0.3 ? "Fading" : "Steady"} sub={`${v.volume24h.toLocaleString()} in 24h`} />
          <Stat label="Open interest" value={`${v.signals.oiChange >= 0 ? "+" : "−"}${Math.abs(v.signals.oiChange * 100).toFixed(0)}%`} sub={`${v.openInterest.toLocaleString()} contracts`} />
          <Stat label="Book leans" value={Math.abs(v.signals.imbalance) < 0.15 ? "Balanced" : v.signals.imbalance > 0 ? "Buyers" : "Sellers"} sub={`${Math.round((v.signals.imbalance + 1) * 50)}% of size on the bid`} />
          <Stat label="Spread" value={c(v.signals.spread, 1)} />
          <Stat label="News tone" value={!v.news.length ? "No news" : v.signals.newsTone > 0.2 ? "Positive" : v.signals.newsTone < -0.2 ? "Negative" : "Mixed"} sub={`${v.news.length} relevant`} />
        </div>

        <h3 style={h3}>Order book</h3>
        {d ? <Book book={d.book} /> : <div className="shimmer" style={{ height: 80 }} />}

        <h3 style={h3}>Recent news</h3>
        {d && !d.news.length && <div style={{ fontSize: 13, color: T.muted }}>No closely related headlines in the last week.</div>}
        {(d?.news || []).map((n, i) => (
          <a key={i} href={n.url} target="_blank" rel="noreferrer" style={{ display: "block", padding: "10px 0", borderBottom: `1px solid ${T.border}`, textDecoration: "none", color: T.text }}>
            <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>{n.title}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span>{n.source}</span><span>{new Date(n.published).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              <span>relevance {Math.round(n.relevance * 100)}%</span>
              <span style={{ color: n.tone > 0 ? T.green : n.tone < 0 ? T.red : T.muted }}>{n.tone > 0 ? "positive" : n.tone < 0 ? "negative" : "neutral"}</span>
            </div>
          </a>
        ))}

        <a className="btn ghost" href={v.url} target="_blank" rel="noreferrer" style={{ marginTop: 22, width: "100%" }}>View this market on Kalshi ↗</a>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 12, lineHeight: 1.5 }}>Analysis only. Not financial advice. This site cannot place orders. Fee assumes Kalshi's standard taker rate of 7% × price × (1 − price); some markets charge differently.</div>
      </aside>
    </>
  );
}

function Calibration({ bins, mob }) {
  const W = 320, P = 40;
  const xy = (v) => P + v * (W - 2 * P);
  const used = bins.filter((b) => b.n >= 5);
  const maxN = Math.max(1, ...used.map((b) => b.n));
  return (
    <svg viewBox={`0 0 ${W} ${W}`} style={{ width: "100%", maxWidth: mob ? 300 : 340, height: "auto" }} role="img" aria-label="Calibration: predicted chance against how often YES happened">
      {[0, 0.5, 1].map((v) => <g key={v}><line x1={xy(v)} x2={xy(v)} y1={P} y2={W - P} stroke={T.border} /><line y1={xy(1 - v)} y2={xy(1 - v)} x1={P} x2={W - P} stroke={T.border} /><text x={xy(v)} y={W - 10} textAnchor="middle" fontSize="11" fill={T.muted}>{v * 100}%</text><text x={P - 6} y={xy(1 - v) + 4} textAnchor="end" fontSize="11" fill={T.muted}>{v * 100}%</text></g>)}
      <line x1={xy(0)} y1={xy(1)} x2={xy(1)} y2={xy(0)} stroke={T.muted} strokeDasharray="4 4" />
      {used.map((b) => <circle key={`k${b.bin}`} cx={xy(b.market)} cy={xy(1 - b.actual)} r={3 + (b.n / maxN) * 4} fill="none" stroke={T.blue} strokeWidth="1.6" />)}
      {used.map((b) => <circle key={b.bin} cx={xy(b.predicted)} cy={xy(1 - b.actual)} r={3 + (b.n / maxN) * 4} fill={T.gold} opacity=".9" />)}
    </svg>
  );
}

function Backtest({ mob }) {
  const t = backtest.test;
  const better = t.brierDiffCI[1] < 0;
  const worse = t.brierDiffCI[0] > 0;
  const p2 = t.pnl[0], p5 = t.pnl[1];
  const verdict = better
    ? "On markets it had never seen, the model's forecasts were slightly more accurate than Kalshi's prices. The gap is small."
    : worse
      ? "On markets it had never seen, the model was less accurate than Kalshi's own prices. Treat its picks as conversation starters, not signals."
      : "On markets it had never seen, the model was about as accurate as Kalshi's own prices: no reliable edge was found.";
  const money = (p) => p.trades
    ? `${p.trades.toLocaleString()} trades, ${pct(p.winRate)} won, ${p.profit >= 0 ? "+" : "−"}$${Math.abs(p.profit).toFixed(2)} on $${p.staked.toFixed(2)} staked (${p.roi >= 0 ? "+" : "−"}${Math.abs(p.roi * 100).toFixed(1)}%)`
    : "no trades cleared this bar";
  return (
    <div>
      <Reveal style={{ textAlign: "center", marginBottom: 20 }}>
        <div className="eyebrow">The honest part</div>
        <h2 className="display" style={{ fontSize: mob ? 28 : 40, fontWeight: 700, margin: "8px 0 10px" }}>Does it really find edge?</h2>
        <p style={{ fontSize: 15, color: T.soft, maxWidth: 680, margin: "0 auto", lineHeight: 1.6 }}>{verdict}</p>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1.2fr 1fr", gap: 14 }}>
        <Reveal className="panel" style={{ padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Stat label="Brier score, Swami" value={t.brierModel.toFixed(4)} color={T.gold} sub="lower is better" />
            <Stat label="Brier score, market" value={t.brierMarket.toFixed(4)} color={T.blue} sub="Kalshi's own price" />
            <Stat label="Difference" value={`${t.brierDiff > 0 ? "+" : ""}${t.brierDiff.toFixed(4)}`} color={better ? T.green : worse ? T.red : T.soft} sub={`95% range ${t.brierDiffCI[0].toFixed(4)} to ${t.brierDiffCI[1].toFixed(4)}`} />
            <Stat label="Markets tested" value={t.n.toLocaleString()} sub={`settled after ${backtest.sample.trainThrough}`} />
          </div>
          <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 700, margin: "18px 0 8px" }}>Profit and loss after fees</div>
          <div style={{ fontSize: 13.5, color: T.soft, lineHeight: 1.65 }}>
            Buying one contract whenever the model saw at least 2¢ of edge: <b style={{ color: p2.profit >= 0 ? T.green : T.red }}>{money(p2)}</b>.<br />
            Only when it saw at least 5¢: <b style={{ color: p5.profit >= 0 ? T.green : T.red }}>{money(p5)}</b>.
            {!better && p2.trades < 500 && <><br />That is a small number of bets, mostly on longshots, and too few to tell skill from luck.</>}
          </div>
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginTop: 14 }}>
            How this was run: {backtest.sample.usable.toLocaleString()} settled Kalshi markets from {backtest.window.from} to {backtest.window.to}, each scored once at a fixed 30, 54 or 102 hours after it opened, using only data available at that moment. The model was fitted on the earlier {backtest.sample.train.toLocaleString()} and judged on the later {backtest.sample.test.toLocaleString()}. Trades buy at the ask, pay the standard taker fee and hold to settlement.
            Not included: order book lean and news, which cannot be rebuilt for past markets and so are untested nudges in the live scanner. Outcomes in the same event are correlated, so the profit figures are noisier than the trade count suggests. Past results do not predict future ones.
          </div>
        </Reveal>
        <Reveal delay={120} className="panel" style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Calibration</div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>Forecast chance (across) against how often YES happened (up). On the dashed line is perfect.</div>
          <Calibration bins={t.calibration} mob={mob} />
          <div style={{ fontSize: 12, color: T.soft, display: "flex", gap: 16, justifyContent: "center" }}>
            <span><span style={{ color: T.gold }}>●</span> Swami</span><span><span style={{ color: T.blue }}>○</span> Market price</span>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export default function EdgePage() {
  const mob = useIsMobile();
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  const [cat, setCat] = useState("All");
  const [onlyEdge, setOnlyEdge] = useState(true);
  const [sort, setSort] = useState("edge");
  const [open, setOpen] = useState(null);
  const [turn, setTurn] = useState(0);
  const wanted = useRef(null);

  useEffect(() => {
    wanted.current = new URLSearchParams(window.location.search).get("m");
    let off = false;
    fetch("/api/kalshi/scan").then((r) => r.json()).then((d) => {
      if (off) return;
      if (d.error) return setState("error");
      setData(d); setState("done");
      const hit = wanted.current && d.markets.find((m) => m.ticker === wanted.current);
      if (hit) setOpen(hit);
    }).catch(() => !off && setState("error"));
    return () => { off = true; };
  }, []);

  const picks = useMemo(() => (data?.markets || []).filter((m) => m.edge > 0).slice(0, 3), [data]);
  useEffect(() => {
    if (picks.length < 2) return;
    const t = setInterval(() => setTurn((n) => (n + 1) % picks.length), 5200);
    return () => clearInterval(t);
  }, [picks.length]);
  const pick = picks[turn % Math.max(1, picks.length)];
  const mood = state === "loading" ? "gaze" : pick ? "reveal" : "think";
  const line = state === "loading" ? "Hush… I am reading every open market on Kalshi."
    : state === "error" ? "The ball is cloudy. Kalshi did not answer. Try again in a minute."
    : pick ? `Pick ${turn % picks.length + 1} of ${picks.length}: ${name(pick)}. Lean ${pick.side} at ${c(pick.price)}. I make ${pick.side} a ${pct(pick.side === "YES" ? pick.prob : 1 - pick.prob)} chance.`
    : "Nothing clears my bar right now. Fair prices everywhere. How dull.";

  const cats = useMemo(() => ["All", ...new Set((data?.markets || []).map((m) => m.category))], [data]);
  const rows = useMemo(() => {
    let r = (data?.markets || []).filter((m) => (cat === "All" || m.category === cat) && (!onlyEdge || m.edge > 0));
    if (sort === "soon") r = [...r].sort((a, b) => a.hoursToClose - b.hoursToClose);
    if (sort === "volume") r = [...r].sort((a, b) => b.volume24h - a.volume24h);
    return r;
  }, [data, cat, onlyEdge, sort]);
  const close = useRef(() => setOpen(null)).current;

  return (
    <div style={{ minHeight: "100vh", color: T.text, fontFamily: FONT.body, paddingBottom: 130, position: "relative", zIndex: 1 }}>
      <SiteHeader items={NAV} active="edge" mob={mob} />
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: mob ? "0 14px" : "0 24px" }}>

        <Scene hero mood={mood} say={line} style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "auto 1fr", gap: mob ? 4 : 36, alignItems: "center", padding: mob ? "14px 0 20px" : "30px 0 36px", textAlign: mob ? "center" : "left" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Swami size={mob ? 170 : 250} mood={mood} vision={pick ? `+${(pick.edge * 100).toFixed(0)}¢` : ""} /></div>
          <div>
            <div className="eyebrow">Kalshi edge scanner</div>
            <h1 className="display" style={{ fontSize: mob ? 34 : 56, fontWeight: 900, margin: "8px 0 12px" }}>Where the price and the <span className="gilded">Swami disagree.</span></h1>
            <div className="panel" key={line} style={{ padding: "14px 16px", fontSize: mob ? 14 : 15.5, lineHeight: 1.5, borderColor: "#f6c45355", animation: "pop .45s cubic-bezier(.3,1.5,.4,1)", transformOrigin: mob ? "50% 0" : "0 50%", textAlign: "left" }} role="status" aria-live="polite">
              <span style={{ color: T.gold, fontWeight: 700 }}>The Swami announces: </span>{line}
              {pick && <button onClick={() => setOpen(pick)} style={{ marginLeft: 8, background: "none", border: "none", color: T.gold, textDecoration: "underline", cursor: "pointer", fontSize: "inherit", padding: 0 }}>Show me</button>}
            </div>
            <a href="#record" style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: T.soft, textDecoration: "none", borderBottom: `1px dashed ${T.muted}` }}>
              <b style={{ color: backtest.test.brierDiffCI[1] < 0 ? T.green : T.yellow }}>Backtest verdict:</b> {backtest.test.brierDiffCI[1] < 0 ? "a small, measurable edge over Kalshi's prices." : backtest.test.brierDiffCI[0] > 0 ? "worse than Kalshi's own prices." : "no reliable edge over Kalshi's prices so far."} See the numbers ↓
            </a>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 12, lineHeight: 1.6 }}>
              Analysis only, not financial advice. No orders are placed and no Kalshi account is used.
              {data && <> Updated {new Date(data.generated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}. {data.universe.complete
                ? `${data.universe.liquid.toLocaleString()} liquid markets closing within ${data.universe.closingWithinDays} days were found and the ${data.universe.scored} most traded were scored.`
                : `This is a quick look at the ${data.universe.scored} most traded markets closing soonest; the full sweep is refreshing in the background.`} Refreshes every few minutes.</>}
            </div>
          </div>
        </Scene>

        <Scene mood="think" say="Tap any row and I will show my working: chart, order book, headlines.">
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, alignItems: "center" }}>
            {cats.map((k) => <button key={k} className={`chip ${cat === k ? "on" : ""}`} onClick={() => setCat(k)}>{k}</button>)}
            <span style={{ flex: 1 }} />
            <button className={`chip ${onlyEdge ? "on" : ""}`} onClick={() => setOnlyEdge((v) => !v)} aria-pressed={onlyEdge}>Only with edge</button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by" className="chip" style={{ appearance: "none", paddingRight: 14 }}>
              <option value="edge">Sort: edge</option><option value="soon">Sort: closing soon</option><option value="volume">Sort: volume</option>
            </select>
          </div>

          {state === "loading" && [0, 1, 2, 3, 4].map((i) => <div key={i} className="shimmer" style={{ height: 76, marginBottom: 10 }} />)}
          {state === "error" && <div className="panel" style={{ padding: 24, textAlign: "center", color: T.soft }}>Live Kalshi data could not be loaded. Please try again in a minute.</div>}
          {state === "done" && !rows.length && <div className="panel" style={{ padding: 24, textAlign: "center", color: T.soft }}>Nothing matches. {onlyEdge ? "Turn off “Only with edge” to see every market the Swami scored." : ""}</div>}

          {rows.map((m, i) => (
            <Reveal key={m.ticker} delay={Math.min(i, 6) * 45}>
              <button onClick={() => setOpen(m)} className="panel lift" style={{ display: "grid", width: "100%", textAlign: "left", color: T.text, cursor: "pointer", marginBottom: 10, padding: mob ? 14 : "14px 18px", gap: mob ? 10 : 16, alignItems: "center", gridTemplateColumns: mob ? "1fr auto" : "34px minmax(0,1fr) 90px 92px 92px 96px 84px", font: "inherit" }}>
                {!mob && <div style={{ fontFamily: FONT.mono, color: T.gold, fontWeight: 700 }}>#{i + 1}</div>}
                <div style={{ minWidth: 0 }}>
                  {m.eventTitle && m.eventTitle !== m.title && <div style={{ fontSize: 11.5, color: T.gold, marginBottom: 2 }}>{m.eventTitle}</div>}
                  <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.3 }}>{name(m)}</div>
                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3 }}>{m.category} · closes in {closesIn(m.hoursToClose)} · {m.volume24h.toLocaleString()} traded in 24h</div>
                  {mob && <div style={{ fontSize: 12, color: T.soft, marginTop: 6 }}>YES price {c(m.mid)} · Swami {pct(m.prob)} · <span style={{ color: confCol[m.confidence] }}>{m.confidence === "None" ? "no edge" : `${m.confidence} confidence`}</span></div>}
                </div>
                {!mob && <Spark data={m.spark} />}
                {!mob && <div><div style={{ fontSize: 10, color: T.muted }}>YES PRICE</div><div style={{ fontFamily: FONT.mono, fontWeight: 700 }}>{c(m.mid)}</div></div>}
                {!mob && <div><div style={{ fontSize: 10, color: T.muted }}>SWAMI YES</div><div style={{ fontFamily: FONT.mono, fontWeight: 700, color: T.gold }}>{pct(m.prob)}</div></div>}
                <div style={{ textAlign: mob ? "right" : "left" }}>
                  <div style={{ fontSize: 10, color: T.muted }}>{m.edge > 0 ? `BUY ${m.side}` : "PASS"}</div>
                  <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: mob ? 17 : 15, color: m.edge > 0 ? sideCol(m.side) : T.muted }}>{signed(m.edge)}</div>
                </div>
                {!mob && <div style={{ fontSize: 11.5, fontWeight: 700, color: confCol[m.confidence], border: `1px solid ${confCol[m.confidence]}55`, borderRadius: 999, padding: "4px 0", textAlign: "center" }}>{m.confidence === "None" ? "No edge" : m.confidence}</div>}
              </button>
            </Reveal>
          ))}
        </Scene>

        <Scene id="record" mood="calm" say="Do not take my word for it. Here is my record, warts and all." style={{ scrollMarginTop: 80, padding: mob ? "40px 0 10px" : "80px 0 20px" }}>
          <Backtest mob={mob} />
        </Scene>

        <footer style={{ textAlign: "center", fontSize: 11.5, color: T.muted, padding: "34px 8px 0", lineHeight: 1.6 }}>
          For entertainment and analysis only. Not financial advice. Prediction markets carry risk of loss. Data from Kalshi's public API; this site is not affiliated with Kalshi and cannot place trades.
        </footer>
      </main>
      {open && <Detail m={open} onClose={close} mob={mob} />}
      <SwamiGuide />
    </div>
  );
}
