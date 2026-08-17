import type { LessonId } from "@/types/content";

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
  relatedLessons?: LessonId[];
}

/** The minimal shape of a glossary term needed to render the popover. */
export interface GlossaryTermSummary {
  id: string;
  term: string;
  definition: string;
}
