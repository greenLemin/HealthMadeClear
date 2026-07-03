"use client";

import { useMemo } from "react";
import { ClipboardList, HeartPulse, NotebookPen, Stethoscope, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import Reveal from "@/components/ui/Reveal";

import { type StepValue, type VisitTypeKey } from "./types";
import { useVisitPlanner } from "./useVisitPlanner";
import Step1ChooseVisitType from "./components/Step1ChooseVisitType";
import Step2SelectQuestions from "./components/Step2SelectQuestions";
import Step3Review from "./components/Step3Review";

export default function VisitPlannerClient() {
  const t = useTranslations("tools");
  const tPlanner = useTranslations("tools.visitPlanner");

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

  const {
    step,
    setStep,
    visitType,
    changeVisitType,
    selectedQuestions,
    toggleQuestion,
    customQuestions,
    customInput,
    setCustomInput,
    addCustomQuestion,
    removeCustomQuestion,
    notes,
    setNotes,
  } = useVisitPlanner(visitTypes["new-symptom"].questions.slice(0, 2));

  const questions = visitTypes[visitType].questions;
  const totalQuestions = selectedQuestions.length + customQuestions.length;
  const stepProgress = Math.round((step / 3) * 100);

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
          <Step1ChooseVisitType
            visitType={visitType}
            visitTypes={visitTypes}
            visitTypeDescriptions={visitTypeDescriptions}
            prepBullets={prepBullets}
            onChangeVisitType={(nextType) =>
              changeVisitType(nextType, visitTypes[nextType].questions.slice(0, 2))
            }
            onNext={() => setStep(2)}
          />
        ) : null}

        {step === 2 ? (
          <Step2SelectQuestions
            questions={questions}
            selectedQuestions={selectedQuestions}
            customQuestions={customQuestions}
            customInput={customInput}
            notes={notes}
            onToggleQuestion={toggleQuestion}
            onCustomInputChange={setCustomInput}
            onAddCustomQuestion={addCustomQuestion}
            onRemoveCustomQuestion={removeCustomQuestion}
            onNotesChange={setNotes}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        ) : null}

        {step === 3 ? (
          <Step3Review
            visitType={visitType}
            visitTypeLabel={visitTypes[visitType].label}
            visitTypeDescription={visitTypeDescriptions[visitType]}
            selectedQuestions={selectedQuestions}
            customQuestions={customQuestions}
            totalQuestions={totalQuestions}
            notes={notes}
            onBack={() => setStep(2)}
          />
        ) : null}

        <div className="mt-10">
          <MedicalDisclaimer />
        </div>
      </div>
    </div>
  );
}
