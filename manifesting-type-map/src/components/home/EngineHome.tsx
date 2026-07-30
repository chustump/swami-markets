import { useState } from 'react';
import { Modal, Text, View } from 'react-native';

import { Card, PrimaryButton, SectionLabel, TextField } from '@/components/ui';
import { addDays, daysBetween, todayKey } from '@/lib/dates';
import { TYPE_CONTENT } from '@/lib/typeContent';
import type { Commitment } from '@/lib/types';
import { hasEntryToday, selectTypeEntries, useAppStore } from '@/store/useAppStore';

/** Monday-indexed day of week for a YYYY-MM-DD key. */
function dayOfWeek(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).getDay(); // 0 = Sunday ... 5 = Friday
}

/** The Friday of the week containing `dateKey` (weeks run Sat->Fri). */
function weekReviewKey(dateKey: string): string {
  const dow = dayOfWeek(dateKey);
  const offset = dow === 6 ? 6 : 5 - dow; // Saturday looks ahead to next Friday
  return addDays(dateKey, offset);
}

/**
 * Engine: deadline countdown + daily "what moved today?". The Friday review
 * is a hard modal — it blocks the app until answered. Momentum needs a
 * checkpoint, and the checkpoint is not optional.
 */
export function EngineHome({ commitment }: { commitment: Commitment }) {
  const entries = useAppStore((s) => s.entries);
  const addEntry = useAppStore((s) => s.addEntry);
  const content = TYPE_CONTENT.engine;

  const [move, setMove] = useState('');
  const [review, setReview] = useState('');

  const today = todayKey();
  const deadline = commitment.deadline ?? today;
  const daysLeft = daysBetween(today, deadline);

  const moves = selectTypeEntries(entries, 'engine', 'move');
  const movedToday = hasEntryToday(entries, 'engine', 'move');
  const actionDays = new Set(moves.map((e) => e.date)).size;

  const reviews = selectTypeEntries(entries, 'engine', 'weekly-review');
  const thisWeekKey = weekReviewKey(today);
  const isFriday = dayOfWeek(today) === 5;
  const reviewDue =
    isFriday &&
    !reviews.some((r) => r.payload.week === thisWeekKey) &&
    // Not on day one — there's nothing to review yet.
    commitment.createdAt.slice(0, 10) !== today;

  const logMove = () => {
    addEntry({ type: 'engine', payload: { kind: 'move', text: move.trim() } });
    setMove('');
  };

  const submitReview = () => {
    addEntry({
      type: 'engine',
      payload: { kind: 'weekly-review', text: review.trim(), week: thisWeekKey },
    });
    setReview('');
  };

  return (
    <View className="gap-4">
      <Card accent={content.hex}>
        <SectionLabel>The goal</SectionLabel>
        <Text className="text-lg font-semibold leading-7 text-paper">
          {commitment.goal}
        </Text>
        <View className="mt-4 flex-row items-baseline gap-2">
          <Text style={{ color: content.hex }} className="text-5xl font-bold tabular-nums">
            {Math.max(daysLeft, 0)}
          </Text>
          <Text className="text-base text-fog">
            {daysLeft >= 0 ? `days until ${deadline}` : `days past ${deadline}`}
          </Text>
        </View>
      </Card>

      <Card>
        <SectionLabel>What moved today?</SectionLabel>
        {movedToday && (
          <Text className="mb-3 text-sm text-fog">
            Logged. Momentum likes company — add more if more moved.
          </Text>
        )}
        <TextField
          value={move}
          onChangeText={setMove}
          placeholder="One visible action. Sent, built, booked, shipped."
          multiline
        />
        <View className="mt-3">
          <PrimaryButton
            label="Log the move"
            onPress={logMove}
            disabled={move.trim().length === 0}
            tint={content.hex}
          />
        </View>
      </Card>

      <Card>
        <SectionLabel>Momentum</SectionLabel>
        <View className="flex-row gap-8">
          <View>
            <Text className="text-3xl font-bold text-paper">{actionDays}</Text>
            <Text className="mt-1 text-xs text-fog">days with visible action</Text>
          </View>
          <View>
            <Text className="text-3xl font-bold text-paper">{reviews.length}</Text>
            <Text className="mt-1 text-xs text-fog">weekly reviews kept</Text>
          </View>
        </View>
      </Card>

      <Modal visible={reviewDue} animationType="slide" transparent={false} onRequestClose={() => undefined}>
        <View className="flex-1 justify-center bg-ink px-6">
          <Text style={{ color: content.hex }} className="text-3xl">
            {content.emblem}
          </Text>
          <Text className="mt-3 text-3xl font-bold text-paper">
            Friday review.
          </Text>
          <Text className="mt-2 text-base leading-6 text-fog">
            No skipping this one. Look at the week: what actually moved, what
            stalled, and what's the first move on Monday?
          </Text>
          <View className="mt-6">
            <TextField
              value={review}
              onChangeText={setReview}
              placeholder="Moved / stalled / Monday's first move"
              multiline
              className="min-h-[120px]"
            />
          </View>
          <View className="mt-4">
            <PrimaryButton
              label="Close the week"
              onPress={submitReview}
              disabled={review.trim().length === 0}
              tint={content.hex}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
