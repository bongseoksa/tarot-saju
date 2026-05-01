import type { TarotTheme } from "@tarot-saju/shared";

export const THEMES: TarotTheme[] = [
  {
    id: "daily-today",
    category: "daily",
    title: "오늘의 타로",
    description: "오늘 하루는 어떨까? 카드 한 장에 담긴 오늘의 메시지.",
    tags: ["#오늘", "#하루운세"],
    spreadType: "three-card",
    positions: ["과거", "현재", "미래"],
  },
  {
    id: "daily-week",
    category: "daily",
    title: "이번 주 타로",
    description: "이번 주 흐름을 미리 엿보세요.",
    tags: ["#이번주", "#주간운세"],
    spreadType: "three-card",
    positions: ["과거", "현재", "미래"],
  },
  {
    id: "love-feeling",
    category: "love",
    title: "나의 연애운",
    description: "그 사람도 나를 생각하고 있을까? 상대방의 마음을 들여다보세요.",
    tags: ["#연애", "#애정운"],
    spreadType: "three-card",
    positions: ["과거", "현재", "미래"],
  },
  {
    id: "love-heart",
    category: "love",
    title: "그 사람의 마음",
    description: "궁금한 그 사람의 속마음을 타로에게 물어보세요.",
    tags: ["#짝사랑", "#속마음"],
    spreadType: "three-card",
    positions: ["과거", "현재", "미래"],
  },
  {
    id: "love-new",
    category: "love",
    title: "새로운 인연",
    description: "새로운 만남이 다가오고 있을까요?",
    tags: ["#인연", "#만남"],
    spreadType: "three-card",
    positions: ["과거", "현재", "미래"],
  },
  {
    id: "career-outlook",
    category: "career",
    title: "직장에서의 전망",
    description: "지금 직장에서의 흐름과 앞으로의 방향을 살펴보세요.",
    tags: ["#직장", "#커리어"],
    spreadType: "three-card",
    positions: ["과거", "현재", "미래"],
  },
  {
    id: "career-change",
    category: "career",
    title: "이직 타이밍",
    description: "지금이 타이밍일까 고민된다면 타로에게 조언을 구해보세요.",
    tags: ["#이직", "#전환"],
    spreadType: "three-card",
    positions: ["과거", "현재", "미래"],
  },
  {
    id: "wealth-fortune",
    category: "wealth",
    title: "나의 재물운",
    description: "풍요로운 한 달을 위해 조심해야 할 것과 얻게 될 기회.",
    tags: ["#재물", "#금전운"],
    spreadType: "three-card",
    positions: ["과거", "현재", "미래"],
  },
  {
    id: "study-exam",
    category: "study",
    title: "시험/학업 결과",
    description: "시험 결과가 걱정된다면 카드의 메시지를 들어보세요.",
    tags: ["#시험", "#합격"],
    spreadType: "three-card",
    positions: ["과거", "현재", "미래"],
  },
  {
    id: "general-message",
    category: "general",
    title: "지금 필요한 메시지",
    description: "지금 이 순간, 당신에게 필요한 한마디.",
    tags: ["#조언", "#메시지"],
    spreadType: "three-card",
    positions: ["과거", "현재", "미래"],
  },
  {
    id: "general-choice",
    category: "general",
    title: "이 선택이 맞을까",
    description: "갈림길에 서 있다면 타로의 조언을 들어보세요.",
    tags: ["#선택", "#결정"],
    spreadType: "three-card",
    positions: ["과거", "현재", "미래"],
  },
];

export type CategoryId = TarotTheme["category"];

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  icon: string;
  tagBg: string;
  tagText: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "daily", label: "일상", icon: "auto_awesome", tagBg: "#F3E8FF", tagText: "#7C3AED" },
  { id: "love", label: "연애", icon: "favorite", tagBg: "#FCE7F3", tagText: "#9D174D" },
  { id: "career", label: "직장", icon: "work", tagBg: "#E0F2FE", tagText: "#075985" },
  { id: "wealth", label: "재물", icon: "payments", tagBg: "#FEF3C7", tagText: "#92400E" },
  { id: "study", label: "학업", icon: "school", tagBg: "#D1FAE5", tagText: "#065F46" },
  { id: "general", label: "기타", icon: "chat_bubble", tagBg: "#F3F4F6", tagText: "#374151" },
];

export function getCategoryMeta(categoryId: CategoryId): CategoryMeta {
  return CATEGORIES.find((c) => c.id === categoryId)!;
}
