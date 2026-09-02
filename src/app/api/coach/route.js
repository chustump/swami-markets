import { NextResponse } from "next/server";
import { callClaude, extractJson } from "../_claude";

// Condensed, authentic NEPQ framework the coach is grounded in.
const NEPQ_CORE = `You coach in Jeremy Miner's NEPQ (Neuro-Emotional Persuasion Questioning) method.
Core principle: people persuade themselves — be a PROBLEM FINDER, never a product pusher. Dialogue > presenting.

The 8 question types:
1. Connecting — disarm, build trust ("Can you walk me through how you're handling X today?")
2. Situation — current state, facts ("How long have you used your current solution?")
3. Problem Awareness — surface latent pain, make them articulate it ("How is that affecting your team?") [MOST IMPORTANT]
4. Solution Awareness — visualize the desired state ("If you solved X, how would that change things?")
5. Consequence — cost of inaction, internal urgency ("(sigh) What if nothing changes for 6 months?")
6. Qualifying — readiness, decision process ("How important is solving this, 1-10?")
7. Transition — soft, assumptive bridge to solution ("Would it make sense to show you how we've helped similar teams?")
8. Commitment — low-pressure next step ("Does it make sense to move forward?")

The 5 tonalities: Curious (head tilt), Concerned (lean in, sigh — for Problem/Consequence), Confused (clarify), Challenging (sparingly), Playful (rapport).

Call phases: 1 Disarm (connecting, no commission breath) → 2 Engage & Discover (situation→problem→solution→consequence, 80% listening) → 3 Present as questions (feature → question about THEIR use case) → 4 Handle concerns via more questions ("Help me understand what you mean by that") → 5 Commit.

Objections are usually CREATED by the rep (presenting too early, weak gap). Prevent by building the gap in their own words. Loop vague answers: "Help me understand what you mean..." then "How is that affecting X?"`;

const MODE_INSTRUCTIONS = {
  live: `You are a REAL-TIME in-call coach. The rep is ON A LIVE CALL and glancing at you between sentences, so be FAST and SCANNABLE. No preamble, no pep talk.
Given what just happened / what the prospect said, reply in this exact shape:
PHASE: <current NEPQ phase>
SAY NEXT:
- <verbatim question 1 in NEPQ style>
- <verbatim question 2>
TONE: <one tonality + a 4-word cue>
LISTEN FOR: <what a good vs. stalling answer sounds like, one line>
Keep every line short. Never write a paragraph.`,
  objection: `The rep hit a concern/objection. Respond in this shape:
LIKELY CAUSE: <what earlier misstep usually creates this objection>
SAY THIS: <verbatim NEPQ response — disarm + a looping question, never defensive>
THEN ASK: <the follow-up Problem/Consequence question to re-open the gap>
Keep it tight and usable live.`,
  debrief: `You are debriefing a finished call from its transcript/notes (e.g. from Granola or Zoom).
Return ONLY JSON (no backticks):
{
  "reached": "furthest NEPQ phase reached (1-5) and a 6-word summary",
  "scorecard": [{"area":"Disarm | Problem Awareness | Consequence | Tonality | Listening ratio | Next step","grade":"Strong|OK|Weak","note":"1 sentence"}],
  "missed": ["specific NEPQ moment that was missed, and the exact question that should have been asked", "..."],
  "nextMove": "the single most important next action",
  "followUp": "a short NEPQ-style follow-up message (email or DM) to send this prospect now"
}`,
};

// POST /api/coach  { mode, messages?, input?, context? }
export async function POST(request) {
  try {
    const { mode = "live", messages, input, context } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "The Coach is offline — ANTHROPIC_API_KEY is missing. Add it to .env.local or your Netlify dashboard." }, { status: 200 });
    }

    const modeInstr = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.live;
    const ctx = context && String(context).trim() ? `\n\nCALL CONTEXT (what the rep is selling / who they're talking to):\n${String(context).trim()}` : "";
    const system = `${NEPQ_CORE}\n\n---\n${modeInstr}${ctx}`;

    if (mode === "live") {
      const convo = Array.isArray(messages) && messages.length
        ? messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "") }))
        : [{ role: "user", content: String(input || "The call just started.") }];
      const reply = await callClaude({ system, messages: convo, maxTokens: 700 });
      return NextResponse.json({ reply });
    }

    if (mode === "objection") {
      const reply = await callClaude({ system, prompt: `Objection the prospect just raised:\n"${String(input || "").trim()}"`, maxTokens: 700 });
      return NextResponse.json({ reply });
    }

    // debrief
    const raw = await callClaude({ system, prompt: `Call transcript / notes:\n\n${String(input || "").trim()}`, maxTokens: 1600 });
    const parsed = extractJson(raw);
    if (!parsed) return NextResponse.json({ reply: raw }); // fall back to raw text
    return NextResponse.json({ debrief: parsed });
  } catch (error) {
    console.error("Coach error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
