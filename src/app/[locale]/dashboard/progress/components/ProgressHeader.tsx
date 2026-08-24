"use client";

import { useTranslations } from "next-intl";
import PageHeader from "@/components/PageHeader";
import type { Summary } from "@/types/dashboard";

interface ProgressHeaderProps {
  summary: Summary;
  memberSinceLabel: string | null;
}

export default function ProgressHeader({ summary, memberSinceLabel }: ProgressHeaderProps) {
  const t = useTranslations("progress");

  return (
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
  );
}
