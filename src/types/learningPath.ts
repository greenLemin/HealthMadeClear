import type { PathId } from "@/types/content";

export interface LearningPath {
  id: PathId;
  title: string;
  description: string;
  lessons: string[];
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
  content?: {
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
