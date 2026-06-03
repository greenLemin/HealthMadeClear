"use client";

import PageHeader from "@/components/PageHeader";
import { useTranslations } from "next-intl";

export default function PrivacyClient() {
  const t = useTranslations("privacy");

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader title={t("title")} description={t("description")} />

        <div className="mx-auto max-w-3xl space-y-8">
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{t("educationTitle")}</h2>
            <p className="text-body-md text-on-surface-variant">{t("educationBody")}</p>
          </section>
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{t("collectTitle")}</h2>
            <p className="text-body-md text-on-surface-variant">{t("collectBody")}</p>
          </section>
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{t("controlTitle")}</h2>
            <p className="text-body-md text-on-surface-variant">{t("controlBody")}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
