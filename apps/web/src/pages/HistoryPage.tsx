import { useNavigate } from "react-router";
import AppHeader from "../components/AppHeader";
import HistoryCard from "../components/history/HistoryCard";
import EmptyState from "../components/ui/EmptyState";

// Mock data for Phase 2
const MOCK_HISTORY = [
  {
    id: "h1",
    categoryTag: "연애운",
    categoryColor: "bg-pink-50 text-secondary",
    date: "2024.05.20",
    title: "그 사람과의 설레는 다음 단계는?",
    cardIds: [6, 19, 17],
  },
  {
    id: "h2",
    categoryTag: "커리어",
    categoryColor: "bg-violet-50 text-primary",
    date: "2024.05.18",
    title: "새로운 프로젝트를 시작해도 될까요?",
    cardIds: [1, 14, 7],
  },
  {
    id: "h3",
    categoryTag: "오늘의 운세",
    categoryColor: "bg-amber-50 text-tertiary",
    date: "2024.05.15",
    title: "5월 셋째 주, 나에게 찾아올 행운",
    cardIds: [10, 3, 21],
  },
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const items = MOCK_HISTORY;
  const isEmpty = items.length === 0;

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
                    12회
                  </span>
                </div>
                <div className="bg-white p-[--spacing-md] rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.04)] border border-zinc-50">
                  <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-zinc-500 mb-[--spacing-base] block">
                    주요 키워드
                  </span>
                  <span className="text-[length:--font-size-display-title] leading-[1.4] tracking-[-0.02em] font-bold text-secondary">
                    성장, 인연
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
              {items.map((item) => (
                <HistoryCard
                  key={item.id}
                  categoryTag={item.categoryTag}
                  categoryColor={item.categoryColor}
                  date={item.date}
                  title={item.title}
                  cardIds={item.cardIds}
                  onClick={() => navigate(`/result/${item.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
