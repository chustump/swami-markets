"use client";
import { useState, useEffect } from "react";

/* ══════════════════════════════════════════════════════════════
   SimpliGen product page — Gumroad-style landing
   Buy flow stays on the official Gumroad listing.
   ══════════════════════════════════════════════════════════════ */

const BUY_URL = "https://simpligen.gumroad.com/l/simpligen";
const SITE_URL = "https://www.simpligen.io/";

/* ══ Theme ═════════════════════════════════════════════════════ */
const G = {
  bg: "#F4F4F0", card: "#ffffff", ink: "#000000", soft: "#3b3b3b", muted: "#6b6b6b",
  line: "#000000", pink: "#FF90E8", mint: "#23A094", lilac: "#C2AAFF", sun: "#FFC900",
};
const BOX = { border: `1px solid ${G.line}`, borderRadius: 4, background: G.card };
const SHADOW = { boxShadow: `4px 4px 0 ${G.ink}` };

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const f = () => setM(window.innerWidth < 900);
    f(); window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return m;
}

/* ══ Data ══════════════════════════════════════════════════════ */
const WIZARD = [
  { n: "1", t: "The Subject", d: "Define your core vision. Describe what you want in plain language — no node graph, no spaghetti wiring.", c: G.pink },
  { n: "2", t: "The Style", d: "Choose from the curated Preset Store — API Core, Local Quality and more. The preset picks the workflow and the model for you.", c: G.lilac },
  { n: "3", t: "The Shot", d: "Dial in camera body, lens, lighting source and atmosphere. The wizard writes the prompt structure so you direct instead of debug.", c: G.mint },
];

const FEATURES = [
  { t: "Low-VRAM optimiser", d: "Run high-end local models like LTX 2.3 on as little as 8GB of NVIDIA VRAM." },
  { t: "Environment set up for you", d: "Python, PyTorch, CUDA and ComfyUI are installed and wired up by the app — no dependency hunting." },
  { t: "Preset Store", d: "Curated preset packs handle workflow, model and prompt structure so you just describe the result." },
  { t: "Local or SimpliGen Cloud", d: "Both run the same preset packs. Generate on your own GPU, or in the cloud from any modern machine." },
  { t: "Lifetime updates", d: "Updates ship automatically inside the app and your licence carries forward. No subscription, ever." },
  { t: "Active Discord", d: "The developers are in the official Discord daily, helping users and folding suggestions straight into the app." },
];

const MODELS = ["MiniMax H3", "LTX 2.3", "LTX 2.5", "WAN 2.2", "WAN 2.2 Animate", "Z-Image", "Flux 2", "HiDream"];

const REQS = [
  {
    head: "Local generation", accent: G.mint, rows: [
      ["GPU", "NVIDIA RTX 20-series or newer. GTX 10-series and older are not supported by the engine's PyTorch build."],
      ["VRAM", "8GB covers image presets and the lighter video presets. Video presets and larger models are happier with 12–16GB+."],
      ["System RAM", "16GB"],
      ["Disk", "~30GB+ free, ideally on an SSD — the models are large."],
    ],
  },
  {
    head: "SimpliGen Cloud", accent: G.lilac, rows: [
      ["GPU", "None required."],
      ["Machine", "Any modern computer."],
      ["Presets", "The same preset packs as local generation."],
      ["Disk", "No local model downloads needed."],
    ],
  },
];

const FAQ = [
  { q: "Is this a subscription?", a: "No. SimpliGen is a one-time purchase with lifetime updates — buy once, own forever, no monthly fee." },
  { q: "How is this different from ComfyUI?", a: "SimpliGen turns the chaos of ComfyUI node graphs into three simple steps, and sets up Python, PyTorch, CUDA and ComfyUI for you. You get ComfyUI-class outcomes with normal app UX." },
  { q: "My GPU only has 8GB of VRAM. Will it work?", a: "Yes. The low-VRAM optimiser is built for exactly that — it lets high-end local models such as LTX 2.3 run on 8GB NVIDIA cards. Heavier video presets still benefit from 12–16GB+." },
  { q: "Can I use it without a GPU?", a: "Yes, through SimpliGen Cloud. It runs the same preset packs and works on any modern machine with no GPU required." },
  { q: "Where do I get support?", a: "The official SimpliGen Discord. The developers are active there daily." },
  { q: "Where is it safe to buy?", a: "The only official site is simpligen.io and the only official place to buy is the linked Gumroad listing." },
];

