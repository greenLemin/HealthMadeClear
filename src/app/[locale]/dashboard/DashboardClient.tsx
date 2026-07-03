"use client";

import DashboardHeader from "./components/DashboardHeader";
import DashboardStats from "./components/DashboardStats";
import RecommendedNext from "./components/RecommendedNext";
import LearningPaths from "./components/LearningPaths";
import RecentActivity from "./components/RecentActivity";
import EarnedAchievements from "./components/EarnedAchievements";
import type { DashboardClientProps } from "./types";

export default function DashboardClient({
  summary,
  learningPaths,
  recentActivity,
  achievements,
  recommendedNext,
  displayName,
  locale,
}: DashboardClientProps) {
  const isFirstVisit = summary.totalLessonsCompleted === 0;
  const earnedAchievements = achievements.filter((a) => a.earned);
  const activePaths = learningPaths.filter((lp) => !lp.isComplete && lp.completedLessonIds.length > 0);
  const inProgressPaths = learningPaths.filter((lp) => lp.completedLessonIds.length > 0);

  return (
    <div className="space-y-10">
      <DashboardHeader summary={summary} displayName={displayName} />
      <DashboardStats summary={summary} locale={locale} />
      <RecommendedNext
        isFirstVisit={isFirstVisit}
        recommendedNext={recommendedNext}
        activePaths={activePaths}
      />
      <LearningPaths inProgressPaths={inProgressPaths} />
      <RecentActivity recentActivity={recentActivity} recommendedNext={recommendedNext} locale={locale} />
      <EarnedAchievements earnedAchievements={earnedAchievements} locale={locale} />
    </div>
  );
}
