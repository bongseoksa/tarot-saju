import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../utils/shareService", () => ({
  saveSharedReading: vi.fn(),
}));

import { useShare } from "./useShare";
import { saveSharedReading } from "../utils/shareService";
import type { ReadingResult } from "@tarot-saju/shared";

const MOCK_RESULT: ReadingResult = {
  id: "result-1",
  request: {
    themeId: "daily-today",
    cards: [
      { cardId: 0, positionIndex: 0, isReversed: false },
      { cardId: 6, positionIndex: 1, isReversed: true },
      { cardId: 17, positionIndex: 2, isReversed: false },
    ],
  },
  interpretation: "Interpretation text.",
  summary: "Summary text.",
  createdAt: "2026-05-03T12:00:00.000Z",
};

describe("useShare", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("saves reading and copies share URL to clipboard", async () => {
    vi.mocked(saveSharedReading).mockResolvedValue("share-uuid-123");

    const { result } = renderHook(() => useShare());

    await act(async () => {
      await result.current.share(MOCK_RESULT);
    });

    expect(saveSharedReading).toHaveBeenCalledWith(MOCK_RESULT);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("/shared/share-uuid-123"),
    );
  });

  it("sets isSharing true during operation and false after", async () => {
    let resolvePromise: (value: string) => void;
    vi.mocked(saveSharedReading).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const { result } = renderHook(() => useShare());

    expect(result.current.isSharing).toBe(false);

    let sharePromise: Promise<void>;
    act(() => {
      sharePromise = result.current.share(MOCK_RESULT);
    });

    expect(result.current.isSharing).toBe(true);

    await act(async () => {
      resolvePromise!("share-uuid-123");
      await sharePromise!;
    });

    expect(result.current.isSharing).toBe(false);
  });

  it("does not throw on error and resets isSharing", async () => {
    vi.mocked(saveSharedReading).mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useShare());

    await act(async () => {
      await result.current.share(MOCK_RESULT);
    });

    expect(result.current.isSharing).toBe(false);
  });
});
