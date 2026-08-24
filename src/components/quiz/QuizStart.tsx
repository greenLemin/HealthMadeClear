"use client";

import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { useProgress } from "@/hooks/useProgress";
import type { Quiz } from "@/types/quiz";

type QuizStartProps = {
  quiz: Quiz;
  lessonId: string;
  lessonTitle: string;
  onStart: () => void;
};

export default function QuizStart({ quiz, lessonId, lessonTitle, onStart }: QuizStartProps) {
  const t = useTranslations("quiz");
  const { getQuizBestScore } = useProgress();
  const total = quiz.questions.length;
  const bestScore = getQuizBestScore(quiz.id);

  return (
    <div className="py-10 md:py-14">
      <div className="mx-auto max-w-2xl px-4 md:px-6">
        <Link
          href={`/learn/${lessonId}`}
          className="no-print mb-6 inline-flex items-center gap-2 text-label-md font-semibold text-primary"
        >
          <ArrowLeft size={18} />
          {t("backToLesson")}
        </Link>
        <div className="section-frame px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="chip">{total}</span>
            <span className="chip">{t("passRequirement", { score: quiz.passScore })}</span>
          </div>
          <h1 className="mt-4 font-display text-headline-lg text-primary">{quiz.title}</h1>
          <p className="mb-4 text-body-md text-on-surface-variant">
            {t("description", { count: total, title: lessonTitle })}
          </p>
          {bestScore !== null ? (
            <p className="mb-4 text-label-md font-semibold text-secondary">
              {t("bestScore", { score: bestScore })}
            </p>
          ) : null}
          <Button type="button" onClick={onStart}>
            {bestScore !== null ? t("retake") : t("startQuiz")}
          </Button>
        </div>
        <MedicalDisclaimer />
      </div>
    </div>
  );
}
