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

// Cache the dynamic import to improve performance
let loadPathsPromise: Promise<typeof import("@/lib/paths/loadPaths")> | null = null;

export function getLoadPathsPromise() {
  if (!loadPathsPromise) {
    loadPathsPromise = import("@/lib/paths/loadPaths");
  }
  return loadPathsPromise;
}
