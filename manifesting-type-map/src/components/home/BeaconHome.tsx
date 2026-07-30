import { useState } from 'react';
import { Text, View } from 'react-native';

import { Card, PrimaryButton, SectionLabel, TextField } from '@/components/ui';
import { daysBetween, todayKey } from '@/lib/dates';
import { TYPE_CONTENT } from '@/lib/typeContent';
import type { Commitment } from '@/lib/types';
import { hasEntryToday, selectTypeEntries, useAppStore } from '@/store/useAppStore';

/**
 * Beacon: the goal and its beneficiary are never separated on screen. The
 * weekly rhythm is an impact note — what actually changed for them.
 */
export function BeaconHome({ commitment }: { commitment: Commitment }) {
  const entries = useAppStore((s) => s.entries);
  const addEntry = useAppStore((s) => s.addEntry);
  const content = TYPE_CONTENT.beacon;

  const [impact, setImpact] = useState('');

  const impactNotes = selectTypeEntries(entries, 'beacon', 'impact');
  const lastImpact = impactNotes[impactNotes.length - 1];
  const impactDue =
    !lastImpact || daysBetween(lastImpact.date, todayKey()) >= 7;
  const showedUpToday = hasEntryToday(entries, 'beacon', 'showed-up');

  const saveImpact = () => {
    addEntry({
      type: 'beacon',
      payload: { kind: 'impact', text: impact.trim() },
    });
    setImpact('');
  };

  return (
    <View className="gap-4">
      <Card accent={content.hex}>
        <SectionLabel>The goal</SectionLabel>
        <Text className="text-lg font-semibold leading-7 text-paper">
          {commitment.goal}
        </Text>
        <View className="mt-4 rounded-xl bg-ink p-4">
          <Text className="text-xs uppercase tracking-widest text-fog">
            Who it's for
          </Text>
          <Text style={{ color: content.hex }} className="mt-1 text-base font-medium leading-6">
            {commitment.beneficiary}
          </Text>
        </View>
      </Card>

      <Card>
        <SectionLabel>Today</SectionLabel>
        {showedUpToday ? (
          <Text className="text-base text-paper">
            You showed up for them today. ✓
          </Text>
        ) : (
          <PrimaryButton
            label="I showed up for this today"
            onPress={() =>
              addEntry({ type: 'beacon', payload: { kind: 'showed-up' } })
            }
            tint={content.hex}
          />
        )}
      </Card>

      <Card accent={impactDue ? content.hex : undefined}>
        <SectionLabel>
          {impactDue ? 'Weekly note — due now' : 'Weekly note'}
        </SectionLabel>
        {impactDue ? (
          <View className="gap-3">
            <Text className="text-sm leading-6 text-fog">
              What changed for {commitment.beneficiary?.split('—')[0]?.trim() ?? 'them'}{' '}
              this week? Small and true beats big and vague.
            </Text>
            <TextField
              value={impact}
              onChangeText={setImpact}
              placeholder="What actually changed for them"
              multiline
            />
            <PrimaryButton
              label="Save the note"
              onPress={saveImpact}
              disabled={impact.trim().length === 0}
              tint={content.hex}
            />
          </View>
        ) : (
          <View>
            <Text className="text-xs font-medium text-fog">{lastImpact.date}</Text>
            <Text className="mt-1 text-sm leading-6 text-paper">
              {typeof lastImpact.payload.text === 'string'
                ? lastImpact.payload.text
                : ''}
            </Text>
            <Text className="mt-3 text-xs text-fog">
              Next note in {7 - daysBetween(lastImpact.date, todayKey())} days.
            </Text>
          </View>
        )}
      </Card>

      <Card>
        <SectionLabel>Impact log</SectionLabel>
        <Text className="text-sm text-fog">
          {impactNotes.length === 0
            ? 'Your weekly notes will collect here — a running record of what your goal is doing out in the world.'
            : `${impactNotes.length} ${impactNotes.length === 1 ? 'note' : 'notes'} so far.`}
        </Text>
      </Card>
    </View>
  );
}
