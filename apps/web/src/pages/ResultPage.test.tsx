import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import ResultPage from "./ResultPage";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock useReadingStore
const mockReadingState = {
  phase: "done" as const,
  selectedCards: [
    { cardId: 0, positionIndex: 0, isReversed: false },
    { cardId: 6, positionIndex: 1, isReversed: true },
    { cardId: 17, positionIndex: 2, isReversed: false },
  ],
  interpretation: "Past interpretation.\n\nPresent interpretation.\n\nFuture interpretation.",
  summary: "A bright day ahead.",
  resultId: "new-result-id",
  themeId: "daily-today",
  reset: vi.fn(),
};

vi.mock("../stores/useReadingStore", () => ({
  useReadingStore: Object.assign(
    vi.fn((selector: (s: typeof mockReadingState) => unknown) =>
      selector(mockReadingState),
    ),
    {
      getState: () => mockReadingState,
    },
  ),
}));

// Mock useHistoryStore
const mockHistoryResult = {
  id: "hist-1",
  request: {
    themeId: "daily-today",
    cards: [
      { cardId: 1, positionIndex: 0, isReversed: false },
      { cardId: 2, positionIndex: 1, isReversed: false },
      { cardId: 3, positionIndex: 2, isReversed: true },
    ],
  },
  interpretation: "History interpretation.",
  summary: "History summary.",
  createdAt: "2026-05-02T10:00:00.000Z",
};

vi.mock("../stores/useHistoryStore", () => ({
  useHistoryStore: Object.assign(
    vi.fn(() => ({})),
    {
      getState: vi.fn(() => ({
        getResult: vi.fn((id: string) =>
          id === "hist-1" ? mockHistoryResult : undefined,
        ),
      })),
    },
  ),
}));

// Mock useShare
const mockShare = vi.fn();
vi.mock("../hooks/useShare", () => ({
  useShare: () => ({ share: mockShare, isSharing: false }),
}));

function renderResultPage(resultId = "new-result-id") {
  return render(
    <MemoryRouter initialEntries={[`/result/${resultId}`]}>
      <Routes>
        <Route path="/result/:resultId" element={<ResultPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ResultPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockShare.mockClear();
    mockReadingState.phase = "done";
    mockReadingState.resultId = "new-result-id";
  });

  it("renders card summary from store", () => {
    renderResultPage();
    expect(screen.getByText("과거")).toBeInTheDocument();
    expect(screen.getByText("현재")).toBeInTheDocument();
    expect(screen.getByText("미래")).toBeInTheDocument();
  });

  it("renders interpretation text", () => {
    renderResultPage();
    expect(screen.getByText(/Past interpretation/)).toBeInTheDocument();
  });

  it("renders summary", () => {
    renderResultPage();
    expect(screen.getByText("A bright day ahead.")).toBeInTheDocument();
  });

  it("renders share and home buttons", () => {
    renderResultPage();
    expect(
      screen.getByRole("button", { name: /공유하기/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /점 하나 더 찍어볼까/ }),
    ).toBeInTheDocument();
  });

  it("calls share when share button is clicked", () => {
    renderResultPage();
    fireEvent.click(screen.getByRole("button", { name: /공유하기/ }));
    expect(mockShare).toHaveBeenCalled();
  });

  it("renders ad banner placeholder", () => {
    renderResultPage();
    expect(screen.getByText("Advertisement")).toBeInTheDocument();
  });

  it("navigates home when CTA is clicked", () => {
    renderResultPage();
    fireEvent.click(
      screen.getByRole("button", { name: /점 하나 더 찍어볼까/ }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
