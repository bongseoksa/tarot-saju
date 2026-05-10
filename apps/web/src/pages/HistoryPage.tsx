import { Link } from "react-router";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { THEMES } from "@tarot-saju/shared";
import { getCategoryMeta } from "@/data/categories";
import { getCardImageUrl } from "@/utils/cardUtils";
import mascotWait from "@/assets/mascot/mascot-wait.png";

export default function HistoryPage() {
  const results = useHistoryStore((s) => s.results);

  const now = new Date();
  const thisMonthResults = results.filter((r) => {
    const d = new Date(r.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const usedCategories = [
    ...new Set(
      thisMonthResults
        .map((r) => THEMES.find((t) => t.id === r.request.themeId)?.category)
        .filter(Boolean),
    ),
  ];

  return (
    <div className="px-5 pb-8">
      {/* Monthly Summary */}
      {results.length > 0 && (
        <section className="mt-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">
              calendar_month
            </span>
            <p className="text-sm font-semibold text-on-surface">
              이번 달 {thisMonthResults.length}회 리딩
            </p>
          </div>
          {usedCategories.length > 0 && (
            <div className="mt-2 flex gap-1.5">
              {usedCategories.map((catId) => {
                const meta = getCategoryMeta(catId!);
                return (
                  <span
                    key={catId}
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{ backgroundColor: meta.tagBg, color: meta.tagText }}
                  >
                    #{meta.label}
                  </span>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Reading List */}
      {results.length > 0 && (
        <>
          <h3 className="mt-6 text-sm font-semibold text-on-surface">최근 리딩 기록</h3>
          <ul className="mt-3 space-y-3">
            {results.map((result) => {
              const theme = THEMES.find((t) => t.id === result.request.themeId);
              const meta = theme ? getCategoryMeta(theme.category) : null;
              const date = new Date(result.createdAt).toLocaleDateString("ko-KR");
              return (
                <li key={result.id}>
                  <Link
                    to={`/result/${result.id}`}
                    className="block rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
                  >
                    <div className="flex items-center gap-2">
                      {meta && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{ backgroundColor: meta.tagBg, color: meta.tagText }}
                        >
                          {meta.label}
                        </span>
                      )}
                      <span className="text-xs text-on-surface-variant">{date}</span>
                      <span className="material-symbols-outlined ml-auto text-on-surface-variant">
                        chevron_right
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-on-surface">
                      {result.summary || theme?.title || "타로 리딩"}
                    </p>
                    {/* Card Thumbnails */}
                    <div className="mt-2 flex gap-1.5">
                      {result.request.cards.map((dc, i) => (
                        <div
                          key={i}
                          className="size-9 overflow-hidden rounded border border-outline-variant"
                        >
                          <img
                            src={getCardImageUrl(dc.cardId)}
                            alt=""
                            className={`h-full w-full object-cover ${dc.isReversed ? "rotate-180" : ""}`}
                          />
                        </div>
                      ))}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Empty State */}
      <section className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-surface-container py-10 text-center">
        <div className="w-32 sm:w-40">
          <img src={mascotWait} alt="빈 히스토리 마스코트" className="h-auto w-full" />
        </div>
        <p className="font-semibold text-on-surface">여기는 아직 비어있어요.</p>
        <p className="text-sm text-on-surface-variant">점 하나 찍으러 가볼까요?</p>
        <Link
          to="/"
          className="rounded-full bg-secondary px-8 py-3 text-sm font-semibold text-on-secondary"
        >
          타로 보러 가기
        </Link>
      </section>
    </div>
  );
}