/* ══ Preview artwork ═══════════════════════════════════════════ */
function AppPreview() {
  return (
    <svg viewBox="0 0 640 400" style={{ display: "block", width: "100%", height: "auto" }} role="img" aria-label="SimpliGen three-step wizard interface preview">
      <defs>
        <linearGradient id="sgSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b1030" /><stop offset="55%" stopColor="#3b1d5e" /><stop offset="100%" stopColor="#0e1630" />
        </linearGradient>
        <linearGradient id="sgBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={G.pink} /><stop offset="100%" stopColor={G.lilac} />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#sgSky)" />
      {/* window chrome */}
      <rect x="24" y="24" width="592" height="352" rx="8" fill="#0d0d16" stroke="#2a2a3d" />
      <rect x="24" y="24" width="592" height="34" rx="8" fill="#16161f" />
      <rect x="24" y="50" width="592" height="8" fill="#16161f" />
      <circle cx="46" cy="41" r="5" fill="#ff5f57" /><circle cx="64" cy="41" r="5" fill="#febc2e" /><circle cx="82" cy="41" r="5" fill="#28c840" />
      <text x="320" y="45" textAnchor="middle" fill="#8b8ba7" fontSize="12" fontFamily="system-ui" fontWeight="600">SimpliGen</text>
      {/* step rail */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={48} y={82 + i * 62} width="200" height="48" rx="6" fill={i === 0 ? "#241a3a" : "#14141f"} stroke={i === 0 ? G.pink : "#2a2a3d"} />
          <circle cx={72} cy={106 + i * 62} r="11" fill={[G.pink, G.lilac, G.mint][i]} />
          <text x={72} y={110 + i * 62} textAnchor="middle" fill="#0d0d16" fontSize="12" fontFamily="system-ui" fontWeight="800">{i + 1}</text>
          <text x={94} y={102 + i * 62} fill="#e6e6f2" fontSize="12" fontFamily="system-ui" fontWeight="700">{["The Subject", "The Style", "The Shot"][i]}</text>
          <rect x={94} y={110 + i * 62} width={[120, 96, 108][i]} height="6" rx="3" fill="#3a3a52" />
        </g>
      ))}
      <rect x={48} y={272} width="200" height="40" rx="6" fill="url(#sgBar)" />
      <text x={148} y={297} textAnchor="middle" fill="#0d0d16" fontSize="13" fontFamily="system-ui" fontWeight="800">Generate</text>
      <text x={48} y={336} fill="#6b6b8a" fontSize="11" fontFamily="system-ui">Low-VRAM optimiser: ON · 8GB</text>
      {/* canvas */}
      <rect x="272" y="82" width="320" height="230" rx="6" fill="#0a0a12" stroke="#2a2a3d" />
      <circle cx="432" cy="168" r="52" fill={G.lilac} opacity="0.32" />
      <circle cx="470" cy="206" r="70" fill={G.pink} opacity="0.22" />
      <circle cx="392" cy="214" r="46" fill={G.mint} opacity="0.26" />
      <path d="M272 268 L352 216 L420 258 L488 200 L592 262 L592 312 L272 312 Z" fill="#0f1a2e" opacity="0.9" />
      <rect x="272" y="82" width="320" height="230" rx="6" fill="none" stroke="#2a2a3d" />
      <rect x="288" y="284" width="288" height="14" rx="7" fill="#1a1a28" />
      <rect x="288" y="284" width="196" height="14" rx="7" fill={G.mint} opacity="0.85" />
      <text x="272" y="336" fill="#6b6b8a" fontSize="11" fontFamily="system-ui">Preset: Local Quality · Model handled for you</text>
    </svg>
  );
}

