"use client";

// Browser-side helpers. Everything goes through our own /api/granola routes
// so the Granola key stays on the server.

async function j(url) {
  const res = await fetch(url, { cache: "no-store" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = body?.error;
    throw err;
  }
  return body;
}

export function granolaStatus() {
  return j("/api/granola/status");
}

export function recentNotes(hours = 24) {
  return j(`/api/granola/notes?hours=${hours}`);
}

export function noteTranscript(id, since = 0) {
  return j(`/api/granola/notes/${encodeURIComponent(id)}?since=${since}`);
}

// Best guess at which Granola note is "this call": most recent note whose
// title or attendees mention the prospect or company, else the most recent.
export function pickNoteForCall(notes, call) {
  if (!notes?.length) return null;
  const needles = [call?.company, call?.prospectName].map((s) => (s || "").trim().toLowerCase()).filter((s) => s.length > 2);
  const sorted = [...notes].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const live = sorted.find((n) => n.live);
  if (live) return live;
  if (needles.length) {
    const hit = sorted.find((n) => {
      const hay = `${n.title} ${(n.attendees || []).join(" ")}`.toLowerCase();
      return needles.some((s) => hay.includes(s));
    });
    if (hit) return hit;
  }
  return sorted[0];
}
