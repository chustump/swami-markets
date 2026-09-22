"use client";

import { useMemo, useState } from "react";
import { Card, PageHeader, Eyebrow, Textarea, cn } from "@/components/ui";
import { checkLanguage, wordCount, SWAPS, VOICE_RULES, OUTBOUND_PATTERN, OUTBOUND_RULE } from "@/lib/sales/language";
import { QUOTES } from "@/lib/sales/proof";

const SAMPLE =
  "Subject: agents across two clouds\n\nPriya,\n\nSaw the engineering post about running inference on both Bedrock and Vertex.\n\nWhen an agent on one side needs to hand work to an agent on the other, where does that state live today, and what happens if the receiver is down when it arrives?\n\nReplit and Browserbase both hit that seam. They ended up putting one fabric underneath rather than stitching the two clouds together at the API layer.\n\nWorth 20 minutes to compare notes on how they structured it?";

export default function LanguagePage() {
  const [text, setText] = useState("");
  const hits = useMemo(() => checkLanguage(text), [text]);
  const words = wordCount(text);
  const emDashes = (text.match(/—/g) || []).length;
  const notBut = (text.match(/\bnot\b[^.]{0,60}\bbut\b/gi) || []).length;
  const noticed = /\bI noticed\b/i.test(text);
  const ctas = (text.match(/\?/g) || []).length;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow="Talk track" title="Language check">
        Paste an email, a LinkedIn message, or a slide. It flags retired framing, hype adjectives, and the patterns
        that read as AI-written. Nothing leaves the browser.
      </PageHeader>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Textarea rows={14} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the draft here…" />
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-subtle">
            <span className={cn(words > 120 && "text-warn")}>{words} words{words > 120 ? " · over 120 for outbound" : ""}</span>
            <span className={cn(emDashes > 1 && "text-warn")}>{emDashes} em-dash{emDashes === 1 ? "" : "es"}</span>
            {notBut ? <span className="text-warn">{notBut} “not X but Y” construction{notBut > 1 ? "s" : ""}</span> : null}
            {noticed ? <span className="text-warn">“I noticed” opener</span> : null}
            <button type="button" className="underline hover:text-fg" onClick={() => setText(SAMPLE)}>Load a worked example</button>
            <button type="button" className="underline hover:text-fg" onClick={() => setText("")}>Clear</button>
          </div>
        </div>
        <Card>
          <Eyebrow>Findings</Eyebrow>
          {!text.trim() ? (
            <p className="mt-2 text-sm text-subtle">Waiting for a draft.</p>
          ) : hits.length === 0 ? (
            <p className="mt-2 text-sm text-ok">No retired framing or hype adjectives. Now read it as the prospect would after clicking through to synadia.com.</p>
          ) : (
            <ul className="mt-2 space-y-3">
              {hits.map((h, i) => (
                <li key={`${h.term}-${h.index}-${i}`} className="rounded-md bg-raised p-3">
                  <p className="text-sm">
                    <span className={cn("font-medium", h.kind === "hype" ? "text-danger" : "text-warn")}>“{h.term}”</span>
                    <span className="text-subtle"> · {h.kind === "hype" ? "hype adjective" : "retired framing"}</span>
                  </p>
                  <p className="mt-1 text-xs text-fg/85">Use instead: {h.current}</p>
                  <p className="mt-1 text-xs text-subtle">{h.why}</p>
                </li>
              ))}
            </ul>
          )}
          {text.trim() ? (
            <p className="mt-4 text-xs text-subtle">
              Self-check: does it open on their problem, not a product? Is there exactly one CTA? {ctas === 0 ? "No question mark found — where's the ask?" : ""}
            </p>
          ) : null}
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Eyebrow>Outbound pattern — {OUTBOUND_RULE}</Eyebrow>
          <ol className="mt-3 space-y-2.5">
            {OUTBOUND_PATTERN.map((s, i) => (
              <li key={s.step} className="flex gap-3">
                <span className="font-mono text-xs text-subtle">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium">{s.step}</p>
                  <p className="text-xs leading-relaxed text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <Eyebrow>Voice</Eyebrow>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {VOICE_RULES.map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <h2 className="font-display text-3xl">Retired → current</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          The left column is what most existing collateral still says. Reach for the right.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          {SWAPS.map((s, i) => (
            <div key={s.id} className={cn("grid gap-2 px-4 py-3 md:grid-cols-[1fr_1fr]", i > 0 && "border-t border-border")}>
              <div>
                <p className="text-sm text-muted line-through decoration-danger/60">{s.retired.join(" · ")}</p>
                <p className="mt-1 text-xs text-subtle">{s.why}</p>
              </div>
              <p className="text-sm text-fg">{s.current}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl">Quotable</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Company language, fine as-is in Synadia-branded material. Under your own byline, rework them so the post
          doesn&apos;t read as pasted marketing copy.
        </p>
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          {QUOTES.map((q) => (
            <li key={q} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">{q}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
