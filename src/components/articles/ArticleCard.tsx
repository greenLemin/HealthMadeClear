"use client";

import { Clock } from "lucide-react";
import ResourceCard from "@/components/ui/ResourceCard";
import type { Article } from "@/types/article";
import { useTranslations } from "next-intl";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const t = useTranslations("common");

  return (
    <ResourceCard
      href={`/articles/${article.id}`}
      title={article.title}
      description={article.description}
      header={<div className="eyebrow">{article.category}</div>}
      footer={
        <span className="inline-flex items-center gap-2">
          <Clock size={14} aria-hidden="true" />
          {article.readingTime} {t("read")}
        </span>
      }
    />
  );
}
