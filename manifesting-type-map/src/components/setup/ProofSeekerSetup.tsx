import { useState } from 'react';
import { Text, View } from 'react-native';

import { SetupShell } from '@/components/setup/SetupShell';
import { Chip, SectionLabel, TextField } from '@/components/ui';
import { TYPE_CONTENT } from '@/lib/typeContent';
import { useAppStore } from '@/store/useAppStore';

const SESSION_OPTIONS = [10, 15, 20, 30];

export function ProofSeekerSetup({ onDone }: { onDone: () => void }) {
  const setCommitment = useAppStore((s) => s.setCommitment);
  const [goal, setGoal] = useState('');
  const [minutes, setMinutes] = useState(20);
  const content = TYPE_CONTENT['proof-seeker'];

  const save = () => {
    setCommitment({
      goal: goal.trim(),
      sessionMinutes: minutes,
      createdAt: new Date().toISOString(),
    });
    onDone();
  };

  return (
    <SetupShell
      content={content}
      title="Set up your 14-day trial"
      subtitle="One daily rehearsal session, one evidence log. You don't judge results until day 14 — that's the protocol."
      saveLabel="Start day 1"
      canSave={goal.trim().length > 0}
      onSave={save}>
      <View>
        <SectionLabel>What are you testing?</SectionLabel>
        <TextField
          value={goal}
          onChangeText={setGoal}
          placeholder="e.g. Land two freelance clients by spring"
          multiline
        />
      </View>
      <View>
        <SectionLabel>Session length</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          {SESSION_OPTIONS.map((m) => (
            <Chip
              key={m}
              label={`${m} min`}
              selected={minutes === m}
              onPress={() => setMinutes(m)}
              tint={content.hex}
            />
          ))}
        </View>
        <Text className="mt-3 text-xs leading-5 text-fog">
          A timed session where you rehearse the outcome as if it's underway,
          then log what you noticed. Adjustable later.
        </Text>
      </View>
    </SetupShell>
  );
}
