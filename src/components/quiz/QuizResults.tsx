"use client";

import { useMemo } from "react";
import { CheckCircle2, XCircle, ArrowRight, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
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
      <div className="card mb-8 text-center">
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
              strokeDasharray={`${(score / maxScore) * 100} ${100 - (score / maxScore) * 100}`}
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
            <button type="button" onClick={onContinue} className="btn-primary inline-flex items-center gap-2">
              {tCommon("continue")}
              <ArrowRight size={18} />
            </button>
          ) : null}
          <button type="button" onClick={onRetake} className="btn-secondary inline-flex items-center gap-2">
            <RefreshCw size={18} />
            {t("retake")}
          </button>
        </div>
      </div>

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
                  <CheckCircle2 size={18} className="text-secondary" aria-label="Correct" />
                ) : (
                  <XCircle size={18} className="text-tertiary" aria-label="Incorrect" />
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
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-label-md font-bold text-on-surface-variant">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span>{opt}</span>
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
