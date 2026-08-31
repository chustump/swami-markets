import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { ManifestingType } from './types';

// Per-type reminder voice: the Receiver never gets urgency; the Engine and
// Architect get a firm nudge.
const REMINDER_COPY: Record<ManifestingType, { title: string; body: string }> = {
  'proof-seeker': {
    title: 'Evidence window open',
    body: "Today's session and log — one more data point for the 14-day record.",
  },
  engine: {
    title: 'What moved today?',
    body: 'The countdown is running. Log one visible action.',
  },
  receiver: {
    title: 'A quiet moment',
    body: 'Your statement is here whenever you are.',
  },
  architect: {
    title: 'Morning read',
    body: 'The aim, in full. Keep the system running.',
  },
  beacon: {
    title: 'They’re counting on you',
    body: 'Show up for the person your goal serves.',
  },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const request = await Notifications.requestPermissionsAsync();
    return request.granted;
  } catch {
    return false;
  }
}

export async function scheduleDailyReminder(
  type: ManifestingType,
  hour: number,
  minute: number
): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-practice', {
        name: 'Daily practice',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const copy = REMINDER_COPY[type];
    await Notifications.scheduleNotificationAsync({
      content: { title: copy.title, body: copy.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: Platform.OS === 'android' ? 'daily-practice' : undefined,
      },
    });
    return true;
  } catch {
    // Expo Go on newer SDKs has limited notification support — fail soft.
    return false;
  }
}

export async function cancelReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
