import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card, PrimaryButton, SectionLabel, TextField } from '@/components/ui';
import { addDays, isoToDateKey, todayKey } from '@/lib/dates';
import { TYPE_CONTENT } from '@/lib/typeContent';
import type { Commitment, PracticeEntry } from '@/lib/types';
import { hasEntryToday, protocolDay, selectTypeEntries, useAppStore } from '@/store/useAppStore';

const PROTOCOL_DAYS = 14;

/**
 * Proof-Seeker: timed rehearsal + evidence log. Trends and verdicts are
 * deliberately hidden until day 14 — collect first, conclude later.
 */
export function ProofSeekerHome({ commitment }: { commitment: Commitment }) {
  const entries = useAppStore((s) => s.entries);
  const addEntry = useAppStore((s) => s.addEntry);
  const content = TYPE_CONTENT['proof-seeker'];

  const sessionSeconds = (commitment.sessionMinutes ?? 20) * 60;
  const [remaining, setRemaining] = useState(sessionSeconds);
  const [running, setRunning] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [note, setNote] = useState('');
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setRemaining((r) => {
        elapsedRef.current += 1;
        if (r <= 1) {
          setRunning(false);
          setLogOpen(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const sessions = selectTypeEntries(entries, 'proof-seeker', 'session');
  const doneToday = hasEntryToday(entries, 'proof-seeker', 'session');
  const day = Math.min(protocolDay(commitment), PROTOCOL_DAYS);
  const resultsUnlocked = protocolDay(commitment) > PROTOCOL_DAYS;
  const startKey = isoToDateKey(commitment.createdAt);
  const sessionDates = new Set(sessions.map((e) => e.date));

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const saveLog = () => {
    addEntry({
      type: 'proof-seeker',
      payload: { kind: 'session', note: note.trim() },
      durationSeconds: elapsedRef.current,
    });
    elapsedRef.current = 0;
    setNote('');
    setLogOpen(false);
    setRemaining(sessionSeconds);
  };

  return (
    <View className="gap-4">
      <Card accent={content.hex}>
        <SectionLabel>The experiment</SectionLabel>
        <Text className="text-lg font-semibold leading-7 text-paper">
          {commitment.goal}
        </Text>
        <Text className="mt-2 text-sm text-fog">
          Day {day} of {PROTOCOL_DAYS}.{' '}
          {resultsUnlocked ? 'Evidence unlocked.' : 'Keep collecting.'}
        </Text>
      </Card>

      <Card>
        <SectionLabel>Rehearsal session</SectionLabel>
        {logOpen ? (
          <View className="gap-3">
            <Text className="text-base text-paper">
              Session done. What did you notice? Facts only — no verdicts.
            </Text>
            <TextField
              value={note}
              onChangeText={setNote}
              placeholder="What came up, what felt concrete, what happened after."
              multiline
              autoFocus
            />
            <PrimaryButton
              label="Log it"
              onPress={saveLog}
              disabled={note.trim().length === 0}
              tint={content.hex}
            />
          </View>
        ) : (
          <View className="items-center gap-4 py-2">
            <Text className="text-6xl font-bold tabular-nums text-paper">
              {minutes}:{String(seconds).padStart(2, '0')}
            </Text>
            <View className="w-full flex-row gap-3">
              <View className="flex-1">
                <PrimaryButton
                  label={running ? 'Pause' : remaining === sessionSeconds ? 'Start session' : 'Resume'}
                  onPress={() => setRunning(!running)}
                  tint={content.hex}
                />
              </View>
              {remaining < sessionSeconds && !running && (
                <Pressable
                  onPress={() => setLogOpen(true)}
                  className="items-center justify-center rounded-2xl border border-line px-5">
                  <Text className="text-sm font-medium text-fog">End early</Text>
                </Pressable>
              )}
            </View>
            {doneToday && (
              <Text className="text-xs text-fog">
                Today's session is already logged. Extra rounds count too.
              </Text>
            )}
          </View>
        )}
      </Card>

      <Card>
        <SectionLabel>The 14-day grid</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          {Array.from({ length: PROTOCOL_DAYS }, (_, i) => {
            const dateKey = addDays(startKey, i);
            const filled = sessionDates.has(dateKey);
            const isToday = dateKey === todayKey();
            return (
              <View
                key={dateKey}
                className="h-9 w-9 items-center justify-center rounded-lg border border-line"
                style={{
                  backgroundColor: filled ? content.hex : 'transparent',
                  borderColor: isToday ? content.hex : undefined,
                }}>
                <Text
                  className={`text-xs font-semibold ${filled ? 'text-ink' : 'text-fog'}`}>
                  {i + 1}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      {resultsUnlocked ? (
        <Card accent={content.hex}>
          <SectionLabel>The evidence — day 14 verdict is yours</SectionLabel>
          <Text className="mb-3 text-sm text-fog">
            {sessions.length} sessions ·{' '}
            {Math.round(
              sessions.reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0) / 60
            )}{' '}
            minutes logged
          </Text>
          {sessions.map((s: PracticeEntry) => (
            <View key={s.id} className="mb-3 border-l-2 border-line pl-3">
              <Text className="text-xs font-medium text-fog">{s.date}</Text>
              <Text className="mt-0.5 text-sm leading-5 text-paper">
                {typeof s.payload.note === 'string' ? s.payload.note : ''}
              </Text>
            </View>
          ))}
        </Card>
      ) : (
        <Card>
          <Text className="text-sm leading-6 text-fog">
            Your log stays sealed until day {PROTOCOL_DAYS + 1}. Reading tea
            leaves mid-trial is how experiments get ruined — collect now, review
            with fresh eyes at the end.
          </Text>
        </Card>
      )}
    </View>
  );
}
