// Normalizes whatever Granola hands back into one utterance shape:
//   { i, who: "you" | "them" | "unknown", speaker, text, at }
// "you" is the recorder's microphone; "them" is system audio (the call).
//
// Two input shapes are handled, because Granola renders transcripts both ways:
//   1. A plain string in Granola's own format:
//        "Microphone: Hello\n\nSystem audio (Priya Shah): Hi Jeff"
//   2. An array of utterances, e.g. { source: "microphone"|"system", speaker?, text, start_timestamp? }
// Anything else is coerced as best as possible rather than thrown.

const LINE = /^(Microphone|System audio)(?:\s*\(([^)]*)\))?:\s*(.*)$/;

// Labels Granola uses for the recorder's own microphone, plus whoever the
// server says "me" is (GRANOLA_ME, comma-separated names/emails).
const ME_LABELS = new Set(["microphone", "mic", "you", "me", "myself"]);
let meNames = [];
export function setMeNames(names) {
  meNames = (names || []).map((n) => String(n).trim().toLowerCase()).filter(Boolean);
}

function whoFromSource(source) {
  const s = String(source || "").toLowerCase().trim();
  if (!s) return "unknown";
  if (ME_LABELS.has(s) || s.startsWith("microphone")) return "you";
  if (meNames.some((m) => s === m || s.includes(m))) return "you";
  if (s.startsWith("system") || s === "speaker" || s === "remote") return "them";
  return "them";
}

export function parseTranscriptText(text) {
  const out = [];
  if (!text) return out;
  const lines = String(text).split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const m = LINE.exec(line);
    if (m) {
      out.push({ i: out.length, who: whoFromSource(m[1]), speaker: m[2] || (m[1] === "Microphone" ? "You" : "Them"), text: m[3].trim(), at: null });
    } else if (out.length) {
      out[out.length - 1].text = `${out[out.length - 1].text} ${line}`.trim();
    } else {
      out.push({ i: 0, who: "unknown", speaker: "", text: line, at: null });
    }
  }
  return out.filter((u) => u.text);
}

export function parseTranscriptArray(arr) {
  const out = [];
  for (const u of arr || []) {
    if (!u) continue;
    if (typeof u === "string") {
      out.push(...parseTranscriptText(u).map((x) => ({ ...x, i: out.length + x.i })));
      continue;
    }
    const text = String(u.text ?? u.content ?? u.utterance ?? "").trim();
    if (!text) continue;
    const label = u.speaker ?? u.speaker_name ?? u.participant ?? u.source ?? u.audio_source ?? u.channel ?? "";
    const who = u.who || whoFromSource(label);
    const speaker = String(label || (who === "you" ? "You" : "Them"));
    const at = u.startMs ?? u.start_ms ?? u.start_timestamp ?? u.start ?? u.timestamp ?? u.at ?? null;
    out.push({ i: out.length, who, speaker, text, at });
  }
  return out;
}

export function normalizeTranscript(input) {
  if (!input) return [];
  if (typeof input === "string") return parseTranscriptText(input);
  if (Array.isArray(input)) return parseTranscriptArray(input);
  if (typeof input === "object") {
    for (const key of ["transcript", "utterances", "segments", "items", "data"]) {
      if (input[key]) return normalizeTranscript(input[key]);
    }
    if (input.text) return parseTranscriptText(input.text);
  }
  return [];
}

// Pull the shape of a note out of whatever the list/detail endpoints return.
export function normalizeNote(n) {
  if (!n || typeof n !== "object") return null;
  const id = n.id ?? n.document_id ?? n.note_id;
  if (!id) return null;
  const people = n.attendees ?? n.participants ?? n.people ?? [];
  const meetingStartAt = n.meetingStartAt ?? n.meeting_start_at ?? null;
  const meetingEndAt = n.meetingEndAt ?? n.meeting_end_at ?? null;
  return {
    id: String(id),
    title: n.title ?? n.name ?? "Untitled",
    createdAt: n.createdAt ?? n.created_at ?? meetingStartAt ?? n.start_time ?? n.date ?? null,
    updatedAt: n.updatedAt ?? n.updated_at ?? null,
    meetingStartAt,
    meetingEndAt,
    // A note whose meeting has started but not ended is the one being recorded right now.
    live: Boolean(meetingStartAt) && !meetingEndAt,
    url: n.url ?? n.note_url ?? n.share_url ?? (id ? `https://notes.granola.ai/d/${id}` : null),
    attendees: (Array.isArray(people) ? people : []).map((p) => (typeof p === "string" ? p : p?.name || p?.email || "")).filter(Boolean),
    summary: n.summary ?? n.ai_summary ?? n.overview ?? null,
  };
}

export function normalizeNoteList(payload) {
  const arr = Array.isArray(payload) ? payload : payload?.notes ?? payload?.data ?? payload?.documents ?? payload?.items ?? [];
  return arr.map(normalizeNote).filter(Boolean);
}
