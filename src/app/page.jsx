"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Swami, { SwamiMini } from "../components/Swami";
import SwamiGuide from "../components/SwamiGuide";
import SiteHeader from "../components/SiteHeader";
import { Scene, Reveal } from "../components/Scene";
import { swamiSay } from "../components/swamiBus";
import { T, FONT } from "../lib/theme";

function CrystalBall({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: "block" }}>
      <defs>
        <radialGradient id="cb" cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#e8d8ff" stopOpacity="0.95" />
          <stop offset="25%" stopColor="#a66dff" stopOpacity="0.6" />
          <stop offset="55%" stopColor="#7c3aed" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff8c42" stopOpacity="0.25" />
        </radialGradient>
        <radialGradient id="cbGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#a66dff" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="cbBlur"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <circle cx="60" cy="55" r="50" fill="url(#cbGlow)" filter="url(#cbBlur)" />
      <circle cx="60" cy="55" r="38" fill="url(#cb)" stroke="#a66dff" strokeWidth="1.5" />
      <path d="M45 50 Q55 35 70 45 Q80 55 65 65 Q50 70 45 50" stroke="#a66dff" strokeWidth="1" fill="none" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" values="0 60 55;360 60 55" dur="6s" repeatCount="indefinite" />
      </path>
      <path d="M55 40 Q65 30 75 42 Q82 55 70 62" stroke="#ff8c42" strokeWidth="0.8" fill="none" opacity="0.3">
        <animateTransform attributeName="transform" type="rotate" values="360 60 55;0 60 55" dur="8s" repeatCount="indefinite" />
      </path>
      <ellipse cx="50" cy="45" rx="10" ry="7" fill="#fff" opacity="0.45" />
      <circle cx="46" cy="42" r="4" fill="#fff" opacity="0.3" />
      <ellipse cx="60" cy="95" rx="22" ry="6" fill="#7c3aed" opacity="0.4" />
      <path d="M42 92 Q48 100 60 102 Q72 100 78 92 L74 88 Q66 94 60 94 Q54 94 46 88 Z" fill="#6d28d9" opacity="0.6" />
      <circle cx="30" cy="25" r="2" fill="#ffd700"><animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.5s" repeatCount="indefinite" /></circle>
      <circle cx="90" cy="20" r="1.5" fill="#a66dff"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" /></circle>
      <circle cx="95" cy="80" r="1.5" fill="#ff8c42"><animate attributeName="opacity" values="0.7;0.15;0.7" dur="1.8s" repeatCount="indefinite" /></circle>
      <circle cx="25" cy="75" r="2" fill="#ffd700"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite" /></circle>
    </svg>
  );
}

/* ══ Responsive ════════════════════════════════════════════════ */
function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => { 
    setM(window.innerWidth < 640);
    const h = () => setM(window.innerWidth < 640); 
    window.addEventListener("resize", h); 
    return () => window.removeEventListener("resize", h); 
  }, []);
  return m;
}

