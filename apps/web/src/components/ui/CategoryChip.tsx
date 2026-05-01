interface CategoryChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function CategoryChip({ label, active, onClick }: CategoryChipProps) {
  return (
    <button
      className={`flex-none px-[--spacing-md] py-[--spacing-sm] rounded-full text-[length:--font-size-sub-text] leading-[1.5] transition-colors ${
        active
          ? "bg-primary text-on-primary"
          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
