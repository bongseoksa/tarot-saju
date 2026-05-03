import { describe, it, expect, vi, beforeEach } from "vitest";
import { triggerHaptic } from "./haptic";

describe("haptic", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls navigator.vibrate when available", () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(navigator, "vibrate", {
      value: vibrateMock,
      writable: true,
      configurable: true,
    });

    triggerHaptic();
    expect(vibrateMock).toHaveBeenCalledWith(10);
  });

  it("does not throw when navigator.vibrate is unavailable", () => {
    Object.defineProperty(navigator, "vibrate", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => triggerHaptic()).not.toThrow();
  });
});
