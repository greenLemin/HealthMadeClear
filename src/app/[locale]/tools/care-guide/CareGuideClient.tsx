"use client";

import { Home, Hospital, Stethoscope, Siren } from "lucide-react";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import { useTranslations } from "next-intl";

function ChecklistItems({ items }: { items: string }) {
  const list = items.split("|");
  return (
    <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
      {list.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-primary" aria-hidden>
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CareGuideClient() {
  const t = useTranslations("tools");
  const tDisclaimer = useTranslations("disclaimer");

  const careOptions = [
    {
      title: t("homeCare"),
      description: t("homeCareBody"),
      checklist: t("homeCareChecklist"),
      tone: "border-outline-variant bg-surface",
      icon: Home,
    },
    {
      title: t("primaryCare"),
      description: t("primaryCareBody"),
      checklist: t("primaryCareChecklist"),
      tone: "border-outline-variant bg-secondary-container/40",
      icon: Stethoscope,
    },
    {
      title: t("urgentCare"),
      description: t("urgentCareBody"),
      checklist: t("urgentCareChecklist"),
      tone: "border-transparent bg-secondary-container",
      icon: Hospital,
    },
    {
      title: t("emergency"),
      description: t("emergencyBody"),
      checklist: t("emergencyChecklist"),
      tone: "border-error bg-error-container",
      icon: Siren,
      badge: t("emergencyBadge24"),
    },
  ];

  const scenarios = [
    {
      title: t("scenarioSoreThroatTitle"),
      body: t("scenarioSoreThroatBody"),
      level: t("scenarioSoreThroatLevel"),
      urgent: false,
    },
    {
      title: t("scenarioChestPainTitle"),
      body: t("scenarioChestPainBody"),
      level: t("scenarioChestPainLevel"),
      urgent: true,
    },
  ];

  return (
    <div className="pb-16">
      <div className="no-print bg-error px-4 py-3 text-center text-sm font-semibold text-on-error">
        {tDisclaimer("emergencyTitle")}: {t("emergencyShort")}
      </div>
      <div className="max-w-container mx-auto px-4 py-12 md:px-6">
        <PageHeader centered title={t("careGuideTitle")} description={t("careGuideDescription")} />

        <section className="mb-12">
          <h2 className="sr-only">{t("careOptionsHeading")}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {careOptions.map((option) => {
              const Icon = option.icon;
              return (
                <article key={option.title} className={`rounded-lg border p-6 ${option.tone}`}>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <Icon size={24} className="text-primary" aria-hidden />
                    {option.badge ? (
                      <span className="rounded-full bg-error px-2 py-1 text-xs font-semibold text-on-error">
                        {option.badge}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mb-3 text-headline-md text-primary">{option.title}</h3>
                  <p className="text-body-md text-on-surface-variant">{option.description}</p>
                  <ChecklistItems items={option.checklist} />
                </article>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-headline-lg text-primary">{t("scenariosHeading")}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <article
                key={scenario.title}
                className={`card ${scenario.urgent ? "border-error bg-error-container/30" : ""}`}
              >
                <div className="mb-2 inline-flex rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-primary">
                  {scenario.level}
                </div>
                <h3 className="mb-3 text-headline-md text-primary">{scenario.title}</h3>
                <p className="text-body-md text-on-surface-variant">{scenario.body}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mb-10 rounded-lg border border-secondary bg-secondary-container/50 p-6">
          <h2 className="mb-2 text-headline-md text-primary">{t("whenInDoubtTitle")}</h2>
          <p className="text-body-md text-on-surface-variant">{t("whenInDoubtBody")}</p>
        </div>

        <MedicalDisclaimer variant="emergency" />
      </div>
    </div>
  );
}
