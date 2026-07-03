import { BookOpen, CheckCircle2, Flame, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import { formatDuration } from "@/lib/i18n";
import type { Summary } from "../types";

type DashboardStatsProps = {
  summary: Summary;
  locale: string;
};

export default function DashboardStats({ summary, locale }: DashboardStatsProps) {
  const t = useTranslations("dashboard");

  const passRate =
    summary.totalQuizzesAttempted > 0
      ? Math.round((summary.totalQuizzesPassed / summary.totalQuizzesAttempted) * 100)
      : 0;

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card padding="sm" variant="glass">
        <div className="flex items-center gap-3">
          <div
            className="rounded-full bg-primary-fixed p-2.5 text-primary shadow-elevation-1"
            aria-hidden="true"
          >
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-headline-md text-primary">
              {summary.totalLessonsCompleted} / {summary.totalLessonsAvailable}
            </p>
            <p className="text-label-sm text-on-surface-variant">{t("completedLessons")}</p>
          </div>
        </div>
      </Card>
      <Card padding="sm" variant="glass">
        <div className="flex items-center gap-3">
          <div
            className="rounded-full bg-secondary-container/60 p-2.5 text-secondary shadow-elevation-1"
            aria-hidden="true"
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-headline-md text-primary">{summary.totalQuizzesPassed}</p>
            <p className="text-label-sm text-on-surface-variant">
              {summary.totalQuizzesAttempted > 0
                ? t("statsPassRate", { rate: passRate })
                : t("statsNoQuizzes")}
            </p>
          </div>
        </div>
      </Card>
      <Card padding="sm" variant="glass">
        <div className="flex items-center gap-3">
          <div
            className="rounded-full bg-tertiary-container/30 p-2.5 text-tertiary shadow-elevation-1"
            aria-hidden="true"
          >
            <Flame size={20} />
          </div>
          <div>
            <p className="text-headline-md text-primary">
              {t("statsStreakValue", { count: summary.currentStreak })}
            </p>
            <p className="text-label-sm text-on-surface-variant">{t("statsStreak")}</p>
          </div>
        </div>
      </Card>
      <Card padding="sm" variant="glass">
        <div className="flex items-center gap-3">
          <div
            className="rounded-full bg-surface-container p-2.5 text-primary shadow-elevation-1"
            aria-hidden="true"
          >
            <Clock size={20} />
          </div>
          <div>
            <p className="text-headline-md text-primary">
              {formatDuration(summary.totalTimeSpentMinutes, locale as "en" | "es")}
            </p>
            <p className="text-label-sm text-on-surface-variant">{t("statsTimeSpent")}</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
