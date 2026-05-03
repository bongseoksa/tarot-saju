import { useNavigate, useSearchParams } from "react-router";
import AppHeader from "../components/AppHeader";
import CategoryChip from "../components/ui/CategoryChip";
import ThemeCard from "../components/ui/ThemeCard";
import Icon from "../components/ui/Icon";
import { THEMES, CATEGORIES, type CategoryId } from "../data/themes";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") as CategoryId | null;

  const filteredThemes = activeCategory
    ? THEMES.filter((t) => t.category === activeCategory)
    : THEMES;

  function handleCategoryClick(categoryId: CategoryId | null) {
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  }

  return (
    <>
      <AppHeader variant="home" />
      <main className="max-w-[448px] mx-auto min-h-screen pb-32">
        {/* Hero Section */}
        <section className="px-[--spacing-container-padding] pt-[--spacing-lg] pb-[--spacing-xl]">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#FFFDEB] to-[#FDF4FF] p-[--spacing-lg]">
            <div className="relative z-10">
              <p className="text-[length:--font-size-sub-text] leading-[1.5] text-on-surface-variant mb-[--spacing-xs]">
                오늘의 운세가 궁금하다면?
              </p>
              <h1 className="text-[length:--font-size-display-title] leading-[1.4] tracking-[-0.02em] font-bold text-on-surface mb-[--spacing-lg]">
                오늘의 타로 한 장
                <br />
                뽑아볼까?
              </h1>
              <button
                className="bg-primary text-on-primary px-[--spacing-lg] py-[--spacing-md] rounded-full text-[length:--font-size-body-main] leading-[1.6] shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-transform"
                onClick={() => navigate("/reading/daily-today")}
              >
                오늘의 타로
                <Icon name="arrow_forward" size={20} />
              </button>
            </div>
            {/* Character decoration */}
            <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-20 pointer-events-none">
              <div className="w-full h-full bg-primary rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="mb-[--spacing-lg]">
          <div className="flex overflow-x-auto gap-[--spacing-xs] px-[--spacing-container-padding] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <CategoryChip
              label="전체"
              active={!activeCategory}
              onClick={() => handleCategoryClick(null)}
            />
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.label}
                active={activeCategory === cat.id}
                onClick={() => handleCategoryClick(cat.id)}
              />
            ))}
          </div>
        </section>

        {/* Theme List */}
        <section className="px-[--spacing-container-padding] space-y-[--spacing-md]">
          <h2 className="text-[length:--font-size-section-header] leading-[1.4] tracking-[-0.01em] font-semibold text-on-surface flex items-center gap-2">
            <Icon name="auto_awesome" className="text-primary" />
            추천 테마
          </h2>
          <div className="grid grid-cols-1 gap-[--spacing-md]">
            {filteredThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onClick={() => navigate(`/reading/${theme.id}`)}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-[--spacing-xl] px-[--spacing-container-padding] pb-[--spacing-lg] text-center border-t border-zinc-100 pt-[--spacing-lg]">
          <div className="flex justify-center gap-[--spacing-md] mb-[--spacing-md]">
            <a
              className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-on-surface-variant hover:text-primary"
              href="#"
            >
              개인정보처리방침
            </a>
            <span className="text-zinc-200">|</span>
            <a
              className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-on-surface-variant hover:text-primary"
              href="#"
            >
              이용약관
            </a>
          </div>
          <p className="text-[length:--font-size-caption] leading-[1.4] text-zinc-400">
            &copy; 2024 점하나. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
