import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import type { Locale } from "@/lib/i18n";
import { logQueryError } from "./utils";

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
