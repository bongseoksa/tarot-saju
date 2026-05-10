import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useReadingStore } from "@/stores/useReadingStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { getCardById, getCardImageUrl } from "@/utils/cardUtils";
import { requestInterpretation } from "@/utils/sseClient";
import type { InterpretResult } from "@tarot-saju/shared";
import { THEMES } from "@tarot-saju/shared";

export default function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const { themeId, cards } = useReadingStore();
  const addResult = useHistoryStore((s) => s.addResult);
  const storedResult = useHistoryStore((s) => s.getResult(resultId ?? ""));

  const [interpretation, setInterpretation] = useState("");
  const [summary, setSummary] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = THEMES.find((t) => t.id === themeId);
  const isFromStore = !!storedResult;

  useEffect(() => {
    if (storedResult) {
      setInterpretation(storedResult.interpretation);
      setSummary(storedResult.summary);
      return;
    }

    if (!themeId || cards.length < 3) return;

    setIsStreaming(true);
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interpret`;

    requestInterpretation(
      { themeId, cards },
      {
        onChunk: (text) => setInterpretation((prev) => prev + text),
        onComplete: (data) => {
          setIsStreaming(false);
          try {
            const parsed: InterpretResult = JSON.parse(data);
            setInterpretation(parsed.interpretation);
            setSummary(parsed.summary);
            addResult({
              id: resultId!,
              request: { themeId, cards },
              interpretation: parsed.interpretation,
              summary: parsed.summary,
              createdAt: new Date().toISOString(),
            });
          } catch {
            setInterpretation(data);
          }
        },
        onError: (err) => {
          setIsStreaming(false);
          setError(err.message);
        },
      },
      apiUrl,
    );
  }, [resultId, themeId, cards, storedResult, addResult]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pt-20 text-center">
        <span className="material-symbols-outlined text-5xl text-error">
          error
        </span>
        <p className="text-on-surface-variant">
          해석을 불러오지 못했어요.
          <br />
          다시 시도해 주세요.
        </p>
        <Link
          to="/"
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-on-primary"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const displayCards = isFromStore ? storedResult!.request.cards : cards;

  return (
    <div className="px-4 pb-8">
      {/* Card Summary Strip */}
      <section className="mt-2 flex justify-center gap-4">
        {displayCards.map((dc, i) => {
          const card = getCardById(dc.cardId);
          if (!card) return null;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-24 w-16 overflow-hidden rounded-lg">
                <img
                  src={getCardImageUrl(dc.cardId)}
                  alt={card.nameKo}
                  className={`h-full w-full object-cover ${dc.isReversed ? "rotate-180" : ""}`}
                />
              </div>
              <span className="text-xs font-medium text-on-surface">
                {card.nameKo}
              </span>
              {dc.isReversed && (
                <span className="text-xs text-on-surface-variant">역방향</span>
              )}
            </div>
          );
        })}
      </section>

      {/* Summary */}
      {summary && (
        <p className="mt-6 text-center text-lg font-semibold text-primary">
          {summary}
        </p>
      )}

      {/* Theme */}
      {theme && (
        <p className="mt-2 text-center text-sm text-on-surface-variant">
          {theme.title}
        </p>
      )}

      {/* Interpretation */}
      <article className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-on-surface">
        {interpretation}
        {isStreaming && <span className="animate-pulse">|</span>}
      </article>

      {/* CTA */}
      <div className="mt-8">
        <Link
          to="/"
          className="block w-full rounded-2xl bg-secondary py-4 text-center text-base font-semibold text-on-secondary"
        >
          점 하나 더 찍어볼까?
        </Link>
      </div>
    </div>
  );
}
