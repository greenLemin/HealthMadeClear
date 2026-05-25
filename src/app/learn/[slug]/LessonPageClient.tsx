"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LessonActionsClient from "@/components/lesson/LessonActionsClient";
import LessonRelatedClient from "@/components/lesson/LessonRelatedClient";
import Callout from "@/components/Callout";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { useAppState } from "@/components/AppProviders";
import { formatLevel, getCategoryLabel, getMessages } from "@/lib/i18n";
import { getLessonById } from "@/lib/localizedContent";
import type { LessonId } from "@/types/content";

export default function LessonPageClient({ slug }: { slug: string }) {
  const { locale } = useAppState();
  const copy = getMessages(locale);
  const lesson = getLessonById(slug, locale);

  if (!lesson) {
    return (
      <main className="py-16">
        <div className="max-w-container mx-auto px-4 md:px-6">
          <div className="card text-center">
            <h1 className="mb-3 text-headline-lg text-primary">{copy.learn.notFoundTitle}</h1>
            <p className="mb-6 text-body-md text-on-surface-variant">{copy.learn.notFoundBody}</p>
            <Link href="/learn" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft size={18} />
              {copy.learn.backToLibrary}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const lessonId = lesson.id as LessonId;
  const heroImage =
    lessonId === "understanding-prescription-labels"
      ? "/stitch/lesson_understanding_prescription_labels.png"
      : null;

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
          <span className="rounded-full bg-surface-container px-3 py-1">{lesson.duration}</span>
          <span className="rounded-full bg-surface-container px-3 py-1">{formatLevel(lesson.level, locale)}</span>
          <span className="rounded-full bg-surface-container px-3 py-1">
            {getCategoryLabel(lesson.categoryId, locale)}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.55fr]">
          <article>
            <Link href="/learn" className="no-print mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <ArrowLeft size={18} />
              {copy.learn.backToLessons}
            </Link>
            <h1 className="mb-4 text-headline-xl text-primary">{lesson.title}</h1>
            <p className="mb-8 max-w-3xl text-body-lg text-on-surface-variant">{lesson.description}</p>
            <LessonActionsClient lessonId={lessonId} />

            {heroImage ? (
              <div className="mb-8 overflow-hidden rounded-lg border border-outline-variant">
                <Image src={heroImage} alt="" width={800} height={450} className="h-auto w-full object-cover" priority />
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
                  <div className="whitespace-pre-line text-body-md text-on-surface-variant">{section.content}</div>
                  {section.callouts?.map((callout, calloutIndex) => (
                    <Callout key={`${section.title}-${calloutIndex}`} type={callout.type} className="mt-4">
                      {callout.content}
                    </Callout>
                  ))}
                </section>
              ))}
            </div>

            <div className="mt-10">
              <MedicalDisclaimer locale={locale} />
            </div>
          </article>

          <aside className="space-y-6">
            <div className="card sticky top-24">
              <h3 className="mb-3 text-headline-md text-primary">{copy.learn.stillConfused}</h3>
              <p className="mb-4 text-body-md text-on-surface-variant">{copy.learn.sidebarBody}</p>
              <ul className="space-y-3 text-body-md text-on-surface-variant">
                <li>{copy.learn.tipCheckName}</li>
                <li>{copy.learn.tipReadDose}</li>
                <li>{copy.learn.tipWarnings}</li>
                <li>{copy.learn.tipMissedDose}</li>
              </ul>
              <p className="mt-4 text-sm font-semibold text-primary">{copy.learn.pharmacistTip}</p>
            </div>
          </aside>
        </div>

        <LessonRelatedClient lessonId={lessonId} categoryId={lesson.categoryId} />
      </div>
    </main>
  );
}
