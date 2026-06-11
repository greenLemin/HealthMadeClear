"use client";

import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
import Callout from "@/components/Callout";
import { useAppState } from "@/components/AppProviders";
import { getGlossaryTerms } from "@/lib/localizedContent";
import { useTranslations } from "next-intl";
import type { Article } from "@/types/article";

export default function ArticlePageClient({ article }: { article: Article }) {
  const { locale } = useAppState();
  const t = useTranslations("articles");
  const glossaryTerms = getGlossaryTerms(locale);

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <Link
          href="/articles"
          className="no-print mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft size={18} />
          {t("backToArticles")}
        </Link>
        <div className="mb-4 flex flex-wrap gap-3 text-sm text-on-surface-variant">
          <span className="rounded-full bg-surface-container px-3 py-1">{article.category}</span>
          <span className="rounded-full bg-surface-container px-3 py-1">{article.readingTime}</span>
          {article.lastReviewed ? (
            <span className="rounded-full bg-surface-container px-3 py-1">
              {t("lastReviewed", { date: article.lastReviewed })}
            </span>
          ) : null}
        </div>
        <h1 className="mb-4 text-headline-xl text-primary">{article.title}</h1>
        <p className="mb-8 max-w-3xl text-body-lg text-on-surface-variant">{article.description}</p>

        <article className="prose-hmc max-w-3xl space-y-8">
          {article.content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-4 text-headline-md text-primary">{section.title}</h2>
              <MarkdownRenderer text={section.content} glossaryTerms={glossaryTerms} />
              {section.callouts?.map((callout, i) => (
                <Callout key={i} type={callout.type} className="mt-4">
                  {callout.content}
                </Callout>
              ))}
            </section>
          ))}
        </article>

        <div className="mt-10">
          <MedicalDisclaimer />
        </div>
      </div>
    </div>
  );
}
