"use client";

import { BookOpen, Heart, Shield } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { useTranslations } from "next-intl";

export default function HomeMission() {
  const t = useTranslations("home");

  return (
    <section className="px-4 py-10 md:px-6 md:py-14" aria-labelledby="mission-heading">
      <div className="mx-auto max-w-container">
        <Reveal>
          <div className="eyebrow mb-4">{t("introBadge")}</div>
        </Reveal>
        <h2 id="mission-heading" className="font-display text-headline-lg text-primary">
          {t("whyMattersTitle")}
        </h2>
        <p className="mb-10 mt-3 max-w-readable text-body-lg text-on-surface-variant">
          {t("whyMattersBody")}
        </p>
        <div className="grid gap-6 md:grid-cols-6">
          <Reveal className="md:col-span-3">
            <div className="surface-card-strong h-full p-8">
              <Heart size={28} className="mb-4 text-primary" aria-hidden="true" />
              <h3 className="font-display text-headline-md text-primary">{t("valueKnowledgeTitle")}</h3>
              <p className="mt-3 text-body-md text-on-surface-variant">{t("valueKnowledgeBody")}</p>
            </div>
          </Reveal>

          <Reveal className="md:col-span-3" delay={0.05}>
            <div className="surface-card-muted h-full p-8">
              <Shield size={28} className="mb-4 text-secondary" aria-hidden="true" />
              <h3 className="font-display text-headline-md text-primary">{t("valueConfidenceTitle")}</h3>
              <p className="mt-3 text-body-md text-on-surface-variant">{t("valueConfidenceBody")}</p>
            </div>
          </Reveal>

          <Reveal className="md:col-span-6" delay={0.1}>
            <div className="surface-card flex flex-col gap-6 p-8 md:flex-row md:items-center">
              <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-elevation-1">
                <BookOpen size={28} aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-headline-md text-primary">{t("valueAccessTitle")}</h3>
                <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">
                  {t("valueAccessBody")}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
