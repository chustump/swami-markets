import { NextResponse } from "next/server";
import { isConfigured, listNotes, GranolaError } from "@/lib/sales/granola.server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, ok: false, message: "GRANOLA_API_KEY is not set on the server." });
  }
  try {
    const { notes } = await listNotes({ limit: 1 });
    return NextResponse.json({ configured: true, ok: true, sample: notes[0]?.title ?? null });
  } catch (e) {
    const err = e instanceof GranolaError ? e : new GranolaError(String(e?.message || e), 0);
    return NextResponse.json({ configured: true, ok: false, status: err.status, message: err.message }, { status: 200 });
  }
}
