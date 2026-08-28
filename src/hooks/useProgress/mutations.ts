import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  markLessonComplete as guestMarkLessonComplete,
  saveQuizAttempt as guestSaveQuizAttempt,
} from "@/lib/guestProgress";
import { isQuizPassed, normalizeStoredScore, toPercent } from "@/lib/quizScore";
import { QUIZ_ATTEMPTS_ON_CONFLICT } from "@/lib/supabase/schema";
import { isAuthSessionError } from "@/lib/auth/isAuthSessionError";
import {
  handleLessonCompletionSideEffects,
  handleQuizAttemptSideEffects,
  type Callback,
  type LocalizeAchievement,
  type ProgressCopy,
} from "./sideEffects";
import type { QuizAttempts } from "./supabaseProgress";

export function useProgressMutations(
  user: User | null,
  supabase: ReturnType<typeof createClient>,
  showToast: Callback,
  supabaseCompletedLessonIds: string[],
  setSupabaseCompletedLessonIds: React.Dispatch<React.SetStateAction<string[]>>,
  supabaseQuizAttempts: QuizAttempts,
  setSupabaseQuizAttempts: React.Dispatch<React.SetStateAction<QuizAttempts>>,
  appStateMarkLessonComplete: (lessonId: string) => void,
  recordQuizScore: (lessonId: string, score: number, passed: boolean) => void,
  locale: string
) {
  const tProgress = useTranslations("progress");
  const tAchievements = useTranslations("achievements");

  const completedIdsRef = useRef(supabaseCompletedLessonIds);
  useEffect(() => {
    completedIdsRef.current = supabaseCompletedLessonIds;
  }, [supabaseCompletedLessonIds]);

  const quizAttemptsRef = useRef(supabaseQuizAttempts);
  useEffect(() => {
    quizAttemptsRef.current = supabaseQuizAttempts;
  }, [supabaseQuizAttempts]);

  const localizeAchievement: LocalizeAchievement = useCallback(
    (id: string) => {
      const title = tAchievements(`items.${id}.title` as never);
      const description = tAchievements(`items.${id}.description` as never);
      const unlocked = tAchievements("unlocked", { title });
      return { title, description, unlocked };
    },
    [tAchievements]
  );

  const progressCopy: ProgressCopy = useMemo(
    () => ({
      pathAlmostThereTitle: tProgress("pathAlmostThereTitle"),
      pathAlmostThereBody: (title: string) => tProgress("pathAlmostThere", { title }),
      streakMilestoneTitle: (count: number) => tProgress("streakMilestoneTitle", { count }),
      streakMilestoneBody: (count: number) => tProgress("streakMilestoneBody", { count }),
    }),
    [tProgress]
  );

  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      if (user) {
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
          const message = isAuthSessionError(error) ? tProgress("sessionExpired") : tProgress("saveError");
          showToast("error", message);
          const rolled = completedIdsRef.current.filter((id) => id !== lessonId);
          completedIdsRef.current = rolled;
          setSupabaseCompletedLessonIds(rolled);
        } else {
          await handleLessonCompletionSideEffects(
            supabase,
            user.id,
            lessonId,
            next,
            showToast,
            locale,
            localizeAchievement,
            progressCopy
          );
        }
      } else {
        guestMarkLessonComplete(lessonId);
        appStateMarkLessonComplete(lessonId);
      }
    },
    [
      user,
      supabase,
      showToast,
      appStateMarkLessonComplete,
      locale,
      setSupabaseCompletedLessonIds,
      tProgress,
      localizeAchievement,
      progressCopy,
    ]
  );

  const saveQuizAttempt = useCallback(
    async (quizId: string, lessonId: string, score: number, maxScore: number, answers: number[]) => {
      const normalized = normalizeStoredScore(score, maxScore);
      score = normalized.score;
      maxScore = normalized.maxScore;
      const passed = isQuizPassed(score, maxScore);

      if (user) {
        const prev = quizAttemptsRef.current;
        const existing = prev[quizId];
        const currentCompleted = completedIdsRef.current;
        const allCompleted = currentCompleted.includes(lessonId)
          ? currentCompleted
          : [...currentCompleted, lessonId];

        const sideEffectArgs = [
          supabase,
          user.id,
          lessonId,
          score,
          maxScore,
          passed,
          allCompleted,
          showToast,
          locale,
          localizeAchievement,
          progressCopy,
        ] as const;

        if (existing && score <= existing.score) {
          await handleQuizAttemptSideEffects(...sideEffectArgs);
          return;
        }

        const bestScore = existing ? Math.max(existing.score, score) : score;
        const next = {
          ...prev,
          [quizId]: {
            score: bestScore,
            maxScore,
            passed: isQuizPassed(bestScore, maxScore),
          },
        };
        quizAttemptsRef.current = next;
        setSupabaseQuizAttempts(next);

        const { error } = await supabase.from("quiz_attempts").upsert(
          {
            user_id: user.id,
            quiz_id: quizId,
            score: bestScore,
            max_score: maxScore,
            passed: isQuizPassed(bestScore, maxScore),
            answers,
          },
          { onConflict: QUIZ_ATTEMPTS_ON_CONFLICT, ignoreDuplicates: false }
        );
        if (error) {
          quizAttemptsRef.current = prev;
          setSupabaseQuizAttempts(prev);
          const message = isAuthSessionError(error)
            ? tProgress("sessionExpired")
            : tProgress("quizSaveError");
          showToast("error", message);
        } else {
          await handleQuizAttemptSideEffects(...sideEffectArgs);
        }
      } else {
        guestSaveQuizAttempt(quizId, score, maxScore);
        recordQuizScore(lessonId, toPercent(score, maxScore), passed);
      }
    },
    [
      user,
      supabase,
      showToast,
      recordQuizScore,
      setSupabaseQuizAttempts,
      tProgress,
      locale,
      localizeAchievement,
      progressCopy,
    ]
  );

  return { markLessonComplete, saveQuizAttempt };
}
