import { quizzes as enQuizzes } from "@/data/quizBundles.en";
import { quizzes as esQuizzes } from "@/data/quizBundles.es";
import type { Locale } from "@/lib/i18n";

function quizzesForLocale(locale: Locale) {
  switch (locale) {
    case "es":
      return esQuizzes;
    default:
      return enQuizzes;
  }
}

export function getQuizByLessonId(lessonId: string, locale: Locale) {
  const quizzes = quizzesForLocale(locale);
  return quizzes.find((q) => q.lessonId === lessonId) ?? null;
}

export function getAllQuizzes(locale: Locale) {
  return quizzesForLocale(locale);
}
