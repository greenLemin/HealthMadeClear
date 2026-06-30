"use client";

import { useMemo } from "react";
import { CheckCircle2, XCircle, ArrowRight, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import type { Quiz } from "@/types/quiz";

interface QuizResultsProps {
  quiz: Quiz;
  answers: number[];
  score: number;
  passed: boolean;
  onRetake: () => void;
  onContinue: () => void;
}

const LETTER_TO_IDX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

export default function QuizResults({
  quiz,
  answers,
  score,
  passed,
  onRetake,
  onContinue,
}: QuizResultsProps) {
  const t = useTranslations("quiz");
  const tCommon = useTranslations("common");
  const maxScore = quiz.questions.length;
  const correctCount = useMemo(
    () =>
      quiz.questions.filter((q, i) => {
        const correctIdx = q.correctAnswer ? LETTER_TO_IDX[q.correctAnswer] : (q.correctIndex ?? -1);
        return answers[i] === correctIdx;
      }).length,
    [quiz.questions, answers]
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="mb-8 text-center" role="status" aria-live="polite">
        <h1 className="mb-4 font-display text-headline-lg text-primary">{quiz.title}</h1>
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-surface-container"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${score} ${100 - score}`}
              strokeLinecap="round"
              className={passed ? "text-secondary" : "text-tertiary"}
            />
          </svg>
          <span className="absolute text-headline-lg font-bold text-on-surface">{Math.round(score)}%</span>
        </div>
        <p className="mb-2 text-body-lg text-on-surface-variant">
          {t("scoreLabel", { score: Math.round(score), correct: correctCount, total: maxScore })}
        </p>
        {passed ? (
          <p className="mb-6 text-headline-md text-secondary">{t("passed")}</p>
        ) : (
          <p className="mb-6 text-body-md text-on-surface-variant">{t("tryAgain")}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {passed ? (
            <Button type="button" icon={<ArrowRight size={18} />} onClick={onContinue}>
              {tCommon("continue")}
            </Button>
          ) : null}
          <Button type="button" variant="secondary" icon={<RefreshCw size={18} />} onClick={onRetake}>
            {t("retake")}
          </Button>
        </div>
      </Card>

      <div className="space-y-6">
        {quiz.questions.map((q, i) => {
          const userAnswerIdx = answers[i];
          const correctIdx = q.correctAnswer ? LETTER_TO_IDX[q.correctAnswer] : (q.correctIndex ?? -1);
          const isCorrect = userAnswerIdx === correctIdx;

          return (
            <div
              key={i}
              className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container text-label-md font-bold text-on-surface">
                  {i + 1}
                </span>
                {isCorrect ? (
                  <span className="inline-flex items-center gap-1 text-label-md font-semibold text-secondary">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    {t("correct")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-label-md font-semibold text-tertiary">
                    <XCircle size={18} aria-hidden="true" />
                    {t("incorrect")}
                  </span>
                )}
              </div>
              <p className="mb-4 font-semibold text-on-surface">{q.question}</p>
              <div className="mb-4 space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = userAnswerIdx === oi;
                  const isCorrectOption = oi === correctIdx;
                  let className =
                    "rounded-xl border px-4 py-3 text-body-md flex items-center gap-3 transition-colors ";
                  if (isCorrectOption) {
                    className += "border-secondary bg-secondary-container/30 text-on-secondary-container";
                  } else if (isSelected && !isCorrectOption) {
                    className += "border-tertiary bg-tertiary-container/20 text-tertiary";
                  } else {
                    className += "border-outline-variant text-on-surface";
                  }
                  return (
                    <div key={oi} className={className}>
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-label-md font-bold text-on-surface-variant"
                        aria-hidden="true"
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrectOption ? (
                        <span className="shrink-0 text-label-sm font-semibold text-secondary">
                          {t("correctAnswer")}
                        </span>
                      ) : isSelected ? (
                        <span className="shrink-0 text-label-sm font-semibold text-tertiary">
                          {t("yourAnswer")}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="rounded-xl bg-surface-container-low px-4 py-3 text-label-md text-on-surface-variant">
                <span className="font-semibold text-primary">{t("explanation")}: </span>
                {q.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
