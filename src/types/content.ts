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
  "why-preventive-care-matters",
  "common-adult-screenings",
  "understanding-vaccines",
  "living-with-hypertension",
  "understanding-type2-diabetes",
  "asthma-basics",
  "introduction-to-heart-disease",
  "understanding-depression",
  "anxiety-and-panic",
  "sleep-and-health",
  "understanding-health-insurance",
  "reading-medical-bills",
  "when-to-call-911",
  "building-first-aid-kit",
  "reading-nutrition-labels",
  "building-balanced-plate",
  "understanding-allergies",
  "pain-medications-safely",
  "understanding-copay-assistance",
  "cancer-screening-basics",
  "managing-stress",
  "hydration-and-health",
  "when-to-use-urgent-care",
  "reading-lab-report",
  "generic-vs-brand-drugs",
  "sleep-apnea-basics",
  "otc-drug-interactions",
  "antibiotic-stewardship",
  "drug-food-interactions",
  "micronutrient-deficiencies",
  "glycemic-index-and-load",
  "understanding-lipids",
  "how-statins-work",
  "heart-attack-vs-stroke-signs",
  "type-1-vs-type-2-diabetes",
  "thyroid-disorders-basics",
  "insulin-resistance-explained",
  "how-antidepressants-work",
  "copd-vs-asthma",
  "understanding-oxygen-saturation",
  "smoking-cessation-medicines",
  "understanding-cbc",
  "understanding-a1c",
] as const;

export type LessonId = (typeof LESSON_IDS)[number];

export const PATH_IDS = [
  "safer-medicine-use",
  "doctor-visit-prep",
  "understanding-labs",
  "managing-new-diagnosis",
  "staying-healthy-preventive",
  "mental-wellness-basics",
  "navigating-healthcare",
] as const;
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

export type LessonCategoryId =
  | "medication-safety"
  | "doctor-visits"
  | "lab-results"
  | "preventive-care"
  | "chronic-conditions"
  | "mental-health"
  | "insurance-billing"
  | "emergency"
  | "nutrition";

export const ARTICLE_IDS = [
  "choosing-primary-care-doctor",
  "annual-physical-what-to-expect",
  "pharmacy-benefits-basics",
  "health-literacy-better-questions",
  "reliable-online-health-info",
  "understanding-your-eob",
  "finding-in-network-providers",
  "preparing-for-blood-draw",
  "second-opinion-basics",
  "telehealth-visit-tips",
  "medication-adherence-strategies",
  "when-to-call-your-doctor",
  "patient-portal-basics",
  "health-literacy-for-caregivers",
  "understanding-prior-authorization",
] as const;

export type ArticleId = (typeof ARTICLE_IDS)[number];

export const LESSON_CATEGORY_IDS: LessonCategoryId[] = [
  "medication-safety",
  "doctor-visits",
  "lab-results",
  "preventive-care",
  "chronic-conditions",
  "mental-health",
  "insurance-billing",
  "emergency",
  "nutrition",
];
