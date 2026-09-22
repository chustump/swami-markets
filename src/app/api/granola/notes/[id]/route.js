import { NextResponse } from "next/server";
import { isConfigured, getNote, GranolaError } from "@/lib/sales/granola.server";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  if (!isConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const { searchParams } = new URL(request.url);
  const since = Number(searchParams.get("since") || 0);
  try {
    const { note, utterances, raw } = await getNote(params.id, { transcript: true });
    const debug = searchParams.get("debug") === "1";
    // `since` lets the poller ask only for utterances it hasn't seen.
    const fresh = since > 0 ? utterances.slice(since) : utterances;
    return NextResponse.json({ note, total: utterances.length, utterances: fresh, ...(debug ? { raw } : {}) });
  } catch (e) {
    const err = e instanceof GranolaError ? e : new GranolaError(String(e?.message || e), 0);
    return NextResponse.json({ error: err.message, status: err.status }, { status: err.status === 404 ? 404 : err.status === 429 ? 429 : 502 });
  }
}
