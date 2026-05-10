import { useState } from "react";
import { Link } from "react-router";
import { THEMES } from "@tarot-saju/shared";
import { CATEGORIES, getCategoryMeta } from "@/data/categories";
import type { CategoryId } from "@/data/categories";
import mascotIdle from "@/assets/mascot/mascot-idle.png";

const QUICK_ACTIONS = THEMES.filter((t) => t.category === "daily");
const QUICK_ICONS: Record<string, string> = {
  "daily-today": "auto_awesome",
  "daily-week": "date_range",
};

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);

  const filteredThemes = activeCategory
    ? THEMES.filter((t) => t.category === activeCategory)
    : THEMES;

  const AD_INSERT_INDEX = 2;

  return (
    <div className="px-5 pb-8">
      {/* Hero */}
      <section className="mt-4 flex flex-col items-center rounded-3xl bg-primary-container py-8">
        <div className="w-36 sm:w-40">
          <img src={mascotIdle} alt="점하나 마스코트" className="h-auto w-full" />
        </div>
        <p className="mt-4 text-xl font-bold text-on-surface">
          오늘, 점 하나 찍어볼까?
        </p>
      </section>

      {/* Quick Actions */}
      <section className="mt-6 grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((theme) => (
          <Link
            key={theme.id}
            to={`/reading/${theme.id}`}
            className="flex flex-col items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest py-5"
          >
            <span className="material-symbols-outlined text-2xl text-primary">
              {QUICK_ICONS[theme.id] ?? "auto_awesome"}
            </span>
            <p className="text-sm font-semibold text-on-surface">
              {theme.title}
            </p>
            <p className="text-xs text-on-surface-variant">
              {theme.description}
            </p>
          </Link>
        ))}
      </section>

      {/* Category Chips */}
      <nav className="mt-6 flex gap-2 overflow-x-auto" aria-label="카테고리">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
            activeCategory === null
              ? "bg-primary text-on-primary"
              : "bg-surface-container text-on-surface-variant"
          }`}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              activeCategory === cat.id
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* Theme List */}
      <section className="mt-6 space-y-3">
        {filteredThemes.map((theme, index) => {
          const meta = getCategoryMeta(theme.category);
          return (
            <div key={theme.id}>
              {/* Ad Slot after 2nd card */}
              {index === AD_INSERT_INDEX && <AdSlot />}
              <Link
                to={`/reading/${theme.id}`}
                className="flex overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm"
              >
                <div
                  className="w-1.5 shrink-0"
                  style={{ backgroundColor: meta.barColor }}
                />
                <div className="flex flex-1 items-start justify-between p-4">
                  <div>
                    <p className="font-semibold text-on-surface">{theme.title}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {theme.description}
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      {theme.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{ backgroundColor: meta.tagBg, color: meta.tagText }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className="material-symbols-outlined mt-1 text-on-surface-variant"
                    aria-hidden="true"
                  >
                    chevron_right
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="mt-12 space-y-2 text-center text-xs text-on-surface-variant">
        <div className="flex justify-center gap-4">
          <a href="https://notion.so" target="_blank" rel="noopener noreferrer" className="underline">
            이용약관
          </a>
          <a href="https://notion.so" target="_blank" rel="noopener noreferrer" className="underline">
            개인정보처리방침
          </a>
        </div>
        <p>&copy; 2024 JeomHana. All rights reserved.</p>
      </footer>
    </div>
  );
}

function AdSlot() {
  return (
    <div className="relative mb-3 rounded-2xl border border-dashed border-outline-variant bg-[#F0F0F0] py-8 text-center">
      <span className="absolute right-3 top-2 rounded border border-outline-variant px-1.5 py-0.5 text-[10px] text-on-surface-variant">
        광고
      </span>
      <p className="text-sm text-on-surface-variant">광고 영역</p>
    </div>
  );
}
