import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotifications } from "@/lib/notifications";
import { getMessages, type Locale } from "@/lib/i18n";

export const ACHIEVEMENTS = {
  "first-lesson": {
    id: "first-lesson",
    title: "First Step",
    description: "Completed your first lesson",
    icon: "🌱",
  },
  "first-quiz-pass": {
    id: "first-quiz-pass",
    title: "Quiz Champion",
    description: "Passed your first quiz",
    icon: "✅",
  },
  "first-path-complete": {
    id: "first-path-complete",
    title: "Path Finder",
    description: "Completed your first learning path",
    icon: "🗺️",
  },
  "five-lessons": {
    id: "five-lessons",
    title: "Dedicated Learner",
    description: "Completed 5 lessons",
    icon: "📚",
  },
  "perfect-quiz": {
    id: "perfect-quiz",
    title: "Perfect Score",
    description: "Got 100% on a quiz",
    icon: "⭐",
  },
  "three-day-streak": {
    id: "three-day-streak",
    title: "On a Roll",
    description: "3-day learning streak",
    icon: "🔥",
  },
  "seven-day-streak": {
    id: "seven-day-streak",
    title: "Week Warrior",
    description: "7-day learning streak",
    icon: "⚡",
  },
  "ten-lessons": {
    id: "ten-lessons",
    title: "Knowledge Seeker",
    description: "Completed 10 lessons",
    icon: "🎓",
  },
  "all-beginner": {
    id: "all-beginner",
    title: "Solid Foundation",
    description: "Completed all beginner lessons",
    icon: "🏗️",
  },
  "glossary-reader": {
    id: "glossary-reader",
    title: "Word Wizard",
    description: "Looked up 10 glossary terms",
    icon: "📖",
  },
} as const;

export type AchievementId = keyof typeof ACHIEVEMENTS;

export function getLocalizedAchievement(id: AchievementId, locale: Locale) {
  const items = getMessages(locale).achievements.items as Record<
    string,
    { title: string; description: string }
  >;
  const localized = items[id];
  if (localized) return { ...ACHIEVEMENTS[id], ...localized };
  return ACHIEVEMENTS[id];
}

export type AchievementContext = {
  totalLessonsCompleted: number;
  quizPassed?: boolean;
  quizScore?: number;
  quizMaxScore?: number;
  pathCompleted?: boolean;
  currentStreak?: number;
  totalBeginnerLessonsCompleted?: number;
  totalBeginnerLessonsAvailable?: number;
  glossaryTermsLookedUp?: number;
};

export async function checkAndAwardAchievements(
  supabase: SupabaseClient,
  userId: string,
  context: AchievementContext
): Promise<string[]> {
  const { data: existing } = await supabase
    .from("achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const earned = new Set((existing ?? []).map((a) => a.achievement_id));
  const newlyEarned: string[] = [];
  const achievementsToInsert: { user_id: string; achievement_id: string }[] = [];
  const notificationsToInsert: { type: string; title: string; body: string }[] = [];

  const checks: Array<{ id: string; condition: boolean }> = [
    { id: "first-lesson", condition: context.totalLessonsCompleted >= 1 },
    { id: "five-lessons", condition: context.totalLessonsCompleted >= 5 },
    { id: "ten-lessons", condition: context.totalLessonsCompleted >= 10 },
    { id: "first-quiz-pass", condition: context.quizPassed === true },
    {
      id: "perfect-quiz",
      condition:
        context.quizMaxScore !== undefined &&
        context.quizScore !== undefined &&
        context.quizScore === context.quizMaxScore,
    },
    { id: "first-path-complete", condition: context.pathCompleted === true },
    { id: "three-day-streak", condition: (context.currentStreak ?? 0) >= 3 },
    { id: "seven-day-streak", condition: (context.currentStreak ?? 0) >= 7 },
    {
      id: "all-beginner",
      condition:
        context.totalBeginnerLessonsAvailable !== undefined &&
        context.totalBeginnerLessonsCompleted !== undefined &&
        context.totalBeginnerLessonsAvailable > 0 &&
        context.totalBeginnerLessonsCompleted >= context.totalBeginnerLessonsAvailable,
    },
    { id: "glossary-reader", condition: (context.glossaryTermsLookedUp ?? 0) >= 10 },
  ];

  for (const check of checks) {
    if (check.condition && !earned.has(check.id)) {
      achievementsToInsert.push({ user_id: userId, achievement_id: check.id });
      newlyEarned.push(check.id);

      const achievement = ACHIEVEMENTS[check.id as AchievementId];
      if (achievement) {
        notificationsToInsert.push({
          type: "achievement",
          title: `Achievement Unlocked: ${achievement.title}`,
          body: achievement.description,
        });
      }
    }
  }

  if (achievementsToInsert.length > 0) {
    const { error } = await supabase.from("achievements").insert(achievementsToInsert);
    if (error) {
      // If batch insert fails, return empty array indicating nothing was earned
      return [];
    }

    if (notificationsToInsert.length > 0) {
      await createNotifications(supabase, userId, notificationsToInsert);
    }
  }

  return newlyEarned;
}
