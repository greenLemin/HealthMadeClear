"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppState } from "@/components/AppProviders";
import { useProgress } from "@/hooks/useProgress";
import QuizQuestionComponent from "@/components/quiz/QuizQuestion";
import QuizResults from "@/components/quiz/QuizResults";
import type { Quiz } from "@/types/quiz";
import { useRouter } from "@/i18n/navigation";
import { useFocusTrap } from "@/hooks/useFocusTrap";

type QuizState = "start" | "active" | "completed";

type Props = {
  quiz: Quiz;
  lessonTitle: string;
  lessonId: string;
};

function Confetti() {
  const particleCount = 30;
  const [particles] = useState(() =>
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${0.5 + Math.random() * 1}s`,
      color: ["#14b8a6", "#0d9488", "#0f766e", "#115e59", "#134e4a"][Math.floor(Math.random() * 5)],
      size: 4 + Math.random() * 8,
    }))
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-fall rounded-full"
          style={{
            left: p.left,
            top: "-10px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            animationName: "confetti-fall",
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall {
          animation: confetti-fall 1s ease-out forwards;
        }
        @media (prefers-reduced-motion) {
          .animate-fall { animation: none !important; display: none; }
        }
      `}</style>
    </div>
  );
}

const LETTER_TO_IDX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
const IDX_TO_LETTER = ["A", "B", "C", "D"];

