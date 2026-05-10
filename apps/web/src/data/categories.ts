import type { TarotTheme } from "@tarot-saju/shared";

export type CategoryId = TarotTheme["category"];

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  icon: string;
  tagBg: string;
  tagText: string;
  barColor: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "daily", label: "일상", icon: "auto_awesome", tagBg: "#F3E8FF", tagText: "#7C3AED", barColor: "#6B38D4" },
  { id: "love", label: "연애", icon: "favorite", tagBg: "#FCE7F3", tagText: "#9D174D", barColor: "#F8C8D8" },
  { id: "career", label: "직장", icon: "work", tagBg: "#E0F2FE", tagText: "#075985", barColor: "#2B6CB0" },
  { id: "wealth", label: "재물", icon: "payments", tagBg: "#FEF3C7", tagText: "#92400E", barColor: "#D4920B" },
  { id: "study", label: "학업", icon: "school", tagBg: "#D1FAE5", tagText: "#065F46", barColor: "#2D8A4E" },
  { id: "general", label: "기타", icon: "chat_bubble", tagBg: "#F3F4F6", tagText: "#374151", barColor: "#7b7486" },
];

export function getCategoryMeta(categoryId: CategoryId): CategoryMeta {
  return CATEGORIES.find((c) => c.id === categoryId)!;
}
