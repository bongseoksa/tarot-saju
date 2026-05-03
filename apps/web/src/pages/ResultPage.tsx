import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import AppHeader from "../components/AppHeader";
import CardSummary from "../components/result/CardSummary";
import StreamingText from "../components/result/StreamingText";
import AdviceCard from "../components/result/AdviceCard";
import Icon from "../components/ui/Icon";
import { useReadingStore } from "../stores/useReadingStore";
import { useHistoryStore } from "../stores/useHistoryStore";
import { useShare } from "../hooks/useShare";
import { getCardById } from "../data/cards";
import { THREE_CARD_SPREAD } from "../data/spreads";
import type { DrawnCard } from "@tarot-saju/shared";

function buildCardSummary(cards: DrawnCard[]) {
  return cards
    .sort((a, b) => a.positionIndex - b.positionIndex)
    .map((drawn) => {
      const card = getCardById(drawn.cardId);
      const position = THREE_CARD_SPREAD.positions[drawn.positionIndex];
      return {
        position: position?.label ?? "",
        cardId: drawn.cardId,
        cardName: card?.nameKo ?? card?.name ?? "",
        isReversed: drawn.isReversed,
      };
    });
}

export default function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { share, isSharing } = useShare();

  const phase = useReadingStore((s) => s.phase);
  const storeCards = useReadingStore((s) => s.selectedCards);
  const storeInterpretation = useReadingStore((s) => s.interpretation);
  const storeSummary = useReadingStore((s) => s.summary);
  const storeResultId = useReadingStore((s) => s.resultId);

  // Determine data source: new reading from store or historical from history
  const isNewReading = storeResultId === resultId && phase === "done";
  const historyResult = !isNewReading
    ? useHistoryStore.getState().getResult(resultId ?? "")
    : undefined;

  const cards = isNewReading
    ? storeCards
    : historyResult?.request.cards ?? [];
  const interpretation = isNewReading
    ? storeInterpretation
    : historyResult?.interpretation ?? "";
  const summary = isNewReading
    ? storeSummary
    : historyResult?.summary ?? "";

  const cardSummary = buildCardSummary(cards);

  function handleShare() {
    const result = historyResult ?? {
      id: resultId ?? "",
      request: {
        themeId: useReadingStore.getState().themeId ?? "",
        cards: storeCards,
      },
      interpretation,
      summary,
      createdAt: new Date().toISOString(),
    };
    share(result);
  }

  const shareButton = (
    <button
      onClick={handleShare}
      className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-full transition-colors"
    >
      <Icon name="share" />
    </button>
  );

  return (
    <>
      <AppHeader
        variant="sub"
        title="오늘의 운세 결과"
        rightAction={shareButton}
      />
      <main className="max-w-[448px] mx-auto px-[--spacing-container-padding] pt-[--spacing-lg] pb-40 space-y-[--spacing-lg] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {cardSummary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardSummary cards={cardSummary} />
          </motion.div>
        )}

        {/* Mascot Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-[--spacing-sm] mb-[--spacing-lg]"
        >
          <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          <div className="bg-white px-[--spacing-md] py-[--spacing-sm] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-sm border border-zinc-100">
            <p className="text-[length:--font-size-sub-text] leading-[1.5] text-on-surface-variant">
              점하나가 당신의 카드를 읽고 있어요...
            </p>
          </div>
        </motion.div>

        {/* Interpretation Text */}
        {interpretation && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white p-[--spacing-lg] rounded-[24px] shadow-sm border border-zinc-100"
          >
            <StreamingText
              text={interpretation}
              isStreaming={false}
            />
          </motion.section>
        )}

        {/* Summary / Advice */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <AdviceCard advice="" summary={summary} />
          </motion.div>
        )}

        {/* Ad Banner */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="w-full py-[--spacing-md]"
        >
          <div className="bg-zinc-100 rounded-xl h-24 flex items-center justify-center border border-zinc-200 border-dashed">
            <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-zinc-400 uppercase tracking-widest">
              Advertisement
            </span>
          </div>
        </motion.section>
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md px-6 pb-8 pt-4 max-w-[448px] mx-auto space-y-3 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.05)] border-t border-zinc-50">
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 h-14 bg-white border border-violet-200 text-primary font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-violet-50 transition-colors active:scale-95 duration-200"
          >
            <Icon name="share" />
            공유하기
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-[2] h-14 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(107,56,212,0.2)] hover:bg-primary/90 active:scale-95 transition-colors duration-200"
          >
            점 하나 더 찍어볼까?
            <Icon name="arrow_forward" />
          </button>
        </div>
      </footer>
    </>
  );
}
