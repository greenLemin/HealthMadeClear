import en from "@/messages/en.json";
import es from "@/messages/es.json";
import type { LessonCategoryId } from "@/types/content";

export type Locale = "en" | "es";

export type Messages = typeof en;

export const messages: Record<Locale, Messages> = { en, es };

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}

export function formatLevel(level: "beginner" | "intermediate" | "advanced", locale: Locale) {
  const copy = getMessages(locale);
  if (level === "beginner") return copy.common.beginner;
  if (level === "intermediate") return copy.common.intermediate;
  return copy.common.advanced;
}

export function getCategoryLabel(categoryId: LessonCategoryId, locale: Locale): string {
  return getMessages(locale).categories[categoryId];
}

export function normalizeGlossaryLetter(term: string): string {
  const first = term.trim().charAt(0).toUpperCase();
  return first.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
