import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import type { LearningPath } from "@/types/learningPath";
import type { LessonId } from "@/types/content";
import type { Locale } from "@/lib/i18n";
import { logQueryError } from "./utils";

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
