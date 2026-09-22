"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PROFILE } from "./profiles";
import { START_NODE } from "./tree";
import { emptyNotes } from "./types";

const KEY = "synadia-sales-os-v1";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function initialState() {
  return { profile: DEFAULT_PROFILE, calls: [], activeCallId: null };
}

function migrate(raw) {
  const base = initialState();
  if (!raw || typeof raw !== "object") return base;
  return {
    profile: raw.profile && raw.profile.pillars ? { ...DEFAULT_PROFILE, ...raw.profile } : base.profile,
    calls: Array.isArray(raw.calls) ? raw.calls : [],
    activeCallId: typeof raw.activeCallId === "string" ? raw.activeCallId : null,
  };
}

const Ctx = createContext(null);

export function SalesProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);
  const skipSave = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState(migrate(JSON.parse(raw)));
    } catch {
      // storage unavailable or corrupt — run in memory
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ignore quota / private mode
    }
  }, [state, hydrated]);

  const update = useCallback((fn) => setState((s) => fn(s)), []);

  const actions = useMemo(
    () => ({
      setProfile: (profile) => update((s) => ({ ...s, profile })),
      startCall: ({ prospectName, company, mode }) => {
        const name = (prospectName || "").trim() || (mode === "drill" ? "Priya" : "Prospect");
        const co = (company || "").trim() || (mode === "drill" ? "Northwind Robotics" : "");
        const call = {
          id: uid(),
          profileId: DEFAULT_PROFILE.id,
          prospectName: name,
          company: co,
          mode,
          startedAt: Date.now(),
          status: "live",
          notes: emptyNotes(name, co),
          hurts: [],
          currentNodeId: START_NODE,
          path: [START_NODE],
          objectionsHit: [],
        };
        update((s) => ({
          ...s,
          calls: [{ ...call, profileId: s.profile.id }, ...s.calls],
          activeCallId: call.id,
        }));
        return call;
      },
      setActive: (id) => update((s) => ({ ...s, activeCallId: id })),
      patchNotes: (id, patch) =>
        update((s) => ({
          ...s,
          calls: s.calls.map((c) => (c.id === id ? { ...c, notes: { ...c.notes, ...patch } } : c)),
        })),
      toggleHurt: (id, rowId) =>
        update((s) => ({
          ...s,
          calls: s.calls.map((c) => {
            if (c.id !== id) return c;
            const hurts = c.hurts || [];
            return {
              ...c,
              hurts: hurts.includes(rowId) ? hurts.filter((h) => h !== rowId) : [...hurts, rowId],
            };
          }),
        })),
      goTo: (id, nodeId, extra) =>
        update((s) => ({
          ...s,
          calls: s.calls.map((c) => {
            if (c.id !== id) return c;
            const objectionsHit =
              extra?.objection && !c.objectionsHit.includes(extra.objection)
                ? [...c.objectionsHit, extra.objection]
                : c.objectionsHit;
            return { ...c, currentNodeId: nodeId, path: [...c.path, nodeId], objectionsHit };
          }),
        })),
      back: (id) =>
        update((s) => ({
          ...s,
          calls: s.calls.map((c) => {
            if (c.id !== id || c.path.length < 2) return c;
            const path = c.path.slice(0, -1);
            return { ...c, path, currentNodeId: path[path.length - 1] };
          }),
        })),
      finish: (id, status) =>
        update((s) => ({
          ...s,
          calls: s.calls.map((c) => (c.id === id ? { ...c, status, endedAt: Date.now() } : c)),
          activeCallId: s.activeCallId === id ? null : s.activeCallId,
        })),
      reopen: (id) =>
        update((s) => ({
          ...s,
          calls: s.calls.map((c) => (c.id === id ? { ...c, status: "live", endedAt: undefined } : c)),
          activeCallId: id,
        })),
      linkGranola: (id, note) =>
        update((s) => ({
          ...s,
          calls: s.calls.map((c) =>
            c.id === id
              ? { ...c, granola: { noteId: note.id, title: note.title, url: note.url, linkedAt: Date.now(), utterances: [], summary: null, syncedAt: null } }
              : c,
          ),
        })),
      unlinkGranola: (id) =>
        update((s) => ({ ...s, calls: s.calls.map((c) => (c.id === id ? { ...c, granola: null } : c)) })),
      setGranolaTranscript: (id, utterances, extra) =>
        update((s) => ({
          ...s,
          calls: s.calls.map((c) =>
            c.id === id && c.granola ? { ...c, granola: { ...c.granola, utterances, ...(extra || {}) } } : c,
          ),
        })),
      deleteCall: (id) =>
        update((s) => ({
          ...s,
          calls: s.calls.filter((c) => c.id !== id),
          activeCallId: s.activeCallId === id ? null : s.activeCallId,
        })),
      resetAll: () => update(() => initialState()),
    }),
    [update],
  );

  const value = useMemo(() => ({ ...state, hydrated, ...actions }), [state, hydrated, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSales() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSales must be used inside SalesProvider");
  return ctx;
}

export function useActiveCall() {
  const { calls, activeCallId } = useSales();
  return calls.find((c) => c.id === activeCallId) ?? null;
}

export function useLiveCall() {
  const { calls, activeCallId } = useSales();
  return calls.find((c) => c.id === activeCallId && c.status === "live") ?? calls.find((c) => c.status === "live") ?? null;
}
