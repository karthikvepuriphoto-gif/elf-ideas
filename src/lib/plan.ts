import { clampStart, eachDate, planEnd, weekdayIndex } from "./dates";

export function nightsInRange(year: number, start: string): string[] {
  return eachDate(clampStart(year, start), planEnd(year));
}

export function calendarWeeks(dates: string[]): (string | null)[][] {
  if (dates.length === 0) return [];
  const cells: (string | null)[] = [...Array(weekdayIndex(dates[0]!)).fill(null), ...dates];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

export function nightForIdea(nights: Record<string, string>, ideaId: string): string | undefined {
  for (const [date, id] of Object.entries(nights)) {
    if (id === ideaId) return date;
  }
  return undefined;
}

/** Move an idea onto another night. An occupied target swaps. */
export function moveNight(nights: Record<string, string>, from: string, to: string): Record<string, string> {
  if (from === to) return nights;
  const idea = nights[from];
  if (!idea) return nights;
  const next = { ...nights };
  const other = next[to];
  if (other) next[from] = other;
  else delete next[from];
  next[to] = idea;
  return next;
}

/**
 * Put an idea on a night.
 * If it already has a night and the target is taken, the two swap.
 * If it was unscheduled, the idea that was on the target comes off the plan.
 */
export function placeIdea(nights: Record<string, string>, ideaId: string, date: string): Record<string, string> {
  const from = nightForIdea(nights, ideaId);
  if (from === date) return nights;
  const next = { ...nights };
  const occupant = next[date];
  if (from && occupant && occupant !== ideaId) {
    next[from] = occupant;
    next[date] = ideaId;
    return next;
  }
  if (from) delete next[from];
  next[date] = ideaId;
  return next;
}

export function clearNight(nights: Record<string, string>, date: string): Record<string, string> {
  if (!nights[date]) return nights;
  const next = { ...nights };
  delete next[date];
  return next;
}

export function adjacentDate(dates: string[], date: string, direction: -1 | 1): string | null {
  const index = dates.indexOf(date);
  if (index < 0) return null;
  return dates[index + direction] ?? null;
}
