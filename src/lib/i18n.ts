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

export function formatRelativeDate(dateStr: string, locale: Locale = "en"): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const copy = getMessages(locale).common;

  if (diffMins < 1) return copy.relativeJustNow;
  if (diffMins < 60) return copy.relativeMinutes.replace("{count}", String(diffMins));
  if (diffHours < 24) return copy.relativeHours.replace("{count}", String(diffHours));
  if (diffDays === 1) return copy.relativeYesterday;
  if (diffDays < 7) return copy.relativeDays.replace("{count}", String(diffDays));
  if (diffDays < 30) return copy.relativeWeeks.replace("{count}", String(Math.floor(diffDays / 7)));
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US");
}

export function formatMemberSince(dateStr: string, locale: Locale): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" });
}

export function formatReviewDate(dateStr: string, locale: Locale): string {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDuration(minutes: number, locale: Locale): string {
  const copy = getMessages(locale).dashboard;
  if (minutes < 60) return copy.timeMinutes.replace("{count}", String(minutes));
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins > 0) {
    return copy.timeHoursMinutes.replace("{hours}", String(hrs)).replace("{minutes}", String(mins));
  }
  return copy.timeHours.replace("{hours}", String(hrs));
}
