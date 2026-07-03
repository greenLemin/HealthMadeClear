import { Link } from "@/i18n/navigation";
import { Clock, ListChecks } from "lucide-react";
import { useTranslations } from "next-intl";
import ButtonLink from "@/components/ui/ButtonLink";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import type { LearningPathEntry } from "../types";

type LearningPathsProps = {
  inProgressPaths: LearningPathEntry[];
};

export default function LearningPaths({ inProgressPaths }: LearningPathsProps) {
  const t = useTranslations("dashboard");

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-display text-headline-md text-primary">{t("myLearningPaths")}</h2>
        <Link
          href="/learning-paths"
          className="text-label-md font-semibold text-primary underline underline-offset-2"
        >
          {t("browseAllPaths")} &rarr;
        </Link>
      </div>
      {inProgressPaths.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {inProgressPaths.slice(0, 4).map((entry) => (
            <div key={entry.path.id} className="surface-card px-6 py-6 md:px-8 md:py-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {entry.path.icon ? (
                  <span className="text-headline-lg" aria-hidden="true">
                    {entry.path.icon}
                  </span>
                ) : null}
                <span className="chip min-h-9 px-3 py-1 text-label-sm">{entry.path.level}</span>
                <span className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant">
                  <Clock size={14} aria-hidden="true" />
                  {entry.path.duration}
                </span>
              </div>
              <h3 className="mb-2 font-display text-headline-lg text-primary">{entry.path.title}</h3>
              <p className="mb-4 text-body-md text-on-surface-variant">{entry.path.description}</p>
              <div className="mb-4 flex items-center gap-2 text-label-md text-on-surface-variant">
                <ListChecks size={16} aria-hidden="true" />
                <span>{t("modulesCount", { count: entry.path.lessons.length })}</span>
              </div>
              <div className="mb-5">
                <ProgressBar
                  value={entry.progressPercentage}
                  label={t("completeLabel", {
                    completed: entry.completedLessonIds.length,
                    total: entry.path.lessons.length,
                  })}
                  showPercentage
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                {entry.isComplete ? (
                  <span className="inline-flex items-center gap-1.5 text-label-md font-semibold text-secondary">
                    {t("completedLabel")} ✓
                  </span>
                ) : entry.nextLesson ? (
                  <ButtonLink href={`/learn/${entry.nextLesson.id}`} className="text-label-lg">
                    {t("continueCta")}
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          variant="learning"
          title={t("noPathsStarted")}
          description={t("noPathsStartedDesc")}
          action={{
            label: t("explorePathsCta"),
            onClick: () => {},
            href: "/learning-paths",
          }}
        />
      )}
    </section>
  );
}
