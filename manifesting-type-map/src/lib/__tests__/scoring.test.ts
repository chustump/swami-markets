import { ITEM_BANK, TIEBREAKERS, findTiebreaker, shuffleOrder } from '../items';
import { scoreAssessment, TIE_THRESHOLD, type ResponseMap } from '../scoring';
import { ALL_TYPES, type ManifestingType } from '../types';

function respond(fn: (type: ManifestingType, id: number) => number): ResponseMap {
  const responses: ResponseMap = {};
  for (const item of ITEM_BANK) {
    responses[item.id] = fn(item.type, item.id);
  }
  return responses;
}

describe('scoreAssessment', () => {
  test('all-same answers produce a flat profile and force a tiebreak', () => {
    for (const value of [1, 3, 5]) {
      const result = scoreAssessment(respond(() => value));
      for (const type of ALL_TYPES) {
        expect(result.scores[type]).toBe(0);
      }
      expect(result.needsTiebreak).toBe(true);
      expect(result.tiebreakPair).toBeDefined();
    }
  });

  test('all-max answers give raw 20 per type, normalized 0', () => {
    const result = scoreAssessment(respond(() => 5));
    for (const type of ALL_TYPES) {
      expect(result.raw[type]).toBe(20);
      expect(result.scores[type]).toBe(0);
    }
  });

  test('all-min answers give raw 4 per type, normalized 0', () => {
    const result = scoreAssessment(respond(() => 1));
    for (const type of ALL_TYPES) {
      expect(result.raw[type]).toBe(4);
      expect(result.scores[type]).toBe(0);
    }
  });

  test('a known Architect profile returns architect primary', () => {
    // Strongly agrees with architect items, agrees with proof-seeker,
    // neutral-to-low elsewhere.
    const byType: Record<ManifestingType, number> = {
      architect: 5,
      'proof-seeker': 4,
      engine: 2,
      receiver: 2,
      beacon: 3,
    };
    const result = scoreAssessment(respond((type) => byType[type]));
    expect(result.primary).toBe('architect');
    expect(result.secondary).toBe('proof-seeker');
    expect(result.needsTiebreak).toBe(false);
    expect(result.scores.architect).toBeGreaterThan(result.scores['proof-seeker']);
  });

  test('ipsatization: an agreeable responder does not get a flat-high win', () => {
    // Everything 4 except one engine item at 5 — engine should win on the
    // relative profile even though every raw score is high.
    const responses = respond(() => 4);
    responses[5] = 5; // engine item
    const result = scoreAssessment(responses);
    expect(result.primary).toBe('engine');
    expect(result.raw.engine).toBe(17);
  });

  test('ipsatization is invariant to uniform response-style shift where possible', () => {
    const harsh = respond((type) => (type === 'beacon' ? 3 : 1));
    const generous = respond((type) => (type === 'beacon' ? 5 : 3));
    const a = scoreAssessment(harsh);
    const b = scoreAssessment(generous);
    for (const type of ALL_TYPES) {
      expect(a.scores[type]).toBeCloseTo(b.scores[type], 10);
    }
    expect(a.primary).toBe('beacon');
    expect(b.primary).toBe('beacon');
  });

  test('near-tie below threshold triggers the tiebreaker with the top two types', () => {
    // architect and proof-seeker exactly tied at the top.
    const byType: Record<ManifestingType, number> = {
      architect: 5,
      'proof-seeker': 5,
      engine: 2,
      receiver: 2,
      beacon: 2,
    };
    const result = scoreAssessment(respond((type) => byType[type]));
    expect(result.needsTiebreak).toBe(true);
    expect(result.tiebreakPair).toBeDefined();
    const pair = result.tiebreakPair as [ManifestingType, ManifestingType];
    expect(pair.sort()).toEqual(['architect', 'proof-seeker'].sort());
  });

  test('a clear gap above threshold does not trigger the tiebreaker', () => {
    const byType: Record<ManifestingType, number> = {
      receiver: 5,
      architect: 3,
      'proof-seeker': 2,
      engine: 2,
      beacon: 3,
    };
    const result = scoreAssessment(respond((type) => byType[type]));
    expect(result.primary).toBe('receiver');
    expect(result.scores.receiver - result.scores[result.secondary]).toBeGreaterThanOrEqual(
      TIE_THRESHOLD
    );
    expect(result.needsTiebreak).toBe(false);
  });

  test('stores normalized scores for all five types and exposes the opposite', () => {
    const byType: Record<ManifestingType, number> = {
      engine: 5,
      beacon: 4,
      architect: 3,
      'proof-seeker': 2,
      receiver: 1,
    };
    const result = scoreAssessment(respond((type) => byType[type]));
    expect(Object.keys(result.scores).sort()).toEqual([...ALL_TYPES].sort());
    expect(result.opposite).toBe('receiver');
    expect(result.ranking[0]).toBe('engine');
    expect(result.ranking[4]).toBe('receiver');
  });

  test('rejects incomplete or out-of-range responses', () => {
    expect(() => scoreAssessment({})).toThrow();
    const responses = respond(() => 3);
    responses[7] = 9;
    expect(() => scoreAssessment(responses)).toThrow();
  });
});

describe('item bank', () => {
  test('has 20 items, 4 per type', () => {
    expect(ITEM_BANK).toHaveLength(20);
    for (const type of ALL_TYPES) {
      expect(ITEM_BANK.filter((i) => i.type === type)).toHaveLength(4);
    }
  });

  test('has a tiebreaker for every pair of types', () => {
    expect(TIEBREAKERS).toHaveLength(10);
    for (let i = 0; i < ALL_TYPES.length; i++) {
      for (let j = i + 1; j < ALL_TYPES.length; j++) {
        expect(findTiebreaker(ALL_TYPES[i], ALL_TYPES[j])).toBeDefined();
      }
    }
  });

  test('shuffleOrder is a permutation of all item ids', () => {
    const order = shuffleOrder();
    expect([...order].sort((a, b) => a - b)).toEqual(
      ITEM_BANK.map((i) => i.id)
    );
  });
});
