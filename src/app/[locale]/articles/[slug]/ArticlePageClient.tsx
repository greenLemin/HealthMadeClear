"use client";

import { useCallback, useMemo, useRef } from "react";
import { ArrowLeft, Clock, Link2, Share2 } from "lucide-react";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import ClinicalCitationBlock from "@/components/content/ClinicalCitationBlock";
import PrintButton from "@/components/content/PrintButton";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
import Callout from "@/components/Callout";
import { useAppState } from "@/components/AppProviders";
import { useToast } from "@/components/ui/ToastProvider";
import Reveal from "@/components/ui/Reveal";
import { formatReviewDate } from "@/lib/i18n";
import { slugify } from "@/lib/slugify";
import { usePrintDate } from "@/hooks/usePrintDate";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useTranslations } from "next-intl";
import type { Article } from "@/types/article";
import type { GlossaryTerm } from "@/types/glossary";

export default function ArticlePageClient({
  article,
  glossaryTerms,
}: {
  article: Article;
  glossaryTerms: GlossaryTerm[];
}) {
  const { locale } = useAppState();
  const t = useTranslations("articles");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tLearn = useTranslations("learn");
  const tDisclaimer = useTranslations("disclaimer");
  const { showToast } = useToast();
  const url = typeof window !== "undefined" ? window.location.href : "";
  const reviewedDate = article.lastReviewed ? formatReviewDate(article.lastReviewed, locale) : null;
  const printDate = usePrintDate(locale);
  const contentRef = useRef<HTMLElement>(null);
  const scrollProgress = useReadingProgress(contentRef);

  const sections = useMemo(() => {
    const used = new Set<string>();
    return article.content.sections.map((section) => ({
      ...section,
      id: slugify(section.title, used),
    }));
  }, [article.content.sections]);

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
    <>
      <div
        className="fixed top-0 left-0 z-[60] h-1.5 bg-primary will-change-[width] transition-[width] duration-150 motion-reduce:transition-none"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={tLearn("readingProgress")}
      />

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
              {reviewedDate ? (
                <span className="chip">{t("lastReviewed", { date: reviewedDate })}</span>
              ) : null}
            </div>
            <ClinicalCitationBlock
              compact
              sources={article.sources}
              reviewedBy={article.reviewedBy}
              lastReviewed={reviewedDate}
            />
            <div className="mt-5 flex flex-wrap gap-3 no-print">
              <ButtonLink href="/articles" variant="secondary" icon={<ArrowLeft size={18} />}>
                {t("backToArticles")}
              </ButtonLink>
              <PrintButton />
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
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12 xl:gap-16">
          <article id="article-body" ref={contentRef} className="max-w-prose leading-[1.75]">
            <Reveal>
              <div className="surface-card px-6 py-6 md:px-8 md:py-8">
                <div className="prose-hmc space-y-8">
                  {sections.map((section, index) => (
                    <section
                      key={section.id}
                      id={section.id}
                      className={
                        index > 0 ? "scroll-mt-24 border-t border-outline-variant pt-8" : "scroll-mt-24"
                      }
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
              </div>
            </Reveal>
          </article>

          <aside aria-label={t("onThisPage")} className="hidden lg:block sticky top-24 w-60 self-start">
            <nav>
              <p className="eyebrow mb-4">{t("onThisPage")}</p>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="inline-flex min-h-11 items-center py-2.5 text-body-md text-primary transition-colors hover:text-primary-container"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>

        <div className="max-w-container mx-auto px-4 md:px-6">
          <Reveal delay={0.05} className="mt-8">
            <div className="surface-card-muted px-6 py-6 md:px-8">
              <ClinicalCitationBlock
                sources={article.sources}
                reviewedBy={article.reviewedBy}
                lastReviewed={reviewedDate}
              />
            </div>
          </Reveal>

          <Reveal delay={0.08} className="mt-8 space-y-6">
            <div className="surface-card-glass px-5 py-5 no-print md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="eyebrow mb-2">{t("share")}</div>
                  <p className="text-body-md text-on-surface-variant">{article.category}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <PrintButton />
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

          <div
            className="hidden print:block mt-8 border-t pt-4 text-xs text-on-surface-variant"
            suppressHydrationWarning
          >
            <p>{tDisclaimer("printMedicalWarning")}</p>
            <p className="mt-1">{tDisclaimer("printTimestamp", { date: printDate })}</p>
          </div>
        </div>
      </div>
    </>
  );
}
