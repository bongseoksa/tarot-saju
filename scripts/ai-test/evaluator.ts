/**
 * Evaluator: assess AI response quality using shared guard + additional checks.
 */

import {
  validateResponse,
  parseResponse,
  TAROT_CARDS,
} from "@tarot-saju/shared";
import type { DrawnCard } from "@tarot-saju/shared";

// Card name aliases: model may use variations of Korean card names
const CARD_NAME_ALIASES: Record<number, string[]> = {
  0:  ["광대", "바보", "어릿광대", "풀"],
  1:  ["마법사", "마술사"],
  2:  ["여사제", "여제사", "고위 여사제"],
  3:  ["여황제", "여제"],
  4:  ["황제"],
  5:  ["교황", "대사제", "법왕"],
  6:  ["연인", "연인들", "러버스"],
  7:  ["전차", "채리엇"],
  8:  ["힘", "용기"],
  9:  ["은둔자", "현자", "헤르밋"],
  10: ["운명의 수레바퀴", "운명의 바퀴", "수레바퀴"],
  11: ["정의", "저스티스"],
  12: ["매달린 사람", "거꾸로 매달린 사람", "행드맨"],
  13: ["죽음", "데스"],
  14: ["절제", "템퍼런스"],
  15: ["악마", "데빌"],
  16: ["탑", "타워", "무너지는 탑"],
  17: ["별", "스타"],
  18: ["달", "문"],
  19: ["태양", "썬"],
  20: ["심판", "저지먼트", "부활"],
  21: ["세계", "월드"],
};

function matchesCardName(raw: string, cardId: number): boolean {
  const aliases = CARD_NAME_ALIASES[cardId];
  if (!aliases) return false;
  return aliases.some((alias) => raw.includes(alias));
}

export interface EvalResult {
  pass: boolean;
  failures: string[];
  summary: string;
  responseLength: number;
}

export function evaluate(raw: string, cards: DrawnCard[]): EvalResult {
  const failures: string[] = [];

  // 1. Shared guard validation (sections, length, forbidden words)
  const guardResult = validateResponse(raw);
  failures.push(...guardResult.failures);

  // 2. Length check (300~1500 chars) — stricter than guard's 50~1000
  if (raw.length < 300) failures.push("eval_too_short");
  if (raw.length > 1500) failures.push("eval_too_long");

  // 3. Card name match — response should mention the drawn cards (with alias support)
  for (const dc of cards) {
    if (!matchesCardName(raw, dc.cardId)) {
      const card = TAROT_CARDS.find((c) => c.id === dc.cardId);
      failures.push(`missing_card_name:${card?.nameKo ?? dc.cardId}`);
    }
  }

  // 4. Korean language check — should not have garbled characters
  const koreanRatio = (raw.match(/[\uAC00-\uD7AF]/g)?.length ?? 0) / raw.length;
  if (koreanRatio < 0.3) failures.push("low_korean_ratio");

  // 5. Parse summary
  const parsed = parseResponse(raw);

  return {
    pass: failures.length === 0,
    failures,
    summary: parsed.summary,
    responseLength: raw.length,
  };
}
