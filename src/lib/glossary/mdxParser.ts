import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { GlossaryId, LessonId } from "@/types/content";
import { GLOSSARY_IDS } from "@/types/content";
import type { GlossaryTerm } from "@/types/glossary";

function termFromFile(filePath: string): GlossaryTerm {
  const raw = fs.readFileSync(filePath, "utf8");
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

export function getAllGlossaryFromMdx(locale: "en" | "es"): GlossaryTerm[] {
  const dir = getGlossaryMdxDir(locale);

  return GLOSSARY_IDS.map((id) => {
    const filePath = path.join(dir, `${id}.mdx`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing glossary MDX file: ${filePath}`);
    }
    return termFromFile(filePath);
  });
}

export function getGlossaryTermFromMdx(id: string, locale: "en" | "es"): GlossaryTerm | undefined {
  if (!(GLOSSARY_IDS as readonly string[]).includes(id)) return undefined;
  const filePath = path.join(getGlossaryMdxDir(locale), `${id}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;
  return termFromFile(filePath);
}
