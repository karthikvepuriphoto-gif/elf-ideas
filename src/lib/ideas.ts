import rawIdeas from "../data/ideas.json";
import { DIFFICULTIES, MESS_LEVELS, SOURCES, type Difficulty, type Idea, type IdeaSource, type MessLevel } from "../types";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asSource(value: unknown): IdeaSource {
  return SOURCES.includes(value as IdeaSource) ? (value as IdeaSource) : "Our family";
}

function asDifficulty(value: unknown): Difficulty {
  return DIFFICULTIES.includes(value as Difficulty) ? (value as Difficulty) : "Easy";
}

function asMess(value: unknown): MessLevel {
  return MESS_LEVELS.includes(value as MessLevel) ? (value as MessLevel) : "None";
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

/**
 * Accepts a catalog record. Current family nights already include source.
 * Later Friend and Web ideas can use the same shape plus credit and link.
 */
export function normalizeIdea(raw: Record<string, unknown>): Idea | null {
  const id = asString(raw.id);
  const title = asString(raw.title);
  if (!id || !title) return null;
  const photos = asStringList(raw.photos);
  const cover = asString(raw.cover) ?? photos[0] ?? "";
  if (!cover) return null;
  const year = typeof raw.year === "number" && Number.isFinite(raw.year) ? raw.year : null;
  const date = asString(raw.date);
  return {
    id,
    source: asSource(raw.source),
    title,
    description: typeof raw.description === "string" ? raw.description : "",
    date,
    year,
    difficulty: asDifficulty(raw.difficulty),
    time: typeof raw.time === "string" && raw.time.trim() ? raw.time : "a few minutes",
    supplies: asStringList(raw.supplies),
    tags: asStringList(raw.tags),
    mess: asMess(raw.mess),
    cover,
    photos: photos.length > 0 ? photos : [cover],
    credit: asString(raw.credit) ?? undefined,
    link: asString(raw.link) ?? undefined,
  };
}

export const ideas: Idea[] = (rawIdeas as unknown[])
  .map((item) => (item && typeof item === "object" ? normalizeIdea(item as Record<string, unknown>) : null))
  .filter((idea): idea is Idea => idea !== null);

export const ideasById = new Map(ideas.map((idea) => [idea.id, idea]));

export function getIdea(id: string | undefined): Idea | undefined {
  if (!id) return undefined;
  return ideasById.get(id);
}

export const allYears: number[] = [...new Set(ideas.map((idea) => idea.year).filter((year): year is number => year != null))].sort(
  (a, b) => a - b,
);

export const allTags: string[] = (() => {
  const counts = new Map<string, number>();
  for (const idea of ideas) {
    for (const tag of idea.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
})();
