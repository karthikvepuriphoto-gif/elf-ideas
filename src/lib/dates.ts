export function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(now = new Date()): string {
  return formatISODate(now);
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function eachDate(start: string, end: string): string[] {
  if (!parseISODate(start) || !parseISODate(end) || start > end) return [];
  const out: string[] = [];
  let cursor = start;
  while (cursor <= end && out.length < 120) {
    out.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return out;
}

export function defaultPlanYear(now = new Date()): number {
  if (now.getMonth() === 11 && now.getDate() > 24) return now.getFullYear() + 1;
  return now.getFullYear();
}

export function planEnd(year: number): string {
  return `${year}-12-24`;
}

/** Arrival can be any night from November 1 through Christmas Eve. */
export function clampStart(year: number, iso: string): string {
  const min = `${year}-11-01`;
  const max = planEnd(year);
  const fallback = `${year}-12-01`;
  const monthDay = /^\d{4}-(\d{2}-\d{2})$/.exec(iso);
  const candidate = iso.startsWith(`${year}-`) ? iso : monthDay ? `${year}-${monthDay[1]}` : fallback;
  if (!parseISODate(candidate)) return fallback;
  if (candidate < min) return min;
  if (candidate > max) return max;
  return candidate;
}

export function formatNight(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatMonthDay(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatMonth(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return date.toLocaleDateString("en-US", { month: "long" });
}

export function weekdayIndex(iso: string): number {
  return parseISODate(iso)?.getDay() ?? 0;
}

export function dayNumber(iso: string): number {
  return parseISODate(iso)?.getDate() ?? 0;
}
