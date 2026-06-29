"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { reportClientError } from "@/lib/errorReporting";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    reportClientError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <div className="section-frame max-w-2xl px-6 py-8 md:px-8 md:py-10">
          <div className="eyebrow mb-4">Health Made Clear</div>
          <h1 className="mb-3 font-display text-headline-lg text-primary">{t("title")}</h1>
          <p className="mb-6 max-w-readable text-body-md text-on-surface-variant">{t("body")}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={() => reset()}>
              {t("retry")}
            </button>
            <Link href="/" className="btn-secondary">
              {t("home")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
