"use client";

import { useLocale, useTranslations } from "next-intl";
import { Flame } from "lucide-react";
import { formatUtcDay, utcDay, utcToday } from "@/lib/streakDisplay";

interface StreakCalendarProps {
  activeDays: string[];
  currentStreak: number;
  longestStreak: number;
  hasActivityToday: boolean;
}

export default function StreakCalendar({
  activeDays,
  currentStreak,
  longestStreak,
  hasActivityToday,
}: StreakCalendarProps) {
  const t = useTranslations("progress");
  const locale = useLocale();
  const today = utcToday();
  const activeSet = new Set(activeDays);

  const calendarDays = Array.from({ length: 30 }, (_, i) => utcDay(i - 29));

  return (
    <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
      <div className="eyebrow mb-3">{t("streakHistory")}</div>
      <h2 className="font-display text-headline-lg text-primary">{t("last30Days")}</h2>
      <p className="mt-3 text-body-md text-on-surface-variant">
        {hasActivityToday ? t("activeToday") : t("keepStreakAlive")}
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-[1.5rem] bg-surface px-5 py-5 shadow-elevation-1">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tertiary-container/55 text-tertiary">
          <Flame size={26} aria-hidden="true" />
        </div>
        <div>
          <p className="text-label-md text-on-surface-variant">{t("currentStreak")}</p>
          <p className="font-display text-headline-md text-primary">
            {t("daysValue", { count: currentStreak })}
          </p>
          <p className="text-label-md text-on-surface-variant">
            {t("longestStreak", { count: longestStreak })}
          </p>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-10 gap-1.5" aria-label={t("streakHistory")}>
        {calendarDays.map((dateStr) => {
          const isActive = activeSet.has(dateStr);
          const isToday = dateStr === today;
          const dayLabel = formatUtcDay(dateStr, locale, { weekday: true });
          return (
            <li
              key={dateStr}
              className={[
                "aspect-square rounded-md",
                isActive ? "bg-secondary shadow-elevation-1" : "bg-surface-container",
                isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent" : "",
              ].join(" ")}
            >
              <span className="sr-only">
                {isActive
                  ? t("activeDayLabel", { date: dayLabel })
                  : t("inactiveDayLabel", { date: dayLabel })}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs opacity-70">{t("streakResetNote")}</p>
    </div>
  );
}
