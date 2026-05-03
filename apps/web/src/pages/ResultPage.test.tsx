import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import ResultPage from "./ResultPage";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderResultPage(resultId = "mock-id") {
  return render(
    <MemoryRouter initialEntries={[`/result/${resultId}`]}>
      <Routes>
        <Route path="/result/:resultId" element={<ResultPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ResultPage", () => {
  beforeEach(() => mockNavigate.mockClear());

  it("renders card summary with 3 position labels", () => {
    renderResultPage();
    expect(screen.getByText("과거")).toBeInTheDocument();
    expect(screen.getByText("현재")).toBeInTheDocument();
    expect(screen.getByText("미래")).toBeInTheDocument();
  });

  it("renders card names in the summary", () => {
    renderResultPage();
    expect(screen.getByText("0. 광대")).toBeInTheDocument();
    expect(screen.getByText("6. 연인")).toBeInTheDocument();
    expect(screen.getByText("17. 별 (역)")).toBeInTheDocument();
  });

  it("renders mascot speech bubble", () => {
    renderResultPage();
    expect(
      screen.getByText("점하나가 당신의 카드를 읽고 있어요..."),
    ).toBeInTheDocument();
  });

  it("renders 3 interpretation cards", () => {
    renderResultPage();
    expect(screen.getByText("과거의 흐름")).toBeInTheDocument();
    expect(screen.getByText("현재의 상황")).toBeInTheDocument();
    expect(screen.getByText("미래의 가능성")).toBeInTheDocument();
  });

  it("renders advice card with summary", () => {
    renderResultPage();
    expect(screen.getByText("점하나의 한마디")).toBeInTheDocument();
  });

  it("renders ad banner placeholder", () => {
    renderResultPage();
    expect(screen.getByText("Advertisement")).toBeInTheDocument();
  });

  it("renders footer with share and home buttons", () => {
    renderResultPage();
    expect(
      screen.getByRole("button", { name: /공유하기/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /점 하나 더 찍어볼까/ }),
    ).toBeInTheDocument();
  });
});
