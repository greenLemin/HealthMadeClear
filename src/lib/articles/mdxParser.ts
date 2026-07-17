import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import matter from "gray-matter";
import { ARTICLE_IDS, type ArticleId } from "@/types/content";
import { normalizeLineEndings } from "@/lib/normalizeLineEndings";
import type { Article } from "@/types/article";

const CALLOUT_REGEX = /:::([a-z]+)\n([\s\S]*?)\n:::/g;

function parseCallouts(block: string) {
  const callouts: NonNullable<Article["content"]["sections"][number]["callouts"]> = [];
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

function parseSections(markdown: string): Article["content"]["sections"] {
  const parts = markdown.split(/^## /m).filter(Boolean);
  return parts.map((part) => {
    const newline = part.indexOf("\n");
    const title = newline === -1 ? part.trim() : part.slice(0, newline).trim();
    const body = newline === -1 ? "" : part.slice(newline + 1).trim();
    const { content, callouts } = parseCallouts(body);
    return { title, content, callouts };
  });
}

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
      } catch {
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
  } catch {
    return undefined;
  }
  return await articleFromFile(filePath);
}
