"use client";

import { Flame } from "lucide-react";

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
  const today = new Date().toISOString().split("T")[0];
  const activeSet = new Set(activeDays);

  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
      <div className="eyebrow mb-3">Streak History</div>
      <h2 className="font-display text-headline-lg text-primary">Last 30 Days</h2>
      <p className="mt-3 text-body-md text-on-surface-variant">
        {hasActivityToday ? "Active today" : "Keep your streak alive!"}
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-[1.5rem] bg-surface px-5 py-5 shadow-elevation-1">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tertiary-container/55 text-tertiary">
          <Flame size={26} aria-hidden="true" />
        </div>
        <div>
          <p className="text-label-md text-on-surface-variant">Current Streak</p>
          <p className="font-display text-headline-md text-primary">{currentStreak} days</p>
          <p className="text-label-md text-on-surface-variant">Longest: {longestStreak} days</p>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-10 gap-1.5" aria-label="Streak calendar">
        {calendarDays.map((dateStr) => {
          const isActive = activeSet.has(dateStr);
          const isToday = dateStr === today;
          return (
            <li
              key={dateStr}
              className={[
                "aspect-square rounded-md",
                isActive ? "bg-secondary shadow-elevation-1" : "bg-surface-container",
                isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent" : "",
              ].join(" ")}
            >
              <span className="sr-only">{isActive ? "Active" : "Inactive"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
