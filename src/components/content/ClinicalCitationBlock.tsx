"use client";

import { useTranslations } from "next-intl";

type ClinicalCitationBlockProps = {
  sources?: string[];
  reviewedBy?: string;
  lastReviewed?: string | null;
  compact?: boolean;
  className?: string;
};

function trimmedSources(sources?: string[]): string[] {
  if (!sources?.length) return [];
  return sources.map((source) => source.trim()).filter(Boolean);
}

export default function ClinicalCitationBlock({
  sources,
  reviewedBy,
  lastReviewed,
  compact = false,
  className = "",
}: ClinicalCitationBlockProps) {
  const t = useTranslations("learn");
  const reviewer = reviewedBy?.trim() ?? "";
  const date = lastReviewed?.trim() ?? "";
  const list = trimmedSources(sources);

  if (!reviewer && !date && list.length === 0) {
    return null;
  }

  if (compact) {
    const parts: string[] = [];
    if (reviewer) parts.push(t("reviewedBy", { name: reviewer }));
    if (date) parts.push(date);
    if (list.length > 0) parts.push(`${t("sources")}: ${list.join(" / ")}`);
    if (parts.length === 0) return null;
    return (
      <p className={`mt-3 text-label-md text-on-surface-variant ${className}`.trim()}>{parts.join(" · ")}</p>
    );
  }

  return (
    <div className={className}>
      {reviewer ? (
        <p className="text-label-md text-on-surface-variant">{t("reviewedBy", { name: reviewer })}</p>
      ) : null}
      {date ? (
        <p className={`text-label-md text-on-surface-variant ${reviewer ? "mt-2" : ""}`.trim()}>
          {t("lastReviewed")}: {date}
        </p>
      ) : null}
      {list.length > 0 ? (
        <div className={reviewer || date ? "mt-4" : ""}>
          <div className="font-semibold text-primary">{t("sources")}</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-label-md text-on-surface-variant">
            {list.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
