"use client";

import Link from "next/link";
import Hero from "@/components/Hero";
import SectionNav from "@/components/SectionNav";
import { useAppState } from "@/components/AppProviders";
import Callout from "@/components/Callout";
import { formatLevel } from "@/lib/i18n";
import { getLearningPaths } from "@/lib/localizedContent";

export default function Home() {
  const { locale } = useAppState();
  const learningPaths = getLearningPaths(locale);

  return (
    <main>
      <Hero />
      <SectionNav />

      <section className="pb-12">
        <div className="max-w-container mx-auto px-4 md:px-6">
          <div className="mb-12 rounded-[28px] border border-outline-variant bg-surface p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex rounded-full bg-secondary-container px-4 py-2 text-sm font-semibold text-primary">
                  {locale === "es" ? "¿Nuevo en términos de salud?" : "New to health terminology?"}
                </div>
                <h2 className="mb-2 text-headline-md text-primary">
                  {locale === "es" ? "Empieza con una introducción guiada y corta." : "Start with a short guided introduction."}
                </h2>
                <p className="text-body-md text-on-surface-variant">
                  {locale === "es"
                    ? "Diseñamos una serie calmada y amigable para ayudarte a entender términos de salud y prepararte para tus citas."
                    : "We designed a calm, beginner-friendly set of lessons to help you understand health terms and prepare for appointments."}
                </p>
              </div>
              <Link href="/learning-paths" className="btn-primary inline-flex items-center justify-center">
                {locale === "es" ? "Ver recorrido" : "Take the tour"}
              </Link>
            </div>
          </div>

          <section className="mb-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-headline-lg text-primary">
                  {locale === "es" ? "Rutas destacadas" : "Featured learning paths"}
                </h2>
                <p className="text-body-md text-on-surface-variant">
                  {locale === "es"
                    ? "Recorridos seleccionados para ayudarte a entender temas de salud específicos."
                    : "Curated journeys to help you understand specific health topics."}
                </p>
              </div>
              <Link href="/learning-paths" className="text-sm font-semibold text-primary">
                {locale === "es" ? "Ver todas" : "View all paths"}
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {learningPaths.slice(0, 2).map((path) => (
                <Link key={path.id} href={`/learning-paths#${path.id}`} className="group rounded-[24px] border border-outline-variant bg-surface p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.08)]">
                  <div className="mb-3 inline-flex rounded-full bg-surface-container px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                    {formatLevel(path.level, locale)}
                  </div>
                  <div className="mb-3 text-4xl">{path.icon}</div>
                  <h3 className="mb-3 text-headline-md text-primary">{path.title}</h3>
                  <p className="mb-5 text-body-md text-on-surface-variant">{path.description}</p>
                  <div className="flex items-center justify-between text-sm text-on-surface-variant">
                    <span>{path.lessons.length} {locale === "es" ? "módulos" : "modules"}</span>
                    <span>{path.duration}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <Callout
            type="info"
            title={locale === "es" ? "Solo con fines educativos" : "Educational purpose only"}
            className="mb-8"
          >
            <p>
              {locale === "es"
                ? "El contenido de Health Made Clear es educativo. No reemplaza la atención médica profesional, el diagnóstico ni el tratamiento."
                : "The content on Health Made Clear is designed for educational purposes to help you better understand health concepts. It is not a substitute for professional medical advice, diagnosis, or treatment."}
            </p>
          </Callout>

          <div className="rounded-2xl border border-error bg-error-container p-6 md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <h2 className="mb-2 text-label-lg text-error">{locale === "es" ? "¿Tienes una emergencia médica?" : "Experiencing a medical emergency?"}</h2>
              <p className="text-body-md text-on-error-container">
                {locale === "es" ? "No dependas de esta plataforma para necesidades urgentes." : "Do not rely on this platform for urgent medical needs."}
              </p>
            </div>
            <a href="tel:911" className="btn-primary mt-4 inline-flex items-center justify-center md:mt-0">
              {locale === "es" ? "Llamar a emergencias" : "Call emergency services"}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
