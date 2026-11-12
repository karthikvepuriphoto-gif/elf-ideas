import { describe, expect, it } from "vitest";
import { activeFilterCount, emptyFilters, filterIdeas } from "./filters";
import { ideas, normalizeIdea } from "./ideas";

describe("family catalog", () => {
  it("loads every family idea with a source ready for Friend and Web later", () => {
    expect(ideas).toHaveLength(90);
    expect(new Set(ideas.map((idea) => idea.source))).toEqual(new Set(["Our family"]));
    expect(ideas.every((idea) => idea.photos.length > 0 && idea.cover)).toBe(true);
  });

  it("defaults a future idea without a source to Our family and keeps Friend credit", () => {
    const family = normalizeIdea({
      id: "x",
      title: "Loose idea",
      cover: "a.jpg",
      photos: ["a.jpg"],
    });
    expect(family?.source).toBe("Our family");
    const friend = normalizeIdea({
      id: "y",
      title: "From a friend",
      source: "Friend",
      credit: "Asha",
      cover: "b.jpg",
      photos: ["b.jpg"],
      difficulty: "Medium",
    });
    expect(friend?.source).toBe("Friend");
    expect(friend?.credit).toBe("Asha");
    expect(normalizeIdea({ title: "no id", cover: "a.jpg" })).toBeNull();
  });
});

describe("filterIdeas", () => {
  it("filters by difficulty, year, tag, mess, and text", () => {
    const easy = filterIdeas(ideas, { ...emptyFilters, difficulty: "Easy" });
    expect(easy.length).toBeGreaterThan(0);
    expect(easy.every((idea) => idea.difficulty === "Easy")).toBe(true);

    const year = filterIdeas(ideas, { ...emptyFilters, year: 2024 });
    expect(year.every((idea) => idea.year === 2024)).toBe(true);
    expect(year.length).toBe(3);

    const prank = filterIdeas(ideas, { ...emptyFilters, tag: "prank" });
    expect(prank.every((idea) => idea.tags.includes("prank"))).toBe(true);

    const high = filterIdeas(ideas, { ...emptyFilters, mess: "High" });
    expect(high.map((idea) => idea.id).sort()).toEqual(["2020-flour-snow-angel", "2023-nerf-war"]);

    const search = filterIdeas(ideas, { ...emptyFilters, q: "zip line" });
    expect(search.map((idea) => idea.id).sort()).toEqual(["2021-santas-zip-line", "2023-living-room-zip-line"]);

    const supply = filterIdeas(ideas, { ...emptyFilters, q: "mason jar" });
    expect(supply.some((idea) => idea.id === "2020-quarantined-arrival")).toBe(true);
  });

  it("counts active filters", () => {
    expect(activeFilterCount(emptyFilters)).toBe(0);
    expect(activeFilterCount({ ...emptyFilters, difficulty: "Hard", mess: "Low", q: "  elf " })).toBe(3);
  });
});
