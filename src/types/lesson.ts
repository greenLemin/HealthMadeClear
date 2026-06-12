import type { LessonCategoryId, LessonId } from "@/types/content";

export type LessonListItem = Pick<
  Lesson,
  | "id"
  | "title"
  | "description"
  | "category"
  | "categoryId"
  | "duration"
  | "level"
  | "image"
  | "imageAlt"
  | "estimatedMinutes"
  | "wordCount"
>;

export interface Lesson {
  id: LessonId;
  title: string;
  description: string;
  category: string;
  categoryId: LessonCategoryId;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  lastReviewed?: string;
  reviewedBy?: string;
  sources?: string[];
  imageAlt?: string;
  image?: string;
  sidebarTips?: string[];
  sidebarTitle?: string;
  keyTakeaways?: string[];
  estimatedMinutes?: number;
  wordCount?: number;
  publishedAt?: string;
  updatedAt?: string;
  relatedLessonIds?: string[];
  quizId?: string;
  learningPathIds?: string[];
  content: {
    sections: {
      title: string;
      content: string;
      callouts?: {
        type: "info" | "success" | "warning";
        content: string;
      }[];
    }[];
  };
}
