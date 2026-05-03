import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION_NORMAL } from "../utils/motionConfig";

interface PageTransitionProps {
  children: ReactNode;
}

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: DURATION_NORMAL, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
