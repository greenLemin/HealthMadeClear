import type { LearningPath } from "@/types/learningPath";

export type Summary = {
  totalLessonsCompleted: number;
  totalLessonsAvailable: number;
  totalQuizzesPassed: number;
  totalQuizzesAttempted: number;
  averageQuizScore: number;
  totalTimeSpentMinutes: number;
  currentStreak: number;
  longestStreak: number;
};

export type LearningPathEntry = {
  path: LearningPath;
  completedLessonIds: string[];
  nextLesson: { id: string; title: string; duration: string } | null;
  progressPercentage: number;
  isComplete: boolean;
};

export type ActivityItem = {
  type: "lesson" | "quiz";
  lessonId?: string;
  quizId?: string;
  title: string;
  completedAt: string;
  score?: number;
  passed?: boolean;
};

export type AchievementItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
};

export type RecommendedLesson = {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  pathTitle?: string;
};

export type DashboardClientProps = {
  summary: Summary;
  learningPaths: LearningPathEntry[];
  recentActivity: ActivityItem[];
  achievements: AchievementItem[];
  recommendedNext: RecommendedLesson | null;
  displayName: string;
  locale: string;
};
