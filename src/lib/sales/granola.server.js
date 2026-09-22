// Server-only client for Granola's public API. The key never reaches the
// browser: the (sales) pages call our /api/granola/* routes, which call this.
//
// Docs: docs.granola.ai/help-center/sharing/integrations/granola-api
// Base: https://public-api.granola.ai/v1 · Bearer grn_… · 5 req/s sustained.
// Keys are created in Granola → Settings → Connectors → API keys (Business/Enterprise).

import { normalizeNote, normalizeNoteList, normalizeTranscript, setMeNames } from "./transcript";

setMeNames((process.env.GRANOLA_ME || "").split(","));

const BASE = process.env.GRANOLA_API_BASE || "https://public-api.granola.ai/v1";

export class GranolaError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export function isConfigured() {
  return Boolean(process.env.GRANOLA_API_KEY);
}

async function call(path, { searchParams } = {}) {
  const key = process.env.GRANOLA_API_KEY;
  if (!key) throw new GranolaError("GRANOLA_API_KEY is not set", 0);
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(searchParams || {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    cache: "no-store",
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg =
      res.status === 401 || res.status === 403
        ? "Granola rejected the API key"
        : res.status === 404
          ? "Not found in Granola"
          : res.status === 429
            ? "Granola rate limit hit"
            : `Granola returned ${res.status}`;
    throw new GranolaError(msg, res.status, body);
  }
  return body;
}

export async function listNotes({ createdAfter, limit = 20 } = {}) {
  const body = await call("/notes", { searchParams: { createdAfter, limit } });
  return { notes: normalizeNoteList(body), raw: body };
}

export async function getNote(id, { transcript = true } = {}) {
  const body = await call(`/notes/${encodeURIComponent(id)}`, {
    searchParams: transcript ? { include: "transcript" } : {},
  });
  const noteSrc = body?.note ?? body?.data ?? body;
  const note = normalizeNote(noteSrc);
  const utterances = normalizeTranscript(
    noteSrc?.transcript ?? body?.transcript ?? noteSrc?.utterances ?? null,
  );
  return { note, utterances, raw: body };
}
