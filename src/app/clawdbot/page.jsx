"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell, Card } from "./_components/Shell";
import { PRESET_BOTS, loadUserBots, deleteBot } from "./_lib/bots";

export default function ClawdbotHome() {
  const [userBots, setUserBots] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUserBots(loadUserBots());
    setMounted(true);
  }, []);

  function handleDelete(id) {
    if (!confirm("Delete this bot and its chat history?")) return;
    deleteBot(id);
    setUserBots(loadUserBots());
  }

  return (
    <Shell>
      <section style={{ textAlign: "center", padding: "40px 0 48px" }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 14px",
            borderRadius: 999,
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.35)",
            fontSize: 12,
            letterSpacing: 0.4,
            color: "#c4b5fd",
            marginBottom: 20,
          }}
        >
          POWERED BY CLAUDE
        </div>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 900,
            margin: "0 0 14px",
            lineHeight: 1.05,
            letterSpacing: -1.5,
            background: "linear-gradient(135deg, #fff 10%, #a855f7 50%, #ff8c42 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Build your own Clawdbot
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 18, maxWidth: 620, margin: "0 auto 28px" }}>
          Craft a bot with a persona, a voice, and a mission. Give it a system prompt, then chat.
          Your bots live in this browser — no account required.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/clawdbot/new"
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #ff8c42)",
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: 15,
            }}
          >
            + Create a Clawdbot
          </Link>
          <a
            href="#gallery"
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e6e8f0",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: 15,
            }}
          >
            Browse starter bots
          </a>
        </div>
      </section>

      {mounted && userBots.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={sectionHeadingStyle}>Your bots</h2>
          <Grid>
            {userBots.map((bot) => (
              <BotCard key={bot.id} bot={bot} onDelete={() => handleDelete(bot.id)} />
            ))}
          </Grid>
        </section>
      )}

      <section id="gallery">
        <h2 style={sectionHeadingStyle}>Starter bots</h2>
        <Grid>
          {PRESET_BOTS.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </Grid>
      </section>
    </Shell>
  );
}

function Grid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

function BotCard({ bot, onDelete }) {
  return (
    <Card
      style={{
        position: "relative",
        transition: "transform 0.15s, border-color 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${bot.color || "#7c3aed"}, #ff8c42)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            flexShrink: 0,
          }}
        >
          {bot.emoji || "🤖"}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {bot.name}
          </div>
          <div style={{ fontSize: 12, color: bot.preset ? "#c4b5fd" : "#fbbf24" }}>
            {bot.preset ? "Starter bot" : "Your bot"}
          </div>
        </div>
      </div>
      <p
        style={{
          color: "#94a3b8",
          fontSize: 14,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {bot.description}
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        <Link
          href={`/clawdbot/${bot.id}`}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            color: "#fff",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Chat
        </Link>
        {onDelete && (
          <button
            onClick={onDelete}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(239,68,68,0.1)",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.3)",
              fontSize: 14,
              cursor: "pointer",
            }}
            aria-label="Delete bot"
          >
            Delete
          </button>
        )}
      </div>
    </Card>
  );
}

const sectionHeadingStyle = {
  fontSize: 20,
  fontWeight: 700,
  margin: "0 0 16px",
  color: "#e6e8f0",
};
