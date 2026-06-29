"use client";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/ui/Reveal";
import { Database, Settings2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PrivacyClient() {
  const t = useTranslations("privacy");
  const sections = [
    { title: t("educationTitle"), body: t("educationBody"), icon: ShieldCheck },
    { title: t("collectTitle"), body: t("collectBody"), icon: Database },
    { title: t("controlTitle"), body: t("controlBody"), icon: Settings2 },
  ];

  return (
    <div className="py-10 md:py-14">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader centered title={t("title")} description={t("description")} className="mb-8" />

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-5 md:grid-cols-3">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Reveal key={section.title} delay={Math.min(index * 0.05, 0.15)}>
                  <section className="surface-card px-6 py-6 md:px-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary shadow-elevation-1">
                      <Icon size={18} />
                    </div>
                    <h2 className="mt-4 font-display text-headline-sm text-primary">{section.title}</h2>
                    <p className="mt-3 text-body-md text-on-surface-variant">{section.body}</p>
                  </section>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.14} className="mt-8">
            <section className="surface-card-glass px-6 py-6 text-center md:px-8">
              <div className="eyebrow mb-3">{t("controlTitle")}</div>
              <p className="mx-auto max-w-3xl text-body-md text-on-surface-variant">{t("collectBody")}</p>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
