import { Text, View } from 'react-native';

import { Screen } from '@/components/ui';

export default function SetupScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-fog">Practice setup — Phase 2</Text>
      </View>
    </Screen>
  );
}
