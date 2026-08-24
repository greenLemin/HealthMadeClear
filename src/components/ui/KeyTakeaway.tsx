"use client";

import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";

interface KeyTakeawayProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export default function KeyTakeaway({ children, title, className = "" }: KeyTakeawayProps) {
  const t = useTranslations("learn");
  const displayTitle = title ?? t("keyTakeaways");
  return (
    <aside aria-label={displayTitle} className={["rounded-2xl bg-primary-fixed/30 p-5", className].join(" ")}>
      <div className="mb-2 flex items-center gap-2 text-label-lg text-primary">
        <Lightbulb size={20} aria-hidden="true" />
        <span>{displayTitle}</span>
      </div>
      <div className="text-body-md text-on-surface-variant">{children}</div>
    </aside>
  );
}
