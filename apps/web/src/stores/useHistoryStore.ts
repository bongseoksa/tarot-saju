import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ReadingResult } from "@tarot-saju/shared";
import { createStorageAdapter } from "./createStorageAdapter";

const MAX_RESULTS = 20;

interface HistoryState {
  results: ReadingResult[];

  addResult: (result: ReadingResult) => void;
  getResult: (id: string) => ReadingResult | undefined;
  clearAll: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      results: [],

      addResult: (result) =>
        set((state) => {
          const updated = [result, ...state.results];
          return { results: updated.slice(0, MAX_RESULTS) };
        }),

      getResult: (id) => get().results.find((r) => r.id === id),

      clearAll: () => set({ results: [] }),
    }),
    {
      name: "history",
      storage: createJSONStorage(() => createStorageAdapter()),
    },
  ),
);
