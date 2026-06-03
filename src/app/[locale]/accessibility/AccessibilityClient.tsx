"use client";

import PageHeader from "@/components/PageHeader";
import { useTranslations } from "next-intl";

export default function AccessibilityClient() {
  const t = useTranslations("accessibility");
  const tNav = useTranslations("nav");

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

        <div className="mx-auto max-w-3xl space-y-8">
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{t("commitmentTitle")}</h2>
            <p className="text-body-md text-on-surface-variant">{t("commitmentBody")}</p>
          </section>
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{t("featuresTitle")}</h2>
            <p className="text-body-md text-on-surface-variant">{t("featuresList")}</p>
          </section>
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{t("limitsTitle")}</h2>
            <p className="text-body-md text-on-surface-variant">{t("limitsBody")}</p>
          </section>
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{t("contactTitle")}</h2>
            <p className="text-body-md text-on-surface-variant">
              {t("contactBody")}{" "}
              <a href="/about#contact" className="font-semibold text-primary">
                {tNav("about")}
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
