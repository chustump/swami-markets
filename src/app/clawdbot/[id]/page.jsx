"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Shell, Card } from "../_components/Shell";
import { findBot, loadChat, saveChat, clearChat } from "../_lib/bots";

export default function BotChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [bot, setBot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    const b = findBot(id);
    setBot(b);
    setMessages(loadChat(id));
    setLoaded(true);
  }, [id]);

  useEffect(() => {
    if (!loaded || !id) return;
    saveChat(id, messages);
  }, [messages, id, loaded]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending || !bot) return;
    setError("");
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const r = await fetch("/api/clawdbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-30),
          systemPrompt: bot.systemPrompt,
          botName: bot.name,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Something went wrong");
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "(empty reply)" }]);
    } catch (err) {
      setError(err.message);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `⚠️ ${err.message}`, error: true },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleClear() {
    if (!confirm("Clear this conversation?")) return;
    clearChat(id);
    setMessages([]);
  }

  const suggestions = useMemo(() => {
    if (!bot || messages.length > 0) return [];
    return suggestionsFor(bot);
  }, [bot, messages.length]);

  if (!loaded) {
    return (
      <Shell>
        <div style={{ color: "#94a3b8", textAlign: "center", padding: 80 }}>Loading…</div>
      </Shell>
    );
  }

  if (!bot) {
    return (
      <Shell>
        <Card>
          <h2 style={{ margin: "0 0 8px" }}>Bot not found</h2>
          <p style={{ color: "#94a3b8", marginTop: 0 }}>
            This bot doesn't exist, or it lives in a different browser.
          </p>
          <Link
            href="/clawdbot"
            style={{
              display: "inline-block",
              marginTop: 8,
              padding: "10px 16px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #ff8c42)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to gallery
          </Link>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ marginBottom: 16 }}>
        <Link href="/clawdbot" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14 }}>
          ← Back to gallery
        </Link>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${bot.color || "#7c3aed"}, #ff8c42)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              flexShrink: 0,
            }}
          >
            {bot.emoji || "🤖"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{bot.name}</div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{bot.description}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setShowPrompt((s) => !s)} style={ghostButtonStyle}>
              {showPrompt ? "Hide prompt" : "View prompt"}
            </button>
            <button type="button" onClick={handleClear} style={ghostButtonStyle}>
              Clear chat
            </button>
          </div>
        </div>
        {showPrompt && (
          <pre
            style={{
              marginTop: 14,
              padding: 12,
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              color: "#cbd5e1",
              fontSize: 13,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: 200,
              overflow: "auto",
            }}
          >
            {bot.systemPrompt}
          </pre>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          ref={scrollerRef}
          style={{
            height: "min(60vh, 560px)",
            overflowY: "auto",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {messages.length === 0 && (
            <div style={{ color: "#94a3b8", textAlign: "center", padding: "40px 10px" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>{bot.emoji || "🤖"}</div>
              <div style={{ fontWeight: 600, color: "#e6e8f0", marginBottom: 6 }}>
                Say hi to {bot.name}.
              </div>
              <div style={{ fontSize: 14 }}>Start the conversation below.</div>
              {suggestions.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 20 }}>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setInput(s)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: "rgba(124,58,237,0.12)",
                        border: "1px solid rgba(124,58,237,0.3)",
                        color: "#c4b5fd",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {messages.map((m, i) => (
            <Bubble key={i} message={m} bot={bot} />
          ))}
          {sending && <TypingBubble bot={bot} />}
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: 14,
            background: "rgba(0,0,0,0.25)",
          }}
        >
          {error && (
            <div style={{ color: "#fca5a5", fontSize: 13, marginBottom: 8 }}>{error}</div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${bot.name}…`}
              rows={1}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e6e8f0",
                fontSize: 14,
                resize: "none",
                fontFamily: "inherit",
                maxHeight: 160,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={send}
              disabled={sending || !input.trim()}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                background:
                  sending || !input.trim()
                    ? "rgba(255,255,255,0.08)"
                    : "linear-gradient(135deg, #7c3aed, #ff8c42)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                cursor: sending || !input.trim() ? "default" : "pointer",
              }}
            >
              {sending ? "…" : "Send"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
            Enter to send · Shift+Enter for newline
          </div>
        </div>
      </Card>
    </Shell>
  );
}

function Bubble({ message, bot }) {
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          flexShrink: 0,
          background: isUser
            ? "rgba(255,255,255,0.1)"
            : `linear-gradient(135deg, ${bot.color || "#7c3aed"}, #ff8c42)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        {isUser ? "🧑" : bot.emoji || "🤖"}
      </div>
      <div
        style={{
          maxWidth: "78%",
          padding: "10px 14px",
          borderRadius: 14,
          background: isUser
            ? "linear-gradient(135deg, #7c3aed, #a855f7)"
            : message.error
            ? "rgba(239,68,68,0.12)"
            : "rgba(255,255,255,0.05)",
          border: message.error ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.06)",
          color: message.error ? "#fca5a5" : "#e6e8f0",
          fontSize: 14,
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingBubble({ bot }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          flexShrink: 0,
          background: `linear-gradient(135deg, ${bot.color || "#7c3aed"}, #ff8c42)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        {bot.emoji || "🤖"}
      </div>
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 14,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        <Dot delay={0} />
        <Dot delay={0.15} />
        <Dot delay={0.3} />
      </div>
    </div>
  );
}

function Dot({ delay }) {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#94a3b8",
        animation: `clawdbot-blink 1s ${delay}s infinite ease-in-out`,
        display: "inline-block",
      }}
    >
      <style>{`@keyframes clawdbot-blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }`}</style>
    </span>
  );
}

function suggestionsFor(bot) {
  const n = bot.name.toLowerCase();
  if (n.includes("zen")) return ["I feel anxious about work.", "Give me a 3-breath meditation.", "What's a koan for beginners?"];
  if (n.includes("code") || n.includes("wizard")) return ["Review this React hook.", "Explain promises in JS.", "Refactor ideas for long files?"];
  if (n.includes("pirate") || n.includes("captain")) return ["What's on the menu, Cap'n?", "Tell me a sea shanty.", "Where be the treasure?"];
  if (n.includes("chef") || n.includes("clawdia")) return ["I have eggs and spinach — help!", "Teach me carbonara.", "What's a weeknight pasta?"];
  if (n.includes("story") || n.includes("weaver")) return ["Start a noir story.", "A sci-fi opener, please.", "Continue where we left off."];
  if (n.includes("stoic")) return ["I failed an interview.", "How do I handle a rude coworker?", "A Marcus Aurelius quote?"];
  return ["Hi! What can you do?", "Tell me about yourself.", "Give me something interesting."];
}

const ghostButtonStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#cbd5e1",
  fontSize: 13,
  cursor: "pointer",
};
