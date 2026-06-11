import type { LessonCategoryId, LessonId } from "@/types/content";

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
