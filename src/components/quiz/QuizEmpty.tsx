"use client";

import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import ButtonLink from "@/components/ui/ButtonLink";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import type { Quiz } from "@/types/quiz";

type QuizEmptyProps = {
  quiz: Quiz;
  lessonId: string;
};

export default function QuizEmpty({ quiz, lessonId }: QuizEmptyProps) {
  const t = useTranslations("quiz");

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
        <div className="surface-card-glass px-6 py-6 md:px-8 md:py-8">
          <div className="eyebrow mb-3">{t("backToLesson")}</div>
          <h1 className="font-display text-headline-lg text-primary">{quiz.title}</h1>
          <p className="mb-6 text-body-md text-on-surface-variant">{t("noQuestions")}</p>
          <ButtonLink href={`/learn/${lessonId}`}>{t("backToLesson")}</ButtonLink>
        </div>
        <MedicalDisclaimer />
      </div>
    </div>
  );
}
