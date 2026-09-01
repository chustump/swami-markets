"use client";
import { useState, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   INLINE SVG GRAPHICS
   ══════════════════════════════════════════════════════════════ */

function SwamiMini({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id="mt" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#ff8c42" /></linearGradient>
        <radialGradient id="mf" cx="50%" cy="40%" r="50%"><stop offset="0%" stopColor="#ddb892" /><stop offset="100%" stopColor="#c49a6c" /></radialGradient>
      </defs>
      <circle cx="30" cy="30" r="29" fill="#a66dff" opacity="0.15" />
      <circle cx="30" cy="32" r="14" fill="url(#mf)" />
      <ellipse cx="30" cy="22" rx="16" ry="11" fill="url(#mt)" />
      <circle cx="30" cy="23" r="3" fill="#ffd700" /><circle cx="30" cy="23" r="1.5" fill="#fff" opacity="0.8" />
      <circle cx="25" cy="30" r="2" fill="#1a1a2e" /><circle cx="35" cy="30" r="2" fill="#1a1a2e" />
      <path d="M22 36 Q26 44 30 45 Q34 44 38 36" fill="#d4d4d8" />
      <path d="M24 35 Q28 33 30 35 Q32 33 36 35" stroke="#ccc" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function SwamiCharacter({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: "block" }}>
      <defs>
        <radialGradient id="aura" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#a66dff" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#ff8c42" stopOpacity="0.2" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="turban" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ff8c42" />
        </linearGradient>
        <linearGradient id="turban2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="face" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#ddb892" />
          <stop offset="100%" stopColor="#c49a6c" />
        </radialGradient>
        <radialGradient id="orb" cx="40%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#e0d0ff" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#a66dff" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff8c42" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a66dff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="glow1"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <circle cx="100" cy="95" r="95" fill="url(#aura)" />
      <path d="M60 145 Q65 130 80 125 L100 120 L120 125 Q135 130 140 145 L145 190 L55 190 Z" fill="#7c3aed" opacity="0.8" />
      <path d="M65 148 Q70 135 82 128 L100 123 L118 128 Q130 135 135 148 L138 185 L62 185 Z" fill="#6d28d9" opacity="0.6" />
      <rect x="90" y="112" width="20" height="14" rx="5" fill="url(#face)" />
      <ellipse cx="100" cy="98" rx="32" ry="36" fill="url(#face)" />
      <ellipse cx="100" cy="68" rx="40" ry="28" fill="url(#turban)" />
      <ellipse cx="100" cy="62" rx="36" ry="22" fill="url(#turban2)" />
      <ellipse cx="100" cy="58" rx="30" ry="16" fill="url(#turban)" opacity="0.8" />
      <path d="M70 68 Q85 50 100 52 Q115 50 130 68" stroke="#ff8c42" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M75 72 Q90 56 100 58 Q110 56 125 72" stroke="#ffd700" strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="100" cy="66" r="7" fill="#ffd700" filter="url(#glow1)" />
      <circle cx="100" cy="66" r="5" fill="#ffed4a" />
      <circle cx="100" cy="66" r="3" fill="#fff" opacity="0.8" />
      <circle cx="98" cy="64" r="1.5" fill="#fff" />
      <ellipse cx="88" cy="94" rx="5" ry="4" fill="#fff" />
      <ellipse cx="112" cy="94" rx="5" ry="4" fill="#fff" />
      <ellipse cx="88" cy="94" rx="3.5" ry="3.5" fill="#1a1a2e" />
      <ellipse cx="112" cy="94" rx="3.5" ry="3.5" fill="#1a1a2e" />
      <circle cx="89.5" cy="93" r="1.2" fill="#fff" />
      <circle cx="113.5" cy="93" r="1.2" fill="#fff" />
      <path d="M78 87 Q84 82 95 86" stroke="#5a3a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M105 86 Q116 82 122 87" stroke="#5a3a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M98 97 Q100 103 102 97" stroke="#b08660" strokeWidth="1.5" fill="none" />
      <path d="M82 107 Q90 102 100 107 Q110 102 118 107" stroke="#d4d4d8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M75 110 Q82 135 100 140 Q118 135 125 110" fill="#e5e5e5" />
      <path d="M78 112 Q86 132 100 136 Q114 132 122 112" fill="#d4d4d8" />
      <path d="M82 114 Q90 128 100 131 Q110 128 118 114" fill="#c4c4c8" opacity="0.5" />
      <circle cx="100" cy="175" r="18" fill="url(#orbGlow)" />
      <circle cx="100" cy="175" r="14" fill="url(#orb)" stroke="#a66dff" strokeWidth="1" />
      <ellipse cx="96" cy="170" rx="5" ry="3.5" fill="#fff" opacity="0.5" />
      <circle cx="93" cy="168" r="2" fill="#fff" opacity="0.3" />
      <path d="M78 160 Q82 168 88 172" stroke="#c49a6c" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M122 160 Q118 168 112 172" stroke="#c49a6c" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g filter="url(#glow1)">
        <circle cx="40" cy="35" r="2.5" fill="#ffd700"><animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" /></circle>
        <circle cx="160" cy="40" r="2" fill="#a66dff"><animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.7s" repeatCount="indefinite" /></circle>
        <circle cx="30" cy="110" r="1.5" fill="#ff8c42"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.3s" repeatCount="indefinite" /></circle>
        <circle cx="170" cy="120" r="2" fill="#ffd700"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" /></circle>
        <circle cx="55" cy="165" r="1.5" fill="#a66dff"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.8s" repeatCount="indefinite" /></circle>
        <circle cx="145" cy="170" r="2" fill="#ff8c42"><animate attributeName="opacity" values="0.7;0.15;0.7" dur="2.1s" repeatCount="indefinite" /></circle>
      </g>
    </svg>
  );
}

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

/* ══ Theme ═════════════════════════════════════════════════════ */
const T = { bg: "#060710", sf: "#0c0e16", card: "#11131c", hover: "#191c28", border: "#1b1f30", text: "#e6e8f0", soft: "#a2a6bc", muted: "#636882", dim: "#3c3f54", green: "#00e5b0", red: "#ff5274", blue: "#5890ff", yellow: "#ffc84a", purple: "#a66dff", orange: "#ff8c42", gold: "#FFD700" };

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
function Price({ v, s }) { const f = s === "sm" ? 13 : 17; return <span style={{ fontSize: f, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: pCol(v), background: pCol(v) + "14", padding: "2px 8px", borderRadius: 6, display: "inline-block" }}>{(v * 100).toFixed(0)}<span style={{ fontSize: f * .4, opacity: .6 }}>¢</span></span>; }
function Bdg({ p }) { const i = p === "poly"; return <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: .7, padding: "2px 6px", borderRadius: 4, background: (i ? T.green : T.blue) + "14", color: i ? T.green : T.blue }}>{i ? "POLY" : "KALSHI"}</span>; }
function PBar({ pct, price }) {
  const c = pct > 60 ? T.green : pct > 40 ? T.yellow : T.red;
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 10, color: T.muted }}><span>🔮 Swami: {pct}%</span><span>Market: {price}¢</span></div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 6, background: T.border, borderRadius: 3, overflow: "hidden", position: "relative" }}><div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 3 }} /><div style={{ position: "absolute", left: `${price}%`, top: -2, width: 2, height: 10, background: T.text, borderRadius: 1, opacity: .5 }} /></div><span style={{ fontSize: 12, fontWeight: 800, color: c, fontFamily: "monospace", minWidth: 36, textAlign: "right" }}>{pct}%</span></div>
    {pct !== price && <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: pct > price ? T.green : T.red }}>{pct > price ? `▲ +${pct - price}¢ underpriced — BUY` : `▼ ${price - pct}¢ overpriced — FADE`}</div>}
  </div>);
}

