import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { PrimaryButton, Screen, SectionLabel } from '@/components/ui';
import { TYPE_CONTENT, TYPE_ORDER } from '@/lib/typeContent';
import { useAppStore } from '@/store/useAppStore';
import { useAssessmentStore } from '@/store/useAssessmentStore';

export default function ResultScreen() {
  const router = useRouter();
  const result = useAssessmentStore((s) => s.result);
  const resolved = useAssessmentStore((s) => s.resolved);
  const buildProfile = useAssessmentStore((s) => s.buildProfile);
  const resetAssessment = useAssessmentStore((s) => s.reset);
  const setProfile = useAppStore((s) => s.setProfile);

  if (!result || !resolved) {
    router.replace('/');
    return null;
  }

  const content = TYPE_CONTENT[resolved.primary];
  const secondary = TYPE_CONTENT[resolved.secondary];

  // Normalized scores mapped to 0-1 bar widths for the five-type profile.
  const values = TYPE_ORDER.map((t) => result.scores[t]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const onContinue = () => {
    setProfile(buildProfile());
    resetAssessment();
    router.replace('/onboarding/setup');
  };

  return (
    <Screen scroll>
      <View className="items-center pt-10">
        <Animated.View entering={ZoomIn.duration(600)}>
          <Text style={{ color: content.hex }} className="text-6xl">
            {content.emblem}
          </Text>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(250).duration(500)}
          className="items-center">
          <Text className="mt-4 text-xs font-semibold uppercase tracking-widest text-fog">
            Your manifesting type
          </Text>
          <Text
            style={{ color: content.hex }}
            className="mt-1 text-4xl font-bold">
            {content.name}
          </Text>
          <Text className="mt-2 text-base font-medium text-paper">
            {content.tagline}
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(800).duration(500)} className="mt-8">
        <Text className="text-base leading-7 text-paper">{content.description}</Text>

        <View className="mt-6 rounded-2xl border border-line bg-card p-5">
          <SectionLabel>Your daily practice</SectionLabel>
          <Text className="text-sm leading-6 text-paper">
            {content.practiceSummary}
          </Text>
        </View>

        <View className="mt-4 rounded-2xl border border-line bg-card p-5">
          <SectionLabel>Secondary type</SectionLabel>
          <Text className="text-sm leading-6 text-paper">
            <Text style={{ color: secondary.hex }} className="font-semibold">
              {secondary.name}
            </Text>
            {' — '}
            {secondary.tagline} It shows up in how you work too; you can borrow
            from it any time.
          </Text>
        </View>

        <View className="mt-4 rounded-2xl border border-line bg-card p-5">
          <SectionLabel>Your full profile</SectionLabel>
          {TYPE_ORDER.map((t) => {
            const c = TYPE_CONTENT[t];
            const width = 8 + ((result.scores[t] - min) / span) * 92;
            return (
              <View key={t} className="mb-3">
                <Text className="mb-1 text-xs font-medium text-fog">{c.name}</Text>
                <View className="h-2 overflow-hidden rounded-full bg-line">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${width}%`, backgroundColor: c.hex }}
                  />
                </View>
              </View>
            );
          })}
          <Text className="mt-1 text-xs leading-5 text-fog">
            Scores are relative to your own average — they show your leanings,
            not a measurement of you.
          </Text>
        </View>

        <View className="mt-8">
          <PrimaryButton label="Set up your daily practice" onPress={onContinue} tint={content.hex} />
        </View>

        <Text className="mt-6 text-center text-xs leading-5 text-fog">
          This is a self-reflection tool, not a psychological assessment or
          medical advice.
        </Text>
      </Animated.View>
    </Screen>
  );
}
