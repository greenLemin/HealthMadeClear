import type { Lesson, LessonListItem } from "@/types/lesson";

export function toLessonListItems(lessons: Lesson[]): LessonListItem[] {
  return lessons.map(
    ({ id, title, description, category, categoryId, duration, level, image, imageAlt }) => ({
      id,
      title,
      description,
      category,
      categoryId,
      duration,
      level,
      image,
      imageAlt,
    })
  );
}