/* ══ SDR (Agentic outbound prospecting) ════════════════════════ */
function gmailComposeUrl({ to = "", subject = "", body = "" }) {
  const p = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  return "https://mail.google.com/mail/?" + p.toString();
}
function linkedinSearchUrl(q) {
  return "https://www.linkedin.com/search/results/people/?keywords=" + encodeURIComponent(q || "");
}
function reoSearchUrl(q) {
  return "https://reo.dev/?q=" + encodeURIComponent(q || "");
}

const SEGMENT_PRESETS = [
  "Crypto & politics prediction-market traders",
  "Sports-betting & DFS power users",
  "Fintech & trading-app product teams",
  "Finance / markets newsletter writers & creators",
  "Quant & data-driven retail investors",
];
const TONES = ["Sharp & confident", "Friendly & casual", "Data-driven & concise", "Playful (Swami voice)"];
const DEFAULT_PITCH = "Swami Markets is a prediction-markets oracle that analyzes Polymarket & Kalshi to surface best-value bets, cross-platform arbitrage, and an AI 'Ask Swami' that predicts any question with probabilities and reasoning.";

function prioCol(p) {
  const s = String(p || "").toLowerCase();
  return s.startsWith("high") ? T.green : s.startsWith("med") ? T.yellow : T.muted;
}

