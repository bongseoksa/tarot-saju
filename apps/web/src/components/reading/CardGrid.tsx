import TarotCardImage from "../ui/TarotCardImage";

interface CardGridProps {
  selectedCardIds: number[];
  onCardClick: (cardId: number) => void;
}

export default function CardGrid({ selectedCardIds, onCardClick }: CardGridProps) {
  // Major Arcana: 0-21, 4 columns => 5 full rows (20) + 2 centered
  const mainCards = Array.from({ length: 20 }, (_, i) => i);
  const lastRowCards = [20, 21];

  const isSelected = (id: number) => selectedCardIds.includes(id);

  return (
    <div
      className="flex-1 overflow-y-auto pb-32 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-violet-100 [&::-webkit-scrollbar-thumb]:rounded-full"
      style={{ maskImage: "linear-gradient(to bottom, transparent, black 5%, black 90%, transparent)" }}
    >
      <div className="grid grid-cols-4 gap-[--spacing-sm] py-[--spacing-sm]">
        {mainCards.map((id) => (
          <button
            key={id}
            aria-label={`카드 ${id}`}
            disabled={isSelected(id)}
            onClick={() => onCardClick(id)}
            className={`aspect-[2/3] rounded-lg bg-white border border-zinc-100 shadow-sm overflow-hidden transition-all transform active:scale-95 ${
              isSelected(id)
                ? "opacity-40 grayscale-[0.2]"
                : "hover:shadow-md hover:-translate-y-1"
            }`}
          >
            <TarotCardImage showBack />
          </button>
        ))}
      </div>
      {/* Last 2 cards centered */}
      <div className="flex justify-center gap-[--spacing-sm]">
        {lastRowCards.map((id) => (
          <button
            key={id}
            aria-label={`카드 ${id}`}
            disabled={isSelected(id)}
            onClick={() => onCardClick(id)}
            className={`w-[calc(25%-9px)] aspect-[2/3] rounded-lg bg-white border border-zinc-100 shadow-sm overflow-hidden transition-all transform active:scale-95 ${
              isSelected(id)
                ? "opacity-40 grayscale-[0.2]"
                : "hover:shadow-md hover:-translate-y-1"
            }`}
          >
            <TarotCardImage showBack />
          </button>
        ))}
      </div>
    </div>
  );
}
