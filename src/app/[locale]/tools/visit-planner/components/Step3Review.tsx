import { useTranslations } from "next-intl";
import { ArrowLeft, Printer } from "lucide-react";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { type CustomQuestion, type VisitTypeKey } from "../types";

type Props = {
  visitType: VisitTypeKey;
  visitTypeLabel: string;
  visitTypeDescription: string;
  selectedQuestions: string[];
  customQuestions: CustomQuestion[];
  totalQuestions: number;
  notes: string;
  onBack: () => void;
};

function ReviewHeader({
  visitTypeLabel,
  totalQuestions,
}: {
  visitTypeLabel: string;
  totalQuestions: number;
}) {
  const t = useTranslations("tools");
  const tPlanner = useTranslations("tools.visitPlanner");

  return (
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
            <span className="metric-pill">{visitTypeLabel}</span>
            <span className="metric-pill bg-secondary-container/60 text-secondary">
              {tPlanner("selectedCount", { count: totalQuestions })}
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function VisitTypeCard({
  visitTypeLabel,
  visitTypeDescription,
}: {
  visitTypeLabel: string;
  visitTypeDescription: string;
}) {
  const t = useTranslations("tools");

  return (
    <Reveal>
      <div className="surface-card px-6 py-6 md:px-8 md:py-8">
        <div className="eyebrow mb-4">{t("visitType")}</div>
        <h3 className="font-display text-headline-lg text-primary">{visitTypeLabel}</h3>
        <p className="mt-3 text-body-md text-on-surface-variant">{visitTypeDescription}</p>
      </div>
    </Reveal>
  );
}

function QuestionsList({
  selectedQuestions,
  customQuestions,
  totalQuestions,
}: {
  selectedQuestions: string[];
  customQuestions: CustomQuestion[];
  totalQuestions: number;
}) {
  const t = useTranslations("tools");

  return (
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
  );
}

function NotesCard({ notes }: { notes: string }) {
  const t = useTranslations("tools");

  return (
    <Reveal delay={0.08}>
      <div className="surface-card px-6 py-6 md:px-8 md:py-8">
        <div className="eyebrow mb-4">{t("yourNotes")}</div>
        <div className="whitespace-pre-line text-body-md text-on-surface-variant">
          {notes || t("noNotes")}
        </div>
      </div>
    </Reveal>
  );
}

function ActionButtons({ onBack }: { onBack: () => void }) {
  const t = useTranslations("tools");

  return (
    <div className="no-print flex flex-wrap justify-between gap-3">
      <Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={onBack}>
        {t("editQuestions")}
      </Button>
      <Button icon={<Printer size={18} />} onClick={() => window.print()}>
        {t("printList")}
      </Button>
    </div>
  );
}

export default function Step3Review({
  visitTypeLabel,
  visitTypeDescription,
  selectedQuestions,
  customQuestions,
  totalQuestions,
  notes,
  onBack,
}: Props) {
  return (
    <div className="mt-8 space-y-6">
      <ReviewHeader visitTypeLabel={visitTypeLabel} totalQuestions={totalQuestions} />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <VisitTypeCard visitTypeLabel={visitTypeLabel} visitTypeDescription={visitTypeDescription} />
        <QuestionsList
          selectedQuestions={selectedQuestions}
          customQuestions={customQuestions}
          totalQuestions={totalQuestions}
        />
      </div>

      <NotesCard notes={notes} />

      <ActionButtons onBack={onBack} />
    </div>
  );
}
