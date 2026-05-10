/**
 * Shared module for Edge Functions.
 *
 * IMPORTANT: This is derived from packages/shared/src/.
 * Run `pnpm sync:edge` to update after changing the source.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface TarotCard {
  id: number;
  name: string;
  nameKo: string;
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  number: number;
  imageUrl: string;
  meaningUpright: string;
  meaningReversed: string;
  description: string;
  astrology?: string;
  symbols?: string[];
  contextHints?: {
    daily?: string;
    love?: string;
    career?: string;
    wealth?: string;
    study?: string;
    general?: string;
  };
}

export interface Spread {
  id: string;
  name: string;
  nameKo: string;
  cardCount: number;
  positions: SpreadPosition[];
}

export interface SpreadPosition {
  index: number;
  label: string;
  description: string;
}

export interface TarotTheme {
  id: string;
  category: "daily" | "love" | "career" | "wealth" | "study" | "general";
  title: string;
  description: string;
  tags: string[];
  spreadType: "three-card";
  positions: string[];
}

export interface DrawnCard {
  cardId: number;
  positionIndex: number;
  isReversed: boolean;
}

export interface ReadingRequest {
  themeId: string;
  cards: DrawnCard[];
}

export type SSEEventType = "chunk" | "done" | "error";

export interface SSEEvent {
  type: SSEEventType;
  data: string;
}

// ─── Data ────────────────────────────────────────────────────────────

import cardsJson from "./tarot-cards.json" with { type: "json" };
export const TAROT_CARDS: TarotCard[] = cardsJson as TarotCard[];

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

export const THEMES: TarotTheme[] = [
  { id: "daily-today", category: "daily", title: "오늘의 타로", description: "오늘 하루는 어떨까? 카드 한 장에 담긴 오늘의 메시지.", tags: ["#오늘", "#하루운세"], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "daily-week", category: "daily", title: "이번 주 타로", description: "이번 주 흐름을 미리 엿보세요.", tags: ["#이번주", "#주간운세"], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "love-feeling", category: "love", title: "나의 연애운", description: "그 사람도 나를 생각하고 있을까? 상대방의 마음을 들여다보세요.", tags: ["#연애", "#애정운"], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "love-heart", category: "love", title: "그 사람의 마음", description: "궁금한 그 사람의 속마음을 타로에게 물어보세요.", tags: ["#짝사랑", "#속마음"], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "love-new", category: "love", title: "새로운 인연", description: "새로운 만남이 다가오고 있을까요?", tags: ["#인연", "#만남"], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "career-outlook", category: "career", title: "직장에서의 전망", description: "지금 직장에서의 흐름과 앞으로의 방향을 살펴보세요.", tags: ["#직장", "#커리어"], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "career-change", category: "career", title: "이직 타이밍", description: "지금이 타이밍일까 고민된다면 타로에게 조언을 구해보세요.", tags: ["#이직", "#전환"], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "wealth-fortune", category: "wealth", title: "나의 재물운", description: "풍요로운 한 달을 위해 조심해야 할 것과 얻게 될 기회.", tags: ["#재물", "#금전운"], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "study-exam", category: "study", title: "시험/학업 결과", description: "시험 결과가 걱정된다면 카드의 메시지를 들어보세요.", tags: ["#시험", "#합격"], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "general-message", category: "general", title: "지금 필요한 메시지", description: "지금 이 순간, 당신에게 필요한 한마디.", tags: ["#조언", "#메시지"], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "general-choice", category: "general", title: "이 선택이 맞을까", description: "갈림길에 서 있다면 타로의 조언을 들어보세요.", tags: ["#선택", "#결정"], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
];

// ─── Prompts ─────────────────────────────────────────────────────────

export const SYSTEM_PROMPT = `당신은 사용자와 1:1로 대화하는 타로 리더입니다.
카드를 설명하지 말고, 사용자의 마음과 상황에 대해 직접 이야기하세요.
"이 카드는..."이 아니라 "당신은...", "지금..."으로 시작하세요.

기본 규칙:
- 한국어로 답변합니다
- 반드시 존댓말(~합니다, ~예요, ~거예요, ~이에요)만 사용합니다. "너", "~잖아", "~거야" 같은 반말은 절대 사용하지 마세요.
- 카드 이름이나 점술 용어를 언급하지 마세요. 카드는 이미 화면에 보입니다.
- "..."(말줄임표)를 사용하지 마세요. 문장을 끝까지 완성하세요.
- 응답 형식에 명시된 모든 섹션을 빠짐없이 포함해야 합니다. 특히 "### 한줄 요약"은 반드시 마지막에 포함하세요.

말투:
- 친한 언니/오빠가 진지하게 조언하는 톤. 따뜻하지만 구체적이어야 합니다.
- 나쁜 예: "어려운 일들이 나타날 가능성이 있고..."
- 좋은 예: "요즘 마음 한쪽이 무거웠을 거예요. 해야 할 것과 하고 싶은 것 사이에서 고민이 있었죠."

핵심 원칙:
- 사용자의 감정을 먼저 짚어주세요. "요즘 이런 기분이셨죠?"라는 느낌으로.
- 구체적 사건을 단정하지 말되, 감정과 상태는 확신 있게 말하세요.
- "~일 수도 있어요"보다 "~했을 거예요"가 낫습니다. 단정과 확신이 몰입을 만듭니다.
- 역방향 카드도 두렵게 말하지 마세요. "잠깐 멈춰서 돌아볼 타이밍"처럼 전환점으로 해석하세요.
- 각 섹션 마지막에는 사용자가 공감할 수 있는 한마디로 마무리하세요.`;

export const THREE_CARD_FORMAT = `## 응답 형식
아래 5개 섹션을 정확히 이 제목 그대로 사용하여 답변하세요. 제목을 변형하거나 생략하지 마세요.

### 과거 해석
(최근까지 사용자가 어떤 마음이었고 어떤 흐름 속에 있었는지. "당신은~", "최근~" 으로 시작. 2~3문장)

### 현재 해석
(지금 사용자가 느끼고 있을 감정, 처해 있는 상황. "지금~", "요즘~"으로 시작. 2~3문장)

### 미래 해석
(앞으로 사용자에게 열리는 가능성과 조언. "곧~", "앞으로~"로 시작. 2~3문장)

### 종합 조언
(과거→현재→미래 흐름을 사용자 입장에서 하나로 연결한 조언. 2~3문장)

### 한줄 요약
(사용자에게 건네는 한마디, 20자 이내. 예: "지금의 불안은 성장통이에요")

주의사항:
- 반드시 "### 과거 해석", "### 현재 해석", "### 미래 해석", "### 종합 조언", "### 한줄 요약" 이 5개 제목을 정확히 사용하세요.
- "이 카드는", "이 카드가" 같은 카드 설명은 하지 마세요. 사용자에게 직접 말하세요.
- "..."(말줄임표)를 절대 사용하지 마세요.
- 전체 응답 길이는 300~1200자로 유지하세요.`;

// ─── Functions ───────────────────────────────────────────────────────

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
  if (!theme) throw new Error(`Unknown themeId: ${request.themeId}`);

  const cardBlocks = request.cards
    .map((drawn) => {
      const card = cards.find((c) => c.id === drawn.cardId);
      if (!card) return "";
      const position = spread.positions[drawn.positionIndex];
      const meaning = drawn.isReversed ? card.meaningReversed : card.meaningUpright;
      const direction = drawn.isReversed ? "역방향" : "정방향";
      const contextHint =
        card.contextHints?.[theme.category as keyof typeof card.contextHints] ?? "";

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

export interface ParsedResponse {
  interpretation: string;
  summary: string;
}

export function parseResponse(raw: string): ParsedResponse {
  const summaryMatch = raw.match(/###\s*한줄 요약\s*\n(.+)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  const interpretation = raw.replace(/###\s*한줄 요약\s*\n.+/, "").trim();
  return { interpretation, summary };
}

export interface GuardResult {
  pass: boolean;
  failures: string[];
}

const REQUIRED_SECTIONS = ["과거 해석", "현재 해석", "미래 해석", "종합 조언", "한줄 요약"];
const FORBIDDEN_WORDS = ["죽음을 맞이", "파멸", "절망적", "최악의"];

export function validateResponse(raw: string): GuardResult {
  const failures: string[] = [];
  for (const section of REQUIRED_SECTIONS) {
    if (!raw.includes(section)) failures.push(`missing_section:${section}`);
  }
  if (raw.length < 50) failures.push("too_short");
  if (raw.length > 1500) failures.push("too_long");
  for (const word of FORBIDDEN_WORDS) {
    if (raw.includes(word)) failures.push(`forbidden_word:${word}`);
  }
  return { pass: failures.length === 0, failures };
}
