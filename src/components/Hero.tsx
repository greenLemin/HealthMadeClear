"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="hero-gradient relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="max-w-container relative mx-auto px-4 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex rounded-full border border-outline-variant bg-surface/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              {t("badge")}
            </div>
            <h1 className="mb-6 text-headline-xl text-primary">{t("title")}</h1>
            <p className="mb-8 max-w-2xl text-body-lg text-on-surface-variant">{t("subtitle")}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/learning-paths" className="btn-primary inline-flex items-center justify-center">
                {t("startLearning")}
              </Link>
              <Link href="/glossary" className="btn-secondary inline-flex items-center justify-center">
                {t("browseGlossary")}
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-outline-variant bg-surface/85 shadow-[0_20px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <Image
              src="/stitch/home.png"
              alt=""
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
                <p className="mt-2 text-sm text-on-surface-variant">{t("preparedVisitsBody")}</p>
              </div>
              <div className="rounded-2xl bg-primary-fixed/70 p-5">
                <div className="mb-2 text-2xl" aria-hidden="true">
                  📘
                </div>
                <div className="text-label-md text-primary">{t("clearLessons")}</div>
                <p className="mt-2 text-sm text-on-surface-variant">{t("clearLessonsBody")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
