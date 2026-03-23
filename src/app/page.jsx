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
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: `You are "The Swami." Analyze (Mar 2026): ${pair.topic} (${pair.cat})\nPoly: YES ${(pair.poly.yes * 100).toFixed(0)}¢ Vol ${pair.poly.vol}\nKalshi: YES ${(pair.kalshi.yes * 100).toFixed(0)}¢ Vol ${pair.kalshi.vol}\nSpread: ${pair.spread}¢\n\nJSON no backticks:\n{"side":"YES/NO/LEAN YES/LEAN NO","confidence":"High/Medium/Low","reasoning":"One sentence","analysis":"📊 OVERVIEW\\\n📱 SENTIMENT\\\n📈 HISTORY\\\n🎯 EDGE\\\n⚠️ RISKS"}` }] }) });
      const d = await r.json(); const raw = (d.content || []).map(b => b.text || "").join("");
      try { const p = JSON.parse(raw.replace(/```json|```/g, "").trim()); setSpr(p); setSt(p.analysis); } catch { setSt(raw); }
    } catch (e) { setSt("Error: " + e.message); } finally { setSl(false); }
  }, []);

  const askSwami = useCallback(async () => {
    if (!askQ.trim() || askLd) return; setAskLd(true); setAskAns(""); setAskPred(null);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, messages: [{ role: "user", content: `You are "The Swami" — prediction oracle.\nPredict: "${askQ.trim()}"\nJSON no backticks:\n{"side":"YES/NO/LEAN YES/LEAN NO/TOSS-UP","confidence":"High/Medium/Low","probability":"XX%","reasoning":"One sentence","analysis":"4-6 sentences: smart money, history, social sentiment, your take."}` }] }) });
      const d = await r.json(); const raw = (d.content || []).map(b => b.text || "").join("");
      try { const p = JSON.parse(raw.replace(/```json|```/g, "").trim()); setAskPred(p); setAskAns(p.analysis); setAskHist(h => [{ q: askQ.trim(), side: p.side, probability: p.probability }, ...h.slice(0, 9)]); }
      catch { setAskAns(raw); setAskPred({ side: "???", confidence: "—", probability: "—", reasoning: "Crystal ball fuzzy" }); }
    } catch (e) { setAskAns("Error: " + e.message); } finally { setAskLd(false); }
  }, [askQ, askLd]);

  const tabs = [{ k: "home", l: "🔮 Home" }, { k: "top5", l: "🔥 Top 5" }, { k: "h2h", l: "⚔️ H2H" }, { k: "ask", l: "💬 Ask" }, { k: "all", l: "📋 All" }];
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
          <div style={{ textAlign: "center", padding: mob ? "20px 12px" : "28px 24px", marginBottom: 20, borderRadius: 20, background: `radial-gradient(ellipse at center top, ${T.purple}18, ${T.orange}08 50%, transparent 80%)`, border: `1px solid ${T.orange}22` }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SwamiCharacter size={mob ? 140 : 180} />
            </div>
            <div style={{ fontSize: mob ? 26 : 36, fontWeight: 800, color: T.orange, letterSpacing: -1, marginTop: 8 }}>The Swami</div>
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
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
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
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img src="/ask-swami.jpg" alt="Ask The Swami" style={{ maxWidth: "100%", maxHeight: 350, borderRadius: 16, boxShadow: `0 10px 40px ${T.purple}44` }} />
            </div>
            <div style={{ fontSize: 14, color: T.soft, marginTop: 16 }}>The Swami will predict any outcome with probability and reasoning.</div>
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
      </div>

      {/* Mobile detail sheet */}
      {mob && sel && <>
        <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 199 }} />
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `2px solid ${selP === "poly" ? T.green : T.blue}`, borderRadius: "20px 20px 0 0", padding: "16px 20px 32px", zIndex: 200, maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border, margin: "0 auto 14px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><Bdg p={selP} /><button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: T.muted, fontSize: 20, cursor: "pointer" }}>✕</button></div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, lineHeight: 1.4, marginBottom: 14 }}>{sel.q}</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, background: T.green + "14", borderRadius: 12, padding: 12, textAlign: "center" }}><div style={{ fontSize: 9, color: T.green, fontWeight: 700 }}>YES</div><div style={{ fontSize: 28, fontWeight: 800, color: T.green, fontFamily: "monospace" }}>{(sel.yes * 100).toFixed(0)}¢</div></div>
            <div style={{ flex: 1, background: T.red + "14", borderRadius: 12, padding: 12, textAlign: "center" }}><div style={{ fontSize: 9, color: T.red, fontWeight: 700 }}>NO</div><div style={{ fontSize: 28, fontWeight: 800, color: T.red, fontFamily: "monospace" }}>{((1 - sel.yes) * 100).toFixed(0)}¢</div></div>
          </div>
        </div>
      </>}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}input::placeholder{color:${T.dim}}::-webkit-scrollbar{width:5px;height:0}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
