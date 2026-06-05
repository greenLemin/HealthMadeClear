"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import LessonActionsClient from "@/components/lesson/LessonActionsClient";
import LessonRelatedClient from "@/components/lesson/LessonRelatedClient";
import Callout from "@/components/Callout";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { useAppState } from "@/components/AppProviders";
import { useTranslations } from "next-intl";
import { formatLevel, getCategoryLabel } from "@/lib/i18n";
import type { Lesson } from "@/types/lesson";
import type { LessonId } from "@/types/content";

import GlossaryHighlighter from "@/components/mdx/GlossaryHighlighter";

type SidebarContent = {
  body: string;
  tips: string[];
  footer: string;
};

/** Derives category-specific sidebar copy from i18n translations. */
function useSidebarContent(lesson: Lesson, t: ReturnType<typeof useTranslations<"learn">>): SidebarContent {
  if (lesson.sidebarTips) {
    return { body: t("sidebarBody"), tips: lesson.sidebarTips, footer: t("pharmacistTip") };
  }
  if (lesson.categoryId === "doctor-visits") {
    return {
      body: t("sidebarBodyDoctor"),
      tips: [
        t("tipDoctorAppointmentTime"),
        t("tipDoctorInsurance"),
        t("tipDoctorQuestions"),
        t("tipDoctorMeds"),
      ],
      footer: t("doctorTip"),
    };
  }
  if (lesson.categoryId === "lab-results") {
    return {
      body: t("sidebarBodyLabs"),
      tips: [t("tipLabsFasting"), t("tipLabsHydration"), t("tipLabsComfort"), t("tipLabsResults")],
      footer: t("labsTip"),
    };
  }
  return {
    body: t("sidebarBody"),
    tips: [t("tipCheckName"), t("tipReadDose"), t("tipWarnings"), t("tipMissedDose")],
    footer: t("pharmacistTip"),
  };
}

export default function LessonPageClient({ lesson }: { lesson: Lesson }) {
  const { locale } = useAppState();
  const t = useTranslations("learn");
  const lessonId = lesson.id as LessonId;
  const heroImage = lesson.image ?? null;
  const sidebar = useSidebarContent(lesson, t);

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
          <span className="rounded-full bg-surface-container px-3 py-1">{lesson.duration}</span>
          <span className="rounded-full bg-surface-container px-3 py-1">
            {formatLevel(lesson.level, locale)}
          </span>
          <span className="rounded-full bg-surface-container px-3 py-1">
            {getCategoryLabel(lesson.categoryId, locale)}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.55fr]">
          <article>
            <Link
              href="/learn"
              className="no-print mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              <ArrowLeft size={18} />
              {t("backToLessons")}
            </Link>
            <h1 className="mb-4 text-headline-xl text-primary">{lesson.title}</h1>
            <p className="mb-8 max-w-3xl text-body-lg text-on-surface-variant">{lesson.description}</p>
            <LessonActionsClient lessonId={lessonId} />

            {heroImage ? (
              <div className="mb-8 overflow-hidden rounded-lg border border-outline-variant">
                <Image
                  src={heroImage}
                  alt={lesson.title}
                  width={800}
                  height={450}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="mb-8 rounded-lg border border-outline-variant bg-surface-container-low p-6">
                <div className="min-h-48 rounded-lg bg-gradient-to-br from-primary-container to-primary-fixed" />
              </div>
            )}

            <div className="space-y-8">
              {lesson.content.sections.map((section, index) => (
                <section key={section.title}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <h2 className="text-headline-md text-primary">{section.title}</h2>
                  </div>
                  <div className="whitespace-pre-line text-body-md text-on-surface-variant">
                    <GlossaryHighlighter text={section.content} />
                  </div>
                  {section.callouts?.map((callout, calloutIndex) => (
                    <Callout key={`${section.title}-${calloutIndex}`} type={callout.type} className="mt-4">
                      {callout.content}
                    </Callout>
                  ))}
                </section>
              ))}
            </div>

            {lesson.lastReviewed ? (
              <p className="mt-8 text-sm text-on-surface-variant">
                {t("lastReviewed")}: {lesson.lastReviewed}
              </p>
            ) : null}
            {lesson.sources?.length ? (
              <div className="mt-4 text-sm text-on-surface-variant">
                <div className="font-semibold text-primary">{t("sources")}</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {lesson.sources.map((source) => (
                    <li key={source}>{source}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-10">
              <MedicalDisclaimer />
            </div>
          </article>

          <aside className="space-y-6">
            <div className="card sticky top-24">
              <h3 className="mb-3 text-headline-md text-primary">
                {lesson.sidebarTitle || t("stillConfused")}
              </h3>
              <p className="mb-4 text-body-md text-on-surface-variant">{sidebar.body}</p>
              <ul className="space-y-3 text-body-md text-on-surface-variant">
                {sidebar.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-semibold text-primary">{sidebar.footer}</p>
            </div>
          </aside>
        </div>

        <LessonRelatedClient lessonId={lessonId} categoryId={lesson.categoryId} />
      </div>
    </main>
  );
}
