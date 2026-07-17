"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import ArticleCard from "@/components/articles/ArticleCard";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
import { getArticles } from "@/lib/localizedContent";
import { useTranslations } from "next-intl";

export default function ArticlesClient() {
  const [query, setQuery] = useState("");
  const { locale } = useAppState();
  const t = useTranslations("articles");
  const articles = getArticles(locale);

  const searchIndex = useMemo(() => {
    return articles.map((article) => ({
      titleLower: article.title.toLowerCase(),
      descriptionLower: article.description.toLowerCase(),
      categoryLower: article.category.toLowerCase(),
    }));
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return articles.filter((article, index) => {
      const idx = searchIndex[index];
      return idx.titleLower.includes(q) || idx.descriptionLower.includes(q) || idx.categoryLower.includes(q);
    });
  }, [articles, query, searchIndex]);

  return (
    <div className="py-10 md:py-14">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader centered title={t("title")} description={t("description")} className="mb-8">
          <div className="mx-auto max-w-3xl">
            <div className="surface-card-glass px-4 py-4 text-left md:px-6 md:py-5">
              <label className="relative block">
                <span className="sr-only">{t("searchArticles")}</span>
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  size={18}
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchArticles")}
                  className="input-field w-full pl-11"
                />
              </label>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="chip chip-active">{t("resultsCount", { count: filtered.length })}</span>
                {query ? (
                  <Button type="button" variant="secondary" size="sm" onClick={() => setQuery("")}>
                    {t("clearSearch")}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </PageHeader>

        <p className="sr-only" role="status" aria-live="polite">
          {t("resultsCount", { count: filtered.length })}
        </p>

        {filtered.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((article, index) => (
              <Reveal key={article.id} delay={Math.min(index * 0.05, 0.25)}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            variant="search"
            title={t("noResults")}
            description={t("noResultsHint")}
            action={{ label: t("clearSearch"), onClick: () => setQuery("") }}
          />
        )}
      </div>
    </div>
  );
}
