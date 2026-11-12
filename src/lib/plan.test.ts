import { describe, expect, it } from "vitest";
import { adjacentDate, calendarWeeks, clearNight, moveNight, nightsInRange, placeIdea } from "./plan";

describe("nightsInRange", () => {
  it("runs from arrival through Christmas Eve", () => {
    const december = nightsInRange(2026, "2026-12-01");
    expect(december[0]).toBe("2026-12-01");
    expect(december.at(-1)).toBe("2026-12-24");
    expect(december).toHaveLength(24);

    const early = nightsInRange(2026, "2026-11-28");
    expect(early[0]).toBe("2026-11-28");
    expect(early).toContain("2026-12-01");
    expect(early.at(-1)).toBe("2026-12-24");
  });

  it("clamps a start date from another year onto the plan year", () => {
    expect(nightsInRange(2027, "2026-12-05")[0]).toBe("2027-12-05");
  });
});

describe("reordering nights", () => {
  const nights = { "2026-12-01": "a", "2026-12-03": "b" };

  it("swaps with an occupied night", () => {
    expect(moveNight(nights, "2026-12-01", "2026-12-03")).toEqual({
      "2026-12-01": "b",
      "2026-12-03": "a",
    });
  });

  it("moves into an empty night", () => {
    expect(moveNight(nights, "2026-12-01", "2026-12-02")).toEqual({
      "2026-12-02": "a",
      "2026-12-03": "b",
    });
  });

  it("moves an idea up or down one night", () => {
    const dates = ["2026-12-01", "2026-12-02", "2026-12-03"];
    expect(adjacentDate(dates, "2026-12-02", -1)).toBe("2026-12-01");
    expect(adjacentDate(dates, "2026-12-01", -1)).toBeNull();
    expect(adjacentDate(dates, "2026-12-03", 1)).toBeNull();
  });

  it("places an unscheduled idea and can swap one that is already planned", () => {
    expect(placeIdea(nights, "c", "2026-12-02")).toEqual({
      "2026-12-01": "a",
      "2026-12-02": "c",
      "2026-12-03": "b",
    });
    expect(placeIdea(nights, "a", "2026-12-03")).toEqual({
      "2026-12-01": "b",
      "2026-12-03": "a",
    });
    expect(placeIdea(nights, "c", "2026-12-01")["2026-12-01"]).toBe("c");
    expect(placeIdea(nights, "c", "2026-12-01")["2026-12-03"]).toBe("b");
  });

  it("clears a night", () => {
    expect(clearNight(nights, "2026-12-01")).toEqual({ "2026-12-03": "b" });
  });
});

describe("calendarWeeks", () => {
  it("pads the first week so December 1 sits on its weekday", () => {
    const weeks = calendarWeeks(["2026-12-01", "2026-12-02"]);
    expect(weeks[0]?.filter(Boolean)).toEqual(["2026-12-01", "2026-12-02"]);
    expect(weeks[0]).toHaveLength(7);
  });
});
