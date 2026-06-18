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
import { ScrollSpyProvider } from "@/components/mdx/ScrollSpyProvider";
import { useAppState } from "@/components/AppProviders";
import { useProgress } from "@/hooks/useProgress";
import { useTranslations } from "next-intl";
import { formatLevel, getCategoryLabel } from "@/lib/i18n";
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
  const { locale, completedLessons } = useAppState();
  const { markLessonComplete, isLessonComplete, getQuizBestScore } = useProgress();
  const t = useTranslations("learn");
  const tCommon = useTranslations("common");
  const lessonId = lesson.id as LessonId;
  const sidebar = useSidebarContent(lesson, t);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isComplete = isLessonComplete(lessonId);
  const hasQuiz = useMemo(() => getQuizByLessonId(lesson.id, locale) !== null, [lesson.id, locale]);
  const bestQuizScore = getQuizBestScore(lessonId);

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
    await markLessonComplete(lessonId);
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
          {/* Breadcrumbs */}
          <nav
            className="mb-6 flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-primary transition-colors">
              {tCommon("back")}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/learn" className="hover:text-primary transition-colors">
              {tCommon("allTopics")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-on-surface">{lesson.title}</span>
          </nav>

          <div className="mb-6 flex flex-wrap items-center gap-3 text-label-md text-on-surface-variant">
            <span className="rounded-full bg-surface-container px-3 py-1">{lesson.duration}</span>
            <span className="rounded-full bg-surface-container px-3 py-1">
              {formatLevel(lesson.level, locale)}
            </span>
            <span className="rounded-full bg-surface-container px-3 py-1">
              {getCategoryLabel(lesson.categoryId, locale)}
            </span>
            {lesson.lastReviewed ? (
              <span className="rounded-full bg-surface-container px-3 py-1">
                {t("updatedOn", { date: lesson.lastReviewed })}
              </span>
            ) : null}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.55fr]">
            <article ref={contentRef}>
              <ScrollSpyProvider>
                <Link
                  href="/learn"
                  className="no-print mb-6 inline-flex items-center gap-2 text-label-md font-semibold text-primary"
                >
                  <ArrowLeft size={18} />
                  {t("backToLessons")}
                </Link>
                <h1 className="mb-4 text-headline-xl text-primary">{lesson.title}</h1>
                <p className="mb-8 max-w-3xl text-body-lg text-on-surface-variant">{lesson.description}</p>

                {/* Mark as Complete button */}
                <div className="no-print mb-8">
                  {isComplete ? (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-secondary-container px-6 py-3 text-label-lg font-semibold text-secondary">
                      <CheckCircle2 size={22} />
                      {t("lessonComplete")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMarkComplete}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      {t("markComplete")}
                    </button>
                  )}
                </div>

                <div className="mb-8 overflow-hidden rounded-lg border border-outline-variant">
                  <LessonThumbnail
                    image={lesson.image}
                    imageAlt={lesson.imageAlt}
                    categoryId={lesson.categoryId}
                    title={lesson.title}
                    className="min-h-48 w-full"
                    priority
                  />
                </div>

                <div className="space-y-8">
                  {lesson.content.sections.map((section, index) => (
                    <section key={section.title}>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-label-md font-bold text-primary">
                          {index + 1}
                        </div>
                        <h2 className="text-headline-md text-primary">{section.title}</h2>
                      </div>
                      <div className="whitespace-pre-line text-body-md text-on-surface-variant">
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
                  ))}
                </div>

                {/* Key Takeaways */}
                {lesson.sidebarTips && lesson.sidebarTips.length > 0 ? (
                  <div className="mt-10">
                    <KeyTakeaway title={t("keyTakeaways")}>
                      <ul className="list-disc space-y-2 pl-5">
                        {lesson.sidebarTips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </KeyTakeaway>
                  </div>
                ) : null}

                {lesson.lastReviewed ? (
                  <p className="mt-8 text-label-md text-on-surface-variant">
                    {t("lastReviewed")}: {lesson.lastReviewed}
                  </p>
                ) : null}
                {lesson.sources?.length ? (
                  <div className="mt-4 text-label-md text-on-surface-variant">
                    <div className="font-semibold text-primary">{t("sources")}</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {lesson.sources.map((source) => (
                        <li key={source}>{source}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Quiz CTA Card */}
                {hasQuiz ? (
                  <div className="no-print mt-10 rounded-2xl border border-primary bg-primary-fixed/20 p-6 md:p-8">
                    <h3 className="mb-2 text-headline-md text-primary">{t("quizCta")}</h3>
                    <p className="mb-4 text-body-md text-on-surface-variant">{t("quizSubtitle")}</p>
                    {bestQuizScore !== null ? (
                      <p className="mb-4 text-label-md text-on-surface-variant">
                        {t("quizBestScore", { score: bestQuizScore })}
                      </p>
                    ) : null}
                    <Link
                      href={`/learn/${lessonId}/quiz`}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      {bestQuizScore !== null ? t("quizRetake") : t("takeQuiz")}
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : null}

                <div className="mt-10">
                  <MedicalDisclaimer />
                </div>

                {/* Previous / Next lesson navigation */}
                {prevLesson || nextLesson ? (
                  <nav className="no-print mt-12 grid grid-cols-2 gap-4" aria-label={t("lessonNavigation")}>
                    {prevLesson ? (
                      <Link
                        href={`/learn/${prevLesson.id}`}
                        className="flex flex-col gap-1 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 transition-shadow hover:shadow-card-hover"
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
                        className="flex flex-col items-end gap-1 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 text-right transition-shadow hover:shadow-card-hover"
                      >
                        <span className="text-label-md text-on-surface-variant">{t("nextLesson")}</span>
                        <span className="text-headline-sm text-primary">{nextLesson.title}</span>
                      </Link>
                    ) : null}
                  </nav>
                ) : null}
              </ScrollSpyProvider>
            </article>

            <aside className="space-y-6">
              <div className="card sticky top-24">
                <h3 className="mb-3 text-headline-md text-primary">
                  {lesson.sidebarTitle || t("stillConfused")}
                </h3>
                <p className="mb-4 text-body-md text-on-surface-variant">{sidebar.body}</p>
                <ul className="space-y-3 text-body-md text-on-surface-variant">
                  {sidebar.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
                <p className="mt-4 text-label-md font-semibold text-primary">{sidebar.footer}</p>
              </div>
            </aside>
          </div>

          <LessonRelatedClient lessonId={lessonId} categoryId={lesson.categoryId} />
        </div>
      </div>
    </>
  );
}
