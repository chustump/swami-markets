"use client";

import { useRouter } from "next/navigation";
import { Badge, Button, PageHeader, Stat } from "@/components/ui";
import { useSales } from "@/lib/sales/store";
import { STATUS_META } from "@/lib/sales/types";

export default function TrackerPage() {
  const router = useRouter();
  const { calls, hydrated, setActive, reopen, deleteCall } = useSales();

  const decided = calls.filter((c) => c.status !== "live" && c.status !== "noshow");
  const advanced = decided.filter((c) => c.status === "advanced");
  const nurture = calls.filter((c) => c.status === "nurture");
  const rate = decided.length ? Math.round((advanced.length / decided.length) * 100) : 0;

  const objectionCounts = {};
  for (const c of calls) for (const o of c.objectionsHit) objectionCounts[o] = (objectionCounts[o] || 0) + 1;
  const topObjections = Object.entries(objectionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Activity" title="Tracker">
        Advanced means a next step with a date, an owner, and a decision attached. Nurture needs a trigger written
        down. Disqualified is a win for the calendar.
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Advance rate" value={hydrated && decided.length ? `${rate}%` : "—"} />
        <Stat label="Advanced" value={hydrated ? String(advanced.length) : "—"} />
        <Stat label="Nurture" value={hydrated ? String(nurture.length) : "—"} />
        <Stat label="Logged" value={hydrated ? String(calls.length) : "—"} />
      </div>

      {topObjections.length ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-subtle">Most-hit objections:</span>
          {topObjections.map(([o, n]) => (
            <span key={o} className="rounded-full bg-raised px-3 py-1">
              {o} <span className="text-subtle">×{n}</span>
            </span>
          ))}
        </div>
      ) : null}

      {!hydrated ? null : calls.length === 0 ? (
        <p className="text-sm text-muted">No calls yet. Start one from the board.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface text-[11px] uppercase tracking-[0.14em] text-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Who</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Seam</th>
                <th className="px-4 py-3 font-medium">Next step / trigger</th>
                <th className="px-4 py-3 font-medium">Objections</th>
                <th className="px-4 py-3 font-medium">Granola</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {calls.map((c) => (
                <tr key={c.id} className="border-t border-border align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.prospectName}</p>
                    <p className="text-xs text-subtle">{c.company || c.mode}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted">
                    {new Date(c.startedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_META[c.status]?.tone || "mute"}>{STATUS_META[c.status]?.label || c.status}</Badge>
                  </td>
                  <td className="max-w-48 px-4 py-3 text-xs text-muted">{c.notes.problem || "—"}</td>
                  <td className="max-w-56 px-4 py-3 text-xs text-muted">{c.notes.nextStep || "—"}</td>
                  <td className="max-w-48 px-4 py-3 text-xs text-muted">{c.objectionsHit.length ? c.objectionsHit.join(", ") : "—"}</td>
                  <td className="max-w-48 px-4 py-3 text-xs text-muted">
                    {c.granola ? (
                      <a className="underline hover:text-fg" href={c.granola.url} target="_blank" rel="noreferrer">
                        {c.granola.utterances?.length ? `${c.granola.utterances.length} lines` : "linked"}
                      </a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {c.status === "live" ? (
                        <Button variant="outline" size="sm" onClick={() => { setActive(c.id); router.push("/call"); }}>
                          Resume
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => { reopen(c.id); router.push("/call"); }}>
                          Reopen
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteCall(c.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
