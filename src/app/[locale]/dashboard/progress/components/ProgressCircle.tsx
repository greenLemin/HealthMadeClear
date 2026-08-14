"use client";

import ProgressBar from "@/components/ui/ProgressBar";

interface ProgressCircleProps {
  percentage: number;
  label: string;
}

export default function ProgressCircle({ percentage, label }: ProgressCircleProps) {
  return (
    <div
      className="mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-full bg-surface shadow-elevation-2"
      role="img"
      aria-label={label}
    >
      <div className="relative flex h-44 w-44 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-surface-container"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${percentage * 2.64} 264`}
            strokeLinecap="round"
            className="text-secondary"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-headline-lg text-primary">{percentage}%</span>
          <span className="text-label-md text-on-surface-variant">{label}</span>
        </div>
      </div>
    </div>
  );
}
