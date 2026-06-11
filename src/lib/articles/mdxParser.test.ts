import { describe, expect, it } from "vitest";
import { ARTICLE_IDS } from "@/types/content";
import { getAllArticlesFromMdx } from "./mdxParser";

describe("article mdxParser", () => {
  it("loads all article ids for en with sections", () => {
    const articles = getAllArticlesFromMdx("en");
    expect(articles.length).toBe(ARTICLE_IDS.length);
    for (const article of articles) {
      expect(article.content.sections.length).toBeGreaterThan(0);
      expect(article.lastReviewed).toBeTruthy();
    }
  });
});
