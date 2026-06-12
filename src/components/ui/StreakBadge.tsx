"use client";

import { useTranslations } from "next-intl";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export default function StreakBadge({ streak, className = "" }: StreakBadgeProps) {
  const t = useTranslations("common");

  if (streak === 0) return null;

  const tooltip = t("streakTooltip", { streak });

  return (
    <span
      className={[
        "group relative inline-flex items-center gap-1 rounded-full bg-tertiary-container/40 px-3 py-1 text-label-md font-semibold text-tertiary",
        className,
      ].join(" ")}
      title={tooltip}
      aria-label={tooltip}
    >
      <span aria-hidden="true">🔥</span>
      <span aria-hidden="true">{streak}</span>
      <span
        className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-on-surface px-2 py-1 text-label-sm text-surface opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      >
        {tooltip}
      </span>
    </span>
  );
}
