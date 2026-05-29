/** Typed wrappers around localStorage to centralise key names */

const KEYS = {
  streak:       "sentir-streak",
  lastCheckin:  "sentir-last-checkin",
  todayEmotion: "sentir-today-emotion",
  onboarded:    "sentir-onboarded",
  onboarding:   "sentir-onboarding",
  cycleEnabled: "sentir-cycle-enabled",
} as const;

export type StorageKey = keyof typeof KEYS;

// ── Generic helpers ──────────────────────────────────────────────────────────

export function getItem(key: StorageKey): string | null {
  return localStorage.getItem(KEYS[key]);
}

export function setItem(key: StorageKey, value: string): void {
  localStorage.setItem(KEYS[key], value);
}

export function removeItem(key: StorageKey): void {
  localStorage.removeItem(KEYS[key]);
}

// ── Domain-specific helpers ──────────────────────────────────────────────────

export function getStreak(): number {
  return parseInt(getItem("streak") ?? "0", 10);
}

export function setStreak(n: number): void {
  setItem("streak", String(n));
}

export function getTodayEmotion(): string | null {
  return getItem("todayEmotion");
}

export function setTodayEmotion(emotion: string): void {
  setItem("todayEmotion", emotion);
  setItem("lastCheckin", new Date().toDateString());
}

export function isOnboarded(): boolean {
  return getItem("onboarded") === "true";
}

export function isCycleEnabled(): boolean {
  return getItem("cycleEnabled") === "true";
}

export function clearSession(): void {
  removeItem("onboarded");
  removeItem("onboarding");
  removeItem("cycleEnabled");
}
