import type { TarotCard } from "@shared/types";
import cardsJson from "../../data/tarot-cards.json" with { type: "json" };

export const TAROT_CARDS: TarotCard[] = cardsJson as TarotCard[];
