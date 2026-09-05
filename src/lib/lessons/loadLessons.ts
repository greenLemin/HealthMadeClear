import { lessons as enLessons } from "@/data/lessonBundles.en";
import { lessons as esLessons } from "@/data/lessonBundles.es";
import type { Lesson } from "@/types/lesson";
import type { Locale } from "@/lib/i18n";

function lessonsForLocale(locale: Locale): Lesson[] {
  switch (locale) {
    case "es":
      return esLessons;
    default:
      return enLessons;
  }
}

export function getAllLessons(locale: Locale): Lesson[] {
  return lessonsForLocale(locale);
}

export function getLessonByIdFromBundle(id: string, locale: Locale): Lesson | undefined {
  return lessonsForLocale(locale).find((lesson) => lesson.id === id);
}

export async function loadLessonsForLocale(locale: Locale): Promise<Lesson[]> {
  switch (locale) {
    case "es": {
      const mod = await import("@/data/lessonBundles.es");
      return mod.lessons;
    }
    default: {
      const mod = await import("@/data/lessonBundles.en");
      return mod.lessons;
    }
  }
}
