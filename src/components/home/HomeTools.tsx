"use client";

import { ArrowRight, BookOpen, Search, Wrench } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/Reveal";
import { useTranslations } from "next-intl";

export default function HomeTools() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tSectionNav = useTranslations("sectionNav");
  const exploreLabel = tSectionNav("explore");

  return (
    <section className="px-4 py-10 md:px-6 md:py-14" aria-labelledby="tools-heading">
      <div className="mx-auto max-w-container">
        <div className="eyebrow mb-4">{t("toolsSectionTitle")}</div>
        <h2 id="tools-heading" className="font-display text-headline-lg text-primary">
          {t("toolsTitle")}
        </h2>
        <p className="mb-10 mt-3 max-w-readable text-body-lg text-on-surface-variant">{t("toolsBody")}</p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              href: "/learn",
              icon: <BookOpen size={24} className="text-primary" aria-hidden="true" />,
              title: tCommon("exploreLibrary"),
              body: t("learnPreviewBody"),
            },
            {
              href: "/glossary",
              icon: <Search size={24} className="text-secondary" aria-hidden="true" />,
              title: t("glossaryTitle"),
              body: t("glossaryPreviewBody"),
            },
            {
              href: "/tools",
              icon: <Wrench size={24} className="text-primary" aria-hidden="true" />,
              title: t("toolsSectionTitle"),
              body: t("toolsPreviewBody"),
            },
          ].map((item, index) => (
            <Reveal key={item.href} delay={index * 0.05}>
              <Link
                href={item.href}
                className="surface-card group block h-full px-6 py-6 transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="inline-flex rounded-full bg-surface-container-low p-4 shadow-elevation-1">
                  {item.icon}
                </div>
                <h3 className="mt-5 font-display text-headline-md text-primary">{item.title}</h3>
                <p className="mt-3 text-body-md text-on-surface-variant">{item.body}</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-label-md font-semibold text-primary">
                  {exploreLabel}
                  <ArrowRight size={16} aria-hidden="true" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
