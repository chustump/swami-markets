"use client";
import Link from "next/link";
import { SwamiMini } from "./Swami";
import { T, FONT } from "../lib/theme";

// items: [{ k, l, href? }]. Items with href are links; the rest call onPick(k).
export default function SiteHeader({ items, active, onPick, mob }) {
  const base = { border: "none", background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: mob ? 11 : 12, textDecoration: "none", whiteSpace: "nowrap", fontFamily: FONT.body };
  const item = (t) => {
    const on = active === t.k;
    const style = mob
      ? { ...base, flex: "1 0 auto", textAlign: "center", padding: "10px 10px", color: on ? T.gold : T.muted, borderBottom: `2px solid ${on ? T.gold : "transparent"}` }
      : { ...base, padding: "7px 13px", borderRadius: 999, color: on ? "#2a1400" : T.soft, background: on ? `linear-gradient(135deg,#ffe08a,${T.gold})` : "transparent" };
    return t.href
      ? <Link key={t.k} href={t.href} style={style}>{t.l}</Link>
      : <button key={t.k} onClick={() => onPick(t.k)} style={style}>{t.l}</button>;
  };
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#0b0716e6", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mob ? "8px 14px" : "10px 24px", maxWidth: 1360, margin: "0 auto" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: T.text }}>
          <SwamiMini size={mob ? 30 : 36} />
          <div>
            <div style={{ fontFamily: FONT.display, fontSize: mob ? 16 : 19, fontWeight: 700, lineHeight: 1.1 }}>Swami Says</div>
            <div style={{ fontSize: 10, color: T.muted, letterSpacing: 0.4 }}>prediction markets oracle</div>
          </div>
        </Link>
        {!mob && <nav style={{ display: "flex", gap: 2, background: "#ffffff08", borderRadius: 999, padding: 3, border: `1px solid ${T.border}` }}>{items.map(item)}</nav>}
      </div>
      {mob && <nav style={{ display: "flex", overflowX: "auto", borderTop: `1px solid ${T.border}` }}>{items.map(item)}</nav>}
    </header>
  );
}
