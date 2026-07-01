import { NextResponse } from "next/server";
import { callClaude, extractJson } from "../../_claude";

// POST /api/sdr/prospects
// Research a target segment and return a structured list of outbound prospects.
export async function POST(request) {
  try {
    const { product, pitch, segment, count } = await request.json();

    if (!segment || !String(segment).trim()) {
      return NextResponse.json({ error: "Target segment is required." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "The Oracle can't research prospects — ANTHROPIC_API_KEY is missing. Add it to .env.local or your Netlify dashboard." },
        { status: 200 }
      );
    }

    const n = Math.max(1, Math.min(10, Number(count) || 6));

    const system =
      "You are an elite B2B SDR and market researcher. You build focused outbound " +
      "prospecting lists and identify the strongest fit accounts and personas for a product. " +
      "You are honest: since you have no live data feed, the profiles you produce are " +
      "realistic, well-reasoned target archetypes the human should validate before outreach.";

    const prompt = `PRODUCT: ${product || "Swami Markets"}
WHAT IT DOES: ${pitch || "A prediction-markets oracle for Polymarket & Kalshi."}
TARGET SEGMENT: ${segment}

Generate ${n} high-fit outbound prospect profiles for a cold-outreach campaign.
For each, think about who inside that segment would get the most value and be reachable.

Return ONLY a JSON array (no prose, no backticks). Each object:
{
  "name": "Plausible full name",
  "title": "Job title / role",
  "company": "Company or org type (real category, not a fabricated brand claim)",
  "segment": "Sub-segment they belong to",
  "priority": "High" | "Medium" | "Low",
  "fitReason": "1 sentence: why this persona is a strong fit for the product",
  "hook": "1 sentence: a specific personalization angle to open the outreach with"
}`;

    const raw = await callClaude({ system, prompt, maxTokens: 2200 });
    const parsed = extractJson(raw);
    const prospects = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.prospects) ? parsed.prospects : null;

    if (!prospects) {
      return NextResponse.json({ error: "The Oracle's vision was cloudy — could not parse prospects. Try again." }, { status: 200 });
    }

    return NextResponse.json({ prospects: prospects.slice(0, n) });
  } catch (error) {
    console.error("SDR prospects error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
