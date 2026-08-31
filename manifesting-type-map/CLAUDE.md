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
