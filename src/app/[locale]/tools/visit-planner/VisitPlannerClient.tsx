"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  HeartPulse,
  NotebookPen,
  Printer,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import Reveal from "@/components/ui/Reveal";
import { STORAGE_KEYS, readStoredJson, writeStoredJson } from "@/lib/preferences";

const VISIT_TYPE_KEYS = ["new-symptom", "medication", "followup"] as const;
type VisitTypeKey = (typeof VISIT_TYPE_KEYS)[number];
type StepValue = 1 | 2 | 3;

type CustomQuestion = { id: string; text: string };

type PlannerState = {
  visitType: VisitTypeKey;
  selectedQuestions: string[];
  customQuestions?: CustomQuestion[];
  notes: string;
  step: StepValue;
};

export default function VisitPlannerClient() {
  const t = useTranslations("tools");
  const tPlanner = useTranslations("tools.visitPlanner");
  const tCommon = useTranslations("common");

  const prepBullets = useMemo(() => tPlanner.raw("prepBullets") as string[], [tPlanner]);
  const stepDescriptions = useMemo(
    () =>
      ({
        1: tPlanner("stepDescription1"),
        2: tPlanner("stepDescription2"),
        3: tPlanner("stepDescription3"),
      }) as Record<StepValue, string>,
    [tPlanner]
  );
  const visitTypeDescriptions = useMemo(
    () => tPlanner.raw("visitTypeDescriptions") as Record<VisitTypeKey, string>,
    [tPlanner]
  );

  const visitTypes = useMemo(
    () =>
      ({
        "new-symptom": {
          label: t("visitTypes.new-symptom"),
          questions: t.raw("plannerQuestions.new-symptom") as string[],
          icon: HeartPulse,
        },
        medication: {
          label: t("visitTypes.medication"),
          questions: t.raw("plannerQuestions.medication") as string[],
          icon: Stethoscope,
        },
        followup: {
          label: t("visitTypes.followup"),
          questions: t.raw("plannerQuestions.followup") as string[],
          icon: ClipboardList,
        },
      }) as Record<VisitTypeKey, { label: string; questions: string[]; icon: LucideIcon }>,
    [t]
  );

  const steps = useMemo(
    () => [
      {
        value: 1 as StepValue,
        label: t("visitType"),
        title: t("chooseVisitType"),
        description: stepDescriptions[1],
        icon: HeartPulse,
      },
      {
        value: 2 as StepValue,
        label: t("questions"),
        title: t("selectQuestions"),
        description: stepDescriptions[2],
        icon: NotebookPen,
      },
      {
        value: 3 as StepValue,
        label: t("review"),
        title: t("yourVisitPlan"),
        description: stepDescriptions[3],
        icon: ClipboardList,
      },
    ],
    [stepDescriptions, t]
  );

  const [step, setStep] = useState<StepValue>(1);
  const [visitType, setVisitType] = useState<VisitTypeKey>("new-symptom");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [notes, setNotes] = useState("");
  const [hydrated, setHydrated] = useState(false);

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
        step:
          typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 3
            ? (parsed.step as StepValue)
            : 1,
      };
    });

    if (saved) {
      setStep(saved.step);
      setVisitType(saved.visitType);
      setSelectedQuestions(saved.selectedQuestions);
      setCustomQuestions(saved.customQuestions ?? []);
      setNotes(saved.notes);
    } else {
      setSelectedQuestions(visitTypes["new-symptom"].questions.slice(0, 2));
    }

    setHydrated(true);
  }, [visitTypes]);

  useEffect(() => {
    if (!hydrated) return;

    const state: PlannerState = {
      visitType,
      selectedQuestions,
      customQuestions,
      notes: notes.slice(0, 2000),
      step,
    };

    writeStoredJson(STORAGE_KEYS.visitPlanner, state);
  }, [customQuestions, hydrated, notes, selectedQuestions, step, visitType]);

  const questions = visitTypes[visitType].questions;
  const selectedQuestionsSet = useMemo(() => new Set(selectedQuestions), [selectedQuestions]);
  const totalQuestions = selectedQuestions.length + customQuestions.length;
  const stepProgress = Math.round((step / 3) * 100);

  const changeVisitType = (nextType: VisitTypeKey) => {
    setVisitType(nextType);
    setSelectedQuestions(visitTypes[nextType].questions.slice(0, 2));
  };

  const addCustomQuestion = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (customQuestions.some((q) => q.text.toLowerCase() === trimmed.toLowerCase())) return;

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
      <div className="mx-auto max-w-container px-4 md:px-6">
        <PageHeader centered title={t("plannerTitle")} description={t("plannerDescription")} className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            <span className="metric-pill">{visitTypes[visitType].label}</span>
            <span className="metric-pill bg-secondary-container/60 text-secondary">
              {tPlanner("selectedCount", { count: totalQuestions })}
            </span>
            <span className="metric-pill bg-tertiary-container/60 text-tertiary">
              {tPlanner("stepStatus", { step })}
            </span>
          </div>
        </PageHeader>

        <Reveal>
          <section className="surface-card-glass no-print px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="eyebrow mb-3">{tPlanner("introEyebrow")}</div>
                <h2 className="font-display text-headline-lg text-primary">{steps[step - 1].title}</h2>
                <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">
                  {steps[step - 1].description}
                </p>
              </div>
              <div className="w-full max-w-sm">
                <ProgressBar value={stepProgress} label={tPlanner("stepStatus", { step })} showPercentage />
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {steps.map((entry) => {
                const active = entry.value === step;
                const Icon = entry.icon;
                return (
                  <button
                    key={entry.value}
                    type="button"
                    aria-current={active ? "step" : undefined}
                    className={[
                      "text-left",
                      active
                        ? "surface-card-strong px-5 py-5 shadow-elevation-2"
                        : "surface-card px-5 py-5 hover:-translate-y-0.5 hover:border-primary/20",
                    ].join(" ")}
                    onClick={() => setStep(entry.value)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-elevation-1">
                        <Icon size={22} aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-label-md text-on-surface-variant">
                          {t("step")} {entry.value}
                        </div>
                        <div className="mt-1 font-display text-headline-md text-primary">{entry.label}</div>
                        <p className="mt-2 text-label-md text-on-surface-variant">{entry.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </Reveal>

        {step === 1 ? (
          <div className="mt-8">
            <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Reveal>
                <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
                  <div className="eyebrow mb-3">{tPlanner("introEyebrow")}</div>
                  <h2 className="font-display text-headline-lg text-primary">{tPlanner("prepTitle")}</h2>
                  <p className="mt-3 text-body-md text-on-surface-variant">{tPlanner("prepBody")}</p>

                  <div className="mt-6 space-y-3">
                    {prepBullets.map((item, index) => (
                      <div key={item} className="surface-card flex items-center gap-4 px-4 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-label-md font-semibold text-primary shadow-elevation-1">
                          {index + 1}
                        </div>
                        <p className="text-body-md text-on-surface">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                {(Object.entries(visitTypes) as [VisitTypeKey, (typeof visitTypes)[VisitTypeKey]][]).map(
                  ([key, value], index) => {
                    const active = visitType === key;
                    const Icon = value.icon;

                    return (
                      <Reveal key={key} delay={Math.min(index * 0.04, 0.12)}>
                        <button
                          type="button"
                          aria-pressed={active}
                          className={[
                            "h-full text-left",
                            active
                              ? "surface-card-strong px-6 py-6 shadow-elevation-2"
                              : "surface-card px-6 py-6 hover:-translate-y-0.5 hover:border-primary/20",
                          ].join(" ")}
                          onClick={() => changeVisitType(key)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-elevation-1">
                              <Icon size={22} aria-hidden="true" />
                            </div>
                            <span className={active ? "chip-active" : "chip"}>
                              {value.questions.length} {t("suggestedQuestions")}
                            </span>
                          </div>
                          <h3 className="mt-5 font-display text-headline-md text-primary">{value.label}</h3>
                          <p className="mt-3 text-body-md text-on-surface-variant">
                            {visitTypeDescriptions[key]}
                          </p>
                        </button>
                      </Reveal>
                    );
                  }
                )}
              </div>
            </section>

            <div className="no-print mt-8 flex justify-end">
              <Button onClick={() => setStep(2)}>{tCommon("continue")}</Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-8 space-y-6">
            <Reveal>
              <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <div className="eyebrow mb-3">{t("questions")}</div>
                    <h2 className="font-display text-headline-lg text-primary">{t("selectQuestions")}</h2>
                    <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">
                      {t("selectQuestionsBody")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="metric-pill">
                      {tPlanner("suggestedCount", { count: selectedQuestions.length })}
                    </span>
                    <span className="metric-pill bg-secondary-container/60 text-secondary">
                      {tPlanner("customCount", { count: customQuestions.length })}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            <fieldset className="m-0 border-0 p-0">
              <legend className="sr-only">{t("selectQuestions")}</legend>
              <div className="grid gap-4 md:grid-cols-2">
                {questions.map((question, index) => {
                  const selected = selectedQuestionsSet.has(question);
                  const inputId = `question-${question.slice(0, 24).replace(/\s+/g, "-")}-${index}`;

                  return (
                    <Reveal key={question} delay={Math.min(index * 0.02, 0.14)}>
                      <label
                        htmlFor={inputId}
                        className={[
                          "flex cursor-pointer items-start gap-4 px-5 py-5",
                          selected
                            ? "surface-card-strong border-primary/20 shadow-elevation-2"
                            : "surface-card hover:-translate-y-0.5 hover:border-primary/20",
                        ].join(" ")}
                      >
                        <input
                          id={inputId}
                          type="checkbox"
                          className="mt-1 h-5 w-5 rounded border-outline text-primary focus:ring-primary"
                          checked={selected}
                          onChange={() => toggleQuestion(question)}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block text-label-lg text-on-surface">{question}</span>
                          <span className="mt-2 block text-label-md text-on-surface-variant">
                            {selected ? tPlanner("questionHintActive") : tPlanner("questionHintIdle")}
                          </span>
                        </div>
                      </label>
                    </Reveal>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Reveal>
                <div className="surface-card px-6 py-6 md:px-8 md:py-8">
                  <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary shadow-elevation-1">
                      <NotebookPen size={22} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-headline-md text-primary">
                        {t("customQuestionsTitle")}
                      </h3>
                      <p className="mt-2 text-body-md text-on-surface-variant">
                        {tPlanner("customSectionBody")}
                      </p>
                    </div>
                  </div>

                  <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      className="input-field"
                      placeholder={t("customQuestionPlaceholder")}
                      aria-label={t("customQuestionPlaceholder")}
                      value={customInput}
                      onChange={(event) => setCustomInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addCustomQuestion();
                        }
                      }}
                    />
                    <Button
                      onClick={addCustomQuestion}
                      disabled={!customInput.trim()}
                      className="sm:self-start"
                    >
                      {tCommon("add")}
                    </Button>
                  </div>

                  {customQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {customQuestions.map((cq) => (
                        <div
                          key={cq.id}
                          className="surface-card-muted flex items-center justify-between gap-4 px-4 py-4"
                        >
                          <span className="text-body-md text-on-surface">{cq.text}</span>
                          <button
                            type="button"
                            className="text-label-md font-semibold text-error transition-colors hover:text-error/80"
                            onClick={() => removeCustomQuestion(cq.id)}
                            aria-label={`${t("remove")} "${cq.text}"`}
                          >
                            {t("remove")}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body-md text-on-surface-variant">{tPlanner("customEmpty")}</p>
                  )}
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <div className="surface-card-glass px-6 py-6 md:px-8 md:py-8">
                  <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-elevation-1">
                      <ClipboardList size={22} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-headline-md text-primary">{t("addNotes")}</h3>
                      <p className="mt-2 text-body-md text-on-surface-variant">{tPlanner("notesBody")}</p>
                    </div>
                  </div>

                  <label className="block">
                    <span className="input-label">{t("addNotes")}</span>
                    <textarea
                      className="input-field min-h-48"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder={t("notesPlaceholder")}
                      maxLength={2000}
                    />
                  </label>
                  <p className="mt-3 text-label-md text-on-surface-variant">{notes.length}/2000</p>
                </div>
              </Reveal>
            </div>

            <div className="no-print flex flex-wrap justify-between gap-3">
              <Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={() => setStep(1)}>
                {tCommon("back")}
              </Button>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setStep(3)}>
                  {t("reviewList")}
                </Button>
                <Button icon={<Printer size={18} />} onClick={() => window.print()}>
                  {t("printList")}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-8 space-y-6">
            <Reveal>
              <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="eyebrow mb-3">{tPlanner("reviewEyebrow")}</div>
                    <h2 className="font-display text-headline-lg text-primary">{t("yourVisitPlan")}</h2>
                    <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">
                      {tPlanner("reviewHint")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="metric-pill">{visitTypes[visitType].label}</span>
                    <span className="metric-pill bg-secondary-container/60 text-secondary">
                      {tPlanner("selectedCount", { count: totalQuestions })}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Reveal>
                <div className="surface-card px-6 py-6 md:px-8 md:py-8">
                  <div className="eyebrow mb-4">{t("visitType")}</div>
                  <h3 className="font-display text-headline-lg text-primary">
                    {visitTypes[visitType].label}
                  </h3>
                  <p className="mt-3 text-body-md text-on-surface-variant">
                    {visitTypeDescriptions[visitType]}
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <div className="surface-card-glass px-6 py-6 md:px-8 md:py-8">
                  <div className="eyebrow mb-4">{t("questionsToAsk")}</div>
                  {totalQuestions > 0 ? (
                    <ul className="space-y-3">
                      {selectedQuestions.map((question) => (
                        <li key={question} className="surface-card flex items-start gap-3 px-4 py-4">
                          <span className="text-primary" aria-hidden="true">
                            •
                          </span>
                          <span className="text-body-md text-on-surface">{question}</span>
                        </li>
                      ))}
                      {customQuestions.map((cq) => (
                        <li key={cq.id} className="surface-card flex items-start gap-3 px-4 py-4">
                          <span className="text-secondary" aria-hidden="true">
                            •
                          </span>
                          <span className="text-body-md text-on-surface">{cq.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-body-md text-on-surface-variant">{t("noQuestionsSelected")}</p>
                  )}
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.08}>
              <div className="surface-card px-6 py-6 md:px-8 md:py-8">
                <div className="eyebrow mb-4">{t("yourNotes")}</div>
                <div className="whitespace-pre-line text-body-md text-on-surface-variant">
                  {notes || t("noNotes")}
                </div>
              </div>
            </Reveal>

            <div className="no-print flex flex-wrap justify-between gap-3">
              <Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={() => setStep(2)}>
                {t("editQuestions")}
              </Button>
              <Button icon={<Printer size={18} />} onClick={() => window.print()}>
                {t("printList")}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-10">
          <MedicalDisclaimer />
        </div>
      </div>
    </div>
  );
}
