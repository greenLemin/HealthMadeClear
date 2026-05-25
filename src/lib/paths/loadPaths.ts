import { pathBundles } from "@/data/pathBundles";
import type { LearningPath } from "@/types/learningPath";
import type { Locale } from "@/lib/i18n";

export function getAllLearningPaths(locale: Locale): LearningPath[] {
  return pathBundles[locale];
}

export function getPathByIdFromBundle(id: string, locale: Locale): LearningPath | undefined {
  return pathBundles[locale].find((path) => path.id === id);
}
