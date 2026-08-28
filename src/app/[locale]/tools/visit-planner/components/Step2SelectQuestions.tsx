"use client";
import { useTranslations } from "next-intl";
import { ArrowLeft, ClipboardList, NotebookPen, Printer } from "lucide-react";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { type CustomQuestion, type PlannerQuestion } from "@/types/visitPlanner";

type Props = {
  questions: PlannerQuestion[];
  selectedQuestions: string[];
  customQuestions: CustomQuestion[];
  customInput: string;
  notes: string;
  actionsDisabled?: boolean;
  onToggleQuestion: (questionId: string) => void;
  onCustomInputChange: (val: string) => void;
  onAddCustomQuestion: () => void;
  onRemoveCustomQuestion: (id: string) => void;
  onNotesChange: (val: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function Step2SelectQuestions({
  questions,
  selectedQuestions,
  customQuestions,
  customInput,
  notes,
  actionsDisabled = false,
  onToggleQuestion,
  onCustomInputChange,
  onAddCustomQuestion,
  onRemoveCustomQuestion,
  onNotesChange,
  onBack,
  onNext,
}: Props) {
  const t = useTranslations("tools");
  const tPlanner = useTranslations("tools.visitPlanner");
  const tCommon = useTranslations("common");

  const selectedQuestionsSet = new Set(selectedQuestions);

  return (
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
            const selected = selectedQuestionsSet.has(question.id);
            const inputId = `question-${question.id}`;

            return (
              <Reveal key={question.id} delay={Math.min(index * 0.02, 0.14)}>
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
                    onChange={() => onToggleQuestion(question.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block text-label-lg text-on-surface">{question.text}</span>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-elevation-1">
                <NotebookPen size={22} aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-headline-md text-primary">{t("customQuestionsTitle")}</h3>
                <p className="mt-2 text-body-md text-on-surface-variant">{tPlanner("customSectionBody")}</p>
              </div>
            </div>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                className="input-field"
                placeholder={t("customQuestionPlaceholder")}
                aria-label={t("customQuestionPlaceholder")}
                value={customInput}
                onChange={(event) => onCustomInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onAddCustomQuestion();
                  }
                }}
              />
              <Button onClick={onAddCustomQuestion} disabled={!customInput.trim()} className="sm:self-start">
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
                      onClick={() => onRemoveCustomQuestion(cq.id)}
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
                onChange={(event) => onNotesChange(event.target.value)}
                placeholder={t("notesPlaceholder")}
                maxLength={2000}
              />
            </label>
            <p className="mt-3 text-label-md text-on-surface-variant">{notes.length}/2000</p>
          </div>
        </Reveal>
      </div>

      <div className="no-print flex flex-wrap justify-between gap-3">
        <Button
          variant="secondary"
          icon={<ArrowLeft size={18} />}
          onClick={onBack}
          disabled={actionsDisabled}
        >
          {tCommon("back")}
        </Button>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onNext} disabled={actionsDisabled}>
            {t("reviewList")}
          </Button>
          <Button icon={<Printer size={18} />} onClick={() => window.print()}>
            {t("printList")}
          </Button>
        </div>
      </div>
    </div>
  );
}
