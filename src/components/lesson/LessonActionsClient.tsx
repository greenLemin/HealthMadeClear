"use client";

import { useEffect } from "react";
import { CheckCircle2, Printer } from "lucide-react";
import Button from "@/components/ui/Button";
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
      <Button
        type="button"
        variant={isCompleted ? "secondary" : "primary"}
        icon={<CheckCircle2 size={18} />}
        onClick={() => toggleLessonComplete(lessonId)}
      >
        {isCompleted ? t("markIncomplete") : t("markComplete")}
      </Button>
      <Button type="button" variant="secondary" icon={<Printer size={18} />} onClick={() => window.print()}>
        {t("printLesson")}
      </Button>
    </div>
  );
}
