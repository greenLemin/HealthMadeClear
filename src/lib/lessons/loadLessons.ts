import { lessonBundles } from "@/data/lessonBundles";
import type { Lesson, LessonListItem } from "@/types/lesson";
import type { Locale } from "@/lib/i18n";

export function getAllLessons(locale: Locale): Lesson[] {
  return lessonBundles[locale];
}

export function getLessonByIdFromBundle(id: string, locale: Locale): Lesson | undefined {
  return lessonBundles[locale].find((lesson) => lesson.id === id);
}

/** Dynamic import for client-only code paths to avoid loading the other locale chunk. */
export function loadLessonsForLocale(locale: Locale): Promise<LessonListItem[]> {
  return locale === "es"
    ? import("@/data/lessonBundles.es").then((mod) =>
        mod.lessons.map(
          ({
            id,
            title,
            description,
            category,
            categoryId,
            duration,
            level,
            image,
            imageAlt,
            estimatedMinutes,
            wordCount,
          }) => ({
            id,
            title,
            description,
            category,
            categoryId,
            duration,
            level,
            image,
            imageAlt,
            estimatedMinutes,
            wordCount,
          })
        )
      )
    : import("@/data/lessonBundles.en").then((mod) =>
        mod.lessons.map(
          ({
            id,
            title,
            description,
            category,
            categoryId,
            duration,
            level,
            image,
            imageAlt,
            estimatedMinutes,
            wordCount,
          }) => ({
            id,
            title,
            description,
            category,
            categoryId,
            duration,
            level,
            image,
            imageAlt,
            estimatedMinutes,
            wordCount,
          })
        )
      );
}
