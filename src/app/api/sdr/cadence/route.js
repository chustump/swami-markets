import { NextResponse } from "next/server";
import { callClaude, extractJson } from "../../_claude";

// POST /api/sdr/cadence
// Generate a full multi-touch, multi-channel NEPQ outreach cadence for one prospect.
export async function POST(request) {
  try {
    const { product, pitch, tone, prospect } = await request.json();

    if (!prospect || !prospect.name) {
      return NextResponse.json({ error: "Prospect data is required." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "The Oracle can't build a cadence — ANTHROPIC_API_KEY is missing. Add it to .env.local or your Netlify dashboard." },
        { status: 200 }
      );
    }

    const system =
      "You are a world-class B2B SDR trained in NEPQ. You design multi-touch outbound " +
      "cadences that feel like a thoughtful human, not a sequence. You never pitch in the " +
      "first three touches, you vary the pain angle across emails (never repeat a hook), you " +
      "always tie each touch to a specific observation, and your breakup assumes inaction has " +
      "a cost. Curious over confident, concerned over excited, short over long, no invented facts.";

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

Write a 10-touch cadence over ~22 days following this blueprint exactly (one object per row):
Day 1  Email     — Problem Awareness hook            (NEPQ: Connecting → Problem)
Day 2  LinkedIn  — Connection request, NO pitch note  (NEPQ: Disarm)  [<200 chars]
Day 4  LinkedIn  — DM after connect, curiosity-based  (NEPQ: Situation)
Day 6  Email     — Social proof variant, peer company (NEPQ: Solution Awareness)
Day 8  Phone     — 30-sec voicemail, concerned tone   (NEPQ: Consequence)
Day 10 LinkedIn  — Short voice-note / video script    (NEPQ: Qualifying)
Day 13 Email     — Different pain reframe             (NEPQ: Problem Awareness)
Day 16 Phone     — Live dial opener, 2-3 lines        (NEPQ: Transition)
Day 19 Email     — Soft breakup, consequence frame    (NEPQ: Consequence)
Day 22 LinkedIn  — Final DM, permission to close loop (NEPQ: Commitment)

Rules: reference a specific signal each time; vary the angle per email; emails under 110 words;
first name only; plain text; line breaks as \\n; no emojis in bodies; one question CTA per touch;
no pricing or feature lists in the first three touches.

Return ONLY JSON (no backticks):
{"cadence":[
  {"day":1,"channel":"Email","type":"Problem Awareness hook","nepq":"Connecting → Problem","subject":"...","body":"..."},
  {"day":2,"channel":"LinkedIn","type":"Connection request (no note)","nepq":"Disarm","body":"..."},
  ... one object per row above, Phone rows use body for the script and omit subject ...
]}`;

    const raw = await callClaude({ system, prompt, maxTokens: 3200 });
    const parsed = extractJson(raw);
    const cadence = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.cadence) ? parsed.cadence : null;

    if (!cadence || !cadence.length) {
      return NextResponse.json({ error: "Could not parse the cadence. Try again." }, { status: 200 });
    }

    return NextResponse.json({ cadence });
  } catch (error) {
    console.error("SDR cadence error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
