// src/app/utils/storage.ts

/* ─────────────────────────── Storage access ─────────────────────────── */

let cachedStore: Storage | null | undefined;

/** localStorage if it truly works (private mode / blocked cookies can throw), otherwise null. */
function getStore(): Storage | null {
  if (cachedStore !== undefined) return cachedStore;
  try {
    const probe = '__storage_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    cachedStore = window.localStorage;
  } catch {
    cachedStore = null;
  }
  return cachedStore;
}

/** In-memory fallback so the app still works (without persistence) when storage is unavailable. */
const memoryFallback = new Map<string, string>();

function rawGet(key: string): string | null {
  const store = getStore();
  return store ? store.getItem(key) : memoryFallback.get(key) ?? null;
}

function rawSet(key: string, value: string): void {
  const store = getStore();
  if (store) store.setItem(key, value);
  else memoryFallback.set(key, value);
}

function rawRemove(key: string): void {
  const store = getStore();
  if (store) store.removeItem(key);
  else memoryFallback.delete(key);
}

/* ─────────────────────────── Error reporting ─────────────────────────── */

export type StorageErrorKind = 'quota' | 'read' | 'write' | 'remove' | 'corrupt';
type StorageErrorHandler = (kind: StorageErrorKind, key: string, error: unknown) => void;

let errorHandler: StorageErrorHandler | null = null;

/**
 * Plug in UI feedback once, e.g. in App.tsx:
 *   setStorageErrorHandler((kind) => kind === 'quota' && toast.error('Storage is full'));
 */
export function setStorageErrorHandler(handler: StorageErrorHandler | null): void {
  errorHandler = handler;
}

function report(kind: StorageErrorKind, key: string, error: unknown): void {
  console.error(`[storage] ${kind} error for "${key}":`, error);
  errorHandler?.(kind, key, error);
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || // Firefox
      error.code === 22 ||
      error.code === 1014)
  );
}

/* ─────────────────────────── Core API (same signatures as before) ─────────────────────────── */

/**
 * Read and parse a value.
 * - Pass `validate` to guard against wrong-shaped data (older versions, manual edits).
 * - If the stored JSON is corrupt, it is copied to `${key}:corrupt` before the default is
 *   returned. Otherwise the next save would overwrite it and the data would be lost for good.
 */
export function getFromStorage<T>(
  key: string,
  defaultValue: T,
  validate?: (value: unknown) => value is T
): T {
  let raw: string | null;
  try {
    raw = rawGet(key);
  } catch (error) {
    report('read', key, error);
    return defaultValue;
  }

  if (raw === null) return defaultValue; // note: a stored "" or "0" is no longer mistaken for "missing"

  try {
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) throw new Error('Stored value failed validation');
    return parsed as T;
  } catch (error) {
    report('corrupt', key, error);
    try { rawSet(`${key}:corrupt`, raw); } catch { /* best effort */ }
    return defaultValue;
  }
}

/** Returns true if the value was saved. (Callers that ignored the old `void` return are unaffected.) */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    rawSet(key, JSON.stringify(value));
    return true;
  } catch (error) {
    report(isQuotaError(error) ? 'quota' : 'write', key, error);
    return false;
  }
}

export function removeFromStorage(key: string): void {
  try {
    rawRemove(key);
  } catch (error) {
    report('remove', key, error);
  }
}

/* ─────────────────────────── Versioned data (migrations) ─────────────────────────── */

interface Envelope<T> { v: number; data: T }

/**
 * Store data with a schema version, so changing the shape of `Task` later can't break
 * existing users. `migrate` receives the old data and its version and returns the new shape.
 *
 *   const tasks = getVersioned<Task[]>('tasks', 2, [], (old, from) => from < 2 ? addTagsField(old) : old);
 *
 * Legacy unversioned data (what the app stores today) is treated as version 1.
 */
export function getVersioned<T>(
  key: string,
  currentVersion: number,
  defaultValue: T,
  migrate?: (oldData: unknown, fromVersion: number) => T
): T {
  const stored = getFromStorage<unknown>(key, undefined);
  if (stored === undefined) return defaultValue;

  const isEnvelope = (x: unknown): x is Envelope<unknown> =>
    typeof x === 'object' && x !== null && 'v' in x && 'data' in x;

  const version = isEnvelope(stored) ? stored.v : 1;
  const data = isEnvelope(stored) ? stored.data : stored;

  if (version === currentVersion) return data as T;
  if (!migrate) return defaultValue;

  try {
    const migrated = migrate(data, version);
    saveVersioned(key, currentVersion, migrated);
    return migrated;
  } catch (error) {
    report('corrupt', key, error);
    return defaultValue;
  }
}

export function saveVersioned<T>(key: string, version: number, data: T): boolean {
  return saveToStorage<Envelope<T>>(key, { v: version, data });
}

/* ─────────────────────────── Cross-tab sync ─────────────────────────── */

/**
 * Get notified when ANOTHER tab changes a key, so two open tabs don't overwrite each other.
 * Returns an unsubscribe function (use it as the cleanup in useEffect).
 *
 *   useEffect(() => subscribeToStorage<Task[]>('tasks', setTasks), []);
 */
export function subscribeToStorage<T>(key: string, callback: (value: T | null) => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.storageArea !== getStore() || event.key !== key) return;
    if (event.newValue === null) return callback(null);
    try {
      callback(JSON.parse(event.newValue) as T);
    } catch (error) {
      report('corrupt', key, error);
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

/* ─────────────────────────── Backup / restore ─────────────────────────── */

const BACKUP_KEYS = ['tasks', 'categories', 'theme'] as const;

/** Serialize app data to a JSON string, ready to download as a backup file. */
export function exportStorage(keys: readonly string[] = BACKUP_KEYS): string {
  const data: Record<string, unknown> = {};
  for (const key of keys) {
    const value = getFromStorage<unknown>(key, undefined);
    if (value !== undefined) data[key] = value;
  }
  return JSON.stringify({ app: 'advanced-todo-list-app', exportedAt: new Date().toISOString(), data }, null, 2);
}

/** Restore a backup made by `exportStorage`. Only whitelisted keys are written. Returns how many were restored. */
export function importStorage(json: string, keys: readonly string[] = BACKUP_KEYS): number {
  try {
    const parsed = JSON.parse(json) as { data?: Record<string, unknown> };
    if (!parsed.data || typeof parsed.data !== 'object') throw new Error('Not a valid backup file');

    let restored = 0;
    for (const key of keys) {
      if (key in parsed.data && saveToStorage(key, parsed.data[key])) restored++;
    }
    return restored;
  } catch (error) {
    report('corrupt', 'import', error);
    return 0;
  }
}
