import { motion, AnimatePresence } from "framer-motion";
import TarotCardImage from "../ui/TarotCardImage";
import Icon from "../ui/Icon";
import { SPRING_BOUNCE, DURATION_NORMAL } from "../../utils/motionConfig";

interface CardSlotProps {
  label: string;
  cardId?: number;
  isReversed?: boolean;
}

export default function CardSlot({ label, cardId, isReversed }: CardSlotProps) {
  const isEmpty = cardId === undefined;

  return (
    <div className="flex-1 flex flex-col items-center gap-[--spacing-xs]">
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: DURATION_NORMAL }}
            className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-violet-200 bg-white/50 flex flex-col items-center justify-center gap-[--spacing-xs]"
          >
            <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-violet-300">
              {label}
            </span>
            <Icon name="add_circle" size={30} className="text-violet-100" />
          </motion.div>
        ) : (
          <motion.div
            key={`card-${cardId}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING_BOUNCE}
            className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg border-4 border-white"
          >
            <TarotCardImage cardId={cardId} isReversed={isReversed} />
          </motion.div>
        )}
      </AnimatePresence>
      {!isEmpty && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: DURATION_NORMAL }}
          className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-violet-300"
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
