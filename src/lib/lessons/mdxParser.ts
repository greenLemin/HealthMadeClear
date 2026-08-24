import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Lesson } from "@/types/lesson";
import type { LessonCategoryId, LessonId } from "@/types/content";
import { normalizeLineEndings } from "@/lib/normalizeLineEndings";
import { LESSON_IDS } from "@/types/content";
import { parseSections } from "@/lib/mdx/callouts";

async function lessonFromFile(filePath: string): Promise<Lesson> {
  const raw = normalizeLineEndings(await fs.promises.readFile(filePath, "utf8"));
  const { data, content } = matter(raw);

  const id = data.id as LessonId;
  if (!LESSON_IDS.includes(id)) {
    throw new Error(`Invalid lesson id '${String(data.id)}' in ${filePath}`);
  }
  const categoryId = data.categoryId as LessonCategoryId;
  const level = data.level as Lesson["level"];

  return {
    id,
    title: String(data.title),
    description: String(data.description),
    category: String(data.category),
    categoryId,
    duration: String(data.duration),
    level,
    lastReviewed: data.lastReviewed ? String(data.lastReviewed) : undefined,
    reviewedBy: data.reviewedBy ? String(data.reviewedBy) : undefined,
    sources: Array.isArray(data.sources) ? data.sources.map(String) : undefined,
    image: data.image ? String(data.image) : undefined,
    imageAlt: data.imageAlt ? String(data.imageAlt) : undefined,
    sidebarTips: Array.isArray(data.sidebarTips) ? data.sidebarTips.map(String) : undefined,
    sidebarTitle: data.sidebarTitle ? String(data.sidebarTitle) : undefined,
    content: { sections: parseSections(content.trim()) },
  };
}

export function getLessonMdxDir(locale: "en" | "es") {
  return path.join(process.cwd(), "content", "lessons", locale);
}

export async function getAllLessonsFromMdx(locale: "en" | "es"): Promise<Lesson[]> {
  const dir = getLessonMdxDir(locale);
  const BATCH_SIZE = 10;
  const results: Lesson[] = [];
  for (let i = 0; i < LESSON_IDS.length; i += BATCH_SIZE) {
    const batch = LESSON_IDS.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (id) => {
      const filePath = path.join(dir, `${id}.mdx`);
      try {
        await fs.promises.access(filePath);
      } catch {
        throw new Error(`Missing lesson MDX file: ${filePath}`);
      }
      return lessonFromFile(filePath);
    });
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  return results;
}

export async function getLessonFromMdx(id: string, locale: "en" | "es"): Promise<Lesson | undefined> {
  const filePath = path.join(getLessonMdxDir(locale), `${id}.mdx`);
  try {
    await fs.promises.access(filePath);
  } catch {
    return undefined;
  }
  return lessonFromFile(filePath);
}
