"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shell, Card } from "../_components/Shell";
import { addBot, newId } from "../_lib/bots";

const EMOJI_CHOICES = ["🤖", "🧠", "🧘", "🏴‍☠️", "👩‍🍳", "🧙", "🦊", "🐙", "🦉", "🐉", "🌵", "🪐", "🎭", "📖", "🎲", "🏛️", "🎨", "🔮", "⚡", "🎸"];
const COLOR_CHOICES = ["#7c3aed", "#a855f7", "#ff8c42", "#22d3ee", "#10b981", "#f43f5e", "#eab308", "#3b82f6"];

const TEMPLATES = [
  {
    name: "Blank",
    data: { name: "", description: "", systemPrompt: "" },
  },
  {
    name: "Tutor",
    data: {
      name: "Patient Tutor",
      description: "Explains concepts step by step with examples.",
      systemPrompt:
        "You are a patient tutor. Break concepts into small, numbered steps. Use concrete examples and analogies. After each explanation, ask one quick check-your-understanding question before moving on.",
    },
  },
  {
    name: "Interviewer",
    data: {
      name: "Tough Interviewer",
      description: "Runs mock job interviews with pointed follow-ups.",
      systemPrompt:
        "You are a rigorous technical interviewer. Ask one question at a time. Probe with follow-ups. At the end of the session, if the user asks for feedback, deliver it candidly with specific suggestions.",
    },
  },
  {
    name: "Brainstormer",
    data: {
      name: "Idea Factory",
      description: "Generates wild, divergent ideas then narrows them.",
      systemPrompt:
        "You are a creative brainstorming partner. When asked for ideas, first produce 8 divergent options — include at least two unconventional ones. Then offer to cluster or rank them on request.",
    },
  },
];

export default function NewBotPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🤖");
  const [color, setColor] = useState("#7c3aed");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [error, setError] = useState("");

  function applyTemplate(t) {
    setName(t.data.name);
    setDescription(t.data.description);
    setSystemPrompt(t.data.systemPrompt);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const n = name.trim();
    const p = systemPrompt.trim();
    if (!n) return setError("Give your bot a name.");
    if (!p) return setError("Write a system prompt — this is your bot's personality.");
    const bot = {
      id: newId(),
      name: n,
      emoji,
      color,
      description: description.trim() || "A custom Clawdbot.",
      systemPrompt: p,
      createdAt: Date.now(),
    };
    addBot(bot);
    router.push(`/clawdbot/${bot.id}`);
  }

  return (
    <Shell>
      <div style={{ marginBottom: 20 }}>
        <Link href="/clawdbot" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14 }}>
          ← Back to gallery
        </Link>
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 8px" }}>Create a Clawdbot</h1>
      <p style={{ color: "#94a3b8", marginTop: 0, marginBottom: 28 }}>
        A bot is a name, a vibe, and a system prompt. Start blank or pick a template.
      </p>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>Start from a template</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => applyTemplate(t)}
              style={chipStyle}
            >
              {t.name}
            </button>
          ))}
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <Field label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Professor Sparkle"
              maxLength={60}
              style={inputStyle}
            />
          </Field>

          <Field label="Avatar emoji">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EMOJI_CHOICES.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: emoji === e ? "2px solid #a855f7" : "1px solid rgba(255,255,255,0.1)",
                    background: emoji === e ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.03)",
                    fontSize: 22,
                    cursor: "pointer",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Accent color">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COLOR_CHOICES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: color === c ? "3px solid #fff" : "1px solid rgba(255,255,255,0.15)",
                    background: c,
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </Field>

          <Field label="One-line description">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this bot do?"
              maxLength={140}
              style={inputStyle}
            />
          </Field>

          <Field label="System prompt" hint="This defines your bot's persona and rules. Be specific.">
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant who..."
              rows={8}
              style={{ ...inputStyle, fontFamily: "ui-monospace, Menlo, monospace", resize: "vertical" }}
            />
          </Field>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#fca5a5",
                padding: 10,
                borderRadius: 8,
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href="/clawdbot" style={{ ...buttonStyle, background: "rgba(255,255,255,0.06)", color: "#e6e8f0" }}>
              Cancel
            </Link>
            <button type="submit" style={{ ...buttonStyle, background: "linear-gradient(135deg, #7c3aed, #ff8c42)", color: "#fff", border: "none", cursor: "pointer" }}>
              Create &amp; chat →
            </button>
          </div>
        </Card>
      </form>
    </Shell>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
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
};

const chipStyle = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e6e8f0",
  fontSize: 13,
  cursor: "pointer",
};

const buttonStyle = {
  padding: "10px 18px",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
};
