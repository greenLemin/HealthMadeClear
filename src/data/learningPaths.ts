import type { PathId } from "@/types/content";

export interface LearningPath {
  id: PathId;
  title: string;
  description: string;
  lessons: string[];
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
}

export const learningPaths: LearningPath[] = [
  {
    id: 'safer-medicine-use',
    title: 'Safer Medicine Use',
    description: 'Learn how to safely take and manage your medications, understand prescription labels, and avoid drug interactions.',
    lessons: ['understanding-prescription-labels', 'asking-about-medications', 'managing-side-effects'],
    duration: '30 minutes',
    level: 'beginner',
    icon: '💊',
  },
  {
    id: 'doctor-visit-prep',
    title: 'Preparing for Doctor Visits',
    description: 'Get ready for your appointments by knowing what to bring, what questions to ask, and how to follow up.',
    lessons: ['before-your-visit', 'during-your-visit', 'after-your-visit'],
    duration: '25 minutes',
    level: 'beginner',
    icon: '🩺',
  },
  {
    id: 'understanding-labs',
    title: 'Understanding Lab Results',
    description: 'Learn to read common blood test results and understand what the numbers mean for your health.',
    lessons: ['blood-basics', 'common-tests', 'when-to-worry'],
    duration: '40 minutes',
    level: 'intermediate',
    icon: '🔬',
  },
];
