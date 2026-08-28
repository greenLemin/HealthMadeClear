import { paths as enPaths } from "@/data/pathBundles.en";
import { paths as esPaths } from "@/data/pathBundles.es";
import type { LearningPath } from "@/types/learningPath";
import type { Locale } from "@/lib/i18n";

function pathsForLocale(locale: Locale): LearningPath[] {
  switch (locale) {
    case "es":
      return esPaths;
    default:
      return enPaths;
  }
}

export function getAllLearningPaths(locale: Locale): LearningPath[] {
  return pathsForLocale(locale);
}

export function getPathByIdFromBundle(id: string, locale: Locale): LearningPath | undefined {
  return pathsForLocale(locale).find((path) => path.id === id);
}

export async function loadPathsForLocale(locale: Locale): Promise<LearningPath[]> {
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
