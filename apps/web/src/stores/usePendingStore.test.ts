import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { PendingSession } from "@tarot-saju/shared";
import { usePendingStore } from "./usePendingStore";

const { getState } = usePendingStore;

function makeSession(
  id: string,
  createdAt?: string,
): PendingSession {
  return {
    id,
    themeId: "daily-today",
    themeTitle: "오늘의 타로",
    cards: [
      { cardId: 0, positionIndex: 0, isReversed: false },
      { cardId: 1, positionIndex: 1, isReversed: true },
      { cardId: 2, positionIndex: 2, isReversed: false },
    ],
    createdAt: createdAt ?? new Date().toISOString(),
    adWatched: false,
  };
}

describe("usePendingStore", () => {
  beforeEach(() => {
    localStorage.clear();
    getState().clearAll();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("addSession", () => {
    it("should add a session", () => {
      getState().addSession(makeSession("s1"));
      expect(getState().sessions).toHaveLength(1);
      expect(getState().sessions[0].id).toBe("s1");
    });

    it("should enforce max 3 sessions with FIFO", () => {
      getState().addSession(makeSession("s1"));
      getState().addSession(makeSession("s2"));
      getState().addSession(makeSession("s3"));
      getState().addSession(makeSession("s4")); // oldest removed

      expect(getState().sessions).toHaveLength(3);
      expect(getState().sessions.map((s) => s.id)).not.toContain("s1");
      expect(getState().sessions.map((s) => s.id)).toContain("s4");
    });
  });

  describe("removeSession", () => {
    it("should remove a session by id", () => {
      getState().addSession(makeSession("s1"));
      getState().addSession(makeSession("s2"));
      getState().removeSession("s1");

      expect(getState().sessions).toHaveLength(1);
      expect(getState().sessions[0].id).toBe("s2");
    });

    it("should do nothing for non-existent id", () => {
      getState().addSession(makeSession("s1"));
      getState().removeSession("missing");
      expect(getState().sessions).toHaveLength(1);
    });
  });

  describe("getActiveSessions", () => {
    it("should return sessions created today", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-03T15:00:00"));

      getState().addSession(makeSession("today", "2026-05-03T10:00:00.000Z"));
      expect(getState().getActiveSessions()).toHaveLength(1);
    });

    it("should exclude sessions created before today (expired)", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-03T15:00:00"));

      getState().addSession(
        makeSession("yesterday", "2026-05-02T10:00:00.000Z"),
      );
      expect(getState().getActiveSessions()).toHaveLength(0);
    });

    it("should handle mix of active and expired sessions", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-03T15:00:00"));

      getState().addSession(makeSession("old", "2026-05-01T12:00:00.000Z"));
      getState().addSession(makeSession("today", "2026-05-03T08:00:00.000Z"));

      const active = getState().getActiveSessions();
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe("today");
    });
  });

  describe("clearExpired", () => {
    it("should remove expired sessions from store", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-03T15:00:00"));

      getState().addSession(makeSession("old", "2026-05-01T12:00:00.000Z"));
      getState().addSession(makeSession("today", "2026-05-03T08:00:00.000Z"));

      getState().clearExpired();
      expect(getState().sessions).toHaveLength(1);
      expect(getState().sessions[0].id).toBe("today");
    });
  });

  describe("clearAll", () => {
    it("should remove all sessions", () => {
      getState().addSession(makeSession("s1"));
      getState().addSession(makeSession("s2"));
      getState().clearAll();
      expect(getState().sessions).toEqual([]);
    });
  });

  describe("persistence", () => {
    it("should persist via storageUtil (encrypted)", () => {
      getState().addSession(makeSession("persist-s1"));

      const raw = localStorage.getItem("pending_sessions");
      expect(raw).not.toBeNull();
      expect(raw).not.toContain("persist-s1");
    });
  });
});
