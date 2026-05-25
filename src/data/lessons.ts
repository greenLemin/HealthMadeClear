import { lessonBundles } from "@/data/lessonBundles";
import type { Lesson } from "@/types/lesson";

export type { Lesson } from "@/types/lesson";

/** English lessons (bundled from content/lessons/en/*.mdx). */
export const lessons: Lesson[] = lessonBundles.en;
