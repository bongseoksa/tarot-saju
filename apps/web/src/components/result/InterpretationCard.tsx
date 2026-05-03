import Icon from "../ui/Icon";

interface InterpretationCardProps {
  icon: string;
  title: string;
  body: string;
  highlight?: boolean;
}

export default function InterpretationCard({
  icon,
  title,
  body,
  highlight,
}: InterpretationCardProps) {
  return (
    <div
      className={`bg-white p-[--spacing-lg] rounded-[24px] shadow-sm ${
        highlight
          ? "border border-primary-fixed/50 ring-1 ring-primary-fixed/20"
          : "border border-zinc-100"
      }`}
    >
      <h3 className="text-[length:--font-size-section-header] leading-[1.4] tracking-[-0.01em] font-bold text-primary mb-[--spacing-sm] flex items-center gap-2">
        <Icon name={icon} size={20} />
        {title}
      </h3>
      <p className="text-[length:--font-size-body-main] leading-[1.6] text-on-surface-variant">
        {body}
      </p>
    </div>
  );
}
