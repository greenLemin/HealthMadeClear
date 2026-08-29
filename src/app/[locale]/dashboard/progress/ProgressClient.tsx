"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, Flame, TrendingUp } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import ProgressBar from "@/components/ui/ProgressBar";
import Reveal from "@/components/ui/Reveal";
import { formatMemberSince, formatTimeSpentMinutes, type Locale } from "@/lib/i18n";
import type { Summary } from "@/types/dashboard";
import { clampPercent } from "./components/clamp";
import CategoryProgressList from "./components/CategoryProgressList";
import CompletedLessonsList from "./components/CompletedLessonsList";
import ProgressCircle from "./components/ProgressCircle";
import ProgressHeader from "./components/ProgressHeader";
import StreakCalendar from "./components/StreakCalendar";

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
  const tDash = useTranslations("dashboard");
  const timeSpentLabel = formatTimeSpentMinutes(
    summary.totalTimeSpentMinutes,
    locale,
    tDash("statsTimeSpentUnavailable")
  );
  const overallPct =
    summary.totalLessonsAvailable > 0
      ? clampPercent((summary.totalLessonsCompleted / summary.totalLessonsAvailable) * 100)
      : 0;

  const today = new Date().toISOString().split("T")[0]!;
  const activeSet = new Set(activeDays);
  const memberSinceLabel = memberSince
    ? t("memberSince", { date: formatMemberSince(memberSince, locale) })
    : null;
  const averageScore = summary.totalQuizzesAttempted > 0 ? `${clampPercent(summary.averageQuizScore)}%` : "-";
  const hasActivityToday = activeSet.has(today);

  return (
    <div className="space-y-10">
      <ProgressHeader summary={summary} memberSinceLabel={memberSinceLabel} />

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Reveal>
          <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
            <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
              <ProgressCircle
                percentage={overallPct}
                label={t("lessonsCompleted", {
                  count: summary.totalLessonsCompleted,
                  total: summary.totalLessonsAvailable,
                })}
              />
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
                  <span className="metric-pill">{timeSpentLabel}</span>
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
              value={timeSpentLabel}
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
        <CategoryProgressList categoryProgress={categoryProgress} />

        <Reveal delay={0.06}>
          <StreakCalendar
            activeDays={activeDays}
            currentStreak={summary.currentStreak}
            longestStreak={summary.longestStreak}
            hasActivityToday={hasActivityToday}
          />
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

      <CompletedLessonsList completedLessons={completedLessons} locale={locale} />
    </div>
  );
}
