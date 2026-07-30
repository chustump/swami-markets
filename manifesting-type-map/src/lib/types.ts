export type ManifestingType =
  | 'proof-seeker'
  | 'engine'
  | 'receiver'
  | 'architect'
  | 'beacon';

export const ALL_TYPES: readonly ManifestingType[] = [
  'proof-seeker',
  'engine',
  'receiver',
  'architect',
  'beacon',
] as const;

export interface Profile {
  primary: ManifestingType;
  secondary: ManifestingType;
  scores: Record<ManifestingType, number>; // normalized (ipsatized)
  completedAt: string; // ISO
  version: number; // item-bank version, for future re-scoring
}

export interface PracticeEntry {
  id: string;
  date: string; // YYYY-MM-DD, local
  type: ManifestingType;
  payload: Record<string, unknown>; // shape varies by type
  durationSeconds?: number;
}

export interface Commitment {
  goal: string;
  deadline?: string;
  identityStatement?: string;
  definiteAim?: string;
  beneficiary?: string;
  anchor?: string;
  sessionMinutes?: number;
  createdAt: string;
  lockedUntil?: string;
}

export interface Settings {
  notificationsEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
}
