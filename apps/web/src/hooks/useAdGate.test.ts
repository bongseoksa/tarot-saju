import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAdGate } from "./useAdGate";

describe("useAdGate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return a showAd function", () => {
    const { result } = renderHook(() => useAdGate());
    expect(typeof result.current.showAd).toBe("function");
  });

  it("showAd should resolve to false (MVP: no ad SDK)", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAdGate());

    let resolved = false;
    let adResult: boolean | undefined;

    act(() => {
      result.current.showAd().then((r) => {
        adResult = r;
        resolved = true;
      });
    });

    // Advance past the timeout
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(resolved).toBe(true);
    expect(adResult).toBe(false);
  });

  it("showAd should not throw", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAdGate());

    await act(async () => {
      const promise = result.current.showAd();
      vi.advanceTimersByTime(5000);
      await expect(promise).resolves.not.toThrow();
    });
  });
});
