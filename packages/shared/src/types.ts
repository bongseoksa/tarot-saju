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
    love?: string;
    career?: string;
    finance?: string;
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

export interface ReadingRequest {
  themeId: string;
  cards: DrawnCard[];
}

export interface DrawnCard {
  cardId: number;
  positionIndex: number;
  isReversed: boolean;
}

export interface ReadingResult {
  id: string;
  userId?: string;
  request: ReadingRequest;
  interpretation: string;
  summary: string;
  createdAt: string;
}

export interface PendingSession {
  id: string;
  themeId: string;
  themeTitle: string;
  cards: DrawnCard[];
  createdAt: string;
  adWatched: boolean;
}
