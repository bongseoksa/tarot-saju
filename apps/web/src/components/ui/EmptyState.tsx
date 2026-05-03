interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-[--spacing-xl] text-center">
      <div className="w-48 h-48 mb-[--spacing-lg] bg-primary-fixed rounded-full flex items-center justify-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full" />
        </div>
      </div>
      <p className="text-[length:--font-size-section-header] leading-[1.4] tracking-[-0.01em] font-semibold text-on-surface mb-[--spacing-sm]">
        {title}
      </p>
      <p className="text-[length:--font-size-sub-text] leading-[1.5] text-zinc-500 mb-[--spacing-lg]">
        {description}
      </p>
      <button
        onClick={onAction}
        className="bg-primary text-white font-bold py-[--spacing-md] px-[--spacing-xl] rounded-full shadow-lg shadow-primary/20 transition-transform active:scale-95"
      >
        {actionLabel}
      </button>
    </div>
  );
}
