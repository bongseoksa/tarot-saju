import { create } from "zustand";
import type { DrawnCard } from "@tarot-saju/shared";

interface ReadingState {
  themeId: string | null;
  cards: DrawnCard[];
  setTheme: (themeId: string) => void;
  addCard: (card: DrawnCard) => void;
  removeLastCard: () => void;
  reset: () => void;
}

export const useReadingStore = create<ReadingState>((set) => ({
  themeId: null,
  cards: [],
  setTheme: (themeId) => set({ themeId, cards: [] }),
  addCard: (card) =>
    set((state) => {
      if (state.cards.length >= 3) return state;
      return { cards: [...state.cards, card] };
    }),
  removeLastCard: () =>
    set((state) => ({ cards: state.cards.slice(0, -1) })),
  reset: () => set({ themeId: null, cards: [] }),
}));
