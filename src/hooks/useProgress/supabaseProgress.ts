import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { QuizScore } from "@/lib/progressExport";
import { createClient } from "@/lib/supabase/client";

export interface QuizAttemptValue {
  score: number;
  maxScore: number;
  passed: boolean;
}
export type QuizAttempts = Record<string, QuizAttemptValue>;

export interface UseSupabaseProgressOptions {
  /**
   * When true, fetch starts. Defaults to true.
   * Set to false until guest migration is complete to avoid showing empty state.
   */
  fetchWhen?: boolean;
}

export function useSupabaseProgress(
  user: User | null,
  supabase: ReturnType<typeof createClient>,
  options: UseSupabaseProgressOptions = {}
) {
  const { fetchWhen = true } = options;

  const [supabaseCompletedLessonIds, setSupabaseCompletedLessonIds] = useState<string[]>([]);
  const [supabaseQuizAttempts, setSupabaseQuizAttempts] = useState<QuizAttempts>({});
  const [prevUser, setPrevUser] = useState<User | null>(user);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  if (user !== prevUser) {
    setPrevUser(user);
    if (!user) {
      setSupabaseCompletedLessonIds([]);
      setSupabaseQuizAttempts({});
    }
  }

  const [isFetchLoading, setIsFetchLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    const fetchUserId = user.id;

    const [lessonResult, quizResult] = await Promise.all([
      supabase.from("lesson_progress").select("lesson_id").eq("user_id", fetchUserId).eq("completed", true),
      supabase.from("quiz_attempts").select("quiz_id, score, max_score, passed").eq("user_id", fetchUserId),
    ]);

    // Guard against stale fetch if user switched accounts mid-flight
    if (!userRef.current || fetchUserId !== userRef.current.id) return;

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
  }, [user, supabase]);

  useEffect(() => {
    if (!user || !fetchWhen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Drop fetch spinner when gated off so logout cannot stick on isLoading
      setIsFetchLoading(false);
      return;
    }

    let cancelled = false;
    setIsFetchLoading(true);

    const run = async () => {
      try {
        await fetchProgress();
      } catch (error) {
        // Error handling here
      }
      if (!cancelled) setIsFetchLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [user, supabase, fetchWhen, fetchProgress]);

  const refetch = useCallback(async () => {
    setIsFetchLoading(true);
    try {
      await fetchProgress();
    } finally {
      setIsFetchLoading(false);
    }
  }, [fetchProgress]);

  return {
    supabaseCompletedLessonIds,
    setSupabaseCompletedLessonIds,
    supabaseQuizAttempts,
    setSupabaseQuizAttempts,
    refetch,
    isFetchLoading,
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
