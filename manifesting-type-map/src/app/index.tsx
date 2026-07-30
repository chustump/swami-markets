import { Redirect, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton, Screen } from '@/components/ui';
import { ITEM_BANK_VERSION } from '@/lib/items';
import { TYPE_CONTENT, TYPE_ORDER } from '@/lib/typeContent';
import type { ManifestingType } from '@/lib/types';
import { useAppStore } from '@/store/useAppStore';
import { useAssessmentStore } from '@/store/useAssessmentStore';

export default function Welcome() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const startAssessment = useAssessmentStore((s) => s.start);

  if (profile) {
    return <Redirect href="/home" />;
  }

  return (
    <Screen>
      <View className="flex-1 justify-center">
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text className="text-sm font-semibold uppercase tracking-widest text-fog">
            Manifesting Type Map
          </Text>
          <Text className="mt-4 text-4xl font-bold leading-tight text-paper">
            There are five ways people make change stick.{'\n'}Find yours.
          </Text>
          <Text className="mt-4 text-base leading-6 text-fog">
            Twenty quick statements — about four minutes — then a daily
            practice built around how you actually work, not a one-size
            routine.
          </Text>
        </Animated.View>
      </View>
      <View className="pb-6">
        <PrimaryButton
          label="Begin"
          onPress={() => {
            startAssessment();
            router.push('/assessment/0');
          }}
        />
        <Text className="mt-4 text-center text-xs leading-5 text-fog">
          A self-reflection tool — not a psychological assessment or medical
          advice. Everything stays on your device.
        </Text>
        {__DEV__ && <DevForceType />}
      </View>
    </Screen>
  );
}

/** Dev-only: jump straight into any practice engine without taking the quiz. */
function DevForceType() {
  const router = useRouter();
  const setProfile = useAppStore((s) => s.setProfile);

  const force = (type: ManifestingType) => {
    const scores = Object.fromEntries(
      TYPE_ORDER.map((t) => [t, t === type ? 1.5 : -0.375])
    ) as Record<ManifestingType, number>;
    setProfile({
      primary: type,
      secondary: TYPE_ORDER.find((t) => t !== type) ?? type,
      scores,
      completedAt: new Date().toISOString(),
      version: ITEM_BANK_VERSION,
    });
    router.replace('/onboarding/setup');
  };

  return (
    <View className="mt-6 border-t border-line pt-4">
      <Text className="mb-2 text-center text-[10px] uppercase tracking-widest text-fog">
        dev: force type
      </Text>
      <View className="flex-row justify-center gap-2">
        {TYPE_ORDER.map((t) => (
          <Pressable
            key={t}
            onPress={() => force(t)}
            className="rounded-lg border border-line px-2.5 py-1.5">
            <Text style={{ color: TYPE_CONTENT[t].hex }} className="text-sm">
              {TYPE_CONTENT[t].emblem}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
