import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/components/ui';
import { findTiebreaker } from '@/lib/items';
import type { ManifestingType } from '@/lib/types';
import { useAssessmentStore } from '@/store/useAssessmentStore';

export default function TiebreakScreen() {
  const router = useRouter();
  const result = useAssessmentStore((s) => s.result);
  const resolveTiebreak = useAssessmentStore((s) => s.resolveTiebreak);

  if (!result?.tiebreakPair) {
    router.replace('/');
    return null;
  }

  const [a, b] = result.tiebreakPair;
  const tiebreaker = findTiebreaker(a, b);
  if (!tiebreaker) {
    // No pair item found — fall back to the computed order.
    router.replace('/result');
    return null;
  }

  const pick = (winner: ManifestingType) => {
    resolveTiebreak(winner);
    router.replace('/result');
  };

  const options: { type: ManifestingType; text: string }[] = [
    { type: tiebreaker.pair[0], text: tiebreaker.optionA },
    { type: tiebreaker.pair[1], text: tiebreaker.optionB },
  ];

  return (
    <Screen>
      <View className="flex-1 justify-center">
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text className="text-xs font-semibold uppercase tracking-widest text-fog">
            One last thing
          </Text>
          <Text className="mt-3 text-2xl font-semibold leading-9 text-paper">
            Which is more true of you?
          </Text>
        </Animated.View>
        <View className="mt-8 gap-4">
          {options.map((option) => (
            <Pressable
              key={option.type}
              onPress={() => pick(option.type)}
              className="rounded-2xl border border-line bg-card p-5 active:bg-line">
              <Text className="text-lg font-medium leading-7 text-paper">
                {option.text}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
