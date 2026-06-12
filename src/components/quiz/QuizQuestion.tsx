"use client";

import type { QuizQuestion as QuizQuestionType } from "@/types/quiz";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export default function QuizQuestion({
  question,
  selectedIndex,
  onSelect,
  disabled = false,
}: QuizQuestionProps) {
  const questionId = `quiz-question-${question.id || question.question.slice(0, 20)}`;

  return (
    <fieldset>
      <legend id={`${questionId}-label`} className="mb-6 text-headline-md text-primary">
        {question.question}
      </legend>
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const optionId = `${questionId}-opt-${index}`;
          return (
            <button
              key={optionId}
              id={optionId}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelect(index)}
              className={`flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left text-body-md transition-all ${
                isSelected
                  ? "border-primary bg-primary-fixed/20 text-on-primary-container"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-label-md font-bold ${
                  isSelected ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
                }`}
                aria-hidden="true"
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
