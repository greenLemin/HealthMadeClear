import type { PostgrestError } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import { getAllQuizzes } from "@/lib/localizedQuiz";
import { ACHIEVEMENTS, getLocalizedAchievement } from "@/lib/achievements";
import type { AchievementId } from "@/lib/achievements";
import type { LearningPath } from "@/types/learningPath";
import type { LessonId, LessonCategoryId } from "@/types/content";
import type { Locale } from "@/lib/i18n";

function logQueryError(context: string, error: PostgrestError | null): void {
  if (error) console.error(`[dashboard:${context}]`, error.message);
}

export async function getUserProgressSummary(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = "en"
): Promise<{
  totalLessonsCompleted: number;
  totalLessonsAvailable: number;
  totalQuizzesPassed: number;
  totalQuizzesAttempted: number;
  averageQuizScore: number;
  totalTimeSpentMinutes: number;
  currentStreak: number;
  longestStreak: number;
}> {
  const allLessons = getAllLessons(locale);
  const allQuizzes = getAllQuizzes(locale);

  const [lessonResult, quizResult, streakResult] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("lesson_id, time_spent_seconds")
      .eq("user_id", userId)
      .eq("completed", true),
    supabase.from("quiz_attempts").select("score, max_score, passed").eq("user_id", userId),
    supabase.from("streaks").select("current_streak, longest_streak").eq("user_id", userId).single(),
  ]);

  logQueryError("getUserProgressSummary:lessons", lessonResult.error);
  logQueryError("getUserProgressSummary:quizzes", quizResult.error);
  logQueryError("getUserProgressSummary:streak", streakResult.error);

  const completedLessons = lessonResult.data ?? [];
  const quizAttempts = quizResult.data ?? [];

  const totalTimeSpentSeconds = completedLessons.reduce((sum, l) => sum + (l.time_spent_seconds ?? 0), 0);

  const passedQuizzes = quizAttempts.filter((q) => q.passed).length;
  const totalScore = quizAttempts.reduce((sum, q) => sum + q.score, 0);
  const maxScore = quizAttempts.reduce((sum, q) => sum + q.max_score, 0);
  const averageQuizScore = quizAttempts.length > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    totalLessonsCompleted: completedLessons.length,
    totalLessonsAvailable: allLessons.length,
    totalQuizzesPassed: passedQuizzes,
    totalQuizzesAttempted: quizAttempts.length,
    averageQuizScore,
    totalTimeSpentMinutes: Math.round(totalTimeSpentSeconds / 60),
    currentStreak: streakResult.data?.current_streak ?? 0,
    longestStreak: streakResult.data?.longest_streak ?? 0,
  };
}

export async function getUserLearningPaths(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = "en"
): Promise<
  Array<{
    path: LearningPath;
    completedLessonIds: string[];
    nextLesson: { id: string; title: string; duration: string } | null;
    progressPercentage: number;
    isComplete: boolean;
  }>
> {
  const allPaths = getAllLearningPaths(locale);
  const allLessons = getAllLessons(locale);

  const { data: progressData, error: progressError } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("completed", true);

  logQueryError("getUserLearningPaths", progressError);

  const completedSet = new Set((progressData ?? []).map((p) => p.lesson_id));
  const lessonMap = new Map(allLessons.map((l) => [l.id, l]));

  return allPaths.map((path) => {
    const lessonsInPath = path.lessons;
    const completedInPath = lessonsInPath.filter((id) => completedSet.has(id));
    const totalInPath = lessonsInPath.length;
    const isComplete = totalInPath > 0 && completedInPath.length >= totalInPath;
    const nextIncomplete = lessonsInPath.find((id) => !completedSet.has(id)) as LessonId | undefined;
    const nextLesson = nextIncomplete
      ? {
          id: nextIncomplete,
          title: lessonMap.get(nextIncomplete)?.title ?? "",
          duration: lessonMap.get(nextIncomplete)?.duration ?? "",
        }
      : null;

    return {
      path,
      completedLessonIds: completedInPath,
      nextLesson,
      progressPercentage: totalInPath === 0 ? 0 : Math.round((completedInPath.length / totalInPath) * 100),
      isComplete,
    };
  });
}

export async function getRecentActivity(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = "en"
): Promise<
  Array<{
    type: "lesson" | "quiz";
    lessonId?: string;
    quizId?: string;
    title: string;
    completedAt: string;
    score?: number;
    passed?: boolean;
  }>
