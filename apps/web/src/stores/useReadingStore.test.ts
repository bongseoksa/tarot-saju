import { describe, it, expect, beforeEach } from "vitest";
import { useReadingStore } from "./useReadingStore";

const { getState } = useReadingStore;

function reset() {
  getState().reset();
}

describe("useReadingStore", () => {
  beforeEach(() => {
    reset();
  });

  describe("startReading", () => {
    it("should set themeId and phase to selecting", () => {
      getState().startReading("daily-today");
      expect(getState().themeId).toBe("daily-today");
      expect(getState().phase).toBe("selecting");
      expect(getState().selectedCards).toEqual([]);
    });
  });

  describe("selectCard", () => {
    it("should add a card to selectedCards", () => {
      getState().startReading("daily-today");
      getState().selectCard(5, 0, false);

      expect(getState().selectedCards).toHaveLength(1);
      expect(getState().selectedCards[0]).toEqual({
        cardId: 5,
        positionIndex: 0,
        isReversed: false,
      });
    });

    it("should add up to 3 cards", () => {
      getState().startReading("daily-today");
      getState().selectCard(0, 0, false);
      getState().selectCard(5, 1, true);
      getState().selectCard(10, 2, false);

      expect(getState().selectedCards).toHaveLength(3);
    });

    it("should ignore selection beyond 3 cards", () => {
      getState().startReading("daily-today");
      getState().selectCard(0, 0, false);
      getState().selectCard(5, 1, true);
      getState().selectCard(10, 2, false);
      getState().selectCard(15, 0, true); // 4th card — ignored

      expect(getState().selectedCards).toHaveLength(3);
    });

    it("should ignore duplicate cardId", () => {
      getState().startReading("daily-today");
      getState().selectCard(5, 0, false);
      getState().selectCard(5, 1, true); // same cardId — ignored

      expect(getState().selectedCards).toHaveLength(1);
    });
  });

  describe("resetSelection", () => {
    it("should clear selectedCards and set phase to selecting", () => {
      getState().startReading("daily-today");
      getState().selectCard(0, 0, false);
      getState().selectCard(5, 1, true);
      getState().setPhase("loading");

      getState().resetSelection();
      expect(getState().selectedCards).toEqual([]);
      expect(getState().phase).toBe("selecting");
    });
  });

  describe("setPhase", () => {
    it("should update the phase", () => {
      getState().setPhase("streaming");
      expect(getState().phase).toBe("streaming");
    });
  });

  describe("appendInterpretation", () => {
    it("should accumulate text chunks", () => {
      getState().appendInterpretation("Hello ");
      getState().appendInterpretation("World");
      expect(getState().interpretation).toBe("Hello World");
    });
  });

  describe("completeReading", () => {
    it("should set interpretation, summary, resultId and phase to done", () => {
      getState().startReading("daily-today");
      getState().completeReading("Full text", "Summary", "result-123");

      expect(getState().interpretation).toBe("Full text");
      expect(getState().summary).toBe("Summary");
      expect(getState().resultId).toBe("result-123");
      expect(getState().phase).toBe("done");
    });
  });

  describe("reset", () => {
    it("should reset all state to initial values", () => {
      getState().startReading("daily-today");
      getState().selectCard(5, 0, false);
      getState().appendInterpretation("text");
      getState().completeReading("interp", "sum", "id-1");

      getState().reset();

      expect(getState().themeId).toBeNull();
      expect(getState().selectedCards).toEqual([]);
      expect(getState().phase).toBe("selecting");
      expect(getState().interpretation).toBe("");
      expect(getState().summary).toBe("");
      expect(getState().resultId).toBeNull();
    });
  });
});
