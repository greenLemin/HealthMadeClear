import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  markLessonComplete as guestMarkLessonComplete,
  saveQuizAttempt as guestSaveQuizAttempt,
} from "@/lib/guestProgress";
import {
  handleLessonCompletionSideEffects,
  handleQuizAttemptSideEffects,
  type Callback,
} from "./sideEffects";
import type { QuizAttempts } from "./supabaseProgress";

export function useProgressMutations(
  user: User | null,
  supabase: ReturnType<typeof createClient>,
  showToast: Callback,
  supabaseCompletedLessonIds: string[],
  setSupabaseCompletedLessonIds: React.Dispatch<React.SetStateAction<string[]>>,
  setSupabaseQuizAttempts: React.Dispatch<React.SetStateAction<QuizAttempts>>,
  appStateMarkLessonComplete: (lessonId: string) => void,
  recordQuizScore: (lessonId: string, score: number, passed: boolean) => void,
  locale: string
) {
  const t = useTranslations("progress");
  const completedIdsRef = useRef(supabaseCompletedLessonIds);
  useEffect(() => {
    completedIdsRef.current = supabaseCompletedLessonIds;
  }, [supabaseCompletedLessonIds]);

  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      if (user) {
        // Optimistic update using ref to avoid stale closure on rapid double-complete
        const prev = completedIdsRef.current;
        const next = prev.includes(lessonId) ? prev : [...prev, lessonId];
        completedIdsRef.current = next;
        setSupabaseCompletedLessonIds(next);

        const { error } = await supabase.from("lesson_progress").upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lesson_id" }
        );
        if (error) {
          showToast("error", t("saveError"));
          const rolled = completedIdsRef.current.filter((id) => id !== lessonId);
          completedIdsRef.current = rolled;
          setSupabaseCompletedLessonIds(rolled);
        } else {
          await handleLessonCompletionSideEffects(supabase, user.id, lessonId, next, showToast, locale);
        }
      } else {
        guestMarkLessonComplete(lessonId);
        appStateMarkLessonComplete(lessonId);
      }
    },
    [user, supabase, showToast, appStateMarkLessonComplete, locale, setSupabaseCompletedLessonIds, t]
  );

  const saveQuizAttempt = useCallback(
    async (quizId: string, lessonId: string, score: number, maxScore: number, answers: number[]) => {
      const passed = score >= maxScore * 0.7;
      if (user) {
        // Optimistic update — keep best score via Math.max to avoid overwriting higher score with lower
        setSupabaseQuizAttempts((prev) => {
          const existing = prev[quizId];
          if (existing) {
            const bestScore = Math.max(existing.score, score);
            if (bestScore === existing.score) return prev;
            return {
              ...prev,
              [quizId]: { score: bestScore, maxScore, passed: bestScore >= maxScore * 0.7 },
            };
          }
          return { ...prev, [quizId]: { score, maxScore, passed } };
        });
        const { error } = await supabase.from("quiz_attempts").insert({
          user_id: user.id,
          quiz_id: quizId,
          score,
          max_score: maxScore,
          passed,
          answers,
        });
        if (error) {
          showToast("error", t("quizSaveError"));
        } else {
          // Use ref's current value for achievement counts to avoid stale closure
          const currentCompleted = completedIdsRef.current;
          const allCompleted = currentCompleted.includes(lessonId)
            ? currentCompleted
            : [...currentCompleted, lessonId];
          await handleQuizAttemptSideEffects(
            supabase,
            user.id,
            lessonId,
            score,
            maxScore,
            passed,
            allCompleted,
            showToast
          );
        }
      } else {
        guestSaveQuizAttempt(quizId, score, maxScore);
        recordQuizScore(lessonId, score, passed);
      }
    },
    [user, supabase, showToast, recordQuizScore, setSupabaseQuizAttempts, t]
  );

  return { markLessonComplete, saveQuizAttempt };
}
