import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInterpretation } from "./useInterpretation";
import { useReadingStore } from "../stores/useReadingStore";
import { useHistoryStore } from "../stores/useHistoryStore";
import { usePendingStore } from "../stores/usePendingStore";
import * as sseClient from "../utils/sseClient";
import type { ReadingRequest } from "@tarot-saju/shared";

vi.mock("../utils/sseClient");

const mockRequest: ReadingRequest = {
  themeId: "daily-today",
  cards: [
    { cardId: 0, positionIndex: 0, isReversed: false },
    { cardId: 5, positionIndex: 1, isReversed: true },
    { cardId: 10, positionIndex: 2, isReversed: false },
  ],
};

describe("useInterpretation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useReadingStore.getState().reset();
    useHistoryStore.getState().clearAll();
    usePendingStore.getState().clearAll();
    localStorage.clear();
  });

  it("should stream interpretation and complete reading", async () => {
    const fullText = "### 과거 해석\n텍스트\n\n### 한줄 요약\n요약 문구";

    vi.mocked(sseClient.streamInterpretation).mockImplementation(
      async (_req, onChunk, onComplete) => {
        onChunk("### 과거 해석\n텍스트\n\n");
        onChunk("### 한줄 요약\n요약 문구");
        onComplete(fullText);
      },
    );

    useReadingStore.getState().startReading("daily-today");

    const { result } = renderHook(() => useInterpretation());

    await act(async () => {
      await result.current.interpret(mockRequest);
    });

    // Should have completed
    expect(useReadingStore.getState().phase).toBe("done");
    expect(useReadingStore.getState().summary).toBe("요약 문구");
    // Should have saved to history
    expect(useHistoryStore.getState().results).toHaveLength(1);
  });

  it("should retry once on failure then succeed", async () => {
    let callCount = 0;
    vi.mocked(sseClient.streamInterpretation).mockImplementation(
      async (_req, _onChunk, onComplete, onError) => {
        callCount++;
        if (callCount === 1) {
          onError(new Error("Server down"));
        } else {
          onComplete("### 한줄 요약\n성공");
        }
      },
    );

    useReadingStore.getState().startReading("daily-today");

    const { result } = renderHook(() => useInterpretation());

    await act(async () => {
      await result.current.interpret(mockRequest);
    });

    expect(callCount).toBe(2); // 1 fail + 1 retry
    expect(useReadingStore.getState().phase).toBe("done");
  });

  it("should save pending session after retry failure", async () => {
    vi.mocked(sseClient.streamInterpretation).mockImplementation(
      async (_req, _onChunk, _onComplete, onError) => {
        onError(new Error("Server down"));
      },
    );

    useReadingStore.getState().startReading("daily-today");
    useReadingStore.getState().selectCard(0, 0, false);
    useReadingStore.getState().selectCard(5, 1, true);
    useReadingStore.getState().selectCard(10, 2, false);

    const { result } = renderHook(() => useInterpretation());

    await act(async () => {
      await result.current.interpret(mockRequest);
    });

    // Should be in error phase
    expect(useReadingStore.getState().phase).toBe("error");
    // Should have saved pending session
    expect(usePendingStore.getState().sessions).toHaveLength(1);
    expect(usePendingStore.getState().sessions[0].themeId).toBe("daily-today");
  });
});
