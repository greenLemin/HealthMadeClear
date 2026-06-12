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
      className="group block overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="p-6 md:p-8">
        <div className="mb-2 text-label-md font-semibold uppercase tracking-wide text-primary">
          {article.category}
        </div>
        <h3 className="mb-2 text-headline-md text-primary transition-colors group-hover:text-primary-container">
          {article.title}
        </h3>
        <p className="mb-4 line-clamp-3 text-body-md text-on-surface-variant">{article.description}</p>
        <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <Clock size={14} aria-hidden="true" />
          {article.readingTime} {t("read")}
        </div>
      </div>
    </Link>
  );
}
