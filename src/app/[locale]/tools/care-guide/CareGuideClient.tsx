"use client";

import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import { useTranslations } from "next-intl";

export default function CareGuideClient() {
  const t = useTranslations("tools");
  const tDisclaimer = useTranslations("disclaimer");

  const careOptions = [
    { title: t("homeCare"), description: t("homeCareBody"), tone: "border-outline-variant bg-surface" },
    {
      title: t("primaryCare"),
      description: t("primaryCareBody"),
      tone: "border-outline-variant bg-secondary-container/40",
    },
    {
      title: t("urgentCare"),
      description: t("urgentCareBody"),
      tone: "border-transparent bg-secondary-container",
    },
    { title: t("emergency"), description: t("emergencyBody"), tone: "border-error bg-error-container" },
  ];

  return (
    <main className="pb-16">
      <div className="no-print bg-error px-4 py-3 text-center text-sm font-semibold text-on-error">
        {tDisclaimer("emergencyTitle")}:{" "}
        {t("emergencyShort", { defaultValue: "Call 911 if you have a life-threatening emergency." })}
      </div>
      <div className="max-w-container mx-auto px-4 py-12 md:px-6">
        <PageHeader centered title={t("careGuideTitle")} description={t("careGuideDescription")} />

        <section className="mb-12">
          <h2 className="sr-only">{t("careOptionsHeading", { defaultValue: "Care Options" })}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {careOptions.map((option) => (
              <article key={option.title} className={`rounded-lg border p-6 ${option.tone}`}>
                <h3 className="mb-3 text-headline-md text-primary">{option.title}</h3>
                <p className="text-body-md text-on-surface-variant">{option.description}</p>
              </article>
            ))}
          </div>
        </section>

        <MedicalDisclaimer variant="emergency" />
      </div>
    </main>
  );
}
