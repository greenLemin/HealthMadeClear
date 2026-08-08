import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { promises as fsPromises } from "fs";
import { ARTICLE_IDS } from "@/types/content";
import { getAllArticlesFromMdx, getArticleFromMdx } from "./mdxParser";

describe("article mdxParser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("throws error for getAllArticlesFromMdx when file access fails", async () => {
    // Spy on fsPromises.access to throw an error for testing
    const accessSpy = vi.spyOn(fsPromises, "access").mockRejectedValue(new Error("File not found"));

    await expect(getAllArticlesFromMdx("en")).rejects.toThrowError(/Missing article MDX file/);
    expect(accessSpy).toHaveBeenCalled();
  });

  it("returns undefined for getArticleFromMdx when file access fails", async () => {
    // Spy on fsPromises.access to throw an error for testing
    const accessSpy = vi.spyOn(fsPromises, "access").mockRejectedValue(new Error("File not found"));

    // Pick the first valid ID
    const validId = ARTICLE_IDS[0];
    const result = await getArticleFromMdx(validId, "en");

    expect(result).toBeUndefined();
    expect(accessSpy).toHaveBeenCalled();
  });

  it("returns undefined for getArticleFromMdx when id is not valid", async () => {
    const result = await getArticleFromMdx("invalid-id" as any, "en");
    expect(result).toBeUndefined();
  });

  it("returns the article for getArticleFromMdx when file access succeeds", async () => {
    // Pick the first valid ID
    const validId = ARTICLE_IDS[0];
    const result = await getArticleFromMdx(validId, "en");

    expect(result).toBeDefined();
    expect(result?.id).toBe(validId);
    expect(result?.content.sections.length).toBeGreaterThan(0);
  });
});
