# Manifesting Type Map — App Build Spec

**Hand this whole file to Claude Code.** Save it in the project root as `SPEC.md`, then create `CLAUDE.md` from the section at the bottom.

---

## 0. Decisions already made (and why)

You're not a mobile engineer, and the fastest path to two app stores from one codebase is not a close call:

| Decision | Choice | Why |
|---|---|---|
| Framework | **React Native + Expo (SDK 51+)** | One codebase → iOS + Android. EAS Build compiles in the cloud, so you never open Xcode or Android Studio. Over-the-air updates let you ship fixes without a store review. |
| Language | **TypeScript** | Claude Code writes materially better code with types, and the scoring logic needs them. |
| Navigation | **Expo Router** (file-based) | Fewer moving parts than React Navigation config. |
| State | **Zustand** | Small, no boilerplate. Redux is overkill here. |
| Storage | **MMKV** (via `react-native-mmkv`) | Local-first. **No backend in v1.** |
| Styling | **NativeWind** (Tailwind for RN) | You already think in Tailwind classes from web work. |
| Backend | **None in v1** | See below — this is the important one. |

**Why no backend in v1:** accounts, auth, password reset, a server, and a privacy policy covering stored personal data is roughly 60% of the build effort and 100% of the ongoing cost — for a v1 that doesn't need any of it. Everything lives on the device. You can add Supabase in v2 the day someone asks to sync across devices. Build the thing that ships.

**Two calls worth revisiting before you start:**
1. **Free vs. paid.** Spec below assumes free assessment + free 7-day protocol, then a paywall for the ongoing practice engine. If you'd rather it be a pure free lead magnet feeding your channel and email list, delete Phase 4 and the build gets a week shorter.
2. **Quiz on web too.** Your video CTA points to a "two-minute assessment." A web quiz converts far better from YouTube than "go install an app." Consider shipping the web quiz first, app second — same scoring logic, reusable.

---

## 1. What the app is

A ~4 minute assessment sorts the user into one of five manifesting types, then unlocks a **daily practice engine that is genuinely different per type** — different inputs, different screens, different cadence, different success metric.

That last part is the product. A quiz that spits out a label and a paragraph is a BuzzFeed quiz. The differentiated practice engine is what makes it a tool worth keeping on a home screen.

### The five types

| Type | Core mechanism | Daily practice | Success metric |
|---|---|---|---|
| **Proof-Seeker** | Evidence before belief | Timed rehearsal session + evidence log | Sessions logged, 14-day lockout before results shown |
| **Engine** | State and motion first | Deadline goal + momentum check-in | Days of visible action + weekly review kept |
| **Receiver** | Identity before outcome | Present-tense identity statement + one anchor | Statements read + anchor honored |
| **Architect** | Written system, run daily | Definite aim, read every morning | Unbroken read streak (30-day target) |
| **Beacon** | Purpose through people | Goal + beneficiary statement | Beneficiary named, weekly impact note |

---

## 2. The assessment

### Design

20 statements, 5-point agreement scale (Strongly disagree → Strongly agree). 4 items per type. One statement per screen, big thumb targets, swipe or tap to advance, progress bar. No back-out, no skipping.

**Critical scoring detail — do not skip this.** Raw sums don't work: agreeable people score high on everything and get a meaningless flat profile. You must **ipsatize** — score each type relative to that person's own average.

```
For each respondent:
  rawScore[type]   = sum of the 4 item responses for that type   // range 4–20
  mean             = average of the 5 rawScores
  stdDev           = standard deviation of the 5 rawScores
  normScore[type]  = stdDev === 0 ? 0 : (rawScore[type] - mean) / stdDev

  primary   = type with highest normScore
  secondary = type with second highest normScore

  // Tie handling
  if (top two normScores differ by < 0.15) → show forced-choice tiebreaker screen
```

Store `normScore` for all five — you need the full profile for the "borrow from your opposite" feature, not just the winner.

