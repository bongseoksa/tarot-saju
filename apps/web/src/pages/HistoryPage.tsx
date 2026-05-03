import { useNavigate } from "react-router";
import AppHeader from "../components/AppHeader";
import HistoryCard from "../components/history/HistoryCard";
import EmptyState from "../components/ui/EmptyState";
import { useHistoryStore } from "../stores/useHistoryStore";
import { THEMES } from "../data/themes";

const CATEGORY_COLORS: Record<string, string> = {
  daily: "bg-amber-50 text-tertiary",
  love: "bg-pink-50 text-secondary",
  career: "bg-violet-50 text-primary",
  wealth: "bg-emerald-50 text-emerald-600",
  study: "bg-blue-50 text-blue-600",
  general: "bg-zinc-50 text-zinc-600",
};

const CATEGORY_LABELS: Record<string, string> = {
  daily: "일상",
  love: "연애",
  career: "직장",
  wealth: "재물",
  study: "학업",
  general: "기타",
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const results = useHistoryStore((s) => s.results);
  const isEmpty = results.length === 0;

  const thisMonthCount = results.filter((r) => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  return (
    <>
      <AppHeader variant="sub" title="히스토리" />
      <main className="max-w-[448px] mx-auto px-[--spacing-container-padding] pt-[--spacing-lg] pb-32">
        {isEmpty ? (
          <EmptyState
            title="여기는 아직 비어있어요."
            description="점 하나 찍으러 가볼까요?"
            actionLabel="지금 점 보러 가기"
            onAction={() => navigate("/")}
          />
        ) : (
          <>
            {/* Summary Stats */}
            <div className="mb-[--spacing-xl]">
              <h2 className="text-[length:--font-size-section-header] leading-[1.4] tracking-[-0.01em] font-semibold text-on-surface mb-[--spacing-sm]">
                최근 운세 요약
              </h2>
              <div className="grid grid-cols-2 gap-[--spacing-sm]">
                <div className="bg-white p-[--spacing-md] rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.04)] border border-zinc-50">
                  <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-zinc-500 mb-[--spacing-base] block">
                    이번 달 읽은 횟수
                  </span>
                  <span className="text-[length:--font-size-display-title] leading-[1.4] tracking-[-0.02em] font-bold text-primary">
                    {thisMonthCount}회
                  </span>
                </div>
                <div className="bg-white p-[--spacing-md] rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.04)] border border-zinc-50">
                  <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-zinc-500 mb-[--spacing-base] block">
                    총 기록
                  </span>
                  <span className="text-[length:--font-size-display-title] leading-[1.4] tracking-[-0.02em] font-bold text-secondary">
                    {results.length}건
                  </span>
                </div>
              </div>
            </div>

            {/* List Header */}
            <div className="flex justify-between items-end mb-[--spacing-md]">
              <h2 className="text-[length:--font-size-section-header] leading-[1.4] tracking-[-0.01em] font-semibold text-on-surface">
                모든 기록
              </h2>
              <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-zinc-400">
                날짜순
              </span>
            </div>

            {/* History Items */}
            <div className="space-y-[--spacing-md]">
              {results.map((result) => {
                const theme = THEMES.find((t) => t.id === result.request.themeId);
                const category = theme?.category ?? "general";
                const date = new Date(result.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                });

                return (
                  <HistoryCard
                    key={result.id}
                    categoryTag={CATEGORY_LABELS[category] ?? "기타"}
                    categoryColor={CATEGORY_COLORS[category] ?? CATEGORY_COLORS.general}
                    date={date}
                    title={theme?.title ?? "타로 결과"}
                    cardIds={result.request.cards.map((c) => c.cardId)}
                    onClick={() => navigate(`/result/${result.id}`)}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}
