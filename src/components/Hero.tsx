"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="hero-gradient relative overflow-hidden py-8 md:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="max-w-container relative mx-auto px-4 md:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-outline-variant bg-surface/80 px-4 py-2 text-label-md font-semibold text-primary shadow-sm">
              {t("badge")}
            </div>
            <h1 className="mb-4 text-[clamp(1.75rem,5vw,2.5rem)] md:text-headline-xl text-primary leading-[1.15]">
              {t("title")}
            </h1>
            <p className="mb-6 max-w-2xl text-body-md md:text-body-lg text-on-surface-variant">
              {t("subtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/learning-paths" className="btn-primary inline-flex items-center justify-center">
                {t("startLearning")}
              </Link>
              <Link
                href="/glossary"
                className="inline-flex items-center gap-1 text-label-md font-semibold text-primary underline-offset-2 transition-colors hover:text-primary-container hover:underline"
              >
                {t("browseGlossary")}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-outline-variant bg-surface/85 shadow-elevation-2 backdrop-blur-sm lg:block">
            <Image
              src="/stitch/home.png"
              alt={t("imageAlt")}
              width={600}
              height={400}
              className="h-auto w-full object-cover"
              priority
            />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary-container/70 p-5">
                <div className="mb-2 text-2xl" aria-hidden="true">
                  🩺
                </div>
                <div className="text-label-md text-primary">{t("preparedVisits")}</div>
                <p className="mt-2 text-label-md text-on-surface-variant">{t("preparedVisitsBody")}</p>
              </div>
              <div className="rounded-2xl bg-primary-fixed/70 p-5">
                <div className="mb-2 text-2xl" aria-hidden="true">
                  📘
                </div>
                <div className="text-label-md text-primary">{t("clearLessons")}</div>
                <p className="mt-2 text-label-md text-on-surface-variant">{t("clearLessonsBody")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
