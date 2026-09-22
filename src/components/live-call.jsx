"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, PanelRight } from "lucide-react";
import { Badge, Button, Textarea, Eyebrow, cn } from "./ui";
import { NodeCard } from "./node-card";
import { Dossier } from "./dossier";
import { TranscriptPanel } from "./transcript-panel";
import { interpolate } from "@/lib/sales/interpolate";
import { useSales } from "@/lib/sales/store";
import { getNode, OBJECTION_INDEX, START_NODE, TERMINAL_STATUS } from "@/lib/sales/tree";
import { PHASES, PHASE_META, PHASE_ENTRY, STATUS_META } from "@/lib/sales/types";

function formatElapsed(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function PhaseRail({ current, onJump }) {
  const currentI = PHASES.indexOf(current);
  return (
    <ol className="hidden w-44 shrink-0 flex-col gap-0.5 lg:flex">
      {PHASES.map((phase, i) => {
        const meta = PHASE_META[phase];
        const done = i < currentI;
        const active = phase === current;
        return (
          <li key={phase}>
            <button
              type="button"
              onClick={() => onJump(PHASE_ENTRY[phase])}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                active ? "bg-raised text-fg" : "text-muted hover:text-fg",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  meta.redLine && !done ? "bg-line" : done ? "bg-ok" : active ? "bg-fg" : "bg-border",
                )}
              />
              <span className="leading-tight">{meta.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function SideTabs({ side, setSide, linked }) {
  return (
    <div className="mb-2 flex gap-1">
      {[
        ["dossier", "Dossier"],
        ["transcript", linked ? "Transcript ●" : "Transcript"],
      ].map(([k, label]) => (
        <button
          key={k}
          type="button"
          onClick={() => setSide(k)}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11px] uppercase tracking-[0.12em]",
            side === k ? "bg-raised text-fg" : "text-subtle hover:text-fg",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function LiveCall({ call }) {
  const router = useRouter();
  const { profile, goTo, back, patchNotes, finish } = useSales();
  const node = getNode(call.currentNodeId) ?? getNode(START_NODE);
  const [note, setNote] = useState("");
  const [dossierOpen, setDossierOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [side, setSide] = useState("dossier");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNote(node.noteKey ? call.notes[node.noteKey] || "" : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  useEffect(() => {
    if (call.status !== "live") return undefined;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [call.status]);

  const elapsed = formatElapsed((call.endedAt ?? now) - call.startedAt);

  const capture = (sample) => {
    const value = note.trim() || (sample ? interpolate(sample, profile, call.notes) : "");
    if (node.noteKey && value) patchNotes(call.id, { [node.noteKey]: value });
  };

  const captureFromTranscript = (text) => {
    if (!node.noteKey || !text) return;
    const next = note.trim() ? `${note.trim()} ${text}` : text;
    setNote(next);
    patchNotes(call.id, { [node.noteKey]: next });
  };

  const take = (branchId) => {
    const branch = node.branches.find((b) => b.id === branchId);
    if (!branch) return;
    capture(call.mode === "drill" ? branch.sample : undefined);
    if (branch.next === node.id) return;
    const target = getNode(branch.next);
    const entering = target && target.kind === "objection" && target.id !== "obj_router";
    const objection = entering ? OBJECTION_INDEX.find((o) => o.id === target.id)?.label || target.title : undefined;
    goTo(call.id, branch.next, objection ? { objection } : undefined);
  };

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "b" || e.key === "Backspace") {
        e.preventDefault();
        back(call.id);
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= Math.min(9, node.branches.length)) {
        e.preventDefault();
        take(node.branches[n - 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const end = (status) => {
    capture();
    finish(call.id, status);
    router.push("/tracker");
  };

  const phaseChips = useMemo(() => {
    const i = PHASES.indexOf(node.phase);
    return PHASES.map((p, idx) => ({ p, active: idx === i, done: idx < i }));
  }, [node.phase]);

  const terminalStatus = TERMINAL_STATUS[node.id];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <Eyebrow>
              {call.mode === "drill" ? "Drill" : "Live call"} · {profile.name}
            </Eyebrow>
            <h1 className="font-display text-3xl leading-none">
              {call.prospectName}
              {call.company ? <span className="text-muted"> · {call.company}</span> : null}
            </h1>
          </div>
          <Badge tone={STATUS_META[call.status]?.tone || "mute"}>{STATUS_META[call.status]?.label || call.status}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm tabular-nums text-muted">{elapsed}</span>
          <Button variant="ghost" size="sm" onClick={() => back(call.id)}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setDossierOpen((v) => !v)} aria-label="Toggle dossier">
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:hidden">
        {phaseChips.map(({ p, active, done }) => (
          <span
            key={p}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em]",
              active ? "bg-paper text-paper-fg" : done ? "text-ok" : "text-subtle",
            )}
          >
            {PHASE_META[p].short}
          </span>
        ))}
      </div>

      <div className="flex items-start gap-5">
        <PhaseRail current={node.phase} onJump={(id) => goTo(call.id, id)} />

        <div className="min-w-0 flex-1">
          <NodeCard node={node} profile={profile} notes={call.notes} />

          {node.noteKey ? (
            <div className="mt-4">
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-subtle">
                {node.notePrompt ?? "Capture their words"}
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => capture()}
                placeholder={
                  call.mode === "drill"
                    ? "Drill: pick a branch and the sample fills in — or type your own"
                    : "Type what they said. It lands in the dossier and feeds later scripts."
                }
                rows={3}
              />
            </div>
          ) : null}

          <Eyebrow className="mb-2 mt-5">They say</Eyebrow>
          <div className="flex flex-col gap-2">
            {node.branches.map((branch, i) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => take(branch.id)}
                className="group rounded-lg bg-ink px-4 py-3.5 text-left text-ink-fg ring-1 ring-border transition-colors duration-150 hover:ring-line/60"
              >
                <span className="mr-2 font-mono text-[11px] text-ink-fg/40">{i + 1}</span>
                <span className="text-sm font-medium leading-snug">{branch.label}</span>
                {branch.hint ? <span className="mt-1 block text-xs leading-relaxed text-ink-fg/55">{branch.hint}</span> : null}
                {call.mode === "drill" && branch.sample ? (
                  <span className="mt-1 block text-xs italic text-ink-fg/45">“{interpolate(branch.sample, profile, call.notes)}”</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setJumpOpen((v) => !v)}>
              Jump to objection
            </Button>
            {terminalStatus ? (
              <Button variant={terminalStatus === "advanced" ? "line" : "mute"} size="sm" onClick={() => end(terminalStatus)}>
                Mark {STATUS_META[terminalStatus].label.toLowerCase()}
              </Button>
            ) : (
              <>
                <Button variant="line" size="sm" onClick={() => end("advanced")}>
                  Advanced
                </Button>
                <Button variant="outline" size="sm" onClick={() => end("nurture")}>
                  Nurture
                </Button>
                <Button variant="ghost" size="sm" onClick={() => end("disqualified")}>
                  Disqualify
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => end("noshow")}>
              No-show
            </Button>
          </div>

          {jumpOpen ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {OBJECTION_INDEX.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    goTo(call.id, o.id, { objection: o.label });
                    setJumpOpen(false);
                  }}
                  className="rounded-md border border-border bg-raised px-3 py-2.5 text-left text-sm hover:bg-surface"
                >
                  {o.label}
                </button>
              ))}
            </div>
          ) : null}

          <p className="mt-4 text-[11px] text-subtle">Keys 1–{Math.min(9, node.branches.length)} pick a branch. B goes back.</p>
        </div>

        <div className="hidden h-[calc(100vh-10rem)] w-[22rem] shrink-0 flex-col lg:flex">
          <SideTabs side={side} setSide={setSide} linked={Boolean(call.granola)} />
          <div className="min-h-0 flex-1">
            {side === "dossier" ? <Dossier call={call} /> : <TranscriptPanel call={call} onCapture={captureFromTranscript} />}
          </div>
        </div>
      </div>

      {dossierOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/70" aria-label="Close dossier" onClick={() => setDossierOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-xl bg-bg p-4 pb-24">
            <SideTabs side={side} setSide={setSide} linked={Boolean(call.granola)} />
            <div className="min-h-0 flex-1 overflow-y-auto">
              {side === "dossier" ? <Dossier call={call} /> : <TranscriptPanel call={call} onCapture={captureFromTranscript} />}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
