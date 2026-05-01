import type { TarotTheme } from "@tarot-saju/shared";
import { getCategoryMeta } from "../../data/themes";
import Icon from "./Icon";

interface ThemeCardProps {
  theme: TarotTheme;
  onClick?: () => void;
}

export default function ThemeCard({ theme, onClick }: ThemeCardProps) {
  const meta = getCategoryMeta(theme.category);

  return (
    <div
      className="bg-white p-[--spacing-lg] rounded-[24px] shadow-sm border border-zinc-100 flex flex-col gap-[--spacing-sm] group cursor-pointer hover:border-primary-fixed transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <span
          className="px-[--spacing-sm] py-[--spacing-xs] rounded-full text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em]"
          style={{ backgroundColor: meta.tagBg, color: meta.tagText }}
        >
          {theme.tags[0]}
        </span>
        <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-primary group-hover:bg-primary-fixed transition-colors">
          <Icon name={meta.icon} />
        </div>
      </div>
      <div>
        <h3 className="text-[length:--font-size-section-header] leading-[1.4] tracking-[-0.01em] font-semibold mb-[--spacing-xs]">
          {theme.title}
        </h3>
        <p className="text-[length:--font-size-sub-text] leading-[1.5] text-on-surface-variant">
          {theme.description}
        </p>
      </div>
    </div>
  );
}
