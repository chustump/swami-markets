"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, PageHeader, Eyebrow, cn } from "@/components/ui";
import { NodeCard } from "@/components/node-card";
import { useSales, useLiveCall } from "@/lib/sales/store";
import { nodesForPhase, getNode } from "@/lib/sales/tree";
import { PHASES, PHASE_META, emptyNotes } from "@/lib/sales/types";

export default function TreePage() {
  const router = useRouter();
  const { profile, goTo, startCall } = useSales();
  const live = useLiveCall();
  const [phase, setPhase] = useState(PHASES[0]);
  const notes = live?.notes || emptyNotes("them", profile.company);
  const nodes = nodesForPhase(phase);

  const drop = (nodeId) => {
    if (live) {
      goTo(live.id, nodeId);
    } else {
      const call = startCall({ prospectName: "Drill", company: "", mode: "drill" });
      goTo(call.id, nodeId);
    }
    router.push("/call");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Reference" title="The full tree">
        Every card, by phase, rendered against the current deal profile{live ? " and the live call's notes" : ""}.
        Branch labels show where each answer leads.
      </PageHeader>

      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1">
        {PHASES.map((p, i) => (
          <button
            key={p}
            type="button"
            onClick={() => setPhase(p)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.12em]",
              p === phase ? "bg-paper text-paper-fg" : "bg-raised text-muted hover:text-fg",
            )}
          >
            {String(i + 1).padStart(2, "0")} {PHASE_META[p].short}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {nodes.map((node) => (
          <div key={node.id} className="grid gap-3 lg:grid-cols-[1fr_20rem]">
            <NodeCard node={node} profile={profile} notes={notes} compact />
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <Eyebrow>They say → you go</Eyebrow>
                <Button variant="ghost" size="sm" onClick={() => drop(node.id)}>
                  Drop in
                </Button>
              </div>
              <ul className="mt-2 space-y-1.5">
                {node.branches.map((b) => {
                  const target = getNode(b.next);
                  return (
                    <li key={b.id} className="text-xs leading-snug">
                      <span className="text-fg">{b.label}</span>
                      <span className="text-subtle"> → {target ? target.title.replace(/\{[^}]+\}/g, "…") : b.next}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
