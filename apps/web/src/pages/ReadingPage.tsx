import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import AppHeader from "../components/AppHeader";
import CardSlot from "../components/reading/CardSlot";
import CardGrid from "../components/reading/CardGrid";
import { THEMES } from "../data/themes";
import { THREE_CARD_SPREAD } from "../data/spreads";
import { useReadingStore } from "../stores/useReadingStore";
import { useAdGate } from "../hooks/useAdGate";
import { useInterpretation } from "../hooks/useInterpretation";
import { determineOrientation } from "../utils/cardUtils";

export default function ReadingPage() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const theme = THEMES.find((t) => t.id === themeId);
  const { showAd } = useAdGate();
  const { interpret } = useInterpretation();

  const selectedCards = useReadingStore((s) => s.selectedCards);
  const phase = useReadingStore((s) => s.phase);
  const startReading = useReadingStore((s) => s.startReading);
  const selectCard = useReadingStore((s) => s.selectCard);
  const resetSelection = useReadingStore((s) => s.resetSelection);
  const setPhase = useReadingStore((s) => s.setPhase);
  const reset = useReadingStore((s) => s.reset);
  const resultId = useReadingStore((s) => s.resultId);

  const isComplete = selectedCards.length >= 3;

  useEffect(() => {
    if (themeId) {
      startReading(themeId);
    }
    return () => {
      // Only reset if not navigating to result
      if (phase === "selecting") {
        reset();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId]);

  // Navigate to result when streaming is done
  useEffect(() => {
    if (phase === "done" && resultId) {
      navigate(`/result/${resultId}`, { replace: true });
    }
  }, [phase, resultId, navigate]);

  function handleCardClick(cardId: number) {
    if (isComplete) return;
    if (selectedCards.some((c) => c.cardId === cardId)) return;
    const isReversed = determineOrientation();
    selectCard(cardId, selectedCards.length, isReversed);
  }

  function handleReset() {
    resetSelection();
  }

  async function handleSubmit() {
    setPhase("loading");
    await showAd();
    interpret({
      themeId: themeId ?? "",
      cards: selectedCards,
    });
  }

  function getSlotCardId(positionIndex: number): number | undefined {
    return selectedCards.find((c) => c.positionIndex === positionIndex)?.cardId;
  }

  return (
    <div className="bg-amber-50/30 min-h-screen">
      <AppHeader variant="sub" title={theme?.title ?? "카드 뽑기"} />
      <main className="max-w-[448px] mx-auto flex flex-col px-[--spacing-container-padding] relative overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        <section className="py-[--spacing-lg] flex flex-col items-center gap-[--spacing-md]">
          <p className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-on-surface-variant text-center">
            세 장의 카드를 신중하게 골라주세요
          </p>
          <div className="flex justify-between w-full gap-[--spacing-gutter]">
            {THREE_CARD_SPREAD.positions.map((pos) => (
              <CardSlot
                key={pos.index}
                label={pos.label}
                cardId={getSlotCardId(pos.index)}
              />
            ))}
          </div>
        </section>

        <CardGrid
          selectedCardIds={selectedCards.map((c) => c.cardId)}
          onCardClick={handleCardClick}
        />

        <div className="fixed bottom-0 left-0 right-0 max-w-[448px] mx-auto p-[--spacing-container-padding] bg-gradient-to-t from-white via-white/90 to-transparent pb-8">
          {isComplete ? (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-[--spacing-md] rounded-2xl bg-white border border-violet-200 text-primary font-bold text-[length:--font-size-body-main] transition-all active:scale-95"
              >
                다시 선택
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[2] py-[--spacing-md] rounded-2xl bg-primary text-white font-bold text-[length:--font-size-body-main] shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                결과 보기
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full py-[--spacing-md] rounded-2xl bg-zinc-200 text-zinc-400 font-bold text-[length:--font-size-body-main] cursor-not-allowed shadow-lg shadow-black/5 flex items-center justify-center"
            >
              점 보기 ({selectedCards.length}/3)
            </button>
          )}
        </div>
      </main>
      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
      </div>
    </div>
  );
}
