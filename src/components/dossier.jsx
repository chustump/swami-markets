"use client";

import { Eyebrow, cn } from "./ui";
import { NOTE_FIELDS } from "@/lib/sales/types";
import { CONTRAST } from "@/lib/sales/discovery";
import { PRODUCT_BY_ID } from "@/lib/sales/products";
import { useSales } from "@/lib/sales/store";

export function suggestedProducts(call) {
  const counts = {};
  for (const rowId of call.hurts || []) {
    const row = CONTRAST.find((r) => r.id === rowId);
    if (!row) continue;
    for (const p of row.products) counts[p] = (counts[p] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => PRODUCT_BY_ID[id])
    .filter(Boolean)
    .slice(0, 2);
}

export function Dossier({ call }) {
  const { profile, toggleHurt } = useSales();
  const filled = NOTE_FIELDS.filter((f) => call.notes[f.key]?.trim());
  const products = suggestedProducts(call);

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-surface p-4">
      <div>
        <Eyebrow>Deal</Eyebrow>
        <p className="mt-1 text-sm font-medium">{profile.name}</p>
        <p className="text-xs text-muted">
          {profile.productName} · {profile.persona}
        </p>
      </div>

      <div>
        <Eyebrow>Which rows hurt</Eyebrow>
        <p className="mt-1 text-xs text-subtle">Tap a row when they wince. It picks the product.</p>
        <ul className="mt-2 space-y-1">
          {CONTRAST.map((row) => {
            const on = (call.hurts || []).includes(row.id);
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => toggleHurt(call.id, row.id)}
                  className={cn(
                    "w-full rounded-md border px-2.5 py-2 text-left text-xs leading-snug transition-colors",
                    on ? "border-line bg-line/10 text-fg" : "border-border text-muted hover:text-fg",
                  )}
                >
                  {row.legacy}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {products.length ? (
        <div>
          <Eyebrow>Lead with</Eyebrow>
          <ul className="mt-1.5 space-y-2">
            {products.map((p) => (
              <li key={p.id} className="rounded-md bg-raised px-3 py-2">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="mt-0.5 text-xs text-muted">{p.line}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <Eyebrow>Their words</Eyebrow>
        {filled.length === 0 ? (
          <p className="mt-1 text-xs text-subtle">Nothing captured yet. Notes you type on a card land here and feed later scripts.</p>
        ) : (
          <dl className="mt-1.5 space-y-2">
            {filled.map((f) => (
              <div key={f.key}>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-subtle">{f.label}</dt>
                <dd className="text-sm leading-snug">{call.notes[f.key]}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {call.objectionsHit.length ? (
        <div>
          <Eyebrow>Objections hit</Eyebrow>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {call.objectionsHit.map((o) => (
              <li key={o} className="rounded-full bg-raised px-2 py-0.5 text-xs text-muted">
                {o}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
