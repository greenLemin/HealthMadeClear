"use client";

import { useTranslations } from "next-intl";
import ButtonLink from "@/components/ui/ButtonLink";

export default function LocaleNotFound() {
  const t = useTranslations("errors");
  const tNav = useTranslations("nav");

  return (
    <div className="py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <div className="section-frame max-w-2xl px-6 py-8 md:px-8 md:py-10">
          <div className="eyebrow mb-4">Health Made Clear</div>
          <h1 className="mb-3 font-display text-headline-lg text-primary">{t("notFoundTitle")}</h1>
          <p className="mb-4 max-w-readable text-body-md text-on-surface-variant">{t("notFoundBody")}</p>
          <p className="mb-6 max-w-readable text-body-md text-on-surface-variant">{t("searchHint")}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/" size="lg" className="min-h-12 justify-center">
              {t("goHome")}
            </ButtonLink>
            <ButtonLink href="/learn" variant="secondary" size="lg" className="min-h-12 justify-center">
              {tNav("learn")}
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
