import { afterEach, describe, expect, it, vi } from "vitest";
import { emptyStore, exportPayload, loadStore, parseImport, sanitizeStore, saveStore, STORE_KEY } from "./storage";

const memory = new Map<string, string>();

afterEach(() => {
  memory.clear();
  vi.unstubAllGlobals();
});

function stubStorage() {
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  });
}

describe("sanitizeStore", () => {
  const now = new Date(2026, 10, 12);

  it("drops broken fields and keeps a December plan", () => {
    const store = sanitizeStore(
      {
        favorites: ["a", "a", 4, ""],
        done: { a: "2026-12-02", b: "tomorrow" },
        notes: { a: "  hello  " },
        checks: { a: ["tape", ""] },
        planYear: 2026,
        planStart: "2026-11-20",
        nights: { "2026-12-03": "a", "nope": "b", "2026-12-04": "a" },
      },
      now,
    );
    expect(store.favorites).toEqual(["a"]);
    expect(store.done).toEqual({ a: "2026-12-02" });
    expect(store.notes.a?.trim()).toBe("hello");
    expect(store.checks.a).toEqual(["tape"]);
    expect(store.planStart).toBe("2026-11-20");
    expect(store.nights).toEqual({ "2026-12-03": "a" });
  });

  it("starts new phones on December 1 of the current season", () => {
    expect(emptyStore(now).planStart).toBe("2026-12-01");
    expect(emptyStore(new Date(2026, 11, 26)).planYear).toBe(2027);
  });
});

describe("import and export", () => {
  it("round-trips a file and accepts a raw store", () => {
    stubStorage();
    const now = new Date(2026, 10, 12);
    const store = emptyStore(now);
    store.favorites = ["2020-quarantined-arrival"];
    store.nights = { "2026-12-04": "2020-quarantined-arrival" };
    saveStore(store);
    expect(loadStore(now).favorites).toEqual(store.favorites);

    const file = exportPayload(store, now);
    expect(parseImport(JSON.stringify(file), now)).toMatchObject({
      favorites: store.favorites,
      nights: store.nights,
    });
    expect(parseImport(JSON.stringify(store), now).nights["2026-12-04"]).toBe("2020-quarantined-arrival");
    expect(memory.get(STORE_KEY)).toContain("2020-quarantined-arrival");
  });

  it("rejects text that is not JSON", () => {
    expect(() => parseImport("nope")).toThrow();
  });
});
