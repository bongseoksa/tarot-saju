import { describe, it, expect } from "vitest";
import {
  buildPrompt,
  SYSTEM_PROMPT,
  THEMES,
  TAROT_CARDS,
  THREE_CARD_SPREAD,
} from "@tarot-saju/shared";
import type { DrawnCard } from "@tarot-saju/shared";

const sampleCards: DrawnCard[] = [
  { cardId: 0, positionIndex: 0, isReversed: false },
  { cardId: 1, positionIndex: 1, isReversed: true },
  { cardId: 2, positionIndex: 2, isReversed: false },
];

describe("SYSTEM_PROMPT", () => {
  it("should be a non-empty string", () => {
    expect(SYSTEM_PROMPT).toBeDefined();
    expect(typeof SYSTEM_PROMPT).toBe("string");
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(100);
  });

  it("should contain key instructions in Korean", () => {
    expect(SYSTEM_PROMPT).toContain("타로 리더");
    expect(SYSTEM_PROMPT).toContain("한국어");
  });
});

describe("buildPrompt", () => {
  it("should generate a non-empty prompt for each theme", () => {
    for (const theme of THEMES) {
      const prompt = buildPrompt(
        { themeId: theme.id, cards: sampleCards },
        TAROT_CARDS,
        THREE_CARD_SPREAD,
      );
      expect(prompt.length).toBeGreaterThan(0);
    }
  });

  it("should include card names in the prompt", () => {
    const prompt = buildPrompt(
      { themeId: "daily-today", cards: sampleCards },
      TAROT_CARDS,
      THREE_CARD_SPREAD,
    );
    expect(prompt).toContain("광대");
    expect(prompt).toContain("The Fool");
    expect(prompt).toContain("마법사");
    expect(prompt).toContain("여사제");
  });

  it("should include card direction (정방향/역방향)", () => {
    const prompt = buildPrompt(
      { themeId: "daily-today", cards: sampleCards },
      TAROT_CARDS,
      THREE_CARD_SPREAD,
    );
    expect(prompt).toContain("정방향");
    expect(prompt).toContain("역방향");
  });

  it("should include card keywords based on direction", () => {
    const prompt = buildPrompt(
      { themeId: "daily-today", cards: sampleCards },
      TAROT_CARDS,
      THREE_CARD_SPREAD,
    );
    // Card 0 upright
    expect(prompt).toContain(TAROT_CARDS[0].meaningUpright);
    // Card 1 reversed
    expect(prompt).toContain(TAROT_CARDS[1].meaningReversed);
  });

  it("should include system prompt at the beginning", () => {
    const prompt = buildPrompt(
      { themeId: "daily-today", cards: sampleCards },
      TAROT_CARDS,
      THREE_CARD_SPREAD,
    );
    expect(prompt.startsWith(SYSTEM_PROMPT)).toBe(true);
  });

  it("should include position labels (과거/현재/미래)", () => {
    const prompt = buildPrompt(
      { themeId: "daily-today", cards: sampleCards },
      TAROT_CARDS,
      THREE_CARD_SPREAD,
    );
    expect(prompt).toContain("### 과거");
    expect(prompt).toContain("### 현재");
    expect(prompt).toContain("### 미래");
  });

  it("should include theme category", () => {
    const prompt = buildPrompt(
      { themeId: "love-feeling", cards: sampleCards },
      TAROT_CARDS,
      THREE_CARD_SPREAD,
    );
    expect(prompt).toContain("카테고리: 연애");
  });

  it("should include context hints when available", () => {
    const prompt = buildPrompt(
      { themeId: "love-feeling", cards: sampleCards },
      TAROT_CARDS,
      THREE_CARD_SPREAD,
    );
    const card0LoveHint = TAROT_CARDS[0].contextHints?.love;
    if (card0LoveHint) {
      expect(prompt).toContain(card0LoveHint);
    }
  });

  it("should include output format instructions", () => {
    const prompt = buildPrompt(
      { themeId: "daily-today", cards: sampleCards },
      TAROT_CARDS,
      THREE_CARD_SPREAD,
    );
    expect(prompt).toContain("## 응답 형식");
    expect(prompt).toContain("### 과거 해석");
    expect(prompt).toContain("### 현재 해석");
    expect(prompt).toContain("### 미래 해석");
    expect(prompt).toContain("### 종합 조언");
    expect(prompt).toContain("### 한줄 요약");
  });
});
