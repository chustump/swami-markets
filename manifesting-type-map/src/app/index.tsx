import { Redirect, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton, Screen } from '@/components/ui';
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
      </View>
    </Screen>
  );
}
