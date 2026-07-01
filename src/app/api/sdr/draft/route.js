import { NextResponse } from "next/server";
import { callClaude, extractJson } from "../../_claude";

// POST /api/sdr/draft
// Write a personalized cold email + follow-up for a single prospect.
export async function POST(request) {
  try {
    const { product, pitch, tone, prospect } = await request.json();

    if (!prospect || !prospect.name) {
      return NextResponse.json({ error: "Prospect data is required." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "The Oracle can't draft — ANTHROPIC_API_KEY is missing. Add it to .env.local or your Netlify dashboard." },
        { status: 200 }
      );
    }

    const system =
      "You are a world-class B2B SDR who writes cold outbound email that gets replies. " +
      "You write short, specific, human emails — no fluff, no fake familiarity, no spammy hype. " +
      "You lead with a relevant hook, make one clear point of value, and end with one low-friction ask.";

    const prompt = `PRODUCT: ${product || "Swami Markets"}
WHAT IT DOES: ${pitch || "A prediction-markets oracle for Polymarket & Kalshi."}
TONE: ${tone || "Sharp & confident"}

PROSPECT:
- Name: ${prospect.name}
- Title: ${prospect.title || "—"}
- Company/type: ${prospect.company || "—"}
- Segment: ${prospect.segment || "—"}
- Personalization hook: ${prospect.hook || "—"}
- Why they fit: ${prospect.fitReason || "—"}

Write a cold outbound email and a 1-line follow-up.
Rules: body under 120 words, plain text, first name only, one clear CTA (a quick reply or a 15-min look), no emojis in the body, no made-up mutual connections or fake stats.

Return ONLY JSON (no backticks):
{
  "subject": "Compelling <7-word subject line",
  "body": "The full email body with line breaks as \\n",
  "followUp": "One short follow-up line to send if no reply"
}`;

    const raw = await callClaude({ system, prompt, maxTokens: 900 });
    const draft = extractJson(raw);

    if (!draft || !draft.body) {
      return NextResponse.json({ error: "Could not parse the drafted email. Try again." }, { status: 200 });
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("SDR draft error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
