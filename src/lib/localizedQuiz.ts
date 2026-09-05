import { quizzes as enQuizzes } from "@/data/quizBundles.en";
import { quizzes as esQuizzes } from "@/data/quizBundles.es";
import type { Locale } from "@/lib/i18n";
import type { Quiz } from "@/types/quiz";

// Map-based lookup index by locale for O(1) quiz fetching by lessonId
const quizMapByLocale: Record<Locale, Map<string, Quiz>> = {
  en: new Map(enQuizzes.map((q) => [q.lessonId, q])),
  es: new Map(esQuizzes.map((q) => [q.lessonId, q])),
};

function quizzesForLocale(locale: Locale) {
  switch (locale) {
    case "es":
      return esQuizzes;
    default:
      return enQuizzes;
  }
}

export function getQuizByLessonId(lessonId: string, locale: Locale): Quiz | null {
  return (quizMapByLocale[locale] ?? quizMapByLocale.en).get(lessonId) ?? null;
}

export function getAllQuizzes(locale: Locale) {
  return quizzesForLocale(locale);
}
