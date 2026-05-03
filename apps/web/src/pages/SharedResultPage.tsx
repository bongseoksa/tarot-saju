import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import TarotCardImage from "../components/ui/TarotCardImage";
import Icon from "../components/ui/Icon";
import TimelineInterpretation from "../components/shared/TimelineInterpretation";
import { getSharedReading } from "../utils/shareService";
import type { SharedReading } from "../utils/shareService";
import { getCardById } from "../data/cards";
import { THREE_CARD_SPREAD } from "../data/spreads";

function parseTimelineFromInterpretation(interpretation: string) {
  const sections = interpretation.split(/^## /m).filter(Boolean);
  const items: {
    position: string;
    title: string;
    body: string;
    highlight?: boolean;
  }[] = [];

  for (const section of sections) {
    const lines = section.trim().split("\n");
    const header = lines[0] ?? "";
    const body = lines.slice(1).join("\n").trim();

    // Match "과거 — title" or "현재 — title" etc.
    const match = header.match(/^(과거|현재|미래|종합 조언)\s*[—-]\s*(.+)/);
    if (match) {
      items.push({
        position: match[1],
        title: match[2],
        body,
        highlight: match[1] === "현재",
      });
    } else if (header.startsWith("종합 조언")) {
      items.push({
        position: "종합 조언",
        title: "종합 조언",
        body,
      });
    }
  }

  return items;
}

export default function SharedResultPage() {
  const navigate = useNavigate();
  const { shareId } = useParams<{ shareId: string }>();
  const [data, setData] = useState<SharedReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shareId) return;

    getSharedReading(shareId)
      .then((result) => {
        if (result) {
          setData(result);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shareId]);

  if (loading) {
    return (
      <div className="w-full max-w-[448px] mx-auto bg-white min-h-screen shadow-xl flex items-center justify-center">
        <p className="text-zinc-500">불러오는 중...</p>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="w-full max-w-[448px] mx-auto bg-white min-h-screen shadow-xl flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-zinc-600 text-center">
          만료되었거나 존재하지 않는 결과입니다.
        </p>
        <button
          onClick={() => navigate("/")}
          className="h-12 px-6 bg-primary text-white rounded-2xl font-bold"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const cardDisplays = data.cards
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

  const timelineItems = parseTimelineFromInterpretation(data.interpretation);

  return (
    <div className="w-full max-w-[448px] mx-auto bg-white min-h-screen shadow-xl flex flex-col">
      {/* Logo Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-50 flex justify-center items-center px-4 h-16 w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-xl font-black text-zinc-900 font-['Plus_Jakarta_Sans']">
            점하나
          </span>
        </div>
      </header>

      <main className="flex-grow p-[--spacing-container-padding] pb-32">
        {/* Greeting Bubble */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-3 mb-[--spacing-xl]">
          <div className="w-10 h-10 rounded-full bg-surface-container flex-shrink-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-primary rounded-full" />
          </div>
          <div className="bg-white border border-zinc-100 p-[--spacing-md] rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
            <p className="text-[length:--font-size-body-main] leading-[1.6] text-on-surface">
              점하나가 전해준 타로 결과예요.
              <br />
              당신의 고민에 작은 점 하나가 찍혔길 바라요.
            </p>
          </div>
        </motion.div>

        {/* Card Summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-[--spacing-xl]">
          <div className="grid grid-cols-3 gap-[--spacing-gutter]">
            {cardDisplays.map((card, i) => {
              const isCurrent = i === 1;
              return (
                <div
                  key={card.cardId}
                  className="flex flex-col items-center gap-[--spacing-xs]"
                >
                  <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-zinc-500">
                    {card.position}
                  </span>
                  <div
                    className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-sm border border-zinc-100 bg-white ${
                      isCurrent ? "scale-110 z-10" : ""
                    } ${card.isReversed ? "rotate-180" : ""}`}
                  >
                    <TarotCardImage cardId={card.cardId} />
                  </div>
                  <span
                    className={`text-[length:--font-size-caption] leading-[1.4] font-semibold text-center ${
                      isCurrent ? "text-zinc-900" : "text-zinc-700"
                    }`}
                  >
                    {card.cardName}
                    {card.isReversed ? " (역방향)" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* One-line Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-primary-fixed-dim/20 border border-primary-fixed-dim rounded-2xl p-[--spacing-lg] mb-[--spacing-xl] text-center">
          <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] font-bold text-primary mb-[--spacing-xs] block">
            오늘의 한 줄 요약
          </span>
          <h2 className="text-[length:--font-size-display-title] leading-tight tracking-[-0.02em] font-bold text-on-surface-variant">
            {data.summary}
          </h2>
        </motion.div>

        {/* Timeline Interpretation */}
        {timelineItems.length > 0 ? (
          <TimelineInterpretation items={timelineItems} />
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="text-[length:--font-size-body-main] leading-[1.6] text-on-surface-variant whitespace-pre-wrap">
              {data.interpretation}
            </p>
          </div>
        )}

        {/* Advice Card */}
        {timelineItems.some((item) => item.position === "종합 조언") && (
          <div className="bg-surface-container rounded-2xl p-[--spacing-lg] mt-[--spacing-xl]">
            <div className="flex items-center gap-2 mb-[--spacing-sm]">
              <Icon name="lightbulb" size={24} className="text-primary" />
              <h3 className="text-[length:--font-size-section-header] leading-[1.4] tracking-[-0.01em] font-semibold text-on-surface">
                점하나의 조언
              </h3>
            </div>
            <p className="text-[length:--font-size-body-main] leading-[1.6] text-on-surface-variant">
              {timelineItems.find((item) => item.position === "종합 조언")
                ?.body ?? ""}
            </p>
          </div>
        )}
      </main>

      {/* Bottom CTA */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[448px] p-[--spacing-container-padding] bg-gradient-to-t from-white via-white to-transparent z-50">
        <button
          onClick={() => navigate("/")}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-[length:--font-size-display-title] leading-[1.4] shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          나도 점 하나 찍어볼까?
          <Icon name="arrow_forward" size={20} />
        </button>
        <p className="text-center text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-zinc-400 mt-[--spacing-sm]">
          AI 타로 서비스 점하나(JeomHana)
        </p>
      </footer>
    </div>
  );
}
