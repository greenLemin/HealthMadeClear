export const LESSON_IDS = [
  "understanding-prescription-labels",
  "asking-about-medications",
  "managing-side-effects",
  "before-your-visit",
  "during-your-visit",
  "after-your-visit",
  "blood-basics",
  "common-tests",
  "when-to-worry",
] as const;

export type LessonId = (typeof LESSON_IDS)[number];

export const PATH_IDS = ["safer-medicine-use", "doctor-visit-prep", "understanding-labs"] as const;
export type PathId = (typeof PATH_IDS)[number];

export type GlossaryId = string;

export type LessonCategoryId = "medication-safety" | "doctor-visits" | "lab-results";

export const LESSON_CATEGORY_IDS: LessonCategoryId[] = [
  "medication-safety",
  "doctor-visits",
  "lab-results",
];
