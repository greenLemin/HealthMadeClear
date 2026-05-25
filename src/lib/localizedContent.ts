import type { Locale } from "@/lib/i18n";
import { getAllGlossaryTerms, getGlossaryLabelFromBundle } from "@/lib/glossary/loadGlossary";
import { getAllLessons, getLessonByIdFromBundle } from "@/lib/lessons/loadLessons";
import { getAllLearningPaths, getPathByIdFromBundle } from "@/lib/paths/loadPaths";

export function getLearningPaths(locale: Locale) {
  return getAllLearningPaths(locale);
}

export function getLessons(locale: Locale) {
  return getAllLessons(locale);
}

export function getGlossaryTerms(locale: Locale) {
  return getAllGlossaryTerms(locale);
}

export function getLessonById(id: string, locale: Locale) {
  return getLessonByIdFromBundle(id, locale);
}

export function getPathById(id: string, locale: Locale) {
  return getPathByIdFromBundle(id, locale);
}

export function getGlossaryLabel(id: string, locale: Locale) {
  return getGlossaryLabelFromBundle(id, locale);
}
