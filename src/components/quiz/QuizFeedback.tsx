"use client";

import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";

type QuizFeedbackProps = {
  showResult: boolean;
  correct: boolean | null;
  explanation: string | undefined;
};

export default function QuizFeedback({ showResult, correct, explanation }: QuizFeedbackProps) {
  const t = useTranslations("quiz");

  if (!showResult || correct === null) return null;

  return (
    <Reveal delay={0.06} className="mt-6">
      <div
        role="alert"
        className={`rounded-[1.35rem] border px-5 py-5 ${
          correct
            ? "border-secondary bg-secondary-container/30 text-on-secondary-container"
            : "border-tertiary bg-tertiary-container/20 text-tertiary"
        }`}
      >
        <p className="mb-1 font-semibold">{correct ? t("correct") : t("incorrect")}</p>
        {explanation && <p className="text-label-md">{explanation}</p>}
      </div>
    </Reveal>
  );
}
