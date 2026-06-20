import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import type { Locale } from "@/lib/i18n";
import { logQueryError } from "./utils";

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
