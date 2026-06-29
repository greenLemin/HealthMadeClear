"use client";

import { useEffect, useState } from "react";

type ProgressBarSize = "sm" | "md" | "lg";

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  size?: ProgressBarSize;
  className?: string;
}

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export default function ProgressBar({
  value,
  label,
  showPercentage = false,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setWidth(Math.min(100, Math.max(0, value))));
    return () => cancelAnimationFrame(timer);
  }, [value]);

  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {label || showPercentage ? (
        <div className="mb-2 flex items-center justify-between text-label-md text-on-surface-variant">
          {label ? <span>{label}</span> : null}
          {showPercentage ? <span>{clamped}%</span> : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `Progress: ${clamped}%`}
        className={["w-full overflow-hidden rounded-full bg-surface-container", sizeStyles[size]].join(" ")}
      >
        <div
          className="h-full rounded-full bg-secondary transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export type { ProgressBarProps, ProgressBarSize };
