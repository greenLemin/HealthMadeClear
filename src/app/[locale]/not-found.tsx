"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const t = useTranslations("errors");

  return (
    <div className="py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <div className="card max-w-xl">
          <h1 className="mb-3 text-headline-lg text-primary">{t("notFoundTitle")}</h1>
          <p className="mb-6 text-body-md text-on-surface-variant">{t("notFoundBody")}</p>
          <Link href="/" className="btn-primary inline-flex items-center justify-center">
            {t("goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
