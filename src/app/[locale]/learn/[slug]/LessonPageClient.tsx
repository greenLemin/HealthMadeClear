"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import LessonHeader from "@/components/lesson/LessonHeader";
import LessonContentSections from "@/components/lesson/LessonContentSections";
import LessonNotes from "@/components/lesson/LessonNotes";
import LessonSidebar, { type SidebarContent } from "@/components/lesson/LessonSidebar";
import LessonNavigation from "@/components/lesson/LessonNavigation";
import LessonRelatedClient from "@/components/lesson/LessonRelatedClient";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import ButtonLink from "@/components/ui/ButtonLink";
import Reveal from "@/components/ui/Reveal";
import { ScrollSpyProvider } from "@/components/mdx/ScrollSpyProvider";
import { useAppState } from "@/components/AppProviders";
import { useProgress } from "@/hooks/useProgress";
import { useTranslations } from "next-intl";
import { formatReviewDate } from "@/lib/i18n";
import type { Lesson } from "@/types/lesson";
import type { LessonId } from "@/types/content";
import type { GlossaryTerm } from "@/types/glossary";
import type { LearningPath } from "@/types/learningPath";
import type { Quiz } from "@/types/quiz";

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
  allLessons,
  quiz,
  relatedLessons,
}: {
  lesson: Lesson;
  glossaryTerms: GlossaryTerm[];
  learningPaths?: LearningPath[];
  allLessons: Lesson[];
  quiz: Quiz | null;
  relatedLessons: Lesson[];
}) {
  const { locale } = useAppState();
  const { markLessonComplete, isLessonComplete, getQuizBestScore } = useProgress();
  const t = useTranslations("learn");
  const [isSaving, setIsSaving] = useState(false);
  const lessonId = lesson.id as LessonId;
  const sidebar = useSidebarContent(lesson, t);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isComplete = isLessonComplete(lessonId);
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

  // Pre-index lessons by ID for O(1) lookup
  const lessonMap = useMemo(() => new Map<string, Lesson>(allLessons.map((l) => [l.id, l])), [allLessons]);

  // Find prev/next lesson in learning path from server-passed allLessons
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!learningPaths) return { prevLesson: null, nextLesson: null };
    let path: LearningPath | undefined;
    let idx = -1;
    for (const p of learningPaths) {
      const foundIdx = p.lessons.indexOf(lessonId);
      if (foundIdx !== -1) {
        path = p;
        idx = foundIdx;
        break;
      }
    }
    if (!path) return { prevLesson: null, nextLesson: null };
    const prevId = idx > 0 ? path.lessons[idx - 1] : null;
    const nextId = idx < path.lessons.length - 1 ? path.lessons[idx + 1] : null;
    return {
      prevLesson: prevId ? (lessonMap.get(prevId) ?? null) : null,
      nextLesson: nextId ? (lessonMap.get(nextId) ?? null) : null,
    };
  }, [learningPaths, lessonId, lessonMap]);

  return (
    <>
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-1.5 will-change-[width] bg-primary transition-[width] duration-150 motion-reduce:transition-none"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("readingProgress")}
      />

      <div className="py-12 md:py-16">
        <div className="max-w-container mx-auto px-4 md:px-6">
          <LessonHeader
            lesson={lesson}
            locale={locale}
            reviewedDate={reviewedDate}
            isComplete={isComplete}
            isSaving={isSaving}
            onMarkComplete={handleMarkComplete}
            hasQuiz={hasQuiz}
            bestQuizScore={bestQuizScore}
            lessonId={lessonId}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
            <article ref={contentRef} className="min-w-0">
              <ScrollSpyProvider>
                <LessonContentSections sections={lesson.content.sections} glossaryTerms={glossaryTerms} />

                <LessonNotes lesson={lesson} reviewedDate={reviewedDate} />

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
                      <ButtonLink
                        href={`/learn/${lessonId}/quiz`}
                        className="mt-5"
                        icon={<ArrowRight size={18} />}
                      >
                        {bestQuizScore !== null ? t("quizRetake") : t("takeQuiz")}
                      </ButtonLink>
                    </div>
                  </Reveal>
                ) : null}

                <Reveal delay={0.14} className="mt-8">
                  <MedicalDisclaimer />
                </Reveal>

                <LessonNavigation prevLesson={prevLesson} nextLesson={nextLesson} />
              </ScrollSpyProvider>
            </article>

            <LessonSidebar sidebar={sidebar} title={lesson.sidebarTitle} />
          </div>

          <LessonRelatedClient relatedLessons={relatedLessons} />
        </div>
      </div>
    </>
  );
}
