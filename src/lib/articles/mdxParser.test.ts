import { describe, expect, it } from "vitest";
import { ARTICLE_IDS } from "@/types/content";
import { getAllArticlesFromMdx, getArticleMdxDir } from "./mdxParser";
import path from "path";


describe("getArticleMdxDir", () => {
  it("returns correct path for en locale", () => {
    const dir = getArticleMdxDir("en");
    expect(dir).toBe(path.join(process.cwd(), "content", "articles", "en"));
  });

  it("returns correct path for es locale", () => {
    const dir = getArticleMdxDir("es");
    expect(dir).toBe(path.join(process.cwd(), "content", "articles", "es"));
  });
});

describe("article mdxParser", () => {
  it("loads all article ids for en with sections", async () => {
    const articles = await getAllArticlesFromMdx("en");
    expect(articles.length).toBe(ARTICLE_IDS.length);
    for (const article of articles) {
      expect(article.content.sections.length).toBeGreaterThan(0);
      expect(article.lastReviewed).toBeTruthy();
    }
  });
});
