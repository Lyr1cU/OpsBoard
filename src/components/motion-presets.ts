/**
 * Shared Framer Motion presets for OpsBoard list/modal transitions.
 *
 * Keep durations short (150–250ms) for a premium feel without slowing UX.
 * Callers should pass `reduceMotion` from `useReducedMotion()` when possible.
 */

export const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export const listContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
}

export const listItem = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
}

export const modalMotion = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.18, ease: "easeOut" as const },
}
