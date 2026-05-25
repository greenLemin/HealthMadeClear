"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { getMessages } from "@/lib/i18n";
import { STORAGE_KEYS } from "@/lib/preferences";

const VISIT_TYPE_KEYS = ["new-symptom", "medication", "followup"] as const;
type VisitTypeKey = (typeof VISIT_TYPE_KEYS)[number];

type PlannerState = {
  visitType: VisitTypeKey;
  selectedQuestions: string[];
  notes: string;
  step: number;
};

export default function VisitPlannerClient() {
  const { locale } = useAppState();
  const copy = getMessages(locale);

  const visitTypes = useMemo(
    () =>
      ({
        "new-symptom": {
          label: copy.tools.visitTypes["new-symptom"],
          questions: copy.tools.plannerQuestions["new-symptom"],
        },
        medication: {
          label: copy.tools.visitTypes.medication,
          questions: copy.tools.plannerQuestions.medication,
        },
        followup: {
          label: copy.tools.visitTypes.followup,
          questions: copy.tools.plannerQuestions.followup,
        },
      }) as Record<VisitTypeKey, { label: string; questions: string[] }>,
    [copy]
  );

  const [step, setStep] = useState(1);
  const [visitType, setVisitType] = useState<VisitTypeKey>("new-symptom");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(visitTypes["new-symptom"].questions.slice(0, 2));
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEYS.visitPlanner);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as PlannerState;
      if (VISIT_TYPE_KEYS.includes(parsed.visitType)) setVisitType(parsed.visitType);
      if (Array.isArray(parsed.selectedQuestions)) setSelectedQuestions(parsed.selectedQuestions);
      if (typeof parsed.notes === "string") setNotes(parsed.notes);
      if (parsed.step >= 1 && parsed.step <= 3) setStep(parsed.step);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const state: PlannerState = { visitType, selectedQuestions, notes, step };
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify(state));
  }, [visitType, selectedQuestions, notes, step]);

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
        <PageHeader title={copy.tools.plannerTitle} description={copy.tools.plannerDescription} />

        <div className="no-print mb-8 grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((value) => (
            <button
              key={value}
              type="button"
              className={
                value === step
                  ? "rounded-lg bg-primary px-4 py-3 text-left text-on-primary"
                  : "rounded-lg bg-surface-container px-4 py-3 text-left text-on-surface-variant"
              }
              onClick={() => setStep(value)}
            >
              <div className="text-sm font-semibold">
                {copy.tools.step} {value}
              </div>
              <div className="text-sm">
                {value === 1 ? copy.tools.visitType : value === 2 ? copy.tools.questions : copy.tools.review}
              </div>
            </button>
          ))}
        </div>

        <div className="card">
          {step === 1 ? (
            <div>
              <h2 className="mb-6 text-headline-md text-primary">{copy.tools.chooseVisitType}</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {(Object.entries(visitTypes) as [VisitTypeKey, (typeof visitTypes)[VisitTypeKey]][]).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    className={
                      visitType === key
                        ? "rounded-lg border-2 border-primary bg-primary-fixed px-5 py-5 text-left"
                        : "rounded-lg border border-outline-variant bg-surface px-5 py-5 text-left"
                    }
                    onClick={() => {
                      setVisitType(key);
                      setSelectedQuestions(visitTypes[key].questions.slice(0, 2));
                    }}
                  >
                    <div className="text-label-lg text-primary">{value.label}</div>
                    <div className="mt-2 text-body-md text-on-surface-variant">
                      {value.questions.length} {copy.tools.suggestedQuestions}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                  {copy.common.continue}
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="mb-3 text-headline-md text-primary">{copy.tools.selectQuestions}</h2>
              <p className="mb-6 text-body-md text-on-surface-variant">{copy.tools.selectQuestionsBody}</p>
              <div className="grid gap-4 md:grid-cols-2">
                {questions.map((question) => {
                  const selected = selectedQuestions.includes(question);
                  const inputId = `question-${question.slice(0, 20)}`;
                  return (
                    <label
                      key={question}
                      htmlFor={inputId}
                      className={
                        selected
                          ? "flex cursor-pointer items-start gap-3 rounded-lg border-2 border-primary bg-primary-fixed px-5 py-5"
                          : "flex cursor-pointer items-start gap-3 rounded-lg border border-outline-variant bg-surface px-5 py-5"
                      }
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        className="mt-1 h-5 w-5 rounded border-outline text-primary focus:ring-primary"
                        checked={selected}
                        onChange={() => toggleQuestion(question)}
                      />
                      <span className="text-label-lg text-on-surface">{question}</span>
                    </label>
                  );
                })}
              </div>
              <label className="mt-8 block">
                <span className="input-label">{copy.tools.addNotes}</span>
                <textarea
                  className="input-field min-h-40"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={copy.tools.notesPlaceholder}
                />
              </label>
              <div className="mt-8 flex flex-wrap justify-between gap-3">
                <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => setStep(1)}>
                  <ArrowLeft size={18} />
                  {copy.common.back}
                </button>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="btn-secondary" onClick={() => setStep(3)}>
                    {copy.tools.reviewList}
                  </button>
                  <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => window.print()}>
                    <Printer size={18} />
                    {copy.tools.printList}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="mb-6 text-headline-md text-primary">{copy.tools.yourVisitPlan}</h2>
              <div className="mb-6 rounded-lg bg-surface-container-low p-5">
                <div className="mb-2 text-sm font-semibold text-on-surface-variant">{copy.tools.visitType}</div>
                <div className="text-label-lg text-primary">{visitTypes[visitType].label}</div>
              </div>
              <div className="mb-6 rounded-lg border border-outline-variant bg-surface p-5">
                <div className="mb-4 text-label-lg text-primary">{copy.tools.questionsToAsk}</div>
                <ul className="space-y-3 text-body-md text-on-surface-variant">
                  {selectedQuestions.map((question) => (
                    <li key={question}>- {question}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface p-5">
                <div className="mb-4 text-label-lg text-primary">{copy.tools.yourNotes}</div>
                <div className="whitespace-pre-line text-body-md text-on-surface-variant">
                  {notes || copy.tools.noNotes}
                </div>
              </div>
              <div className="no-print mt-8 flex flex-wrap justify-between gap-3">
                <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => setStep(2)}>
                  <ArrowLeft size={18} />
                  {copy.tools.editQuestions}
                </button>
                <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => window.print()}>
                  <Printer size={18} />
                  {copy.tools.printList}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          <MedicalDisclaimer locale={locale} />
        </div>
      </div>
    </main>
  );
}
