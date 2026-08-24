import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import type { Locale } from "@/lib/i18n";
import type { ActivityItem } from "@/types/dashboard";
import { logQueryError } from "./utils";

export async function getRecentActivity(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = "en"
): Promise<ActivityItem[]> {
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
      .limit(10),
    supabase
      .from("quiz_attempts")
      .select("quiz_id, score, max_score, passed, attempted_at")
      .eq("user_id", userId)
      .order("attempted_at", { ascending: false })
      .limit(10),
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
    const completedAt = lesson.completed_at ?? null;
    if (!completedAt) continue;
    const ts = new Date(completedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    const lessonData = lessonMap.get(lesson.lesson_id);
    activity.push({
      type: "lesson",
      lessonId: lesson.lesson_id,
      title: lessonData?.title ?? "Unknown Lesson",
      completedAt,
    });
  }

  for (const quiz of quizResult.data ?? []) {
    const completedAt = quiz.attempted_at ?? null;
    if (!completedAt) continue;
    const ts = new Date(completedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    const quizLessonId = quiz.quiz_id.replace("-quiz", "");
    const lessonData = lessonMap.get(quizLessonId);
    const scoreNum = Number(quiz.score);
    const maxNum = Number(quiz.max_score);
    const pct =
      Number.isFinite(scoreNum) && Number.isFinite(maxNum) && maxNum > 0
        ? Math.round((scoreNum / maxNum) * 100)
        : 0;
    activity.push({
      type: "quiz",
      lessonId: quizLessonId,
      quizId: quiz.quiz_id,
      title: `Quiz: ${lessonData?.title ?? "Unknown"}`,
      completedAt,
      score: Number.isFinite(pct) ? pct : 0,
      passed: quiz.passed,
    });
  }

  activity.sort((a, b) => {
    const ta = new Date(a.completedAt).getTime();
    const tb = new Date(b.completedAt).getTime();
    const va = Number.isFinite(ta) ? ta : 0;
    const vb = Number.isFinite(tb) ? tb : 0;
    return vb - va;
  });

  return activity.slice(0, 5);
}
