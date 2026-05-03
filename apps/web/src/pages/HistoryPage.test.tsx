import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import HistoryPage from "./HistoryPage";
import type { ReadingResult } from "@tarot-saju/shared";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockResults: ReadingResult[] = [];
vi.mock("../stores/useHistoryStore", () => ({
  useHistoryStore: vi.fn((selector: (s: { results: ReadingResult[] }) => unknown) =>
    selector({ results: mockResults }),
  ),
}));

function setMockResults(results: ReadingResult[]) {
  mockResults.length = 0;
  mockResults.push(...results);
}

const MOCK_RESULT: ReadingResult = {
  id: "r1",
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

const MOCK_RESULT_2: ReadingResult = {
  id: "r2",
  request: {
    themeId: "love-heart",
    cards: [
      { cardId: 1, positionIndex: 0, isReversed: false },
      { cardId: 2, positionIndex: 1, isReversed: false },
      { cardId: 3, positionIndex: 2, isReversed: true },
    ],
  },
  interpretation: "Love interpretation.",
  summary: "Love summary.",
  createdAt: "2026-05-02T10:00:00.000Z",
};

function renderHistoryPage() {
  return render(
    <MemoryRouter initialEntries={["/history"]}>
      <HistoryPage />
    </MemoryRouter>,
  );
}

describe("HistoryPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    setMockResults([]);
  });

  it("renders header with title", () => {
    renderHistoryPage();
    expect(screen.getByText("히스토리")).toBeInTheDocument();
  });

  it("renders empty state when no results", () => {
    renderHistoryPage();
    expect(screen.getByText("여기는 아직 비어있어요.")).toBeInTheDocument();
  });

  it("renders history items from store", () => {
    setMockResults([MOCK_RESULT, MOCK_RESULT_2]);
    renderHistoryPage();

    expect(screen.getByText("오늘의 타로")).toBeInTheDocument();
    expect(screen.getByText("그 사람의 마음")).toBeInTheDocument();
  });

  it("renders summary stats with this month count", () => {
    setMockResults([MOCK_RESULT, MOCK_RESULT_2]);
    renderHistoryPage();

    expect(screen.getByText("이번 달 읽은 횟수")).toBeInTheDocument();
  });

  it("renders list header when items exist", () => {
    setMockResults([MOCK_RESULT]);
    renderHistoryPage();

    expect(screen.getByText("모든 기록")).toBeInTheDocument();
  });
});
