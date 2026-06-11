import { articleBundles } from "@/data/articleBundles";
import type { Locale } from "@/lib/i18n";
import type { Article } from "@/types/article";

export function getAllArticles(locale: Locale): Article[] {
  return articleBundles[locale];
}

export function getArticleByIdFromBundle(id: string, locale: Locale): Article | undefined {
  return articleBundles[locale].find((article) => article.id === id);
}

export async function loadArticlesForLocale(locale: Locale): Promise<Article[]> {
  const mod = await import(`@/data/articleBundles.${locale}`);
  return mod.articles;
}
