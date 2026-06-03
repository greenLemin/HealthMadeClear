import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Lesson } from "@/types/lesson";
import type { LessonCategoryId, LessonId } from "@/types/content";
import { LESSON_IDS } from "@/types/content";

const CALLOUT_REGEX = /:::([a-z]+)\n([\s\S]*?)\n:::/g;

function parseCallouts(block: string) {
  const callouts: NonNullable<Lesson["content"]["sections"][number]["callouts"]> = [];
  let content = block;

  for (const match of Array.from(block.matchAll(CALLOUT_REGEX))) {
    const type = match[1];
    if (type === "info" || type === "success" || type === "warning") {
      callouts.push({ type, content: match[2].trim() });
    }
    content = content.replace(match[0], "").trim();
  }

  return { content: content.trim(), callouts: callouts.length ? callouts : undefined };
}

function parseSections(markdown: string): Lesson["content"]["sections"] {
  const parts = markdown.split(/^## /m).filter(Boolean);

  return parts.map((part) => {
    const newline = part.indexOf("\n");
    const title = newline === -1 ? part.trim() : part.slice(0, newline).trim();
    const body = newline === -1 ? "" : part.slice(newline + 1).trim();
    const { content, callouts } = parseCallouts(body);
    return { title, content, callouts };
  });
}

function lessonFromFile(filePath: string): Lesson {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const id = data.id as LessonId;
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
    sources: Array.isArray(data.sources) ? data.sources.map(String) : undefined,
    image: data.image ? String(data.image) : undefined,
    sidebarTips: Array.isArray(data.sidebarTips) ? data.sidebarTips.map(String) : undefined,
    sidebarTitle: data.sidebarTitle ? String(data.sidebarTitle) : undefined,
    content: { sections: parseSections(content.trim()) },
  };
}

export function getLessonMdxDir(locale: "en" | "es") {
  return path.join(process.cwd(), "content", "lessons", locale);
}

export function getAllLessonsFromMdx(locale: "en" | "es"): Lesson[] {
  const dir = getLessonMdxDir(locale);

  return LESSON_IDS.map((id) => {
    const filePath = path.join(dir, `${id}.mdx`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing lesson MDX file: ${filePath}`);
    }
    return lessonFromFile(filePath);
  });
}

export function getLessonFromMdx(id: string, locale: "en" | "es"): Lesson | undefined {
  const filePath = path.join(getLessonMdxDir(locale), `${id}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;
  return lessonFromFile(filePath);
}
