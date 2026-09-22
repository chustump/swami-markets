"use client";

import { useRouter } from "next/navigation";
import { Button, PageHeader, Eyebrow } from "@/components/ui";
import { getNode, OBJECTION_INDEX } from "@/lib/sales/tree";
import { interpolate } from "@/lib/sales/interpolate";
import { useSales, useLiveCall } from "@/lib/sales/store";
import { emptyNotes } from "@/lib/sales/types";

export default function ObjectionsPage() {
  const router = useRouter();
  const { profile, goTo, startCall } = useSales();
  const live = useLiveCall();
  const notes = live?.notes || emptyNotes("them", profile.company);

  const drop = (item) => {
    if (live) {
      goTo(live.id, item.id, { objection: item.label });
    } else {
      const call = startCall({ prospectName: "Drill", company: "", mode: "drill" });
      goTo(call.id, item.id, { objection: item.label });
    }
    router.push("/call");
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Playbook" title="Objections">
        Answer with a question or a distinction, never a rebuttal. Value first, then the specific incumbent, then
        cost, then people, then timing. Never attack Kafka — draw the boundary and let them place themselves.
      </PageHeader>

      <div className="flex flex-col gap-6">
        {OBJECTION_INDEX.map((item, i) => {
          const node = getNode(item.id);
          if (!node) return null;
          return (
            <article key={item.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl md:text-3xl">
                  <span className="mr-2 text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </h2>
                <Button variant="outline" size="sm" onClick={() => drop(item)}>
                  Drop into a call
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted">{item.principle}</p>
              <p className="mt-1 text-xs text-subtle">{item.order}</p>
              <div className="mt-4 rounded-lg bg-paper p-4 text-paper-fg">
                <Eyebrow className="text-paper-fg/50">Say this</Eyebrow>
                <p className="font-display mt-2 text-xl leading-snug md:text-2xl">{interpolate(node.script, profile, notes)}</p>
              </div>
              {node.vault?.length ? (
                <ul className="mt-3 space-y-1.5">
                  {node.vault.map((v) => (
                    <li key={v} className="text-sm text-muted">{interpolate(v, profile, notes)}</li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtle">
                {node.branches.map((b) => (
                  <span key={b.id}>
                    {b.label} → {getNode(b.next)?.title.replace(/\{[^}]+\}/g, "…")}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
