import type { LessonCategoryId, LessonId } from "@/types/content";

export interface Lesson {
  id: LessonId;
  title: string;
  description: string;
  category: string;
  categoryId: LessonCategoryId;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
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
