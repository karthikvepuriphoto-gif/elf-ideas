import type { Filters, Idea } from "../types";

export const emptyFilters: Filters = {
  q: "",
  difficulty: "",
  year: "",
  tag: "",
  mess: "",
};

export function filterIdeas(list: Idea[], filters: Filters): Idea[] {
  const query = filters.q.trim().toLowerCase();
  return list.filter((idea) => {
    if (filters.difficulty && idea.difficulty !== filters.difficulty) return false;
    if (filters.year && idea.year !== filters.year) return false;
    if (filters.tag && !idea.tags.includes(filters.tag)) return false;
    if (filters.mess && idea.mess !== filters.mess) return false;
    if (!query) return true;
    const haystack = [idea.title, idea.description, idea.time, idea.source, idea.credit ?? "", ...idea.tags, ...idea.supplies]
      .join("\n")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function activeFilterCount(filters: Filters): number {
  let count = 0;
  if (filters.difficulty) count += 1;
  if (filters.year) count += 1;
  if (filters.tag) count += 1;
  if (filters.mess) count += 1;
  if (filters.q.trim()) count += 1;
  return count;
}
