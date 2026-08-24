import { ACHIEVEMENTS, checkAndAwardAchievements } from "@/lib/achievements";
import type { AchievementId } from "@/lib/achievements";
import { updateStreak } from "@/lib/streaks";
import { updateDailyLog } from "@/lib/dashboard";
import { createNotifications, type NotificationInput } from "@/lib/notifications";
import { reportClientError } from "@/lib/errorReporting";
import type { Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { getPathsForLesson, getLoadPathsPromise } from "./pathsCache";

export type Callback = (type: "success" | "error" | "info", message: string) => void;

export async function handleLessonCompletionSideEffects(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  lessonId: string,
  completedIdsAfter: string[],
  showToast: Callback,
  locale: string
) {
  // Update daily log
  await updateDailyLog(supabase, userId);

  // Check achievements
  const newAchievements = await checkAndAwardAchievements(supabase, userId, {
    totalLessonsCompleted: completedIdsAfter.length,
  });
  for (const achievementId of newAchievements) {
    const achievement = ACHIEVEMENTS[achievementId as AchievementId];
    if (achievement) {
      showToast("success", `Achievement unlocked: ${achievement.title}`);
    }
  }

  // Update streak
  await updateStreak(supabase, userId);

  // Check for close-to-completion notifications on learning paths (optimized)
  const allCompletedSet = new Set(completedIdsAfter);
  try {
    const loadPaths = getLoadPathsPromise();
    const allPaths = (await loadPaths).getAllLearningPaths(locale as Locale);
    const matchingPaths = getPathsForLesson(allPaths, locale as Locale, lessonId);
    const notificationsToCreate: NotificationInput[] = [];
    for (const path of matchingPaths) {
      let uncompletedCount = 0;
      for (const id of path.lessons) {
        if (!allCompletedSet.has(id)) {
          uncompletedCount++;
          if (uncompletedCount > 1) break;
        }
      }
      if (uncompletedCount === 1) {
        notificationsToCreate.push({
          type: "close-to-completion",
          title: "Almost there!",
          body: `You're one lesson away from completing "${path.title}".`,
        });
      }
    }
    if (notificationsToCreate.length > 0) {
      await createNotifications(supabase, userId, notificationsToCreate);
    }
  } catch (error) {
    reportClientError(error, { context: "Failed to load paths for progress calculation" });
  }
}

export async function handleQuizAttemptSideEffects(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  lessonId: string,
  score: number,
  maxScore: number,
  passed: boolean,
  completedIdsAfter: string[],
  showToast: Callback
) {
  // Update daily log
  await updateDailyLog(supabase, userId);

  // Check achievements — completedIdsAfter already contains optimistic state
  const newAchievements = await checkAndAwardAchievements(supabase, userId, {
    totalLessonsCompleted: completedIdsAfter.length,
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
  await updateStreak(supabase, userId);
}
