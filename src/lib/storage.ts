/**
 * storage.ts — unified key-value storage
 *
 * On Android/iOS  → @capacitor/preferences (native SharedPreferences / NSUserDefaults)
 * On web          → localStorage (same behaviour, no extra setup)
 *
 * API is async to match Capacitor's async Preferences API.
 * All values are stored as strings; use JSON.stringify / JSON.parse for objects.
 */

import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const isNative = () => Capacitor.isNativePlatform();

export const Storage = {
  async get(key: string): Promise<string | null> {
    if (isNative()) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    return localStorage.getItem(key);
  },

  async set(key: string, value: string): Promise<void> {
    if (isNative()) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },

  async remove(key: string): Promise<void> {
    if (isNative()) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },

  async clear(): Promise<void> {
    if (isNative()) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  },

  /** Convenience: get a parsed JSON value (returns null if missing or invalid) */
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await Storage.get(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },

  /** Convenience: store a value as JSON */
  async setJSON(key: string, value: unknown): Promise<void> {
    await Storage.set(key, JSON.stringify(value));
  },
};
