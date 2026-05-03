import { render, screen, fireEvent } from "@testing-library/react";
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

vi.mock("../stores/usePendingStore", () => {
  const mockGetActiveSessions = vi.fn().mockReturnValue([]);
  const mockClearExpired = vi.fn();
  return {
    usePendingStore: Object.assign(
      vi.fn((selector: (s: unknown) => unknown) =>
        selector({
          getActiveSessions: mockGetActiveSessions,
          clearExpired: mockClearExpired,
        }),
      ),
      {
        getState: () => ({
          getActiveSessions: mockGetActiveSessions,
          clearExpired: mockClearExpired,
        }),
        __mockGetActiveSessions: mockGetActiveSessions,
        __mockClearExpired: mockClearExpired,
      },
    ),
  };
});

vi.mock("../utils/suppressionUtil", () => ({
  isSuppressed: vi.fn().mockReturnValue(false),
  suppressUntilMidnight: vi.fn(),
}));

import { usePendingStore } from "../stores/usePendingStore";
import { isSuppressed, suppressUntilMidnight } from "../utils/suppressionUtil";
import type { PendingSession } from "@tarot-saju/shared";

const MOCK_SESSION: PendingSession = {
  id: "s1",
  themeId: "daily-today",
  themeTitle: "오늘의 타로",
  cards: [
    { cardId: 0, positionIndex: 0, isReversed: false },
    { cardId: 6, positionIndex: 1, isReversed: true },
    { cardId: 17, positionIndex: 2, isReversed: false },
  ],
  createdAt: "2026-05-03T12:00:00.000Z",
  adWatched: true,
};

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
    vi.clearAllMocks();
    // Reset default mock returns
    const store = usePendingStore as unknown as {
      __mockGetActiveSessions: ReturnType<typeof vi.fn>;
      __mockClearExpired: ReturnType<typeof vi.fn>;
    };
    store.__mockGetActiveSessions.mockReturnValue([]);
    vi.mocked(isSuppressed).mockReturnValue(false);
  });

  it("renders hero section with CTA", () => {
    renderHomePage();
    expect(screen.getByText(/오늘의 타로 한 장/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /오늘의 타로/ }),
    ).toBeInTheDocument();
  });

  it("renders all 11 theme cards by default", () => {
    renderHomePage();
    expect(screen.getByText("나의 연애운")).toBeInTheDocument();
    expect(screen.getByText("이직 타이밍")).toBeInTheDocument();
    expect(screen.getByText("이 선택이 맞을까")).toBeInTheDocument();
  });

  it("renders category filter chips", () => {
    renderHomePage();
    expect(
      screen.getByRole("button", { name: "전체" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "연애" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "직장" }),
    ).toBeInTheDocument();
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

  // 3-7 Pending session modal tests
  it("shows pending session modal when active sessions exist", () => {
    const store = usePendingStore as unknown as {
      __mockGetActiveSessions: ReturnType<typeof vi.fn>;
    };
    store.__mockGetActiveSessions.mockReturnValue([MOCK_SESSION]);

    renderHomePage();
    expect(
      screen.getByText(/이어서 볼 수 있는 결과가 있어요/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /이어서 보기/ })).toBeInTheDocument();
  });

  it("does not show modal when no active sessions", () => {
    renderHomePage();
    expect(
      screen.queryByText(/이어서 볼 수 있는 결과가 있어요/),
    ).not.toBeInTheDocument();
  });

  it("does not show modal when suppressed", () => {
    const store = usePendingStore as unknown as {
      __mockGetActiveSessions: ReturnType<typeof vi.fn>;
    };
    store.__mockGetActiveSessions.mockReturnValue([MOCK_SESSION]);
    vi.mocked(isSuppressed).mockReturnValue(true);

    renderHomePage();
    expect(
      screen.queryByText(/이어서 볼 수 있는 결과가 있어요/),
    ).not.toBeInTheDocument();
  });

  it("closes modal when close button is clicked", () => {
    const store = usePendingStore as unknown as {
      __mockGetActiveSessions: ReturnType<typeof vi.fn>;
    };
    store.__mockGetActiveSessions.mockReturnValue([MOCK_SESSION]);

    renderHomePage();
    fireEvent.click(screen.getByRole("button", { name: /닫기/ }));
    expect(
      screen.queryByText(/이어서 볼 수 있는 결과가 있어요/),
    ).not.toBeInTheDocument();
  });

  it("calls suppressUntilMidnight when suppress checkbox is clicked", () => {
    const store = usePendingStore as unknown as {
      __mockGetActiveSessions: ReturnType<typeof vi.fn>;
    };
    store.__mockGetActiveSessions.mockReturnValue([MOCK_SESSION]);

    renderHomePage();
    fireEvent.click(screen.getByLabelText(/더 이상 보지 않기/));
    expect(suppressUntilMidnight).toHaveBeenCalled();
  });
});
