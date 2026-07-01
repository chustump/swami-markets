// Shared Anthropic (Claude) helper for Swami Markets API routes.
// Model is overridable via env so deploys can pin a specific version.
export const SWAMI_MODEL = process.env.SWAMI_MODEL || "claude-sonnet-5";

export async function callClaude({ system, prompt, maxTokens = 1024, model = SWAMI_MODEL }) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || "Anthropic API Error");
  return (d.content || []).map((b) => b.text || "").join("");
}

// Best-effort JSON extraction from a model response that may be wrapped in
// prose or ```json fences.
export function extractJson(raw) {
  const cleaned = String(raw || "").replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {}
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {}
  }
  return null;
}
