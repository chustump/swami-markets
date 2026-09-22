"use client";

import { PageHeader, Eyebrow, Card } from "@/components/ui";
import { PLAYS } from "@/lib/sales/plays";
import { ASSETS, CUSTOMERS, METRICS, METRIC_RULE, NVIDIA_STORY } from "@/lib/sales/proof";
import { PRODUCTS, LAND_AND_EXPAND, PORTFOLIO_RULE, COMMERCIAL_GUARDRAILS } from "@/lib/sales/products";

export default function PlaysPage() {
  return (
    <div className="flex flex-col gap-12">
      <PageHeader eyebrow="Plays" title="Between the calls">
        What to do when the thread goes quiet, the champion needs ammo, security is blocking, or the POC is drifting.
        Plus the proof and the products, so nothing gets asserted that isn&apos;t public.
      </PageHeader>

      <section className="grid gap-4 lg:grid-cols-2">
        {PLAYS.map((play) => (
          <Card key={play.id}>
            <h2 className="font-display text-2xl">{play.title}</h2>
            <p className="mt-1 text-xs text-subtle">{play.when}</p>
            <ol className="mt-4 space-y-3">
              {play.steps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="mt-0.5 font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="font-display text-3xl">Products</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{PORTFOLIO_RULE}</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Card key={p.id}>
              <Eyebrow>{p.name}</Eyebrow>
              <p className="font-display mt-1 text-lg leading-snug">{p.line}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.detail}</p>
              <dl className="mt-3 grid gap-2 text-xs">
                <div><dt className="text-subtle">Who buys it</dt><dd className="text-fg">{p.buyer}</dd></div>
                <div><dt className="text-subtle">Lead with it when</dt><dd className="text-fg">{p.leadWhen}</dd></div>
                <div><dt className="text-subtle">Don&apos;t</dt><dd className="text-fg">{p.dontLead}</dd></div>
                <div><dt className="text-subtle">Expansion</dt><dd className="text-fg">{p.expansion}</dd></div>
              </dl>
            </Card>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-subtle">Land and expand:</span>
          {LAND_AND_EXPAND.map((s, i) => (
            <span key={s.id} className="rounded-full bg-raised px-3 py-1">
              {i + 1}. {PRODUCTS.find((p) => p.id === s.id).name} <span className="text-subtle">— {s.when}</span>
            </span>
          ))}
        </div>
        <ul className="mt-4 space-y-1 text-xs text-subtle">
          {COMMERCIAL_GUARDRAILS.map((g) => (
            <li key={g}>· {g}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <Eyebrow>Public customers — pick by adjacency</Eyebrow>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {CUSTOMERS.map((c) => (
              <li key={c.name} className="text-sm">
                <span className="text-fg">{c.name}</span> <span className="text-subtle">· {c.segment}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-lg bg-raised p-4">
            <p className="text-sm font-medium">{NVIDIA_STORY.headline}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{NVIDIA_STORY.body}</p>
            <p className="mt-2 text-xs text-subtle">{NVIDIA_STORY.link} · {NVIDIA_STORY.guardrail}</p>
          </div>
        </Card>
        <Card>
          <Eyebrow>Numbers — {METRIC_RULE}</Eyebrow>
          <ul className="mt-3 space-y-2">
            {METRICS.map((m) => (
              <li key={m.label} className="flex items-baseline justify-between gap-3">
                <span className="text-sm">
                  <span className="font-display text-xl tabular-nums">{m.value}</span> <span className="text-muted">{m.label}</span>
                </span>
                <span className="max-w-[55%] text-right text-xs text-subtle">{m.useWhen}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <h2 className="font-display text-3xl">Assets and CTAs</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">Match the asset to the buyer&apos;s stage. One CTA per touch.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ASSETS.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium">{a.name}</p>
                <span className="rounded-full bg-raised px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-subtle">{a.stage}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{a.what}</p>
              <p className="mt-2 text-xs leading-relaxed text-fg/80">{a.useAs}</p>
              <p className="mt-2 font-mono text-[11px] text-subtle">{a.url}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
