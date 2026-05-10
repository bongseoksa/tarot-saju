import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useReadingStore } from "@/stores/useReadingStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { getCardById, getCardImageUrl } from "@/utils/cardUtils";
import { requestInterpretation } from "@/utils/sseClient";
import type { InterpretResult } from "@tarot-saju/shared";
import { THEMES } from "@tarot-saju/shared";
import LoadingScreen from "@/components/LoadingScreen";
import mascotIdle from "@/assets/mascot/mascot-idle.png";

const SECTION_LABELS = ["과거 해석", "현재 해석", "미래 해석", "종합 조언"];

function parseSections(text: string) {
  const sections: { title: string; content: string }[] = [];
  const parts = text.split(/^###\s+/m).filter(Boolean);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    if (newline === -1) continue;
    sections.push({
      title: part.slice(0, newline).trim(),
      content: part.slice(newline + 1).trim(),
    });
  }
  return sections;
}

export default function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const { themeId, cards } = useReadingStore();
  const addResult = useHistoryStore((s) => s.addResult);
  const storedResult = useHistoryStore((s) => s.getResult(resultId ?? ""));

  const [interpretation, setInterpretation] = useState("");
  const [summary, setSummary] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState(0);

  const theme = THEMES.find((t) => t.id === (storedResult?.request.themeId ?? themeId));
  const isFromStore = !!storedResult;

  useEffect(() => {
    if (storedResult) {
      setInterpretation(storedResult.interpretation);
      setSummary(storedResult.summary);
      return;
    }

    if (!themeId || cards.length < 3) return;

    setIsLoading(true);
    setIsStreaming(true);
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interpret`;

    requestInterpretation(
      { themeId, cards },
      {
        onChunk: (text) => {
          setIsLoading(false);
          setInterpretation((prev) => prev + text);
        },
        onComplete: (data) => {
          setIsLoading(false);
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
          setIsLoading(false);
          setIsStreaming(false);
          setError(err.message);
        },
      },
      apiUrl,
    );
  }, [resultId, themeId, cards, storedResult, addResult]);

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 px-5 pt-20 text-center">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <p className="text-on-surface-variant">
          해석을 불러오지 못했어요.
          <br />다시 시도해 주세요.
        </p>
        <Link to="/" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-on-primary">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const displayCards = isFromStore ? storedResult!.request.cards : cards;
  const sections = parseSections(interpretation);
  const positionLabels = theme?.positions ?? ["과거", "현재", "미래"];

  return (
    <div className="px-5 pb-28">
      {/* Card Summary Strip */}
      <section className="mt-2 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex justify-center gap-5">
          {displayCards.map((dc, i) => {
            const card = getCardById(dc.cardId);
            if (!card) return null;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-xs text-on-surface-variant">
                  {positionLabels[i]}
                </span>
                <div className="h-24 w-16 overflow-hidden rounded-lg border border-outline-variant">
                  <img
                    src={getCardImageUrl(dc.cardId)}
                    alt={card.nameKo}
                    className={`h-full w-full object-cover ${dc.isReversed ? "rotate-180" : ""}`}
                  />
                </div>
                <span className="text-xs font-medium text-on-surface">
                  {card.nameKo}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    dc.isReversed
                      ? "bg-secondary-container text-secondary"
                      : "bg-primary-container text-primary"
                  }`}
                >
                  {dc.isReversed ? "역방향" : "정방향"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mascot Bubble */}
      <section className="mt-5 flex items-start gap-3">
        <div className="w-10 shrink-0">
          <img src={mascotIdle} alt="" className="h-auto w-full rounded-full" />
        </div>
        <div className="rounded-2xl rounded-tl-none bg-surface-container-high px-4 py-3">
          <p className="text-sm text-on-surface-variant">
            {isStreaming ? "점하나가 당신의 카드를 읽고 있어요..." : "점하나가 읽어본 결과예요"}
          </p>
        </div>
      </section>

      {/* One-line Takeaway */}
      {summary && (
        <section className="mt-5 flex items-start gap-2 rounded-2xl bg-primary-container px-4 py-4">
          <span className="material-symbols-outlined text-xl text-primary">auto_awesome</span>
          <p className="text-sm font-semibold leading-relaxed text-on-primary-container">
            {summary}
          </p>
        </section>
      )}

      {/* Accordion Sections */}
      <section className="mt-5 space-y-3">
        {(sections.length > 0 ? sections : SECTION_LABELS.map((t) => ({ title: t, content: "" }))).map(
          (sec, i) => {
            const isOpen = openSection === i;
            const hasContent = sec.content.length > 0;
            return (
              <div key={i} className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
                <button
                  onClick={() => setOpenSection(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between px-4 py-3.5"
                >
                  <span className="text-sm font-semibold text-on-surface">{sec.title}</span>
                  <span className="material-symbols-outlined text-on-surface-variant">
                    {isOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-l-2 border-primary mx-4 mb-4 pl-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface">
                      {hasContent ? sec.content : ""}
                      {isStreaming && i === sections.length - 1 && (
                        <span className="ml-0.5 inline-block h-3.5 w-1 animate-pulse bg-primary" />
                      )}
                    </p>
                  </div>
                )}
              </div>
            );
          },
        )}
      </section>

      {/* Ad Slot */}
      <div className="relative mt-6 rounded-2xl border border-dashed border-outline-variant bg-[#F0F0F0] py-8 text-center">
        <span className="absolute right-3 top-2 rounded border border-outline-variant px-1.5 py-0.5 text-[10px] text-on-surface-variant">
          광고
        </span>
        <p className="text-sm text-on-surface-variant">Ad Space</p>
      </div>

      {/* Sticky Footer */}
      <div className="fixed inset-x-0 bottom-0 mx-auto flex max-w-screen-sm gap-3 bg-surface/80 px-5 py-3 backdrop-blur-sm">
        <button className="rounded-2xl border border-outline-variant px-6 py-3.5 text-sm font-semibold text-on-surface">
          공유하기
        </button>
        <Link
          to="/"
          className="flex-1 rounded-2xl bg-secondary py-3.5 text-center text-sm font-semibold text-on-secondary"
        >
          점 하나 더 찍어볼까?
        </Link>
      </div>
    </div>
  );
}
