"use client";

import { useReducedMotion } from "motion/react";

/** Skip motion animations when the user prefers reduced motion. */
export function useMotionSafe() {
  return useReducedMotion() ?? false;
}
