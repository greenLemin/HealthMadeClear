"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Flame, TrendingUp, type LucideIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/PageHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import Reveal from "@/components/ui/Reveal";
import { formatRelativeDate, formatMemberSince, formatDuration, type Locale } from "@/lib/i18n";

type Summary = {
  totalLessonsCompleted: number;
  totalLessonsAvailable: number;
  totalQuizzesPassed: number;
  totalQuizzesAttempted: number;
  averageQuizScore: number;
  totalTimeSpentMinutes: number;
  currentStreak: number;
  longestStreak: number;
};

type QuizPerfItem = {
  category: string;
  categoryId: string;
  attemptsCount: number;
  averageScore: number;
  passRate: number;
};

type CompletedLesson = {
  lessonId: string;
  title: string;
  category: string;
  categoryId: string;
  completedAt: string;
  quizScore: number | null;
};

type CategoryProgress = {
  categoryId: string;
  label: string;
  total: number;
  completed: number;
  quizStats: { attempts: number; passed: number };
};

type PaginatedResult = {
  lessons: CompletedLesson[];
  total: number;
  page: number;
  totalPages: number;
};

type ProgressClientProps = {
  summary: Summary;
  quizPerformance: QuizPerfItem[];
  completedLessons: PaginatedResult;
  activeDays: string[];
  categoryProgress: CategoryProgress[];
  memberSince: string;
  locale: Locale;
};

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "surface-card",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string | null;
  tone?: string;
}) {
  return (
    <div className={`${tone} px-5 py-5 md:px-6 md:py-6`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-elevation-1">
        <Icon size={22} aria-hidden="true" />
      </div>
      <p className="mt-4 text-label-md text-on-surface-variant">{label}</p>
      <p className="mt-2 font-display text-headline-md text-primary">{value}</p>
      {detail ? <p className="mt-2 text-label-md text-on-surface-variant">{detail}</p> : null}
    </div>
  );
}

export default function ProgressClient({
  summary,
  quizPerformance,
  completedLessons,
  activeDays,
  categoryProgress,
  memberSince,
  locale,
}: ProgressClientProps) {
  const t = useTranslations("progress");
  const page = completedLessons.page;
  const overallPct =
    summary.totalLessonsAvailable > 0
      ? clampPercent((summary.totalLessonsCompleted / summary.totalLessonsAvailable) * 100)
      : 0;

  const today = new Date().toISOString().split("T")[0];
  const activeSet = new Set(activeDays);
  const memberSinceLabel = memberSince
    ? t("memberSince", { date: formatMemberSince(memberSince, locale) })
    : null;
  const averageScore = summary.totalQuizzesAttempted > 0 ? `${clampPercent(summary.averageQuizScore)}%` : "-";

  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const hasActivityToday = activeSet.has(today);

  return (
    <div className="space-y-10">
      <PageHeader
        centered
        title={t("title")}
        description={t("lessonsCompleted", {
          count: summary.totalLessonsCompleted,
          total: summary.totalLessonsAvailable,
        })}
      >
        <div className="flex flex-wrap justify-center gap-3">
          {memberSinceLabel ? <span className="metric-pill">{memberSinceLabel}</span> : null}
          <span className="metric-pill bg-secondary-container/60 text-secondary">
            {t("quizzesPassedColumn")}: {summary.totalQuizzesPassed}/{summary.totalQuizzesAttempted}
          </span>
          <span className="metric-pill bg-tertiary-container/60 text-tertiary">
            {t("currentStreak")}: {t("daysValue", { count: summary.currentStreak })}
          </span>
        </div>
      </PageHeader>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Reveal>
          <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
            <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
              <div
                className="mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-full bg-surface shadow-elevation-2"
                role="img"
                aria-label={t("lessonsCompleted", {
                  count: summary.totalLessonsCompleted,
                  total: summary.totalLessonsAvailable,
                })}
              >
                <div className="relative flex h-44 w-44 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-surface-container"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${overallPct * 2.64} 264`}
                      strokeLinecap="round"
                      className="text-secondary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-display text-headline-lg text-primary">{overallPct}%</span>
                    <span className="text-label-md text-on-surface-variant">{t("overallProgress")}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="eyebrow mb-4">{t("overallProgress")}</div>
                <h2 className="font-display text-headline-lg text-primary">
                  {t("lessonsCompleted", {
                    count: summary.totalLessonsCompleted,
                    total: summary.totalLessonsAvailable,
                  })}
                </h2>
                <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">
                  {memberSinceLabel ?? t("streakCalendarCaption")}
                </p>
                <ProgressBar
                  value={overallPct}
                  label={t("lessonsCompleted", {
                    count: summary.totalLessonsCompleted,
                    total: summary.totalLessonsAvailable,
                  })}
                  showPercentage
                  className="mt-6"
                />
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="metric-pill">{formatDuration(summary.totalTimeSpentMinutes, locale)}</span>
                  <span className="metric-pill bg-secondary-container/60 text-secondary">
                    {t("avgQuizScoreColumn")}: {averageScore}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              icon={Clock}
              label={t("totalTime")}
              value={formatDuration(summary.totalTimeSpentMinutes, locale)}
              detail={memberSinceLabel}
            />
            <MetricCard
              icon={CheckCircle2}
              label={t("quizzesPassedColumn")}
              value={`${summary.totalQuizzesPassed}/${summary.totalQuizzesAttempted}`}
              detail={t("lessonsValue", { count: summary.totalLessonsCompleted })}
              tone="surface-card-muted"
            />
            <MetricCard
              icon={TrendingUp}
              label={t("avgQuizScoreColumn")}
              value={averageScore}
              detail={t("attemptsLabel", { count: summary.totalQuizzesAttempted })}
              tone="surface-card-muted"
            />
            <MetricCard
              icon={Flame}
              label={t("currentStreak")}
              value={t("daysValue", { count: summary.currentStreak })}
              detail={t("longestStreak", { count: summary.longestStreak })}
            />
          </div>
        </Reveal>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
        <Reveal>
          <div className="surface-card px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="eyebrow mb-3">{t("progressByCategory")}</div>
                <h2 className="font-display text-headline-lg text-primary">{t("progressByCategory")}</h2>
              </div>
              <span className="metric-pill">{t("categoriesCount", { count: categoryProgress.length })}</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {categoryProgress.map((cat) => {
                const pct = cat.total > 0 ? clampPercent((cat.completed / cat.total) * 100) : 0;
                return (
                  <article key={cat.categoryId} className="surface-card-muted px-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-headline-md text-primary">
                        {cat.label || cat.categoryId}
                      </h3>
                      <span className="chip-active">{pct}%</span>
                    </div>
                    <ProgressBar value={pct} label={`${cat.completed}/${cat.total}`} className="mt-4" />
                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="metric-pill">
                        {t("lessonsColumn")}: {cat.completed}/{cat.total}
                      </span>
                      <span className="metric-pill bg-secondary-container/60 text-secondary">
                        {t("quizzesPassedColumn")}: {cat.quizStats.passed}/{cat.quizStats.attempts}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
            <div className="eyebrow mb-3">{t("streakHistory")}</div>
            <h2 className="font-display text-headline-lg text-primary">{t("last30Days")}</h2>
            <p className="mt-3 text-body-md text-on-surface-variant">
              {hasActivityToday ? t("activeLabel") : t("keepStreakAlive")}
            </p>

            <div className="mt-6 flex items-center gap-4 rounded-[1.5rem] bg-surface px-5 py-5 shadow-elevation-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tertiary-container/55 text-tertiary">
                <Flame size={26} aria-hidden="true" />
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant">{t("currentStreak")}</p>
                <p className="font-display text-headline-md text-primary">
                  {t("daysValue", { count: summary.currentStreak })}
                </p>
                <p className="text-label-md text-on-surface-variant">
                  {t("longestStreak", { count: summary.longestStreak })}
                </p>
              </div>
            </div>

            <ul className="mt-6 grid grid-cols-10 gap-1.5" aria-label={t("streakCalendarCaption")}>
              {calendarDays.map((dateStr) => {
                const isActive = activeSet.has(dateStr);
                const isToday = dateStr === today;
                return (
                  <li
                    key={dateStr}
                    className={[
                      "aspect-square rounded-md",
                      isActive ? "bg-secondary shadow-elevation-1" : "bg-surface-container",
                      isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent" : "",
                    ].join(" ")}
                  >
                    <span className="sr-only">
                      {isActive
                        ? t("activeDayLabel", { date: dateStr })
                        : t("inactiveDayLabel", { date: dateStr })}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex flex-wrap gap-3 text-label-md text-on-surface-variant">
              <span className="metric-pill">
                <span className="inline-block h-3 w-3 rounded-sm bg-secondary" aria-hidden="true" />{" "}
                {t("activeLabel")}
              </span>
              <span className="metric-pill">
                <span className="inline-block h-3 w-3 rounded-sm bg-surface-container" aria-hidden="true" />{" "}
                {t("inactiveLabel")}
              </span>
            </div>

            {!hasActivityToday ? (
              <p className="mt-4 text-label-md font-semibold text-primary">{t("keepStreakAlive")}</p>
            ) : null}
          </div>
        </Reveal>
      </section>

      {quizPerformance.length > 0 ? (
        <Reveal delay={0.08}>
          <section className="surface-card-glass px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="eyebrow mb-3">{t("quizPerformance")}</div>
                <h2 className="font-display text-headline-lg text-primary">{t("quizPerformance")}</h2>
              </div>
              <span className="metric-pill bg-secondary-container/60 text-secondary">
                {t("trackedAreasCount", { count: quizPerformance.length })}
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              {quizPerformance.map((item) => (
                <article key={item.categoryId} className="surface-card px-5 py-5 md:px-6 md:py-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-headline-md text-primary">{item.category}</h3>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <span className="metric-pill">
                          {t("attemptsLabel", { count: item.attemptsCount })}
                        </span>
                        <span className="metric-pill bg-secondary-container/60 text-secondary">
                          {t("passRateLabel", { rate: item.passRate })}
                        </span>
                      </div>
                    </div>
                    <div className="w-full max-w-sm">
                      <ProgressBar
                        value={clampPercent(item.averageScore)}
                        label={t("avgQuizScoreColumn")}
                        showPercentage
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </Reveal>
      ) : null}

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
    </div>
  );
}
