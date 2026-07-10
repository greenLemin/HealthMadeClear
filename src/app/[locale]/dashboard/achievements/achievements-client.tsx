"use client";

import { useTranslations } from "next-intl";
import { Award, Lock, Sparkles } from "lucide-react";
import AchievementCard from "@/components/dashboard/AchievementCard";
import PageHeader from "@/components/PageHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import Reveal from "@/components/ui/Reveal";
import type { AchievementItem } from "@/components/dashboard/AchievementCard";

type AchievementsClientProps = {
  achievements: AchievementItem[];
  earnedCount: number;
  totalCount: number;
};

type CopyProps = {
  galleryLabel: string;
  completionLabel: string;
  earnedLabel: string;
  lockedHint: string;
};

type AchievementsProgressProps = {
  earnedPercent: number;
  earnedCount: number;
  totalCount: number;
  lockedCount: number;
  lockedLabel: string;
  copy: CopyProps;
  summaryText: string;
};

type AchievementsStatsProps = {
  earnedCount: number;
  totalCount: number;
  lockedCount: number;
  lockedLabel: string;
  copy: CopyProps;
  summaryText: string;
  keepLearningText: string;
};

type AchievementsListProps = {
  achievements: AchievementItem[];
};

export default function AchievementsClient({
  achievements,
  earnedCount,
  totalCount,
}: AchievementsClientProps) {
  const t = useTranslations("achievements");
  const lockedCount = totalCount - earnedCount;
  const lockedLabel = t("lockedLabel");
  const copy = {
    galleryLabel: t("galleryLabel"),
    completionLabel: t("completionLabel"),
    earnedLabel: t("earnedLabel"),
    lockedHint: t("lockedHint"),
  };
  const summaryText = t("earnedSummary", { count: earnedCount, total: totalCount });
  const keepLearningText = t("keepLearning");
  const earnedPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-10">
      <PageHeader centered title={t("title")} description={summaryText}>
        <div className="flex flex-wrap justify-center gap-3">
          <span className="metric-pill">
            <Award size={18} aria-hidden="true" />
            {summaryText}
          </span>
          <span className="metric-pill bg-secondary-container/60 text-secondary">
            <Lock size={18} aria-hidden="true" />
            {lockedCount} {lockedLabel}
          </span>
        </div>
      </PageHeader>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <AchievementsProgress
          earnedPercent={earnedPercent}
          earnedCount={earnedCount}
          totalCount={totalCount}
          lockedCount={lockedCount}
          lockedLabel={lockedLabel}
          copy={copy}
          summaryText={summaryText}
        />
        <AchievementsStats
          earnedCount={earnedCount}
          totalCount={totalCount}
          lockedCount={lockedCount}
          lockedLabel={lockedLabel}
          copy={copy}
          summaryText={summaryText}
          keepLearningText={keepLearningText}
        />
      </section>

      <AchievementsList achievements={achievements} />
    </div>
  );
}

function AchievementsProgress({
  earnedPercent,
  earnedCount,
  lockedCount,
  lockedLabel,
  copy,
  summaryText,
}: AchievementsProgressProps) {
  return (
    <Reveal>
      <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow mb-4">{copy.galleryLabel}</div>
            <div className="font-display text-headline-xl text-primary">{earnedPercent}%</div>
            <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">
              {summaryText}. {copy.lockedHint}
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-primary shadow-elevation-1">
            <Sparkles size={28} aria-hidden="true" />
          </div>
        </div>

        <ProgressBar value={earnedPercent} label={copy.completionLabel} showPercentage className="mt-6" />

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="metric-pill">
            <Award size={18} aria-hidden="true" />
            {earnedCount} {copy.earnedLabel}
          </span>
          <span className="metric-pill bg-secondary-container/60 text-secondary">
            <Lock size={18} aria-hidden="true" />
            {lockedCount} {lockedLabel}
          </span>
        </div>
      </div>
    </Reveal>
  );
}

function AchievementsStats({
  earnedCount,
  lockedCount,
  lockedLabel,
  copy,
  summaryText,
  keepLearningText,
}: AchievementsStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Reveal delay={0.05}>
        <div className="surface-card px-6 py-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary shadow-elevation-1">
            <Award size={22} aria-hidden="true" />
          </div>
          <div className="eyebrow mb-3">{copy.earnedLabel}</div>
          <div className="font-display text-headline-lg text-primary">{earnedCount}</div>
          <p className="mt-2 text-body-md text-on-surface-variant">{summaryText}</p>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="surface-card-muted px-6 py-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-secondary shadow-elevation-1">
            <Lock size={22} aria-hidden="true" />
          </div>
          <div className="eyebrow mb-3">{lockedLabel}</div>
          <div className="font-display text-headline-lg text-primary">{lockedCount}</div>
          <p className="mt-2 text-body-md text-on-surface-variant">{keepLearningText}</p>
        </div>
      </Reveal>
    </div>
  );
}

function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {achievements.map((achievement, index) => (
        <Reveal key={achievement.id} delay={Math.min(index * 0.03, 0.2)}>
          <AchievementCard achievement={achievement} />
        </Reveal>
      ))}
    </section>
  );
}
