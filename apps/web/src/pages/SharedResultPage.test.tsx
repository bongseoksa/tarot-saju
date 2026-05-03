import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import SharedResultPage from "./SharedResultPage";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderSharedResultPage(shareId = "mock-share") {
  return render(
    <MemoryRouter initialEntries={[`/shared/${shareId}`]}>
      <Routes>
        <Route path="/shared/:shareId" element={<SharedResultPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SharedResultPage", () => {
  beforeEach(() => mockNavigate.mockClear());

  it("renders logo header without back button", () => {
    renderSharedResultPage();
    expect(screen.getByText("점하나")).toBeInTheDocument();
  });

  it("renders greeting speech bubble", () => {
    renderSharedResultPage();
    expect(
      screen.getByText(/점하나가 전해준 타로 결과예요/),
    ).toBeInTheDocument();
  });

  it("renders 3 card positions", () => {
    renderSharedResultPage();
    expect(screen.getByText("과거")).toBeInTheDocument();
    expect(screen.getByText("현재")).toBeInTheDocument();
    expect(screen.getByText("미래")).toBeInTheDocument();
  });

  it("renders one-line summary card", () => {
    renderSharedResultPage();
    expect(screen.getByText("오늘의 한 줄 요약")).toBeInTheDocument();
  });

  it("renders timeline interpretation", () => {
    renderSharedResultPage();
    expect(screen.getByText(/새로운 시작/)).toBeInTheDocument();
    expect(screen.getByText(/선택의 순간/)).toBeInTheDocument();
    expect(screen.getByText(/희망의 발견/)).toBeInTheDocument();
  });

  it("renders advice section", () => {
    renderSharedResultPage();
    expect(screen.getByText("점하나의 조언")).toBeInTheDocument();
  });

  it("renders CTA button and service caption", () => {
    renderSharedResultPage();
    expect(
      screen.getByRole("button", { name: /나도 점 하나 찍어볼까/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/AI 타로 서비스/)).toBeInTheDocument();
  });
});
