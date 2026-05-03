import { describe, it, expect } from "vitest";
import { determineOrientation } from "./cardUtils";

describe("determineOrientation", () => {
  it("should return a boolean", () => {
    const result = determineOrientation();
    expect(typeof result).toBe("boolean");
  });

  it("should produce both true and false over many calls", () => {
    const results = Array.from({ length: 100 }, () => determineOrientation());
    const trueCount = results.filter(Boolean).length;
    const falseCount = results.filter((r) => !r).length;
    // Both should occur at least once in 100 tries
    expect(trueCount).toBeGreaterThan(0);
    expect(falseCount).toBeGreaterThan(0);
  });
});
