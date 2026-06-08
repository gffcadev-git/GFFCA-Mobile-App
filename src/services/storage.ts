import { MMKV } from 'react-native-mmkv';

/**
 * Single app-wide MMKV instance. Everything that persists key/values
 * (theme cache, React Query cache, Zustand stores) goes through this.
 *
 * To encrypt at-rest secrets (e.g. auth token), pass:
 *   new MMKV({ id: 'gffca-app', encryptionKey: '<secure-key>' })
 */
export const storage = new MMKV({ id: 'gffca-app' });

// ── Typed JSON helpers ────────────────────────────────────────────────────────

export function getJSON<T>(key: string): T | null {
  const raw = storage.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJSON(key: string, value: unknown): void {
  storage.set(key, JSON.stringify(value));
}

export function removeKey(key: string): void {
  storage.delete(key);
}

// ── Adapters for third-party libs (used in Phases 2 & 3) ──────────────────────

/** Synchronous Storage shape consumed by @tanstack query-sync-storage-persister. */
export const querySyncStorage = {
  getItem:    (key: string): string | null => storage.getString(key) ?? null,
  setItem:    (key: string, value: string): void => storage.set(key, value),
  removeItem: (key: string): void => storage.delete(key),
};

/** StateStorage shape consumed by zustand's persist middleware. */
export const zustandMMKVStorage = {
  getItem:    (name: string): string | null => storage.getString(name) ?? null,
  setItem:    (name: string, value: string): void => storage.set(name, value),
  removeItem: (name: string): void => storage.delete(name),
};
