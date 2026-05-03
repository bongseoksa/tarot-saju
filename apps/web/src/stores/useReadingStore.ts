import { create } from "zustand";
import type { DrawnCard } from "@tarot-saju/shared";

interface ReadingState {
  themeId: string | null;
  selectedCards: DrawnCard[];
  phase: "selecting" | "loading" | "ad" | "streaming" | "done" | "error";
  interpretation: string;
  summary: string;
  resultId: string | null;

  startReading: (themeId: string) => void;
  selectCard: (
    cardId: number,
    positionIndex: number,
    isReversed: boolean,
  ) => void;
  resetSelection: () => void;
  setPhase: (phase: ReadingState["phase"]) => void;
  appendInterpretation: (chunk: string) => void;
  completeReading: (
    interpretation: string,
    summary: string,
    resultId: string,
  ) => void;
  reset: () => void;
}

const initialState = {
  themeId: null as string | null,
  selectedCards: [] as DrawnCard[],
  phase: "selecting" as const,
  interpretation: "",
  summary: "",
  resultId: null as string | null,
};

export const useReadingStore = create<ReadingState>()((set) => ({
  ...initialState,

  startReading: (themeId) =>
    set({ ...initialState, themeId, phase: "selecting" }),

  selectCard: (cardId, positionIndex, isReversed) =>
    set((state) => {
      if (state.selectedCards.length >= 3) return state;
      if (state.selectedCards.some((c) => c.cardId === cardId)) return state;
      return {
        selectedCards: [
          ...state.selectedCards,
          { cardId, positionIndex, isReversed },
        ],
      };
    }),

  resetSelection: () => set({ selectedCards: [], phase: "selecting" }),

  setPhase: (phase) => set({ phase }),

  appendInterpretation: (chunk) =>
    set((state) => ({ interpretation: state.interpretation + chunk })),

  completeReading: (interpretation, summary, resultId) =>
    set({ interpretation, summary, resultId, phase: "done" }),

  reset: () => set(initialState),
}));
