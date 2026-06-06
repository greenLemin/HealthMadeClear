import type { Lesson } from "@/types/lesson";
import type { LearningPath } from "@/types/learningPath";

export function getLessonsByPath(
  pathId: string,
  lessonItems: Lesson[],
  pathItems: LearningPath[]
) {
  const path = pathItems.find((item) => item.id === pathId);

  if (!path) {
    return [];
  }

  return path.lessons
    .map((lessonId) => lessonItems.find((lesson) => lesson.id === lessonId))
    .filter((lesson): lesson is Lesson => Boolean(lesson));
}

export function getPathProgress(
  pathId: string,
  completedLessonIds: string[],
  lessonItems: Lesson[],
  pathItems: LearningPath[]
) {
  const pathLessons = getLessonsByPath(pathId, lessonItems, pathItems);
  const completedCount = pathLessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
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
  lessonItems: Lesson[],
  pathItems: LearningPath[]
) {
  return pathItems.filter((path) => {
    if (startedPathIds.includes(path.id)) return true;
    return getLessonsByPath(path.id, lessonItems, pathItems).some((lesson) =>
      completedLessonIds.includes(lesson.id)
    );
  }).length;
}

export function getCompletedPathCount(
  completedLessonIds: string[],
  lessonItems: Lesson[],
  pathItems: LearningPath[]
) {
  return pathItems.filter((path) => {
    const pathLessons = getLessonsByPath(path.id, lessonItems, pathItems);
    return pathLessons.length > 0 && pathLessons.every((lesson) => completedLessonIds.includes(lesson.id));
  }).length;
}
