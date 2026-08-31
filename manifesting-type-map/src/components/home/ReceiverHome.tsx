import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { TYPE_CONTENT } from '@/lib/typeContent';
import type { Commitment } from '@/lib/types';
import { hasEntryToday, useAppStore } from '@/store/useAppStore';

/**
 * Receiver: deliberately sparse. The identity statement in large type, one
 * anchor, slow animations — and no streak counter anywhere. Streaks create
 * the grip that works against this type.
 */
export function ReceiverHome({ commitment }: { commitment: Commitment }) {
  const entries = useAppStore((s) => s.entries);
  const addEntry = useAppStore((s) => s.addEntry);
  const content = TYPE_CONTENT.receiver;

  const readToday = hasEntryToday(entries, 'receiver', 'read');
  const anchorToday = hasEntryToday(entries, 'receiver', 'anchor');

  return (
    <View className="flex-1 justify-center gap-12 py-8">
      <Animated.View entering={FadeIn.duration(1400)}>
        <Text
          className="text-center text-3xl font-medium leading-[46px] text-paper"
          style={{ letterSpacing: 0.3 }}>
          {commitment.identityStatement}
        </Text>
        <View className="mt-8 items-center">
          {readToday ? (
            <Animated.Text
              entering={FadeIn.duration(1200)}
              style={{ color: content.hex }}
              className="text-sm">
              Received.
            </Animated.Text>
          ) : (
            <Pressable
              onPress={() =>
                addEntry({ type: 'receiver', payload: { kind: 'read' } })
              }
              className="rounded-full border border-line px-6 py-3 active:opacity-60">
              <Text className="text-sm text-fog">I read this, slowly</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(600).duration(1400)}>
        <Text className="text-center text-xs uppercase tracking-widest text-fog">
          Today's anchor
        </Text>
        <Text className="mt-3 text-center text-base leading-7 text-paper">
          {commitment.anchor}
        </Text>
        <View className="mt-5 items-center">
          {anchorToday ? (
            <Animated.Text
              entering={FadeIn.duration(1200)}
              style={{ color: content.hex }}
              className="text-sm">
              Honored.
            </Animated.Text>
          ) : (
            <Pressable
              onPress={() =>
                addEntry({ type: 'receiver', payload: { kind: 'anchor' } })
              }
              className="rounded-full border border-line px-6 py-3 active:opacity-60">
              <Text className="text-sm text-fog">Honored today</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
}