export default function QuizClient({ quiz, lessonTitle, lessonId }: Props) {
  const t = useTranslations("quiz");
  const { locale } = useAppState();
  const router = useRouter();
  const { saveQuizAttempt, getQuizBestScore, isLessonComplete } = useProgress();
  const [state, setState] = useState<QuizState>("start");
  const recordedRef = useRef(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  const exitWarningRef = useRef<HTMLDivElement>(null);
  useFocusTrap(exitWarningRef, showExitWarning);

  // Close exit warning on Escape key
  useEffect(() => {
    if (!showExitWarning) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowExitWarning(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showExitWarning]);

  const total = quiz.questions.length;
  const answered = useMemo(() => Object.keys(answers).length, [answers]);

  const correctCount = useMemo(
    () =>
      quiz.questions.filter((q, i) => {
        const selectedLetter = answers[i];
        if (selectedLetter === undefined) return false;
        const correctIdx = q.correctAnswer ? LETTER_TO_IDX[q.correctAnswer] : (q.correctIndex ?? -1);
        return selectedLetter === correctIdx;
      }).length,
    [answers, quiz.questions]
  );

  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = score >= quiz.passScore;
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;

  const handleAnswer = useCallback((questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
    setShowResult(false);
  }, []);

  const handleCheckAnswer = useCallback(() => {
    setShowResult(true);
  }, []);

  const handleNext = useCallback(() => {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setShowResult(false);
    } else {
      setState("completed");
      if (passed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
  }, [current, total, passed]);

  const handlePrevious = useCallback(() => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setShowResult(false);
    }
  }, [current]);

  const handleReset = useCallback(() => {
    setState("start");
    setCurrent(0);
    setAnswers({});
    setShowResult(false);
    setShowConfetti(false);
    recordedRef.current = false;
  }, []);

  const handleContinue = useCallback(() => {
    router.push(`/learn/${lessonId}`);
  }, [router, lessonId]);

  // Navigation away warning
  useEffect(() => {
    if (state !== "active") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state]);

  // Save quiz attempt on completion
  useEffect(() => {
    if (state !== "completed" || recordedRef.current || total === 0) return;
    recordedRef.current = true;
    const answerArray = quiz.questions.map((_, i) => answers[i] ?? -1);
    saveQuizAttempt(quiz.id, lessonId, score, total, answerArray);
  }, [state, score, total, lessonId, quiz.id, quiz.questions, answers, saveQuizAttempt]);

  if (total === 0) {
    return (
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 md:px-6">
          <Link
            href={`/learn/${lessonId}`}
            className="no-print mb-6 inline-flex items-center gap-2 text-label-md font-semibold text-primary"
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
    const bestScore = getQuizBestScore(quiz.id);
    return (
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 md:px-6">
          <Link
            href={`/learn/${lessonId}`}
            className="no-print mb-6 inline-flex items-center gap-2 text-label-md font-semibold text-primary"
          >
            <ArrowLeft size={18} />
            {t("backToLesson")}
          </Link>
          <div className="card">
            <h1 className="mb-3 text-headline-lg text-primary">{quiz.title}</h1>
            <p className="mb-4 text-body-md text-on-surface-variant">
              {t("description", { count: total, title: lessonTitle })}
            </p>
            <p className="mb-6 text-label-md text-on-surface-variant">
              {t("passRequirement", { score: quiz.passScore })}
            </p>
            {bestScore !== null ? (
              <p className="mb-4 text-label-md font-semibold text-secondary">
                {t("bestScore", { score: bestScore })}
              </p>
            ) : null}
            <button type="button" onClick={() => setState("active")} className="btn-primary">
              {bestScore !== null ? t("retake") : t("startQuiz")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "completed") {
    return (
      <>
        {showConfetti && <Confetti />}
        <div className="py-12 md:py-16">
          <div className="mx-auto max-w-2xl px-4 md:px-6">
            <QuizResults
              quiz={quiz}
              answers={quiz.questions.map((_, i) => answers[i] ?? -1)}
              score={score}
              passed={passed}
              onRetake={handleReset}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </>
    );
  }

  const question = quiz.questions[current];
  const selectedIdx = answers[current] ?? -1;
  const selectedLetter = selectedIdx >= 0 ? IDX_TO_LETTER[selectedIdx] : undefined;
  const isCorrect = selectedLetter !== undefined ? selectedLetter === question.correctAnswer : null;

  return (
    <>
      {/* Exit warning dialog */}
      {showExitWarning ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            ref={exitWarningRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-warning-title"
            className="max-w-sm rounded-2xl bg-surface p-6 shadow-elevation-3"
          >
            <h2 id="exit-warning-title" className="mb-3 text-headline-md text-primary">
              {t("leaveQuiz")}
            </h2>
            <p className="mb-6 text-body-md text-on-surface-variant">{t("progressWillBeLost")}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowExitWarning(false)}
                className="btn-secondary flex-1"
              >
                {t("stay")}
              </button>
              <Link href={`/learn/${lessonId}`} className="btn-primary flex-1 text-center">
                {t("leave")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 md:px-6">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-label-md text-on-surface-variant">
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
            <QuizQuestionComponent
              question={question}
              selectedIndex={selectedIdx >= 0 ? selectedIdx : null}
              onSelect={(idx) => handleAnswer(current, idx)}
            />
          </div>

          {/* Per-question feedback */}
          {selectedIdx >= 0 && showResult && isCorrect !== null ? (
            <div
              role="alert"
              className={`mb-6 rounded-lg border p-4 ${
                isCorrect
                  ? "border-secondary bg-secondary-container/30 text-on-secondary-container"
                  : "border-tertiary bg-tertiary-container/20 text-tertiary"
              }`}
            >
              <p className="mb-1 font-semibold">{isCorrect ? t("correct") : t("incorrect")}</p>
              {question.explanation && <p className="text-label-md">{question.explanation}</p>}
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={current === 0}
              className="btn-secondary disabled:opacity-30"
            >
              {t("previous")}
            </button>

            <div className="flex gap-3">
              {selectedIdx >= 0 && !showResult ? (
                <button type="button" onClick={handleCheckAnswer} className="btn-primary">
                  {t("checkAnswer")}
                </button>
              ) : null}

              {selectedIdx >= 0 && showResult ? (
                <button type="button" onClick={handleNext} className="btn-primary">
                  {current < total - 1 ? t("next") : t("seeResults")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
