"use client";

import type { ReactNode } from "react";

interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  centered?: boolean;
  children?: ReactNode;
}

export default function PageHeader({ badge, title, description, centered = false, children }: PageHeaderProps) {
  return (
    <div className={centered ? "mx-auto mb-12 max-w-3xl text-center" : "mb-10 max-w-3xl"}>
      {badge ? (
        <div className="mb-3 inline-flex rounded-full bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface-variant">
          {badge}
        </div>
      ) : null}
      <h1 className="mb-4 text-headline-xl text-primary">{title}</h1>
      {description ? <p className="text-body-lg text-on-surface-variant">{description}</p> : null}
      {children}
    </div>
  );
}
