"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Search, BookOpen, TrendingUp } from "lucide-react";
import Button from "@/components/ui/Button";

interface EmptyStateProps {
  variant?: "default" | "search" | "learning" | "activity";
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    href?: string;
  };
  className?: string;
}

export default function EmptyState({
  variant = "default",
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  let displayIcon = icon;
  if (!displayIcon) {
    switch (variant) {
      case "search":
        displayIcon = <Search size={40} aria-hidden="true" />;
        break;
      case "learning":
        displayIcon = <BookOpen size={40} aria-hidden="true" />;
        break;
      case "activity":
        displayIcon = <TrendingUp size={40} aria-hidden="true" />;
        break;
    }
  }

  return (
    <div
      className={["flex flex-col items-center justify-center px-6 py-16 text-center", className].join(" ")}
      role="status"
    >
      {displayIcon ? (
        <div className="mb-4 text-on-surface-variant" aria-hidden="true">
          {displayIcon}
        </div>
      ) : null}
      <h3 className="mb-2 text-headline-md text-on-surface">{title}</h3>
      <p className="mb-6 max-w-md text-body-md text-on-surface-variant">{description}</p>
      {action ? (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-label-lg font-semibold text-on-primary hover:bg-primary-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {action.label}
          </Link>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      ) : null}
    </div>
  );
}

export type { EmptyStateProps };
