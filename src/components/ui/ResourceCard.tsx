"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import Card from "@/components/ui/Card";

interface ResourceCardProps {
  href: string;
  title: string;
  description: string;
  footer: ReactNode;
  header?: ReactNode;
  onNavigate?: () => void;
}

export default function ResourceCard({
  href,
  title,
  description,
  footer,
  header,
  onNavigate,
}: ResourceCardProps) {
  return (
    <Link
      href={href}
      className="block"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || e.defaultPrevented) return;
        onNavigate?.();
      }}
    >
      <Card clickable padding="md" className="group overflow-hidden md:px-7 md:py-7">
        {header ? <div className="mb-4">{header}</div> : null}
        <h3 className="font-display text-headline-md text-primary transition-colors group-hover:text-primary-container">
          {title}
        </h3>
        <p className="mt-3 line-clamp-3 text-body-md text-on-surface-variant">{description}</p>
        <div className="mt-5 flex items-center justify-between text-label-md text-on-surface-variant">
          {footer}
        </div>
      </Card>
    </Link>
  );
}

export type { ResourceCardProps };
