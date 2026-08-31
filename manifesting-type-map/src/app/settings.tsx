import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Share, Switch, Text, View } from 'react-native';

import { Card, Chip, GhostButton, Screen, SectionLabel } from '@/components/ui';
import {
  cancelReminders,
  requestNotificationPermission,
  scheduleDailyReminder,
} from '@/lib/notifications';
import { TYPE_CONTENT } from '@/lib/typeContent';
import { useAppStore } from '@/store/useAppStore';
import { useAssessmentStore } from '@/store/useAssessmentStore';

const TIME_OPTIONS = [
  { label: '7:00', hour: 7, minute: 0 },
  { label: '8:00', hour: 8, minute: 0 },
  { label: '12:30', hour: 12, minute: 30 },
  { label: '20:00', hour: 20, minute: 0 },
];

export default function SettingsScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const exportAll = useAppStore((s) => s.exportAll);
  const resetAll = useAppStore((s) => s.resetAll);
  const startAssessment = useAssessmentStore((s) => s.start);
  const [notifyWarning, setNotifyWarning] = useState<string | null>(null);

  if (!profile) {
    router.replace('/');
    return null;
  }

  const content = TYPE_CONTENT[profile.primary];

  const applyReminder = async (enabled: boolean, hour: number, minute: number) => {
    if (!enabled) {
      await cancelReminders();
      updateSettings({ notificationsEnabled: false });
      return;
    }
    const granted = await requestNotificationPermission();
    if (!granted) {
      setNotifyWarning('Notifications are off for this app in system settings.');
      updateSettings({ notificationsEnabled: false });
      return;
    }
    const ok = await scheduleDailyReminder(profile.primary, hour, minute);
    setNotifyWarning(
      ok ? null : 'Could not schedule on this device — a development build may be required.'
    );
    updateSettings({
      notificationsEnabled: ok,
      notificationHour: hour,
      notificationMinute: minute,
    });
  };

  const onExport = async () => {
    try {
      await Share.share({ message: exportAll() });
    } catch {
      // user dismissed the share sheet
    }
  };

  const onRetake = () => {
    Alert.alert(
      'Retake the quiz?',
      'This clears your type, commitment and practice log on this device, then starts fresh.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear and retake',
          style: 'destructive',
          onPress: async () => {
            await cancelReminders();
            resetAll();
            startAssessment();
            router.dismissAll();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pb-4 pt-2">
        <Text className="text-2xl font-bold text-paper">Settings</Text>
        <Pressable onPress={() => router.back()} className="px-2 py-1">
          <Text className="text-sm font-medium text-fog">Close</Text>
        </Pressable>
      </View>

      <View className="gap-4 pb-10">
        <Card>
          <SectionLabel>Daily reminder</SectionLabel>
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-paper">Remind me each day</Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(v) =>
                applyReminder(v, settings.notificationHour, settings.notificationMinute)
              }
              trackColor={{ true: content.hex }}
            />
          </View>
          {settings.notificationsEnabled && (
            <View className="mt-4 flex-row flex-wrap gap-2">
              {TIME_OPTIONS.map((t) => (
                <Chip
                  key={t.label}
                  label={t.label}
                  selected={
                    settings.notificationHour === t.hour &&
                    settings.notificationMinute === t.minute
                  }
                  onPress={() => applyReminder(true, t.hour, t.minute)}
                  tint={content.hex}
                />
              ))}
            </View>
          )}
          {notifyWarning && (
            <Text className="mt-3 text-xs leading-5 text-fog">{notifyWarning}</Text>
          )}
        </Card>

        <Card>
          <SectionLabel>Your data</SectionLabel>
          <Text className="mb-4 text-sm leading-6 text-fog">
            Everything lives on this device. Nothing is uploaded, synced, or
            shared unless you export it yourself.
          </Text>
          <GhostButton label="Export everything (JSON)" onPress={onExport} />
        </Card>

        <Card>
          <SectionLabel>Type</SectionLabel>
          <Text className="mb-4 text-sm text-fog">
            You're mapped as{' '}
            <Text style={{ color: content.hex }} className="font-semibold">
              {content.name}
            </Text>
            . People shift — retake whenever it stops fitting.
          </Text>
          <GhostButton label="Retake the quiz" onPress={onRetake} />
        </Card>

        <Card>
          <SectionLabel>About</SectionLabel>
          <Text className="text-xs leading-5 text-fog">
            Manifesting Type Map is a self-reflection tool for building a daily
            practice around your natural style. It is not a psychological
            assessment, a diagnostic instrument, or medical advice, and it makes
            no promises about outcomes. Be kind to yourself out there.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
