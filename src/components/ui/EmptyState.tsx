"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Search, BookOpen, TrendingUp } from "lucide-react";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";

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
    <Card variant="muted" className={["px-6 py-14", className].join(" ")}>
      <div className="flex flex-col items-center justify-center text-center" role="status">
        {displayIcon ? (
          <div
            className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface text-on-surface-variant shadow-elevation-1"
            aria-hidden="true"
          >
            {displayIcon}
          </div>
        ) : null}
        <h3 className="mb-2 max-w-xl font-display text-headline-md text-on-surface">{title}</h3>
        <p className="mb-6 max-w-xl text-body-md text-on-surface-variant">{description}</p>
        {action ? (
          action.href ? (
            <ButtonLink href={action.href}>{action.label}</ButtonLink>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )
        ) : null}
      </div>
    </Card>
  );
}

export type { EmptyStateProps };
