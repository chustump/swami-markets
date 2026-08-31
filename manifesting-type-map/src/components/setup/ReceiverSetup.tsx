import { useState } from 'react';
import { Text, View } from 'react-native';

import { SetupShell } from '@/components/setup/SetupShell';
import { SectionLabel, TextField } from '@/components/ui';
import { TYPE_CONTENT } from '@/lib/typeContent';
import { useAppStore } from '@/store/useAppStore';

export function ReceiverSetup({ onDone }: { onDone: () => void }) {
  const setCommitment = useAppStore((s) => s.setCommitment);
  const [statement, setStatement] = useState('');
  const [anchor, setAnchor] = useState('');
  const content = TYPE_CONTENT.receiver;

  const save = () => {
    setCommitment({
      goal: statement.trim(),
      identityStatement: statement.trim(),
      anchor: anchor.trim(),
      createdAt: new Date().toISOString(),
    });
    onDone();
  };

  return (
    <SetupShell
      content={content}
      title="Write who you are becoming"
      subtitle="Present tense, as if already true. No streaks, no counters — just the statement and one anchor you keep."
      saveLabel="Begin"
      canSave={statement.trim().length > 0 && anchor.trim().length > 0}
      onSave={save}>
      <View>
        <SectionLabel>Identity statement</SectionLabel>
        <TextField
          value={statement}
          onChangeText={setStatement}
          placeholder="e.g. I am a writer whose work finds its readers."
          multiline
        />
        <Text className="mt-2 text-xs leading-5 text-fog">
          Describe the person, not the outcome. "I am…" beats "I will…".
        </Text>
      </View>
      <View>
        <SectionLabel>Your one anchor</SectionLabel>
        <TextField
          value={anchor}
          onChangeText={setAnchor}
          placeholder="e.g. Twenty unhurried minutes at the desk each morning"
        />
        <Text className="mt-2 text-xs leading-5 text-fog">
          A single scheduled commitment that belongs to that person. Just one.
        </Text>
      </View>
    </SetupShell>
  );
}
