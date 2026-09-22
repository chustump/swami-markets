"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, PageHeader, Eyebrow, Textarea, cn } from "@/components/ui";
import { PROFILE_TEMPLATES } from "@/lib/sales/profiles";
import { PRODUCTS } from "@/lib/sales/products";
import { CUSTOMERS } from "@/lib/sales/proof";
import { TOKEN_HELP } from "@/lib/sales/interpolate";
import { useSales } from "@/lib/sales/store";

const FIELDS = [
  ["name", "Profile name", "Multi-cloud AI platform"],
  ["company", "Account (default)", "Northwind Robotics"],
  ["industry", "Industry", "AI infrastructure"],
  ["persona", "Persona", "AI / ML engineering lead"],
  ["useCase", "What they're building", "fleets of agents split across two clouds"],
  ["incumbent", "Incumbent / stack", "HTTP APIs, a gateway, and a queue bolted on"],
  ["proof", "Proof customer(s)", "Replit and Browserbase"],
  ["metric", "One number", "45+ client libraries"],
  ["cta", "Next step you'll ask for", "a 45-minute architecture review with your architect in the room"],
];

export default function DealPage() {
  const { profile, setProfile, hydrated } = useSales();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (hydrated) setDraft(profile);
  }, [hydrated, profile]);

  const patch = (key, value) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const patchPillar = (i, key, value) => {
    setSaved(false);
    setDraft((d) => {
      const pillars = d.pillars.map((p, idx) => (idx === i ? { ...p, [key]: value } : p));
      return { ...d, pillars };
    });
  };
  const pickProduct = (p) => {
    setSaved(false);
    setDraft((d) => ({ ...d, product: p.id, productName: p.name, productLine: p.line }));
  };

  const save = () => {
    setProfile({ ...draft, id: draft.id || "custom" });
    setSaved(true);
  };

  if (!hydrated) return <p className="text-sm text-subtle">Loading…</p>;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Setup" title="The deal">
        Every script in the tree reads from this. Load a template for the kind of account you&apos;re walking into,
        then edit the pillars in the prospect&apos;s own vocabulary before the call.
      </PageHeader>

      <section>
        <Eyebrow>Templates</Eyebrow>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PROFILE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setSaved(false);
                setDraft(t);
              }}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                draft.id === t.id ? "border-line bg-line/10" : "border-border bg-surface hover:bg-raised",
              )}
            >
              <p className="font-display text-lg leading-tight">{t.name}</p>
              <p className="mt-1 text-xs text-muted">{t.productName} · {t.persona}</p>
              <p className="mt-1 text-xs text-subtle">Proof: {t.proof}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <Eyebrow>Account</Eyebrow>
          <div className="mt-3 grid gap-3">
            {FIELDS.map(([key, label, ph]) => (
              <label key={key} className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-subtle">{label}</span>
                <Input value={draft[key] || ""} onChange={(e) => patch(key, e.target.value)} placeholder={ph} />
              </label>
            ))}
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-subtle">Proof story (one mechanism, not a logo parade)</span>
              <Textarea rows={3} value={draft.proofStory || ""} onChange={(e) => patch("proofStory", e.target.value)} />
            </label>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <Eyebrow>Lead product</Eyebrow>
            <div className="mt-3 grid gap-2">
              {PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickProduct(p)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left",
                    draft.product === p.id ? "border-line bg-line/10" : "border-border hover:bg-raised",
                  )}
                >
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted">{p.line}</p>
                </button>
              ))}
            </div>
            <label className="mt-3 block">
              <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-subtle">Attach / second product</span>
              <Input value={draft.secondProduct || ""} onChange={(e) => patch("secondProduct", e.target.value)} placeholder="Synadia Insights" />
            </label>
          </Card>
          <Card>
            <Eyebrow>Public customers you can name</Eyebrow>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {CUSTOMERS.map((c) => c.name).join(" · ")}
            </p>
            <p className="mt-2 text-xs text-subtle">Anything not on this list stays out of the proof field unless it&apos;s a public reference.</p>
          </Card>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-3xl">Three pillars</h2>
          <p className="text-xs text-subtle">Problem → what we do → what changes. Then a check-in.</p>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {draft.pillars.map((p, i) => (
            <Card key={i}>
              <Eyebrow>Pillar {i + 1}</Eyebrow>
              <div className="mt-2 grid gap-2">
                <Input value={p.title} onChange={(e) => patchPillar(i, "title", e.target.value)} placeholder="Title" />
                <Textarea rows={2} value={p.problem} onChange={(e) => patchPillar(i, "problem", e.target.value)} placeholder="Right now… (the problem)" />
                <Textarea rows={3} value={p.process} onChange={(e) => patchPillar(i, "process", e.target.value)} placeholder="What we do is… (the process)" />
                <Textarea rows={2} value={p.outcome} onChange={(e) => patchPillar(i, "outcome", e.target.value)} placeholder="So… (the outcome)" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <Button variant="line" onClick={save}>Save deal profile</Button>
        {saved ? <span className="text-sm text-ok">Saved. The tree now speaks this account.</span> : null}
        <span className="text-xs text-subtle">
          Tokens: {TOKEN_HELP.map(([t]) => t).join("  ")}
        </span>
      </section>
    </div>
  );
}
