"use client";
import Link from "next/link";

export function Shell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(124,58,237,0.25), transparent 60%)," +
          "radial-gradient(900px 500px at 100% 0%, rgba(255,140,66,0.18), transparent 60%)," +
          "#060710",
        color: "#e6e8f0",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky",
          top: 0,
          backdropFilter: "blur(10px)",
          background: "rgba(6,7,16,0.75)",
          zIndex: 10,
        }}
      >
        <Link
          href="/clawdbot"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#e6e8f0" }}
        >
          <BotMark size={32} />
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.3 }}>
            Clawd<span style={{ color: "#ff8c42" }}>bot</span>
          </span>
        </Link>
        <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/clawdbot" style={linkStyle}>Gallery</Link>
          <Link href="/clawdbot/new" style={primaryLinkStyle}>+ New bot</Link>
          <Link href="/" style={subtleLinkStyle}>Swami</Link>
        </nav>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>{children}</main>
      <footer style={{ padding: "24px", textAlign: "center", color: "#6b7280", fontSize: 13 }}>
        Built with Claude · your bots are saved in this browser only
      </footer>
    </div>
  );
}

export function BotMark({ size = 40, color = "#a855f7" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#ff8c42" />
        </linearGradient>
      </defs>
      <rect x="8" y="14" width="48" height="38" rx="12" fill="url(#cbg)" />
      <circle cx="32" cy="10" r="3" fill="#ffd700" />
      <line x1="32" y1="10" x2="32" y2="16" stroke="#ffd700" strokeWidth="2" />
      <circle cx="24" cy="32" r="4" fill="#0a0a12" />
      <circle cx="40" cy="32" r="4" fill="#0a0a12" />
      <circle cx="25" cy="31" r="1.4" fill="#fff" />
      <circle cx="41" cy="31" r="1.4" fill="#fff" />
      <rect x="24" y="42" width="16" height="3" rx="1.5" fill="#0a0a12" />
    </svg>
  );
}

const linkStyle = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontSize: 14,
  padding: "8px 12px",
  borderRadius: 8,
};

const primaryLinkStyle = {
  ...linkStyle,
  color: "#fff",
  background: "linear-gradient(135deg, #7c3aed, #ff8c42)",
  fontWeight: 600,
};

const subtleLinkStyle = {
  ...linkStyle,
  color: "#94a3b8",
  fontSize: 13,
};

export function Card({ children, style }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
