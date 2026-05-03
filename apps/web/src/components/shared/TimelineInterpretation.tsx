interface TimelineItem {
  position: string;
  title: string;
  body: string;
  highlight?: boolean;
}

interface TimelineInterpretationProps {
  items: TimelineItem[];
}

export default function TimelineInterpretation({
  items,
}: TimelineInterpretationProps) {
  return (
    <div className="space-y-[--spacing-lg]">
      {items.map((item) => (
        <div
          key={item.position}
          className={`relative pl-[--spacing-lg] border-l-2 ${
            item.highlight
              ? "border-primary-fixed-dim"
              : "border-zinc-100"
          }`}
        >
          <div
            className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${
              item.highlight ? "bg-primary" : "bg-zinc-200"
            }`}
          />
          <h3
            className={`text-[length:--font-size-section-header] leading-[1.4] tracking-[-0.01em] font-semibold mb-[--spacing-xs] ${
              item.highlight ? "text-primary" : "text-zinc-900"
            }`}
          >
            {item.position}: {item.title}
          </h3>
          <p className="text-[length:--font-size-body-main] leading-[1.6] text-on-surface-variant">
            {item.body}
          </p>
        </div>
      ))}
    </div>
  );
}
