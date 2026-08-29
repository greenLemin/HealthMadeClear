"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import ButtonLink from "@/components/ui/ButtonLink";
import TrustBanner from "@/components/content/TrustBanner";
import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="hero-gradient relative overflow-hidden px-4 pb-14 pt-6 md:px-6 md:pb-20 md:pt-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto max-w-container">
        <div className="grid items-start gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
          <Reveal className="max-w-3xl">
            <div className="mb-5">
              <TrustBanner />
            </div>
            <h1 className="mb-4 max-w-4xl font-display text-[clamp(2.25rem,3.5vw+1rem,3.5rem)] leading-[1.1] tracking-[-0.04em] text-primary">
              {t("title")}
            </h1>
            <p className="mt-5 max-w-readable text-body-lg text-on-surface-variant">{t("subtitle")}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <ButtonLink href="/learning-paths">{t("startLearning")}</ButtonLink>
              <ButtonLink href="/glossary" variant="secondary" icon={<ArrowRight size={16} />}>
                {t("browseGlossary")}
              </ButtonLink>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="metric-pill">🩺 {t("preparedVisits")}</div>
              <div className="metric-pill">📘 {t("clearLessons")}</div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="surface-card-strong overflow-hidden p-4 md:p-5">
              <div className="overflow-hidden rounded-[1.6rem] border border-outline-variant shadow-elevation-2">
                <Image
                  src="/stitch/home.png"
                  alt={t("imageAlt")}
                  width={600}
                  height={400}
                  className="aspect-[3/2] h-auto max-h-[min(20rem,36vh)] w-full object-cover object-top"
                  priority
                />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="surface-card px-5 py-5">
                  <div className="mb-2 text-2xl" aria-hidden="true">
                    🩺
                  </div>
                  <div className="text-label-md text-primary">{t("preparedVisits")}</div>
                  <p className="mt-2 text-label-md text-on-surface-variant">{t("preparedVisitsBody")}</p>
                </div>
                <div className="surface-card px-5 py-5">
                  <div className="mb-2 text-2xl" aria-hidden="true">
                    📘
                  </div>
                  <div className="text-label-md text-primary">{t("clearLessons")}</div>
                  <p className="mt-2 text-label-md text-on-surface-variant">{t("clearLessonsBody")}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
