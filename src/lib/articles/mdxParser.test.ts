import { describe, expect, it } from "vitest";
import { getAllArticlesFromMdx } from "./mdxParser";

describe("article mdxParser", () => {
  it("loads all article ids for en with sections", () => {
    const articles = getAllArticlesFromMdx("en");
    expect(articles.length).toBe(5);
    for (const article of articles) {
      expect(article.content.sections.length).toBeGreaterThan(0);
      expect(article.lastReviewed).toBeTruthy();
    }
  });
});
