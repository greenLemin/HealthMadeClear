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

  const lessonRecord = allLessons.reduce(
    (acc, lesson) => {
      acc[lesson.id] = lesson;
      return acc;
    },
    {} as Record<string, (typeof allLessons)[0]>
  );

  for (const path of allPaths) {
    const nextIncomplete = path.lessons.find((id) => !completedSet.has(id));
    if (nextIncomplete && path.lessons.some((id) => completedSet.has(id))) {
      const lesson = lessonRecord[nextIncomplete];
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

  for (let i = 0; i < allLessons.length; i++) {
    const l = allLessons[i];
    if (l.level === "beginner" && !completedSet.has(l.id)) {
      return {
        id: l.id,
        title: l.title,
        description: l.description,
        duration: l.duration,
        level: l.level,
      };
    }
  }

  for (let i = 0; i < allLessons.length; i++) {
    const l = allLessons[i];
    if (!completedSet.has(l.id)) {
      return {
        id: l.id,
        title: l.title,
        description: l.description,
        duration: l.duration,
        level: l.level,
      };
    }
  }

  return null;
}
