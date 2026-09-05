import { lessons as enLessons } from "@/data/lessonBundles.en";
import { lessons as esLessons } from "@/data/lessonBundles.es";
import type { Lesson } from "@/types/lesson";
import type { Locale } from "@/lib/i18n";

const lessonMapEn = new Map<string, Lesson>(enLessons.map((lesson) => [lesson.id, lesson]));
const lessonMapEs = new Map<string, Lesson>(esLessons.map((lesson) => [lesson.id, lesson]));

function lessonsForLocale(locale: Locale): Lesson[] {
  switch (locale) {
    case "es":
      return esLessons;
    default:
      return enLessons;
  }
}

function lessonMapForLocale(locale: Locale): Map<string, Lesson> {
  switch (locale) {
    case "es":
      return lessonMapEs;
    default:
      return lessonMapEn;
  }
}

export function getAllLessons(locale: Locale): Lesson[] {
  return lessonsForLocale(locale);
}

/**
 * Retrieves a lesson by ID for the given locale using an O(1) Map lookup.
 */
export function getLessonByIdFromBundle(id: string, locale: Locale): Lesson | undefined {
  return lessonMapForLocale(locale).get(id);
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
