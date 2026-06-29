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
      className="surface-card group block overflow-hidden px-6 py-6 transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-card-hover md:px-7 md:py-7"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="chip min-h-9 px-3 py-1 text-label-sm">
          {getCategoryLabel(lesson.categoryId, locale)}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-label-sm font-semibold ${
            difficultyColors[lesson.level] || difficultyColors.beginner
          }`}
        >
          {formatLevel(lesson.level, locale)}
        </span>
      </div>
      <h3 className="font-display text-headline-md text-primary transition-colors group-hover:text-primary-container">
        {lesson.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-body-md text-on-surface-variant">{lesson.description}</p>
      <div className="mt-5 flex items-center justify-between text-label-md text-on-surface-variant">
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
    </Link>
  );
}
