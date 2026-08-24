import { useCallback } from "react";
import type { QuizAttempts } from "./supabaseProgress";

export function useProgressQueries(completedLessonIdsSet: Set<string>, quizAttempts: QuizAttempts) {
  const isLessonComplete = useCallback(
    (lessonId: string) => completedLessonIdsSet.has(lessonId),
    [completedLessonIdsSet]
  );

  const getQuizBestScore = useCallback(
    (quizId: string) => {
      const attempt = quizAttempts[quizId];
      if (!attempt) return null;
      const maxScore = attempt.maxScore;
      if (!isFinite(maxScore) || maxScore <= 0) return null;
      return Math.round((attempt.score / maxScore) * 100);
    },
    [quizAttempts]
  );

  const getLearningPathProgress = useCallback(
    (lessonIds: string[]) => {
      const completed = lessonIds.filter((id) => completedLessonIdsSet.has(id)).length;
      const total = lessonIds.length;
      return {
        completed,
        total,
        percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      };
    },
    [completedLessonIdsSet]
  );

  return { isLessonComplete, getQuizBestScore, getLearningPathProgress };
}
