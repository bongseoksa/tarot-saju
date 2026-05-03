import TarotCardImage from "../ui/TarotCardImage";

interface CardSummaryItem {
  position: string;
  cardId: number;
  cardName: string;
  isReversed: boolean;
}

interface CardSummaryProps {
  cards: CardSummaryItem[];
}

export default function CardSummary({ cards }: CardSummaryProps) {
  return (
    <section className="bg-white rounded-[32px] p-[--spacing-md] shadow-[0_4px_20px_rgba(139,92,246,0.04)] border border-violet-50">
      <div className="flex justify-between items-end gap-[--spacing-xs]">
        {cards.map((card, i) => {
          const isCurrent = i === 1;
          return (
            <div
              key={card.cardId}
              className={`flex-1 flex flex-col items-center space-y-[--spacing-xs] ${isCurrent ? "pb-4" : ""}`}
            >
              <span
                className={`text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] px-2 py-0.5 rounded-full ${
                  isCurrent
                    ? "text-primary bg-primary-fixed font-bold"
                    : "text-on-surface-variant bg-surface-container-low"
                }`}
              >
                {card.position}
              </span>
              <div
                className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden ${
                  isCurrent
                    ? "shadow-md border-2 border-primary-fixed ring-4 ring-primary-fixed/20"
                    : "shadow-sm border border-zinc-100"
                }`}
              >
                <TarotCardImage
                  cardId={card.cardId}
                  isReversed={card.isReversed}
                />
              </div>
              <span
                className={`text-[length:--font-size-sub-text] leading-[1.5] font-bold ${
                  isCurrent ? "text-primary" : "text-on-surface"
                }`}
              >
                {card.cardName}
                {card.isReversed ? " (역)" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
