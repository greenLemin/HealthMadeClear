"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import LessonThumbnail from "@/components/LessonThumbnail";
import { Link } from "@/i18n/navigation";
import LessonRelatedClient from "@/components/lesson/LessonRelatedClient";
import Callout from "@/components/Callout";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
import KeyTakeaway from "@/components/ui/KeyTakeaway";
import Reveal from "@/components/ui/Reveal";
import { ScrollSpyProvider } from "@/components/mdx/ScrollSpyProvider";
import { useAppState } from "@/components/AppProviders";
import { useProgress } from "@/hooks/useProgress";
import { useTranslations } from "next-intl";
import { formatLevel, formatReviewDate, getCategoryLabel } from "@/lib/i18n";
import { getLessons } from "@/lib/localizedContent";
import { getQuizByLessonId } from "@/lib/localizedQuiz";
import type { Lesson } from "@/types/lesson";
import type { LessonId } from "@/types/content";
import type { GlossaryTerm } from "@/types/glossary";
import type { LearningPath } from "@/types/learningPath";

type SidebarContent = {
  body: string;
  tips: string[];
  footer: string;
};

function useSidebarContent(lesson: Lesson, t: ReturnType<typeof useTranslations<"learn">>): SidebarContent {
  if (lesson.sidebarTips) {
    return { body: t("sidebarBody"), tips: lesson.sidebarTips, footer: t("pharmacistTip") };
  }
  if (lesson.categoryId === "doctor-visits") {
    return {
      body: t("sidebarBodyDoctor"),
      tips: [
        t("tipDoctorAppointmentTime"),
        t("tipDoctorInsurance"),
        t("tipDoctorQuestions"),
        t("tipDoctorMeds"),
      ],
      footer: t("doctorTip"),
    };
  }
  if (lesson.categoryId === "lab-results") {
    return {
      body: t("sidebarBodyLabs"),
      tips: [t("tipLabsFasting"), t("tipLabsHydration"), t("tipLabsComfort"), t("tipLabsResults")],
      footer: t("labsTip"),
    };
  }
  return {
    body: t("sidebarBody"),
    tips: [t("tipCheckName"), t("tipReadDose"), t("tipWarnings"), t("tipMissedDose")],
    footer: t("pharmacistTip"),
  };
}

