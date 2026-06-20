import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getAllQuizzes } from "@/lib/localizedQuiz";
import type { Locale } from "@/lib/i18n";
import { logQueryError } from "./utils";

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
    supabase.from("quiz_attempts").select("quiz_id, score, max_score, passed").eq("user_id", userId),
    supabase.from("streaks").select("current_streak, longest_streak").eq("user_id", userId).single(),
  ]);

  logQueryError("getUserProgressSummary:lessons", lessonResult.error);
  logQueryError("getUserProgressSummary:quizzes", quizResult.error);
  logQueryError("getUserProgressSummary:streak", streakResult.error);

  const completedLessons = lessonResult.data ?? [];
  const quizAttempts = quizResult.data ?? [];

  const totalTimeSpentSeconds = completedLessons.reduce((sum, l) => sum + (l.time_spent_seconds ?? 0), 0);
  const totalLessonsCompleted = new Set(completedLessons.map((l) => l.lesson_id)).size;

  const passedQuizzes = quizAttempts.filter((q) => q.passed);
  const totalScore = quizAttempts.reduce((sum, q) => sum + (q.score ?? 0), 0);
  const totalMaxScore = quizAttempts.reduce((sum, q) => sum + (q.max_score ?? 0), 0);

  return {
    totalLessonsCompleted,
    totalLessonsAvailable: allLessons.length,
    totalQuizzesPassed: new Set(passedQuizzes.map((q) => q.quiz_id)).size,
    totalQuizzesAttempted: allQuizzes.length,
    averageQuizScore: totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0,
    totalTimeSpentMinutes: Math.round(totalTimeSpentSeconds / 60),
    currentStreak: streakResult.data?.current_streak ?? 0,
    longestStreak: streakResult.data?.longest_streak ?? 0,
  };
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
