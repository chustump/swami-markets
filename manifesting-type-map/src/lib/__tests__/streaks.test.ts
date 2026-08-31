import { addDays, daysBetween, toDateKey } from '../dates';
import { currentStreak, longestStreak } from '../streaks';

describe('dates', () => {
  test('toDateKey formats local dates', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  test('addDays crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  test('daysBetween is signed and whole-day', () => {
    expect(daysBetween('2026-01-01', '2026-01-15')).toBe(14);
    expect(daysBetween('2026-01-15', '2026-01-01')).toBe(-14);
    expect(daysBetween('2026-01-01', '2026-01-01')).toBe(0);
  });
});

describe('streaks', () => {
  test('empty history is a zero streak', () => {
    expect(currentStreak([], '2026-01-10')).toBe(0);
    expect(longestStreak([])).toBe(0);
  });

  test('streak ending today counts today', () => {
    expect(
      currentStreak(['2026-01-08', '2026-01-09', '2026-01-10'], '2026-01-10')
    ).toBe(3);
  });

  test("streak isn't broken before today's practice is done", () => {
    expect(currentStreak(['2026-01-08', '2026-01-09'], '2026-01-10')).toBe(2);
  });

  test('a gap breaks the streak', () => {
    expect(
      currentStreak(['2026-01-05', '2026-01-06', '2026-01-09'], '2026-01-10')
    ).toBe(1);
    expect(currentStreak(['2026-01-05', '2026-01-06'], '2026-01-10')).toBe(0);
  });

  test('duplicate same-day entries count once', () => {
    expect(
      currentStreak(['2026-01-09', '2026-01-09', '2026-01-10'], '2026-01-10')
    ).toBe(2);
  });

  test('longestStreak finds the longest historical run', () => {
    expect(
      longestStreak([
        '2026-01-01',
        '2026-01-02',
        '2026-01-03',
        '2026-01-07',
        '2026-01-08',
      ])
    ).toBe(3);
  });
});
