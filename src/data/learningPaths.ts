import { paths as enPaths } from "@/data/pathBundles.en";
import type { LearningPath } from "@/types/learningPath";

export type { LearningPath } from "@/types/learningPath";

/** English learning paths (bundled from content/paths/en/*.mdx). */
export const learningPaths: LearningPath[] = enPaths;
