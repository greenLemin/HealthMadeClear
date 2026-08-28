"use client";

import { useTranslations } from "next-intl";
import ClinicalCitationBlock from "@/components/content/ClinicalCitationBlock";
import Reveal from "@/components/ui/Reveal";
import KeyTakeaway from "@/components/ui/KeyTakeaway";
import type { Lesson } from "@/types/lesson";

export default function LessonNotes({
  lesson,
  reviewedDate,
}: {
  lesson: Lesson;
  reviewedDate: string | null;
}) {
  const t = useTranslations("learn");

  return (
    <>
      {lesson.sidebarTips && lesson.sidebarTips.length > 0 ? (
        <Reveal delay={0.08} className="mt-8">
          <div className="surface-card-muted px-6 py-6 md:px-8">
            <KeyTakeaway title={t("keyTakeaways")}>
              <ul className="list-disc space-y-2 pl-5">
                {lesson.sidebarTips.map((tip, i) => (
                  <li key={`${tip.slice(0, 20)}-${i}`}>{tip}</li>
                ))}
              </ul>
            </KeyTakeaway>
          </div>
        </Reveal>
      ) : null}

      {lesson.lastReviewed || lesson.reviewedBy || lesson.sources?.length ? (
        <Reveal delay={0.1} className="mt-8">
          <div className="surface-card-muted px-6 py-6 md:px-8">
            <ClinicalCitationBlock
              sources={lesson.sources}
              reviewedBy={lesson.reviewedBy}
              lastReviewed={reviewedDate}
            />
          </div>
        </Reveal>
      ) : null}
    </>
  );
}
