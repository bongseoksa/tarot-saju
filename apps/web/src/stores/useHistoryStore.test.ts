import { describe, it, expect, beforeEach } from "vitest";
import { useHistoryStore } from "@/stores/useHistoryStore";
import type { ReadingResult } from "@tarot-saju/shared";

function makeResult(id: string, overrides?: Partial<ReadingResult>): ReadingResult {
  return {
    id,
    request: {
      themeId: "today",
      cards: [
        { cardId: 0, positionIndex: 0, isReversed: false },
        { cardId: 1, positionIndex: 1, isReversed: true },
        { cardId: 2, positionIndex: 2, isReversed: false },
      ],
    },
    interpretation: "### 과거 해석\ntest\n### 현재 해석\ntest\n### 미래 해석\ntest\n### 종합 조언\ntest",
    summary: "Test summary",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("useHistoryStore", () => {
  beforeEach(() => {
    useHistoryStore.getState().clear();
    localStorage.clear();
  });

  it("adds a result and retrieves it by id", () => {
    const result = makeResult("abc-123");
    useHistoryStore.getState().addResult(result);

    expect(useHistoryStore.getState().results).toHaveLength(1);
    expect(useHistoryStore.getState().getResult("abc-123")).toEqual(result);
  });

  it("returns undefined for non-existent id", () => {
    useHistoryStore.getState().addResult(makeResult("abc-123"));
    expect(useHistoryStore.getState().getResult("non-existent")).toBeUndefined();
  });

  it("prepends new results (newest first)", () => {
    useHistoryStore.getState().addResult(makeResult("first"));
    useHistoryStore.getState().addResult(makeResult("second"));

    const results = useHistoryStore.getState().results;
    expect(results[0].id).toBe("second");
    expect(results[1].id).toBe("first");
  });

  it("caps at MAX_HISTORY (20) results", () => {
    for (let i = 0; i < 25; i++) {
      useHistoryStore.getState().addResult(makeResult(`result-${i}`));
    }

    const results = useHistoryStore.getState().results;
    expect(results).toHaveLength(20);
    // newest should be result-24, oldest kept should be result-5
    expect(results[0].id).toBe("result-24");
    expect(results[19].id).toBe("result-5");
  });

  it("evicts oldest results when exceeding max", () => {
    for (let i = 0; i < 25; i++) {
      useHistoryStore.getState().addResult(makeResult(`result-${i}`));
    }

    // results 0-4 should be evicted
    for (let i = 0; i < 5; i++) {
      expect(useHistoryStore.getState().getResult(`result-${i}`)).toBeUndefined();
    }
    // results 5-24 should exist
    for (let i = 5; i < 25; i++) {
      expect(useHistoryStore.getState().getResult(`result-${i}`)).toBeDefined();
    }
  });

  it("clears all results", () => {
    useHistoryStore.getState().addResult(makeResult("a"));
    useHistoryStore.getState().addResult(makeResult("b"));
    useHistoryStore.getState().clear();

    expect(useHistoryStore.getState().results).toHaveLength(0);
  });

  it("handles results with empty interpretation", () => {
    const result = makeResult("empty", { interpretation: "", summary: "" });
    useHistoryStore.getState().addResult(result);

    const stored = useHistoryStore.getState().getResult("empty");
    expect(stored?.interpretation).toBe("");
    expect(stored?.summary).toBe("");
  });

  it("handles duplicate result ids by keeping both", () => {
    useHistoryStore.getState().addResult(makeResult("dup"));
    useHistoryStore.getState().addResult(makeResult("dup", { summary: "updated" }));

    const results = useHistoryStore.getState().results;
    expect(results).toHaveLength(2);
    // getResult returns first match (newest)
    expect(useHistoryStore.getState().getResult("dup")?.summary).toBe("updated");
  });
});
