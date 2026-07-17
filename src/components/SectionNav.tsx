"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen, GraduationCap, Search, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";

export default function SectionNav() {
  const t = useTranslations("sectionNav");

  const sections = [
    {
      title: t("pathsTitle"),
      description: t("pathsDescription"),
      icon: <BookOpen size={32} className="text-primary" aria-hidden="true" />,
      href: "/learning-paths",
      color: "bg-secondary-container/70",
    },
    {
      title: t("learnTitle"),
      description: t("learnDescription"),
      icon: <GraduationCap size={32} className="text-on-primary-container" aria-hidden="true" />,
      href: "/learn",
      color: "bg-primary-container",
    },
    {
      title: t("glossaryTitle"),
      description: t("glossaryDescription"),
      icon: <Search size={32} className="text-primary" aria-hidden="true" />,
      href: "/glossary",
      color: "bg-surface-container",
    },
    {
      title: t("toolsTitle"),
      description: t("toolsDescription"),
      icon: <Wrench size={32} className="text-primary" aria-hidden="true" />,
      href: "/tools",
      color: "bg-tools-accent",
    },
  ];

  return (
    <section className="px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-container">
        <div className="mb-8 text-center">
          <div className="eyebrow mb-4">{t("exploreByGoal")}</div>
          <h2 className="font-display text-headline-lg text-primary">{t("findRightResource")}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {sections.map((section, index) => (
            <Reveal key={section.href} delay={index * 0.05}>
              <Link
                href={section.href}
                className="surface-card group block px-6 py-6 transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-card-hover md:px-7 md:py-7"
              >
                <div className="flex items-start gap-4">
                  <div className={`inline-flex rounded-[1.25rem] p-4 shadow-elevation-1 ${section.color}`}>
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-headline-md text-primary">{section.title}</h3>
                    <p className="mt-2 text-body-md text-on-surface-variant">{section.description}</p>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-label-md font-semibold text-primary shadow-elevation-1">
                      {t("explore")}
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
