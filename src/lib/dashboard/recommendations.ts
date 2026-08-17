import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import type { Locale } from "@/lib/i18n";
import type { RecommendedLesson } from "@/types/dashboard";
import { logQueryError } from "./utils";

export async function getRecommendedNextLesson(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = "en"
): Promise<RecommendedLesson | null> {
  const allPaths = getAllLearningPaths(locale);
  const allLessons = getAllLessons(locale);

  const { data: progressData, error: progressError } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("completed", true);

  logQueryError("getRecommendedNextLesson", progressError);

  const completedSet = new Set((progressData ?? []).map((p) => p.lesson_id));

  let lastBeginnerIndex = -1;
  const lessonRecord = allLessons.reduce(
    (acc, lesson, index) => {
      acc[lesson.id] = lesson;
      if (lesson.level === "beginner") {
        lastBeginnerIndex = index;
      }
      return acc;
    },
    {} as Record<string, (typeof allLessons)[0]>
  );

  for (const path of allPaths) {
    let nextIncomplete: string | undefined;
    let hasCompleted = false;

    for (const id of path.lessons) {
      if (completedSet.has(id)) {
        hasCompleted = true;
      } else if (nextIncomplete === undefined) {
        nextIncomplete = id;
      }

      if (hasCompleted && nextIncomplete !== undefined) {
        break;
      }
    }

    if (hasCompleted && nextIncomplete !== undefined) {
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

  let firstUncompleted: (typeof allLessons)[0] | null = null;
  for (let i = 0; i < allLessons.length; i++) {
    const l = allLessons[i];
    if (!completedSet.has(l.id)) {
      if (l.level === "beginner") {
        return {
          id: l.id,
          title: l.title,
          description: l.description,
          duration: l.duration,
          level: l.level,
        };
      }
      if (!firstUncompleted) {
        firstUncompleted = l;
      }
    }
    // Optimization: if we have already found the first uncompleted lesson
    // and we are past the last known beginner lesson, we can break early.
    if (firstUncompleted && i >= lastBeginnerIndex) {
      break;
    }
  }

  if (firstUncompleted) {
    return {
      id: firstUncompleted.id,
      title: firstUncompleted.title,
      description: firstUncompleted.description,
      duration: firstUncompleted.duration,
      level: firstUncompleted.level,
    };
  }

  return null;
}
