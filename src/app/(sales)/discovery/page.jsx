"use client";

import { useState } from "react";
import { Card, PageHeader, Eyebrow, Button, cn } from "@/components/ui";
import { CONTRAST, CONTRAST_HEADLINE, PERSONAS, NARRATIVE } from "@/lib/sales/discovery";
import { PRODUCT_BY_ID } from "@/lib/sales/products";
import { useSales, useLiveCall } from "@/lib/sales/store";

export default function DiscoveryPage() {
  const { toggleHurt } = useSales();
  const live = useLiveCall();
  const [persona, setPersona] = useState(PERSONAS[0].id);
  const [localHurts, setLocalHurts] = useState([]);
  const hurts = live ? live.hurts || [] : localHurts;

  const toggle = (id) => {
    if (live) toggleHurt(live.id, id);
    else setLocalHurts((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  };

  const counts = {};
  for (const rowId of hurts) {
    const row = CONTRAST.find((r) => r.id === rowId);
    if (row) for (const p of row.products) counts[p] = (counts[p] || 0) + 1;
  }
  const lead = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id]) => PRODUCT_BY_ID[id]);
  const current = PERSONAS.find((p) => p.id === persona);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow="Discovery" title="Which rows hurt">
        Walk them down the left column and ask which rows hurt. Whichever they pick becomes the deal.
        {live ? " Picks here are saved to the live call." : " Open a call and picks are saved to its dossier."}
      </PageHeader>

      <section>
        <p className="font-display text-2xl">{CONTRAST_HEADLINE}</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-[1fr_1fr] bg-surface text-[11px] uppercase tracking-[0.14em] text-subtle">
            <div className="px-4 py-3">Cloud-centric systems</div>
            <div className="px-4 py-3">Modern distributed systems</div>
          </div>
          {CONTRAST.map((row) => {
            const on = hurts.includes(row.id);
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => toggle(row.id)}
                className={cn(
                  "grid w-full grid-cols-[1fr_1fr] border-t border-border text-left transition-colors",
                  on ? "bg-line/10" : "hover:bg-raised",
                )}
              >
                <div className="px-4 py-3">
                  <p className={cn("text-sm", on ? "text-fg" : "text-muted")}>{row.legacy}</p>
                  <p className="mt-1 text-xs text-subtle">Ask: {row.probe}</p>
                </div>
                <div className="px-4 py-3 text-sm text-fg">{row.modern}</div>
              </button>
            );
          })}
        </div>
        {lead.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-subtle">Lead with:</span>
            {lead.map((p) => (
              <span key={p.id} className="rounded-full bg-raised px-3 py-1 text-fg">{p.name}</span>
            ))}
          </div>
        ) : null}
      </section>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-3xl">Questions by persona</h2>
          <p className="text-xs text-subtle">Ask, don&apos;t assert.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {PERSONAS.map((p) => (
            <Button key={p.id} size="sm" variant={p.id === persona ? "paper" : "outline"} onClick={() => setPersona(p.id)}>
              {p.label}
            </Button>
          ))}
        </div>
        {current ? (
          <Card className="mt-4">
            <Eyebrow>What they care about</Eyebrow>
            <p className="mt-1 text-sm text-muted">{current.cares}</p>
            <ol className="mt-4 space-y-3">
              {current.questions.map((q, i) => (
                <li key={q} className="flex gap-3">
                  <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-display text-lg leading-snug">{q}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-subtle">
              Usually lands on: {current.products.map((id) => PRODUCT_BY_ID[id].name).join(" · ")}
            </p>
          </Card>
        ) : null}
      </section>

      <section>
        <h2 className="font-display text-3xl">The meta agent narrative</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          The arc for a first-call deck or a keynote. On a call, you only need Act 1 and Act 2 — the rest is proof.
        </p>
        <ol className="mt-4 grid gap-3 lg:grid-cols-2">
          {NARRATIVE.map((a) => (
            <li key={a.act} className="rounded-xl border border-border bg-surface p-4">
              <Eyebrow>{a.act}</Eyebrow>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
