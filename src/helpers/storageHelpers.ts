/**
 * storageHelpers.ts
 * Domain-specific wrappers over the unified Storage layer.
 * Uses @capacitor/preferences on Android/iOS and localStorage on web.
 */

import { Storage } from "@/lib/storage";

export const KEYS = {
  streak:        "sentir-streak",
  lastCheckin:   "sentir-last-checkin",
  todayEmotion:  "sentir-today-emotion",
  emotionHistory:"sentir-emotion-history",
  onboarded:     "sentir-onboarded",
  onboarding:    "sentir-onboarding",
  cycleEnabled:  "sentir-cycle-enabled",
  demoSeeded:    "sentir-demo-seeded",
  theme:         "sentir-theme",
} as const;

export type StorageKey = keyof typeof KEYS;

// ── Generic async helpers ────────────────────────────────────────────────────
export const getItem    = (key: StorageKey) => Storage.get(KEYS[key]);
export const setItem    = (key: StorageKey, value: string) => Storage.set(KEYS[key], value);
export const removeItem = (key: StorageKey) => Storage.remove(KEYS[key]);

// ── Synchronous shims for existing code that reads localStorage directly ────
// These remain synchronous so we don't break pages that haven't migrated yet.
// On web they are equivalent; on native they read the value that was last
// written (Preferences keeps a sync-safe mirror via localStorage during WebView).
export const getItemSync    = (key: StorageKey) => localStorage.getItem(KEYS[key]);
export const setItemSync    = (key: StorageKey, value: string) => {
  localStorage.setItem(KEYS[key], value);
  // Fire-and-forget async write to Preferences on native
  Storage.set(KEYS[key], value).catch(() => {});
};
export const removeItemSync = (key: StorageKey) => {
  localStorage.removeItem(KEYS[key]);
  Storage.remove(KEYS[key]).catch(() => {});
};

// ── Domain helpers ───────────────────────────────────────────────────────────
export const getStreak     = () => parseInt(getItemSync("streak") ?? "0", 10);
export const setStreak     = (n: number) => setItemSync("streak", String(n));

export const getTodayEmotion = () => getItemSync("todayEmotion");
export const setTodayEmotion = (emotion: string) => {
  setItemSync("todayEmotion", emotion);
  setItemSync("lastCheckin", new Date().toDateString());
};

export const isOnboarded    = () => getItemSync("onboarded") === "true";
export const isCycleEnabled = () => getItemSync("cycleEnabled") === "true";

export const clearSession = () => {
  removeItemSync("onboarded");
  removeItemSync("onboarding");
  removeItemSync("cycleEnabled");
  removeItemSync("demoSeeded");
};

export interface EmotionRecord { date: string; emotion: string; }

export const getEmotionHistory = (): EmotionRecord[] => {
  try { return JSON.parse(getItemSync("emotionHistory") ?? "[]"); } catch { return []; }
};

export const saveEmotionRecord = (date: string, emotion: string) => {
  const prev    = getEmotionHistory().filter((r) => r.date !== date);
  const updated = [...prev, { date, emotion }].slice(-30);
  setItemSync("emotionHistory", JSON.stringify(updated));
  // Also async write
  Storage.setJSON(KEYS.emotionHistory, updated).catch(() => {});
};
