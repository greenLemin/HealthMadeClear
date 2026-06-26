import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { GlossaryId, LessonId } from "@/types/content";
import { GLOSSARY_IDS } from "@/types/content";
import { normalizeLineEndings } from "@/lib/normalizeLineEndings";
import type { GlossaryTerm } from "@/types/glossary";

async function termFromFile(filePath: string): Promise<GlossaryTerm> {
  const fileContent = await fs.readFile(filePath, "utf8");
  const raw = normalizeLineEndings(fileContent);
  const { data, content } = matter(raw);
  const related = data.relatedTerms;
  const lessons = data.relatedLessons;

  return {
    id: String(data.id),
    term: String(data.term),
    category: String(data.category),
    definition: content.trim(),
    relatedTerms: Array.isArray(related) && related.length > 0 ? related.map(String) : undefined,
    relatedLessons:
      Array.isArray(lessons) && lessons.length > 0 ? (lessons.map(String) as LessonId[]) : undefined,
  };
}

export function getGlossaryMdxDir(locale: "en" | "es") {
  return path.join(process.cwd(), "content", "glossary", locale);
}

export async function getAllGlossaryFromMdx(locale: "en" | "es"): Promise<GlossaryTerm[]> {
  const dir = getGlossaryMdxDir(locale);

  const promises = GLOSSARY_IDS.map(async (id) => {
    const filePath = path.join(dir, `${id}.mdx`);
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`Missing glossary MDX file: ${filePath}`);
    }
    return termFromFile(filePath);
  });

  return Promise.all(promises);
}

export async function getGlossaryTermFromMdx(
  id: string,
  locale: "en" | "es"
): Promise<GlossaryTerm | undefined> {
  if (!(GLOSSARY_IDS as readonly string[]).includes(id)) return undefined;
  const filePath = path.join(getGlossaryMdxDir(locale), `${id}.mdx`);
  try {
    await fs.access(filePath);
  } catch {
    return undefined;
  }
  return termFromFile(filePath);
}
