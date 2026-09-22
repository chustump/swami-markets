"use client";

import { Badge, Eyebrow, cn } from "./ui";
import { interpolate } from "@/lib/sales/interpolate";
import { PHASE_META } from "@/lib/sales/types";

const KIND_LABEL = {
  closer: "You ask",
  checkpoint: "Checkpoint",
  pitch: "You say",
  objection: "You answer",
  close: "You close",
};

export function NodeCard({ node, profile, notes, compact = false }) {
  const meta = PHASE_META[node.phase];
  return (
    <article
      className={cn(
        "rounded-xl bg-paper text-paper-fg",
        node.redLine ? "ring-2 ring-line" : "",
        compact ? "p-4" : "p-5 md:p-6",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow className="text-paper-fg/50">{meta.label}</Eyebrow>
          {node.redLine ? (
            <Badge tone="line">Red line</Badge>
          ) : (
            <span className="inline-flex items-center rounded-full bg-paper-fg/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-paper-fg/70">
              {KIND_LABEL[node.kind]}
            </span>
          )}
        </div>
      </div>
      <h2 className={cn("font-display mt-2 leading-tight", compact ? "text-xl" : "text-2xl md:text-3xl")}>
        {interpolate(node.title, profile, notes)}
      </h2>
      <p className={cn("mt-3 leading-snug", compact ? "text-base" : "text-lg md:text-xl")}>
        {interpolate(node.script, profile, notes)}
      </p>
      {node.vault?.length ? (
        <div className="mt-4 border-t border-paper-fg/10 pt-3">
          <Eyebrow className="text-paper-fg/50">Other ways to say it</Eyebrow>
          <ul className="mt-1.5 space-y-1.5">
            {node.vault.map((v) => (
              <li key={v} className="text-sm leading-relaxed text-paper-fg/80">
                {interpolate(v, profile, notes)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {node.subcom || node.why ? (
        <div className="mt-4 grid gap-3 border-t border-paper-fg/10 pt-3 sm:grid-cols-2">
          {node.subcom ? (
            <div>
              <Eyebrow className="text-paper-fg/50">Delivery</Eyebrow>
              <p className="mt-1 text-xs leading-relaxed text-paper-fg/75">{node.subcom}</p>
            </div>
          ) : null}
          {node.why ? (
            <div>
              <Eyebrow className="text-paper-fg/50">Why it matters</Eyebrow>
              <p className="mt-1 text-xs leading-relaxed text-paper-fg/75">{node.why}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