// Small copy-to-clipboard button
function CopyBtn({ text, label = "Copy" }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text || ""); setDone(true); setTimeout(() => setDone(false), 1400); } catch {}
  };
  return <button onClick={copy} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 10px", color: done ? T.green : T.soft, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{done ? "✓ Copied" : `⧉ ${label}`}</button>;
}

function SDRTab({ mob }) {
  const pad = mob ? "0 16px" : "0";
  const [mode, setMode] = useState("company"); // "company" | "segment"
  const [product, setProduct] = useState("Swami Markets");
  const [pitch, setPitch] = useState(DEFAULT_PITCH);
  const [segment, setSegment] = useState(SEGMENT_PRESETS[0]);
  const [company, setCompany] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [count, setCount] = useState(6);
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const patch = (id, upd) => setProspects(ps => ps.map(p => p._id === id ? { ...p, ...(typeof upd === "function" ? upd(p) : upd) } : p));
  const setDraftField = (id, field, val) => patch(id, p => ({ draft: { ...p.draft, [field]: val } }));
  const setLinkedinField = (id, field, val) => patch(id, p => ({ draft: { ...p.draft, linkedin: { ...(p.draft.linkedin || {}), [field]: val } } }));

  const genProspects = async () => {
    if (mode === "company" && !company.trim()) { setErr("Enter a company to target."); return; }
    setLoading(true); setErr("");
    try {
      const payload = mode === "company" ? { product, pitch, company, count } : { product, pitch, segment, count };
      const r = await fetch("/api/sdr/prospects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (d.error) { setErr(d.error); setProspects([]); }
      else {
        const list = (d.prospects || []).map((p, i) => ({ ...p, _id: `${i}-${p.name || "p"}-${Math.round((p.name || "").length + i)}`, draft: null, approved: false, drafting: false }));
        setProspects(list);
      }
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  const draftFor = async (p) => {
    setErr(""); patch(p._id, { drafting: true });
    try {
      const r = await fetch("/api/sdr/draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product, pitch, tone, prospect: p }) });
      const d = await r.json();
      if (d.error) { setErr(d.error); patch(p._id, { drafting: false }); return; }
      patch(p._id, { draft: d.draft, drafting: false, approved: false });
    } catch (e) { setErr(e.message); patch(p._id, { drafting: false }); }
  };

  const approved = prospects.filter(p => p.approved && p.draft);
  const exportApproved = () => {
    const data = approved.map(p => ({ name: p.name, title: p.title, company: p.company, personaRole: p.personaRole, linkedinQuery: p.linkedinQuery, email: { subject: p.draft.subject, body: p.draft.body, followUp: p.draft.followUp }, linkedin: p.draft.linkedin || {} }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "swami-sdr-approved.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const inputStyle = { width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 12px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontSize: 10, fontWeight: 700, letterSpacing: .8, color: T.muted, marginBottom: 6, display: "block", textTransform: "uppercase" };
  const smallInput = { width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ padding: pad }}>
      {/* HERO */}
      <div style={{ textAlign: "center", padding: mob ? "20px 8px" : "24px", marginBottom: 20, borderRadius: 18, background: `radial-gradient(ellipse at center top, ${T.blue}14, ${T.purple}06 55%, transparent 82%)`, border: `1px solid ${T.blue}22` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><SwamiMini size={mob ? 40 : 48} /></div>
        <div style={{ fontSize: mob ? 22 : 28, fontWeight: 800, color: T.blue }}>Swami SDR</div>
        <div style={{ fontSize: mob ? 12 : 13, color: T.soft, marginTop: 4, maxWidth: 540, margin: "4px auto 0" }}>Agentic outbound prospecting. Target a company, and the Swami maps who to reach, drafts a personalized email + LinkedIn connection note — you review, then send in one click.</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 10, display: "inline-block", background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 12px" }}>1️⃣ Target → 2️⃣ Find people → 3️⃣ Draft → 4️⃣ Approve → 5️⃣ Email / LinkedIn</div>
      </div>

      {/* CAMPAIGN SETUP */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: mob ? 14 : 18, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>🎯 Campaign Setup</div>
          <div style={{ display: "flex", gap: 3, background: T.bg, borderRadius: 9, padding: 3, border: `1px solid ${T.border}` }}>
            {[{ k: "company", l: "🏢 By company" }, { k: "segment", l: "🌐 By segment" }].map(m => (
              <button key={m.k} onClick={() => setMode(m.k)} style={{ background: mode === m.k ? T.hover : "transparent", border: "none", borderRadius: 7, padding: "6px 12px", color: mode === m.k ? T.text : T.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{m.l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div><label style={labelStyle}>Product</label><input value={product} onChange={e => setProduct(e.target.value)} style={inputStyle} /></div>
          {mode === "company"
            ? <div><label style={labelStyle}>Target Company</label><input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. DraftKings, Coinbase, Jane Street" style={inputStyle} /></div>
            : <div><label style={labelStyle}>Target Segment</label><input value={segment} onChange={e => setSegment(e.target.value)} list="seg-presets" style={inputStyle} /><datalist id="seg-presets">{SEGMENT_PRESETS.map(s => <option key={s} value={s} />)}</datalist></div>}
        </div>
        <div style={{ marginBottom: 14 }}><label style={labelStyle}>What it does (pitch)</label><textarea value={pitch} onChange={e => setPitch(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} /></div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "1fr 1fr auto", gap: 14, alignItems: "end" }}>
          <div><label style={labelStyle}>Tone</label><select value={tone} onChange={e => setTone(e.target.value)} style={inputStyle}>{TONES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={labelStyle}>{mode === "company" ? "People" : "Prospects"}</label><input type="number" min={1} max={10} value={count} onChange={e => setCount(e.target.value)} style={inputStyle} /></div>
          <button onClick={genProspects} disabled={loading} style={{ background: loading ? T.dim : `linear-gradient(135deg, ${T.blue}, ${T.purple})`, border: "none", borderRadius: 10, padding: "11px 18px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "wait" : "pointer", gridColumn: mob ? "1 / -1" : "auto", whiteSpace: "nowrap" }}>{loading ? "🔮 Researching…" : mode === "company" ? "🔮 Find People" : "🔮 Generate Prospects"}</button>
        </div>
      </div>

      {err && <div style={{ background: T.red + "12", border: `1px solid ${T.red}33`, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: T.red }}>{err}</div>}

      {loading && <div style={{ textAlign: "center", padding: 30 }}><CrystalBall size={90} /><div style={{ fontSize: 13, color: T.blue, marginTop: 8 }}>The Swami is researching…</div></div>}

      {/* APPROVED BAR */}
      {approved.length > 0 && <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, background: T.green + "10", border: `1px solid ${T.green}33`, borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.green }}>✓ {approved.length} contact{approved.length > 1 ? "s" : ""} approved & ready</div>
        <button onClick={exportApproved} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 14px", color: T.soft, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>⬇ Export approved (JSON)</button>
      </div>}

      {/* PROSPECTS */}
      {prospects.map(p => {
        const c = prioCol(p.priority);
        const gUrl = p.draft ? gmailComposeUrl({ subject: p.draft.subject, body: p.draft.body }) : "#";
        const liQuery = p.linkedinQuery || `${p.name || ""} ${p.company || ""}`.trim();
        const li = p.draft?.linkedin || {};
        return (
          <div key={p._id} style={{ background: T.card, border: `1px solid ${p.approved ? T.green + "55" : T.border}`, borderRadius: 14, padding: mob ? 14 : 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{p.name}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: .8, color: c, background: c + "18", padding: "2px 7px", borderRadius: 4 }}>{String(p.priority || "").toUpperCase() || "—"}</span>
                  {p.personaRole && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: .5, color: T.purple, background: T.purple + "18", padding: "2px 7px", borderRadius: 4 }}>{p.personaRole}</span>}
                </div>
                <div style={{ fontSize: 11.5, color: T.soft }}>{p.title}{p.company ? ` · ${p.company}` : ""}</div>
              </div>
              {p.approved && <span style={{ fontSize: 11, fontWeight: 700, color: T.green, flexShrink: 0 }}>✓ Approved</span>}
            </div>
            {p.fitReason && <div style={{ fontSize: 12, color: T.soft, lineHeight: 1.6, marginTop: 10 }}><span style={{ color: T.blue, fontWeight: 700 }}>Fit: </span>{p.fitReason}</div>}
            {p.hook && <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginTop: 4 }}><span style={{ color: T.orange, fontWeight: 700 }}>Hook: </span>{p.hook}</div>}

            {/* FIND-ON links */}
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <a href={linkedinSearchUrl(liQuery)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", background: "#0a66c2", borderRadius: 8, padding: "7px 12px", color: "#fff", fontSize: 11.5, fontWeight: 700 }}>in  Find on LinkedIn</a>
              <a href={reoSearchUrl(liQuery)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 12px", color: T.soft, fontSize: 11.5, fontWeight: 700 }}>◆ Find on REO.dev</a>
            </div>

            {!p.draft && <button onClick={() => draftFor(p)} disabled={p.drafting} style={{ marginTop: 12, background: `linear-gradient(135deg, ${T.orange}18, ${T.purple}18)`, border: `1px solid ${T.orange}44`, borderRadius: 8, padding: "8px 16px", color: T.orange, fontSize: 12, fontWeight: 700, cursor: p.drafting ? "wait" : "pointer" }}>{p.drafting ? "✍️ Drafting…" : "✍️ Draft Outreach"}</button>}

            {p.draft && <div style={{ marginTop: 14, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: mob ? 12 : 14 }}>
              {/* EMAIL */}
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: T.blue, marginBottom: 10 }}>✉️ COLD EMAIL</div>
              <label style={labelStyle}>Subject</label>
              <input value={p.draft.subject || ""} onChange={e => setDraftField(p._id, "subject", e.target.value)} style={{ ...smallInput, fontWeight: 600, marginBottom: 12 }} />
              <label style={labelStyle}>Body</label>
              <textarea value={p.draft.body || ""} onChange={e => setDraftField(p._id, "body", e.target.value)} rows={7} style={{ ...smallInput, color: T.soft, lineHeight: 1.6, resize: "vertical", fontFamily: "inherit" }} />
              {p.draft.followUp && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 10, fontStyle: "italic" }}><span style={{ fontWeight: 700, color: T.dim, fontStyle: "normal" }}>Follow-up: </span>{p.draft.followUp}</div>}

              {/* LINKEDIN */}
              <div style={{ height: 1, background: T.border, margin: "16px 0" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "#4f9be8" }}>in  LINKEDIN</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Connection note <span style={{ color: (li.connectionNote || "").length > 200 ? T.red : T.dim, textTransform: "none", letterSpacing: 0 }}>· {(li.connectionNote || "").length}/200</span></label>
                <CopyBtn text={li.connectionNote} label="Copy note" />
              </div>
              <textarea value={li.connectionNote || ""} onChange={e => setLinkedinField(p._id, "connectionNote", e.target.value)} rows={2} style={{ ...smallInput, color: T.soft, lineHeight: 1.5, resize: "vertical", fontFamily: "inherit", marginBottom: 12 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>First DM (after they accept)</label>
                <CopyBtn text={li.dm} label="Copy DM" />
              </div>
              <textarea value={li.dm || ""} onChange={e => setLinkedinField(p._id, "dm", e.target.value)} rows={3} style={{ ...smallInput, color: T.soft, lineHeight: 1.5, resize: "vertical", fontFamily: "inherit" }} />

              {/* ACTIONS */}
              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                <button onClick={() => patch(p._id, { approved: !p.approved })} style={{ background: p.approved ? T.green + "18" : T.green, border: p.approved ? `1px solid ${T.green}55` : "none", borderRadius: 8, padding: "8px 16px", color: p.approved ? T.green : "#04121a", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{p.approved ? "✓ Approved — undo" : "✓ Approve"}</button>
                <a href={gUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none", background: `linear-gradient(135deg, ${T.blue}, ${T.purple})`, borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 700 }}>✉️ Open in Gmail</a>
                <a href={linkedinSearchUrl(liQuery)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", background: "#0a66c2", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 700 }}>in  Connect on LinkedIn</a>
                <button onClick={() => draftFor(p)} disabled={p.drafting} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 16px", color: T.soft, fontSize: 12, fontWeight: 600, cursor: p.drafting ? "wait" : "pointer" }}>{p.drafting ? "…" : "↻ Regenerate"}</button>
              </div>
            </div>}
          </div>
        );
      })}

      {!loading && prospects.length === 0 && !err && <div style={{ textAlign: "center", padding: "30px 16px", color: T.muted, fontSize: 13 }}>{mode === "company" ? "Enter a company above and the Swami will map who to reach. 🔮" : "Set up your campaign above and let the Swami build your prospect list. 🔮"}</div>}

      <div style={{ fontSize: 10.5, color: T.dim, marginTop: 18, lineHeight: 1.7, textAlign: "center", maxWidth: 620, margin: "18px auto 0" }}>People are AI-researched target roles — verify each contact on LinkedIn / REO.dev / Apollo before outreach. Nothing sends automatically: "Open in Gmail" pre-fills a draft, and "Connect on LinkedIn" opens the search so you send the note yourself (automated LinkedIn requests violate its terms). Wire a data-source API key to auto-pull verified contacts.</div>
    </div>
  );
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
      const res = await fetch('/', {
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

  const tabs = [{ k: "home", l: "🔮 Home" }, { k: "top5", l: "🔥 Top 5" }, { k: "h2h", l: "⚔️ H2H" }, { k: "ask", l: "💬 Ask" }, { k: "all", l: "📋 All" }, { k: "sdr", l: "📈 SDR" }];
  const allM = [...POLY.map(m => ({ ...m, _p: "poly" })), ...KALSHI.map(m => ({ ...m, _p: "kalshi" }))];
  const pad = mob ? "0 16px" : "0";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", paddingBottom: "100px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: mob ? "8px 16px" : "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.sf + "ee", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: mob ? 8 : 12 }}>
          <SwamiMini size={mob ? 30 : 36} />
          <div>
            <div style={{ fontSize: mob ? 14 : 16, fontWeight: 800 }}>Swami Markets</div>
            <div style={{ fontSize: mob ? 9 : 10, color: T.dim }}><span style={{ color: T.green }}>Polymarket</span> × <span style={{ color: T.blue }}>Kalshi</span></div>
          </div>
        </div>
        {!mob && <div style={{ display: "flex", gap: 3, background: T.card, borderRadius: 10, padding: 3, border: `1px solid ${T.border}` }}>
          {tabs.map(t => <button key={t.k} onClick={() => setTab(t.k)} style={{ background: tab === t.k ? T.hover : "transparent", border: "none", borderRadius: 8, padding: "6px 12px", color: tab === t.k ? T.text : T.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{t.l}</button>)}
        </div>}
      </div>
      {mob && <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.sf, position: "sticky", top: 46, zIndex: 99 }}>
        {tabs.map(t => <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, background: "transparent", border: "none", borderBottom: tab === t.k ? `2px solid ${T.orange}` : "2px solid transparent", padding: "8px 4px", color: tab === t.k ? T.text : T.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{t.l}</button>)}
      </div>}

      <div style={{ maxWidth: 1360, margin: "0 auto", padding: mob ? "14px 0" : "16px 24px" }}>

        {/* ═══════════ HOME ═══════════ */}
        {tab === "home" && <div style={{ padding: pad }}>
          {/* HERO */}
          <div style={{ textAlign: "center", padding: mob ? "24px 16px" : "32px 32px", marginBottom: 24, borderRadius: 20, background: `radial-gradient(ellipse at center top, ${T.purple}14, ${T.orange}06 50%, transparent 80%)`, border: `1px solid ${T.orange}22` }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <SwamiCharacter size={mob ? 140 : 180} />
            </div>
            <div style={{ fontSize: mob ? 28 : 42, fontWeight: 800, color: T.orange, letterSpacing: -1 }}>The Swami</div>
            <div style={{ fontSize: mob ? 13 : 16, color: T.soft, marginTop: 4 }}>Your Prediction Markets Oracle</div>
            <div style={{ fontSize: mob ? 11 : 12, color: T.muted, marginTop: 8, maxWidth: 480, margin: "8px auto 0" }}>Data-driven predictions across Polymarket & Kalshi. Analyzing sentiment, history, and edge to find value.</div>
            
            {/* SUB FORM IN HERO */}
            <form name="waitlist" data-netlify="true" onSubmit={handleSubscribe} style={{ marginTop: 24, padding: 20, background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, maxWidth: 500, margin: "24px auto 0" }}>
              <input type="hidden" name="form-name" value="waitlist" />
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Join the Oracle Waitlist</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required style={{ flex: 1, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 14, outline: "none" }} />
                <button type="submit" disabled={subStatus === 'loading'} style={{ background: `linear-gradient(135deg, ${T.orange}, ${T.purple})`, border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: subStatus === 'loading' ? 'wait' : 'pointer' }}>
                  {subStatus === 'loading' ? '...' : 'Subscribe'}
                </button>
              </div>
              {subMsg && <div style={{ fontSize: 12, marginTop: 10, color: subStatus === 'success' ? T.green : T.red }}>{subMsg}</div>}
            </form>
            
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
              <button onClick={() => setTab("ask")} style={{ background: `linear-gradient(135deg, ${T.orange}, ${T.purple})`, border: "none", borderRadius: 12, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>💬 Ask Swami Anything</button>
              <button onClick={() => setTab("h2h")} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 20px", color: T.soft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>⚔️ Compare Platforms</button>
            </div>
          </div>

          {/* BEST OPPS */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><span style={{ fontSize: 16 }}>⚡</span><span style={{ fontSize: 14, fontWeight: 700, color: T.yellow }}>Best Bet Opportunities</span><div style={{ flex: 1, height: 1, background: T.border, marginLeft: 8 }} /></div>
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
              {OPPS.map((o, i) => <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, borderLeft: `3px solid ${o.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: o.color, background: o.color + "14", padding: "2px 6px", borderRadius: 4 }}>{o.type}</span><span style={{ fontSize: 12, fontWeight: 800, color: o.color, fontFamily: "monospace" }}>{o.edge}</span></div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 4 }}>{o.q}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{o.desc}</div>
              </div>)}
            </div>
          </div>

          {/* TOP 5 PICKS using Image */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: T.border, marginRight: 8 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>🏆 Swami's Top 5 Recommended Bets</span>
            <div style={{ flex: 1, height: 1, background: T.border, marginLeft: 8 }} />
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
             <img src="/swami-top-5.jpg" alt="Swami's Top 5 Picks" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 16, boxShadow: `0 8px 30px ${T.purple}33` }} />
          </div>

          {PICKS.map(p => {
            const sc = p.side.includes("YES") ? T.green : p.side.includes("NO") ? T.red : T.yellow;
            return (<div key={p.rank} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: mob ? 14 : 16, marginBottom: 12, backgroundImage: `linear-gradient(135deg, ${sc}06, transparent 60%)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.orange}33, ${T.purple}33)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: T.gold, fontFamily: "monospace" }}>#{p.rank}</div>
                  <div><div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{p.q}</div><div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}><span style={{ color: T.yellow, fontWeight: 700 }}>{p.cat.toUpperCase()}</span> · {p.plat}</div></div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 18, fontWeight: 800, color: sc, fontFamily: "monospace" }}>{p.side}</div><div style={{ fontSize: 10, color: T.muted }}>{p.conf}</div></div>
              </div>
              <div style={{ marginBottom: 12 }}><PBar pct={p.prob} price={p.price} /></div>
              <div style={{ fontSize: 12, color: T.soft, lineHeight: 1.6, marginBottom: 10 }}>{p.why}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{p.facts.map((f, i) => <div key={i} style={{ display: "flex", gap: 6, fontSize: 11, color: T.muted }}><span style={{ color: T.gold }}>✦</span><span>{f}</span></div>)}</div>
            </div>);
          })}
        </div>}

        {/* ═══════════ TOP 5 ═══════════ */}
        {tab === "top5" && <div style={{ padding: pad }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
             <img src="/swami-top-5.jpg" alt="Swami's Top 5 Picks" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 16, boxShadow: `0 8px 30px ${T.purple}33` }} />
          </div>
          {[{ d: POLY, pl: "poly", c: T.green, n: "Polymarket" }, { d: KALSHI, pl: "kalshi", c: T.blue, n: "Kalshi" }].map(sec => (
          <div key={sec.pl} style={{ padding: mob ? "0 0 0 16px" : 0, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, paddingRight: mob ? 16 : 0 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: sec.c }} /><span style={{ fontSize: mob ? 13 : 14, fontWeight: 700, color: sec.c }}>{sec.n}</span><span style={{ fontSize: 11, color: T.muted }}>Top 5</span><div style={{ flex: 1, height: 1, background: T.border, marginLeft: 8 }} /></div>
            <div style={mob ? { display: "flex", gap: 10, overflowX: "auto", paddingRight: 16, paddingBottom: 8 } : { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
              {sec.d.map((m, i) => <div key={m.id} onClick={() => { setSel(m); setSelP(sec.pl); }} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: mob ? 14 : 12, padding: mob ? 14 : "12px 14px", cursor: "pointer", position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: mob ? 120 : 135, minWidth: mob ? 220 : "auto", maxWidth: mob ? 240 : "none", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 24, height: 24, background: sec.c + "14", borderRadius: "0 12px 0 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: sec.c, fontFamily: "monospace" }}>{i + 1}</div>
                <div><div style={{ marginBottom: 6 }}><Price v={m.yes} /></div><div style={{ fontSize: 10, color: sec.c, fontWeight: 600, marginBottom: 3 }}>{m.label}</div><div style={{ fontSize: mob ? 12 : 11.5, fontWeight: 600, color: T.text, lineHeight: 1.4, paddingRight: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.q}</div></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.muted, marginTop: 8 }}><span>{m.vol}</span><span>24h {m.v24}</span></div>
              </div>)}
            </div>
          </div>
        ))}</div>}

        {/* ═══════════ H2H ═══════════ */}
        {tab === "h2h" && <div style={{ padding: pad }}>
          <div style={{ fontSize: mob ? 14 : 15, fontWeight: 700, marginBottom: 14 }}>⚔️ Same Bet, Two Platforms</div>
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
        </div>}

        {/* ═══════════ ASK ═══════════ */}
        {tab === "ask" && <div style={{ padding: pad }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><CrystalBall size={mob ? 100 : 130} /></div>
            <div style={{ fontSize: mob ? 22 : 28, fontWeight: 800, color: T.orange }}>Ask The Swami</div>
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
              <div style={{ fontSize: 32, fontWeight: 800, color: sCol(askPred.side), fontFamily: "monospace" }}>{askPred.side}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
                <div><div style={{ fontSize: 9, color: T.muted, letterSpacing: 1 }}>CONFIDENCE</div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{askPred.confidence}</div></div>
                <div><div style={{ fontSize: 9, color: T.muted, letterSpacing: 1 }}>PROBABILITY</div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{askPred.probability}</div></div>
              </div>
              {askPred.reasoning && <div style={{ fontSize: 12, color: T.soft, marginTop: 10, fontStyle: "italic" }}>"{askPred.reasoning}"</div>}
            </div>
            <div style={{ fontSize: 12.5, color: T.soft, lineHeight: 1.75 }}>{askAns}</div>
          </div>}
          {askHist.length > 0 && <div><div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: 1, marginBottom: 8 }}>RECENT</div>{askHist.map((h, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 4 }}><span style={{ fontSize: 11, fontWeight: 800, color: sCol(h.side), fontFamily: "monospace", minWidth: 65 }}>{h.side}</span><span style={{ fontSize: 11, color: T.muted, minWidth: 32 }}>{h.probability}</span><span style={{ fontSize: 12, color: T.soft, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.q}</span></div>)}</div>}
          {!askPred && !askLd && <div><div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>Try asking:</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{["Will Trump run in 2028?", "Bitcoin $200K by 2027?", "AI replace engineers?", "Lakers NBA title?", "US recession 2027?"].map(s => <button key={s} onClick={() => setAskQ(s)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", color: T.soft, fontSize: 11, cursor: "pointer" }}>{s}</button>)}</div></div>}
        </div>}

        {/* ═══════════ ALL ═══════════ */}
        {tab === "all" && <div style={{ padding: pad }}>
          <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            {allM.map(m => <div key={m.id} onClick={() => { setSel(m); setSelP(m._p); }} style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}><Bdg p={m._p} /><span style={{ fontSize: 9, color: T.dim, textTransform: "uppercase" }}>{m.cat}</span></div><div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.35 }}>{m.q}</div></div>
                <Price v={m.yes} s="sm" />
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 10, color: T.muted }}><span>{m.vol}</span><span>24h {m.v24}</span></div>
            </div>)}
          </div>
        </div>}

        {/* ═══════════ SDR ═══════════ */}
        {tab === "sdr" && <SDRTab mob={mob} />}
      </div>

      {/* Detail Modal / Sheet */}
      {sel && <>
        <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", zIndex: 199 }} />
        <div style={mob ? { position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `2px solid ${selP === "poly" ? T.green : T.blue}`, borderRadius: "20px 20px 0 0", padding: "16px 20px 32px", zIndex: 200, maxHeight: "70vh", overflowY: "auto" } : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 440, background: T.card, borderTop: `4px solid ${selP === "poly" ? T.green : T.blue}`, borderRadius: 24, padding: "24px", zIndex: 200, maxHeight: "85vh", overflowY: "auto", boxShadow: `0 20px 60px rgba(0,0,0,0.8)` }}>
          {mob && <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border, margin: "0 auto 14px" }} />}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><Bdg p={selP} /><button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: T.muted, fontSize: 20, cursor: "pointer" }}>✕</button></div>
          <div style={{ fontSize: mob ? 16 : 18, fontWeight: 700, color: T.text, lineHeight: 1.4, marginBottom: 16 }}>{sel.q}</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, background: T.green + "14", borderRadius: 12, padding: 12, textAlign: "center" }}><div style={{ fontSize: 9, color: T.green, fontWeight: 700 }}>YES</div><div style={{ fontSize: 28, fontWeight: 800, color: T.green, fontFamily: "monospace" }}>{(sel.yes * 100).toFixed(0)}¢</div></div>
            <div style={{ flex: 1, background: T.red + "14", borderRadius: 12, padding: 12, textAlign: "center" }}><div style={{ fontSize: 9, color: T.red, fontWeight: 700 }}>NO</div><div style={{ fontSize: 28, fontWeight: 800, color: T.red, fontFamily: "monospace" }}>{((1 - sel.yes) * 100).toFixed(0)}¢</div></div>
          </div>
          <a href={`https://${selP === "poly" ? "polymarket.com" : "kalshi.com"}`} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none", background: `linear-gradient(135deg, ${selP === "poly" ? "#00c896" : "#2e7cf6"}, ${T.purple})`, color: "#fff", textAlign: "center", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Place Trade on {selP === "poly" ? "Polymarket" : "Kalshi"} ⚡
          </a>
        </div>
      </>}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}input::placeholder{color:${T.dim}}::-webkit-scrollbar{width:5px;height:0}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
