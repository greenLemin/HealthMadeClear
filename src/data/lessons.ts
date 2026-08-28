import { lessons as enLessons } from "@/data/lessonBundles.en";
import type { Lesson } from "@/types/lesson";

export type { Lesson } from "@/types/lesson";

/** English lessons (bundled from content/lessons/en/*.mdx). IDs are locale-identical. */
export const lessons: Lesson[] = enLessons;
