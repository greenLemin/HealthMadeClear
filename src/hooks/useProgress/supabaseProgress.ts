import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import type { QuizScore } from "@/lib/progressExport";
import { createClient } from "@/lib/supabase/client";

export interface QuizAttemptValue {
  score: number;
  maxScore: number;
  passed: boolean;
}
export type QuizAttempts = Record<string, QuizAttemptValue>;

export function useSupabaseProgress(user: User | null, supabase: ReturnType<typeof createClient>) {
  const [supabaseCompletedLessonIds, setSupabaseCompletedLessonIds] = useState<string[]>([]);
  const [supabaseQuizAttempts, setSupabaseQuizAttempts] = useState<QuizAttempts>({});

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset progress when user logs out
      setSupabaseCompletedLessonIds([]);
      setSupabaseQuizAttempts({});
      return;
    }

    const fetchUserId = user.id;
    let cancelled = false;

    const fetchProgress = async () => {
      const [lessonResult, quizResult] = await Promise.all([
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", fetchUserId).eq("completed", true),
        supabase.from("quiz_attempts").select("quiz_id, score, max_score, passed").eq("user_id", fetchUserId),
      ]);

      if (cancelled) return;
      // Guard against stale fetch if user switched accounts mid-flight
      if (!user || fetchUserId !== user.id) return;

      if (lessonResult.data) {
        setSupabaseCompletedLessonIds(lessonResult.data.map((r: { lesson_id: string }) => r.lesson_id));
      }
      if (quizResult.data) {
        const attempts: QuizAttempts = {};
        for (const a of quizResult.data) {
          const existing = attempts[a.quiz_id];
          if (!existing || a.score > existing.score) {
            attempts[a.quiz_id] = { score: a.score, maxScore: a.max_score, passed: a.passed };
          }
        }
        setSupabaseQuizAttempts(attempts);
      }
    };

    fetchProgress();
    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  return {
    supabaseCompletedLessonIds,
    setSupabaseCompletedLessonIds,
    supabaseQuizAttempts,
    setSupabaseQuizAttempts,
  };
}

export function useDerivedProgress(
  user: User | null,
  supabaseCompletedLessonIds: string[],
  supabaseQuizAttempts: QuizAttempts,
  completedLessons: Set<string>,
  quizScores: QuizScore[]
) {
  const completedLessonIds = useMemo(() => {
    if (user) return supabaseCompletedLessonIds;
    return Array.from(completedLessons);
  }, [user, supabaseCompletedLessonIds, completedLessons]);

  const quizAttempts = useMemo(() => {
    if (user) return supabaseQuizAttempts;
    const attempts: QuizAttempts = {};
    for (const qs of quizScores) {
      attempts[qs.lessonId] = { score: qs.score, maxScore: 100, passed: qs.passed };
    }
    return attempts;
  }, [user, supabaseQuizAttempts, quizScores]);

  const completedLessonIdsSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);

  return { completedLessonIds, quizAttempts, completedLessonIdsSet };
}
