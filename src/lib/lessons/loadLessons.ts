import { lessonBundles } from "@/data/lessonBundles";
import type { Lesson } from "@/types/lesson";
import type { Locale } from "@/lib/i18n";

export function getAllLessons(locale: Locale): Lesson[] {
  return lessonBundles[locale];
}

export function getLessonByIdFromBundle(id: string, locale: Locale): Lesson | undefined {
  return lessonBundles[locale].find((lesson) => lesson.id === id);
}
