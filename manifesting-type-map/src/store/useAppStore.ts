import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { daysBetween, isoToDateKey, todayKey } from '@/lib/dates';
import { storage } from '@/lib/storage';
import type {
  Commitment,
  ManifestingType,
  PracticeEntry,
  Profile,
  Settings,
} from '@/lib/types';

interface AppState {
  profile: Profile | null;
  commitment: Commitment | null;
  entries: PracticeEntry[];
  settings: Settings;

  setProfile: (profile: Profile) => void;
  setCommitment: (commitment: Commitment) => void;
  addEntry: (entry: Omit<PracticeEntry, 'id' | 'date'> & { date?: string }) => PracticeEntry;
  updateSettings: (patch: Partial<Settings>) => void;
  /** Wipes profile, commitment and entries — used by "retake assessment". */
  resetAll: () => void;
  exportAll: () => string;
}

let entryCounter = 0;
function nextEntryId(): string {
  entryCounter += 1;
  return `${Date.now().toString(36)}-${entryCounter.toString(36)}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      commitment: null,
      entries: [],
      settings: {
        notificationsEnabled: false,
        notificationHour: 8,
        notificationMinute: 0,
      },

      setProfile: (profile) => set({ profile }),
      setCommitment: (commitment) => set({ commitment }),

      addEntry: (entry) => {
        const full: PracticeEntry = {
          id: nextEntryId(),
          date: entry.date ?? todayKey(),
          type: entry.type,
          payload: entry.payload,
          durationSeconds: entry.durationSeconds,
        };
        set((state) => ({ entries: [...state.entries, full] }));
        return full;
      },

      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),

      resetAll: () => set({ profile: null, commitment: null, entries: [] }),

      exportAll: () => {
        const { profile, commitment, entries, settings } = get();
        return JSON.stringify(
          { exportedAt: new Date().toISOString(), profile, commitment, entries, settings },
          null,
          2
        );
      },
    }),
    {
      name: 'mtm-app',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        profile: state.profile,
        commitment: state.commitment,
        entries: state.entries,
        settings: state.settings,
      }),
    }
  )
);

/** Entries for the current profile type, oldest first. */
export function selectTypeEntries(
  entries: readonly PracticeEntry[],
  type: ManifestingType,
  kind?: string
): PracticeEntry[] {
  return entries.filter(
    (e) => e.type === type && (kind === undefined || e.payload.kind === kind)
  );
}

export function hasEntryToday(
  entries: readonly PracticeEntry[],
  type: ManifestingType,
  kind?: string
): boolean {
  const today = todayKey();
  return selectTypeEntries(entries, type, kind).some((e) => e.date === today);
}

/** Day number (1-based) of the protocol, from the commitment's creation. */
export function protocolDay(commitment: Commitment, today = todayKey()): number {
  const start = isoToDateKey(commitment.createdAt);
  return Math.max(1, daysBetween(start, today) + 1);
}
