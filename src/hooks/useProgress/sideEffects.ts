import { checkAndAwardAchievements } from "@/lib/achievements";
import { updateStreak } from "@/lib/streaks";
import { updateDailyLog } from "@/lib/dashboard/dailyLog";
import { createNotifications, type NotificationInput } from "@/lib/notifications";
import { reportClientError } from "@/lib/errorReporting";
import type { Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { getPathsForLesson, loadPathsForLocale } from "./pathsCache";
import { BEGINNER_LESSON_IDS } from "@/data/lessonMeta";
import { getGlossaryLookupCount } from "@/lib/glossaryLookups";

export type Callback = (type: "success" | "error" | "info", message: string) => void;

export type LocalizeAchievement = (id: string) => {
  title: string;
  description: string;
  unlocked: string;
};

export type ProgressCopy = {
  pathAlmostThereTitle: string;
  pathAlmostThereBody: (title: string) => string;
  streakMilestoneTitle: (count: number) => string;
  streakMilestoneBody: (count: number) => string;
};

async function notifyStreakMilestone(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  milestoneReached: number | null,
  progressCopy: ProgressCopy
) {
  if (!milestoneReached) return;
  await createNotifications(supabase, userId, [
    {
      type: "streak",
      title: progressCopy.streakMilestoneTitle(milestoneReached),
      body: progressCopy.streakMilestoneBody(milestoneReached),
    },
  ]);
}

function toastAndCollectAchievements(
  newAchievements: string[],
  localizeAchievement: LocalizeAchievement,
  showToast: Callback
): NotificationInput[] {
  const achievementNotifications: NotificationInput[] = [];
  for (const achievementId of newAchievements) {
    const loc = localizeAchievement(achievementId);
    showToast("success", loc.unlocked);
    achievementNotifications.push({
      type: "achievement",
      title: loc.unlocked,
      body: loc.description,
    });
  }
  return achievementNotifications;
}

export async function handleLessonCompletionSideEffects(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  lessonId: string,
  completedIdsAfter: string[],
  showToast: Callback,
  locale: string,
  localizeAchievement: LocalizeAchievement,
  progressCopy: ProgressCopy
) {
  await updateDailyLog(supabase, userId);

  const streakResult = await updateStreak(supabase, userId);
  await notifyStreakMilestone(supabase, userId, streakResult.milestoneReached, progressCopy);

  const allCompletedSet = new Set(completedIdsAfter);
  let pathCompleted = false;
  const pathNotifications: NotificationInput[] = [];

  try {
    const allPaths = await loadPathsForLocale(locale as Locale);
    const matchingPaths = getPathsForLesson(allPaths, locale as Locale, lessonId);

    for (const path of matchingPaths) {
      let uncompletedCount = 0;
      for (const id of path.lessons) {
        if (!allCompletedSet.has(id)) {
          uncompletedCount++;
        }
      }
      if (path.lessons.length > 0 && uncompletedCount === 0) {
        pathCompleted = true;
      } else if (uncompletedCount === 1) {
        pathNotifications.push({
          type: "close-to-completion",
          title: progressCopy.pathAlmostThereTitle,
          body: progressCopy.pathAlmostThereBody(path.title),
        });
      }
    }
  } catch (error) {
    reportClientError(error, { context: "Failed to load paths for progress calculation" });
  }

  const totalBeginnerLessonsCompleted = completedIdsAfter.filter((id) =>
    BEGINNER_LESSON_IDS.includes(id)
  ).length;
  const totalBeginnerLessonsAvailable = BEGINNER_LESSON_IDS.length;
  const glossaryTermsLookedUp = getGlossaryLookupCount();

  const newAchievements = await checkAndAwardAchievements(supabase, userId, {
    totalLessonsCompleted: completedIdsAfter.length,
    currentStreak: streakResult.currentStreak,
    pathCompleted,
    totalBeginnerLessonsCompleted,
    totalBeginnerLessonsAvailable,
    glossaryTermsLookedUp,
  });

  const achievementNotifications = toastAndCollectAchievements(
    newAchievements,
    localizeAchievement,
    showToast
  );

  const allNotifications = [...achievementNotifications, ...pathNotifications];
  if (allNotifications.length > 0) {
    await createNotifications(supabase, userId, allNotifications);
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
  showToast: Callback,
  locale: string,
  localizeAchievement: LocalizeAchievement,
  progressCopy: ProgressCopy
) {
  void locale;
  await updateDailyLog(supabase, userId);

  const streakResult = await updateStreak(supabase, userId);
  await notifyStreakMilestone(supabase, userId, streakResult.milestoneReached, progressCopy);

  const totalBeginnerLessonsCompleted = completedIdsAfter.filter((id) =>
    BEGINNER_LESSON_IDS.includes(id)
  ).length;
  const totalBeginnerLessonsAvailable = BEGINNER_LESSON_IDS.length;
  const glossaryTermsLookedUp = getGlossaryLookupCount();

  const newAchievements = await checkAndAwardAchievements(supabase, userId, {
    totalLessonsCompleted: completedIdsAfter.length,
    quizPassed: passed,
    quizScore: score,
    quizMaxScore: maxScore,
    currentStreak: streakResult.currentStreak,
    totalBeginnerLessonsCompleted,
    totalBeginnerLessonsAvailable,
    glossaryTermsLookedUp,
  });

  const achievementNotifications = toastAndCollectAchievements(
    newAchievements,
    localizeAchievement,
    showToast
  );

  if (achievementNotifications.length > 0) {
    await createNotifications(supabase, userId, achievementNotifications);
  }
}
