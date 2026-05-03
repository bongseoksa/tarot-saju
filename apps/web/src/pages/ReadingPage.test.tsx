import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import ReadingPage from "./ReadingPage";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockStartReading = vi.fn();
const mockSelectCard = vi.fn();
const mockResetSelection = vi.fn();
const mockReset = vi.fn();
const mockSetPhase = vi.fn();
const mockReadingState = {
  themeId: "daily-today",
  selectedCards: [] as { cardId: number; positionIndex: number; isReversed: boolean }[],
  phase: "selecting" as string,
  startReading: mockStartReading,
  selectCard: mockSelectCard,
  resetSelection: mockResetSelection,
  reset: mockReset,
  setPhase: mockSetPhase,
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

vi.mock("../hooks/useAdGate", () => ({
  useAdGate: () => ({ showAd: vi.fn().mockResolvedValue(false) }),
}));

const mockInterpret = vi.fn();
vi.mock("../hooks/useInterpretation", () => ({
  useInterpretation: () => ({ interpret: mockInterpret, abort: vi.fn() }),
}));

function renderReadingPage(themeId = "daily-today") {
  return render(
    <MemoryRouter initialEntries={[`/reading/${themeId}`]}>
      <Routes>
        <Route path="/reading/:themeId" element={<ReadingPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ReadingPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockStartReading.mockClear();
    mockSelectCard.mockClear();
    mockResetSelection.mockClear();
    mockReset.mockClear();
    mockInterpret.mockClear();
    mockReadingState.selectedCards = [];
    mockReadingState.phase = "selecting";
  });

  it("renders the guidance text", () => {
    renderReadingPage();
    expect(
      screen.getByText("세 장의 카드를 신중하게 골라주세요"),
    ).toBeInTheDocument();
  });

  it("renders 3 empty slots with position labels", () => {
    renderReadingPage();
    expect(screen.getByText("과거")).toBeInTheDocument();
    expect(screen.getByText("현재")).toBeInTheDocument();
    expect(screen.getByText("미래")).toBeInTheDocument();
  });

  it("renders 22 card buttons", () => {
    renderReadingPage();
    const cards = screen.getAllByRole("button", { name: /카드/ });
    expect(cards.length).toBe(22);
  });

  it("disables action button when less than 3 cards selected", () => {
    renderReadingPage();
    const actionButton = screen.getByRole("button", { name: /점 보기/ });
    expect(actionButton).toBeDisabled();
  });

  it("calls selectCard when a card is clicked", async () => {
    const user = userEvent.setup();
    renderReadingPage();

    const cards = screen.getAllByRole("button", { name: /카드/ });
    await user.click(cards[0]);

    expect(mockSelectCard).toHaveBeenCalled();
  });

  it("shows two buttons when 3 cards are selected", () => {
    mockReadingState.selectedCards = [
      { cardId: 0, positionIndex: 0, isReversed: false },
      { cardId: 6, positionIndex: 1, isReversed: true },
      { cardId: 17, positionIndex: 2, isReversed: false },
    ];

    renderReadingPage();

    expect(
      screen.getByRole("button", { name: /다시 선택/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /결과 보기/ }),
    ).toBeInTheDocument();
  });

  it("calls resetSelection when '다시 선택' is clicked", async () => {
    const user = userEvent.setup();
    mockReadingState.selectedCards = [
      { cardId: 0, positionIndex: 0, isReversed: false },
      { cardId: 6, positionIndex: 1, isReversed: true },
      { cardId: 17, positionIndex: 2, isReversed: false },
    ];

    renderReadingPage();
    await user.click(screen.getByRole("button", { name: /다시 선택/ }));

    expect(mockResetSelection).toHaveBeenCalled();
  });
});
