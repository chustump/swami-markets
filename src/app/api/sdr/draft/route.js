import { NextResponse } from "next/server";
import { callClaude, extractJson } from "../../_claude";

// POST /api/sdr/draft
// Write personalized outreach for a single prospect: a cold email + follow-up,
// and a LinkedIn connection note + first DM (NEPQ-formatted, human sends).
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
      "You are a world-class B2B SDR trained in NEPQ (Neuro-Emotional Persuasion Questioning). " +
      "You never pitch in a first touch — you surface a problem the prospect can feel, using a " +
      "specific observation and a curious, slightly concerned question. No fluff, no fake " +
      "familiarity, no hype, no invented stats or mutual connections. Curious over confident, " +
      "concerned over excited, short over long. One CTA, always a question.";

    const prompt = `PRODUCT: ${product || "Swami Markets"}
WHAT IT DOES: ${pitch || "A prediction-markets oracle for Polymarket & Kalshi."}
TONE: ${tone || "Sharp & confident"}

PROSPECT:
- Name: ${prospect.name}
- Title: ${prospect.title || "—"}
- Company/type: ${prospect.company || "—"}
- Segment/team: ${prospect.segment || "—"}
- Persona role: ${prospect.personaRole || "—"}
- Personalization hook: ${prospect.hook || "—"}
- Why they fit: ${prospect.fitReason || "—"}

Write outreach across two channels using the NEPQ formula
(Line 1: specific observation/signal — not a compliment. Line 2: problem-awareness question.
Line 3: one-line peer social proof, no fluff. Line 4: soft, curious CTA).

Return ONLY JSON (no backticks):
{
  "subject": "Curiosity-driven <7-word subject line",
  "body": "Cold email body, under 120 words, first name only, plain text, line breaks as \\n, no emojis, one question CTA",
  "followUp": "One short follow-up line to send if no reply",
  "linkedin": {
    "connectionNote": "LinkedIn connection request note, UNDER 200 characters, warm, no pitch, no link",
    "dm": "First LinkedIn DM to send after they accept — curiosity-based, 2-3 sentences, one question, no pitch"
  }
}`;

    const raw = await callClaude({ system, prompt, maxTokens: 1100 });
    const draft = extractJson(raw);

    if (!draft || !draft.body) {
      return NextResponse.json({ error: "Could not parse the drafted outreach. Try again." }, { status: 200 });
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("SDR draft error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
