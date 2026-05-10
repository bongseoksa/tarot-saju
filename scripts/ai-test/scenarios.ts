/**
 * Scenario generator for AI test harness.
 * - quick: 25 scenarios (6 categories x 3 direction patterns + 7 edge cases)
 * - full: 813 scenarios (44 per category x 6 + 7 edge cases x 3 repeats)
 */

import type { DrawnCard } from "@tarot-saju/shared";

export interface Scenario {
  name: string;
  themeId: string;
  cards: DrawnCard[];
  tags: string[];
}

const CATEGORIES = ["daily", "love", "career", "wealth", "study", "general"] as const;

const THEME_BY_CATEGORY: Record<string, string> = {
  daily: "daily-today",
  love: "love-feeling",
  career: "career-outlook",
  wealth: "wealth-fortune",
  study: "study-exam",
  general: "general-message",
};

function makeCards(
  ids: [number, number, number],
  reversed: [boolean, boolean, boolean],
): DrawnCard[] {
  return ids.map((cardId, i) => ({
    cardId,
    positionIndex: i,
    isReversed: reversed[i],
  }));
}

function generateQuickScenarios(): Scenario[] {
  const scenarios: Scenario[] = [];

  // 6 categories x 3 direction patterns = 18
  for (const cat of CATEGORIES) {
    const themeId = THEME_BY_CATEGORY[cat];

    // All upright
    scenarios.push({
      name: `${cat}-all-upright`,
      themeId,
      cards: makeCards([0, 1, 2], [false, false, false]),
      tags: ["quick", cat, "all-upright"],
    });

    // All reversed
    scenarios.push({
      name: `${cat}-all-reversed`,
      themeId,
      cards: makeCards([3, 4, 5], [true, true, true]),
      tags: ["quick", cat, "all-reversed"],
    });

    // Mixed
    scenarios.push({
      name: `${cat}-mixed`,
      themeId,
      cards: makeCards([6, 7, 8], [false, true, false]),
      tags: ["quick", cat, "mixed"],
    });
  }

  // 7 edge cases
  scenarios.push(...generateEdgeCases());

  return scenarios;
}

function generateEdgeCases(): Scenario[] {
  return [
    {
      name: "edge-negative-trio-love",
      themeId: "love-feeling",
      cards: makeCards([13, 16, 15], [false, false, false]), // Death, Tower, Devil
      tags: ["edge", "negative-trio"],
    },
    {
      name: "edge-positive-trio-reversed",
      themeId: "daily-today",
      cards: makeCards([19, 17, 21], [true, true, true]), // Sun, Star, World reversed
      tags: ["edge", "positive-reversed"],
    },
    {
      name: "edge-similar-cards-love",
      themeId: "love-feeling",
      cards: makeCards([6, 2, 3], [false, false, false]), // Lovers, High Priestess, Empress
      tags: ["edge", "similar"],
    },
    {
      name: "edge-conflicting-cards",
      themeId: "general-choice",
      cards: makeCards([11, 12, 0], [false, false, false]), // Justice, Hanged Man, Fool
      tags: ["edge", "conflicting"],
    },
    {
      name: "edge-same-card-daily",
      themeId: "daily-today",
      cards: makeCards([0, 0, 0], [false, false, false]), // Fool x3, daily
      tags: ["edge", "same-card", "daily"],
    },
    {
      name: "edge-same-card-career",
      themeId: "career-outlook",
      cards: makeCards([0, 0, 0], [false, false, false]), // Fool x3, career
      tags: ["edge", "same-card", "career"],
    },
    {
      name: "edge-same-card-love",
      themeId: "love-feeling",
      cards: makeCards([0, 0, 0], [false, false, false]), // Fool x3, love
      tags: ["edge", "same-card", "love"],
    },
  ];
}

function generateFullScenarios(): Scenario[] {
  const base: Scenario[] = [];

  // 44 scenarios per category x 6 categories = 264
  for (const cat of CATEGORIES) {
    const themeId = THEME_BY_CATEGORY[cat];

    // First 22: card i upright, (i+1)%22 reversed, (i+3)%22 upright
    for (let i = 0; i < 22; i++) {
      base.push({
        name: `${cat}-set1-${i}`,
        themeId,
        cards: makeCards(
          [i, (i + 1) % 22, (i + 3) % 22],
          [false, true, false],
        ),
        tags: ["full", cat, "set1"],
      });
    }

    // Second 22: card i reversed, (i+2)%22 upright, (i+4)%22 reversed
    for (let i = 0; i < 22; i++) {
      base.push({
        name: `${cat}-set2-${i}`,
        themeId,
        cards: makeCards(
          [i, (i + 2) % 22, (i + 4) % 22],
          [true, false, true],
        ),
        tags: ["full", cat, "set2"],
      });
    }
  }

  // Add 7 edge cases
  base.push(...generateEdgeCases());

  // Repeat all (264 + 7) x 3 = 813
  const scenarios: Scenario[] = [];
  for (let r = 0; r < 3; r++) {
    for (const s of base) {
      scenarios.push({
        ...s,
        name: `${s.name}-r${r}`,
        tags: [...s.tags, `repeat-${r}`],
      });
    }
  }

  return scenarios;
}

export function generateScenarios(mode: "quick" | "full"): Scenario[] {
  return mode === "quick" ? generateQuickScenarios() : generateFullScenarios();
}
