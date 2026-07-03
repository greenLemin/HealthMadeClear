import { Link } from "@/i18n/navigation";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import EmptyState from "@/components/ui/EmptyState";
import { formatRelativeDate } from "@/lib/i18n";
import type { ActivityItem, RecommendedLesson } from "../types";

type RecentActivityProps = {
  recentActivity: ActivityItem[];
  recommendedNext: RecommendedLesson | null;
  locale: string;
};

export default function RecentActivity({ recentActivity, recommendedNext, locale }: RecentActivityProps) {
  const t = useTranslations("dashboard");

  return (
    <section>
      <h2 className="mb-4 font-display text-headline-md text-primary">{t("recentActivity")}</h2>
      {recentActivity.length > 0 ? (
        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <div
              key={`${item.type}-${item.lessonId ?? item.quizId}-${i}`}
              className="surface-card flex items-start gap-3 px-4 py-4"
            >
              <div
                className={`mt-0.5 rounded-full p-1.5 shadow-elevation-1 ${
                  item.type === "lesson"
                    ? "bg-primary-fixed text-primary"
                    : "bg-secondary-container/60 text-secondary"
                }`}
                aria-hidden="true"
              >
                {item.type === "lesson" ? <BookOpen size={16} /> : <CheckCircle2 size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-label-md text-on-surface">{item.title}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {item.type === "quiz" && item.score !== undefined
                    ? item.passed
                      ? t("quizResultPassed", { score: item.score })
                      : t("quizResultFailed", { score: item.score })
                    : null}
                  <span className="ml-2">{formatRelativeDate(item.completedAt, locale as "en" | "es")}</span>
                </p>
              </div>
              {item.lessonId ? (
                <Link
                  href={`/learn/${item.lessonId}`}
                  className="shrink-0 text-label-sm font-semibold text-primary underline underline-offset-2"
                  aria-label={`${t("viewDetails")}: ${item.title}`}
                >
                  {t("viewDetails")}
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          variant="activity"
          title={t("noActivity")}
          description={t("noActivityDesc")}
          action={{
            label: t("startFirstLessonCta"),
            onClick: () => {},
            href: recommendedNext ? `/learn/${recommendedNext.id}` : "/learn",
          }}
        />
      )}
    </section>
  );
}
