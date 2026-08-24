"use client";

import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import type { Lesson } from "@/types/lesson";

export default function LessonNavigation({
  prevLesson,
  nextLesson,
}: {
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
}) {
  const t = useTranslations("learn");

  return (
    <>
      {prevLesson || nextLesson ? (
        <Reveal delay={0.16} className="mt-10 no-print">
          <nav className="grid grid-cols-2 gap-4" aria-label={t("lessonNavigation")}>
            {prevLesson ? (
              <Link
                href={`/learn/${prevLesson.id}`}
                className="surface-card flex flex-col gap-1 px-5 py-5 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span className="text-label-md text-on-surface-variant">{t("previousLesson")}</span>
                <span className="text-headline-sm text-primary">{prevLesson.title}</span>
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link
                href={`/learn/${nextLesson.id}`}
                className="surface-card flex flex-col items-end gap-1 px-5 py-5 text-right transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span className="text-label-md text-on-surface-variant">{t("nextLesson")}</span>
                <span className="text-headline-sm text-primary">{nextLesson.title}</span>
              </Link>
            ) : null}
          </nav>
        </Reveal>
      ) : null}
    </>
  );
}
