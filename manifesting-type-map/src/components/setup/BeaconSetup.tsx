import { useState } from 'react';
import { Text, View } from 'react-native';

import { SetupShell } from '@/components/setup/SetupShell';
import { SectionLabel, TextField } from '@/components/ui';
import { TYPE_CONTENT } from '@/lib/typeContent';
import { useAppStore } from '@/store/useAppStore';

export function BeaconSetup({ onDone }: { onDone: () => void }) {
  const setCommitment = useAppStore((s) => s.setCommitment);
  const [goal, setGoal] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const content = TYPE_CONTENT.beacon;

  const save = () => {
    setCommitment({
      goal: goal.trim(),
      beneficiary: beneficiary.trim(),
      createdAt: new Date().toISOString(),
    });
    onDone();
  };

  return (
    <SetupShell
      content={content}
      title="Name the goal — and who it's for"
      subtitle="Your commitment gets its gravity from the person it serves. The two stay on screen together, always."
      saveLabel="Light it up"
      canSave={goal.trim().length > 0 && beneficiary.trim().length > 0}
      onSave={save}>
      <View>
        <SectionLabel>The goal</SectionLabel>
        <TextField
          value={goal}
          onChangeText={setGoal}
          placeholder="e.g. Get the tutoring program running"
          multiline
        />
      </View>
      <View>
        <SectionLabel>Who else benefits?</SectionLabel>
        <TextField
          value={beneficiary}
          onChangeText={setBeneficiary}
          placeholder="e.g. My sister's kids — real help with school"
          multiline
        />
        <Text className="mt-2 text-xs leading-5 text-fog">
          Name someone specific and how their situation changes. You'll write a
          short weekly note on what actually changed for them.
        </Text>
      </View>
    </SetupShell>
  );
}
