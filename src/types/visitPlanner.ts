export const VISIT_TYPE_KEYS = ["new-symptom", "medication", "followup"] as const;
export type VisitTypeKey = (typeof VISIT_TYPE_KEYS)[number];
export type StepValue = 1 | 2 | 3;

export type CustomQuestion = { id: string; text: string };

/** Catalog row: `{visitType}:{zeroBasedIndex}` plus locale-resolved text. */
export type PlannerQuestion = { id: string; text: string };

export type PlannerState = {
  visitType: VisitTypeKey;
  /** Values are ids like `new-symptom:0`, not translated question text. */
  selectedQuestions: string[];
  customQuestions?: CustomQuestion[];
  notes: string;
  step: StepValue;
};
