import { addDays, daysBetween } from './dates';

/**
 * Consecutive-day streak ending today (or yesterday, so a streak isn't shown
 * as broken before today's practice is done).
 */
export function currentStreak(dateKeys: readonly string[], today: string): number {
  const days = new Set(dateKeys);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive days anywhere in the history. */
export function longestStreak(dateKeys: readonly string[]): number {
  const unique = [...new Set(dateKeys)].sort();
  let longest = 0;
  let run = 0;
  for (let i = 0; i < unique.length; i++) {
    if (i > 0 && daysBetween(unique[i - 1], unique[i]) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }
  return longest;
}
