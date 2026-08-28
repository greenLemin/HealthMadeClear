"use client";

import { useTranslations } from "next-intl";

export default function TrustBanner({ className = "" }: { className?: string }) {
  const t = useTranslations("trust");

  return (
    <p
      role="note"
      className={`inline-flex max-w-full rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface ${className}`.trim()}
    >
      {t("banner")}
    </p>
  );
}
