import type { CategoryKey } from "./activities";

export interface LogEntry {
  id: string;
  at: string; // ISO timestamp
  activity: string;
  category: CategoryKey;
  minutes: number | null;
  points: number;
}

export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** Points per day for the Monday-to-Sunday week containing `now`. */
export function weekPoints(entries: LogEntry[], now = new Date()): number[] {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const out = [0, 0, 0, 0, 0, 0, 0];
  for (const e of entries) {
    const idx = Math.floor((new Date(e.at).getTime() - monday.getTime()) / 86_400_000);
    if (idx >= 0 && idx < 7) out[idx] += e.points;
  }
  return out;
}

export function weekCategoryPoints(entries: LogEntry[], now = new Date()): Record<CategoryKey, number> {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const out: Record<CategoryKey, number> = { mental: 0, physical: 0, health: 0, work: 0 };
  for (const e of entries) if (new Date(e.at) >= monday) out[e.category] += e.points;
  return out;
}

/** Consecutive days with at least one entry, ending today (or yesterday if nothing yet today). */
export function currentStreak(entries: LogEntry[], now = new Date()): number {
  const days = new Set(entries.map((e) => dayKey(new Date(e.at))));
  const d = new Date(now);
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const todayEntries = (entries: LogEntry[], now = new Date()) =>
  entries.filter((e) => dayKey(new Date(e.at)) === dayKey(now));
