import { NextResponse } from "next/server";
import { isConfigured, listNotes, GranolaError } from "@/lib/sales/granola.server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const { searchParams } = new URL(request.url);
  const hours = Math.min(Math.max(Number(searchParams.get("hours") || 24), 1), 24 * 30);
  const createdAfter = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  try {
    const { notes, raw } = await listNotes({ createdAfter, limit: 25 });
    const debug = searchParams.get("debug") === "1";
    return NextResponse.json({ notes, ...(debug ? { raw } : {}) });
  } catch (e) {
    const err = e instanceof GranolaError ? e : new GranolaError(String(e?.message || e), 0);
    return NextResponse.json({ error: err.message, status: err.status }, { status: err.status === 429 ? 429 : 502 });
  }
}
