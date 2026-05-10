import type { ReadingRequest, TarotCard, Spread } from "@shared/types";
import { THEMES } from "@shared/data/themes";
import { SYSTEM_PROMPT } from "@shared/prompts/system-prompt";
import { THREE_CARD_FORMAT } from "@shared/prompts/v1-three-card";

const CATEGORY_LABELS: Record<string, string> = {
  daily: "일상",
  love: "연애",
  career: "직장",
  wealth: "재물",
  study: "학업",
  general: "일반",
};

export function buildPrompt(
  request: ReadingRequest,
  cards: TarotCard[],
  spread: Spread,
): string {
  const theme = THEMES.find((t) => t.id === request.themeId);
  if (!theme) {
    throw new Error(`Unknown themeId: ${request.themeId}`);
  }

  const cardBlocks = request.cards
    .map((drawn) => {
      const card = cards.find((c) => c.id === drawn.cardId);
      if (!card) return "";
      const position = spread.positions[drawn.positionIndex];
      const meaning = drawn.isReversed
        ? card.meaningReversed
        : card.meaningUpright;
      const direction = drawn.isReversed ? "역방향" : "정방향";
      const contextHint =
        card.contextHints?.[theme.category as keyof typeof card.contextHints] ??
        "";

      return `### ${position.label}
- 카드: ${card.nameKo} (${card.name})
- 방향: ${direction}
- 키워드: ${meaning}
- 설명: ${card.description}${contextHint ? `\n- 맥락 힌트: ${contextHint}` : ""}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const category = CATEGORY_LABELS[theme.category] ?? theme.category;
  const question = theme.description;

  return `${SYSTEM_PROMPT}\n\n## 뽑힌 카드\n\n${cardBlocks}\n\n## 질문\n- 카테고리: ${category}\n- 질문: ${question}\n\n${THREE_CARD_FORMAT}`;
}
