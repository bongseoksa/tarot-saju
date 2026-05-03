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
  beforeEach(() => mockNavigate.mockClear());

  it("renders the guidance text", () => {
    renderReadingPage();
    expect(screen.getByText("세 장의 카드를 신중하게 골라주세요")).toBeInTheDocument();
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

  it("selects a card on click and dims it in the grid", async () => {
    const user = userEvent.setup();
    renderReadingPage();

    const cards = screen.getAllByRole("button", { name: /카드/ });
    await user.click(cards[0]);

    expect(screen.getByText("점 보기 (1/3)")).toBeInTheDocument();
  });

  it("shows two buttons when 3 cards are selected", async () => {
    const user = userEvent.setup();
    renderReadingPage();

    const cards = screen.getAllByRole("button", { name: /카드/ });
    await user.click(cards[0]);
    await user.click(cards[1]);
    await user.click(cards[2]);

    expect(screen.getByRole("button", { name: /다시 선택/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /결과 보기/ })).toBeInTheDocument();
  });

  it("resets selection when '다시 선택' is clicked", async () => {
    const user = userEvent.setup();
    renderReadingPage();

    const cards = screen.getAllByRole("button", { name: /카드/ });
    await user.click(cards[0]);
    await user.click(cards[1]);
    await user.click(cards[2]);

    await user.click(screen.getByRole("button", { name: /다시 선택/ }));

    expect(screen.getByText("점 보기 (0/3)")).toBeInTheDocument();
  });
});
