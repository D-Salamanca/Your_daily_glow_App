/** Returns "Buenos días / tardes / noches" based on current hour */
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

/** Returns "lun 2 ene" style short date label in Spanish */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

/** Returns "HH:MM" from a Date */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

/** Returns "hace X minutos / horas / días" relative label */
export function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} día${days === 1 ? "" : "s"}`;
}

/** Calculates streak given last check-in date stored as dateString */
export function calculateStreak(lastCheck: string | null, currentStreak: number): number {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();
  if (lastCheck === today) return currentStreak;
  if (lastCheck === yesterday) return currentStreak + 1;
  return 1;
}

/** True if two dates fall on the same calendar day */
export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}
