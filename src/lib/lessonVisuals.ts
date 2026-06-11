import type { LessonCategoryId } from "@/types/content";

const CATEGORY_VISUALS: Record<LessonCategoryId, { emoji: string; gradient: string }> = {
  "medication-safety": {
    emoji: "💊",
    gradient: "from-primary-container to-secondary-container",
  },
  "doctor-visits": {
    emoji: "🩺",
    gradient: "from-secondary-container to-primary-fixed",
  },
  "lab-results": {
    emoji: "🔬",
    gradient: "from-primary-fixed to-primary-container",
  },
  "preventive-care": {
    emoji: "🌿",
    gradient: "from-secondary-container to-primary-container",
  },
  "chronic-conditions": {
    emoji: "🏥",
    gradient: "from-primary-container to-primary-fixed",
  },
  "mental-health": {
    emoji: "🧠",
    gradient: "from-secondary-container to-surface-container-high",
  },
  "insurance-billing": {
    emoji: "📋",
    gradient: "from-surface-container-high to-primary-container",
  },
  emergency: {
    emoji: "🚨",
    gradient: "from-error-container to-primary-container",
  },
  nutrition: {
    emoji: "🥗",
    gradient: "from-secondary-container to-primary-fixed",
  },
};

export function getLessonCategoryVisual(categoryId: LessonCategoryId) {
  return CATEGORY_VISUALS[categoryId];
}
