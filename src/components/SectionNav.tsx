"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen, Search, Wrench } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import { getMessages } from "@/lib/i18n";

export default function SectionNav() {
  const { locale } = useAppState();
  const copy = getMessages(locale);

  const sections = [
    {
      title: copy.sectionNav.pathsTitle,
      description: copy.sectionNav.pathsDescription,
      icon: <BookOpen size={32} className="text-primary" />,
      href: "/learning-paths",
      color: "bg-secondary-container/70",
    },
    {
      title: copy.sectionNav.learnTitle,
      description: copy.sectionNav.learnDescription,
      icon: <BookOpen size={32} className="text-primary" />,
      href: "/learn",
      color: "bg-primary-fixed/70",
    },
    {
      title: copy.sectionNav.glossaryTitle,
      description: copy.sectionNav.glossaryDescription,
      icon: <Search size={32} className="text-primary" />,
      href: "/glossary",
      color: "bg-surface-container",
    },
    {
      title: copy.sectionNav.toolsTitle,
      description: copy.sectionNav.toolsDescription,
      icon: <Wrench size={32} className="text-primary" />,
      href: "/tools",
      color: "bg-tools-accent",
    },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex rounded-full bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface-variant">
            {copy.sectionNav.exploreByGoal}
          </div>
          <h2 className="text-headline-lg text-primary">{copy.sectionNav.findRightResource}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group hover-lift rounded-[24px] border border-outline-variant bg-surface p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-2xl p-4 ${section.color}`}>{section.icon}</div>
                <div className="flex-1">
                  <h3 className="mb-2 text-headline-md text-primary">{section.title}</h3>
                  <p className="mb-4 text-body-md text-on-surface-variant">{section.description}</p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    {copy.sectionNav.explore}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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