> {
  const allLessons = getAllLessons(locale);
  const lessonMap = new Map(allLessons.map((l) => [l.id, l]));

  const [lessonResult, quizResult] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("lesson_id, completed_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(5),
    supabase
      .from("quiz_attempts")
      .select("quiz_id, score, max_score, passed, attempted_at")
      .eq("user_id", userId)
      .order("attempted_at", { ascending: false })
      .limit(5),
  ]);

  logQueryError("getRecentActivity:lessons", lessonResult.error);
  logQueryError("getRecentActivity:quizzes", quizResult.error);

  const activity: Array<{
    type: "lesson" | "quiz";
    lessonId?: string;
    quizId?: string;
    title: string;
    completedAt: string;
    score?: number;
    passed?: boolean;
  }> = [];

  for (const lesson of lessonResult.data ?? []) {
    const lessonData = lessonMap.get(lesson.lesson_id);
    activity.push({
      type: "lesson",
      lessonId: lesson.lesson_id,
      title: lessonData?.title ?? "Unknown Lesson",
      completedAt: lesson.completed_at ?? "",
    });
  }

  for (const quiz of quizResult.data ?? []) {
    const quizLessonId = quiz.quiz_id.replace("-quiz", "");
    const lessonData = lessonMap.get(quizLessonId);
    activity.push({
      type: "quiz",
      lessonId: quizLessonId,
      quizId: quiz.quiz_id,
      title: `Quiz: ${lessonData?.title ?? "Unknown"}`,
      completedAt: quiz.attempted_at,
      score: quiz.max_score > 0 ? Math.round((quiz.score / quiz.max_score) * 100) : 0,
      passed: quiz.passed,
    });
  }

  activity.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return activity.slice(0, 5);
}

export async function getUserAchievements(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = "en"
): Promise<
  Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedAt: string | null;
  }>
> {
  const { data: earnedData, error: earnedError } = await supabase
    .from("achievements")
    .select("achievement_id, earned_at")
    .eq("user_id", userId);

  logQueryError("getUserAchievements", earnedError);

  const earnedMap = new Map((earnedData ?? []).map((a) => [a.achievement_id, a.earned_at]));

  return Object.values(ACHIEVEMENTS).map((achievement) => {
    const localized = getLocalizedAchievement(achievement.id, locale);
    return {
      id: achievement.id,
      title: localized.title,
      description: localized.description,
      icon: achievement.icon,
      earned: earnedMap.has(achievement.id),
      earnedAt: earnedMap.get(achievement.id) ?? null,
    };
  });
}

export async function getRecommendedNextLesson(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = "en"
): Promise<{
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  pathTitle?: string;
} | null> {
  const allPaths = getAllLearningPaths(locale);
  const allLessons = getAllLessons(locale);

  const { data: progressData, error: progressError } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("completed", true);

  logQueryError("getRecommendedNextLesson", progressError);

  const completedSet = new Set((progressData ?? []).map((p) => p.lesson_id));

  for (const path of allPaths) {
    const nextIncomplete = path.lessons.find((id) => !completedSet.has(id));
    if (nextIncomplete && path.lessons.some((id) => completedSet.has(id))) {
      const lesson = allLessons.find((l) => l.id === nextIncomplete);
      if (lesson) {
        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          level: lesson.level,
          pathTitle: path.title,
        };
      }
    }
  }

  const beginnerLessons = allLessons.filter((l) => l.level === "beginner");
  const firstIncomplete = beginnerLessons.find((l) => !completedSet.has(l.id));
  if (firstIncomplete) {
    return {
      id: firstIncomplete.id,
      title: firstIncomplete.title,
      description: firstIncomplete.description,
      duration: firstIncomplete.duration,
      level: firstIncomplete.level,
    };
  }

  const anyIncomplete = allLessons.find((l) => !completedSet.has(l.id));
  if (anyIncomplete) {
    return {
      id: anyIncomplete.id,
      title: anyIncomplete.title,
      description: anyIncomplete.description,
      duration: anyIncomplete.duration,
      level: anyIncomplete.level,
    };
  }

  return null;
}

export async function getQuizPerformanceByCategory(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = "en"
): Promise<
  Array<{
    category: string;
    categoryId: string;
    attemptsCount: number;
    averageScore: number;
    passRate: number;
  }>
