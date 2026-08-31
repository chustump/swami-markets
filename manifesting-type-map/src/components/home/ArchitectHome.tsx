import { useState } from 'react';
import { Text, View } from 'react-native';

import { Card, PrimaryButton, SectionLabel, TextField } from '@/components/ui';
import { todayKey } from '@/lib/dates';
import { currentStreak } from '@/lib/streaks';
import { TYPE_CONTENT } from '@/lib/typeContent';
import type { Commitment } from '@/lib/types';
import { hasEntryToday, selectTypeEntries, useAppStore } from '@/store/useAppStore';

const STREAK_TARGET = 30;

/**
 * Architect: the definite aim in a handwritten face, a prominent unbroken
 * streak, and a 30-day edit lock. The repetition is the mechanism; the lock
 * protects it from tinkering.
 */
export function ArchitectHome({ commitment }: { commitment: Commitment }) {
  const entries = useAppStore((s) => s.entries);
  const addEntry = useAppStore((s) => s.addEntry);
  const setCommitment = useAppStore((s) => s.setCommitment);
  const content = TYPE_CONTENT.architect;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(commitment.definiteAim ?? '');

  const reads = selectTypeEntries(entries, 'architect', 'read');
  const readToday = hasEntryToday(entries, 'architect', 'read');
  const streak = currentStreak(reads.map((e) => e.date), todayKey());

  const lockedUntil = commitment.lockedUntil
    ? new Date(commitment.lockedUntil)
    : null;
  const lockDaysLeft = lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil.getTime() - Date.now()) / 86_400_000))
    : 0;
  const locked = lockDaysLeft > 0;

  const saveEdit = () => {
    setCommitment({
      ...commitment,
      goal: draft.trim(),
      definiteAim: draft.trim(),
    });
    setEditing(false);
  };

  return (
    <View className="gap-4">
      <Card accent={content.hex}>
        <SectionLabel>Your definite aim</SectionLabel>
        {editing ? (
          <View className="gap-3">
            <TextField
              value={draft}
              onChangeText={setDraft}
              multiline
              className="min-h-[120px]"
            />
            <PrimaryButton
              label="Save"
              onPress={saveEdit}
              disabled={draft.trim().length < 10}
              tint={content.hex}
            />
          </View>
        ) : (
          <Text
            style={{ fontFamily: 'Caveat_600SemiBold', color: '#f4ead8' }}
            className="text-3xl leading-[44px]">
            {commitment.definiteAim}
          </Text>
        )}
        <View className="mt-4 border-t border-line pt-3">
          {locked ? (
            <Text className="text-xs leading-5 text-fog">
              🔒 Locked for {lockDaysLeft} more {lockDaysLeft === 1 ? 'day' : 'days'}.
              The words stay fixed while the habit forms — rewriting mid-build
              resets the mechanism.
            </Text>
          ) : editing ? null : (
            <Text
              onPress={() => {
                setDraft(commitment.definiteAim ?? '');
                setEditing(true);
              }}
              className="text-xs font-medium text-fog underline">
              Unlocked — edit the aim
            </Text>
          )}
        </View>
      </Card>

      <Card>
        <SectionLabel>This morning</SectionLabel>
        {readToday ? (
          <Text className="text-base text-paper">
            Read. The system ran today. ✓
          </Text>
        ) : (
          <PrimaryButton
            label="I read it — in full, out loud if possible"
            onPress={() =>
              addEntry({ type: 'architect', payload: { kind: 'read' } })
            }
            tint={content.hex}
          />
        )}
      </Card>

      <Card>
        <SectionLabel>Unbroken streak</SectionLabel>
        <View className="flex-row items-baseline gap-2">
          <Text style={{ color: content.hex }} className="text-6xl font-bold tabular-nums">
            {streak}
          </Text>
          <Text className="text-base text-fog">/ {STREAK_TARGET} days</Text>
        </View>
        <View className="mt-3 h-2 overflow-hidden rounded-full bg-line">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, (streak / STREAK_TARGET) * 100)}%`,
              backgroundColor: content.hex,
            }}
          />
        </View>
        <Text className="mt-3 text-xs leading-5 text-fog">
          {streak >= STREAK_TARGET
            ? 'Thirty unbroken days. The system runs itself now — keep it running.'
            : 'Every morning, read in full. Miss a day and the counter starts over — that is the deal.'}
        </Text>
      </Card>
    </View>
  );
}
