import { pathBundles } from "@/data/pathBundles";
import type { LearningPath } from "@/types/learningPath";

export type { LearningPath } from "@/types/learningPath";

/** English learning paths (bundled from content/paths/en/*.mdx). */
export const learningPaths: LearningPath[] = pathBundles.en;
