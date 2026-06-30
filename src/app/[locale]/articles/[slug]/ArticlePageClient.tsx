"use client";

import { useCallback } from "react";
import { ArrowLeft, Clock, Link2, Share2 } from "lucide-react";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
import Callout from "@/components/Callout";
import { useAppState } from "@/components/AppProviders";
import { useToast } from "@/components/ui/ToastProvider";
import Reveal from "@/components/ui/Reveal";
import { formatReviewDate } from "@/lib/i18n";
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
  const reviewedDate = article.lastReviewed ? formatReviewDate(article.lastReviewed, locale) : null;

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
    <div className="py-10 md:py-14">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader
          breadcrumb={[
            { label: tNav("home"), href: "/" },
            { label: tNav("articles"), href: "/articles" },
            { label: article.title },
          ]}
          badge={article.category}
          title={article.title}
          description={article.description}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="chip-active inline-flex items-center gap-2">
              <Clock size={14} aria-hidden="true" />
              {article.readingTime} {tCommon("read")}
            </span>
            {reviewedDate ? <span className="chip">{t("lastReviewed", { date: reviewedDate })}</span> : null}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 no-print">
            <ButtonLink href="/articles" variant="secondary" icon={<ArrowLeft size={18} />}>
              {t("backToArticles")}
            </ButtonLink>
            <Button
              type="button"
              variant="secondary"
              icon={<Link2 size={16} />}
              onClick={handleCopyLink}
              aria-label={tCommon("copyLink")}
            >
              {tCommon("copyLink")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              icon={<Share2 size={16} />}
              onClick={handleShareTwitter}
              aria-label={t("shareOnX")}
            >
              {t("shareOnX")}
            </Button>
          </div>
        </PageHeader>

        <Reveal>
          <article className="surface-card px-6 py-6 md:px-8 md:py-8">
            <div className="prose-hmc max-w-3xl space-y-8">
              {article.content.sections.map((section, index) => (
                <section
                  key={section.title}
                  className={index > 0 ? "border-t border-outline-variant pt-8" : undefined}
                >
                  <h2 className="mb-4 font-display text-headline-md text-primary">{section.title}</h2>
                  <MarkdownRenderer text={section.content} glossaryTerms={glossaryTerms} />
                  {section.callouts?.map((callout, i) => (
                    <Callout key={i} type={callout.type} className="mt-4">
                      {callout.content}
                    </Callout>
                  ))}
                </section>
              ))}
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.08} className="mt-8 space-y-6">
          <div className="surface-card-glass px-5 py-5 no-print md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="eyebrow mb-2">{t("share")}</div>
                <p className="text-body-md text-on-surface-variant">{article.category}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  icon={<Link2 size={16} />}
                  onClick={handleCopyLink}
                  aria-label={tCommon("copyLink")}
                >
                  {tCommon("copyLink")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  icon={<Share2 size={16} />}
                  onClick={handleShareTwitter}
                  aria-label={t("shareOnX")}
                >
                  {t("shareOnX")}
                </Button>
              </div>
            </div>
          </div>

          <MedicalDisclaimer />
        </Reveal>
      </div>
    </div>
  );
}
