import type { Locale } from "@/lib/i18n";
import { getAllLessons as loadAllLessons, getLessonByIdFromBundle } from "@/lib/lessons/loadLessons";
import { getAllLearningPaths as loadAllPaths, getPathByIdFromBundle } from "@/lib/paths/loadPaths";
import { getAllQuizzes, getQuizByLessonId as getQuizForLesson } from "@/lib/localizedQuiz";
import { LESSON_CATEGORY_IDS } from "@/types/content";
import type { Lesson, LessonListItem } from "@/types/lesson";
import type { Quiz } from "@/types/quiz";
import type { LearningPath } from "@/types/learningPath";

// ── Part 1: Spec-compliant content access functions ──

export async function getAllLessons(filters?: {
  category?: string;
  difficulty?: Lesson["level"];
  locale?: Locale;
}): Promise<Lesson[]> {
  const locale = filters?.locale ?? "en";
  let lessons = loadAllLessons(locale);
  if (filters?.category) {
    lessons = lessons.filter((l) => l.categoryId === filters.category);
  }
  if (filters?.difficulty) {
    lessons = lessons.filter((l) => l.level === filters.difficulty);
  }
  return lessons;
}

export async function getLessonById(id: string, locale: Locale = "en"): Promise<Lesson | null> {
  return getLessonByIdFromBundle(id, locale) ?? null;
}

export async function getCategories(
  locale: Locale = "en"
): Promise<{ id: string; label: string; count: number }[]> {
  const lessons = loadAllLessons(locale);
  const categoryCounts = new Map<string, number>();

  for (let i = 0; i < lessons.length; i++) {
    const categoryId = lessons[i].categoryId;
    categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1);
  }

  return LESSON_CATEGORY_IDS.map((id) => ({
    id,
    label: id,
    count: categoryCounts.get(id) || 0,
  }));
}

export async function getQuizByLessonId(lessonId: string, locale: Locale = "en"): Promise<Quiz | null> {
  return getQuizForLesson(lessonId, locale);
}

export async function getQuizById(id: string, locale: Locale = "en"): Promise<Quiz | null> {
  const quizzes = getAllQuizzes(locale);
  return quizzes.find((q) => q.id === id) ?? null;
}

export async function getAllLearningPaths(locale: Locale = "en"): Promise<LearningPath[]> {
  return loadAllPaths(locale);
}

export async function getLearningPathById(id: string, locale: Locale = "en"): Promise<LearningPath | null> {
  return getPathByIdFromBundle(id, locale) ?? null;
}

export async function getLessonsForPath(pathId: string, locale: Locale = "en"): Promise<Lesson[]> {
  const path = getPathByIdFromBundle(pathId, locale);
  if (!path) return [];
  const lessons = loadAllLessons(locale);
  const lessonMap = new Map<string, Lesson>(lessons.map((l) => [l.id, l]));
  return path.lessons.map((id) => lessonMap.get(id)).filter(Boolean) as Lesson[];
}

// ── Part 2: Path utility functions (used by dashboard, HomeClient, etc.) ──

export function getLessonsByPath(pathId: string, lessonItems: LessonListItem[], pathItems: LearningPath[]) {
  const path = pathItems.find((item) => item.id === pathId);
  if (!path) return [];
  const lessonMap = new Map<string, LessonListItem>();
  for (const lesson of lessonItems) {
    lessonMap.set(lesson.id, lesson);
  }
  return path.lessons
    .map((lessonId) => lessonMap.get(lessonId))
    .filter((lesson): lesson is LessonListItem => Boolean(lesson));
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
  return pathItems.filter((path) => {
    if (startedPathIdsSet.has(path.id)) return true;
    return getLessonsByPath(path.id, lessonItems, pathItems).some((lesson) =>
      completedLessonIdsSet.has(lesson.id)
    );
  }).length;
}

export function getCompletedPathCount(
  completedLessonIds: string[],
  lessonItems: LessonListItem[],
  pathItems: LearningPath[]
) {
  const completedLessonIdsSet = new Set(completedLessonIds);
  return pathItems.filter((path) => {
    const pathLessons = getLessonsByPath(path.id, lessonItems, pathItems);
    return pathLessons.length > 0 && pathLessons.every((lesson) => completedLessonIdsSet.has(lesson.id));
  }).length;
}
