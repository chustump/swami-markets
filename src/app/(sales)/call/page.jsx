"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Card, Eyebrow } from "@/components/ui";
import { LiveCall } from "@/components/live-call";
import { useSales, useLiveCall } from "@/lib/sales/store";

export default function CallPage() {
  const router = useRouter();
  const { hydrated, startCall, calls, setActive } = useSales();
  const call = useLiveCall();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  if (!hydrated) return <p className="text-sm text-subtle">Loading…</p>;
  if (call) return <LiveCall call={call} />;

  const otherLive = calls.filter((c) => c.status === "live");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow className="text-line">Live</Eyebrow>
        <h1 className="font-display mt-2 text-4xl">No call open</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Start one here, or from the <Link href="/" className="text-fg underline">board</Link>. The deal profile on the
          Deal page decides which product, proof, and next step the scripts use.
        </p>
      </div>
      <Card className="max-w-xl">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Who" />
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="paper"
            onClick={() => {
              startCall({ prospectName: name, company, mode: "live" });
              router.refresh();
            }}
          >
            Start live call
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              startCall({ prospectName: name, company, mode: "drill" });
              router.refresh();
            }}
          >
            Run a drill
          </Button>
        </div>
      </Card>
      {otherLive.length ? (
        <div>
          <Eyebrow>Open calls</Eyebrow>
          <ul className="mt-2 space-y-2">
            {otherLive.map((c) => (
              <li key={c.id}>
                <Button variant="outline" size="sm" onClick={() => setActive(c.id)}>
                  Resume {c.prospectName}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
