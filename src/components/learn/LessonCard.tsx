"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/components/AppProviders";
import { formatLevel, getCategoryLabel } from "@/lib/i18n";
import type { LessonListItem } from "@/types/lesson";
import { useTranslations } from "next-intl";

interface LessonCardProps {
  lesson: LessonListItem;
  isComplete?: boolean;
  progress?: number;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-secondary-container text-on-secondary-container",
  intermediate: "bg-tertiary-container/30 text-tertiary",
  advanced: "bg-primary-container text-on-primary-container",
};

export default function LessonCard({ lesson, isComplete = false }: LessonCardProps) {
  const { locale } = useAppState();
  const t = useTranslations("common");

  return (
    <Link
      href={`/learn/${lesson.id}`}
      className="group block overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="p-6 md:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-surface-container px-3 py-1 text-label-md font-semibold text-on-surface-variant">
            {getCategoryLabel(lesson.categoryId, locale)}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-label-md font-semibold ${
              difficultyColors[lesson.level] || difficultyColors.beginner
            }`}
          >
            {formatLevel(lesson.level, locale)}
          </span>
        </div>
        <h3 className="mb-2 text-headline-md text-primary group-hover:text-primary-container transition-colors">
          {lesson.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-body-md text-on-surface-variant">{lesson.description}</p>
        <div className="flex items-center justify-between text-label-md text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} aria-hidden="true" />
            {lesson.duration}
          </span>
          {isComplete ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-secondary">
              <CheckCircle2 size={16} />
              {t("completed")}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
