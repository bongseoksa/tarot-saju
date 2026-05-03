import cardBack from "../../assets/cards/card-back.png";

interface TarotCardImageProps {
  cardId?: number;
  showBack?: boolean;
  isReversed?: boolean;
  className?: string;
}

function getCardImagePath(cardId: number): string {
  const paddedId = String(cardId).padStart(2, "0");
  const nameMap: Record<number, string> = {
    0: "fool", 1: "magician", 2: "high-priestess", 3: "empress", 4: "emperor",
    5: "hierophant", 6: "lovers", 7: "chariot", 8: "strength", 9: "hermit",
    10: "wheel-of-fortune", 11: "justice", 12: "hanged-man", 13: "death",
    14: "temperance", 15: "devil", 16: "tower", 17: "star", 18: "moon",
    19: "sun", 20: "judgement", 21: "world",
  };
  const name = nameMap[cardId];
  if (!name) return cardBack;
  return new URL(`../../assets/cards/${paddedId}-${name}.png`, import.meta.url).href;
}

export default function TarotCardImage({ cardId, showBack, isReversed, className = "" }: TarotCardImageProps) {
  const src = showBack || cardId === undefined ? cardBack : getCardImagePath(cardId);

  return (
    <img
      src={src}
      alt={showBack ? "카드 뒷면" : `타로 카드 ${cardId}`}
      className={`w-full h-full object-cover ${isReversed ? "rotate-180" : ""} ${className}`}
      draggable={false}
    />
  );
}
