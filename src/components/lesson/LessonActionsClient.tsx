"use client";

import { useEffect } from "react";
import { CheckCircle2, Printer } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import type { LessonId } from "@/types/content";
import { useTranslations } from "next-intl";

export default function LessonActionsClient({ lessonId }: { lessonId: LessonId }) {
  const { completedLessons, toggleLessonComplete, markLessonViewed } = useAppState();
  const t = useTranslations("learn");
  const isCompleted = completedLessons.has(lessonId);

  useEffect(() => {
    markLessonViewed(lessonId);
  }, [lessonId, markLessonViewed]);

  return (
    <div className="no-print mb-8 flex flex-wrap gap-3">
      <button
        type="button"
        className={
          isCompleted
            ? "btn-secondary inline-flex items-center gap-2"
            : "btn-primary inline-flex items-center gap-2"
        }
        onClick={() => toggleLessonComplete(lessonId)}
      >
        <CheckCircle2 size={18} />
        {isCompleted ? t("markIncomplete") : t("markComplete")}
      </button>
      <button
        type="button"
        className="btn-secondary inline-flex items-center gap-2"
        onClick={() => window.print()}
      >
        <Printer size={18} />
        {t("printLesson")}
      </button>
    </div>
  );
}
