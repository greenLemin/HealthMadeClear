"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Printer, Save } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";

const VISIT_TYPE_KEYS = ["new-symptom", "medication", "followup"] as const;
type VisitTypeKey = (typeof VISIT_TYPE_KEYS)[number];

export default function VisitPlannerPage() {
  const { locale } = useAppState();
  const visitTypes = useMemo(
    () => ({
      "new-symptom": {
        label: locale === "es" ? "Síntoma nuevo" : "New symptom",
        questions: locale === "es"
          ? [
              "¿Qué podría estar causando este síntoma?",
              "¿Qué pruebas necesito?",
              "¿Cuáles son mis opciones de tratamiento?",
              "¿Cuándo debería empezar a sentirme mejor?",
            ]
          : [
              "What could be causing this symptom?",
              "What tests do I need?",
              "What are the treatment options?",
              "When should I expect to feel better?",
            ],
      },
      medication: {
        label: locale === "es" ? "Pregunta sobre medicina" : "Medication question",
        questions: locale === "es"
          ? [
              "¿Por qué estoy tomando esta medicina?",
              "¿Qué efectos secundarios debo vigilar?",
              "¿Qué debo hacer si olvido una dosis?",
              "¿Puedo tomarla con mis otras medicinas?",
            ]
          : [
              "Why am I taking this medicine?",
              "What side effects should I watch for?",
              "What should I do if I miss a dose?",
              "Can I take this with my other medicines?",
            ],
      },
      followup: {
        label: locale === "es" ? "Consulta de seguimiento" : "Follow-up visit",
        questions: locale === "es"
          ? [
              "¿Mi tratamiento está funcionando como se esperaba?",
              "¿Necesito cambios en mi plan?",
              "¿Qué resultados deberíamos revisar hoy?",
              "¿Cuándo debo volver a consultar?",
            ]
          : [
              "Is my treatment working as expected?",
              "Do I need any changes to my plan?",
              "What results should we review today?",
              "When should I follow up again?",
            ],
      },
    }),
    [locale]
  );

  const [step, setStep] = useState(1);
  const [visitType, setVisitType] = useState<VisitTypeKey>("new-symptom");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([visitTypes["new-symptom"].questions[0], visitTypes["new-symptom"].questions[2]]);
  const [notes, setNotes] = useState("");

  const questions = visitTypes[visitType].questions;

  useEffect(() => {
    setSelectedQuestions(visitTypes[visitType].questions.slice(0, 2));
  }, [visitType, visitTypes]);

  const toggleQuestion = (question: string) => {
    setSelectedQuestions((current) =>
      current.includes(question) ? current.filter((item) => item !== question) : [...current, question]
    );
  };

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader
          title={locale === "es" ? "Planificador de consulta médica" : "Doctor Visit Planner"}
          description={
            locale === "es"
              ? "Prepárate para tu próxima cita creando una lista personalizada de preguntas y notas para que no se te pase nada."
              : "Prepare for your upcoming appointment by building a custom list of questions and notes so nothing gets missed."
          }
        />

        <div className="no-print mb-8 grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((value) => (
            <button
              key={value}
              type="button"
              className={value === step ? "rounded-lg bg-primary px-4 py-3 text-left text-on-primary" : "rounded-lg bg-surface-container px-4 py-3 text-left text-on-surface-variant"}
              onClick={() => setStep(value)}
            >
              <div className="text-sm font-semibold">{locale === "es" ? "Paso" : "Step"} {value}</div>
              <div className="text-sm">{value === 1 ? (locale === "es" ? "Tipo de visita" : "Visit type") : value === 2 ? (locale === "es" ? "Preguntas" : "Questions") : (locale === "es" ? "Revisión" : "Review")}</div>
            </button>
          ))}
        </div>

        <div className="card">
          {step === 1 ? (
            <div>
              <h2 className="mb-6 text-headline-md text-primary">{locale === "es" ? "Elige el tipo de visita" : "Choose your visit type"}</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {(Object.entries(visitTypes) as [VisitTypeKey, (typeof visitTypes)[VisitTypeKey]][]).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    className={visitType === key ? "rounded-lg border-2 border-primary bg-primary-fixed px-5 py-5 text-left" : "rounded-lg border border-outline-variant bg-surface px-5 py-5 text-left"}
                    onClick={() => {
                      setVisitType(key);
                      setSelectedQuestions(visitTypes[key].questions.slice(0, 2));
                    }}
                  >
                    <div className="text-label-lg text-primary">{value.label}</div>
                    <div className="mt-2 text-body-md text-on-surface-variant">
                      {value.questions.length} {locale === "es" ? "preguntas sugeridas" : "suggested questions"}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                  {locale === "es" ? "Continuar" : "Continue"}
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="mb-3 text-headline-md text-primary">{locale === "es" ? "Selecciona preguntas sugeridas" : "Select suggested questions"}</h2>
              <p className="mb-6 text-body-md text-on-surface-variant">
                {locale === "es" ? "Elige las preguntas que más importan para tu próxima visita." : "Choose the questions that matter most for your upcoming visit."}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {questions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className={selectedQuestions.includes(question) ? "rounded-lg border-2 border-primary bg-primary-fixed px-5 py-5 text-left" : "rounded-lg border border-outline-variant bg-surface px-5 py-5 text-left"}
                    onClick={() => toggleQuestion(question)}
                  >
                    <div className="text-label-lg text-on-surface">{question}</div>
                  </button>
                ))}
              </div>
              <label className="mt-8 block">
                <span className="input-label">{locale === "es" ? "Agrega tus propias preguntas o notas" : "Add your own questions or notes"}</span>
                <textarea
                  className="input-field min-h-40"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={locale === "es" ? "Por ejemplo: También noté un dolor leve cuando subo escaleras." : "For example: I also noticed a slight pain when I walk upstairs."}
                />
              </label>
              <div className="mt-8 flex flex-wrap justify-between gap-3">
                <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => setStep(1)}>
                  <ArrowLeft size={18} />
                  {locale === "es" ? "Atrás" : "Back"}
                </button>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => setStep(3)}>
                    <Save size={18} />
                    {locale === "es" ? "Revisar lista" : "Review list"}
                  </button>
                  <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => window.print()}>
                    <Printer size={18} />
                    {locale === "es" ? "Imprimir mi lista" : "Print my list"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="mb-6 text-headline-md text-primary">{locale === "es" ? "Tu plan de visita" : "Your visit plan"}</h2>
              <div className="mb-6 rounded-lg bg-surface-container-low p-5">
                <div className="mb-2 text-sm font-semibold text-on-surface-variant">{locale === "es" ? "Tipo de visita" : "Visit type"}</div>
                <div className="text-label-lg text-primary">{visitTypes[visitType].label}</div>
              </div>
              <div className="mb-6 rounded-lg border border-outline-variant bg-surface p-5">
                <div className="mb-4 text-label-lg text-primary">{locale === "es" ? "Preguntas para hacer" : "Questions to ask"}</div>
                <ul className="space-y-3 text-body-md text-on-surface-variant">
                  {selectedQuestions.map((question) => (
                    <li key={question}>- {question}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface p-5">
                <div className="mb-4 text-label-lg text-primary">{locale === "es" ? "Tus notas" : "Your notes"}</div>
                <div className="whitespace-pre-line text-body-md text-on-surface-variant">
                  {notes || (locale === "es" ? "Todavía no hay notas personales." : "No personal notes added yet.")}
                </div>
              </div>
              <div className="no-print mt-8 flex flex-wrap justify-between gap-3">
                <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => setStep(2)}>
                  <ArrowLeft size={18} />
                  {locale === "es" ? "Editar preguntas" : "Edit questions"}
                </button>
                <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => window.print()}>
                  <Printer size={18} />
                  {locale === "es" ? "Imprimir mi lista" : "Print my list"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