export default function LessonPageClient({
  lesson,
  glossaryTerms,
  learningPaths,
}: {
  lesson: Lesson;
  glossaryTerms: GlossaryTerm[];
  learningPaths?: LearningPath[];
}) {
  const { locale } = useAppState();
  const { markLessonComplete, isLessonComplete, getQuizBestScore } = useProgress();
  const t = useTranslations("learn");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const [isSaving, setIsSaving] = useState(false);
  const lessonId = lesson.id as LessonId;
  const sidebar = useSidebarContent(lesson, t);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isComplete = isLessonComplete(lessonId);
  const quiz = useMemo(() => getQuizByLessonId(lesson.id, locale), [lesson.id, locale]);
  const hasQuiz = quiz !== null;
  const bestQuizScore = quiz ? getQuizBestScore(quiz.id) : null;
  const reviewedDate = lesson.lastReviewed ? formatReviewDate(lesson.lastReviewed, locale) : null;

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { top, height } = contentRef.current.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      const scrolled = -top;
      const progress = scrollable > 0 ? Math.min(100, Math.max(0, (scrolled / scrollable) * 100)) : 100;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMarkComplete = useCallback(async () => {
    setIsSaving(true);
    try {
      await markLessonComplete(lessonId);
    } finally {
      setIsSaving(false);
    }
  }, [markLessonComplete, lessonId]);

  // Find prev/next lesson in learning path
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!learningPaths) return { prevLesson: null, nextLesson: null };
    const allLessons = getLessons(locale);
    const path = learningPaths.find((p) => p.lessons.includes(lessonId));
    if (!path) return { prevLesson: null, nextLesson: null };
    const idx = path.lessons.indexOf(lessonId);
    const prevId = idx > 0 ? path.lessons[idx - 1] : null;
    const nextId = idx < path.lessons.length - 1 ? path.lessons[idx + 1] : null;
    return {
      prevLesson: prevId ? (allLessons.find((l) => l.id === prevId) ?? null) : null,
      nextLesson: nextId ? (allLessons.find((l) => l.id === nextId) ?? null) : null,
    };
  }, [learningPaths, locale, lessonId]);

  return (
    <>
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-1 bg-primary transition-all duration-150 motion-reduce:transition-none"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("readingProgress")}
      />

      <div className="py-12 md:py-16">
        <div className="max-w-container mx-auto px-4 md:px-6">
          <section className="section-frame px-6 py-6 md:px-8 md:py-8">
            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div>
                <nav aria-label="Breadcrumb">
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
                  {reviewedDate ? (
                    <span className="chip">{t("updatedOn", { date: reviewedDate })}</span>
                  ) : null}
                </div>

                <h1 className="mt-5 font-display text-headline-xl text-primary">{lesson.title}</h1>
                <p className="mt-4 max-w-readable text-body-lg text-on-surface-variant">
                  {lesson.description}
                </p>

                <div className="no-print mt-6 flex flex-wrap gap-3" aria-live="polite">
                  <Link href="/learn" className="btn-secondary inline-flex items-center gap-2">
                    <ArrowLeft size={18} />
                    {t("backToLessons")}
                  </Link>
                  {isComplete ? (
                    <span
                      role="status"
                      className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-5 py-3 text-label-lg font-semibold text-secondary shadow-elevation-1"
                    >
                      <CheckCircle2 size={22} aria-hidden="true" />
                      {t("lessonComplete")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMarkComplete}
                      disabled={isSaving}
                      aria-busy={isSaving || undefined}
                      className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 size={18} aria-hidden="true" />
                      {isSaving ? tCommon("loading") : t("markComplete")}
                    </button>
                  )}
                  {hasQuiz ? (
                    <Link
                      href={`/learn/${lessonId}/quiz`}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      {bestQuizScore !== null ? t("quizRetake") : t("takeQuiz")}
                      <ArrowRight size={18} />
                    </Link>
                  ) : null}
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

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
            <article ref={contentRef} className="min-w-0">
              <ScrollSpyProvider>
                <div className="space-y-6">
                  {lesson.content.sections.map((section, index) => (
                    <Reveal key={section.title} delay={Math.min(index * 0.04, 0.18)}>
                      <section className="surface-card px-6 py-6 md:px-8 md:py-8">
                        <div className="mb-4 flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-label-md font-bold text-primary shadow-elevation-1"
                            aria-hidden="true"
                          >
                            {index + 1}
                          </div>
                          <h2 className="font-display text-headline-md text-primary">{section.title}</h2>
                        </div>
                        <div className="max-w-[70ch] whitespace-pre-line text-body-md text-on-surface-variant">
                          <MarkdownRenderer text={section.content} glossaryTerms={glossaryTerms} />
                        </div>
                        {section.callouts?.map((callout, calloutIndex) => (
                          <Callout
                            key={`${section.title}-${calloutIndex}`}
                            type={callout.type}
                            className="mt-4"
                          >
                            {callout.content}
                          </Callout>
                        ))}
                      </section>
                    </Reveal>
                  ))}
                </div>

                {lesson.sidebarTips && lesson.sidebarTips.length > 0 ? (
                  <Reveal delay={0.08} className="mt-8">
                    <div className="surface-card-muted px-6 py-6 md:px-8">
                      <KeyTakeaway title={t("keyTakeaways")}>
                        <ul className="list-disc space-y-2 pl-5">
                          {lesson.sidebarTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </KeyTakeaway>
                    </div>
                  </Reveal>
                ) : null}

                {lesson.lastReviewed || lesson.sources?.length ? (
                  <Reveal delay={0.1} className="mt-8">
                    <div className="surface-card-muted px-6 py-6 md:px-8">
                      {reviewedDate ? (
                        <p className="text-label-md text-on-surface-variant">
                          {t("lastReviewed")}: {reviewedDate}
                        </p>
                      ) : null}
                      {lesson.sources?.length ? (
                        <div className={reviewedDate ? "mt-4" : ""}>
                          <div className="font-semibold text-primary">{t("sources")}</div>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-label-md text-on-surface-variant">
                            {lesson.sources.map((source) => (
                              <li key={source}>{source}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </Reveal>
                ) : null}

                {hasQuiz ? (
                  <Reveal delay={0.12} className="mt-8 no-print">
                    <div className="surface-card-glass px-6 py-6 md:px-8 md:py-8">
                      <div className="eyebrow mb-3">{t("quizCta")}</div>
                      <h3 className="font-display text-headline-md text-primary">{t("quizSubtitle")}</h3>
                      {bestQuizScore !== null ? (
                        <p className="mt-3 text-label-md text-on-surface-variant">
                          {t("quizBestScore", { score: bestQuizScore })}
                        </p>
                      ) : null}
                      <Link
                        href={`/learn/${lessonId}/quiz`}
                        className="btn-primary mt-5 inline-flex items-center gap-2"
                      >
                        {bestQuizScore !== null ? t("quizRetake") : t("takeQuiz")}
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </Reveal>
                ) : null}

                <Reveal delay={0.14} className="mt-8">
                  <MedicalDisclaimer />
                </Reveal>

                {prevLesson || nextLesson ? (
                  <Reveal delay={0.16} className="mt-10 no-print">
                    <nav className="grid grid-cols-2 gap-4" aria-label={t("lessonNavigation")}>
                      {prevLesson ? (
                        <Link
                          href={`/learn/${prevLesson.id}`}
                          className="surface-card flex flex-col gap-1 px-5 py-5 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-card-hover"
                        >
                          <span className="text-label-md text-on-surface-variant">{t("previousLesson")}</span>
                          <span className="text-headline-sm text-primary">{prevLesson.title}</span>
                        </Link>
                      ) : (
                        <div />
                      )}
                      {nextLesson ? (
                        <Link
                          href={`/learn/${nextLesson.id}`}
                          className="surface-card flex flex-col items-end gap-1 px-5 py-5 text-right transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-card-hover"
                        >
                          <span className="text-label-md text-on-surface-variant">{t("nextLesson")}</span>
                          <span className="text-headline-sm text-primary">{nextLesson.title}</span>
                        </Link>
                      ) : null}
                    </nav>
                  </Reveal>
                ) : null}
              </ScrollSpyProvider>
            </article>

            <Reveal delay={0.08}>
              <aside className="space-y-6">
                <div className="surface-card-glass sticky top-24 px-5 py-5 md:px-6">
                  <h3 className="font-display text-headline-md text-primary">
                    {lesson.sidebarTitle || t("stillConfused")}
                  </h3>
                  <p className="mt-3 text-body-md text-on-surface-variant">{sidebar.body}</p>
                  <ul className="mt-5 space-y-3 text-body-md text-on-surface-variant">
                    {sidebar.tips.map((tip, index) => (
                      <li key={tip} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-label-md font-semibold text-primary">
                          {index + 1}
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-label-md font-semibold text-primary">{sidebar.footer}</p>
                </div>
              </aside>
            </Reveal>
          </div>

          <LessonRelatedClient lessonId={lessonId} categoryId={lesson.categoryId} />
        </div>
      </div>
    </>
  );
}
