"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Check, X, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppState } from "@/components/AppProviders";
import type { Quiz } from "@/types/quiz";

type QuizState = "start" | "active" | "completed";

type Props = {
  quiz: Quiz;
  lessonTitle: string;
  lessonId: string;
};

export default function QuizClient({ quiz, lessonTitle, lessonId }: Props) {
  const t = useTranslations("quiz");
  const { markLessonComplete, recordQuizScore } = useAppState();
  const [state, setState] = useState<QuizState>("start");
  const recordedRef = useRef(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const total = quiz.questions.length;
  const answered = useMemo(() => Object.keys(answers).length, [answers]);

  const correctCount = useMemo(
    () => quiz.questions.filter((q, i) => answers[i] === q.correctAnswer).length,
    [answers, quiz.questions]
  );
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = score >= quiz.passScore;
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;

  const handleAnswer = useCallback((questionIndex: number, letter: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: letter }));
  }, []);

  const handleNext = useCallback(() => {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setShowResult(false);
    } else {
      setState("completed");
    }
  }, [current, total]);

  const handleReset = useCallback(() => {
    setState("start");
    setCurrent(0);
    setAnswers({});
    setShowResult(false);
    recordedRef.current = false;
  }, []);

  useEffect(() => {
    if (state !== "completed" || recordedRef.current || total === 0) return;
    recordedRef.current = true;
    recordQuizScore(lessonId, score, passed);
    if (passed) markLessonComplete(lessonId);
  }, [state, score, passed, lessonId, total, recordQuizScore, markLessonComplete]);

  if (total === 0) {
    return (
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 md:px-6">
          <Link
            href={`/learn/${lessonId}`}
            className="no-print mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <ArrowLeft size={18} />
            {t("backToLesson")}
          </Link>
          <div className="card">
            <h1 className="mb-3 text-headline-lg text-primary">{quiz.title}</h1>
            <p className="mb-6 text-body-md text-on-surface-variant">{t("noQuestions")}</p>
            <Link href={`/learn/${lessonId}`} className="btn-primary inline-flex">
              {t("backToLesson")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state === "start") {
    return (
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 md:px-6">
          <Link
            href={`/learn/${lessonId}`}
            className="no-print mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <ArrowLeft size={18} />
            {t("backToLesson")}
          </Link>
          <div className="card">
            <h1 className="mb-3 text-headline-lg text-primary">{quiz.title}</h1>
            <p className="mb-4 text-body-md text-on-surface-variant">
              {t("description", { count: total, title: lessonTitle })}
            </p>
            <p className="mb-6 text-sm text-on-surface-variant">
              {t("passRequirement", { score: quiz.passScore })}
            </p>
            <button type="button" onClick={() => setState("active")} className="btn-primary">
              {t("startQuiz")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "completed") {
    return (
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 md:px-6">
          <div className="card text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
              {passed ? <Check size={40} className="text-primary" /> : <X size={40} className="text-error" />}
            </div>
            <h1 className="mb-2 text-headline-lg text-primary">{passed ? t("passed") : t("tryAgain")}</h1>
            <p className="mb-2 text-body-lg text-on-surface-variant">
              {t("scoreLabel", { score, correct: correctCount, total })}
            </p>
            {!passed && (
              <p className="mb-6 text-sm text-on-surface-variant">
                {t("passRequirement", { score: quiz.passScore })}
              </p>
            )}
            {passed ? (
              <Link href={`/learn/${lessonId}`} className="btn-primary">
                {t("backToLesson")}
              </Link>
            ) : (
              <button onClick={handleReset} className="btn-primary inline-flex items-center gap-2">
                <RefreshCw size={18} />
                {t("retake")}
              </button>
            )}
          </div>

          <div className="mt-8 space-y-6">
            {quiz.questions.map((q, i) => {
              const userAnswer = answers[i];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={i} className="card">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container text-sm font-bold text-on-surface">
                      {i + 1}
                    </span>
                    {userAnswer ? (
                      isCorrect ? (
                        <Check size={18} className="text-primary" />
                      ) : (
                        <X size={18} className="text-error" />
                      )
                    ) : null}
                  </div>
                  <p className="mb-3 font-semibold text-on-surface">{q.question}</p>
                  <div className="mb-3 space-y-2">
                    {q.options.map((opt, oi) => {
                      const letter = String.fromCharCode(65 + oi);
                      const isSelected = userAnswer === letter;
                      const isCorrectOption = letter === q.correctAnswer;
                      let className = "rounded border px-3 py-2 text-sm flex items-center gap-2 ";
                      if (isCorrectOption) {
                        className += "border-primary bg-primary-container text-on-primary-container";
                      } else if (isSelected && !isCorrectOption) {
                        className += "border-error bg-error-container text-on-error-container";
                      } else {
                        className += "border-outline-variant text-on-surface";
                      }
                      return (
                        <div key={oi} className={className}>
                          <span className="font-bold">{letter}.</span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="rounded bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant">
                      <span className="font-semibold text-primary">{t("explanation")}:</span> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[current];
  const selected = answers[current];

  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-2xl px-4 md:px-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-on-surface-variant">
            <span>{t("questionXofY", { current: current + 1, total })}</span>
            <span>{t("answered", { count: answered })}</span>
          </div>
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("questionXofY", { current: current + 1, total })}
          >
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="card mb-6">
          <fieldset>
            <legend className="mb-4 text-headline-md text-primary">{question.question}</legend>
            <div className="space-y-3" role="radiogroup" aria-label={question.question}>
              {question.options.map((opt, oi) => {
                const letter = String.fromCharCode(65 + oi);
                const isSelected = selected === letter;
                const optionId = `quiz-q${current}-opt-${letter}`;
                return (
                  <label
                    key={oi}
                    htmlFor={optionId}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded border px-4 py-3 text-left text-body-md transition-colors ${
                      isSelected
                        ? "border-primary bg-primary-container text-on-primary-container"
                        : "border-outline-variant text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    <input
                      id={optionId}
                      type="radio"
                      name={`quiz-question-${current}`}
                      value={letter}
                      checked={isSelected}
                      onChange={() => handleAnswer(current, letter)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isSelected
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                      aria-hidden
                    >
                      {letter}
                    </span>
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {selected && showResult && (
          <div
            className={`mb-6 rounded-lg border p-4 ${
              selected === question.correctAnswer
                ? "border-primary bg-primary-container text-on-primary-container"
                : "border-error bg-error-container text-on-error-container"
            }`}
          >
            <p className="mb-1 font-semibold">
              {selected === question.correctAnswer ? t("correct") : t("incorrect")}
            </p>
            {question.explanation && <p className="text-sm">{question.explanation}</p>}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (current > 0) {
                setCurrent((c) => c - 1);
                setShowResult(false);
              }
            }}
            disabled={current === 0}
            className="btn-secondary disabled:opacity-30"
          >
            {t("previous")}
          </button>

          {selected && !showResult && (
            <button onClick={() => setShowResult(true)} className="btn-primary">
              {t("checkAnswer")}
            </button>
          )}

          {selected && showResult && (
            <button onClick={handleNext} className="btn-primary">
              {current < total - 1 ? t("next") : t("seeResults")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
