"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppState } from "@/components/AppProviders";
import { useToast } from "@/components/ui/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import {
  getGuestProgress,
  markLessonComplete as guestMarkLessonComplete,
  saveQuizAttempt as guestSaveQuizAttempt,
  migrateGuestProgressToSupabase,
} from "@/lib/guestProgress";
import { ACHIEVEMENTS, checkAndAwardAchievements } from "@/lib/achievements";
import type { AchievementId } from "@/lib/achievements";
import { updateStreak } from "@/lib/streaks";
import { updateDailyLog } from "@/lib/dashboard";
import { createNotification } from "@/lib/notifications";

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
  const { completedLessons, quizScores } = useAppState();
  const { showToast } = useToast();
  const supabase = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState(true);

  // Track whether we've migrated guest progress for this session
  const [migrated, setMigrated] = useState(false);

  // On auth state change, migrate guest progress to Supabase
  useEffect(() => {
    if (authLoading) return;
    if (user && !migrated) {
      const guest = getGuestProgress();
      if (guest.completedLessons.length > 0 || guest.quizAttempts.length > 0) {
        migrateGuestProgressToSupabase(supabase, user.id).then(() => {
          setMigrated(true);
          setIsLoading(false);
        });
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMigrated(true);
      }
    } else if (!user) {
      setIsLoading(false);
    }
  }, [user, authLoading, supabase, migrated]);

  // Fetch Supabase progress when user is authenticated
  const [supabaseCompletedLessonIds, setSupabaseCompletedLessonIds] = useState<string[]>([]);
  const [supabaseQuizAttempts, setSupabaseQuizAttempts] = useState<
    Record<string, { score: number; maxScore: number; passed: boolean }>
  >({});

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupabaseCompletedLessonIds([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupabaseQuizAttempts({});
      return;
    }

    const fetchProgress = async () => {
      const [lessonResult, quizResult] = await Promise.all([
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("completed", true),
        supabase.from("quiz_attempts").select("quiz_id, score, max_score, passed").eq("user_id", user.id),
      ]);

      if (lessonResult.data) {
        setSupabaseCompletedLessonIds(lessonResult.data.map((r) => r.lesson_id));
      }
      if (quizResult.data) {
        const attempts: Record<string, { score: number; maxScore: number; passed: boolean }> = {};
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
  }, [user, supabase]);

  // Derive effective state from auth or guest sources
  const completedLessonIds = useMemo(() => {
    if (user) return supabaseCompletedLessonIds;
    return completedLessons;
  }, [user, supabaseCompletedLessonIds, completedLessons]);

  const quizAttempts = useMemo(() => {
    if (user) return supabaseQuizAttempts;
    const attempts: Record<string, { score: number; maxScore: number; passed: boolean }> = {};
    for (const qs of quizScores) {
      attempts[qs.lessonId] = { score: qs.score, maxScore: 100, passed: qs.passed };
    }
    return attempts;
  }, [user, supabaseQuizAttempts, quizScores]);

  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      if (user) {
        // Optimistic update
        setSupabaseCompletedLessonIds((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
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
          showToast("error", "Failed to save progress");
          setSupabaseCompletedLessonIds((prev) => prev.filter((id) => id !== lessonId));
        } else {
          // Update daily log
          await updateDailyLog(supabase, user.id);

          // Check achievements
          const allCompleted = [...supabaseCompletedLessonIds, lessonId];
          const newAchievements = await checkAndAwardAchievements(supabase, user.id, {
            totalLessonsCompleted: allCompleted.length,
          });
          for (const achievementId of newAchievements) {
            const achievement = ACHIEVEMENTS[achievementId as AchievementId];
            if (achievement) {
              showToast("success", `Achievement unlocked: ${achievement.title}`);
            }
          }
          // Update streak
          const { currentStreak } = await updateStreak(supabase, user.id);

          // Check for close-to-completion notifications on learning paths
          const allCompletedSet = new Set(allCompleted);
          const allPaths = (await import("@/lib/paths/loadPaths")).getAllLearningPaths("en");
          for (const path of allPaths) {
            const remaining = path.lessons.filter((id) => !allCompletedSet.has(id));
            if (remaining.length === 1 && allCompletedSet.has(lessonId)) {
              await createNotification(supabase, user.id, {
                type: "close-to-completion",
                title: "Almost there!",
                body: `You're one lesson away from completing "${path.title}".`,
              });
            }
          }
        }
      } else {
        guestMarkLessonComplete(lessonId);
      }
    },
    [user, supabase, showToast, supabaseCompletedLessonIds]
  );

  const saveQuizAttempt = useCallback(
    async (quizId: string, lessonId: string, score: number, maxScore: number, answers: number[]) => {
      const passed = score >= maxScore * 0.7;
      if (user) {
        // Optimistic update
        setSupabaseQuizAttempts((prev) => ({
          ...prev,
          [quizId]: { score, maxScore, passed },
        }));
        const { error } = await supabase.from("quiz_attempts").insert({
          user_id: user.id,
          quiz_id: quizId,
          score,
          max_score: maxScore,
          passed,
          answers: JSON.stringify(answers),
        });
        if (error) {
          showToast("error", "Failed to save quiz result");
        } else {
          // Update daily log
          await updateDailyLog(supabase, user.id);

          // Check achievements
          const allCompleted = [...supabaseCompletedLessonIds];
          if (!allCompleted.includes(lessonId)) {
            allCompleted.push(lessonId);
          }
          const newAchievements = await checkAndAwardAchievements(supabase, user.id, {
            totalLessonsCompleted: allCompleted.length,
            quizPassed: passed,
            quizScore: score,
            quizMaxScore: maxScore,
          });
          for (const achievementId of newAchievements) {
            const achievement = ACHIEVEMENTS[achievementId as AchievementId];
            if (achievement) {
              showToast("success", `Achievement unlocked: ${achievement.title}`);
            }
          }
          // Update streak
          await updateStreak(supabase, user.id);
        }
      } else {
        guestSaveQuizAttempt(quizId, score, maxScore);
      }
    },
    [user, supabase, showToast, supabaseCompletedLessonIds]
  );

  const isLessonComplete = useCallback(
    (lessonId: string) => completedLessonIds.includes(lessonId),
    [completedLessonIds]
  );

  const getQuizBestScore = useCallback(
    (quizId: string) => {
      const attempt = quizAttempts[quizId];
      return attempt ? Math.round((attempt.score / attempt.maxScore) * 100) : null;
    },
    [quizAttempts]
  );

  const getLearningPathProgress = useCallback(
    (lessonIds: string[]) => {
      const completed = lessonIds.filter((id) => completedLessonIds.includes(id)).length;
      const total = lessonIds.length;
      return {
        completed,
        total,
        percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      };
    },
    [completedLessonIds]
  );

  return {
    completedLessonIds,
    quizAttempts,
    isLoading: isLoading || authLoading,
    markLessonComplete,
    saveQuizAttempt,
    isLessonComplete,
    getQuizBestScore,
    getLearningPathProgress,
  };
}
