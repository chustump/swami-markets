import { useState } from 'react';
import { Text, View } from 'react-native';

import { SetupShell } from '@/components/setup/SetupShell';
import { SectionLabel, TextField } from '@/components/ui';
import { TYPE_CONTENT } from '@/lib/typeContent';
import { useAppStore } from '@/store/useAppStore';

const LOCK_DAYS = 30;

export function ArchitectSetup({ onDone }: { onDone: () => void }) {
  const setCommitment = useAppStore((s) => s.setCommitment);
  const [aim, setAim] = useState('');
  const content = TYPE_CONTENT.architect;

  const save = () => {
    const now = new Date();
    const lockedUntil = new Date(now.getTime() + LOCK_DAYS * 86_400_000);
    setCommitment({
      goal: aim.trim(),
      definiteAim: aim.trim(),
      createdAt: now.toISOString(),
      lockedUntil: lockedUntil.toISOString(),
    });
    onDone();
  };

  return (
    <SetupShell
      content={content}
      title="Write your definite aim"
      subtitle="One aim, in your own words, read every morning. Take your time — it locks for 30 days once you commit."
      saveLabel="Commit and lock for 30 days"
      canSave={aim.trim().length >= 10}
      onSave={save}>
      <View>
        <SectionLabel>The aim</SectionLabel>
        <TextField
          value={aim}
          onChangeText={setAim}
          placeholder="What exactly, by when, and what you give in return."
          multiline
          className="min-h-[140px]"
        />
        <Text className="mt-2 text-xs leading-5 text-fog">
          Specific beats grand. Once saved, the words can't be edited for
          {' '}{LOCK_DAYS} days — the repetition is the mechanism, and rewriting
          resets it.
        </Text>
      </View>
    </SetupShell>
  );
}
