"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
import { formatRelativeDate, type Locale } from "@/lib/i18n";

type CompletedLesson = {
  lessonId: string;
  title: string;
  category: string;
  categoryId: string;
  completedAt: string;
  quizScore: number | null;
};

type PaginatedResult = {
  lessons: CompletedLesson[];
  total: number;
  page: number;
  totalPages: number;
};

interface CompletedLessonsListProps {
  completedLessons: PaginatedResult;
  locale: Locale;
}

export default function CompletedLessonsList({ completedLessons, locale }: CompletedLessonsListProps) {
  const t = useTranslations("progress");
  const page = completedLessons.page;

  return (
    <Reveal delay={0.1}>
      <section className="surface-card px-6 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow mb-3">{t("completedLessons")}</div>
            <h2 className="font-display text-headline-lg text-primary">{t("completedLessons")}</h2>
          </div>
          <span className="metric-pill">{t("pageXofY", { page, total: completedLessons.totalPages })}</span>
        </div>

        {completedLessons.lessons.length > 0 ? (
          <>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {completedLessons.lessons.map((lesson, index) => (
                <Reveal key={lesson.lessonId} delay={Math.min(index * 0.03, 0.16)}>
                  <article className="surface-card-glass px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/learn/${lesson.lessonId}`}
                          className="font-display text-headline-md text-primary underline-offset-4 hover:underline"
                        >
                          {lesson.title}
                        </Link>
                        <p className="mt-2 text-label-md text-on-surface-variant">
                          {lesson.category || lesson.categoryId}
                        </p>
                      </div>
                      {lesson.quizScore !== null ? (
                        <span className="chip-active">{lesson.quizScore}%</span>
                      ) : (
                        <span className="chip">{t("quizScoreColumn")}: -</span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-label-md text-on-surface-variant">
                      <span className="metric-pill">
                        {t("completedColumn")}: {formatRelativeDate(lesson.completedAt, locale)}
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            {completedLessons.totalPages > 1 ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                {page > 1 ? (
                  <Link href={`?page=${page - 1}`}>
                    <Button variant="secondary" size="sm" icon={<ArrowLeft size={16} />}>
                      {t("previous")}
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" size="sm" disabled icon={<ArrowLeft size={16} />}>
                    {t("previous")}
                  </Button>
                )}

                <span className="text-label-md text-on-surface-variant">
                  {t("pageXofY", { page, total: completedLessons.totalPages })}
                </span>

                {page < completedLessons.totalPages ? (
                  <Link href={`?page=${page + 1}`}>
                    <Button variant="secondary" size="sm" icon={<ArrowRight size={16} />}>
                      {t("next")}
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" size="sm" disabled icon={<ArrowRight size={16} />}>
                    {t("next")}
                  </Button>
                )}
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            variant="learning"
            title={t("completedLessons")}
            description={t("noCompletedLessons")}
            action={{ label: t("startLearningCta"), href: "/learn", onClick: () => {} }}
            className="mt-6"
          />
        )}
      </section>
    </Reveal>
  );
}
