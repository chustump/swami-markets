import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Screen } from '@/components/ui';
import { ITEM_BANK, SCALE_LABELS } from '@/lib/items';
import { TOTAL_ITEMS, useAssessmentStore } from '@/store/useAssessmentStore';

export default function AssessmentItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ index: string }>();
  const index = Number(params.index ?? 0);

  const order = useAssessmentStore((s) => s.order);
  const answer = useAssessmentStore((s) => s.answer);
  const finish = useAssessmentStore((s) => s.finish);

  // Deep-linking into the middle of an unstarted assessment: restart cleanly.
  if (order.length === 0 || index < 0 || index >= TOTAL_ITEMS) {
    router.replace('/');
    return null;
  }

  const itemId = order[index];
  const item = ITEM_BANK.find((i) => i.id === itemId);
  if (!item) {
    router.replace('/');
    return null;
  }

  const progress = index / TOTAL_ITEMS;

  const onSelect = (value: number) => {
    answer(itemId, value);
    if (index + 1 < TOTAL_ITEMS) {
      router.push(`/assessment/${index + 1}`);
    } else {
      const result = finish();
      if (result.needsTiebreak) {
        router.replace('/assessment/tiebreak');
      } else {
        router.replace('/result');
      }
    }
  };

  return (
    <Screen>
      <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <View
          className="h-full rounded-full bg-paper"
          style={{ width: `${Math.max(4, progress * 100)}%` }}
        />
      </View>
      <Text className="mt-3 text-xs font-medium text-fog">
        {index + 1} of {TOTAL_ITEMS}
      </Text>

      <View className="flex-1 justify-center">
        <Animated.Text
          key={itemId}
          entering={FadeIn.duration(250)}
          className="text-2xl font-semibold leading-9 text-paper">
          {item.text}
        </Animated.Text>
      </View>

      <View className="gap-2.5 pb-6">
        {SCALE_LABELS.map((label, i) => (
          <Pressable
            key={label}
            onPress={() => onSelect(i + 1)}
            className="rounded-2xl border border-line bg-card py-4 active:bg-line">
            <Text className="text-center text-base font-medium text-paper">
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
