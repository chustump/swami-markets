"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { SYMBOLS, TIMEFRAMES } from "@/lib/symbols";
import { analyze, autoTune, ema } from "@/lib/indicators";

const T = { bg: "#060710", sf: "#0c0e16", card: "#11131c", hover: "#191c28", border: "#1b1f30", text: "#e6e8f0", soft: "#a2a6bc", muted: "#636882", dim: "#3c3f54", green: "#00e5b0", red: "#ff5274", blue: "#5890ff", yellow: "#ffc84a", purple: "#a66dff", orange: "#ff8c42" };
const MONO = "'JetBrains Mono',monospace";

const fmt = v => v == null || !isFinite(v) ? "—" : v >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 2 }) : v >= 1 ? v.toFixed(2) : v.toFixed(4);
const pct = (v, d = 1) => v == null || !isFinite(v) ? "—" : `${v >= 0 ? "+" : ""}${(v * 100).toFixed(d)}%`;
const when = t => new Date(t * 1000).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const scoreColor = s => s >= 20 ? T.green : s <= -20 ? T.red : T.yellow;

async function fetchCandles(symbol, tf) {
  const r = await fetch(`/api/candles?symbol=${symbol}&tf=${tf}`);
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Failed to load candles");
  return d;
}

/* ══ Chart ═════════════════════════════════════════════════════ */
function Chart({ candles, result, show, viewKey, height }) {
  const el = useRef(null);
  const api = useRef(null);
  const lastKey = useRef(null);

  useEffect(() => {
    let dead = false, ro;
    import("lightweight-charts").then(({ createChart, LineStyle, CrosshairMode }) => {
      if (dead || !el.current) return;
      const chart = createChart(el.current, {
        width: el.current.clientWidth, height,
        layout: { background: { color: T.card }, textColor: T.soft, fontFamily: MONO, fontSize: 11 },
        grid: { vertLines: { color: T.border + "80" }, horzLines: { color: T.border + "80" } },
        rightPriceScale: { borderColor: T.border }, timeScale: { borderColor: T.border, timeVisible: true },
        crosshair: { mode: CrosshairMode.Normal },
      });
      const line = (color, width = 2, style = LineStyle.Solid) => chart.addLineSeries({ color, lineWidth: width, lineStyle: style, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
      api.current = {
        chart, LineStyle, priceLines: [],
        ema200: line(T.blue + "aa", 1), ema50: line(T.purple + "aa", 1),
        stop: line(T.green),
        res: line(T.orange, 2, LineStyle.Dashed), sup: line(T.orange, 2, LineStyle.Dashed),
        candle: chart.addCandlestickSeries({ upColor: T.green, downColor: T.red, borderVisible: false, wickUpColor: T.green, wickDownColor: T.red }),
      };
      ro = new ResizeObserver(() => el.current && chart.applyOptions({ width: el.current.clientWidth }));
      ro.observe(el.current);
      el.current.dispatchEvent(new Event("chart-ready"));
    });
    return () => { dead = true; ro?.disconnect(); api.current?.chart.remove(); api.current = null; lastKey.current = null; };
  }, [height]);

  const [ready, setReady] = useState(0);
  useEffect(() => {
    const node = el.current, h = () => setReady(x => x + 1);
    node?.addEventListener("chart-ready", h);
    return () => node?.removeEventListener("chart-ready", h);
  }, []);

  useEffect(() => {
    const a = api.current;
    if (!a || !candles?.length || !result) return;
    const { engine, levels, lines } = result;
    const closes = candles.map(c => c.close);
    const series = (vals, keep = () => true) => candles.map((c, i) => vals[i] != null && keep(i) ? { time: c.time, value: vals[i] } : { time: c.time });
    a.candle.setData(candles);
    a.ema50.setData(show.ema ? series(ema(closes, 50)) : []);
    a.ema200.setData(show.ema ? series(ema(closes, 200)) : []);
    a.stop.setData(show.stop ? candles.flatMap((c, i) => engine.stop[i] == null ? [] : [{ time: c.time, value: engine.stop[i], color: engine.trend[i] === 1 ? T.green : T.red }]) : []);
    a.res.setData(show.lines && lines.resistance ? [lines.resistance.from, lines.resistance.to] : []);
    a.sup.setData(show.lines && lines.support ? [lines.support.from, lines.support.to] : []);
    a.candle.setMarkers(show.signals ? engine.signals.map(s => s.type === "buy"
      ? { time: s.time, position: "belowBar", color: T.green, shape: "arrowUp", text: s.strong ? "STRONG BUY" : "BUY" }
      : { time: s.time, position: "aboveBar", color: T.red, shape: "arrowDown", text: s.strong ? "STRONG SELL" : "SELL" }) : []);
    a.priceLines.forEach(p => a.candle.removePriceLine(p));
    a.priceLines = [];
    if (show.levels && levels) {
      const add = (price, color, title, style = a.LineStyle.Dotted) => a.priceLines.push(a.candle.createPriceLine({ price, color, lineWidth: 1, lineStyle: style, axisLabelVisible: true, title }));
      add(levels.entry, T.soft, "Entry", a.LineStyle.Dashed);
      add(levels.initialStop, T.red, "Stop");
      add(levels.tp1, T.green, "TP1"); add(levels.tp2, T.green, "TP2"); add(levels.tp3, T.green, "TP3");
    }
    if (lastKey.current !== viewKey) { a.chart.timeScale().setVisibleLogicalRange({ from: candles.length - Math.round(el.current.clientWidth / 8), to: candles.length + 6 }); lastKey.current = viewKey; }
  }, [candles, result, show, viewKey, ready]);

  return <div ref={el} style={{ width: "100%", height }} />;
}

/* ══ Small UI pieces ═══════════════════════════════════════════ */
const Card = ({ title, right, children, style }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, ...style }}>
    {title && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: T.muted }}>{title}</span>{right}
    </div>}
    {children}
  </div>
);
const Row = ({ k, v, c }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }}>
    <span style={{ color: T.muted }}>{k}</span><span style={{ color: c || T.text, fontFamily: MONO, fontWeight: 600 }}>{v}</span>
  </div>
);
const Chip = ({ on, onClick, children, color = T.orange }) => (
  <button onClick={onClick} style={{ background: on ? color + "1c" : "transparent", border: `1px solid ${on ? color + "66" : T.border}`, color: on ? color : T.muted, borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{children}</button>
);

/* ══ Page ══════════════════════════════════════════════════════ */
export default function ChartsPage() {
  const [symbol, setSymbol] = useState("BTCUSD");
  const [tf, setTf] = useState("1h");
  const [sens, setSens] = useState(5);
  const [show, setShow] = useState({ signals: true, stop: true, lines: true, levels: true, ema: false });
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [wide, setWide] = useState(true);
  const [alerts, setAlerts] = useState(false);
  const [toast, setToast] = useState(null);
  const [scan, setScan] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [ai, setAi] = useState({ state: "idle", text: "" });
  const seen = useRef({});

  useEffect(() => {
    const h = () => setWide(window.innerWidth >= 980);
    h(); window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const load = useCallback(async (quiet) => {
    if (!quiet) { setLoading(true); setErr(""); }
    try { setData(await fetchCandles(symbol, tf)); }
    catch (e) { if (!quiet) { setErr(e.message); setData(null); } }
    finally { if (!quiet) setLoading(false); }
  }, [symbol, tf]);

  useEffect(() => { setAi({ state: "idle", text: "" }); load(false); }, [load]);
  useEffect(() => { const id = setInterval(() => load(true), 60000); return () => clearInterval(id); }, [load]);

  const fresh = data && data.symbol === symbol && data.tf === tf ? data : null;
  const candles = fresh?.candles;
  const result = useMemo(() => candles ? analyze(candles, sens) : null, [candles, sens]);
  const sym = SYMBOLS.find(s => s.id === symbol);
  const last = candles?.[candles.length - 1];
  const prev = candles?.[candles.length - 2];
  const lastSig = result?.engine.signals[result.engine.signals.length - 1];

  // Alert when a new confirmed signal appears on the chart being watched.
  useEffect(() => {
    if (!lastSig) return;
    const key = `${symbol}|${tf}|${sens}`;
    const before = seen.current[key];
    seen.current[key] = lastSig.time;
    if (!alerts || before == null || lastSig.time <= before) return;
    const msg = `${lastSig.strong ? "Strong " : ""}${lastSig.type.toUpperCase()} signal on ${symbol} ${tf} at ${fmt(lastSig.price)}`;
    setToast(msg);
    setTimeout(() => setToast(null), 8000);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification("Swami Signals", { body: msg });
  }, [lastSig, alerts, symbol, tf, sens]);

  const toggleAlerts = async () => {
    if (!alerts && typeof Notification !== "undefined" && Notification.permission === "default") await Notification.requestPermission();
    setAlerts(a => !a);
  };

  const runScan = useCallback(async () => {
    setScanning(true);
    const rows = await Promise.all(SYMBOLS.map(async s => {
      try {
        const d = await fetchCandles(s.id, tf);
        const r = analyze(d.candles, sens);
        const sig = r.engine.signals[r.engine.signals.length - 1];
        const c = d.candles;
        return { s, simulated: d.simulated, price: c[c.length - 1].close, chg: c[c.length - 1].close / c[c.length - 2].close - 1, sig, barsAgo: sig ? c.length - 1 - sig.i : null, score: r.conf.score, label: r.conf.label, rsi: r.conf.rsi, win: r.stats.winRate, n: r.stats.count };
      } catch (e) { return { s, error: e.message }; }
    }));
    setScan(rows.sort((a, b) => Math.abs(b.score ?? 0) - Math.abs(a.score ?? 0)));
    setScanning(false);
  }, [tf, sens]);

  useEffect(() => { setScan(null); }, [tf, sens]);

  const askAi = async () => {
    if (!result || !last) return;
    setAi({ state: "loading", text: "" });
    const { conf, levels, stats, lines } = result;
    const snapshot = {
      symbol, timeframe: tf, simulated: fresh.simulated, price: last.close,
      confluenceScore: conf.score, confluenceLabel: conf.label,
      indicators: conf.items.map(i => ({ name: i.name, value: i.value })),
      activeSignal: levels && { side: levels.side, entry: levels.entry, barsAgo: levels.barsAgo, initialStop: levels.initialStop, trailingStop: levels.trailingStop, tp1: levels.tp1, tp2: levels.tp2, tp3: levels.tp3 },
      trendLines: { resistanceNow: lines.resistance?.to.value, supportNow: lines.support?.to.value },
      backtest: { trades: stats.count, winRate: stats.winRate, profitFactor: stats.profitFactor, totalReturn: stats.totalReturn, maxDrawdown: stats.maxDrawdown, buyHold: stats.buyHold },
    };
    try {
      const r = await fetch("/api/chart-ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ snapshot }) });
      const d = await r.json();
      if (d.missingKey) setAi({ state: "error", text: "AI commentary needs an ANTHROPIC_API_KEY environment variable. All signals, levels and stats on this page work without it." });
      else if (!r.ok) setAi({ state: "error", text: d.error || "AI request failed" });
      else setAi({ state: "done", text: d.text });
    } catch (e) { setAi({ state: "error", text: e.message }); }
  };

  const conf = result?.conf, levels = result?.levels, stats = result?.stats;
  const chg = last && prev ? last.close / prev.close - 1 : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", paddingBottom: 60 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: T.sf + "ee", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Swami <span style={{ color: T.orange }}>Signals</span></div>
          <div style={{ fontSize: 10, color: T.muted }}>AI-assisted technical charting</div>
        </div>
        <Link href="/" style={{ fontSize: 11, fontWeight: 600, color: T.soft, textDecoration: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", whiteSpace: "nowrap" }}>🔮 Prediction Markets</Link>
      </div>

      <div style={{ maxWidth: 1360, margin: "0 auto", padding: 16 }}>
        {/* SYMBOLS */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 8 }}>
          {SYMBOLS.map(s => <Chip key={s.id} on={s.id === symbol} onClick={() => setSymbol(s.id)}>{s.id}</Chip>)}
        </div>

        {/* TOOLBAR */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <div style={{ marginRight: 6 }}>
            <div style={{ fontSize: 12, color: T.muted }}>{sym.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 800, fontFamily: MONO }}>{fmt(last?.close)}</span>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: MONO, color: chg >= 0 ? T.green : T.red }}>{pct(chg, 2)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>{TIMEFRAMES.map(t => <Chip key={t.id} on={t.id === tf} onClick={() => setTf(t.id)} color={T.blue}>{t.label}</Chip>)}</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[["signals", "Signals"], ["stop", "Trail stop"], ["lines", "Trend lines"], ["levels", "TP / SL"], ["ema", "EMA 50/200"]].map(([k, l]) =>
              <Chip key={k} on={show[k]} onClick={() => setShow(s => ({ ...s, [k]: !s[k] }))} color={T.purple}>{l}</Chip>)}
          </div>
          <Chip on={alerts} onClick={toggleAlerts} color={T.yellow}>{alerts ? "🔔 Alerts on" : "🔕 Alerts off"}</Chip>
          {fresh && <span title={fresh.simulated ? (fresh.errors || []).join(" · ") : ""} style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, letterSpacing: .5, padding: "4px 8px", borderRadius: 6, color: fresh.simulated ? T.yellow : T.green, background: (fresh.simulated ? T.yellow : T.green) + "14" }}>
            {fresh.simulated ? "⚠ DEMO DATA — live feed unreachable, prices are simulated" : `● LIVE · ${fresh.source}`}
          </span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: wide ? "minmax(0,1fr) 330px" : "minmax(0,1fr)", gap: 12, alignItems: "start" }}>
          {/* CHART + SCREENER */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", position: "relative", minHeight: wide ? 520 : 380 }}>
              <Chart candles={candles} result={result} show={show} viewKey={`${symbol}|${tf}`} height={wide ? 520 : 380} />
              {(loading || err) && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: T.card + "cc", fontSize: 13, color: err ? T.red : T.soft }}>{err || "Loading candles…"}</div>}
            </div>

            <Card title="MARKET SCREENER" right={<Chip on onClick={runScan}>{scanning ? "Scanning…" : scan ? "Rescan" : `Scan ${SYMBOLS.length} markets`}</Chip>}>
              {!scan ? <div style={{ fontSize: 12, color: T.muted }}>Runs the signal engine on every market at the {tf} timeframe and sensitivity {sens}, ranked by confluence strength.</div> :
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 560 }}>
                    <thead><tr style={{ color: T.muted, textAlign: "right", fontSize: 10, letterSpacing: .5 }}>
                      <th style={{ textAlign: "left", padding: "6px 4px" }}>MARKET</th><th>PRICE</th><th>CHG</th><th>LAST SIGNAL</th><th>CONFLUENCE</th><th>RSI</th><th>WIN RATE</th>
                    </tr></thead>
                    <tbody>{scan.map(r => r.error
                      ? <tr key={r.s.id}><td style={{ padding: "8px 4px" }}>{r.s.id}</td><td colSpan={6} style={{ color: T.red, textAlign: "right" }}>{r.error}</td></tr>
                      : <tr key={r.s.id} onClick={() => setSymbol(r.s.id)} style={{ borderTop: `1px solid ${T.border}`, cursor: "pointer", textAlign: "right", fontFamily: MONO }}>
                        <td style={{ textAlign: "left", padding: "8px 4px", fontFamily: "inherit", fontWeight: 700 }}>{r.s.id}{r.simulated && <span style={{ color: T.yellow, fontSize: 9 }}> demo</span>}</td>
                        <td>{fmt(r.price)}</td>
                        <td style={{ color: r.chg >= 0 ? T.green : T.red }}>{pct(r.chg, 2)}</td>
                        <td style={{ color: r.sig?.type === "buy" ? T.green : T.red }}>{r.sig ? `${r.sig.type.toUpperCase()} · ${r.barsAgo} bars` : "—"}</td>
                        <td style={{ color: scoreColor(r.score) }}>{r.score > 0 ? "+" : ""}{r.score} {r.label}</td>
                        <td>{r.rsi?.toFixed(0) ?? "—"}</td>
                        <td>{r.n ? `${(r.win * 100).toFixed(0)}% (${r.n})` : "—"}</td>
                      </tr>)}</tbody>
                  </table>
                </div>}
            </Card>
          </div>

          {/* SIDE PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card title="CONFLUENCE">
              {conf ? <>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(conf.score) }}>{conf.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, fontFamily: MONO, color: scoreColor(conf.score) }}>{conf.score > 0 ? "+" : ""}{conf.score}</span>
                </div>
                <div style={{ height: 6, background: T.border, borderRadius: 3, margin: "10px 0", position: "relative" }}>
                  <div style={{ position: "absolute", left: "50%", top: -2, width: 1, height: 10, background: T.dim }} />
                  <div style={{ position: "absolute", top: 0, height: 6, borderRadius: 3, background: scoreColor(conf.score), left: conf.score >= 0 ? "50%" : `${50 + conf.score / 2}%`, width: `${Math.abs(conf.score) / 2}%` }} />
                </div>
                {conf.items.map(i => <Row key={i.name} k={i.name} v={i.value} c={i.vote > 0 ? T.green : i.vote < 0 ? T.red : T.soft} />)}
                {(conf.overbought || conf.oversold) && <div style={{ fontSize: 11, color: T.yellow, marginTop: 6 }}>RSI is {conf.overbought ? "overbought (>70)" : "oversold (<30)"}.</div>}
              </> : <div style={{ fontSize: 12, color: T.muted }}>—</div>}
            </Card>

            <Card title="ACTIVE SIGNAL">
              {levels ? <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: levels.side === "LONG" ? T.green : T.red }}>{lastSig.strong ? "STRONG " : ""}{levels.side === "LONG" ? "BUY" : "SELL"}</span>
                  <span style={{ fontSize: 11, color: T.muted }}>{levels.barsAgo} bars ago · {when(levels.time)}</span>
                </div>
                <Row k="Entry (signal close)" v={fmt(levels.entry)} />
                <Row k="Initial stop" v={fmt(levels.initialStop)} c={T.red} />
                <Row k="Trailing stop now" v={fmt(levels.trailingStop)} c={T.red} />
                <Row k="TP1 · 1R" v={fmt(levels.tp1)} c={T.green} />
                <Row k="TP2 · 2R" v={fmt(levels.tp2)} c={T.green} />
                <Row k="TP3 · 3R" v={fmt(levels.tp3)} c={T.green} />
                <Row k="Open P/L vs entry" v={pct((levels.side === "LONG" ? 1 : -1) * (last.close / levels.entry - 1), 2)} c={(levels.side === "LONG" ? 1 : -1) * (last.close - levels.entry) >= 0 ? T.green : T.red} />
              </> : <div style={{ fontSize: 12, color: T.muted }}>No signal in the loaded history at this sensitivity.</div>}
            </Card>

            <Card title="SENSITIVITY" right={<Chip on onClick={() => candles && setSens(autoTune(candles))}>Auto-tune</Chip>}>
              <input type="range" min={1} max={10} step={1} value={sens} onChange={e => setSens(+e.target.value)} style={{ width: "100%", accentColor: T.orange }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.muted }}><span>1 · fewer, slower</span><span style={{ color: T.orange, fontWeight: 700 }}>{sens}</span><span>faster, more · 10</span></div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 6, lineHeight: 1.5 }}>Auto-tune picks the setting with the best backtest return on this chart. That is a fit to past data, not a forecast.</div>
            </Card>

            <Card title={`BACKTEST · ${candles?.length ?? 0} BARS`}>
              {stats?.count ? <>
                <Row k="Trades" v={stats.count} />
                <Row k="Win rate" v={`${(stats.winRate * 100).toFixed(0)}%`} />
                <Row k="Profit factor" v={isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞"} c={stats.profitFactor >= 1 ? T.green : T.red} />
                <Row k="Strategy return" v={pct(stats.totalReturn)} c={stats.totalReturn >= 0 ? T.green : T.red} />
                <Row k="Buy & hold" v={pct(stats.buyHold)} c={stats.buyHold >= 0 ? T.green : T.red} />
                <Row k="Max drawdown" v={pct(-stats.maxDrawdown)} c={T.red} />
                <Row k="Avg trade" v={pct(stats.avgTrade, 2)} />
                <div style={{ fontSize: 10, color: T.muted, marginTop: 6, lineHeight: 1.5 }}>Long and short, entered at the open after each signal, 0.05% fee per side, no slippage. Past results do not predict future results.</div>
              </> : <div style={{ fontSize: 12, color: T.muted }}>Not enough signals to backtest.</div>}
            </Card>

            <Card title="AI CHART READ" right={<Chip on onClick={askAi}>{ai.state === "loading" ? "Reading…" : "Analyze"}</Chip>}>
              <div style={{ fontSize: 12, color: ai.state === "error" ? T.yellow : T.soft, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {ai.text || "Sends the indicator snapshot above to Claude for a plain-language read of trend, momentum, key levels and risks."}
              </div>
            </Card>
          </div>
        </div>

        <div style={{ fontSize: 10, color: T.dim, marginTop: 20, lineHeight: 1.6, textAlign: "center" }}>
          Signals are computed on closed candles only and do not repaint. This is charting software for education: it does not execute trades and is not investment advice. Trading involves risk of loss.
        </div>
      </div>

      {toast && <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: T.card, border: `1px solid ${T.yellow}66`, color: T.text, borderRadius: 12, padding: "12px 18px", fontSize: 13, fontWeight: 600, zIndex: 300, boxShadow: "0 10px 40px rgba(0,0,0,.6)" }}>🔔 {toast}</div>}
      <style>{`::-webkit-scrollbar{width:5px;height:0}th{font-weight:700;padding:6px 4px}td{padding:8px 4px}`}</style>
    </div>
  );
}