/* ══ Bits ══════════════════════════════════════════════════════ */
function Pill({ children, bg }) {
  return (
    <span style={{ ...BOX, background: bg || G.card, padding: "4px 10px", fontSize: 12, fontWeight: 700, display: "inline-block" }}>
      {children}
    </span>
  );
}

function Section({ title, kicker, children }) {
  return (
    <section style={{ marginTop: 56 }}>
      {kicker && <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: G.muted, marginBottom: 8 }}>{kicker}</div>}
      <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 20px", letterSpacing: -0.5 }}>{title}</h2>
      {children}
    </section>
  );
}

function BuyButton({ full, invert }) {
  return (
    <a
      href={BUY_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...BOX, ...SHADOW, background: invert ? G.ink : G.pink, color: invert ? "#ffffff" : G.ink,
        display: "block", textAlign: "center",
        padding: "16px 20px", fontSize: 17, fontWeight: 800, textDecoration: "none",
        width: full ? "100%" : undefined, boxSizing: "border-box",
      }}
    >
      I want this! →
    </a>
  );
}

/* ══ Page ══════════════════════════════════════════════════════ */
export default function SimpliGenPage() {
  const mob = useIsMobile();
  const [open, setOpen] = useState(0);

  return (
    <main style={{ background: G.bg, color: G.ink, minHeight: "100vh", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* nav */}
      <nav style={{ borderBottom: `1px solid ${G.line}`, background: G.card, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...BOX, background: G.pink, width: 28, height: 28, display: "grid", placeItems: "center", fontWeight: 900, fontSize: 15 }}>S</span>
          <span style={{ fontWeight: 800, fontSize: 17 }}>SimpliGen</span>
        </div>
        <a href={SITE_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 700, color: G.ink }}>simpligen.io</a>
      </nav>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: mob ? "28px 16px 72px" : "40px 24px 96px" }}>
        {/* hero */}
        <div style={{ display: mob ? "block" : "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>
          <div>
            <div style={{ ...BOX, ...SHADOW, overflow: "hidden", padding: 0 }}>
              <AppPreview />
            </div>
            <h1 style={{ fontSize: mob ? 32 : 42, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.1, margin: "28px 0 12px" }}>
              SimpliGen
            </h1>
            <p style={{ fontSize: mob ? 17 : 20, lineHeight: 1.5, color: G.soft, margin: "0 0 18px" }}>
              ComfyUI outcomes with normal SaaS UX. A low-VRAM AI studio for generating video and images
              locally — built for people who find AI tools overwhelming.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Pill bg={G.sun}>One-time purchase</Pill>
              <Pill bg={G.mint + "33"}>Runs locally</Pill>
              <Pill bg={G.lilac + "55"}>8GB VRAM minimum</Pill>
              <Pill>Lifetime updates</Pill>
            </div>
          </div>

          {/* buy box */}
          <aside style={{ ...BOX, ...SHADOW, padding: 20, marginTop: mob ? 28 : 0, position: mob ? "static" : "sticky", top: 24 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1.5 }}>$50</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: G.muted }}>once</span>
            </div>
            <p style={{ fontSize: 13, color: G.muted, margin: "6px 0 18px" }}>
              No subscription. Buy once, own forever.
            </p>
            <BuyButton full />
            <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", fontSize: 14, lineHeight: 1.7 }}>
              {[
                "Lifetime updates, shipped in-app",
                "Local generation on your own GPU",
                "SimpliGen Cloud — no GPU needed",
                "Official Discord support",
              ].map((x) => (
                <li key={x} style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: G.mint, fontWeight: 800 }}>✓</span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 12, color: G.muted, margin: "16px 0 0", lineHeight: 1.5 }}>
              Checkout is handled on Gumroad, the only official place to buy.
            </p>
          </aside>
        </div>

        {/* description */}
        <Section kicker="What it is" title="Three steps instead of a node graph">
          <p style={{ fontSize: 17, lineHeight: 1.65, color: G.soft, maxWidth: 760, margin: "0 0 14px" }}>
            SimpliGen turns the chaos of ComfyUI node graphs into three simple steps, and sets up Python,
            PyTorch, CUDA and ComfyUI for you. The wizard handles the workflow, the model and the prompt
            structure — you just describe what you want.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: G.soft, maxWidth: 760, margin: 0 }}>
            The 3-step Prompt Builder turns you into a cinematographer rather than a graph technician.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 16, marginTop: 24 }}>
            {WIZARD.map((s) => (
              <div key={s.n} style={{ ...BOX, ...SHADOW, padding: 18 }}>
                <div style={{ ...BOX, background: s.c, width: 32, height: 32, display: "grid", placeItems: "center", fontWeight: 900, marginBottom: 12 }}>{s.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 8px" }}>{s.t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: G.soft, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* features */}
        <Section kicker="What's included" title="Everything in the box">
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.t} style={{ ...BOX, padding: 18 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>{f.t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: G.soft, margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* models */}
        <Section kicker="Supported models" title="Local and Cloud run the same preset packs">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {MODELS.map((m) => <Pill key={m} bg={G.card}>{m}</Pill>)}
          </div>
        </Section>

        {/* requirements */}
        <Section kicker="Before you buy" title="System requirements">
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
            {REQS.map((r) => (
              <div key={r.head} style={{ ...BOX, ...SHADOW, padding: 0, overflow: "hidden" }}>
                <div style={{ background: r.accent, borderBottom: `1px solid ${G.line}`, padding: "12px 18px", fontWeight: 800, fontSize: 15 }}>{r.head}</div>
                <div style={{ padding: 18 }}>
                  {r.rows.map(([k, v]) => (
                    <div key={k} style={{ display: mob ? "block" : "grid", gridTemplateColumns: "110px 1fr", gap: 10, padding: "8px 0", borderTop: `1px solid #e6e6e0` }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: G.muted, display: mob ? "block" : "inline", marginBottom: mob ? 2 : 0 }}>{k}</span>
                      <span style={{ fontSize: 14, lineHeight: 1.55, color: G.soft }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* faq */}
        <Section kicker="Questions" title="FAQ">
          <div style={{ ...BOX, overflow: "hidden" }}>
            {FAQ.map((f, i) => (
              <div key={f.q} style={{ borderTop: i === 0 ? "none" : `1px solid ${G.line}` }}>
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  aria-expanded={open === i}
                  style={{ width: "100%", textAlign: "left", background: open === i ? G.bg : G.card, border: "none", padding: "16px 18px", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "space-between", gap: 12, color: G.ink, fontFamily: "inherit" }}
                >
                  <span>{f.q}</span>
                  <span style={{ color: G.muted }}>{open === i ? "−" : "+"}</span>
                </button>
                {open === i && (
                  <p style={{ margin: 0, padding: "0 18px 18px", fontSize: 15, lineHeight: 1.65, color: G.soft }}>{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* closing cta */}
        <section style={{ ...BOX, ...SHADOW, background: G.pink, padding: mob ? 24 : 36, marginTop: 56, textAlign: "center" }}>
          <h2 style={{ fontSize: mob ? 26 : 32, fontWeight: 800, letterSpacing: -0.8, margin: "0 0 10px" }}>Stop debugging graphs. Start generating.</h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: "0 auto 22px", maxWidth: 520 }}>
            $50 once, lifetime updates, and a Discord where the developers actually answer.
          </p>
          <div style={{ display: "inline-block", minWidth: 240 }}><BuyButton full invert /></div>
        </section>

        <footer style={{ marginTop: 40, fontSize: 13, lineHeight: 1.7, color: G.muted }}>
          <p style={{ margin: 0 }}>
            The only official site is <a href={SITE_URL} target="_blank" rel="noopener noreferrer" style={{ color: G.ink, fontWeight: 700 }}>simpligen.io</a>,
            and the only official distribution is the <a href={BUY_URL} target="_blank" rel="noopener noreferrer" style={{ color: G.ink, fontWeight: 700 }}>Gumroad listing</a>.
            SimpliGen is not affiliated with ComfyUI.
          </p>
        </footer>
      </div>
    </main>
  );
}
