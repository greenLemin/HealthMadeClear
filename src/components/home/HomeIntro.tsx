"use client";

import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Reveal from "@/components/ui/Reveal";
import { useTranslations } from "next-intl";

export default function HomeIntro() {
  const t = useTranslations("home");

  return (
    <section className="px-4 py-8 md:px-6 md:py-10" aria-labelledby="intro-heading">
      <div className="mx-auto max-w-container">
        <Reveal className="section-frame px-8 py-8 md:px-10 md:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="eyebrow mb-4">{t("introBadge")}</div>
              <h2 id="intro-heading" className="font-display text-headline-lg text-primary">
                {t("introTitle")}
              </h2>
              <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">{t("introBody")}</p>
            </div>
            <ButtonLink href="/learning-paths" className="shrink-0">
              {t("takeTour")}
              <ArrowRight size={18} />
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
