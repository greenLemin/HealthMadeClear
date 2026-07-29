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

  // Ensure arrays are sorted descending by date to safely merge
  const lessonsData = [...(lessonResult.data ?? [])].sort(
    (a, b) => new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime()
  );
  const quizzesData = [...(quizResult.data ?? [])].sort(
    (a, b) => new Date(b.attempted_at ?? 0).getTime() - new Date(a.attempted_at ?? 0).getTime()
  );

  let lIdx = 0;
  let qIdx = 0;

  while (activity.length < 5 && (lIdx < lessonsData.length || qIdx < quizzesData.length)) {
    const l = lessonsData[lIdx];
    const q = quizzesData[qIdx];

    // parse dates, fallback to 0 if invalid
    const lTime = l ? new Date(l.completed_at ?? 0).getTime() || 0 : -Infinity;
    const qTime = q ? new Date(q.attempted_at ?? 0).getTime() || 0 : -Infinity;

    if (l && (lTime >= qTime || !q)) {
      const lessonData = lessonMap.get(l.lesson_id);
      activity.push({
        type: "lesson",
        lessonId: l.lesson_id,
        title: lessonData?.title ?? "Unknown Lesson",
        completedAt: l.completed_at ?? "",
      });
      lIdx++;
    } else if (q) {
      const quizLessonId = q.quiz_id.replace("-quiz", "");
      const lessonData = lessonMap.get(quizLessonId);
      activity.push({
        type: "quiz",
        lessonId: quizLessonId,
        quizId: q.quiz_id,
        title: `Quiz: ${lessonData?.title ?? "Unknown"}`,
        completedAt: q.attempted_at,
        score: q.max_score > 0 ? Math.round((q.score / q.max_score) * 100) : 0,
        passed: q.passed,
      });
      qIdx++;
    }
  }

  return activity;
}
