import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PendingSessionModal from "./PendingSessionModal";
import type { PendingSession } from "@tarot-saju/shared";

const SESSION_1: PendingSession = {
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

const SESSION_2: PendingSession = {
  id: "s2",
  themeId: "love-crush",
  themeTitle: "짝사랑 타로",
  cards: [
    { cardId: 1, positionIndex: 0, isReversed: false },
    { cardId: 2, positionIndex: 1, isReversed: false },
    { cardId: 3, positionIndex: 2, isReversed: true },
  ],
  createdAt: "2026-05-03T14:00:00.000Z",
  adWatched: true,
};

describe("PendingSessionModal", () => {
  const onResume = vi.fn();
  const onClose = vi.fn();
  const onSuppress = vi.fn();

  it("renders single session with theme title", () => {
    render(
      <PendingSessionModal
        sessions={[SESSION_1]}
        onResume={onResume}
        onClose={onClose}
        onSuppress={onSuppress}
      />,
    );
    expect(screen.getByText("오늘의 타로")).toBeInTheDocument();
  });

  it("renders multiple sessions as list", () => {
    render(
      <PendingSessionModal
        sessions={[SESSION_1, SESSION_2]}
        onResume={onResume}
        onClose={onClose}
        onSuppress={onSuppress}
      />,
    );
    expect(screen.getByText("오늘의 타로")).toBeInTheDocument();
    expect(screen.getByText("짝사랑 타로")).toBeInTheDocument();
  });

  it("calls onResume with session id when 'resume' is clicked", () => {
    render(
      <PendingSessionModal
        sessions={[SESSION_1]}
        onResume={onResume}
        onClose={onClose}
        onSuppress={onSuppress}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /이어서 보기/ }));
    expect(onResume).toHaveBeenCalledWith("s1");
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <PendingSessionModal
        sessions={[SESSION_1]}
        onResume={onResume}
        onClose={onClose}
        onSuppress={onSuppress}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /닫기/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onSuppress when suppress checkbox is clicked", () => {
    render(
      <PendingSessionModal
        sessions={[SESSION_1]}
        onResume={onResume}
        onClose={onClose}
        onSuppress={onSuppress}
      />,
    );
    fireEvent.click(screen.getByLabelText(/더 이상 보지 않기/));
    expect(onSuppress).toHaveBeenCalled();
  });
});
