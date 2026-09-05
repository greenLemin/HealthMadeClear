import { articles as enArticles } from "@/data/articleBundles.en";
import { articles as esArticles } from "@/data/articleBundles.es";
import type { Locale } from "@/lib/i18n";
import type { Article } from "@/types/article";

// Map-based lookup index by locale for O(1) article fetching
const articleMapByLocale: Record<Locale, Map<string, Article>> = {
  en: new Map(enArticles.map((a) => [a.id, a])),
  es: new Map(esArticles.map((a) => [a.id, a])),
};

function articlesForLocale(locale: Locale): Article[] {
  switch (locale) {
    case "es":
      return esArticles;
    case "en":
      return enArticles;
    default:
      return [];
  }
}

export function getAllArticles(locale: Locale): Article[] {
  return articlesForLocale(locale);
}

export function getArticleByIdFromBundle(id: string, locale: Locale): Article | undefined {
  return (articleMapByLocale[locale] ?? articleMapByLocale.en).get(id);
}

export async function loadArticlesForLocale(locale: Locale): Promise<Article[]> {
  switch (locale) {
    case "es": {
      const mod = await import("@/data/articleBundles.es");
      return mod.articles;
    }
    case "en": {
      const mod = await import("@/data/articleBundles.en");
      return mod.articles;
    }
    default:
      return [];
  }
}
