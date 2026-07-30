import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import { PrimaryButton, Screen } from '@/components/ui';
import type { TypeContent } from '@/lib/typeContent';

export function SetupShell({
  content,
  title,
  subtitle,
  saveLabel,
  canSave,
  onSave,
  children,
}: PropsWithChildren<{
  content: TypeContent;
  title: string;
  subtitle: string;
  saveLabel: string;
  canSave: boolean;
  onSave: () => void;
}>) {
  return (
    <Screen scroll>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="pt-8">
          <Text style={{ color: content.hex }} className="text-3xl">
            {content.emblem}
          </Text>
          <Text className="mt-2 text-xs font-semibold uppercase tracking-widest text-fog">
            {content.name} setup
          </Text>
          <Text className="mt-2 text-3xl font-bold leading-10 text-paper">
            {title}
          </Text>
          <Text className="mt-3 text-base leading-6 text-fog">{subtitle}</Text>
        </View>
        <View className="mt-8 gap-6">{children}</View>
        <View className="mt-10">
          <PrimaryButton
            label={saveLabel}
            onPress={onSave}
            disabled={!canSave}
            tint={content.hex}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
