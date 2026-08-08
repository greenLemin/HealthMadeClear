import { describe, expect, it, vi, afterEach } from "vitest";
import { promises as fsPromises } from "fs";
import { ARTICLE_IDS } from "@/types/content";
import { getAllArticlesFromMdx, getArticleFromMdx } from "@/lib/articles/mdxParser";

describe("article mdxParser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads all article ids for en with sections", async () => {
    const articles = await getAllArticlesFromMdx("en");
    expect(articles.length).toBe(ARTICLE_IDS.length);
    for (const article of articles) {
      expect(article.content.sections.length).toBeGreaterThan(0);
      expect(article.lastReviewed).toBeTruthy();
    }
  });

  it("throws an error if an article MDX file is missing", async () => {
    vi.spyOn(fsPromises, "access").mockRejectedValue(new Error("ENOENT"));
    await expect(getAllArticlesFromMdx("en")).rejects.toThrow("Missing article MDX file:");
  });

  it("returns undefined if getArticleFromMdx file is missing", async () => {
    vi.spyOn(fsPromises, "access").mockRejectedValue(new Error("ENOENT"));
    const article = await getArticleFromMdx(ARTICLE_IDS[0], "en");
    expect(article).toBeUndefined();
  });

  it("returns undefined if getArticleFromMdx id is not valid", async () => {
    const article = await getArticleFromMdx("invalid-id", "en");
    expect(article).toBeUndefined();
  });

  it("returns an article if getArticleFromMdx is successful", async () => {
    const article = await getArticleFromMdx(ARTICLE_IDS[0], "en");
    expect(article).toBeDefined();
    expect(article?.id).toBe(ARTICLE_IDS[0]);
  });
});
