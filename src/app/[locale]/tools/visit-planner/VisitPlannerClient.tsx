"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import { STORAGE_KEYS, readStoredJson, writeStoredJson } from "@/lib/preferences";
import { useTranslations } from "next-intl";

const VISIT_TYPE_KEYS = ["new-symptom", "medication", "followup"] as const;
type VisitTypeKey = (typeof VISIT_TYPE_KEYS)[number];

type CustomQuestion = { id: string; text: string };

type PlannerState = {
  visitType: VisitTypeKey;
  selectedQuestions: string[];
  customQuestions?: CustomQuestion[];
  notes: string;
  step: number;
};

export default function VisitPlannerClient() {
  const t = useTranslations("tools");
  const tCommon = useTranslations("common");

  const visitTypes = useMemo(
    () =>
      ({
        "new-symptom": {
          label: t("visitTypes.new-symptom"),
          questions: t.raw("plannerQuestions.new-symptom") as string[],
        },
        medication: {
          label: t("visitTypes.medication"),
          questions: t.raw("plannerQuestions.medication") as string[],
        },
        followup: {
          label: t("visitTypes.followup"),
          questions: t.raw("plannerQuestions.followup") as string[],
        },
      }) as Record<VisitTypeKey, { label: string; questions: string[] }>,
    [t]
  );

  const [step, setStep] = useState(1);
  const [visitType, setVisitType] = useState<VisitTypeKey>("new-symptom");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(
    visitTypes["new-symptom"].questions.slice(0, 2)
  );
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = readStoredJson(STORAGE_KEYS.visitPlanner, (value): PlannerState | null => {
      if (!value || typeof value !== "object") return null;
      const parsed = value as Partial<PlannerState>;
      if (!VISIT_TYPE_KEYS.includes(parsed.visitType as VisitTypeKey)) return null;
      const rawCustom = parsed.customQuestions;
      const customQuestions: CustomQuestion[] = Array.isArray(rawCustom)
        ? rawCustom.filter(
            (q): q is CustomQuestion =>
              !!q &&
              typeof (q as CustomQuestion).id === "string" &&
              typeof (q as CustomQuestion).text === "string"
          )
        : [];
      return {
        visitType: parsed.visitType as VisitTypeKey,
        selectedQuestions: Array.isArray(parsed.selectedQuestions)
          ? parsed.selectedQuestions.filter((q): q is string => typeof q === "string")
          : [],
        customQuestions,
        notes: typeof parsed.notes === "string" ? parsed.notes.slice(0, 2000) : "",
        step: typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 3 ? parsed.step : 1,
      };
    });
    if (!saved) return;
    setVisitType(saved.visitType);
    setSelectedQuestions(saved.selectedQuestions);
    if (saved.customQuestions) setCustomQuestions(saved.customQuestions);
    setNotes(saved.notes);
    setStep(saved.step);
  }, []);

  useEffect(() => {
    const state: PlannerState = {
      visitType,
      selectedQuestions,
      customQuestions,
      notes: notes.slice(0, 2000),
      step,
    };
    writeStoredJson(STORAGE_KEYS.visitPlanner, state);
  }, [visitType, selectedQuestions, customQuestions, notes, step]);

  const questions = visitTypes[visitType].questions;

  useEffect(() => {
    setSelectedQuestions(visitTypes[visitType].questions.slice(0, 2));
  }, [visitType, visitTypes]);

  const addCustomQuestion = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (customQuestions.some((q) => q.text === trimmed)) return;
    setCustomQuestions((current) => [...current, { id: `cq-${Date.now()}`, text: trimmed }]);
    setCustomInput("");
  };

  const removeCustomQuestion = (idToRemove: string) => {
    setCustomQuestions((current) => current.filter((q) => q.id !== idToRemove));
  };

  const toggleQuestion = (question: string) => {
    setSelectedQuestions((current) =>
      current.includes(question) ? current.filter((item) => item !== question) : [...current, question]
    );
  };

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader title={t("plannerTitle")} description={t("plannerDescription")} />

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
              <div className="text-label-md font-semibold">
                {t("step")} {value}
              </div>
              <div className="text-label-md">
                {value === 1 ? t("visitType") : value === 2 ? t("questions") : t("review")}
              </div>
            </button>
          ))}
        </div>

        <div className="card">
          {step === 1 ? (
            <div>
              <h2 className="mb-6 text-headline-md text-primary">{t("chooseVisitType")}</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {(Object.entries(visitTypes) as [VisitTypeKey, (typeof visitTypes)[VisitTypeKey]][]).map(
                  ([key, value]) => (
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
                        {value.questions.length} {t("suggestedQuestions")}
                      </div>
                    </button>
                  )
                )}
              </div>
              <div className="mt-8 flex justify-end">
                <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                  {tCommon("continue")}
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="mb-3 text-headline-md text-primary">{t("selectQuestions")}</h2>
              <p className="mb-6 text-body-md text-on-surface-variant">{t("selectQuestionsBody")}</p>
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

              {/* Custom Questions Section */}
              <div className="mt-8 border-t border-outline-variant pt-8">
                <h3 className="mb-4 text-headline-md text-primary">
                  {t("customQuestionsTitle", { defaultValue: "Your Custom Questions" })}
                </h3>
                <div className="mb-4 flex gap-3">
                  <input
                    type="text"
                    className="input-field py-2"
                    placeholder={t("customQuestionPlaceholder", {
                      defaultValue: "Type your custom question here...",
                    })}
                    aria-label={t("customQuestionPlaceholder", {
                      defaultValue: "Type your custom question here...",
                    })}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomQuestion();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-primary min-h-[48px] py-2 px-4"
                    onClick={addCustomQuestion}
                  >
                    {tCommon("add", { defaultValue: "Add" })}
                  </button>
                </div>

                {customQuestions.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {customQuestions.map((cq) => (
                      <div
                        key={cq.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface px-5 py-4"
                      >
                        <span className="text-body-md text-on-surface">{cq.text}</span>
                        <button
                          type="button"
                          className="text-error hover:text-red-700 font-semibold text-label-md"
                          onClick={() => removeCustomQuestion(cq.id)}
                        >
                          {t("remove", { defaultValue: "Remove" })}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="mt-8 block">
                <span className="input-label">{t("addNotes")}</span>
                <textarea
                  className="input-field min-h-40"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t("notesPlaceholder")}
                  maxLength={2000}
                />
              </label>
              <div className="mt-8 flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={18} />
                  {tCommon("back")}
                </button>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="btn-secondary" onClick={() => setStep(3)}>
                    {t("reviewList")}
                  </button>
                  <button
                    type="button"
                    className="btn-primary inline-flex items-center gap-2"
                    onClick={() => window.print()}
                  >
                    <Printer size={18} />
                    {t("printList")}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="mb-6 text-headline-md text-primary">{t("yourVisitPlan")}</h2>
              <div className="mb-6 rounded-lg bg-surface-container-low p-5">
                <div className="mb-2 text-label-md font-semibold text-on-surface-variant">
                  {t("visitType")}
                </div>
                <div className="text-label-lg text-primary">{visitTypes[visitType].label}</div>
              </div>
              <div className="mb-6 rounded-lg border border-outline-variant bg-surface p-5">
                <div className="mb-4 text-label-lg text-primary">{t("questionsToAsk")}</div>
                <ul className="space-y-3 text-body-md text-on-surface-variant">
                  {selectedQuestions.map((question) => (
                    <li key={question}>- {question}</li>
                  ))}
                  {customQuestions.map((cq) => (
                    <li key={cq.id}>- {cq.text}</li>
                  ))}
                  {selectedQuestions.length === 0 && customQuestions.length === 0 && (
                    <li>{t("noQuestionsSelected", { defaultValue: "No questions selected." })}</li>
                  )}
                </ul>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface p-5">
                <div className="mb-4 text-label-lg text-primary">{t("yourNotes")}</div>
                <div className="whitespace-pre-line text-body-md text-on-surface-variant">
                  {notes || t("noNotes")}
                </div>
              </div>
              <div className="no-print mt-8 flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft size={18} />
                  {t("editQuestions")}
                </button>
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2"
                  onClick={() => window.print()}
                >
                  <Printer size={18} />
                  {t("printList")}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          <MedicalDisclaimer />
        </div>
      </div>
    </div>
  );
}
