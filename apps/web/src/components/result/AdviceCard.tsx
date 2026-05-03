import Icon from "../ui/Icon";

interface AdviceCardProps {
  advice: string;
  summary: string;
}

export default function AdviceCard({ advice, summary }: AdviceCardProps) {
  return (
    <div className="bg-primary-container p-[--spacing-lg] rounded-[24px] text-on-primary-container shadow-md">
      <h3 className="text-[length:--font-size-section-header] leading-[1.4] tracking-[-0.01em] font-bold mb-[--spacing-sm]">
        점하나의 한마디
      </h3>
      <p className="text-[length:--font-size-body-main] leading-[1.6] opacity-90 mb-[--spacing-md]">
        {advice}
      </p>
      <div className="bg-white/20 h-px w-full mb-[--spacing-md]" />
      <div className="flex items-center gap-2">
        <Icon name="verified" size={24} />
        <p className="text-[length:--font-size-display-title] leading-[1.4] tracking-[-0.02em] font-bold">
          {summary}
        </p>
      </div>
    </div>
  );
}
