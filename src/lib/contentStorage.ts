/**
 * Santa Towing - Content Storage Abstraction
 * 
 * ============================================================================
 * IMPORTANT ARCHITECTURE NOTE:
 * THIS IS THE ONLY FILE TO REPLACE WHEN A REAL DATABASE (e.g., PostgreSQL,
 * Cloud SQL, or Firebase Firestore) IS ADDED IN THE FUTURE.
 * 
 * Nothing else in the application may access localStorage or storage drivers
 * directly. All components, hooks, and administrative interfaces interact with
 * content exclusively through this unified storage layer.
 * ============================================================================
 */

import defaultSiteContent from '../data/site-content.json';

const STORAGE_KEY = 'santa_towing_custom_content_v1';
const LISTENERS_KEY = 'santa_content_update_event';

type StorageListener = () => void;
const listeners = new Set<StorageListener>();

/**
 * Safely parse JSON from localStorage
 */
function readStorage(): Record<string, any> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn('[contentStorage] Failed to read from localStorage:', error);
    return {};
  }
}

/**
 * Safely write JSON to localStorage
 */
function writeStorage(data: Record<string, any>): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notifyListeners();
  } catch (error) {
    console.error('[contentStorage] Failed to save to localStorage:', error);
  }
}

/**
 * Notify all subscribers in the current tab and dispatch storage event
 */
function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('[contentStorage] Listener error:', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LISTENERS_KEY));
  }
}

/**
 * Returns all custom saved edits merged with defaults.
 * Callers receive an object of all key-value overrides.
 */
export function getContent(): Record<string, any> {
  return readStorage();
}

/**
 * Saves a single key-value content override.
 * Key can be dot-notated (e.g., 'global.links.phone' or 'theme.primary').
 */
export function saveContent(key: string, value: any): void {
  const current = readStorage();
  current[key] = value;
  writeStorage(current);
}

/**
 * Removes a customized key-value override, reverting back to site-content.json default.
 */
export function resetContent(key: string): void {
  const current = readStorage();
  if (key in current) {
    delete current[key];
    writeStorage(current);
  }
}

/**
 * Reverts all overrides, restoring the default site-content.json across the entire website.
 */
export function resetAll(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    notifyListeners();
  } catch (error) {
    console.error('[contentStorage] Failed to clear overrides:', error);
  }
}

/**
 * Subscribe to storage updates for React state synchronization
 */
export function subscribeToContent(listener: StorageListener): () => void {
  listeners.add(listener);

  // Cross-tab sync
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      listener();
    }
  };

  const handleCustomEvent = () => {
    listener();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener(LISTENERS_KEY, handleCustomEvent);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener(LISTENERS_KEY, handleCustomEvent);
    }
  };
}

/**
 * Helper to get initial default value from site-content.json
 */
export function getDefaultSiteContent(): Record<string, any> {
  return defaultSiteContent;
}
