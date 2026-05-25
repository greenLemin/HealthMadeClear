"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Search, Wrench } from "lucide-react";
import { useAppState } from "@/components/AppProviders";

export default function SectionNav() {
  const { locale } = useAppState();

  const sections = [
    {
      title: locale === "es" ? "Rutas de aprendizaje" : "Learning Paths",
      description: locale === "es" ? "Sigue guías estructuradas para aprender paso a paso." : "Follow structured guides to master health topics step by step.",
      icon: <BookOpen size={32} className="text-primary" />,
      href: "/learning-paths",
      color: "bg-secondary-container/70",
    },
    {
      title: locale === "es" ? "Aprender" : "Learn",
      description: locale === "es" ? "Explora lecciones claras sobre temas comunes de salud." : "Browse our library of clear lessons on common health topics.",
      icon: <BookOpen size={32} className="text-primary" />,
      href: "/learn",
      color: "bg-primary-fixed/70",
    },
    {
      title: locale === "es" ? "Glosario" : "Glossary",
      description: locale === "es" ? "Encuentra definiciones sencillas de términos médicos." : "Find plain-language definitions for medical terms.",
      icon: <Search size={32} className="text-primary" />,
      href: "/glossary",
      color: "bg-surface-container",
    },
    {
      title: locale === "es" ? "Herramientas" : "Tools",
      description: locale === "es" ? "Usa recursos prácticos para citas y decisiones de cuidado." : "Use practical resources for visits and care decisions.",
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
            {locale === "es" ? "Explora por objetivo" : "Explore by goal"}
          </div>
          <h2 className="text-headline-lg text-primary">
            {locale === "es" ? "Encuentra el recurso adecuado para ti" : "Find the right resource for you"}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-[24px] border border-outline-variant bg-surface p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-2xl p-4 ${section.color}`}>
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-headline-md text-primary">{section.title}</h3>
                  <p className="mb-4 text-body-md text-on-surface-variant">{section.description}</p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    {locale === "es" ? "Explorar" : "Explore"}
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
