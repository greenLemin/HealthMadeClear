"use client";

import { useCallback } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Link2, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import ClinicalCitationBlock from "@/components/content/ClinicalCitationBlock";
import PrintButton from "@/components/content/PrintButton";
import LessonThumbnail from "@/components/LessonThumbnail";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { useToast } from "@/components/ui/ToastProvider";
import { Link } from "@/i18n/navigation";
import { formatLevel, getCategoryLabel, type Locale } from "@/lib/i18n";
import { shareCurrentPage } from "@/lib/shareCurrentPage";
import type { Lesson } from "@/types/lesson";
import type { LessonId } from "@/types/content";

export default function LessonHeader({
  lesson,
  locale,
  reviewedDate,
  isComplete,
  isSaving,
  onMarkComplete,
  hasQuiz,
  bestQuizScore,
  lessonId,
}: {
  lesson: Lesson;
  locale: Locale;
  reviewedDate: string | null;
  isComplete: boolean;
  isSaving: boolean;
  onMarkComplete: () => void;
  hasQuiz: boolean;
  bestQuizScore: number | null;
  lessonId: LessonId;
}) {
  const t = useTranslations("learn");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tArticles = useTranslations("articles");
  const { showToast } = useToast();

  const handleCopyShare = useCallback(async () => {
    await shareCurrentPage({
      url: window.location.href,
      title: lesson.title,
      onCopied: () => showToast("success", tArticles("linkCopied")),
      onError: () => showToast("error", tArticles("linkCopyError")),
    });
  }, [lesson.title, showToast, tArticles]);

  const handleShareOnX = useCallback(() => {
    const text = encodeURIComponent(`${lesson.title} — Health Made Clear`);
    const shareUrl = encodeURIComponent(window.location.href);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [lesson.title]);

  return (
    <section className="section-frame px-6 py-6 md:px-8 md:py-8">
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div>
          <nav aria-label={tCommon("breadcrumb")}>
            <ol className="flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant">
              <li>
                <Link href="/" className="transition-colors hover:text-primary">
                  {tNav("home")}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/learn" className="transition-colors hover:text-primary">
                  {tCommon("allTopics")}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span aria-current="page">{lesson.title}</span>
              </li>
            </ol>
          </nav>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-label-md">
            <span className="chip">{lesson.duration}</span>
            <span className="chip">{formatLevel(lesson.level, locale)}</span>
            <span className="chip">{getCategoryLabel(lesson.categoryId, locale)}</span>
            {reviewedDate ? <span className="chip">{t("updatedOn", { date: reviewedDate })}</span> : null}
          </div>

          <h1 className="mt-5 font-display text-headline-xl text-primary">{lesson.title}</h1>
          <ClinicalCitationBlock
            compact
            sources={lesson.sources}
            reviewedBy={lesson.reviewedBy}
            lastReviewed={reviewedDate}
          />
          <p className="mt-4 max-w-readable text-body-lg text-on-surface-variant">{lesson.description}</p>

          <div className="no-print mt-6 flex flex-wrap gap-3" aria-live="polite">
            <ButtonLink href="/learn" variant="secondary" icon={<ArrowLeft size={18} />}>
              {t("backToLessons")}
            </ButtonLink>
            {isComplete ? (
              <span
                role="status"
                className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-5 py-3 text-label-lg font-semibold text-secondary shadow-elevation-1"
              >
                <CheckCircle2 size={22} aria-hidden="true" />
                {t("lessonComplete")}
              </span>
            ) : (
              <Button
                type="button"
                icon={<CheckCircle2 size={18} />}
                loading={isSaving}
                onClick={onMarkComplete}
                className="disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? tCommon("loading") : t("markComplete")}
              </Button>
            )}
            {hasQuiz ? (
              <ButtonLink
                href={`/learn/${lessonId}/quiz`}
                variant="secondary"
                icon={<ArrowRight size={18} />}
              >
                {bestQuizScore !== null ? t("quizRetake") : t("takeQuiz")}
              </ButtonLink>
            ) : null}
            <PrintButton />
            <Button
              type="button"
              variant="secondary"
              icon={<Link2 size={16} />}
              onClick={handleCopyShare}
              aria-label={tCommon("copyLink")}
            >
              {tCommon("copyLink")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              icon={<Share2 size={16} />}
              onClick={handleShareOnX}
              aria-label={tCommon("shareOnX")}
            >
              {tCommon("shareOnX")}
            </Button>
          </div>
        </div>

        <div className="surface-card-strong overflow-hidden p-3 md:p-4">
          <LessonThumbnail
            image={lesson.image}
            imageAlt={lesson.imageAlt}
            categoryId={lesson.categoryId}
            title={lesson.title}
            className="min-h-[18rem] w-full rounded-[1.6rem]"
            priority
          />
        </div>
      </div>
    </section>
  );
}
