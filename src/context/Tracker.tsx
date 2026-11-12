import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clampStart, todayISO } from "../lib/dates";
import { clearNight, moveNight, placeIdea } from "../lib/plan";
import { loadStore, parseImport, saveStore } from "../lib/storage";
import type { Store } from "../types";

type TrackerApi = {
  store: Store;
  toggleFavorite: (id: string) => void;
  setDone: (id: string, date: string | null) => void;
  setNote: (id: string, note: string) => void;
  toggleSupply: (id: string, supply: string) => void;
  setPlanYear: (year: number) => void;
  setPlanStart: (iso: string) => void;
  placeOnNight: (ideaId: string, date: string) => void;
  moveOnPlan: (from: string, to: string) => void;
  clearPlanNight: (date: string) => void;
  replaceStore: (store: Store) => void;
  importText: (text: string) => Store;
};

const TrackerContext = createContext<TrackerApi | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => loadStore());

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const toggleFavorite = useCallback((id: string) => {
    setStore((current) => {
      const has = current.favorites.includes(id);
      return {
        ...current,
        favorites: has ? current.favorites.filter((item) => item !== id) : [...current.favorites, id],
      };
    });
  }, []);

  const setDone = useCallback((id: string, date: string | null) => {
    setStore((current) => {
      const done = { ...current.done };
      if (date) done[id] = date;
      else delete done[id];
      return { ...current, done };
    });
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setStore((current) => {
      const notes = { ...current.notes };
      const trimmed = note.slice(0, 2000);
      if (trimmed.trim()) notes[id] = trimmed;
      else delete notes[id];
      return { ...current, notes };
    });
  }, []);

  const toggleSupply = useCallback((id: string, supply: string) => {
    setStore((current) => {
      const existing = current.checks[id] ?? [];
      const next = existing.includes(supply) ? existing.filter((item) => item !== supply) : [...existing, supply];
      const checks = { ...current.checks };
      if (next.length) checks[id] = next;
      else delete checks[id];
      return { ...current, checks };
    });
  }, []);

  const setPlanYear = useCallback((year: number) => {
    const nextYear = Math.min(2040, Math.max(2020, Math.round(year)));
    setStore((current) => ({
      ...current,
      planYear: nextYear,
      planStart: clampStart(nextYear, current.planStart),
    }));
  }, []);

  const setPlanStart = useCallback((iso: string) => {
    setStore((current) => ({ ...current, planStart: clampStart(current.planYear, iso) }));
  }, []);

  const placeOnNight = useCallback((ideaId: string, date: string) => {
    setStore((current) => ({ ...current, nights: placeIdea(current.nights, ideaId, date) }));
  }, []);

  const moveOnPlan = useCallback((from: string, to: string) => {
    setStore((current) => ({ ...current, nights: moveNight(current.nights, from, to) }));
  }, []);

  const clearPlanNight = useCallback((date: string) => {
    setStore((current) => ({ ...current, nights: clearNight(current.nights, date) }));
  }, []);

  const replaceStore = useCallback((next: Store) => {
    setStore(next);
  }, []);

  const importText = useCallback((text: string) => {
    const next = parseImport(text);
    setStore(next);
    return next;
  }, []);

  const api = useMemo<TrackerApi>(
    () => ({
      store,
      toggleFavorite,
      setDone,
      setNote,
      toggleSupply,
      setPlanYear,
      setPlanStart,
      placeOnNight,
      moveOnPlan,
      clearPlanNight,
      replaceStore,
      importText,
    }),
    [
      store,
      toggleFavorite,
      setDone,
      setNote,
      toggleSupply,
      setPlanYear,
      setPlanStart,
      placeOnNight,
      moveOnPlan,
      clearPlanNight,
      replaceStore,
      importText,
    ],
  );

  return <TrackerContext.Provider value={api}>{children}</TrackerContext.Provider>;
}

export function useTracker(): TrackerApi {
  const value = useContext(TrackerContext);
  if (!value) throw new Error("useTracker must be used inside TrackerProvider");
  return value;
}

export function doneToday(): string {
  return todayISO();
}
