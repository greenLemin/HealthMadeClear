"use client";

import Link from "next/link";
import { ArrowRight, Clock, ListChecks } from "lucide-react";
import { getLessonsByPath, getPathProgress } from "@/lib/content";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { formatLevel, getMessages } from "@/lib/i18n";
import { getLearningPaths, getLessons } from "@/lib/localizedContent";

export default function LearningPathsPage() {
  const { completedLessons, locale, markPathStarted, startedPaths } = useAppState();
  const copy = getMessages(locale);
  const learningPaths = getLearningPaths(locale);
  const lessons = getLessons(locale);

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader
          badge={locale === "es" ? "Aprendizaje guiado" : "Guided learning"}
          title={locale === "es" ? "Rutas de aprendizaje" : "Learning Paths"}
          description={copy.learn.description}
        />

        <div className="space-y-8">
          {learningPaths.map((path) => {
            const pathLessons = getLessonsByPath(path.id, lessons, learningPaths);
            const progress = getPathProgress(path.id, completedLessons, lessons, learningPaths);
            const isStarted = startedPaths.includes(path.id) || progress.completedCount > 0;
            const nextLesson = pathLessons.find((lesson) => !completedLessons.includes(lesson.id)) ?? pathLessons[0];

            return (
              <section key={path.id} id={path.id} className="rounded-[28px] border border-outline-variant bg-surface p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
                    {isStarted ? copy.paths.resumeJourney : copy.paths.goodPlaceToStart}
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
                    <Clock size={16} />
                    {path.duration}
                  </div>
                  <div className="inline-flex rounded-full bg-surface-container px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                    {formatLevel(path.level, locale)}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                  <div>
                    <div className="mb-3 text-4xl">{path.icon}</div>
                    <h2 className="mb-3 text-headline-lg text-primary">{path.title}</h2>
                    <p className="mb-6 text-body-md text-on-surface-variant">{path.description}</p>
                    <div className="mb-3 flex items-center justify-between text-sm font-semibold text-on-surface-variant">
                      <span>
                        {copy.paths.lesson} {Math.min(progress.completedCount + 1, Math.max(progress.totalCount, 1))} {copy.common.of} {progress.totalCount}
                      </span>
                      <span>{progress.percentage}% {copy.paths.complete}</span>
                    </div>
                    <div className="progress-bar mb-6 h-3" role="progressbar" aria-valuenow={progress.percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${path.title} progress`}>
                      <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
                    </div>
                    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                      <div className="mb-1 text-sm font-semibold text-on-surface-variant">{copy.paths.upNext}</div>
                      <div className="text-label-lg text-primary">{nextLesson?.title}</div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-outline-variant bg-surface-container-low p-5">
                    <div className="mb-4 flex items-center gap-2 text-label-md text-primary">
                      <ListChecks size={18} />
                      {copy.paths.includedLessons}
                    </div>
                    <div className="space-y-3">
                      {pathLessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-start justify-between gap-4 rounded-lg bg-surface px-4 py-3">
                          <div>
                            <div className="text-label-md text-on-surface">{lesson.title}</div>
                            <div className="text-sm text-on-surface-variant">{lesson.duration}</div>
                          </div>
                          <div className="text-sm font-semibold text-primary">
                            {completedLessons.includes(lesson.id) ? copy.paths.done : copy.paths.ready}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      href={nextLesson ? `/learn/${nextLesson.id}` : "/learn"}
                      className="btn-primary mt-5 flex w-full items-center justify-center gap-2"
                      onClick={() => markPathStarted(path.id)}
                    >
                      {isStarted ? copy.paths.continue : copy.paths.startPath}
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
