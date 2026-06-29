"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const t = useTranslations("errors");

  return (
    <div className="py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <div className="section-frame max-w-2xl px-6 py-8 md:px-8 md:py-10">
          <div className="eyebrow mb-4">Health Made Clear</div>
          <h1 className="mb-3 font-display text-headline-lg text-primary">{t("notFoundTitle")}</h1>
          <p className="mb-6 max-w-readable text-body-md text-on-surface-variant">{t("notFoundBody")}</p>
          <Link href="/" className="btn-primary inline-flex items-center justify-center">
            {t("goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
