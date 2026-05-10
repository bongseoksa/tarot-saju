import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReadingResult } from "@tarot-saju/shared";
import { createEncryptedStorage } from "@/utils/storageAdapter";

const MAX_HISTORY = 20;

interface HistoryState {
  results: ReadingResult[];
  addResult: (result: ReadingResult) => void;
  getResult: (id: string) => ReadingResult | undefined;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      results: [],
      addResult: (result) =>
        set((state) => ({
          results: [result, ...state.results].slice(0, MAX_HISTORY),
        })),
      getResult: (id) => get().results.find((r) => r.id === id),
      clear: () => set({ results: [] }),
    }),
    {
      name: "jeomhana-history",
      storage: createEncryptedStorage(),
    },
  ),
);
