import type { TarotCard } from "@tarot-saju/shared";
import cardsJson from "../../../../packages/shared/data/tarot-cards.json";

export const TAROT_CARDS: TarotCard[] = cardsJson as TarotCard[];

export function getCardById(id: number): TarotCard | undefined {
  return TAROT_CARDS.find((card) => card.id === id);
}
