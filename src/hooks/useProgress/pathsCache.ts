import type { LearningPath } from "@/types/learningPath";
import type { Locale } from "@/lib/i18n";

// Cache lesson-to-paths map by locale to optimize close-to-completion checks
const pathsByLessonMapCache = new Map<Locale, Map<string, LearningPath[]>>();

export function getPathsForLesson(
  allPaths: LearningPath[],
  locale: Locale,
  lessonId: string
): LearningPath[] {
  let localeMap = pathsByLessonMapCache.get(locale);
  if (!localeMap) {
    localeMap = new Map<string, LearningPath[]>();
    for (const path of allPaths) {
      for (const id of path.lessons) {
        let list = localeMap.get(id);
        if (!list) {
          list = [];
          localeMap.set(id, list);
        }
        list.push(path);
      }
    }
    pathsByLessonMapCache.set(locale, localeMap);
  }
  return localeMap.get(lessonId) || [];
}

const pathsByLocalePromise = new Map<Locale, Promise<LearningPath[]>>();

async function importPathsForLocale(locale: Locale): Promise<LearningPath[]> {
  switch (locale) {
    case "es": {
      const mod = await import("@/data/pathBundles.es");
      return mod.paths;
    }
    default: {
      const mod = await import("@/data/pathBundles.en");
      return mod.paths;
    }
  }
}

/** Client-safe: dynamic-imports one locale module. Do not import the server path loader. */
export function loadPathsForLocale(locale: Locale): Promise<LearningPath[]> {
  let pending = pathsByLocalePromise.get(locale);
  if (!pending) {
    pending = importPathsForLocale(locale);
    pathsByLocalePromise.set(locale, pending);
  }
  return pending;
}
