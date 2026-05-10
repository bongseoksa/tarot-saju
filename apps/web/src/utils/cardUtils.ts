import { TAROT_CARDS } from "@tarot-saju/shared";
import type { TarotCard } from "@tarot-saju/shared";

export function getCardById(id: number): TarotCard | undefined {
  return TAROT_CARDS.find((c: TarotCard) => c.id === id);
}

export function getRandomReversed(): boolean {
  return Math.random() < 0.5;
}

const cardImages = import.meta.glob<{ default: string }>(
  "@/assets/cards/*.png",
  { eager: true },
);

export function getCardImageUrl(cardId: number): string {
  const fileName = `card_${String(cardId).padStart(2, "0")}.png`;
  const match = Object.entries(cardImages).find(([path]) =>
    path.endsWith(`/${fileName}`),
  );
  return match ? match[1].default : "";
}

export function getCardBackUrl(): string {
  const match = Object.entries(cardImages).find(([path]) =>
    path.endsWith("/card_back.png"),
  );
  return match ? match[1].default : "";
}
