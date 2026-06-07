import { quizBundles } from "@/data/quizBundles";
import type { Locale } from "@/lib/i18n";

export function getQuizByLessonId(lessonId: string, locale: Locale) {
  const quizzes = quizBundles[locale];
  return quizzes.find((q) => q.lessonId === lessonId) ?? null;
}

export function getAllQuizzes(locale: Locale) {
  return quizBundles[locale];
}
