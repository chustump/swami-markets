import { ITEM_BANK } from './items';
import { ALL_TYPES, type ManifestingType } from './types';

export const TIE_THRESHOLD = 0.15;

/** Responses keyed by item id (1-20), each value 1-5. */
export type ResponseMap = Record<number, number>;

export interface ScoreResult {
  raw: Record<ManifestingType, number>; // 4-20 per type
  scores: Record<ManifestingType, number>; // ipsatized
  /** All five types ordered by normalized score, highest first. */
  ranking: ManifestingType[];
  primary: ManifestingType;
  secondary: ManifestingType;
  /** Lowest-scoring type — the "borrow from your opposite" source. */
  opposite: ManifestingType;
  needsTiebreak: boolean;
  tiebreakPair?: [ManifestingType, ManifestingType];
}

/**
 * Ipsatized scoring: each type is scored relative to the respondent's own
 * mean, so uniformly agreeable response styles don't produce a meaningless
 * flat-high profile.
 */
export function scoreAssessment(responses: ResponseMap): ScoreResult {
  const answered = Object.keys(responses).length;
  if (answered !== ITEM_BANK.length) {
    throw new Error(
      `Expected ${ITEM_BANK.length} responses, got ${answered}`
    );
  }

  const raw = {} as Record<ManifestingType, number>;
  for (const type of ALL_TYPES) {
    raw[type] = 0;
  }
  for (const item of ITEM_BANK) {
    const value = responses[item.id];
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Error(`Invalid response for item ${item.id}: ${String(value)}`);
    }
    raw[item.type] += value;
  }

  const rawValues = ALL_TYPES.map((t) => raw[t]);
  const mean = rawValues.reduce((a, b) => a + b, 0) / rawValues.length;
  const variance =
    rawValues.reduce((acc, v) => acc + (v - mean) ** 2, 0) / rawValues.length;
  const stdDev = Math.sqrt(variance);

  const scores = {} as Record<ManifestingType, number>;
  for (const type of ALL_TYPES) {
    scores[type] = stdDev === 0 ? 0 : (raw[type] - mean) / stdDev;
  }

  // Stable ranking: by normalized score desc, then by fixed type order.
  const ranking = [...ALL_TYPES].sort((a, b) => scores[b] - scores[a]);

  const primary = ranking[0];
  const secondary = ranking[1];
  const opposite = ranking[ranking.length - 1];
  const needsTiebreak = scores[primary] - scores[secondary] < TIE_THRESHOLD;

  return {
    raw,
    scores,
    ranking,
    primary,
    secondary,
    opposite,
    needsTiebreak,
    tiebreakPair: needsTiebreak ? [primary, secondary] : undefined,
  };
}
