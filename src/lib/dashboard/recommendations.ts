import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import type { Locale } from "@/lib/i18n";
import { logQueryError } from "./utils";

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
