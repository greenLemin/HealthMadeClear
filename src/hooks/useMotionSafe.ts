"use client";

import { useReducedMotion } from "motion/react";

/**
 * True when motion should be skipped: `prefers-reduced-motion: reduce`,
 * or the preference is still unknown (SSR / first paint).
 * Fail closed so autoplay and animations do not start before the query resolves.
 */
export function useMotionSafe() {
  return useReducedMotion() ?? true;
}
