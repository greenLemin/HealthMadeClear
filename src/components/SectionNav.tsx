"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen, GraduationCap, Search, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";

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
      icon: <GraduationCap size={32} className="text-primary" aria-hidden="true" />,
      href: "/learn",
      color: "bg-primary-fixed/70",
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
    <section className="py-16 md:py-20">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex rounded-full bg-surface-container px-4 py-2 text-label-md font-semibold text-on-surface-variant">
            {t("exploreByGoal")}
          </div>
          <h2 className="text-headline-lg text-primary">{t("findRightResource")}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group hover-lift rounded-2xl border border-outline-variant bg-surface p-6 shadow-card hover:shadow-card-hover"
            >
              <div className="flex items-start gap-4">
                <div className="p-4">{section.icon}</div>
                <div className="flex-1">
                  <h3 className="mb-2 text-headline-md text-primary">{section.title}</h3>
                  <p className="mb-4 text-body-md text-on-surface-variant">{section.description}</p>
                  <div className="inline-flex items-center gap-2 text-label-md font-semibold text-primary">
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
          ))}
        </div>
      </div>
    </section>
  );
}
