"use client";

import { useTranslations } from "next-intl";
import AchievementCard from "@/components/dashboard/AchievementCard";
import EmptyState from "@/components/ui/EmptyState";
import type { AchievementItem } from "@/components/dashboard/AchievementCard";

type AchievementsClientProps = {
  achievements: AchievementItem[];
  earnedCount: number;
  totalCount: number;
};

export default function AchievementsClient({
  achievements,
  earnedCount,
  totalCount,
}: AchievementsClientProps) {
  const t = useTranslations("achievements");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-headline-lg text-primary">{t("title")}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {t("earnedSummary", { count: earnedCount, total: totalCount })}
        </p>
      </div>

      {earnedCount === 0 ? (
        <EmptyState
          variant="learning"
          title={t("noneEarnedTitle")}
          description={t("keepLearning")}
          action={{ label: t("startLearningCta"), href: "/learn", onClick: () => {} }}
          className="rounded-2xl border border-outline-variant bg-surface-container-lowest"
        />
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
