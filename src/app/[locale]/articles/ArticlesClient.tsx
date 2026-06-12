"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Clock, Search } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { getArticles } from "@/lib/localizedContent";
import { useTranslations } from "next-intl";

export default function ArticlesClient() {
  const [query, setQuery] = useState("");
  const { locale } = useAppState();
  const t = useTranslations("articles");
  const tCommon = useTranslations("common");
  const articles = getArticles(locale);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.description.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q)
    );
  }, [articles, query]);

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader centered title={t("title")} description={t("description")}>
          <label className="relative mt-6 block text-left">
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
        </PageHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((article) => (
            <Link key={article.id} href={`/articles/${article.id}`} className="card-hover card block">
              <div className="mb-2 text-label-md font-semibold uppercase tracking-wide text-primary">
                {article.category}
              </div>
              <h2 className="mb-2 text-headline-md text-primary">{article.title}</h2>
              <p className="mb-4 text-body-md text-on-surface-variant">{article.description}</p>
              <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
                <Clock size={16} aria-hidden />
                {article.readingTime} {tCommon("read")}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-8 text-center text-body-md text-on-surface-variant">{t("noResults")}</p>
        ) : null}
      </div>
    </div>
  );
}
