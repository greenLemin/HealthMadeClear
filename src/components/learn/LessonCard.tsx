"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import ResourceCard from "@/components/ui/ResourceCard";
import { formatLevel, getCategoryLabel } from "@/lib/i18n";
import type { LessonListItem } from "@/types/lesson";
import { useTranslations } from "next-intl";

interface LessonCardProps {
  lesson: LessonListItem;
  isComplete?: boolean;
  onNavigate?: () => void;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-secondary-container text-on-secondary-container",
  intermediate: "bg-tertiary-container/30 text-tertiary",
  advanced: "bg-primary-container text-on-primary-container",
};

export default function LessonCard({ lesson, isComplete = false, onNavigate }: LessonCardProps) {
  const { locale } = useAppState();
  const t = useTranslations("common");

  return (
    <ResourceCard
      href={`/learn/${lesson.id}`}
      title={lesson.title}
      description={lesson.description}
      onNavigate={onNavigate}
      header={
        <div className="flex flex-wrap items-center gap-2">
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
      }
      footer={
        <>
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
        </>
      }
    />
  );
}
