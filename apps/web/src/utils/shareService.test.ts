import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before importing shareService
vi.mock("./supabase", () => {
  const mockFrom = vi.fn();
  return {
    supabase: { from: mockFrom },
  };
});

import { supabase } from "./supabase";
import { saveSharedReading, getSharedReading } from "./shareService";
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
  interpretation: "Your reading interpretation text here.",
  summary: "A bright day awaits you.",
  createdAt: "2026-05-03T12:00:00.000Z",
};

describe("shareService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveSharedReading", () => {
    it("inserts into shared_readings and returns shareId", async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "share-uuid-123" },
            error: null,
          }),
        }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as never);

      const shareId = await saveSharedReading(MOCK_RESULT);

      expect(shareId).toBe("share-uuid-123");
      expect(supabase.from).toHaveBeenCalledWith("shared_readings");
      expect(mockInsert).toHaveBeenCalledWith({
        theme_id: "daily-today",
        theme_title: "오늘의 타로",
        cards: MOCK_RESULT.request.cards,
        interpretation: MOCK_RESULT.interpretation,
        summary: MOCK_RESULT.summary,
      });
    });

    it("throws on Supabase error", async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "insert failed" },
          }),
        }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as never);

      await expect(saveSharedReading(MOCK_RESULT)).rejects.toThrow(
        "insert failed",
      );
    });
  });

  describe("getSharedReading", () => {
    it("returns shared reading data by id", async () => {
      const mockRow = {
        id: "share-uuid-123",
        theme_id: "daily-today",
        theme_title: "오늘의 타로",
        cards: MOCK_RESULT.request.cards,
        interpretation: MOCK_RESULT.interpretation,
        summary: MOCK_RESULT.summary,
        created_at: "2026-05-03T12:00:00.000Z",
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockRow,
            error: null,
          }),
        }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as never);

      const result = await getSharedReading("share-uuid-123");

      expect(result).toEqual({
        id: "share-uuid-123",
        themeId: "daily-today",
        themeTitle: "오늘의 타로",
        cards: MOCK_RESULT.request.cards,
        interpretation: MOCK_RESULT.interpretation,
        summary: MOCK_RESULT.summary,
        createdAt: "2026-05-03T12:00:00.000Z",
      });
      expect(supabase.from).toHaveBeenCalledWith("shared_readings");
    });

    it("returns null when not found", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as never);

      const result = await getSharedReading("nonexistent-id");

      expect(result).toBeNull();
    });

    it("throws on Supabase error", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "select failed" },
          }),
        }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as never);

      await expect(getSharedReading("some-id")).rejects.toThrow(
        "select failed",
      );
    });
  });
});
