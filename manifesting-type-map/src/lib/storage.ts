// Local-first key-value storage. MMKV is the primary store (fast, synchronous)
// but its native module is unavailable inside Expo Go, so fall back to
// expo-sqlite/kv-store there, and to an in-memory map as a last resort so the
// app never crashes over storage.

import { Platform } from 'react-native';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface MmkvLike {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

interface KvStoreLike {
  getItemSync(key: string): string | null;
  setItemSync(key: string, value: string): void;
  removeItemSync(key: string): void;
}

function tryMmkv(): KeyValueStorage | null {
  try {
    const { MMKV } = require('react-native-mmkv') as {
      MMKV: new (config?: { id: string }) => MmkvLike;
    };
    const mmkv = new MMKV({ id: 'manifesting-type-map' });
    return {
      getItem: (key) => mmkv.getString(key) ?? null,
      setItem: (key, value) => mmkv.set(key, value),
      removeItem: (key) => mmkv.delete(key),
    };
  } catch {
    return null;
  }
}

function trySqliteKv(): KeyValueStorage | null {
  try {
    const kv = require('expo-sqlite/kv-store').default as KvStoreLike;
    // Probe once so a broken module fails here, not mid-session.
    kv.getItemSync('__probe__');
    return {
      getItem: (key) => kv.getItemSync(key),
      setItem: (key, value) => kv.setItemSync(key, value),
      removeItem: (key) => kv.removeItemSync(key),
    };
  } catch {
    return null;
  }
}

function tryLocalStorage(): KeyValueStorage | null {
  try {
    if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
      return null;
    }
    return {
      getItem: (key) => localStorage.getItem(key),
      setItem: (key, value) => localStorage.setItem(key, value),
      removeItem: (key) => localStorage.removeItem(key),
    };
  } catch {
    return null;
  }
}

function memoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

export const storage: KeyValueStorage =
  tryLocalStorage() ?? tryMmkv() ?? trySqliteKv() ?? memoryStorage();
