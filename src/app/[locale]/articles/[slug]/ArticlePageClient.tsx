"use client";

import { useCallback } from "react";
import { ArrowLeft, Link2, Share2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
import Callout from "@/components/Callout";
import { useAppState } from "@/components/AppProviders";
import { useToast } from "@/components/ui/ToastProvider";
import { getGlossaryTerms } from "@/lib/localizedContent";
import { useTranslations } from "next-intl";
import type { Article } from "@/types/article";

export default function ArticlePageClient({ article }: { article: Article }) {
  const { locale } = useAppState();
  const t = useTranslations("articles");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const glossaryTerms = getGlossaryTerms(locale);
  const { showToast } = useToast();
  const url = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("success", t("linkCopied"));
    } catch {
      showToast("error", t("linkCopyError"));
    }
  }, [url, showToast, t]);

  const handleShareTwitter = useCallback(() => {
    const text = encodeURIComponent(`${article.title} — Health Made Clear`);
    const shareUrl = encodeURIComponent(url);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [article.title, url]);

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <nav className="no-print mb-6" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                {tNav("home")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/articles" className="hover:text-primary transition-colors">
                {tNav("articles")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-on-surface" aria-current="page">
                {article.title}
              </span>
            </li>
          </ol>
        </nav>
        <Link
          href="/articles"
          className="no-print mb-6 inline-flex items-center gap-2 text-label-md font-semibold text-primary"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          {t("backToArticles")}
        </Link>
        <div className="mb-4 flex flex-wrap gap-3 text-label-md text-on-surface-variant">
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

        <div className="no-print mt-8 flex items-center gap-4 border-t border-outline-variant pt-8">
          <span className="text-label-md font-semibold text-on-surface-variant">{t("share")}:</span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={tCommon("copyLink")}
          >
            <Link2 size={16} aria-hidden="true" />
            {tCommon("copyLink")}
          </button>
          <button
            type="button"
            onClick={handleShareTwitter}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={t("shareOnX")}
          >
            <Share2 size={16} aria-hidden="true" />
            {t("shareOnX")}
          </button>
        </div>

        <div className="mt-10">
          <MedicalDisclaimer />
        </div>
      </div>
    </div>
  );
}
