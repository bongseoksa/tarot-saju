import { describe, it, expect } from "vitest";
import {
  SPRING_CARD,
  SPRING_BOUNCE,
  SPRING_GENTLE,
  DURATION_FAST,
  DURATION_NORMAL,
  DURATION_SLOW,
  FADE_IN,
  getTransition,
} from "./motionConfig";

describe("motionConfig", () => {
  it("exports spring presets with type spring", () => {
    expect(SPRING_CARD.type).toBe("spring");
    expect(SPRING_BOUNCE.type).toBe("spring");
    expect(SPRING_GENTLE.type).toBe("spring");
  });

  it("exports spring presets with stiffness and damping", () => {
    const card = SPRING_CARD as { stiffness: number; damping: number };
    const bounce = SPRING_BOUNCE as { stiffness: number; damping: number };
    const gentle = SPRING_GENTLE as { damping: number };
    expect(card.stiffness).toBeGreaterThan(0);
    expect(card.damping).toBeGreaterThan(0);
    expect(bounce.stiffness).toBeGreaterThan(card.stiffness);
    expect(gentle.damping).toBeGreaterThan(card.damping);
  });

  it("exports duration presets in ascending order", () => {
    expect(DURATION_FAST).toBeLessThan(DURATION_NORMAL);
    expect(DURATION_NORMAL).toBeLessThan(DURATION_SLOW);
  });

  it("exports FADE_IN with initial and animate", () => {
    expect(FADE_IN.initial).toEqual({ opacity: 0 });
    expect(FADE_IN.animate).toEqual({ opacity: 1 });
  });

  it("getTransition returns instant transition when reduced is true", () => {
    const result = getTransition(SPRING_CARD, true);
    expect(result).toEqual({ duration: 0 });
  });

  it("getTransition returns original transition when reduced is false", () => {
    const result = getTransition(SPRING_CARD, false);
    expect(result).toBe(SPRING_CARD);
  });
});
