import type { PathId } from "@/types/content";

export interface LearningPath {
  id: PathId;
  title: string;
  description: string;
  lessons: string[];
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
}
