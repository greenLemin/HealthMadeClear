"use client";

import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import Callout from "@/components/Callout";

export default function CareGuidePage() {
  const { locale } = useAppState();
  const careOptions = [
    {
      title: locale === "es" ? "Cuidado en casa" : "Home care",
      description: locale === "es" ? "Para molestias menores que pueden tratarse con descanso, medicinas de venta libre e hidratación." : "For minor ailments that can be treated with rest, over-the-counter medicine, and hydration.",
      examples: locale === "es" ? ["Resfriados leves", "Raspaduras pequeñas"] : ["Mild colds", "Minor scrapes"],
      tone: "border-outline-variant bg-surface",
    },
    {
      title: locale === "es" ? "Atención primaria" : "Primary care",
      description: locale === "es" ? "Tu médico principal para revisiones regulares, problemas continuos de salud y enfermedades no urgentes." : "Your main doctor for regular check-ups, ongoing health issues, and non-urgent illnesses.",
      examples: locale === "es" ? ["Chequeos regulares", "Resurtido de medicinas"] : ["Routine physicals", "Medication refills"],
      tone: "border-outline-variant bg-secondary-container/40",
    },
    {
      title: locale === "es" ? "Atención urgente" : "Urgent care",
      description: locale === "es" ? "Para problemas que necesitan atención rápida pero no ponen en riesgo la vida." : "For conditions that need attention quickly but are not life-threatening.",
      examples: locale === "es" ? ["Torceduras y cortadas menores", "Fiebre e infecciones"] : ["Sprains and minor cuts", "Fevers and infections"],
      tone: "border-transparent bg-secondary-container",
    },
    {
      title: locale === "es" ? "Sala de emergencia" : "Emergency room",
      description: locale === "es" ? "Para situaciones que ponen en riesgo la vida, lesiones graves o síntomas súbitos serios." : "For life-threatening situations, severe injuries, or sudden serious symptoms.",
      examples: locale === "es" ? ["Dolor de pecho", "Dificultad para respirar"] : ["Chest pain", "Difficulty breathing"],
      tone: "border-error bg-error-container",
    },
  ];

  const scenarios = [
    {
      title: locale === "es" ? "Dolor de garganta y tos" : "Sore throat and cough",
      summary: locale === "es" ? "Los síntomas son molestos pero manejables. Puedes respirar con normalidad." : "Symptoms are uncomfortable but manageable. You are able to breathe normally.",
      recommendation: locale === "es" ? "Visita atención primaria o atención urgente." : "Visit primary care or urgent care.",
      tone: "border-outline-variant bg-surface",
    },
    {
      title: locale === "es" ? "Dolor repentino en el pecho" : "Sudden chest pain",
      summary: locale === "es" ? "El dolor puede extenderse al brazo o la mandíbula, con falta de aire o mareo." : "Pain may spread to the arm or jaw, with shortness of breath or dizziness.",
      recommendation: locale === "es" ? "Ve a la sala de emergencia o llama al 911 de inmediato." : "Go to the emergency room or call 911 immediately.",
      tone: "border-error bg-error-container",
    },
  ];

  return (
    <main className="pb-16">
      <div className="no-print bg-error px-4 py-3 text-center text-sm font-semibold text-on-error">
        {locale === "es" ? "Si tienes una emergencia que pone en riesgo la vida, llama al 911 o ve a la sala de emergencia más cercana de inmediato." : "If you are experiencing a life-threatening emergency, call 911 or go to the nearest emergency room immediately."}
      </div>
      <div className="max-w-container mx-auto px-4 py-12 md:px-6">
        <PageHeader
          centered
          title={locale === "es" ? "¿Dónde debo buscar atención?" : "Where should I go for care?"}
          description={
            locale === "es"
              ? "Elegir el lugar correcto para recibir atención puede ahorrarte tiempo, dinero y ayudarte a obtener el tratamiento adecuado cuando más lo necesitas."
              : "Choosing the right place for medical care can save you time, money, and help you get the right treatment when you need it most."
          }
        />

        <section className="mb-12">
          <h2 className="mb-6 text-headline-lg text-primary">{locale === "es" ? "Opciones de atención de un vistazo" : "Care options at a glance"}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {careOptions.map((option) => (
              <article key={option.title} className={`rounded-lg border p-6 ${option.tone}`}>
                <h3 className="mb-3 text-headline-md text-primary">{option.title}</h3>
                <p className="mb-4 text-body-md text-on-surface-variant">{option.description}</p>
                <ul className="space-y-2 text-body-md text-on-surface-variant">
                  {option.examples.map((example) => (
                    <li key={example}>- {example}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-xl bg-surface-container-low p-6 md:p-8">
          <h2 className="mb-6 text-headline-lg text-primary">{locale === "es" ? "Escenarios comunes" : "Common scenarios"}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <article key={scenario.title} className={`overflow-hidden rounded-xl border ${scenario.tone}`}>
                <div className="min-h-52 bg-gradient-to-br from-primary-fixed to-secondary-container" />
                <div className="p-6">
                  <h3 className="mb-3 text-headline-md text-primary">{scenario.title}</h3>
                  <p className="mb-4 text-body-md text-on-surface-variant">{scenario.summary}</p>
                  <div className="text-label-md text-primary">{scenario.recommendation}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <Callout
          type="success"
          title={locale === "es" ? "Si tienes dudas, busca ayuda urgente." : "When in doubt, get urgent help."}
        >
          <p>
            {locale === "es"
              ? "Siempre es mejor actuar con precaución. Si una situación podría poner en riesgo la vida, busca atención médica de emergencia de inmediato."
              : "It is always better to err on the side of caution. If a situation might be life-threatening, do not hesitate to seek emergency medical care immediately."}
          </p>
        </Callout>
      </div>
    </main>
  );
}
