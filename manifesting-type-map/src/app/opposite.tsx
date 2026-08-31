import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Card, PrimaryButton, Screen, SectionLabel } from '@/components/ui';
import { daysBetween, todayKey } from '@/lib/dates';
import { TYPE_CONTENT, TYPE_ORDER } from '@/lib/typeContent';
import { selectTypeEntries, useAppStore } from '@/store/useAppStore';

/**
 * Borrow from your opposite: once a week, one exercise from the type at the
 * bottom of the user's own profile — the muscle they never train.
 */
export default function OppositeScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const entries = useAppStore((s) => s.entries);
  const addEntry = useAppStore((s) => s.addEntry);

  if (!profile) {
    router.replace('/');
    return null;
  }

  // Lowest normalized score = the opposite. Stable order breaks exact ties.
  const opposite = [...TYPE_ORDER].sort(
    (a, b) => profile.scores[a] - profile.scores[b]
  )[0];
  const oppositeContent = TYPE_CONTENT[opposite];
  const ownContent = TYPE_CONTENT[profile.primary];

  const done = selectTypeEntries(entries, profile.primary, 'opposite');
  const last = done[done.length - 1];
  const daysSince = last ? daysBetween(last.date, todayKey()) : Infinity;
  const available = daysSince >= 7;

  const markDone = () => {
    addEntry({
      type: profile.primary,
      payload: {
        kind: 'opposite',
        source: opposite,
        exercise: oppositeContent.borrowedExercise.title,
      },
    });
  };

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pb-4 pt-2">
        <Text className="text-2xl font-bold text-paper">Your opposite</Text>
        <Pressable onPress={() => router.back()} className="px-2 py-1">
          <Text className="text-sm font-medium text-fog">Close</Text>
        </Pressable>
      </View>

      <Text className="text-base leading-7 text-fog">
        You lead with{' '}
        <Text style={{ color: ownContent.hex }} className="font-semibold">
          {ownContent.name}
        </Text>
        . The style you reach for least is{' '}
        <Text style={{ color: oppositeContent.hex }} className="font-semibold">
          {oppositeContent.name}
        </Text>
        {' — '}so once a week, you borrow one small exercise from it. Cross-training,
        not conversion.
      </Text>

      <View className="mt-6">
        <Card accent={oppositeContent.hex}>
          <Text style={{ color: oppositeContent.hex }} className="text-2xl">
            {oppositeContent.emblem}
          </Text>
          <Text className="mt-2 text-xl font-bold text-paper">
            {oppositeContent.borrowedExercise.title}
          </Text>
          <Text className="mt-3 text-base leading-7 text-paper">
            {oppositeContent.borrowedExercise.instructions}
          </Text>
          <View className="mt-6">
            {available ? (
              <PrimaryButton
                label="Done — until next week"
                onPress={markDone}
                tint={oppositeContent.hex}
              />
            ) : (
              <Text className="text-sm text-fog">
                Done this week. The next borrow unlocks in{' '}
                {Math.max(1, 7 - daysSince)}{' '}
                {7 - daysSince === 1 ? 'day' : 'days'}.
              </Text>
            )}
          </View>
        </Card>
      </View>

      <View className="mt-4">
        <SectionLabel>Why this works</SectionLabel>
        <Text className="text-sm leading-6 text-fog">
          {oppositeContent.mechanism} One small dose a week keeps your practice
          from becoming an echo chamber of your own preferences.
        </Text>
      </View>
    </Screen>
  );
}
