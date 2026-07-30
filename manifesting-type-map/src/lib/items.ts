import type { ManifestingType } from './types';

export const ITEM_BANK_VERSION = 1;

export interface AssessmentItem {
  id: number;
  type: ManifestingType;
  text: string;
}

// Each item maps to exactly one type. Presentation order is randomized at
// runtime (see shuffleOrder), but this mapping is fixed.
export const ITEM_BANK: readonly AssessmentItem[] = [
  // Proof-Seeker
  { id: 1, type: 'proof-seeker', text: "If someone can't explain why a practice works, I won't keep doing it." },
  { id: 2, type: 'proof-seeker', text: "I'd rather track something for two weeks than trust how it feels." },
  { id: 3, type: 'proof-seeker', text: 'Language like "the universe will provide" makes me tune out.' },
  { id: 4, type: 'proof-seeker', text: 'I want instructions with clear steps and a set duration.' },
  // Engine
  { id: 5, type: 'engine', text: 'Sitting still with my own thoughts makes me restless.' },
  { id: 6, type: 'engine', text: 'I figure things out by doing, not by reflecting.' },
  { id: 7, type: 'engine', text: "If I don't see progress within a week, I lose interest." },
  { id: 8, type: 'engine', text: "When I'm stuck, moving my body helps more than thinking harder." },
  // Receiver
  { id: 9, type: 'receiver', text: 'I pick up on the mood of a room before anyone says anything.' },
  { id: 10, type: 'receiver', text: 'Holding tightly to a goal makes me anxious.' },
  { id: 11, type: 'receiver', text: "How a decision feels matters more to me than whether it's optimal." },
  { id: 12, type: 'receiver', text: "I'd rather describe who I'm becoming than list what I want." },
  // Architect
  { id: 13, type: 'architect', text: 'I want a system that runs whether or not I feel motivated.' },
  { id: 14, type: 'architect', text: "I'd happily spend an evening organizing a plan." },
  { id: 15, type: 'architect', text: 'Writing something by hand makes it feel real.' },
  { id: 16, type: 'architect', text: 'Inspiration without a repeatable process is useless to me.' },
  // Beacon
  { id: 17, type: 'beacon', text: 'Goals that are only about me are hard to stay committed to.' },
  { id: 18, type: 'beacon', text: "I'm far more driven when other people are counting on me." },
  { id: 19, type: 'beacon', text: 'I need to know the purpose before I care about the method.' },
  { id: 20, type: 'beacon', text: 'Most of my best opportunities have come through relationships.' },
];

export const SCALE_LABELS: readonly string[] = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
];

export interface TiebreakerItem {
  pair: [ManifestingType, ManifestingType];
  optionA: string; // maps to pair[0]
  optionB: string; // maps to pair[1]
}

// Forced choice, shown only on a near-tie between two types.
// One pair per type combination (10 pairs).
export const TIEBREAKERS: readonly TiebreakerItem[] = [
  {
    pair: ['proof-seeker', 'engine'],
    optionA: "Before I commit to a practice, I want to understand exactly why it should work.",
    optionB: "I'd rather start moving today and figure out the why as I go.",
  },
  {
    pair: ['proof-seeker', 'receiver'],
    optionA: 'I trust a two-week log over a gut feeling, every time.',
    optionB: 'I trust how something feels over what the numbers say.',
  },
  {
    pair: ['proof-seeker', 'architect'],
    optionA: 'What keeps me going is seeing the evidence stack up.',
    optionB: 'What keeps me going is the routine itself, evidence or not.',
  },
  {
    pair: ['proof-seeker', 'beacon'],
    optionA: "I'll stay with a practice if the results are measurable.",
    optionB: "I'll stay with a practice if someone else is counting on me.",
  },
  {
    pair: ['engine', 'receiver'],
    optionA: 'When life feels stuck, I take action — any action.',
    optionB: 'When life feels stuck, I slow down and let things settle.',
  },
  {
    pair: ['engine', 'architect'],
    optionA: 'Momentum matters more to me than having the perfect plan.',
    optionB: 'A written plan matters more to me than raw momentum.',
  },
  {
    pair: ['engine', 'beacon'],
    optionA: "I'm driven most by a deadline I can feel getting closer.",
    optionB: "I'm driven most by people who are relying on me.",
  },
  {
    pair: ['receiver', 'architect'],
    optionA: "I'd rather hold a loose picture of who I'm becoming.",
    optionB: "I'd rather write one definite aim and read it every day.",
  },
  {
    pair: ['receiver', 'beacon'],
    optionA: 'My best decisions come from tuning into myself.',
    optionB: 'My best decisions come from the people around me.',
  },
  {
    pair: ['architect', 'beacon'],
    optionA: 'Give me a system I can run alone, daily, without fail.',
    optionB: 'Give me a purpose that reaches beyond just me.',
  },
];

export function findTiebreaker(
  a: ManifestingType,
  b: ManifestingType
): TiebreakerItem | undefined {
  return TIEBREAKERS.find(
    (t) =>
      (t.pair[0] === a && t.pair[1] === b) ||
      (t.pair[0] === b && t.pair[1] === a)
  );
}

// Fisher-Yates shuffle of item ids, so users can't pattern-match blocks.
export function shuffleOrder(rng: () => number = Math.random): number[] {
  const ids = ITEM_BANK.map((i) => i.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}
