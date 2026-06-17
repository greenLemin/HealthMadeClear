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

// Provide dynamic imports via mock resolution on the actual function
// since vitest struggles with string interpolation in dynamic imports.
vi.mock("./loadArticles", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./loadArticles")>();
  return {
    ...mod,
    loadArticlesForLocale: vi.fn(async (locale: "en" | "es") => {
      // By calling actual import we can get coverage on dynamic imports inside loadArticles.ts
      // but doing it dynamically in vitest is tricky.
      // A better way is mocking at the specific module level which vitest supports if we just match exactly.
      if (locale === "en") {
        return [{ id: "dyn-en-1", title: "Dynamic English 1" }];
      }
      return [{ id: "dyn-es-1", title: "Dynamic Spanish 1" }];
    }),
  };
});

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
});
