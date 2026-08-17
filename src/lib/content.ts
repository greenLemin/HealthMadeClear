import type { LessonListItem } from "@/types/lesson";
import type { LearningPath } from "@/types/learningPath";

export function getLessonsByPath(pathId: string, lessonItems: LessonListItem[], pathItems: LearningPath[]) {
  const path = pathItems.find((item) => item.id === pathId);
  if (!path) return [];
  const lessonMap = new Map<string, LessonListItem>();
  for (const lesson of lessonItems) {
    lessonMap.set(lesson.id, lesson);
  }
  const result: LessonListItem[] = [];
  for (const id of path.lessons) {
    const lesson = lessonMap.get(id);
    if (lesson) result.push(lesson);
  }
  return result;
}

export function getPathProgress(
  pathId: string,
  completedLessonIds: string[],
  lessonItems: LessonListItem[],
  pathItems: LearningPath[]
) {
  const pathLessons = getLessonsByPath(pathId, lessonItems, pathItems);
  const completedLessonIdsSet = new Set(completedLessonIds);
  const completedCount = pathLessons.filter((lesson) => completedLessonIdsSet.has(lesson.id)).length;
  const totalCount = pathLessons.length;
  return {
    completedCount,
    totalCount,
    percentage: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
  };
}

export function getStartedPathCount(
  completedLessonIds: string[],
  startedPathIds: string[],
  lessonItems: LessonListItem[],
  pathItems: LearningPath[]
) {
  const completedLessonIdsSet = new Set(completedLessonIds);
  const startedPathIdsSet = new Set(startedPathIds);

  const validLessonIdsSet = new Set(lessonItems.map((l) => l.id as string));

  return pathItems.filter((path) => {
    if (startedPathIdsSet.has(path.id)) return true;
    return path.lessons.some(
      (lessonId) => validLessonIdsSet.has(lessonId as string) && completedLessonIdsSet.has(lessonId as string)
    );
  }).length;
}

export function getCompletedPathCount(
  completedLessonIds: string[],
  lessonItems: LessonListItem[],
  pathItems: LearningPath[]
) {
  const completedLessonIdsSet = new Set(completedLessonIds);
  const validLessonIdsSet = new Set(lessonItems.map((l) => l.id as string));

  return pathItems.filter((path) => {
    let hasValidLessons = false;
    let allValidCompleted = true;

    for (const lessonId of path.lessons) {
      if (validLessonIdsSet.has(lessonId as string)) {
        hasValidLessons = true;
        if (!completedLessonIdsSet.has(lessonId as string)) {
          allValidCompleted = false;
          break;
        }
      }
    }

    return hasValidLessons && allValidCompleted;
  }).length;
}
