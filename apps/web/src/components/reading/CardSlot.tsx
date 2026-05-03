import TarotCardImage from "../ui/TarotCardImage";
import Icon from "../ui/Icon";

interface CardSlotProps {
  label: string;
  cardId?: number;
}

export default function CardSlot({ label, cardId }: CardSlotProps) {
  const isEmpty = cardId === undefined;

  return (
    <div className="flex-1 flex flex-col items-center gap-[--spacing-xs]">
      {isEmpty ? (
        <div className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-violet-200 bg-white/50 flex flex-col items-center justify-center gap-[--spacing-xs]">
          <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-violet-300">
            {label}
          </span>
          <Icon name="add_circle" size={30} className="text-violet-100" />
        </div>
      ) : (
        <>
          <div className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg border-4 border-white">
            <TarotCardImage cardId={cardId} />
          </div>
          <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-violet-300">
            {label}
          </span>
        </>
      )}
    </div>
  );
}
