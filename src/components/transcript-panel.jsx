"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Link2, Unlink, Radio } from "lucide-react";
import { Button, Eyebrow, cn } from "./ui";
import { useSales } from "@/lib/sales/store";
import { granolaStatus, recentNotes, noteTranscript, pickNoteForCall } from "@/lib/sales/granola";
import { spot } from "@/lib/sales/triggers";
import { getNode } from "@/lib/sales/tree";

const POLL_MS = 8000;

function fmtWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function TranscriptPanel({ call, onCapture }) {
  const { linkGranola, unlinkGranola, setGranolaTranscript, goTo, toggleHurt } = useSales();
  const [status, setStatus] = useState(null);
  const [notes, setNotes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [lastPoll, setLastPoll] = useState(null);
  const [dismissed, setDismissed] = useState(() => new Set());
  const listRef = useRef(null);
  const g = call.granola || null;
  const utterances = g?.utterances || [];
  const live = call.status === "live";

  useEffect(() => {
    granolaStatus().then(setStatus).catch(() => setStatus({ configured: false, ok: false }));
  }, []);

  const loadNotes = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const { notes: n } = await recentNotes(24);
      setNotes(n);
      return n;
    } catch (e) {
      setError(e.message);
      return [];
    } finally {
      setBusy(false);
    }
  }, []);

  const poll = useCallback(async () => {
    if (!g?.noteId) return;
    try {
      const have = call.granola?.utterances?.length || 0;
      const res = await noteTranscript(g.noteId, have);
      if (res.total < have) {
        // Granola re-issued the transcript shorter than we have (re-diarized); take theirs.
        const full = await noteTranscript(g.noteId, 0);
        setGranolaTranscript(call.id, full.utterances, { summary: full.note?.summary ?? null, live: full.note?.live ?? false });
      } else if (res.utterances.length) {
        const merged = [...(call.granola?.utterances || []), ...res.utterances].map((u, i) => ({ ...u, i }));
        setGranolaTranscript(call.id, merged, { summary: res.note?.summary ?? call.granola?.summary ?? null, live: res.note?.live ?? false });
      } else if (res.note && (res.note.summary !== call.granola?.summary || res.note.live !== call.granola?.live)) {
        setGranolaTranscript(call.id, call.granola.utterances, { summary: res.note.summary ?? null, live: res.note.live ?? false });
      }
      setError(null);
      setLastPoll(Date.now());
    } catch (e) {
      setError(e.message);
    }
  }, [g?.noteId, call.id, call.granola, setGranolaTranscript]);

  useEffect(() => {
    if (!g?.noteId || !live) return undefined;
    poll();
    const t = window.setInterval(poll, POLL_MS);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g?.noteId, live]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [utterances.length]);

  const autoLink = async () => {
    const n = await loadNotes();
    const pick = pickNoteForCall(n, call);
    if (pick) linkGranola(call.id, pick);
  };

  const suggestions = useMemo(() => {
    const seen = new Map();
    const recent = utterances.filter((u) => u.who !== "you").slice(-12);
    for (const u of recent) {
      const { objections, rows } = spot(u.text);
      for (const o of objections) if (!dismissed.has(`o:${o.id}:${u.i}`)) seen.set(`o:${o.id}`, { kind: "objection", ...o, u });
      for (const r of rows) if (!dismissed.has(`r:${r.id}:${u.i}`)) seen.set(`r:${r.id}`, { kind: "row", ...r, u });
    }
    return [...seen.values()].slice(-6);
  }, [utterances, dismissed]);

  const currentNode = getNode(call.currentNodeId);

  if (status && !status.configured) {
    return (
      <div className="flex h-full flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-surface p-4">
        <Eyebrow>Granola</Eyebrow>
        <p className="text-sm">Not connected.</p>
        <ol className="space-y-1.5 text-xs leading-relaxed text-muted">
          <li>1. In Granola: Settings → Connectors → API keys → create a key (starts with <code className="font-mono">grn_</code>). Business or Enterprise plan.</li>
          <li>2. In Netlify: Site configuration → Environment variables → add <code className="font-mono">GRANOLA_API_KEY</code>. Optionally <code className="font-mono">GRANOLA_ME</code> = your name as Granola labels it, so your lines show as “you”.</li>
          <li>3. Redeploy. This panel will show your recent notes.</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Eyebrow>Granola</Eyebrow>
          {g ? (
            <p className="truncate text-sm font-medium">
              {g.live ? <Radio className="mr-1 inline h-3 w-3 text-line" strokeWidth={2} /> : null}
              {g.title}
            </p>
          ) : (
            <p className="text-sm text-muted">No note linked.</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {g ? (
            <>
              <Button variant="ghost" size="icon" onClick={poll} aria-label="Refresh transcript"><RefreshCw className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => unlinkGranola(call.id)} aria-label="Unlink note"><Unlink className="h-3.5 w-3.5" /></Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={autoLink} disabled={busy}><Link2 className="h-3.5 w-3.5" />{busy ? "Finding…" : "Link this call"}</Button>
          )}
        </div>
      </div>

      {status && status.configured && !status.ok ? <p className="text-xs text-danger">{status.message}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}

      {!g && notes.length ? (
        <ul className="max-h-40 space-y-1 overflow-y-auto">
          {notes.map((n) => (
            <li key={n.id}>
              <button type="button" onClick={() => linkGranola(call.id, n)} className="w-full rounded-md border border-border px-2.5 py-2 text-left text-xs hover:bg-raised">
                <span className="block truncate text-fg">{n.live ? "● " : ""}{n.title}</span>
                <span className="text-subtle">{fmtWhen(n.createdAt)}{n.attendees?.length ? ` · ${n.attendees.slice(0, 3).join(", ")}` : ""}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {!g && !notes.length && !busy ? (
        <p className="text-xs text-subtle">Start recording in Granola, then link. It picks the note being recorded now, or the most recent one that mentions {call.company || call.prospectName}.</p>
      ) : null}

      {suggestions.length ? (
        <div>
          <Eyebrow>They just said</Eyebrow>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={`${s.kind}:${s.id}`}
                type="button"
                onClick={() => {
                  if (s.kind === "objection") goTo(call.id, s.id, { objection: s.label });
                  else toggleHurt(call.id, s.id);
                  setDismissed((d) => new Set(d).add(`${s.kind === "objection" ? "o" : "r"}:${s.id}:${s.u.i}`));
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs",
                  s.kind === "objection" ? "border-warn/50 text-warn hover:bg-warn/10" : "border-line/50 text-line hover:bg-line/10",
                )}
                title={s.u.text}
              >
                {s.kind === "objection" ? "Jump: " : "Row hurts: "}{s.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {g && !utterances.length ? (
          <p className="text-xs text-subtle">{live ? "Waiting for transcript… Granola may only publish it once the meeting ends; if so this fills in after the call." : "No transcript yet."}</p>
        ) : null}
        {utterances.slice(-200).map((u) => (
          <div key={u.i} className={cn("group rounded-md px-2.5 py-1.5 text-xs leading-relaxed", u.who === "you" ? "bg-raised/60 text-muted" : "bg-raised text-fg")}>
            <span className={cn("mr-1.5 font-medium", u.who === "you" ? "text-subtle" : "text-line")}>{u.who === "you" ? "You" : u.speaker || "Them"}</span>
            {u.text}
            {onCapture && currentNode?.noteKey && u.who !== "you" ? (
              <button type="button" onClick={() => onCapture(u.text)} className="ml-2 hidden text-[10px] uppercase tracking-[0.12em] text-subtle hover:text-fg group-hover:inline">
                capture
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {g ? (
        <p className="text-[10px] text-subtle">
          {live ? `Polling every ${POLL_MS / 1000}s` : "Call ended"}{lastPoll ? ` · last ${new Date(lastPoll).toLocaleTimeString()}` : ""} · <a className="underline" href={g.url} target="_blank" rel="noreferrer">open in Granola</a>
        </p>
      ) : null}
    </div>
  );
}
