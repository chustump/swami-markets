"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Input, Card, Stat, Eyebrow } from "@/components/ui";
import { useSales } from "@/lib/sales/store";
import { PHASES, PHASE_META, STATUS_META } from "@/lib/sales/types";
import { QUOTES } from "@/lib/sales/proof";

export default function Board() {
  const router = useRouter();
  const { profile, calls, hydrated, startCall, setActive } = useSales();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  const live = calls.find((c) => c.status === "live");
  const closed = calls.filter((c) => c.status !== "live" && c.status !== "noshow");
  const advanced = closed.filter((c) => c.status === "advanced").length;
  const advanceRate = closed.length ? Math.round((advanced / closed.length) * 100) : 0;

  const begin = (mode) => {
    startCall({ prospectName: name, company, mode });
    router.push("/call");
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="max-w-3xl">
        <Eyebrow className="text-line">Synadia · the creators of NATS</Eyebrow>
        <h1 className="font-display mt-3 text-4xl leading-[1] md:text-6xl">Ask before you assert.</h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
          A discovery-first call OS for selling the fabric under agents, devices, and services. White cards are you.
          Dark cards are them. The red line is the commitment to change the layer — you don&apos;t pitch past it.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
          <Link href="/tree" className="hover:text-fg">Full tree</Link>
          <Link href="/discovery" className="hover:text-fg">Discovery bank</Link>
          <Link href="/objections" className="hover:text-fg">Objections</Link>
          <Link href="/plays" className="hover:text-fg">Plays</Link>
          <Link href="/language" className="hover:text-fg">Language check</Link>
          <Link href="/deal" className="hover:text-fg">Set up the deal</Link>
        </div>
      </section>

      {hydrated && live ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/40 bg-surface px-4 py-3">
          <div>
            <Eyebrow className="text-line">In progress</Eyebrow>
            <p className="font-display text-2xl">
              {live.prospectName}
              {live.company ? <span className="text-muted"> · {live.company}</span> : null}
            </p>
          </div>
          <Button
            variant="line"
            onClick={() => {
              setActive(live.id);
              router.push("/call");
            }}
          >
            Resume call
          </Button>
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <Eyebrow>Start</Eyebrow>
          <h2 className="font-display mt-1 text-3xl">Open a call</h2>
          <p className="mt-2 text-sm text-muted">
            Live mode is the companion for the Zoom. Drill mode walks a sample buyer so you can feel the branches
            before it counts.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-subtle">Who</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya, Marcus, Dana…" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-subtle">Company</span>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Northwind Robotics" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="paper" onClick={() => begin("live")}>Start live call</Button>
            <Button variant="outline" onClick={() => begin("drill")}>Run a drill</Button>
          </div>
          <p className="mt-4 text-xs text-subtle">
            Deal loaded: {profile.name} · leading with {profile.productName} · proof {profile.proof}. Swap it under Deal if
            this isn&apos;t the account.
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Advance rate" value={hydrated && closed.length ? `${advanceRate}%` : "—"} hint="Next step booked" />
          <Stat label="Advanced" value={hydrated ? String(advanced) : "—"} />
          <Stat label="Calls logged" value={hydrated ? String(calls.length) : "—"} />
          <Stat label="Live" value={hydrated ? (live ? "1" : "0") : "—"} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl">The arc of the call</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Objections are unclosed doors from discovery. Walk the tree in order. Jump only when they jump.
        </p>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((phase, i) => {
            const meta = PHASE_META[phase];
            return (
              <li key={phase} className="rounded-lg border border-border bg-surface px-4 py-3">
                <Eyebrow>
                  {String(i + 1).padStart(2, "0")}
                  {meta.redLine ? " · red line" : ""}
                </Eyebrow>
                <p className="font-display mt-1 text-xl leading-tight">{meta.label}</p>
                <p className="mt-1 text-xs text-muted">{meta.blurb}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Eyebrow>Lines that carry</Eyebrow>
          <ul className="mt-3 space-y-2.5">
            {QUOTES.slice(0, 5).map((q) => (
              <li key={q} className="font-display text-lg leading-snug">{q}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <Eyebrow>Order of operations</Eyebrow>
          <ol className="mt-3 space-y-2 text-sm text-muted">
            <li><span className="text-fg">1.</span> The agentic and edge story opens the conversation and gives them a reason to care about a re-platform.</li>
            <li><span className="text-fg">2.</span> Kafka, Confluent, RabbitMQ and MQTT pain is a symptom you surface in discovery, not the opener.</li>
            <li><span className="text-fg">3.</span> The displacement math closes it. Cost belongs in the business case after the architecture conversation.</li>
            <li><span className="text-fg">4.</span> One CTA per touch, matched to their stage. A report beats a demo on the first touch.</li>
          </ol>
        </Card>
      </section>

      {hydrated && calls.length > 0 ? (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-3xl">Recent</h2>
            <Link href="/tracker" className="text-sm text-muted hover:text-fg">Tracker</Link>
          </div>
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
            {calls.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {c.prospectName}
                    {c.company ? <span className="text-muted"> · {c.company}</span> : null}
                  </p>
                  <p className="text-xs text-subtle">{new Date(c.startedAt).toLocaleString()}</p>
                </div>
                <Badge tone={STATUS_META[c.status]?.tone || "mute"}>{STATUS_META[c.status]?.label || c.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