### Item bank

Each item maps to exactly one type. **Randomize presentation order** so users can't pattern-match, but keep the type mapping fixed.

**Proof-Seeker**
1. If someone can't explain why a practice works, I won't keep doing it.
2. I'd rather track something for two weeks than trust how it feels.
3. Language like "the universe will provide" makes me tune out.
4. I want instructions with clear steps and a set duration.

**Engine**
5. Sitting still with my own thoughts makes me restless.
6. I figure things out by doing, not by reflecting.
7. If I don't see progress within a week, I lose interest.
8. When I'm stuck, moving my body helps more than thinking harder.

**Receiver**
9. I pick up on the mood of a room before anyone says anything.
10. Holding tightly to a goal makes me anxious.
11. How a decision feels matters more to me than whether it's optimal.
12. I'd rather describe who I'm becoming than list what I want.

**Architect**
13. I want a system that runs whether or not I feel motivated.
14. I'd happily spend an evening organizing a plan.
15. Writing something by hand makes it feel real.
16. Inspiration without a repeatable process is useless to me.

**Beacon**
17. Goals that are only about me are hard to stay committed to.
18. I'm far more driven when other people are counting on me.
19. I need to know the purpose before I care about the method.
20. Most of my best opportunities have come through relationships.

### Tiebreaker items

Forced choice, "which is more true?", shown only on a near-tie between two types. Write one pair per type combination (10 pairs) — Claude Code can draft these from the items above and you edit.

---

## 3. Screen inventory

```
/                        Welcome — one line of promise, "Begin" button
/assessment/[index]      One statement per screen, progress bar
/assessment/tiebreak     Conditional
/result                  Type reveal (animated), core description, secondary type
/onboarding/setup        Type-specific first-time setup — DIFFERENT PER TYPE
/home                    Today's practice — DIFFERENT PER TYPE
/history                 Streaks, logs, past entries
/opposite                "Borrow from your opposite" — one cross-type exercise weekly
/settings                Notification time, retake assessment, export data, legal
/paywall                 Phase 4 only
```

### The type-specific screens — build these as five separate components

Do **not** build one generic screen with conditional text. The differentiation is the product. `/home` should route to one of:

- **`ProofSeekerHome`** — timer (default 20 min, adjustable), start/stop, post-session log field, a 14-day grid. Results and trends are **hidden until day 14** — this is intentional and it's the type's core discipline. Show "Day 6 of 14. Keep collecting."
- **`EngineHome`** — the goal with a live countdown to its deadline, a single "what moved today?" input, and a Friday review that is a hard modal — it blocks the app until answered.
- **`ReceiverHome`** — identity statement in large type, present tense, read-only most days. One "anchor" — a single scheduled commitment. Deliberately sparse, slow animations, no streak counter (streaks create the grip that hurts this type).
- **`ArchitectHome`** — the definite aim rendered in a handwriting-style font, a prominent unbroken-streak counter, and an edit lock: **the aim cannot be edited for the first 30 days.** Show "Locked for 24 more days" with a small explanation.
- **`BeaconHome`** — goal plus "who else benefits," beneficiary shown alongside the goal always, plus a weekly "what changed for them?" note.

Note the deliberate contradictions: the Architect gets a locked streak counter, the Receiver gets no streak at all. If a user retakes and switches types, the app should feel like a different app. That's the point, and it's the thing reviewers and users will screenshot.

---

## 4. Data model

```typescript
type ManifestingType = 'proof-seeker' | 'engine' | 'receiver' | 'architect' | 'beacon';

interface Profile {
  primary: ManifestingType;
  secondary: ManifestingType;
  scores: Record<ManifestingType, number>;   // normalized
  completedAt: string;                        // ISO
  version: number;                            // item-bank version, for future re-scoring
}

interface PracticeEntry {
  id: string;
  date: string;                               // YYYY-MM-DD, local
  type: ManifestingType;
  payload: Record<string, unknown>;           // shape varies by type
  durationSeconds?: number;
}

interface Commitment {
  goal: string;
  deadline?: string;
  identityStatement?: string;
  definiteAim?: string;
  beneficiary?: string;
  createdAt: string;
  lockedUntil?: string;
}
```

