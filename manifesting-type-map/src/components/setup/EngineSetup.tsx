import { useState } from 'react';
import { Text, View } from 'react-native';

import { SetupShell } from '@/components/setup/SetupShell';
import { Chip, SectionLabel, TextField } from '@/components/ui';
import { addDays, todayKey } from '@/lib/dates';
import { TYPE_CONTENT } from '@/lib/typeContent';
import { useAppStore } from '@/store/useAppStore';

const DEADLINE_OPTIONS = [
  { label: '2 weeks', days: 14 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export function EngineSetup({ onDone }: { onDone: () => void }) {
  const setCommitment = useAppStore((s) => s.setCommitment);
  const [goal, setGoal] = useState('');
  const [deadlineDays, setDeadlineDays] = useState<number | null>(30);
  const [customDate, setCustomDate] = useState('');
  const content = TYPE_CONTENT.engine;

  const customValid = /^\d{4}-\d{2}-\d{2}$/.test(customDate.trim());
  const deadline =
    deadlineDays !== null
      ? addDays(todayKey(), deadlineDays)
      : customValid
        ? customDate.trim()
        : null;

  const save = () => {
    if (!deadline) return;
    setCommitment({
      goal: goal.trim(),
      deadline,
      createdAt: new Date().toISOString(),
    });
    onDone();
  };

  return (
    <SetupShell
      content={content}
      title="Pick a goal with a real deadline"
      subtitle="You run on momentum. A countdown you can feel, one daily move, and a Friday review you can't scroll past."
      saveLabel="Start the countdown"
      canSave={goal.trim().length > 0 && deadline !== null}
      onSave={save}>
      <View>
        <SectionLabel>The goal</SectionLabel>
        <TextField
          value={goal}
          onChangeText={setGoal}
          placeholder="e.g. Launch the shop"
          multiline
        />
      </View>
      <View>
        <SectionLabel>Deadline</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          {DEADLINE_OPTIONS.map((option) => (
            <Chip
              key={option.days}
              label={option.label}
              selected={deadlineDays === option.days}
              onPress={() => {
                setDeadlineDays(option.days);
                setCustomDate('');
              }}
              tint={content.hex}
            />
          ))}
          <Chip
            label="Custom"
            selected={deadlineDays === null}
            onPress={() => setDeadlineDays(null)}
            tint={content.hex}
          />
        </View>
        {deadlineDays === null && (
          <View className="mt-3">
            <TextField
              value={customDate}
              onChangeText={setCustomDate}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />
            {!customValid && customDate.length > 0 && (
              <Text className="mt-2 text-xs text-fog">
                Use the format YYYY-MM-DD.
              </Text>
            )}
          </View>
        )}
      </View>
    </SetupShell>
  );
}
