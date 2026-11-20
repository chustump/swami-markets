import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { snapshot } = await request.json();
    if (!snapshot?.symbol) return NextResponse.json({ error: "Snapshot required" }, { status: 400 });
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ missingKey: true });

    const prompt = `You are a technical analyst. Below is an indicator snapshot computed from price data${snapshot.simulated ? " (SIMULATED demo data, say so)" : ""}.
Write a concise chart read in plain text with these four short sections: TREND, MOMENTUM, KEY LEVELS, RISKS.
Use only the numbers given; do not invent news or fundamentals. Do not tell the reader to buy or sell; describe what the indicators show and what would invalidate the current read. Under 170 words.

${JSON.stringify(snapshot)}`;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 500, messages: [{ role: "user", content: prompt }] }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || "Anthropic API error");
    return NextResponse.json({ text: (d.content || []).map(b => b.text || "").join("") });
  } catch (error) {
    console.error("chart-ai error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
