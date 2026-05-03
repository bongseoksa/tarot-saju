import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import TarotCardImage from "../ui/TarotCardImage";
import { SPRING_GENTLE, DURATION_FAST } from "../../utils/motionConfig";
import { triggerHaptic } from "../../utils/haptic";

interface CardGridProps {
  selectedCardIds: number[];
  onCardClick: (cardId: number) => void;
}

export default function CardGrid({ selectedCardIds, onCardClick }: CardGridProps) {
  const [flippingCardId, setFlippingCardId] = useState<number | null>(null);

  // Major Arcana: 0-21, 4 columns => 5 full rows (20) + 2 centered
  const mainCards = Array.from({ length: 20 }, (_, i) => i);
  const lastRowCards = [20, 21];

  const isSelected = (id: number) => selectedCardIds.includes(id);
  const isFlipping = flippingCardId !== null;

  const handleClick = useCallback(
    (cardId: number) => {
      if (selectedCardIds.includes(cardId) || isFlipping) return;
      triggerHaptic();
      setFlippingCardId(cardId);

      // Flip animation duration, then notify parent
      setTimeout(() => {
        onCardClick(cardId);
        setFlippingCardId(null);
      }, 500);
    },
    [isFlipping, onCardClick, selectedCardIds],
  );

  function renderCard(id: number) {
    const selected = isSelected(id);
    const flipping = flippingCardId === id;
    const dimmed = isFlipping && !flipping && !selected;

    return (
      <motion.button
        key={id}
        aria-label={`카드 ${id}`}
        disabled={selected || isFlipping}
        onClick={() => handleClick(id)}
        whileHover={!selected && !isFlipping ? { y: -8, scale: 1.03 } : undefined}
        whileTap={!selected && !isFlipping ? { scale: 0.95 } : undefined}
        transition={SPRING_GENTLE}
        animate={
          flipping
            ? { rotateY: 180, y: -20, scale: 1.05 }
            : dimmed
              ? { opacity: 0.4, filter: "brightness(0.7)" }
              : { rotateY: 0, y: 0, scale: 1, opacity: 1, filter: "brightness(1)" }
        }
        className={`aspect-[2/3] rounded-lg bg-white border border-zinc-100 shadow-sm overflow-hidden ${
          selected
            ? "opacity-40 grayscale-[0.2]"
            : ""
        }`}
        style={{ perspective: 800, transformStyle: "preserve-3d" }}
      >
        <AnimatePresence mode="wait">
          {flipping ? (
            <motion.div
              key="front"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: DURATION_FAST }}
              className="w-full h-full"
            >
              <TarotCardImage cardId={id} />
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION_FAST }}
              className="w-full h-full"
            >
              <TarotCardImage showBack />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto pb-32 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-violet-100 [&::-webkit-scrollbar-thumb]:rounded-full"
      style={{ maskImage: "linear-gradient(to bottom, transparent, black 5%, black 90%, transparent)" }}
    >
      <div className="grid grid-cols-4 gap-[--spacing-sm] py-[--spacing-sm]">
        {mainCards.map(renderCard)}
      </div>
      {/* Last 2 cards centered */}
      <div className="flex justify-center gap-[--spacing-sm]">
        {lastRowCards.map((id) => (
          <div key={id} className="w-[calc(25%-9px)]">
            {renderCard(id)}
          </div>
        ))}
      </div>
    </div>
  );
}
