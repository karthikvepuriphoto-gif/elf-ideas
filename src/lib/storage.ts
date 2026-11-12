import { clampStart, defaultPlanYear, parseISODate } from "./dates";
import type { Store } from "../types";

export const STORE_KEY = "elf-ideas.v1";
export const INSTALL_SEEN_KEY = "elf-ideas.install-seen";

const NOTE_LIMIT = 2000;

export function emptyStore(now = new Date()): Store {
  const year = defaultPlanYear(now);
  return {
    version: 1,
    favorites: [],
    done: {},
    notes: {},
    checks: {},
    planYear: year,
    planStart: `${year}-12-01`,
    nights: {},
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function cleanIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !item.trim() || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

function cleanStringMap(value: unknown, limit = 80): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(asRecord(value))) {
    if (!key.trim() || typeof entry !== "string") continue;
    const text = entry.slice(0, limit);
    if (text.trim()) out[key] = text;
  }
  return out;
}

function cleanDone(value: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(asRecord(value))) {
    if (typeof entry === "string" && parseISODate(entry)) out[key] = entry;
  }
  return out;
}

function cleanChecks(value: unknown): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [key, entry] of Object.entries(asRecord(value))) {
    const list = cleanIdList(entry);
    if (list.length) out[key] = list;
  }
  return out;
}

function cleanNights(value: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  const used = new Set<string>();
  for (const [date, ideaId] of Object.entries(asRecord(value))) {
    if (!parseISODate(date) || typeof ideaId !== "string" || !ideaId.trim()) continue;
    if (used.has(ideaId)) continue;
    used.add(ideaId);
    out[date] = ideaId;
  }
  return out;
}

export function sanitizeStore(value: unknown, now = new Date()): Store {
  const raw = asRecord(value);
  const base = emptyStore(now);
  const yearValue = raw.planYear;
  const planYear =
    typeof yearValue === "number" && yearValue >= 2020 && yearValue <= 2040 ? Math.round(yearValue) : base.planYear;
  const startRaw = typeof raw.planStart === "string" ? raw.planStart : base.planStart;
  return {
    version: 1,
    favorites: cleanIdList(raw.favorites),
    done: cleanDone(raw.done),
    notes: cleanStringMap(raw.notes, NOTE_LIMIT),
    checks: cleanChecks(raw.checks),
    planYear,
    planStart: clampStart(planYear, startRaw),
    nights: cleanNights(raw.nights),
  };
}

export function loadStore(now = new Date()): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore(now);
    return sanitizeStore(JSON.parse(raw), now);
  } catch {
    return emptyStore(now);
  }
}

export function saveStore(store: Store): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export type ExportFile = {
  app: "elf-ideas";
  version: 1;
  exportedAt: string;
  data: Store;
};

export function exportPayload(store: Store, now = new Date()): ExportFile {
  return {
    app: "elf-ideas",
    version: 1,
    exportedAt: now.toISOString(),
    data: store,
  };
}

export function parseImport(text: string, now = new Date()): Store {
  const parsed: unknown = JSON.parse(text);
  const record = asRecord(parsed);
  const data = record.app === "elf-ideas" && "data" in record ? record.data : parsed;
  return sanitizeStore(data, now);
}
