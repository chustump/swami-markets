import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Card, Screen, SectionLabel } from '@/components/ui';
import { todayKey } from '@/lib/dates';
import { currentStreak, longestStreak } from '@/lib/streaks';
import { TYPE_CONTENT } from '@/lib/typeContent';
import type { PracticeEntry } from '@/lib/types';
import { useAppStore } from '@/store/useAppStore';

function entryLine(entry: PracticeEntry): string {
  const kind = typeof entry.payload.kind === 'string' ? entry.payload.kind : '';
  const text =
    typeof entry.payload.text === 'string'
      ? entry.payload.text
      : typeof entry.payload.note === 'string'
        ? entry.payload.note
        : '';
  switch (kind) {
    case 'session': {
      const mins = Math.round((entry.durationSeconds ?? 0) / 60);
      return `Rehearsal session (${mins} min)${text ? ` — ${text}` : ''}`;
    }
    case 'move':
      return `Moved: ${text}`;
    case 'weekly-review':
      return `Weekly review — ${text}`;
    case 'read':
      return 'Read, in full.';
    case 'anchor':
      return 'Anchor honored.';
    case 'showed-up':
      return 'Showed up.';
    case 'impact':
      return `Impact note — ${text}`;
    case 'opposite':
      return `Opposite exercise${text ? ` — ${text}` : ''}`;
    default:
      return text || 'Practice logged.';
  }
}

export default function HistoryScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const entries = useAppStore((s) => s.entries);

  if (!profile) {
    router.replace('/');
    return null;
  }

  const content = TYPE_CONTENT[profile.primary];
  // The Receiver's engine has no streaks — history stays consistent with that.
  const showStreaks = profile.primary !== 'receiver';
  const dates = entries.map((e) => e.date);

  const byDate = [...entries]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .reduce<Map<string, PracticeEntry[]>>((map, entry) => {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
      return map;
    }, new Map());

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pb-4 pt-2">
        <Text className="text-2xl font-bold text-paper">History</Text>
        <Pressable onPress={() => router.back()} className="px-2 py-1">
          <Text className="text-sm font-medium text-fog">Close</Text>
        </Pressable>
      </View>

      {showStreaks ? (
        <Card accent={content.hex}>
          <View className="flex-row gap-10">
            <View>
              <Text style={{ color: content.hex }} className="text-4xl font-bold">
                {currentStreak(dates, todayKey())}
              </Text>
              <Text className="mt-1 text-xs text-fog">current streak</Text>
            </View>
            <View>
              <Text className="text-4xl font-bold text-paper">
                {longestStreak(dates)}
              </Text>
              <Text className="mt-1 text-xs text-fog">longest streak</Text>
            </View>
            <View>
              <Text className="text-4xl font-bold text-paper">{entries.length}</Text>
              <Text className="mt-1 text-xs text-fog">entries</Text>
            </View>
          </View>
        </Card>
      ) : (
        <Card accent={content.hex}>
          <Text className="text-sm leading-6 text-fog">
            {entries.length === 0
              ? 'Your practice will gather here, gently.'
              : `${entries.length} ${entries.length === 1 ? 'moment' : 'moments'} kept. No counters, no chains — just the record.`}
          </Text>
        </Card>
      )}

      <View className="mt-4 gap-4 pb-8">
        {[...byDate.entries()].map(([date, dayEntries]) => (
          <View key={date}>
            <SectionLabel>{date}</SectionLabel>
            <Card>
              {dayEntries.map((entry, i) => (
                <Text
                  key={entry.id}
                  className={`text-sm leading-6 text-paper ${i > 0 ? 'mt-2' : ''}`}>
                  {entryLine(entry)}
                </Text>
              ))}
            </Card>
          </View>
        ))}
        {entries.length === 0 && (
          <Text className="mt-8 text-center text-sm text-fog">
            Nothing logged yet. Today is a fine day to start.
          </Text>
        )}
      </View>
    </Screen>
  );
}
