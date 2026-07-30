import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({
  children,
  scroll = false,
}: PropsWithChildren<{ scroll?: boolean }>) {
  return (
    <SafeAreaView className="flex-1 bg-ink">
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-12"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-6">{children}</View>
      )}
    </SafeAreaView>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  tint,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tint?: string;
}) {
  const style: ViewStyle | undefined = tint ? { backgroundColor: tint } : undefined;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={style}
      className={`items-center rounded-2xl py-4 ${
        tint ? '' : 'bg-paper'
      } ${disabled ? 'opacity-40' : 'active:opacity-80'}`}>
      <Text className="text-base font-semibold text-ink">{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center rounded-2xl border border-line py-4 active:opacity-70">
      <Text className="text-base font-medium text-fog">{label}</Text>
    </Pressable>
  );
}

export function Card({
  children,
  accent,
}: PropsWithChildren<{ accent?: string }>) {
  return (
    <View
      className="rounded-2xl border border-line bg-card p-5"
      style={accent ? { borderLeftWidth: 3, borderLeftColor: accent } : undefined}>
      {children}
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-fog">
      {children}
    </Text>
  );
}
