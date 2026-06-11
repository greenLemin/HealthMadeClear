import type { LessonId } from "@/types/content";

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
  relatedLessons?: LessonId[];
}
