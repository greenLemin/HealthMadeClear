import { paths as enPaths } from "@/data/pathBundles.en";
import { paths as esPaths } from "@/data/pathBundles.es";
import type { LearningPath } from "@/types/learningPath";
import type { Locale } from "@/lib/i18n";

// Map-based lookup index by locale for O(1) path fetching
const pathMapByLocale: Record<Locale, Map<string, LearningPath>> = {
  en: new Map(enPaths.map((p) => [p.id, p])),
  es: new Map(esPaths.map((p) => [p.id, p])),
};

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
  return (pathMapByLocale[locale] ?? pathMapByLocale.en).get(id);
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
