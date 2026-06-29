"use client";

import { useTranslations } from "next-intl";
import { formatRelativeDate } from "@/lib/i18n";

export type AchievementItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
};

interface AchievementCardProps {
  achievement: AchievementItem;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const t = useTranslations("achievements");
  return (
    <div
      className={`group relative flex min-h-[14.5rem] flex-col overflow-hidden rounded-[1.75rem] border p-6 text-left transition-all duration-300 ease-premium ${
        achievement.earned
          ? "border-secondary/25 bg-gradient-to-br from-surface via-surface to-primary-fixed/15 shadow-card hover:-translate-y-1 hover:shadow-card-hover"
          : "border-dashed border-outline-variant bg-surface-container-low/85"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          achievement.earned
            ? "bg-gradient-to-r from-secondary via-primary to-tertiary"
            : "bg-gradient-to-r from-outline-variant via-surface-container-highest to-outline-variant"
        }`}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full shadow-elevation-1 ${
            achievement.earned
              ? "bg-primary-fixed text-headline-xl"
              : "bg-surface text-headline-lg opacity-45 grayscale"
          }`}
          aria-hidden="true"
        >
          {achievement.icon}
        </div>
        {!achievement.earned ? (
          <span className="rounded-full bg-surface px-3 py-1 text-label-sm font-semibold text-on-surface-variant">
            {t("keepLearning")}
          </span>
        ) : achievement.earnedAt ? (
          <span className="rounded-full bg-secondary-container/60 px-3 py-1 text-label-sm font-semibold text-secondary">
            {formatRelativeDate(achievement.earnedAt)}
          </span>
        ) : null}
      </div>
      <p
        className={`mt-5 font-display text-headline-md ${
          achievement.earned ? "text-primary" : "text-on-surface"
        }`}
      >
        {achievement.title}
      </p>
      <p className="mt-3 flex-1 text-body-md text-on-surface-variant">
        {achievement.earned ? achievement.description : achievement.description || t("keepLearning")}
      </p>
      <div className="mt-5 flex items-center gap-2 text-label-md text-on-surface-variant">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            achievement.earned ? "bg-secondary" : "bg-outline-variant"
          }`}
          aria-hidden="true"
        />
        <span>
          {achievement.earned && achievement.earnedAt
            ? formatRelativeDate(achievement.earnedAt)
            : t("keepLearning")}
        </span>
      </div>
    </div>
  );
}
