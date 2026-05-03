import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import HomePage from "./HomePage";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual =
    await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderHomePage(initialRoute = "/") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <HomePage />
    </MemoryRouter>,
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders hero section with CTA", () => {
    renderHomePage();
    expect(screen.getByText(/오늘의 타로 한 장/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /오늘의 타로/ })).toBeInTheDocument();
  });

  it("renders all 11 theme cards by default", () => {
    renderHomePage();
    expect(screen.getByText("나의 연애운")).toBeInTheDocument();
    expect(screen.getByText("이직 타이밍")).toBeInTheDocument();
    expect(screen.getByText("이 선택이 맞을까")).toBeInTheDocument();
  });

  it("renders category filter chips", () => {
    renderHomePage();
    expect(screen.getByRole("button", { name: "전체" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "연애" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "직장" })).toBeInTheDocument();
  });

  it("filters themes when category chip is clicked", async () => {
    const user = userEvent.setup();
    renderHomePage();

    await user.click(screen.getByRole("button", { name: "연애" }));

    expect(screen.getByText("나의 연애운")).toBeInTheDocument();
    expect(screen.getByText("그 사람의 마음")).toBeInTheDocument();
    expect(screen.getByText("새로운 인연")).toBeInTheDocument();
    expect(screen.queryByText("이직 타이밍")).not.toBeInTheDocument();
  });

  it("shows all themes when '전체' chip is clicked after filtering", async () => {
    const user = userEvent.setup();
    renderHomePage();

    await user.click(screen.getByRole("button", { name: "연애" }));
    await user.click(screen.getByRole("button", { name: "전체" }));

    expect(screen.getByText("이직 타이밍")).toBeInTheDocument();
    expect(screen.getByText("나의 연애운")).toBeInTheDocument();
  });

  it("renders footer with legal links", () => {
    renderHomePage();
    expect(screen.getByText("개인정보처리방침")).toBeInTheDocument();
    expect(screen.getByText("이용약관")).toBeInTheDocument();
  });
});
