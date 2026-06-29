"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, Clock, ListChecks } from "lucide-react";
import Callout from "@/components/Callout";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
import { getLessonsByPath, getPathProgress } from "@/lib/content";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { formatLevel } from "@/lib/i18n";
import type { GlossaryTerm } from "@/types/glossary";
import type { LessonListItem } from "@/types/lesson";
import type { LearningPath } from "@/types/learningPath";
import { useTranslations } from "next-intl";

type LearningPathsClientProps = {
  lessons: LessonListItem[];
  learningPaths: LearningPath[];
  glossaryTerms: GlossaryTerm[];
};

export default function LearningPathsClient({
  lessons,
  learningPaths,
  glossaryTerms,
}: LearningPathsClientProps) {
  const { completedLessons, locale, markPathStarted, startedPaths } = useAppState();
  const t = useTranslations("paths");
  const tLearn = useTranslations("learn");
  const tCommon = useTranslations("common");

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader badge={t("pageBadge")} title={t("pageTitle")} description={tLearn("description")} />

        <div className="space-y-8">
          {learningPaths.map((path) => {
            const pathLessons = getLessonsByPath(path.id, lessons, learningPaths);
            const progress = getPathProgress(path.id, Array.from(completedLessons), lessons, learningPaths);
            const isStarted = startedPaths.includes(path.id) || progress.completedCount > 0;
            const nextLesson =
              pathLessons.find((lesson) => !completedLessons.has(lesson.id)) ?? pathLessons[0];

            return (
              <section
                key={path.id}
                id={path.id}
                className="scroll-mt-24 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-elevation-2 md:p-8 animate-fade-in-up hover:border-primary/20 transition-all duration-300"
              >
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="inline-flex rounded-full bg-primary px-4 py-1.5 text-label-md font-semibold text-on-primary shadow-sm">
                    {isStarted ? t("resumeJourney") : t("goodPlaceToStart")}
                  </div>
                  <div className="inline-flex items-center gap-2 text-label-md text-on-surface-variant">
                    <Clock size={16} />
                    {path.duration}
                  </div>
                  <div className="inline-flex rounded-full bg-surface-container px-3 py-1 text-label-md font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                    {formatLevel(path.level, locale)}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                  <div>
                    <div
                      className="mb-3 text-headline-xl transition-transform duration-300 hover:scale-110 origin-left"
                      aria-hidden="true"
                    >
                      {path.icon}
                    </div>
                    <h2 className="mb-3 text-headline-lg text-primary">{path.title}</h2>
                    <p className="mb-6 text-body-md text-on-surface-variant">{path.description}</p>
                    {path.content?.sections.map((section) => (
                      <div key={section.title} className="mb-6">
                        <h3 className="mb-2 text-headline-md text-primary">{section.title}</h3>
                        <MarkdownRenderer text={section.content} glossaryTerms={glossaryTerms} />
                        {section.callouts?.map((callout, index) => (
                          <Callout key={`${section.title}-${index}`} type={callout.type} className="mt-4">
                            <MarkdownRenderer text={callout.content} glossaryTerms={glossaryTerms} />
                          </Callout>
                        ))}
                      </div>
                    ))}
                    <div className="mb-3 flex items-center justify-between text-label-md font-semibold text-on-surface-variant">
                      <span>
                        {t("lesson")}{" "}
                        {Math.min(progress.completedCount + 1, Math.max(progress.totalCount, 1))}{" "}
                        {tCommon("of")} {progress.totalCount}
                      </span>
                      <span>
                        {progress.percentage}% {t("complete")}
                      </span>
                    </div>
                    <div
                      className="progress-bar mb-6 h-2.5"
                      role="progressbar"
                      aria-valuenow={progress.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${path.title} ${t("progressLabel")}`}
                    >
                      <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
                    </div>
                    <div className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-4 shadow-sm">
                      <div className="mb-1 text-label-md font-semibold text-on-surface-variant">
                        {t("upNext")}
                      </div>
                      <div className="text-label-lg font-bold text-primary">{nextLesson?.title}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-5 md:p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-label-md font-bold text-primary">
                      <ListChecks size={18} />
                      {t("includedLessons")}
                    </div>
                    <div className="space-y-3">
                      {pathLessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/learn/${lesson.id}`}
                          className="flex items-start justify-between gap-4 rounded-xl bg-surface-container-lowest border border-transparent px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-primary/10 hover:bg-surface"
                          onClick={() => markPathStarted(path.id)}
                        >
                          <div>
                            <div className="text-label-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                              {lesson.title}
                            </div>
                            <div className="text-label-md text-on-surface-variant">{lesson.duration}</div>
                          </div>
                          <div className="text-label-md font-semibold text-primary">
                            {completedLessons.has(lesson.id) ? t("done") : t("ready")}
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={nextLesson ? `/learn/${nextLesson.id}` : "/learn"}
                      className="btn-primary mt-5 flex w-full items-center justify-center gap-2"
                      onClick={() => markPathStarted(path.id)}
                    >
                      {isStarted ? t("continue") : t("startPath")}
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
