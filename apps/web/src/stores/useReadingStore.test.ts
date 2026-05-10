import { describe, it, expect, beforeEach } from "vitest";
import { useReadingStore } from "@/stores/useReadingStore";

describe("useReadingStore", () => {
  beforeEach(() => {
    useReadingStore.getState().reset();
  });

  it("sets theme and clears cards", () => {
    useReadingStore.getState().setTheme("daily-today");
    expect(useReadingStore.getState().themeId).toBe("daily-today");
    expect(useReadingStore.getState().cards).toHaveLength(0);
  });

  it("adds cards up to 3", () => {
    const { addCard } = useReadingStore.getState();
    addCard({ cardId: 0, positionIndex: 0, isReversed: false });
    addCard({ cardId: 1, positionIndex: 1, isReversed: true });
    addCard({ cardId: 2, positionIndex: 2, isReversed: false });
    expect(useReadingStore.getState().cards).toHaveLength(3);
  });

  it("does not add more than 3 cards", () => {
    const { addCard } = useReadingStore.getState();
    addCard({ cardId: 0, positionIndex: 0, isReversed: false });
    addCard({ cardId: 1, positionIndex: 1, isReversed: false });
    addCard({ cardId: 2, positionIndex: 2, isReversed: false });
    addCard({ cardId: 3, positionIndex: 3, isReversed: false });
    expect(useReadingStore.getState().cards).toHaveLength(3);
  });

  it("removes last card", () => {
    const { addCard, removeLastCard } = useReadingStore.getState();
    addCard({ cardId: 0, positionIndex: 0, isReversed: false });
    addCard({ cardId: 1, positionIndex: 1, isReversed: false });
    removeLastCard();
    expect(useReadingStore.getState().cards).toHaveLength(1);
    expect(useReadingStore.getState().cards[0].cardId).toBe(0);
  });

  it("resets all state", () => {
    const state = useReadingStore.getState();
    state.setTheme("love-feeling");
    state.addCard({ cardId: 5, positionIndex: 0, isReversed: false });
    state.reset();
    expect(useReadingStore.getState().themeId).toBeNull();
    expect(useReadingStore.getState().cards).toHaveLength(0);
  });
});
