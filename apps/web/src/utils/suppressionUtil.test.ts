import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { suppressUntilMidnight, isSuppressed, clearSuppression } from "./suppressionUtil";

describe("suppressionUtil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("isSuppressed returns false when no suppression set", () => {
    expect(isSuppressed()).toBe(false);
  });

  it("suppressUntilMidnight makes isSuppressed return true", () => {
    vi.setSystemTime(new Date("2026-05-03T15:00:00"));
    suppressUntilMidnight();
    expect(isSuppressed()).toBe(true);
  });

  it("isSuppressed returns false after midnight", () => {
    vi.setSystemTime(new Date("2026-05-03T15:00:00"));
    suppressUntilMidnight();
    expect(isSuppressed()).toBe(true);

    // Advance to next day 00:01
    vi.setSystemTime(new Date("2026-05-04T00:01:00"));
    expect(isSuppressed()).toBe(false);
  });

  it("isSuppressed returns true just before midnight", () => {
    vi.setSystemTime(new Date("2026-05-03T15:00:00"));
    suppressUntilMidnight();

    vi.setSystemTime(new Date("2026-05-03T23:59:59"));
    expect(isSuppressed()).toBe(true);
  });

  it("clearSuppression resets the flag", () => {
    vi.setSystemTime(new Date("2026-05-03T15:00:00"));
    suppressUntilMidnight();
    expect(isSuppressed()).toBe(true);

    clearSuppression();
    expect(isSuppressed()).toBe(false);
  });
});
