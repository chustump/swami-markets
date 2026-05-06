"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Shell, Card } from "../_components/Shell";

const DEFAULT_PRODUCT =
  "Insights — AI-powered prediction-market intelligence (Polymarket × Kalshi). We surface mispriced contracts, sentiment shifts, and edge opportunities for traders, hedge funds, and research desks.";
const DEFAULT_ICP =
  "Quant analysts, prop traders, hedge fund researchers, crypto/macro funds, betting/trading newsletter writers, and B2B clients in event-driven research.";

const STATUS_MESSAGES = [
  "Profiling the ideal customer…",
  "Searching the web for matches…",
  "Cross-referencing news and filings…",
  "Hunting for decision-makers…",
  "Scoring fit and outreach angle…",
  "Compiling sources…",
];

export default function LeadHunterPage() {
  const [product, setProduct] = useState(DEFAULT_PRODUCT);
  const [icp, setIcp] = useState(DEFAULT_ICP);
  const [geography, setGeography] = useState("United States");
  const [count, setCount] = useState(5);

  const [running, setRunning] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState([]);
  const [log, setLog] = useState([]);
  const [summary, setSummary] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const tickRef = useRef(null);

  useEffect(() => {
    if (running) {
      tickRef.current = setInterval(() => {
        setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length);
      }, 2200);
      return () => clearInterval(tickRef.current);
    }
  }, [running]);

  async function run() {
    if (running) return;
    setError("");
    setLeads([]);
    setLog([]);
    setSummary("");
    setStatusIdx(0);
    setRunning(true);
    setHasRun(true);
    try {
      const r = await fetch("/api/clawdbot/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, icp, geography, count }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Agent failed");
      setLeads(data.leads || []);
      setLog(data.log || []);
      setSummary(data.summary || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  }

  function exportCSV() {
    if (leads.length === 0) return;
    const cols = [
      "company",
      "website",
      "contact_name",
      "contact_title",
      "contact_hint",
      "score",
      "why_relevant",
      "outreach_angle",
      "sources",
    ];
    const esc = (v) => {
      const s = Array.isArray(v) ? v.join(" | ") : String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      cols.join(","),
      ...leads.map((l) => cols.map((c) => esc(l[c])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clawdbot-leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Shell>
      <div style={{ marginBottom: 16 }}>
        <Link href="/clawdbot" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14 }}>
          ← Back to gallery
        </Link>
      </div>

      <section style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 14px",
            borderRadius: 999,
            background: "rgba(34,211,238,0.12)",
            border: "1px solid rgba(34,211,238,0.35)",
            fontSize: 12,
            letterSpacing: 0.4,
            color: "#67e8f9",
            marginBottom: 14,
          }}
        >
          AGENT · CLAUDE TOOL USE
        </div>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 900,
            margin: "0 0 10px",
            letterSpacing: -1,
            background: "linear-gradient(135deg, #fff 10%, #22d3ee 60%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Lead Hunter 🎯
        </h1>
        <p style={{ color: "#94a3b8", marginTop: 0, maxWidth: 700 }}>
          An autonomous agent that searches the web, profiles companies, identifies decision-makers,
          and saves qualified leads for your <em>Insights</em> product. Powered by Claude with tool use.
        </p>
      </section>

      <Card style={{ marginBottom: 24 }}>
        <Field label="Product / service to sell">
          <textarea
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            rows={3}
            style={inputStyle}
          />
        </Field>
        <Field
          label="Ideal customer profile"
          hint="Roles, industries, signals that say 'they need this'."
        >
          <textarea
            value={icp}
            onChange={(e) => setIcp(e.target.value)}
            rows={3}
            style={inputStyle}
          />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
          <Field label="Geography">
            <input
              type="text"
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
              style={inputStyle}
              placeholder="e.g. United States, EU, Worldwide"
            />
          </Field>
          <Field label="Number of leads">
            <input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              style={inputStyle}
            />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
          <button
            type="button"
            onClick={run}
            disabled={running}
            style={{
              padding: "12px 22px",
              borderRadius: 10,
              background: running
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(135deg, #22d3ee, #7c3aed 60%, #ff8c42)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: running ? "default" : "pointer",
            }}
          >
            {running ? "Hunting…" : "🚀 Run agent"}
          </button>
          {running && (
            <div style={{ color: "#67e8f9", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Spinner /> {STATUS_MESSAGES[statusIdx]}
            </div>
          )}
          {!running && hasRun && leads.length > 0 && (
            <button type="button" onClick={exportCSV} style={ghostButtonStyle}>
              ⬇ Export CSV
            </button>
          )}
        </div>

        {error && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}
      </Card>

      {hasRun && !running && leads.length === 0 && !error && (
        <Card style={{ textAlign: "center", color: "#94a3b8" }}>
          The agent finished without saving any leads. Try refining the ICP or geography.
        </Card>
      )}

      {leads.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Leads</h2>
            <span style={{ color: "#94a3b8", fontSize: 14 }}>{leads.length} found</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {leads
              .slice()
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .map((lead, i) => (
                <LeadCard key={i} lead={lead} />
              ))}
          </div>
        </section>
      )}

      {summary && (
        <Card style={{ marginBottom: 24, borderColor: "rgba(34,211,238,0.3)" }}>
          <div style={{ fontSize: 13, color: "#67e8f9", fontWeight: 700, marginBottom: 6 }}>
            AGENT SUMMARY
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {summary}
          </div>
        </Card>
      )}

      {log.length > 0 && (
        <details style={{ marginBottom: 24 }}>
          <summary
            style={{
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: 14,
              padding: "8px 12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
            }}
          >
            Agent activity log ({log.length} events)
          </summary>
          <Card style={{ marginTop: 8, maxHeight: 360, overflowY: "auto" }}>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {log.map((entry, i) => (
                <LogRow key={i} entry={entry} />
              ))}
            </ul>
          </Card>
        </details>
      )}
    </Shell>
  );
}

function LeadCard({ lead }) {
  const score = lead.score || 0;
  const scoreColor = score >= 8 ? "#10b981" : score >= 5 ? "#eab308" : "#94a3b8";
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${scoreColor}, #7c3aed)`,
            color: "#0a0a12",
            fontWeight: 900,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {score}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer noopener"
                style={{ color: "#fff", textDecoration: "none", borderBottom: "1px dashed rgba(255,255,255,0.3)" }}
              >
                {lead.company}
              </a>
            ) : (
              lead.company
            )}
          </div>
          {(lead.contact_name || lead.contact_title) && (
            <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 2 }}>
              {[lead.contact_name, lead.contact_title].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <Row label="Why relevant">{lead.why_relevant}</Row>
        {lead.outreach_angle && <Row label="Outreach angle">{lead.outreach_angle}</Row>}
        {lead.contact_hint && <Row label="Reach via">{lead.contact_hint}</Row>}
        {lead.sources && lead.sources.length > 0 && (
          <Row label="Sources">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {lead.sources.map((s, i) => (
                <a
                  key={i}
                  href={s}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{
                    color: "#67e8f9",
                    fontSize: 12,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s}
                </a>
              ))}
            </div>
          </Row>
        )}
      </div>
    </Card>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10, alignItems: "start" }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4, paddingTop: 2 }}>
        {label}
      </div>
      <div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function LogRow({ entry }) {
  const map = {
    thought: { color: "#cbd5e1", icon: "💭", label: "thinking" },
    search: { color: "#67e8f9", icon: "🔎", label: "web_search" },
    search_result: { color: "#94a3b8", icon: "📄", label: "results" },
    lead: { color: "#10b981", icon: "✅", label: "saved lead" },
    finish: { color: "#a855f7", icon: "🏁", label: "finished" },
    warn: { color: "#fbbf24", icon: "⚠️", label: "warn" },
    error: { color: "#fca5a5", icon: "🛑", label: "error" },
  };
  const meta = map[entry.type] || { color: "#94a3b8", icon: "•", label: entry.type };
  let body = "";
  if (entry.type === "thought") body = entry.text;
  else if (entry.type === "search") body = entry.text;
  else if (entry.type === "search_result") body = `${entry.count} result${entry.count === 1 ? "" : "s"}`;
  else if (entry.type === "lead") body = `${entry.company} (score ${entry.score ?? "?"})`;
  else if (entry.type === "finish") body = entry.text;
  else if (entry.text) body = entry.text;

  return (
    <li style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.5 }}>
      <span style={{ flexShrink: 0 }}>{meta.icon}</span>
      <span style={{ flexShrink: 0, color: meta.color, fontWeight: 600, width: 90 }}>{meta.label}</span>
      <span style={{ color: "#cbd5e1" }}>{body}</span>
    </li>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: "2px solid rgba(34,211,238,0.3)",
        borderTopColor: "#22d3ee",
        animation: "clawdbot-spin 0.8s linear infinite",
      }}
    >
      <style>{`@keyframes clawdbot-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e6e8f0",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
  resize: "vertical",
};

const ghostButtonStyle = {
  padding: "10px 16px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e6e8f0",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
