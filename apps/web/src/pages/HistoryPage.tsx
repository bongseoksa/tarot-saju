import { Link } from "react-router";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { THEMES } from "@tarot-saju/shared";
import { getCategoryMeta } from "@/data/categories";
import mascotWait from "@/assets/mascot/mascot-wait.png";

export default function HistoryPage() {
  const results = useHistoryStore((s) => s.results);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pt-20 text-center">
        <div className="w-32 sm:w-40 md:w-48">
          <img src={mascotWait} alt="빈 히스토리 마스코트" className="w-full h-auto" />
        </div>
        <p className="text-on-surface-variant">아직 본 점이 없어요<br />점하나 추가하러 가요.</p>
        <Link
          to="/"
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-on-primary"
        >
          점하나 찍으러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8">
      <h2 className="mt-2 text-lg font-bold text-on-surface">히스토리</h2>
      <ul className="mt-4 space-y-3">
        {results.map((result) => {
          const theme = THEMES.find((t) => t.id === result.request.themeId);
          const meta = theme ? getCategoryMeta(theme.category) : null;
          const date = new Date(result.createdAt).toLocaleDateString("ko-KR");
          return (
            <li key={result.id}>
              <Link
                to={`/result/${result.id}`}
                className="block rounded-2xl bg-surface-container-lowest p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-on-surface">
                      {theme?.title ?? "알 수 없는 테마"}
                    </p>
                    {result.summary && (
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {result.summary}
                      </p>
                    )}
                  </div>
                  {meta && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-xs"
                      style={{
                        backgroundColor: meta.tagBg,
                        color: meta.tagText,
                      }}
                    >
                      {meta.label}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">{date}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
