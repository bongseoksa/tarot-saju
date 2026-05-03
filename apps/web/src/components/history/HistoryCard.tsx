import TarotCardImage from "../ui/TarotCardImage";
import Icon from "../ui/Icon";

interface HistoryCardProps {
  categoryTag: string;
  categoryColor: string;
  date: string;
  title: string;
  cardIds: number[];
  onClick: () => void;
}

export default function HistoryCard({
  categoryTag,
  categoryColor,
  date,
  title,
  cardIds,
  onClick,
}: HistoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white p-[--spacing-md] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white flex flex-col gap-[--spacing-md] text-left active:scale-[0.98] transition-transform"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-[--spacing-base]">
            <span
              className={`${categoryColor} px-2 py-0.5 rounded-full text-[10px] font-bold`}
            >
              {categoryTag}
            </span>
            <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-zinc-400">
              {date}
            </span>
          </div>
          <h3 className="text-[length:--font-size-body-main] leading-[1.6] text-on-surface">
            {title}
          </h3>
        </div>
        <Icon name="chevron_right" className="text-zinc-300" />
      </div>
      <div className="flex gap-[--spacing-sm]">
        {cardIds.map((id) => (
          <div
            key={id}
            className="w-14 h-20 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-50"
          >
            <TarotCardImage cardId={id} />
          </div>
        ))}
      </div>
    </button>
  );
}
