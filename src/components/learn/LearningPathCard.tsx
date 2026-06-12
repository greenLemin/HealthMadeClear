"use client";

import { Clock, ListChecks } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/components/AppProviders";
import { formatLevel } from "@/lib/i18n";
import ProgressBar from "@/components/ui/ProgressBar";
import type { LearningPath } from "@/types/learningPath";
import type { LessonListItem } from "@/types/lesson";
import { getLessonsByPath } from "@/lib/content";
import { useTranslations } from "next-intl";

interface LearningPathCardProps {
  path: LearningPath;
  lessons: LessonListItem[];
  progress?: { completed: number; total: number; percentage: number };
}

export default function LearningPathCard({ path, lessons, progress }: LearningPathCardProps) {
  const { locale, completedLessons } = useAppState();
  const t = useTranslations("paths");
  const tCommon = useTranslations("common");

  const pathLessons = getLessonsByPath(path.id, lessons, [path]);
  const pathProgress =
    progress ||
    (() => {
      const completed = pathLessons.filter((l) => completedLessons.includes(l.id)).length;
      const total = pathLessons.length;
      return {
        completed,
        total,
        percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      };
    })();

  const allDone = pathProgress.completed === pathProgress.total && pathProgress.total > 0;
  const isStarted = pathProgress.completed > 0;
  const nextLesson = pathLessons.find((l) => !completedLessons.includes(l.id)) ?? pathLessons[0];

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card md:p-8">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {path.icon ? (
          <span className="text-headline-lg" aria-hidden="true">
            {path.icon}
          </span>
        ) : null}
        <span className="rounded-full bg-surface-container px-3 py-1 text-label-md font-semibold text-on-surface-variant">
          {formatLevel(path.level, locale)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant">
          <Clock size={14} aria-hidden="true" />
          {path.duration}
        </span>
      </div>

      <h3 className="mb-2 text-headline-lg text-primary">{path.title}</h3>
      <p className="mb-4 text-body-md text-on-surface-variant">{path.description}</p>

      <div className="mb-4 flex items-center gap-2 text-label-md text-on-surface-variant">
        <ListChecks size={16} aria-hidden="true" />
        <span>
          {pathLessons.length} {tCommon("modules")}
        </span>
      </div>

      {pathProgress.total > 0 ? (
        <div className="mb-5">
          <ProgressBar
            value={pathProgress.percentage}
            label={`${pathProgress.completed} of ${pathProgress.total} complete`}
            showPercentage
            size="sm"
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        {allDone ? (
          <span className="inline-flex items-center gap-1.5 text-label-md font-semibold text-secondary">
            {tCommon("completed")} ✓
          </span>
        ) : (
          <Link
            href={nextLesson ? `/learn/${nextLesson.id}` : "/learning-paths"}
            className="btn-primary inline-flex items-center gap-2 text-label-lg"
          >
            {isStarted ? t("continue") : t("startPath")}
          </Link>
        )}
      </div>
    </div>
  );
}
