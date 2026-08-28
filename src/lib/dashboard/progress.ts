import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import type { Locale } from "@/lib/i18n";
import type { Summary } from "@/types/dashboard";
import { quizIdsForLesson, toPercent } from "@/lib/quizScore";
import { logQueryError } from "./utils";

export async function getUserProgressSummary(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = "en"
): Promise<Summary> {
  const allLessons = getAllLessons(locale);

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

  const totalTimeSpentSeconds = completedLessons.reduce((sum, l) => {
    const v = Number(l.time_spent_seconds ?? 0);
    return sum + (Number.isFinite(v) ? v : 0);
  }, 0);
  const totalLessonsCompleted = new Set(completedLessons.map((l) => l.lesson_id)).size;

  const bestByQuizId = new Map<string, { score: number; maxScore: number; passed: boolean }>();
  for (const q of quizAttempts) {
    const score = Number(q.score ?? 0);
    const maxScore = Number(q.max_score ?? 0);
    if (!Number.isFinite(score) || !Number.isFinite(maxScore)) continue;
    const existing = bestByQuizId.get(q.quiz_id);
    if (!existing || score > existing.score) {
      bestByQuizId.set(q.quiz_id, { score, maxScore, passed: Boolean(q.passed) });
    }
  }
  const uniqueQuizzes = [...bestByQuizId.values()];
  const passedQuizzes = uniqueQuizzes.filter((q) => q.passed).length;
  const totalScore = uniqueQuizzes.reduce((sum, q) => sum + q.score, 0);
  const totalMaxScore = uniqueQuizzes.reduce((sum, q) => sum + q.maxScore, 0);
  const rawAverage = toPercent(totalScore, totalMaxScore);

  return {
    totalLessonsCompleted,
    totalLessonsAvailable: allLessons.length,
    totalQuizzesPassed: passedQuizzes,
    totalQuizzesAttempted: uniqueQuizzes.length,
    averageQuizScore: Number.isFinite(rawAverage) ? rawAverage : 0,
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

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

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
  const pageQuizIds = pageLessonIds.flatMap(quizIdsForLesson);

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
    const lessonKey = attempt.quiz_id.replace(/-quiz$/, "");
    const s = Number(attempt.score);
    const m = Number(attempt.max_score);
    const pct = Number.isFinite(s) && Number.isFinite(m) ? toPercent(s, m) : 0;
    const existing = bestQuizScores.get(lessonKey);
    if (existing === undefined || pct > existing) {
      bestQuizScores.set(lessonKey, pct);
    }
  }

  const lessons = (progressData ?? []).map((p) => {
    const lesson = lessonMap.get(p.lesson_id);
    return {
      lessonId: p.lesson_id,
      title: lesson?.title ?? "Unknown Lesson",
      category: lesson?.category ?? "",
      categoryId: lesson?.categoryId ?? "",
      completedAt: p.completed_at ?? "",
      quizScore: bestQuizScores.get(p.lesson_id) ?? null,
    };
  });

  return {
    lessons,
    total: count ?? 0,
    page: safePage,
    totalPages: count ? Math.ceil(count / safePageSize) : 0,
  };
}
