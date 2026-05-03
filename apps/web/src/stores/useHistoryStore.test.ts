import { describe, it, expect, beforeEach } from "vitest";
import type { ReadingResult } from "@tarot-saju/shared";
import { useHistoryStore } from "./useHistoryStore";

const { getState } = useHistoryStore;

function makeResult(id: string, overrides?: Partial<ReadingResult>): ReadingResult {
  return {
    id,
    request: {
      themeId: "daily-today",
      cards: [
        { cardId: 0, positionIndex: 0, isReversed: false },
        { cardId: 1, positionIndex: 1, isReversed: true },
        { cardId: 2, positionIndex: 2, isReversed: false },
      ],
    },
    interpretation: `Interpretation for ${id}`,
    summary: `Summary for ${id}`,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("useHistoryStore", () => {
  beforeEach(() => {
    localStorage.clear();
    getState().clearAll();
  });

  describe("addResult", () => {
    it("should add a result to the list", () => {
      getState().addResult(makeResult("r1"));
      expect(getState().results).toHaveLength(1);
      expect(getState().results[0].id).toBe("r1");
    });

    it("should prepend new results (newest first)", () => {
      getState().addResult(makeResult("r1"));
      getState().addResult(makeResult("r2"));
      expect(getState().results[0].id).toBe("r2");
      expect(getState().results[1].id).toBe("r1");
    });

    it("should enforce max 20 results with FIFO", () => {
      for (let i = 0; i < 22; i++) {
        getState().addResult(makeResult(`r${i}`));
      }
      expect(getState().results).toHaveLength(20);
      // Oldest (r0, r1) should be removed
      expect(getState().results.map((r) => r.id)).not.toContain("r0");
      expect(getState().results.map((r) => r.id)).not.toContain("r1");
      // Newest should be first
      expect(getState().results[0].id).toBe("r21");
    });
  });

  describe("getResult", () => {
    it("should find a result by id", () => {
      getState().addResult(makeResult("r1"));
      getState().addResult(makeResult("r2"));
      const found = getState().getResult("r1");
      expect(found).toBeDefined();
      expect(found!.id).toBe("r1");
    });

    it("should return undefined for non-existent id", () => {
      expect(getState().getResult("missing")).toBeUndefined();
    });
  });

  describe("clearAll", () => {
    it("should remove all results", () => {
      getState().addResult(makeResult("r1"));
      getState().addResult(makeResult("r2"));
      getState().clearAll();
      expect(getState().results).toEqual([]);
    });
  });

  describe("persistence", () => {
    it("should persist data via storageUtil (encrypted in localStorage)", () => {
      getState().addResult(makeResult("persist-test"));

      // localStorage should have an encrypted entry (not plaintext)
      const keys = Object.keys(localStorage);
      const historyKey = keys.find((k) => k === "history");
      expect(historyKey).toBeDefined();

      const raw = localStorage.getItem("history");
      expect(raw).not.toBeNull();
      // Should not contain plaintext
      expect(raw).not.toContain("persist-test");
      expect(raw).not.toContain("interpretation");
    });
  });
});
