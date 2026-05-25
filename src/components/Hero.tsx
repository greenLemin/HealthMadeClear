"use client";

import Link from "next/link";
import { useAppState } from "@/components/AppProviders";

export default function Hero() {
  const { locale } = useAppState();

  return (
    <section className="hero-gradient relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="max-w-container relative mx-auto px-4 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex rounded-full border border-outline-variant bg-surface/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              {locale === "es" ? "Educación de salud clara y humana" : "Clear, human-centered health education"}
            </div>
            <h1 className="mb-6 text-headline-xl text-primary">
              {locale === "es"
                ? "Entiende tu salud, paso a paso y con claridad"
                : "Understand Your Health, One Clear Step at a Time"}
            </h1>
            <p className="mb-8 max-w-2xl text-body-lg text-on-surface-variant">
              {locale === "es"
                ? "Información gratuita y fácil de entender para ayudarte a prepararte para citas, comprender términos médicos y sentirte con más confianza al tomar decisiones de salud."
                : "Free, easy-to-understand health information to help you prepare for visits, understand medical language, and feel more confident making health decisions."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/learning-paths" className="btn-primary inline-flex items-center justify-center">
                {locale === "es" ? "Comenzar a aprender" : "Start Learning"}
              </Link>
              <Link href="/glossary" className="btn-secondary inline-flex items-center justify-center">
                {locale === "es" ? "Ver glosario" : "Browse Glossary"}
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-outline-variant bg-surface/85 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary-container/70 p-5">
                <div className="mb-2 text-2xl">🩺</div>
                <div className="text-label-md text-primary">{locale === "es" ? "Preparación" : "Prepared visits"}</div>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {locale === "es" ? "Llega con preguntas y notas listas." : "Arrive with questions and notes ready."}
                </p>
              </div>
              <div className="rounded-2xl bg-primary-fixed/70 p-5">
                <div className="mb-2 text-2xl">📘</div>
                <div className="text-label-md text-primary">{locale === "es" ? "Lecciones claras" : "Clear lessons"}</div>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {locale === "es" ? "Explicaciones cortas en lenguaje sencillo." : "Short explanations in plain language."}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                {locale === "es" ? "Lo que encontrarás" : "What you’ll find"}
              </div>
              <div className="grid gap-3 text-body-md text-on-surface sm:grid-cols-2">
                <div>{locale === "es" ? "Rutas guiadas" : "Guided learning paths"}</div>
                <div>{locale === "es" ? "Herramientas imprimibles" : "Printable tools"}</div>
                <div>{locale === "es" ? "Glosario de términos" : "Glossary definitions"}</div>
                <div>{locale === "es" ? "Seguimiento de progreso" : "Progress tracking"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
