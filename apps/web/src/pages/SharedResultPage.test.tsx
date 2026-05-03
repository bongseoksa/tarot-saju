import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import SharedResultPage from "./SharedResultPage";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../utils/shareService", () => ({
  getSharedReading: vi.fn(),
}));

import { getSharedReading } from "../utils/shareService";
import type { SharedReading } from "../utils/shareService";

const MOCK_SHARED: SharedReading = {
  id: "share-uuid-123",
  themeId: "daily-today",
  themeTitle: "오늘의 타로",
  cards: [
    { cardId: 0, positionIndex: 0, isReversed: false },
    { cardId: 6, positionIndex: 1, isReversed: true },
    { cardId: 17, positionIndex: 2, isReversed: false },
  ],
  interpretation:
    "## 과거 — 새로운 시작\n과거 해석\n\n## 현재 — 선택의 순간\n현재 해석\n\n## 미래 — 희망의 발견\n미래 해석\n\n## 종합 조언\n조언 내용",
  summary: "밝은 미래가 기다리고 있어요.",
  createdAt: "2026-05-03T12:00:00.000Z",
};

function renderSharedResultPage(shareId = "share-uuid-123") {
  return render(
    <MemoryRouter initialEntries={[`/shared/${shareId}`]}>
      <Routes>
        <Route path="/shared/:shareId" element={<SharedResultPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SharedResultPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    vi.mocked(getSharedReading).mockImplementation(
      () => new Promise(() => {}), // never resolves
    );
    renderSharedResultPage();
    expect(screen.getByText(/불러오는 중/)).toBeInTheDocument();
  });

  it("renders shared reading data after loading", async () => {
    vi.mocked(getSharedReading).mockResolvedValue(MOCK_SHARED);
    renderSharedResultPage();

    await waitFor(() => {
      expect(screen.getByText("점하나")).toBeInTheDocument();
    });

    expect(screen.getByText("과거")).toBeInTheDocument();
    expect(screen.getByText("현재")).toBeInTheDocument();
    expect(screen.getByText("미래")).toBeInTheDocument();
    expect(
      screen.getByText("밝은 미래가 기다리고 있어요."),
    ).toBeInTheDocument();
  });

  it("renders CTA button", async () => {
    vi.mocked(getSharedReading).mockResolvedValue(MOCK_SHARED);
    renderSharedResultPage();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /나도 점 하나 찍어볼까/ }),
      ).toBeInTheDocument();
    });
  });

  it("shows not-found message when reading is null", async () => {
    vi.mocked(getSharedReading).mockResolvedValue(null);
    renderSharedResultPage("nonexistent");

    await waitFor(() => {
      expect(
        screen.getByText(/만료되었거나 존재하지 않는/),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /홈으로 돌아가기/ }),
    ).toBeInTheDocument();
  });

  it("shows not-found message on error", async () => {
    vi.mocked(getSharedReading).mockRejectedValue(new Error("network error"));
    renderSharedResultPage();

    await waitFor(() => {
      expect(
        screen.getByText(/만료되었거나 존재하지 않는/),
      ).toBeInTheDocument();
    });
  });

  it("renders greeting speech bubble with data", async () => {
    vi.mocked(getSharedReading).mockResolvedValue(MOCK_SHARED);
    renderSharedResultPage();

    await waitFor(() => {
      expect(
        screen.getByText(/점하나가 전해준 타로 결과예요/),
      ).toBeInTheDocument();
    });
  });

  it("calls getSharedReading with shareId from URL", async () => {
    vi.mocked(getSharedReading).mockResolvedValue(MOCK_SHARED);
    renderSharedResultPage("my-share-id");

    await waitFor(() => {
      expect(getSharedReading).toHaveBeenCalledWith("my-share-id");
    });
  });
});
