import type { Spread } from "@tarot-saju/shared";

export const THREE_CARD_SPREAD: Spread = {
  id: "three-card",
  name: "Three Card",
  nameKo: "쓰리카드 스프레드",
  cardCount: 3,
  positions: [
    { index: 0, label: "과거", description: "과거의 흐름을 나타냅니다" },
    { index: 1, label: "현재", description: "현재 상황을 나타냅니다" },
    { index: 2, label: "미래", description: "미래의 가능성을 나타냅니다" },
  ],
};
