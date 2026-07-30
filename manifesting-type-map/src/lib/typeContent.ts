import type { ManifestingType } from './types';

export interface TypeContent {
  key: ManifestingType;
  name: string;
  emblem: string;
  /** NativeWind color token, see tailwind.config.js */
  color: string;
  hex: string;
  tagline: string;
  mechanism: string;
  description: string;
  practiceSummary: string;
  /** One exercise this type lends to others via "borrow from your opposite". */
  borrowedExercise: {
    title: string;
    instructions: string;
  };
}

export const TYPE_CONTENT: Record<ManifestingType, TypeContent> = {
  'proof-seeker': {
    key: 'proof-seeker',
    name: 'Proof-Seeker',
    emblem: '◎',
    color: 'proof-seeker',
    hex: '#5eaefd',
    tagline: 'Evidence before belief.',
    mechanism:
      'You commit when you can see it working. Vague promises lose you; a clear protocol with a set duration wins you.',
    description:
      'You approach change like an experiment. You want clear steps, a defined window, and a record you can look back on. That skepticism is not a flaw — it is your engine. So your practice is built like a trial: a daily rehearsal session, an evidence log, and a strict rule that you do not judge results until day 14. Collect first, conclude later.',
    practiceSummary:
      'A timed daily rehearsal session plus an evidence log. Trends stay hidden until day 14 — collect before you conclude.',
    borrowedExercise: {
      title: 'Run a 3-day log',
      instructions:
        'For the next three days, write down one concrete observation per day about your goal — something that actually happened, however small. No interpretation, just the record. On day three, read all three back.',
    },
  },
  engine: {
    key: 'engine',
    name: 'Engine',
    emblem: '⚡',
    color: 'engine',
    hex: '#ff7a59',
    tagline: 'State and motion first.',
    mechanism:
      'You think by moving. Stillness stalls you; a deadline you can feel getting closer is what wakes you up.',
    description:
      'Reflection is not your doorway — motion is. You build momentum through visible action, and you lose interest the moment progress goes invisible. So your practice is a deadline goal with a live countdown, one daily question — what moved today? — and a weekly review you cannot skip. Keep the wheel turning and let the momentum do the convincing.',
    practiceSummary:
      'A deadline goal with a countdown, a daily "what moved today?" check-in, and a Friday review that will not let you scroll past it.',
    borrowedExercise: {
      title: 'Take one visible action',
      instructions:
        'Pick the smallest physical action that moves your goal forward — a message sent, a box packed, a page drafted — and do it before the day ends. Done beats planned.',
    },
  },
  receiver: {
    key: 'receiver',
    name: 'Receiver',
    emblem: '☾',
    color: 'receiver',
    hex: '#b48ef0',
    tagline: 'Identity before outcome.',
    mechanism:
      'You move by becoming, not by chasing. Gripping a goal tightly makes it heavier; describing who you are becoming makes it lighter.',
    description:
      'You are tuned to atmosphere — yours and everyone else\'s. Pressure and streaks create exactly the grip that works against you, so your practice deliberately has neither. Instead: one identity statement in the present tense, read slowly, and one anchor — a single commitment you keep because it belongs to the person you are becoming. Quiet, spacious, unhurried.',
    practiceSummary:
      'A present-tense identity statement and one anchor commitment. No streaks, no counters — space instead of grip.',
    borrowedExercise: {
      title: 'Loosen the grip',
      instructions:
        'Rewrite your goal as a single present-tense sentence about who you are, not what you want. Read it once, slowly, then put it away and go about your day without checking on it.',
    },
  },
  architect: {
    key: 'architect',
    name: 'Architect',
    emblem: '▲',
    color: 'architect',
    hex: '#e8c468',
    tagline: 'A written system, run daily.',
    mechanism:
      'You trust structure over mood. A definite aim, written down and read every morning, runs whether or not you feel like it.',
    description:
      'Inspiration without a repeatable process is noise to you — what you want is a system that runs on rails. So your practice is the oldest one in the book: a definite aim, written in your own words, read every single morning. It locks for the first 30 days — no rewriting, no tinkering — because the repetition is the mechanism. The streak is the proof the system is running.',
    practiceSummary:
      'One definite aim, read every morning, with an unbroken-streak counter. The aim locks for the first 30 days.',
    borrowedExercise: {
      title: 'Write it by hand',
      instructions:
        'Write your goal out longhand, in full sentences, as one definite aim. Tomorrow morning, before you look at your phone, read it once. Just once. Notice what one day of structure feels like.',
    },
  },
  beacon: {
    key: 'beacon',
    name: 'Beacon',
    emblem: '✷',
    color: 'beacon',
    hex: '#57c99b',
    tagline: 'Purpose through people.',
    mechanism:
      'You are strongest when it is not just about you. A goal gains gravity the moment someone else benefits from it.',
    description:
      'Solo goals go quiet on you; shared ones get loud. Your best opportunities have come through people, and your persistence shows up when someone is counting on you. So your practice keeps the beneficiary in the frame at all times: your goal and the person it serves, side by side, plus a weekly note on what actually changed for them. Purpose first — the method follows.',
    practiceSummary:
      'Your goal and its beneficiary, always shown together, with a weekly "what changed for them?" note.',
    borrowedExercise: {
      title: 'Name who benefits',
      instructions:
        'Write one sentence naming a specific person who is better off if your goal happens, and how. Keep that sentence next to your goal for a week and notice what it does to your follow-through.',
    },
  },
};

export const TYPE_ORDER: readonly ManifestingType[] = [
  'proof-seeker',
  'engine',
  'receiver',
  'architect',
  'beacon',
];