Everything in MMKV under keys `profile`, `commitment`, `entries`. Add `exportAll()` returning JSON from day one — it's ten minutes of work and it's what you'll need for both the data-export requirement and any future migration.

---

## 5. Build phases

Tell Claude Code to complete and verify each phase on a real device before starting the next. Do not let it attempt the whole app in one pass — you'll get a large amount of plausible code that doesn't run.

**Phase 1 — Shell + assessment.** Expo project, navigation, all 20 items, scoring with ipsatization, result screen. Unit tests on the scoring function specifically: all-same-answers, all-max, all-min, and a known profile that should return Architect. Verify in Expo Go on your own phone.

**Phase 2 — Practice engines.** All five home screens as separate components. Commitment setup per type. Local persistence. Test by manually forcing each type in dev.

**Phase 3 — Retention.** Local notifications at a user-chosen time, streak logic, history view, the weekly "opposite" exercise, export.

**Phase 4 — Ship.** Icon and splash, paywall via RevenueCat if monetizing, EAS Build, TestFlight and Google Play internal testing, store listings.

---

## 6. Store submission — read before Phase 4

Three things reject wellness apps, and all three are avoidable:

1. **Don't call it a psychological or personality assessment.** Call it a "style quiz" or "approach finder." Claiming psychometric validity invites scrutiny you can't satisfy and isn't true of a 20-item instrument. Include a plain disclaimer on the result screen: this is a self-reflection tool, not a psychological assessment or medical advice.
2. **No health or outcome claims anywhere** — not in the app, not in the store listing, not in the screenshots. No "reduce anxiety," no "attract abundance," no income implications.
3. **App Store guideline 4.2 (minimum functionality).** A quiz plus static text gets rejected as a repackaged web page. The differentiated practice engines with local persistence and notifications are what clear this bar — which is another reason not to shortcut Phase 2.

Also required: a privacy policy URL even with zero data collection (state plainly that data never leaves the device), and if you add subscriptions, the paywall must show price, duration, and links to terms and privacy before purchase.

---

## 7. CLAUDE.md

Create this file in the project root:

```markdown
# Manifesting Type Map

React Native + Expo (SDK 51+), TypeScript, Expo Router, Zustand, MMKV, NativeWind.
Full requirements in SPEC.md — read it before writing code.

## Rules
- Local-first. No backend, no auth, no network calls in v1.
- TypeScript strict mode. No `any`.
- Build in the phases defined in SPEC.md §5. Stop at the end of each phase and report status. Do not start the next phase without confirmation.
- The five type-specific home screens are SEPARATE components with different layouts and different logic. Never collapse them into one screen with conditional copy.
- Scoring must ipsatize per SPEC.md §2. Unit test it before building any UI on top of it.
- No health claims, no outcome claims, no clinical or psychometric language in any user-facing string.
- Run `npx tsc --noEmit` and the test suite before declaring a phase complete.

## Commands
npm start          # Expo dev server
npm test           # Jest
npx tsc --noEmit   # type check
```

### Opening prompt for Claude Code

> Read SPEC.md and CLAUDE.md. Then execute Phase 1 only: scaffold the Expo project with the stack in §0, implement the 20-item assessment from §2 with the ipsatized scoring algorithm, and build the result screen. Write unit tests for the scoring function first and show me them passing before you build any UI. Stop when Phase 1 runs in Expo Go and report what you built.

---

## 8. What I'd cut if you want this in two weekends

Drop Phases 3 and 4 entirely. Ship the assessment plus the five practice engines, free, no paywall, no notifications. Put the install link under the video, watch which type dominates your comments, and build the retention features for that type first instead of guessing for all five.
