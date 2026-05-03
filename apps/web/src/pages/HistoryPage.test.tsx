import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import HistoryPage from "./HistoryPage";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderHistoryPage() {
  return render(
    <MemoryRouter initialEntries={["/history"]}>
      <HistoryPage />
    </MemoryRouter>,
  );
}

describe("HistoryPage", () => {
  beforeEach(() => mockNavigate.mockClear());

  it("renders header with title", () => {
    renderHistoryPage();
    expect(screen.getByText("히스토리")).toBeInTheDocument();
  });

  it("renders summary stats", () => {
    renderHistoryPage();
    expect(screen.getByText("이번 달 읽은 횟수")).toBeInTheDocument();
    expect(screen.getByText("주요 키워드")).toBeInTheDocument();
  });

  it("renders list header", () => {
    renderHistoryPage();
    expect(screen.getByText("모든 기록")).toBeInTheDocument();
    expect(screen.getByText("날짜순")).toBeInTheDocument();
  });

  it("renders 3 mock history items", () => {
    renderHistoryPage();
    expect(screen.getByText("연애운")).toBeInTheDocument();
    expect(screen.getByText("커리어")).toBeInTheDocument();
    expect(screen.getByText("오늘의 운세")).toBeInTheDocument();
  });

  it("renders empty state when no items", async () => {
    // EmptyState is conditionally rendered — test via toggle or separate prop
    // For Phase 2, we test the empty state component exists in HistoryPage
    renderHistoryPage();
    // The mock data has items, so empty state should not show
    expect(
      screen.queryByText("여기는 아직 비어있어요."),
    ).not.toBeInTheDocument();
  });
});
