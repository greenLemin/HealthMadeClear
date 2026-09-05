import { lessons as enLessons } from "@/data/lessonBundles.en";
import { lessons as esLessons } from "@/data/lessonBundles.es";
import type { Lesson } from "@/types/lesson";
import type { Locale } from "@/lib/i18n";

// Map-based lookup index by locale for O(1) lesson fetching
const lessonMapByLocale: Record<Locale, Map<string, Lesson>> = {
  en: new Map(enLessons.map((l) => [l.id, l])),
  es: new Map(esLessons.map((l) => [l.id, l])),
};

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
  return (lessonMapByLocale[locale] ?? lessonMapByLocale.en).get(id);
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
