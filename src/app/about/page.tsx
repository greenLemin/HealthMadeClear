"use client";

import Link from "next/link";
import { BookOpen, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import Callout from "@/components/Callout";

export default function AboutPage() {
  const { locale } = useAppState();

  const values = [
    {
      title: locale === "es" ? "Educación, no diagnóstico" : "Education, not diagnosis",
      description:
        locale === "es"
          ? "El contenido de Health Made Clear es educativo e informativo. Está diseñado para apoyar conversaciones con profesionales de salud, no para reemplazarlas."
          : "The content in Health Made Clear is strictly educational and informational. It is designed to support conversations with healthcare professionals, not replace them.",
      icon: ShieldCheck,
    },
    {
      title: locale === "es" ? "Diseñado para todas las personas" : "Built for everyone",
      description:
        locale === "es"
          ? "Desde colores de alto contraste hasta tipografía legible y herramientas imprimibles, cada parte de la plataforma busca ser más fácil de usar."
          : "From high-contrast colors to readable typography and printable tools, every part of the platform is designed to be easier to use.",
      icon: Users,
    },
    {
      title: locale === "es" ? "Aprendizaje estructurado" : "Structured learning",
      description:
        locale === "es"
          ? "La información está organizada en rutas guiadas y lecciones cortas para generar confianza sin abrumar."
          : "Information is organized into guided paths and short lessons so people can build confidence without overload.",
      icon: BookOpen,
    },
  ];

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader
          centered
          title={locale === "es" ? "Nuestra misión es la claridad." : "Our mission is clarity."}
          description={
            locale === "es"
              ? "Creemos que entender tu salud no debería requerir un título médico. Health Made Clear traduce lenguaje médico complejo en explicaciones claras y útiles para que más personas puedan tomar decisiones informadas."
              : "We believe understanding your health should not require a medical degree. Health Made Clear is dedicated to translating complex medical language into plain, actionable language so more people can make informed decisions."
          }
        />

        <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Callout
            type="info"
            title={locale === "es" ? "Educación, no diagnóstico" : "Education, not diagnosis"}
          >
            <div className="space-y-4">
              <p>
                {locale === "es"
                  ? "El contenido de Health Made Clear es solo para fines educativos. Su objetivo es hacer la información de salud más fácil de entender y apoyar la confianza del paciente."
                  : "The content provided on Health Made Clear is for educational purposes only. It is meant to make health information easier to understand and support patient confidence."}
              </p>
              <p>
                {locale === "es"
                  ? "Nunca ignores el consejo médico profesional ni retrases buscar ayuda por algo que leíste aquí. Si crees que tienes una emergencia médica, llama a tu médico o a servicios de emergencia de inmediato."
                  : "Never disregard professional medical advice or delay seeking it because of something you read here. If you think you may have a medical emergency, call your doctor or emergency services immediately."}
              </p>
            </div>
          </Callout>
          <Callout
            type="success"
            title={locale === "es" ? "Por qué importa" : "Why it matters"}
          >
            <p>
              {locale === "es"
                ? "La baja alfabetización en salud se relaciona con peores resultados, mayores costos y más hospitalizaciones. La educación clara ayuda a prepararse, hacer mejores preguntas y seguir planes de cuidado con más confianza."
                : "Low health literacy is linked to poorer outcomes, higher healthcare costs, and more frequent hospitalizations. Clearer education can help people prepare, ask better questions, and follow care plans more confidently."}
            </p>
          </Callout>
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article key={value.title} className="card">
                <div className="mb-4 inline-flex rounded-lg bg-surface-container px-4 py-4 text-primary">
                  <Icon size={22} />
                </div>
                <h2 className="mb-3 text-headline-md text-primary">{value.title}</h2>
                <p className="text-body-md text-on-surface-variant">{value.description}</p>
              </article>
            );
          })}
        </div>

        <section className="rounded-2xl bg-surface-container-low p-8 text-center">
          <div className="mb-4 inline-flex rounded-full bg-primary-fixed px-4 py-2 text-sm font-semibold text-primary">
            {locale === "es" ? "Únete al esfuerzo" : "Join the effort"}
          </div>
          <h2 className="mb-4 text-headline-lg text-primary">{locale === "es" ? "Educación en salud abierta y centrada en las personas" : "Open, human-centered health education"}</h2>
          <p className="mx-auto mb-8 max-w-3xl text-body-md text-on-surface-variant">
            {locale === "es"
              ? "Mejorar la alfabetización en salud es un esfuerzo colectivo. Ya seas clínico, diseñador o paciente compartiendo experiencia vivida, tu aporte importa."
              : "Improving health literacy is a community effort. Whether you are a clinician reviewing content for accuracy, a designer improving usability, or a patient sharing lived experience, your contribution matters."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/learn" className="btn-primary inline-flex items-center gap-2">
              <HeartHandshake size={18} />
              {locale === "es" ? "Explorar biblioteca" : "Explore the library"}
            </Link>
            <Link href="/tools" className="btn-secondary inline-flex items-center gap-2">
              {locale === "es" ? "Aprender con herramientas" : "Learn with the tools"}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
