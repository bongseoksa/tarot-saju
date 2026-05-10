import { useState } from "react";
import { Link } from "react-router";
import { THEMES } from "@tarot-saju/shared";
import { CATEGORIES, getCategoryMeta } from "@/data/categories";
import type { CategoryId } from "@/data/categories";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);

  const filteredThemes = activeCategory
    ? THEMES.filter((t) => t.category === activeCategory)
    : THEMES;

  return (
    <div className="px-4 pb-8">
      {/* Quick Actions */}
      <section className="mt-2 grid grid-cols-2 gap-3">
        {THEMES.filter((t) => t.category === "daily").map((theme) => (
          <Link
            key={theme.id}
            to={`/reading/${theme.id}`}
            className="rounded-2xl bg-primary-container p-4"
          >
            <p className="text-sm font-semibold text-on-primary-container">
              {theme.title}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
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
        {filteredThemes.map((theme) => {
          const meta = getCategoryMeta(theme.category);
          return (
            <Link
              key={theme.id}
              to={`/reading/${theme.id}`}
              className="block rounded-2xl bg-surface-container-lowest p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-on-surface">{theme.title}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {theme.description}
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-on-surface-variant"
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              </div>
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
            </Link>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-on-surface-variant">
        <a
          href="https://notion.so"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          개인정보처리방침
        </a>
        {" | "}
        <a
          href="https://notion.so"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          이용약관
        </a>
      </footer>
    </div>
  );
}
