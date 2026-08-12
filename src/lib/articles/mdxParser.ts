import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import matter from "gray-matter";
import { ARTICLE_IDS, type ArticleId } from "@/types/content";
import type { Article } from "@/types/article";
import { normalizeLineEndings } from "@/lib/normalizeLineEndings";
import { parseSections } from "@/lib/mdx/callouts";

async function articleFromFile(filePath: string): Promise<Article> {
  const raw = normalizeLineEndings(await fsPromises.readFile(filePath, "utf8"));
  const { data, content } = matter(raw);
  return {
    id: data.id as ArticleId,
    title: String(data.title),
    description: String(data.description),
    category: String(data.category),
    readingTime: String(data.readingTime),
    lastReviewed: data.lastReviewed ? String(data.lastReviewed) : undefined,
    reviewedBy: data.reviewedBy ? String(data.reviewedBy) : undefined,
    sources: Array.isArray(data.sources) ? data.sources.map(String) : undefined,
    content: { sections: parseSections(content.trim()) },
  };
}

export function getArticleMdxDir(locale: "en" | "es") {
  return path.join(process.cwd(), "content", "articles", locale);
}

export async function getAllArticlesFromMdx(locale: "en" | "es"): Promise<Article[]> {
  const dir = getArticleMdxDir(locale);
  return Promise.all(
    ARTICLE_IDS.map(async (id) => {
      const filePath = path.join(dir, `${id}.mdx`);
      try {
        await fsPromises.access(filePath);
      } catch (err) {
        throw new Error(`Missing article MDX file: ${filePath}`);
      }
      return await articleFromFile(filePath);
    })
  );
}

export async function getArticleFromMdx(id: string, locale: "en" | "es"): Promise<Article | undefined> {
  if (!(ARTICLE_IDS as readonly string[]).includes(id)) return undefined;
  const filePath = path.join(getArticleMdxDir(locale), `${id}.mdx`);
  try {
    await fsPromises.access(filePath);
  } catch (err) {
    return undefined;
  }
  return await articleFromFile(filePath);
}
