import { describe, expect, it, vi } from "vitest";
import { getAllArticles, getArticleByIdFromBundle, loadArticlesForLocale } from "./loadArticles";

// Mock the article bundles so we don't depend on actual content files
vi.mock("@/data/articleBundles", () => ({
  articleBundles: {
    en: [
      { id: "article-1", title: "English Article 1" },
      { id: "article-2", title: "English Article 2" },
    ],
    es: [
      { id: "article-1", title: "Spanish Article 1" },
      { id: "article-3", title: "Spanish Article 3" },
    ],
  },
}));

vi.mock("@/data/articleBundles.en", () => ({
  articles: [{ id: "dyn-en-1", title: "Dynamic English 1" }],
}));

vi.mock("@/data/articleBundles.es", () => ({
  articles: [{ id: "dyn-es-1", title: "Dynamic Spanish 1" }],
}));

describe("loadArticles", () => {
  describe("getAllArticles", () => {
    it("should return all English articles", () => {
      const articles = getAllArticles("en");
      expect(articles).toHaveLength(2);
      expect(articles[0].title).toBe("English Article 1");
    });

    it("should return all Spanish articles", () => {
      const articles = getAllArticles("es");
      expect(articles).toHaveLength(2);
      expect(articles[0].title).toBe("Spanish Article 1");
    });

    it("should return an empty array for an unsupported locale", () => {
      const articles = getAllArticles("fr" as any);
      expect(articles).toEqual([]);
    });
  });

  describe("getArticleByIdFromBundle", () => {
    it("should return the correct article when valid ID and locale are provided", () => {
      const article = getArticleByIdFromBundle("article-2", "en");
      expect(article).toBeDefined();
      expect(article?.title).toBe("English Article 2");
    });

    it("should return undefined when an invalid ID is provided", () => {
      const article = getArticleByIdFromBundle("invalid-id", "en");
      expect(article).toBeUndefined();
    });

    it("should return undefined when the article exists in another locale but not the requested one", () => {
      const article = getArticleByIdFromBundle("article-3", "en");
      expect(article).toBeUndefined();

      const esArticle = getArticleByIdFromBundle("article-3", "es");
      expect(esArticle).toBeDefined();
    });

    it("should return undefined for an unsupported locale", () => {
      const article = getArticleByIdFromBundle("article-1", "fr" as any);
      expect(article).toBeUndefined();
    });
  });
});

describe("loadArticlesForLocale", () => {
  it("should load articles for English locale dynamically", async () => {
    const articles = await loadArticlesForLocale("en");
    expect(articles).toBeDefined();
    expect(articles.length).toBeGreaterThan(0);
    expect(Array.isArray(articles)).toBe(true);
    expect(articles[0].title).toBe("Dynamic English 1");
  });

  it("should load articles for Spanish locale dynamically", async () => {
    const articles = await loadArticlesForLocale("es");
    expect(articles).toBeDefined();
    expect(Array.isArray(articles)).toBe(true);
    expect(articles[0].title).toBe("Dynamic Spanish 1");
  });

  it("should return an empty array for an unsupported locale dynamically", async () => {
    const articles = await loadArticlesForLocale("fr" as any);
    expect(articles).toEqual([]);
  });
});
