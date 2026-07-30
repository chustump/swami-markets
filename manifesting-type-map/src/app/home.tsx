import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';

import { ArchitectHome } from '@/components/home/ArchitectHome';
import { BeaconHome } from '@/components/home/BeaconHome';
import { EngineHome } from '@/components/home/EngineHome';
import { ProofSeekerHome } from '@/components/home/ProofSeekerHome';
import { ReceiverHome } from '@/components/home/ReceiverHome';
import { Screen } from '@/components/ui';
import { TYPE_CONTENT } from '@/lib/typeContent';
import { useAppStore } from '@/store/useAppStore';

export default function HomeScreen() {
  const profile = useAppStore((s) => s.profile);
  const commitment = useAppStore((s) => s.commitment);

  if (!profile) {
    return <Redirect href="/" />;
  }
  if (!commitment) {
    return <Redirect href="/onboarding/setup" />;
  }

  const content = TYPE_CONTENT[profile.primary];

  // Five separate engines on purpose — the differentiation is the product.
  const engine = (() => {
    switch (profile.primary) {
      case 'proof-seeker':
        return <ProofSeekerHome commitment={commitment} />;
      case 'engine':
        return <EngineHome commitment={commitment} />;
      case 'receiver':
        return <ReceiverHome commitment={commitment} />;
      case 'architect':
        return <ArchitectHome commitment={commitment} />;
      case 'beacon':
        return <BeaconHome commitment={commitment} />;
    }
  })();

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pb-4 pt-2">
        <View className="flex-row items-center gap-2">
          <Text style={{ color: content.hex }} className="text-xl">
            {content.emblem}
          </Text>
          <Text className="text-base font-semibold text-paper">
            {content.name}
          </Text>
        </View>
      </View>
      {engine}
    </Screen>
  );
}
