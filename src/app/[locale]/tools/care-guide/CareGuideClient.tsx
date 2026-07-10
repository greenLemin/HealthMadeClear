"use client";

import { Home, Hospital, Stethoscope, Siren } from "lucide-react";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/ui/Reveal";
import { useTranslations } from "next-intl";

function ChecklistItems({ items, textColor }: { items: string; textColor?: string }) {
  const list = items.split("|");
  return (
    <ul className={`mt-4 space-y-2 text-label-md ${textColor || "text-on-surface-variant"}`}>
      {list.map((item) => (
        <li key={item} className="flex gap-2">
          <span className={textColor ? "" : "text-primary"} aria-hidden>
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CareOptionsSection() {
  const t = useTranslations("tools");
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
      tone: "border-transparent bg-secondary-container text-on-secondary-container",
      icon: Hospital,
      iconColor: "text-on-secondary-container",
      titleColor: "text-on-secondary-container font-bold",
      textColor: "text-on-secondary-container/90",
    },
    {
      title: t("emergency"),
      description: t("emergencyBody"),
      checklist: t("emergencyChecklist"),
      tone: "border-error bg-error-container text-on-error-container",
      icon: Siren,
      badge: t("emergencyBadge24"),
      iconColor: "text-error dark:text-on-error-container",
      titleColor: "text-error dark:text-on-error-container font-bold",
      textColor: "text-on-error-container",
    },
  ];

  return (
    <section className="mb-12">
      <h2 className="sr-only">{t("careOptionsHeading")}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {careOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Reveal key={option.title} delay={Math.min(index * 0.04, 0.16)}>
              <article className={`rounded-[1.45rem] border p-6 shadow-elevation-1 ${option.tone}`}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/80 shadow-elevation-1">
                    <Icon size={22} className={option.iconColor || "text-primary"} aria-hidden />
                  </div>
                  {option.badge ? (
                    <span className="rounded-full bg-error px-2 py-1 text-label-md font-semibold text-on-error">
                      {option.badge}
                    </span>
                  ) : null}
                </div>
                <h3 className={`font-display text-headline-md ${option.titleColor || "text-primary"}`}>
                  {option.title}
                </h3>
                <p className={`mt-3 text-body-md ${option.textColor || "text-on-surface-variant"}`}>
                  {option.description}
                </p>
                <ChecklistItems items={option.checklist} textColor={option.textColor} />
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function ScenariosSection() {
  const t = useTranslations("tools");
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
    <section className="mb-12">
      <h2 className="mb-6 font-display text-headline-lg text-primary">{t("scenariosHeading")}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {scenarios.map((scenario, index) => (
          <Reveal key={scenario.title} delay={Math.min(index * 0.05, 0.1)}>
            <article
              className={`surface-card px-6 py-6 ${scenario.urgent ? "border-error bg-error-container/20" : ""}`}
            >
              <div className="mb-2 inline-flex rounded-full bg-surface-container px-3 py-1 text-label-md font-semibold text-primary">
                {scenario.level}
              </div>
              <h3 className="font-display text-headline-md text-primary">{scenario.title}</h3>
              <p className="mt-3 text-body-md text-on-surface-variant">{scenario.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function CareGuideClient() {
  const t = useTranslations("tools");
  const tDisclaimer = useTranslations("disclaimer");

  return (
    <div className="pb-16">
      <div
        role="alert"
        className="no-print bg-error px-4 py-3 text-center text-label-md font-semibold text-on-error"
      >
        {tDisclaimer("emergencyTitle")}: {t("emergencyShort")}
      </div>
      <div className="max-w-container mx-auto px-4 py-10 md:px-6 md:py-12">
        <PageHeader
          centered
          title={t("careGuideTitle")}
          description={t("careGuideDescription")}
          className="mb-8"
        />

        <CareOptionsSection />

        <ScenariosSection />

        <Reveal delay={0.1}>
          <div className="mb-10 rounded-[1.5rem] border border-secondary bg-secondary-container/40 p-6">
            <h2 className="font-display text-headline-md text-primary">{t("whenInDoubtTitle")}</h2>
            <p className="mt-2 text-body-md text-on-surface-variant">{t("whenInDoubtBody")}</p>
          </div>
        </Reveal>

        <MedicalDisclaimer variant="emergency" />
      </div>
    </div>
  );
}