/* ══ Data ══════════════════════════════════════════════════════ */
const POLY = [
  { id: "p1", q: "Democratic Presidential Nominee 2028", yes: .24, label: "Newsom 24%", vol: "$895M", v24: "$16M", cat: "politics" },
  { id: "p2", q: "US strikes Iran / Iran Ceasefire", yes: .61, label: "Ceasefire Mar 31: 61%", vol: "$529M", v24: "$24M", cat: "politics" },
  { id: "p3", q: "Republican Presidential Nominee 2028", yes: .37, label: "JD Vance 37%", vol: "$464M", v24: "$11M", cat: "politics" },
  { id: "p4", q: "2026 FIFA World Cup Winner", yes: .15, label: "Spain 15%", vol: "$310M", v24: "$8M", cat: "sports" },
  { id: "p5", q: "Elon Musk tweets Mar 17-24", yes: .30, label: "380-399: 30%", vol: "$7M", v24: "$2M", cat: "culture" },
];
const KALSHI = [
  { id: "k1", q: "NCAA Basketball Champion", yes: .21, label: "Duke 21%", vol: "$60M+", v24: "$8.6M", cat: "sports" },
  { id: "k2", q: "Gov Shutdown ≥55 days", yes: .52, label: "52% Yes", vol: "$4.8M", v24: "$420K", cat: "politics" },
  { id: "k3", q: "Bitcoin $100K by Mar 31", yes: .38, label: "38% Yes", vol: "$3.9M", v24: "$310K", cat: "crypto" },
  { id: "k4", q: "NBA Champion (OKC Thunder)", yes: .34, label: "OKC 34%", vol: "$12M", v24: "$1.2M", cat: "sports" },
  { id: "k5", q: "Fed rate cut by June 2026", yes: .28, label: "28% Yes", vol: "$8.2M", v24: "$890K", cat: "economics" },
];
const PICKS = [
  { rank: 1, q: "Iran ceasefire by March 31", side: "YES", prob: 68, price: 61, conf: "High", plat: "Polymarket", cat: "politics", why: "78% of post-strike ceasefires within 30 days. Diplomacy active. 7¢ value gap.", facts: ["Qatar/Oman channels active", "Trump favors de-escalation", "Oil pressure on both sides", "4¢ cross-platform spread"] },
  { rank: 2, q: "OpenAI IPOs before SpaceX", side: "YES", prob: 89, price: 85, conf: "High", plat: "Both", cat: "science", why: "OpenAI $9B revenue, Altman public timeline. SpaceX zero signals. 4¢ upside.", facts: ["CFO from Goldman", "Altman confirmed 2026", "SpaceX avoids markets", "3¢ platform spread"] },
  { rank: 3, q: "Bitcoin $100K by March 31", side: "NO", prob: 72, price: 38, conf: "Medium", plat: "Kalshi", cat: "crypto", why: "BTC ~$84K, 8 days left. 12% of windows show 19% rally. NO underpriced.", facts: ["8 days too short", "Fed hold = risk-off", "Geopolitical uncertainty", "Bearish sentiment"] },
  { rank: 4, q: "Dems win House 2026", side: "YES", prob: 71, price: 62, conf: "Medium", plat: "Kalshi", cat: "politics", why: "Opposition wins 84% of midterms. Generic ballot D+4. 9¢ below fair.", facts: ["84% base rate", "D+4 generic ballot", "Redistricting favors Dems", "Suburban fatigue"] },
  { rank: 5, q: "Duke wins March Madness", side: "LEAN YES", prob: 24, price: 21, conf: "Low", plat: "Kalshi", cat: "sports", why: "Flagg best player. East path navigable. 3¢ speculative edge.", facts: ["Flagg #1 pick", "Defense top 3", "East bracket weak", "Line moved 18→21¢"] },
];
const OPPS = [
  { type: "VALUE", q: "Iran ceasefire YES — Poly", edge: "+7¢", desc: "Market 61¢, model 68%", color: T.green },
  { type: "ARBI", q: "OpenAI IPO spread", edge: "3¢", desc: "Poly 85¢ vs Kalshi 82¢", color: T.yellow },
  { type: "VALUE", q: "Dems House — Kalshi", edge: "+9¢", desc: "Market 62¢, model 71%", color: T.green },
  { type: "FADE", q: "BTC $100K by Mar 31", edge: "Over", desc: "YES 38¢ too high", color: T.red },
  { type: "ARBI", q: "Iran ceasefire spread", edge: "4¢", desc: "Poly 61¢ vs Kalshi 57¢", color: T.yellow },
];
const H2H = [
  { topic: "2028 Dem Nominee", cat: "politics", poly: { yes: .24, label: "Newsom 24%", vol: "$895M" }, kalshi: { yes: .26, label: "Newsom 26%", vol: "$42M" }, spread: 2 },
  { topic: "March Madness", cat: "sports", poly: { yes: .19, label: "Duke 19%", vol: "$32M" }, kalshi: { yes: .21, label: "Duke 21%", vol: "$60M+" }, spread: 2 },
  { topic: "Bitcoin $100K", cat: "crypto", poly: { yes: .35, label: "35% Yes", vol: "$12M" }, kalshi: { yes: .38, label: "38% Yes", vol: "$3.9M" }, spread: 3 },
  { topic: "Iran Ceasefire", cat: "politics", poly: { yes: .61, label: "61% Yes", vol: "$529M" }, kalshi: { yes: .57, label: "57% Yes", vol: "$14M" }, spread: 4 },
  { topic: "OpenAI vs SpaceX IPO", cat: "science", poly: { yes: .85, label: "OpenAI 85%", vol: "$6.2M" }, kalshi: { yes: .82, label: "82% Yes", vol: "$2.8M" }, spread: 3 },
];

/* ══ UI ════════════════════════════════════════════════════════ */
function pCol(v) { return v > .5 ? T.green : v > .25 ? T.yellow : T.red; }
function Price({ v, s }) { const f = s === "sm" ? 13 : 17; return <span style={{ fontSize: f, fontWeight: 800, fontFamily: FONT.mono, color: pCol(v), background: pCol(v) + "14", padding: "2px 8px", borderRadius: 6, display: "inline-block" }}>{(v * 100).toFixed(0)}<span style={{ fontSize: f * .4, opacity: .6 }}>¢</span></span>; }
function Bdg({ p }) { const i = p === "poly"; return <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: .7, padding: "2px 6px", borderRadius: 4, background: (i ? T.green : T.blue) + "14", color: i ? T.green : T.blue }}>{i ? "POLY" : "KALSHI"}</span>; }
function PBar({ pct, price }) {
  const c = pct > 60 ? T.green : pct > 40 ? T.yellow : T.red;
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 10, color: T.muted }}><span>🔮 Swami: {pct}%</span><span>Market: {price}¢</span></div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 6, background: T.border, borderRadius: 3, overflow: "hidden", position: "relative" }}><div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 3 }} /><div style={{ position: "absolute", left: `${price}%`, top: -2, width: 2, height: 10, background: T.text, borderRadius: 1, opacity: .5 }} /></div><span style={{ fontSize: 12, fontWeight: 800, color: c, fontFamily: FONT.mono, minWidth: 36, textAlign: "right" }}>{pct}%</span></div>
    {pct !== price && <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: pct > price ? T.green : T.red }}>{pct > price ? `▲ +${pct - price}¢ underpriced — BUY` : `▼ ${price - pct}¢ overpriced — FADE`}</div>}
  </div>);
}

