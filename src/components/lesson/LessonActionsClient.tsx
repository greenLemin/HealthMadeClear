"use client";

import { useEffect } from "react";
import { CheckCircle2, Printer } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import { getMessages } from "@/lib/i18n";
import type { LessonId } from "@/types/content";

export default function LessonActionsClient({ lessonId }: { lessonId: LessonId }) {
  const { completedLessons, locale, toggleLessonComplete, markLessonViewed } = useAppState();
  const copy = getMessages(locale);
  const isCompleted = completedLessons.includes(lessonId);

  useEffect(() => {
    markLessonViewed(lessonId);
  }, [lessonId, markLessonViewed]);

  return (
    <div className="no-print mb-8 flex flex-wrap gap-3">
      <button
        type="button"
        className={isCompleted ? "btn-secondary inline-flex items-center gap-2" : "btn-primary inline-flex items-center gap-2"}
        onClick={() => toggleLessonComplete(lessonId)}
      >
        <CheckCircle2 size={18} />
        {isCompleted ? copy.learn.markIncomplete : copy.learn.markComplete}
      </button>
      <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => window.print()}>
        <Printer size={18} />
        {copy.learn.printLesson}
      </button>
    </div>
  );
}
