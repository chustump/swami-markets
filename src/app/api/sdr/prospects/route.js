import { NextResponse } from "next/server";
import { callClaude, extractJson } from "../../_claude";

// POST /api/sdr/prospects
// Research outbound prospects — either across a target segment, or the specific
// people to go after inside a single named company (account-based mode).
export async function POST(request) {
  try {
    const { product, pitch, segment, company, count } = await request.json();

    const byCompany = !!(company && String(company).trim());
    if (!byCompany && (!segment || !String(segment).trim())) {
      return NextResponse.json({ error: "Give me a company or a target segment to research." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "The Oracle can't research prospects — ANTHROPIC_API_KEY is missing. Add it to .env.local or your Netlify dashboard." },
        { status: 200 }
      );
    }

    const n = Math.max(1, Math.min(10, Number(count) || 6));

    const system =
      "You are an elite B2B SDR and account researcher. You map the right buying " +
      "personas and titles to go after for a product. You are honest: you have no live " +
      "contact database, so the people you produce are the most likely roles/titles to " +
      "target — realistic archetypes the human must verify in LinkedIn/Apollo/REO.dev " +
      "before real outreach. Never invent specific emails or phone numbers.";

    const target = byCompany
      ? `TARGET COMPANY: ${company}
Map the ${n} most relevant people to reach at this specific company for this product.
Reason about the org: which teams own the pain this product solves, and which titles are
the economic buyer, the champion, and the technical evaluator. Prefer real, common titles.`
      : `TARGET SEGMENT: ${segment}
Generate ${n} high-fit prospect archetypes across this segment.`;

    const prompt = `PRODUCT: ${product || "Swami Markets"}
WHAT IT DOES: ${pitch || "A prediction-markets oracle for Polymarket & Kalshi."}
${target}

Return ONLY a JSON array (no prose, no backticks). Each object:
{
  "name": "Plausible full name (clearly a placeholder to verify)",
  "title": "Job title / role",
  "company": "${byCompany ? String(company).trim() : "Company or org type (a real category, not a fabricated brand)"}",
  "segment": "Sub-segment / team they belong to",
  "priority": "High" | "Medium" | "Low",
  "personaRole": "Economic buyer | Champion | Technical evaluator | End user",
  "fitReason": "1 sentence: why this persona is a strong fit / feels the pain",
  "hook": "1 sentence: a specific, signal-based personalization angle to open with",
  "linkedinQuery": "Best keywords to find this person on LinkedIn, e.g. 'Head of Data <Company>'"
}`;

    const raw = await callClaude({ system, prompt, maxTokens: 2600 });
    const parsed = extractJson(raw);
    const prospects = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.prospects) ? parsed.prospects : null;

    if (!prospects) {
      return NextResponse.json({ error: "The Oracle's vision was cloudy — could not parse prospects. Try again." }, { status: 200 });
    }

    return NextResponse.json({ prospects: prospects.slice(0, n), mode: byCompany ? "company" : "segment" });
  } catch (error) {
    console.error("SDR prospects error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