/* ══ MAIN APP ══════════════════════════════════════════════════ */
export default function App() {
  const mob = useIsMobile();
  const [tab, setTab] = useState("home");
  const [sel, setSel] = useState(null); const [selP, setSelP] = useState(null);
  const [sp, setSp] = useState(null); const [st, setSt] = useState(""); const [spr, setSpr] = useState(null); const [sl, setSl] = useState(false);
  const [askQ, setAskQ] = useState(""); const [askAns, setAskAns] = useState(""); const [askPred, setAskPred] = useState(null); const [askLd, setAskLd] = useState(false); const [askHist, setAskHist] = useState([]);
  
  // Subscription Form State
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState(null); // idle, loading, success, error
  const [subMsg, setSubMsg] = useState("");

  const sCol = (s) => !s ? T.muted : s.includes("YES") ? T.green : s.includes("NO") ? T.red : T.yellow;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus('loading');
    
    // Netlify Forms requires application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('form-name', 'waitlist');
    formData.append('email', email);

    try {
      // Netlify collects submissions posted to the static form file, not to a Next.js page.
      const res = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      
      if (res.ok) {
        setSubStatus('success');
        setSubMsg('Subscribed to waitlist successfully!');
        setEmail("");
      } else {
        setSubStatus('error');
        setSubMsg('Subscription failed.');
      }
    } catch(err) {
      setSubStatus('error');
      setSubMsg('Network error occurred.');
    }
  };

  const runSwami = useCallback(async (pair) => {
    setSp(pair); setSl(true); setSt(""); setSpr(null);
    try {
      const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pair }) });
      const d = await r.json(); const raw = d.raw || "";
      try { const p = JSON.parse(raw.replace(/```json|```/g, "").trim()); setSpr(p); setSt(p.analysis); } catch { setSt(raw); }
    } catch (e) { setSt("Error: " + e.message); } finally { setSl(false); }
  }, []);

  const askSwami = useCallback(async () => {
    if (!askQ.trim() || askLd) return; setAskLd(true); setAskAns(""); setAskPred(null);
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: askQ.trim() }) });
      const d = await r.json(); const raw = d.raw || "";
      try { const p = JSON.parse(raw.replace(/```json|```/g, "").trim()); setAskPred(p); setAskAns(p.analysis); setAskHist(h => [{ q: askQ.trim(), side: p.side, probability: p.probability }, ...h.slice(0, 9)]); }
      catch { setAskAns(raw); setAskPred({ side: "???", confidence: "—", probability: "—", reasoning: "Crystal ball fuzzy" }); }
    } catch (e) { setAskAns("Error: " + e.message); } finally { setAskLd(false); }
  }, [askQ, askLd]);

  const tabs = [{ k: "home", l: "🔮 Home" }, { k: "top5", l: "🔥 Top 5" }, { k: "h2h", l: "⚔️ H2H" }, { k: "ask", l: "💬 Ask" }, { k: "all", l: "📋 All" }, { k: "edge", l: "🧿 Edge", href: "/edge" }];
  const goTab = useCallback((k) => { setTab(k); window.scrollTo({ top: 0 }); }, []);

  // Links from other pages can open a tab directly: /?tab=ask
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && ["top5", "h2h", "ask", "all"].includes(t)) setTab(t);
  }, []);

  // The big Swami waves hello, then settles.
  const [heroMood, setHeroMood] = useState("greet");
  useEffect(() => { const t = setTimeout(() => setHeroMood("calm"), 5200); return () => clearTimeout(t); }, []);

  // Live picks from the Kalshi edge scanner.
  const [live, setLive] = useState({ state: "loading", picks: [] });
  useEffect(() => {
    let off = false;
    fetch("/api/kalshi/scan").then(r => r.json()).then(d => {
      if (off) return;
      if (d.error) return setLive({ state: "error", picks: [] });
      setLive({ state: "done", picks: (d.markets || []).filter(m => m.edge > 0).slice(0, 3) });
    }).catch(() => !off && setLive({ state: "error", picks: [] }));
    return () => { off = true; };
  }, []);
  const topPick = live.picks[0];
  const liveLine = topPick ? `I see it! ${topPick.title}${topPick.subtitle ? `, ${topPick.subtitle}` : ""}: ${topPick.side} at ${(topPick.price * 100).toFixed(0)}¢.` : live.state === "loading" ? "The mists are parting…" : "Today the markets look fairly priced. Even a swami admits it.";
  const liveVision = topPick ? `+${(topPick.edge * 100).toFixed(0)}¢` : "";

  // The crystal ball swells as its section scrolls through the screen.
  const orbitRef = useRef(null);
  useEffect(() => {
    if (tab !== "home") return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = orbitRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = 1 - Math.abs((r.top + r.height / 2) / window.innerHeight - 0.5) * 1.6;
      el.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    };
    const on = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(frame); };
  }, [tab]);

  // The Swami reacts while a question is being answered.
  useEffect(() => {
    if (tab !== "ask") return;
    if (askLd) swamiSay("gaze", "Consulting the oracle…");
    else if (askPred) swamiSay("reveal", `${askPred.side}. ${askPred.reasoning || ""}`.trim(), String(askPred.probability || ""));
  }, [tab, askLd, askPred]);
  const allM = [...POLY.map(m => ({ ...m, _p: "poly" })), ...KALSHI.map(m => ({ ...m, _p: "kalshi" }))];
  const pad = mob ? "0 16px" : "0";

  return (
    <div style={{ minHeight: "100vh", color: T.text, fontFamily: FONT.body, paddingBottom: "120px", position: "relative", zIndex: 1 }}>

      <SiteHeader items={tabs} active={tab} onPick={goTab} mob={mob} />

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: mob ? "14px 0" : "16px 24px" }}>

        {/* ═══════════ HOME ═══════════ */}
        {tab === "home" && <div style={{ padding: pad }}>
          {/* 1. THE WELCOME */}
          <Scene hero mood="greet" say="Welcome, seeker." style={{ minHeight: mob ? "auto" : "calc(100vh - 80px)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: mob ? "18px 6px 36px" : "10px 24px 40px" }}>
            <Swami size={mob ? 210 : 290} mood={heroMood} />
            <div className="eyebrow" style={{ marginTop: 6 }}>Polymarket × Kalshi</div>
            <h1 className="display" style={{ fontSize: mob ? 38 : 68, fontWeight: 900, margin: "10px 0 0", maxWidth: 820 }}>
              The Swami will <span className="gilded">see you now.</span>
            </h1>
            <p style={{ fontSize: mob ? 15 : 18, color: T.soft, maxWidth: 560, margin: "16px auto 0", lineHeight: 1.6 }}>
              Pull up a cushion. He reads prediction markets the way other swamis read palms: prices, crowds and headlines, turned into a plain yes, no, or not worth it.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
              <button className="btn gold" onClick={() => goTab("ask")}>🔮 Ask the Swami</button>
              <Link className="btn ghost" href="/edge">🧿 Today's Kalshi edge</Link>
            </div>
            <div style={{ marginTop: mob ? 34 : 54 }}><div className="scroll-cue" aria-hidden="true" /><div style={{ fontSize: 11, color: T.muted, marginTop: 8, letterSpacing: 1 }}>scroll, and he follows</div></div>
          </Scene>

          {/* 2. THE GAZE */}
          <Scene mood="gaze" say="Hush now. I am gazing into the markets…" style={{ padding: mob ? "40px 0" : "90px 0" }}>
            <div ref={orbitRef} className="orbit" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 24 : 48, alignItems: "center" }}>
              <div style={{ position: "relative", display: "flex", justifyContent: "center", minHeight: mob ? 220 : 340, alignItems: "center" }}>
                <div className="smoke" />
                <div className="big-ball"><CrystalBall size={mob ? 200 : 300} /></div>
              </div>
              <div>
                <Reveal><div className="eyebrow">First, he gazes</div>
                  <h2 className="display" style={{ fontSize: mob ? 30 : 44, fontWeight: 700, margin: "8px 0 18px" }}>Three things swirl in the ball.</h2></Reveal>
                {[
                  { i: "📈", t: "The price", d: "Where it sits, how fast it moved, and whether moves like that have tended to stick." },
                  { i: "👥", t: "The crowd", d: "Volume, open interest and which side of the order book is leaning harder." },
                  { i: "📰", t: "The news", d: "Fresh headlines, scored for how relevant they are and which way they lean." },
                ].map((x, i) => (
                  <Reveal key={x.t} delay={i * 120} className="panel" style={{ padding: 16, marginBottom: 10, display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 24 }}>{x.i}</div>
                    <div><div style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 700 }}>{x.t}</div><div style={{ fontSize: 13.5, color: T.soft, lineHeight: 1.55, marginTop: 2 }}>{x.d}</div></div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Scene>

          {/* 3. THE REVEAL (live from the Kalshi edge scanner) */}
          <Scene mood={live.picks.length ? "reveal" : live.state === "loading" ? "gaze" : "think"} say={liveLine} vision={liveVision} style={{ padding: mob ? "30px 0" : "70px 0" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 22 }}>
              <div className="eyebrow">Then, he reveals</div>
              <h2 className="display" style={{ fontSize: mob ? 30 : 44, fontWeight: 700, margin: "8px 0 8px" }}>Fresh from the crystal ball</h2>
              <div style={{ fontSize: 13.5, color: T.muted }}>Live Kalshi markets where his number and the price disagree most, after fees.</div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
              {live.state === "loading" && [0, 1, 2].map((i) => <div key={i} className="shimmer" style={{ height: 150 }} />)}
              {live.picks.map((m, i) => (
                <Reveal key={m.ticker} flip delay={i * 140}>
                  <Link href={`/edge?m=${m.ticker}`} className="panel lift" style={{ display: "block", padding: 16, textDecoration: "none", color: T.text, height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, letterSpacing: 1.2, color: T.gold, fontWeight: 700 }}>#{i + 1} · {m.category.toUpperCase()}</span>
                      <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: T.green }}>+{(m.edge * 100).toFixed(1)}¢</span>
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.35, minHeight: 40 }}>{m.title}{m.subtitle ? ` · ${m.subtitle}` : ""}</div>
                    <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 12, color: T.soft }}>
                      <span>Buy <b style={{ color: m.side === "YES" ? T.green : T.red }}>{m.side}</b> at {(m.price * 100).toFixed(0)}¢</span>
                      <span>Swami: {((m.side === "YES" ? m.prob : 1 - m.prob) * 100).toFixed(0)}% chance</span>
                    </div>
                  </Link>
                </Reveal>
              ))}
              {live.state === "done" && !live.picks.length && <div className="panel" style={{ gridColumn: "1 / -1", padding: 20, textAlign: "center", color: T.soft, fontSize: 14 }}>No market clears the Swami's bar right now. Fairly priced markets are good news for everyone but oracles.</div>}
              {live.state === "error" && <div className="panel" style={{ gridColumn: "1 / -1", padding: 20, textAlign: "center", color: T.soft, fontSize: 14 }}>The crystal ball is cloudy. Live Kalshi data is unavailable for the moment.</div>}
            </div>
            <div style={{ textAlign: "center", marginTop: 18 }}><Link className="btn ghost" href="/edge">Open the full edge scanner →</Link></div>
            <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: T.muted }}>For fun and analysis, not advice. <Link href="/edge#record" style={{ color: T.soft }}>See how his numbers have actually done.</Link></div>
          </Scene>

          {/* 4. BEST OPPS */}
          <Scene mood="think" say="A few bargains caught my third eye." style={{ padding: mob ? "30px 0" : "60px 0" }}>
            <Reveal className="divider" style={{ marginBottom: 16 }}><span className="display" style={{ fontSize: mob ? 20 : 26, fontWeight: 700 }}>⚡ Best Bet Opportunities</span></Reveal>
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
              {OPPS.map((o, i) => <Reveal key={i} delay={i * 70} className="panel lift" style={{ padding: 14, borderLeft: `3px solid ${o.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: o.color, background: o.color + "14", padding: "2px 6px", borderRadius: 4 }}>{o.type}</span><span style={{ fontSize: 12, fontWeight: 800, color: o.color, fontFamily: FONT.mono }}>{o.edge}</span></div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>{o.q}</div>
                <div style={{ fontSize: 11.5, color: T.muted }}>{o.desc}</div>
              </Reveal>)}
            </div>
          </Scene>

          {/* 5. TOP 5 PICKS */}
          <Scene mood="calm" say="My five favorites. Read the reasons, not only the verdict." style={{ padding: mob ? "30px 0" : "60px 0" }}>
            <Reveal className="divider" style={{ marginBottom: 18 }}><span className="display" style={{ fontSize: mob ? 20 : 26, fontWeight: 700 }}>🏆 Swami's Top 5</span></Reveal>
            <Reveal style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <img src="/swami-top-5.jpg" alt="Swami's Top 5 Picks" loading="lazy" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 18, boxShadow: `0 12px 40px ${T.purple}33` }} />
            </Reveal>
            {PICKS.map((p, idx) => {
              const sc = p.side.includes("YES") ? T.green : p.side.includes("NO") ? T.red : T.yellow;
              return (<Reveal key={p.rank} delay={Math.min(idx, 2) * 80} className="panel" style={{ padding: mob ? 14 : 18, marginBottom: 12, backgroundImage: `linear-gradient(135deg, ${sc}0a, transparent 60%)` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${T.orange}44, ${T.purple}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: T.gold, fontFamily: FONT.mono, flexShrink: 0 }}>#{p.rank}</div>
                    <div><div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{p.q}</div><div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}><span style={{ color: T.yellow, fontWeight: 700 }}>{p.cat.toUpperCase()}</span> · {p.plat}</div></div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 18, fontWeight: 800, color: sc, fontFamily: FONT.mono }}>{p.side}</div><div style={{ fontSize: 10, color: T.muted }}>{p.conf}</div></div>
                </div>
                <div style={{ marginBottom: 12 }}><PBar pct={p.prob} price={p.price} /></div>
                <div style={{ fontSize: 13, color: T.soft, lineHeight: 1.6, marginBottom: 10 }}>{p.why}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{p.facts.map((f, i) => <div key={i} style={{ display: "flex", gap: 6, fontSize: 11.5, color: T.muted }}><span style={{ color: T.gold }}>✦</span><span>{f}</span></div>)}</div>
              </Reveal>);
            })}
          </Scene>

          {/* 6. ASK */}
          <Scene mood="think" say="Go on, ask me anything. Yes-or-no questions are my specialty." style={{ padding: mob ? "30px 0" : "70px 0" }}>
            <Reveal className="panel" style={{ padding: mob ? 20 : 36, textAlign: "center", backgroundImage: `radial-gradient(ellipse at 50% 0%, ${T.purple}22, transparent 70%)` }}>
              <div className="eyebrow">Your turn</div>
              <h2 className="display" style={{ fontSize: mob ? 28 : 42, fontWeight: 700, margin: "8px 0 16px" }}>What weighs on your mind?</h2>
              <form onSubmit={(e) => { e.preventDefault(); goTab("ask"); if (askQ.trim()) askSwami(); }} style={{ display: "flex", gap: 8, maxWidth: 560, margin: "0 auto", flexWrap: mob ? "wrap" : "nowrap" }}>
                <input type="text" value={askQ} onChange={e => setAskQ(e.target.value)} aria-label="Your question for the Swami" placeholder="Will Bitcoin hit $150K by end of 2026?" style={{ flex: "1 1 220px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 999, padding: "13px 18px", color: T.text, fontSize: 15, outline: "none" }} />
                <button className="btn gold" type="submit" style={{ flex: mob ? "1 1 100%" : "none" }}>🔮 Ask</button>
              </form>
            </Reveal>
          </Scene>

          {/* 7. WAITLIST */}
          <Scene mood="greet" say="Leave your email and I shall summon you when the full oracle opens." style={{ padding: mob ? "20px 0 30px" : "30px 0 60px" }}>
            <Reveal>
              <form name="waitlist" method="POST" action="/__forms.html" onSubmit={handleSubscribe} className="panel" style={{ padding: 22, maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
                <input type="hidden" name="form-name" value="waitlist" />
                <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
                <div style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Join the Oracle Waitlist</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" aria-label="Email address" required style={{ flex: 1, minWidth: 0, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 999, padding: "11px 16px", color: T.text, fontSize: 14, outline: "none" }} />
                  <button type="submit" className="btn gold" disabled={subStatus === 'loading'} style={{ cursor: subStatus === 'loading' ? 'wait' : 'pointer' }}>
                    {subStatus === 'loading' ? '…' : 'Subscribe'}
                  </button>
                </div>
                {subMsg && <div style={{ fontSize: 12, marginTop: 10, color: subStatus === 'success' ? T.green : T.red }}>{subMsg}</div>}
              </form>
            </Reveal>
          </Scene>
        </div>}

        {/* ═══════════ TOP 5 ═══════════ */}
        {tab === "top5" && <Scene as="div" mood="calm" say="The busiest markets on each platform. Tap one to look closer." style={{ padding: pad }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
             <img src="/swami-top-5.jpg" alt="Swami's Top 5 Picks" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 16, boxShadow: `0 8px 30px ${T.purple}33` }} />
          </div>
          {[{ d: POLY, pl: "poly", c: T.green, n: "Polymarket" }, { d: KALSHI, pl: "kalshi", c: T.blue, n: "Kalshi" }].map(sec => (
          <div key={sec.pl} style={{ padding: mob ? "0 0 0 16px" : 0, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, paddingRight: mob ? 16 : 0 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: sec.c }} /><span style={{ fontSize: mob ? 13 : 14, fontWeight: 700, color: sec.c }}>{sec.n}</span><span style={{ fontSize: 11, color: T.muted }}>Top 5</span><div style={{ flex: 1, height: 1, background: T.border, marginLeft: 8 }} /></div>
            <div style={mob ? { display: "flex", gap: 10, overflowX: "auto", paddingRight: 16, paddingBottom: 8 } : { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
              {sec.d.map((m, i) => <div key={m.id} onClick={() => { setSel(m); setSelP(sec.pl); }} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: mob ? 14 : 12, padding: mob ? 14 : "12px 14px", cursor: "pointer", position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: mob ? 120 : 135, minWidth: mob ? 220 : "auto", maxWidth: mob ? 240 : "none", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 24, height: 24, background: sec.c + "14", borderRadius: "0 12px 0 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: sec.c, fontFamily: FONT.mono }}>{i + 1}</div>
                <div><div style={{ marginBottom: 6 }}><Price v={m.yes} /></div><div style={{ fontSize: 10, color: sec.c, fontWeight: 600, marginBottom: 3 }}>{m.label}</div><div style={{ fontSize: mob ? 12 : 11.5, fontWeight: 600, color: T.text, lineHeight: 1.4, paddingRight: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.q}</div></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.muted, marginTop: 8 }}><span>{m.vol}</span><span>24h {m.v24}</span></div>
              </div>)}
            </div>
          </div>
        ))}</Scene>}

        {/* ═══════════ H2H ═══════════ */}
        {tab === "h2h" && <Scene as="div" mood="think" say="Same question, two prices. I do enjoy a disagreement." style={{ padding: pad }}>
          <h1 className="display" style={{ fontSize: mob ? 26 : 36, fontWeight: 700, margin: "6px 0 16px" }}>⚔️ Same Bet, Two Platforms</h1>
          {sp && <div style={{ background: T.card, border: `1px solid ${T.orange}33`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><SwamiMini size={32} /><div><div style={{ fontSize: 13, fontWeight: 700, color: T.orange }}>Swami's Analysis</div><div style={{ fontSize: 10, color: T.muted }}>{sp.topic}</div></div></div>
              <button onClick={() => setSp(null)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            {sl ? <div style={{ padding: 20, textAlign: "center" }}><CrystalBall size={100} /><div style={{ fontSize: 13, color: T.orange, marginTop: 8 }}>The Swami peers into the markets…</div></div>
            : <div style={{ fontSize: 12.5, color: T.soft, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{st}</div>}
          </div>}
          {H2H.map((pair, i) => {
            const pY = pair.poly.yes, kY = pair.kalshi.yes, diff = Math.abs(pY - kY) * 100;
            return (<div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: mob ? 14 : 12, padding: mob ? 14 : 16, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: mob ? 13 : 14, fontWeight: 700, color: T.text }}>{pair.topic}</span>
                {diff >= 2 && <span style={{ fontSize: 11, fontWeight: 700, color: T.yellow, background: T.yellow + "10", padding: "3px 10px", borderRadius: 6 }}>⚡ {diff.toFixed(0)}¢</span>}
              </div>
              {mob ? <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                {[{ pl: "poly", y: pY, l: pair.poly.label, v: pair.poly.vol }, { pl: "kalshi", y: kY, l: pair.kalshi.label, v: pair.kalshi.vol }].map(s => <div key={s.pl} style={{ background: T.sf, borderRadius: 10, padding: 10, border: `1px solid ${(s.pl === "poly" ? T.green : T.blue) + "12"}` }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><Bdg p={s.pl} /><Price v={s.y} s="sm" /></div><div style={{ fontSize: 11, color: T.soft }}>{s.l} · {s.v}</div></div>)}
              </div> : <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <div style={{ background: T.sf, borderRadius: 10, padding: 12, border: `1px solid ${T.green}12` }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><Bdg p="poly" /><Price v={pY} s="sm" /></div><div style={{ fontSize: 11, color: T.soft }}>{pair.poly.label} · {pair.poly.vol}</div></div>
                <div style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: T.dim }}>VS</div>
                <div style={{ background: T.sf, borderRadius: 10, padding: 12, border: `1px solid ${T.blue}12` }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><Bdg p="kalshi" /><Price v={kY} s="sm" /></div><div style={{ fontSize: 11, color: T.soft }}>{pair.kalshi.label} · {pair.kalshi.vol}</div></div>
              </div>}
              <button onClick={() => runSwami(pair)} disabled={sl} style={{ background: `linear-gradient(135deg, ${T.orange}18, ${T.purple}18)`, border: `1px solid ${T.orange}44`, borderRadius: mob ? 10 : 8, padding: mob ? "10px" : "7px 16px", color: T.orange, fontSize: mob ? 12 : 11, fontWeight: 700, cursor: sl ? "wait" : "pointer", width: mob ? "100%" : "auto", float: mob ? "none" : "right", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                <SwamiMini size={16} />{sl && sp?.topic === pair.topic ? "Thinking…" : "Swami's Analysis"}
              </button>
              <div style={{ clear: "both" }} />
            </div>);
          })}
        </Scene>}

        {/* ═══════════ ASK ═══════════ */}
        {tab === "ask" && <Scene as="div" mood="think" say="Type your question. I will consult the ball." style={{ padding: pad, maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><CrystalBall size={mob ? 100 : 130} /></div>
            <h1 className="display gilded" style={{ fontSize: mob ? 30 : 44, fontWeight: 900, margin: 0 }}>Ask The Swami</h1>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <img src="/ask-swami.jpg" alt="Ask The Swami" style={{ maxWidth: "100%", maxHeight: 350, borderRadius: 16, boxShadow: `0 10px 40px ${T.purple}44` }} />
            </div>
            <div style={{ fontSize: 13, color: T.muted, marginTop: 16 }}>Type any question. The Swami will predict with probability and reasoning.</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input type="text" value={askQ} onChange={e => setAskQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") askSwami(); }} placeholder="Will Bitcoin hit $150K by end of 2026?" style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: mob ? "12px 14px" : "10px 14px", color: T.text, fontSize: 14, outline: "none" }} />
            <button onClick={askSwami} disabled={askLd || !askQ.trim()} style={{ background: askLd ? T.dim : `linear-gradient(135deg, ${T.orange}, ${T.purple})`, border: "none", borderRadius: 12, padding: mob ? "12px 16px" : "10px 20px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: askLd ? "wait" : "pointer", opacity: !askQ.trim() ? .4 : 1, whiteSpace: "nowrap" }}>{askLd ? "🔮 …" : "🔮 Ask"}</button>
          </div>
          {askLd && <div style={{ background: T.card, border: `1px solid ${T.orange}33`, borderRadius: 14, padding: 24, textAlign: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "center" }}><CrystalBall size={90} /></div>
            <div style={{ fontSize: 14, color: T.orange, fontWeight: 600, marginTop: 8 }}>The Swami consults the oracle…</div>
          </div>}
          {!askLd && askPred && <div style={{ background: T.card, border: `1px solid ${T.orange}33`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><SwamiMini size={28} /><span style={{ fontSize: 11, fontWeight: 700, color: T.orange, letterSpacing: 1 }}>SWAMI'S VERDICT</span></div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>{askQ}</div>
            <div style={{ background: sCol(askPred.side) + "14", border: `1px solid ${sCol(askPred.side)}33`, borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: sCol(askPred.side), fontFamily: FONT.mono }}>{askPred.side}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
                <div><div style={{ fontSize: 9, color: T.muted, letterSpacing: 1 }}>CONFIDENCE</div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{askPred.confidence}</div></div>
                <div><div style={{ fontSize: 9, color: T.muted, letterSpacing: 1 }}>PROBABILITY</div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{askPred.probability}</div></div>
              </div>
              {askPred.reasoning && <div style={{ fontSize: 12, color: T.soft, marginTop: 10, fontStyle: "italic" }}>"{askPred.reasoning}"</div>}
            </div>
            <div style={{ fontSize: 12.5, color: T.soft, lineHeight: 1.75 }}>{askAns}</div>
          </div>}
          {askHist.length > 0 && <div><div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: 1, marginBottom: 8 }}>RECENT</div>{askHist.map((h, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 4 }}><span style={{ fontSize: 11, fontWeight: 800, color: sCol(h.side), fontFamily: FONT.mono, minWidth: 65 }}>{h.side}</span><span style={{ fontSize: 11, color: T.muted, minWidth: 32 }}>{h.probability}</span><span style={{ fontSize: 12, color: T.soft, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.q}</span></div>)}</div>}
          {!askPred && !askLd && <div><div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>Try asking:</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{["Will Trump run in 2028?", "Bitcoin $200K by 2027?", "AI replace engineers?", "Lakers NBA title?", "US recession 2027?"].map(s => <button key={s} onClick={() => setAskQ(s)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", color: T.soft, fontSize: 11, cursor: "pointer" }}>{s}</button>)}</div></div>}
        </Scene>}

        {/* ═══════════ ALL ═══════════ */}
        {tab === "all" && <Scene as="div" mood="calm" say="Every market I am watching." style={{ padding: pad }}>
          <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            {allM.map(m => <div key={m.id} onClick={() => { setSel(m); setSelP(m._p); }} style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}><Bdg p={m._p} /><span style={{ fontSize: 9, color: T.dim, textTransform: "uppercase" }}>{m.cat}</span></div><div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.35 }}>{m.q}</div></div>
                <Price v={m.yes} s="sm" />
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 10, color: T.muted }}><span>{m.vol}</span><span>24h {m.v24}</span></div>
            </div>)}
          </div>
        </Scene>}

        <footer style={{ textAlign: "center", fontSize: 11.5, color: T.muted, padding: "34px 16px 0", lineHeight: 1.6 }}>
          For entertainment and analysis only. Not financial advice. The Swami places no trades and holds no accounts.
        </footer>
      </div>
      <SwamiGuide />

      {/* Detail Modal / Sheet */}
      {sel && <>
        <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", zIndex: 199 }} />
        <div style={mob ? { position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `2px solid ${selP === "poly" ? T.green : T.blue}`, borderRadius: "20px 20px 0 0", padding: "16px 20px 32px", zIndex: 200, maxHeight: "70vh", overflowY: "auto" } : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 440, background: T.card, borderTop: `4px solid ${selP === "poly" ? T.green : T.blue}`, borderRadius: 24, padding: "24px", zIndex: 200, maxHeight: "85vh", overflowY: "auto", boxShadow: `0 20px 60px rgba(0,0,0,0.8)` }}>
          {mob && <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border, margin: "0 auto 14px" }} />}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><Bdg p={selP} /><button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: T.muted, fontSize: 20, cursor: "pointer" }}>✕</button></div>
          <div style={{ fontSize: mob ? 16 : 18, fontWeight: 700, color: T.text, lineHeight: 1.4, marginBottom: 16 }}>{sel.q}</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, background: T.green + "14", borderRadius: 12, padding: 12, textAlign: "center" }}><div style={{ fontSize: 9, color: T.green, fontWeight: 700 }}>YES</div><div style={{ fontSize: 28, fontWeight: 800, color: T.green, fontFamily: FONT.mono }}>{(sel.yes * 100).toFixed(0)}¢</div></div>
            <div style={{ flex: 1, background: T.red + "14", borderRadius: 12, padding: 12, textAlign: "center" }}><div style={{ fontSize: 9, color: T.red, fontWeight: 700 }}>NO</div><div style={{ fontSize: 28, fontWeight: 800, color: T.red, fontFamily: FONT.mono }}>{((1 - sel.yes) * 100).toFixed(0)}¢</div></div>
          </div>
          <a href={`https://${selP === "poly" ? "polymarket.com" : "kalshi.com"}`} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none", background: `linear-gradient(135deg, ${selP === "poly" ? "#00c896" : "#2e7cf6"}, ${T.purple})`, color: "#fff", textAlign: "center", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Place Trade on {selP === "poly" ? "Polymarket" : "Kalshi"} ⚡
          </a>
        </div>
      </>}

    </div>
  );
}
