"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppState } from "@/components/AppProviders";
import { useToast } from "@/components/ui/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import { useGuestMigration } from "./useProgress/guestMigration";
import { useSupabaseProgress, useDerivedProgress, type QuizAttempts } from "./useProgress/supabaseProgress";
import { useProgressMutations } from "./useProgress/mutations";
import { useProgressQueries } from "./useProgress/queries";

export interface ProgressState {
  completedLessonIds: string[];
  quizAttempts: Record<string, { score: number; maxScore: number; passed: boolean }>;
  isLoading: boolean;
}

export interface ProgressActions {
  markLessonComplete: (lessonId: string) => Promise<void>;
  saveQuizAttempt: (
    quizId: string,
    lessonId: string,
    score: number,
    maxScore: number,
    answers: number[]
  ) => Promise<void>;
  isLessonComplete: (lessonId: string) => boolean;
  getQuizBestScore: (quizId: string) => number | null;
  getLearningPathProgress: (lessonIds: string[]) => { completed: number; total: number; percentage: number };
}

export function useProgress(): ProgressState & ProgressActions {
  const { user, loading: authLoading } = useAuth();
  const locale = useLocale();
  const {
    completedLessons,
    quizScores,
    markLessonComplete: appStateMarkLessonComplete,
    recordQuizScore,
  } = useAppState();
  const { showToast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  const { isMigrationLoading } = useGuestMigration(user, supabase, authLoading);

  const {
    supabaseCompletedLessonIds,
    setSupabaseCompletedLessonIds,
    supabaseQuizAttempts,
    setSupabaseQuizAttempts,
  } = useSupabaseProgress(user, supabase);

  const { completedLessonIds, quizAttempts, completedLessonIdsSet } = useDerivedProgress(
    user,
    supabaseCompletedLessonIds,
    supabaseQuizAttempts,
    completedLessons,
    quizScores
  );

  const { markLessonComplete, saveQuizAttempt } = useProgressMutations(
    user,
    supabase,
    showToast,
    supabaseCompletedLessonIds,
    setSupabaseCompletedLessonIds,
    setSupabaseQuizAttempts,
    appStateMarkLessonComplete,
    recordQuizScore,
    locale
  );

  const { isLessonComplete, getQuizBestScore, getLearningPathProgress } = useProgressQueries(
    completedLessonIdsSet,
    quizAttempts as QuizAttempts
  );

  return {
    completedLessonIds,
    quizAttempts,
    isLoading: isMigrationLoading || authLoading,
    markLessonComplete,
    saveQuizAttempt,
    isLessonComplete,
    getQuizBestScore,
    getLearningPathProgress,
  };
}
