import { create } from 'zustand';

import { ITEM_BANK, ITEM_BANK_VERSION, shuffleOrder } from '@/lib/items';
import { scoreAssessment, type ResponseMap, type ScoreResult } from '@/lib/scoring';
import type { ManifestingType, Profile } from '@/lib/types';

interface AssessmentState {
  /** Item ids in randomized presentation order. */
  order: number[];
  responses: ResponseMap;
  result: ScoreResult | null;
  /** Primary/secondary after an eventual tiebreak. */
  resolved: { primary: ManifestingType; secondary: ManifestingType } | null;

  start: () => void;
  answer: (itemId: number, value: number) => void;
  /** Scores all 20 responses. Returns the result so the caller can route. */
  finish: () => ScoreResult;
  resolveTiebreak: (winner: ManifestingType) => void;
  buildProfile: () => Profile;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>()((set, get) => ({
  order: [],
  responses: {},
  result: null,
  resolved: null,

  start: () =>
    set({ order: shuffleOrder(), responses: {}, result: null, resolved: null }),

  answer: (itemId, value) =>
    set((state) => ({ responses: { ...state.responses, [itemId]: value } })),

  finish: () => {
    const result = scoreAssessment(get().responses);
    set({
      result,
      resolved: result.needsTiebreak
        ? null
        : { primary: result.primary, secondary: result.secondary },
    });
    return result;
  },

  resolveTiebreak: (winner) => {
    const { result } = get();
    if (!result || !result.tiebreakPair) return;
    const [a, b] = result.tiebreakPair;
    const loser = winner === a ? b : a;
    set({ resolved: { primary: winner, secondary: loser } });
  },

  buildProfile: () => {
    const { result, resolved } = get();
    if (!result || !resolved) {
      throw new Error('Assessment not finished');
    }
    return {
      primary: resolved.primary,
      secondary: resolved.secondary,
      scores: result.scores,
      completedAt: new Date().toISOString(),
      version: ITEM_BANK_VERSION,
    };
  },

  reset: () =>
    set({ order: [], responses: {}, result: null, resolved: null }),
}));

export const TOTAL_ITEMS = ITEM_BANK.length;
