import type { Transition } from "framer-motion";

// Spring presets
export const SPRING_CARD: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 24,
};

export const SPRING_BOUNCE: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 20,
};

export const SPRING_GENTLE: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
};

// Duration presets (seconds)
export const DURATION_FAST = 0.15;
export const DURATION_NORMAL = 0.3;
export const DURATION_SLOW = 0.5;

// Fade preset
export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

// Instant transition for prefers-reduced-motion
const INSTANT: Transition = { duration: 0 };

/**
 * Returns instant transition when reduced motion is preferred,
 * otherwise returns the provided transition.
 */
export function getTransition(
  transition: Transition,
  reducedMotion: boolean,
): Transition {
  return reducedMotion ? INSTANT : transition;
}
