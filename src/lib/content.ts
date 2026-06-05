import { learningPaths } from "@/data/learningPaths";
import type { LearningPath } from "@/types/learningPath";
import { lessons } from "@/data/lessons";
import type { Lesson } from "@/data/lessons";

export function getLessonsByPath(
  pathId: string,
  lessonItems: Lesson[] = lessons,
  pathItems: LearningPath[] = learningPaths
) {
  const path = pathItems.find((item) => item.id === pathId);

  if (!path) {
    return [];
  }

  const lessonMap = new Map<string, Lesson>();
  for (const lesson of lessonItems) {
    lessonMap.set(lesson.id, lesson);
  }

  return path.lessons
    .map((lessonId) => lessonMap.get(lessonId))
    .filter((lesson): lesson is Lesson => Boolean(lesson));
}

export function getPathProgress(
  pathId: string,
  completedLessonIds: string[],
  lessonItems: Lesson[] = lessons,
  pathItems: LearningPath[] = learningPaths
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
  startedPathIds: string[] = [],
  lessonItems: Lesson[] = lessons,
  pathItems: LearningPath[] = learningPaths
) {
  const completedLessonIdsSet = new Set(completedLessonIds);
  const startedPathIdsSet = new Set(startedPathIds);

  return pathItems.filter((path) => {
    if (startedPathIdsSet.has(path.id)) return true;
    return getLessonsByPath(path.id, lessonItems, pathItems).some((lesson) =>
      completedLessonIdsSet.has(lesson.id)
    );
  }).length;
}

export function getCompletedPathCount(
  completedLessonIds: string[],
  lessonItems: Lesson[] = lessons,
  pathItems: LearningPath[] = learningPaths
) {
  const completedLessonIdsSet = new Set(completedLessonIds);

  return pathItems.filter((path) => {
    const pathLessons = getLessonsByPath(path.id, lessonItems, pathItems);
    return pathLessons.length > 0 && pathLessons.every((lesson) => completedLessonIdsSet.has(lesson.id));
  }).length;
}
