# Manifesting Type Map

A ~4 minute quiz sorts you into one of five manifesting styles, then unlocks a
daily practice engine that is genuinely different per type. Local-first: no
backend, no accounts, nothing leaves the device. Full product spec in
[SPEC.md](./SPEC.md).

## Stack

Expo SDK 57 · TypeScript (strict) · Expo Router · Zustand · MMKV · NativeWind

## Run it

```bash
npm install
npm start          # Expo dev server — scan the QR with Expo Go
npm test           # Jest (scoring + streak logic)
npx tsc --noEmit   # type check
```

In dev builds, the welcome screen has a "force type" row so you can jump into
any of the five practice engines without taking the quiz.

## Storage note

MMKV is the primary store, but its native module isn't available inside Expo
Go — there the app automatically falls back to `expo-sqlite/kv-store` (still
persistent), and on web to `localStorage`. For MMKV itself, use a development
build (`npx expo run:ios` / `run:android` or EAS Build).

Scheduled daily reminders may also require a development build depending on
platform; the settings screen fails soft and tells you if scheduling isn't
available.

## Build status (SPEC.md §5)

- [x] Phase 1 — shell + assessment: 20 items, ipsatized scoring (unit tested),
      tiebreakers, animated result screen
- [x] Phase 2 — practice engines: five separate home screens + per-type setup,
      local persistence
- [x] Phase 3 — retention: daily local notifications, streaks, history,
      weekly "borrow from your opposite" exercise, JSON export
- [ ] Phase 4 — ship: icon/splash, optional RevenueCat paywall, EAS Build,
      TestFlight / Play internal testing, store listings

Before starting Phase 4, read SPEC.md §6 (store-submission constraints):
no psychometric or health claims anywhere, and a privacy policy URL is
required even with zero data collection.
