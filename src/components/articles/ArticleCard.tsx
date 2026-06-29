"use client";

import { Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/types/article";
import { useTranslations } from "next-intl";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const t = useTranslations("common");

  return (
    <Link
      href={`/articles/${article.id}`}
      className="surface-card group block overflow-hidden px-6 py-6 transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-card-hover md:px-7 md:py-7"
    >
      <div className="eyebrow mb-4">{article.category}</div>
      <h3 className="font-display text-headline-md text-primary transition-colors group-hover:text-primary-container">
        {article.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-body-md text-on-surface-variant">{article.description}</p>
      <div className="mt-5 flex items-center gap-2 text-label-md text-on-surface-variant">
        <Clock size={14} aria-hidden="true" />
        {article.readingTime} {t("read")}
      </div>
    </Link>
  );
}
