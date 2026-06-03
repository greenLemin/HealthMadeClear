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

export const GLOSSARY_IDS = [
  "blood-pressure",
  "hypertension",
  "hypotension",
  "cholesterol",
  "ldl",
  "hdl",
  "triglycerides",
  "diabetes",
  "blood-sugar",
  "glucose",
  "insulin",
  "chronic",
  "acute",
  "symptom",
  "sign",
  "diagnosis",
  "prognosis",
  "side-effect",
  "dosage",
  "generic-drug",
  "prescription",
  "over-the-counter",
  "biopsy",
  "ct-scan",
  "mri",
  "ultrasound",
  "inflammation",
  "immune-system",
  "metabolism",
  "placebo",
  "clinical-trial",
] as const;

export type GlossaryId = (typeof GLOSSARY_IDS)[number];

export type LessonCategoryId = "medication-safety" | "doctor-visits" | "lab-results";

export const LESSON_CATEGORY_IDS: LessonCategoryId[] = ["medication-safety", "doctor-visits", "lab-results"];