> {
  const allLessons = getAllLessons(locale);
  const lessonCategoryMap = new Map<string, string>(allLessons.map((l) => [l.id, l.categoryId]));
  const categoryLabelMap = new Map<string, string>(allLessons.map((l) => [l.categoryId, l.category]));

  const { data: quizData, error: quizError } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score, max_score, passed")
    .eq("user_id", userId);

  logQueryError("getQuizPerformanceByCategory", quizError);

  const categoryStats = new Map<
    string,
    { attempts: number; totalScore: number; totalMax: number; passed: number }
  >();

  for (const attempt of quizData ?? []) {
    const quizLessonId = attempt.quiz_id.replace("-quiz", "");
    const categoryId = lessonCategoryMap.get(quizLessonId) ?? "unknown";

    const stats = categoryStats.get(categoryId) ?? {
      attempts: 0,
      totalScore: 0,
      totalMax: 0,
      passed: 0,
    };
    stats.attempts += 1;
    stats.totalScore += attempt.score;
    stats.totalMax += attempt.max_score;
    if (attempt.passed) stats.passed += 1;
    categoryStats.set(categoryId, stats);
  }

  return Array.from(categoryStats.entries())
    .map(([categoryId, stats]) => ({
      category: categoryLabelMap.get(categoryId) ?? categoryId,
      categoryId,
      attemptsCount: stats.attempts,
      averageScore: stats.totalMax > 0 ? Math.round((stats.totalScore / stats.totalMax) * 100) : 0,
      passRate: stats.attempts > 0 ? Math.round((stats.passed / stats.attempts) * 100) : 0,
    }))
    .sort((a, b) => b.attemptsCount - a.attemptsCount);
}

export async function updateDailyLog(supabase: SupabaseClient, userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  const { error } = await supabase
    .from("daily_log")
    .upsert({ user_id: userId, activity_date: today }, { onConflict: "user_id,activity_date" });
  logQueryError("updateDailyLog", error);
}

export async function getDailyLogForRange(
  supabase: SupabaseClient,
  userId: string,
  daysBack: number
): Promise<string[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startStr = startDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_log")
    .select("activity_date")
    .eq("user_id", userId)
    .gte("activity_date", startStr)
    .order("activity_date", { ascending: false });

  logQueryError("getDailyLogForRange", error);

  return (data ?? []).map((d) => d.activity_date);
}

export async function getCompletedLessonsPaginated(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = "en",
  page = 1,
  pageSize = 10
): Promise<{
  lessons: Array<{
    lessonId: string;
    title: string;
    category: string;
    categoryId: string;
    completedAt: string;
    quizScore: number | null;
  }>;
  total: number;
  page: number;
  totalPages: number;
}> {
  const allLessons = getAllLessons(locale);
  const lessonMap = new Map(allLessons.map((l) => [l.id, l]));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {
    data: progressData,
    count,
    error: progressError,
  } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed_at", { count: "exact" })
    .eq("user_id", userId)
    .eq("completed", true)
    .order("completed_at", { ascending: false })
    .range(from, to);

  logQueryError("getCompletedLessonsPaginated:progress", progressError);

  const pageLessonIds = (progressData ?? []).map((p) => p.lesson_id);
  const pageQuizIds = pageLessonIds.map((id) => `${id}-quiz`);

  let quizAttempts: Array<{ quiz_id: string; score: number; max_score: number }> = [];
  if (pageQuizIds.length > 0) {
    const { data: quizData, error: quizError } = await supabase
      .from("quiz_attempts")
      .select("quiz_id, score, max_score")
      .eq("user_id", userId)
      .in("quiz_id", pageQuizIds);
    logQueryError("getCompletedLessonsPaginated:quizzes", quizError);
    quizAttempts = quizData ?? [];
  }

  const bestQuizScores = new Map<string, number>();
  for (const attempt of quizAttempts) {
    const existing = bestQuizScores.get(attempt.quiz_id) ?? 0;
    const pct = attempt.max_score > 0 ? Math.round((attempt.score / attempt.max_score) * 100) : 0;
    if (pct > existing) {
      bestQuizScores.set(attempt.quiz_id, pct);
    }
  }

  const lessons = (progressData ?? []).map((p) => {
    const lesson = lessonMap.get(p.lesson_id);
    const quizId = `${p.lesson_id}-quiz`;
    return {
      lessonId: p.lesson_id,
      title: lesson?.title ?? "Unknown Lesson",
      category: lesson?.category ?? "",
      categoryId: lesson?.categoryId ?? "",
      completedAt: p.completed_at ?? "",
      quizScore: bestQuizScores.get(quizId) ?? null,
    };
  });

  return {
    lessons,
    total: count ?? 0,
    page,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };
}

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  displayName: string;
  email: string;
  createdAt: string;
} | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", userId)
    .single();

  logQueryError("getUserProfile", profileError);

  if (!profile) return null;

  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError) console.error("[dashboard:getUserProfile:auth]", authError.message);
  const email = userData?.user?.email ?? "";

  return {
    displayName: profile.display_name ?? "User",
    email,
    createdAt: profile.created_at,
  };
}
