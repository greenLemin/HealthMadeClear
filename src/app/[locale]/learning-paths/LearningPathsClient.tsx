"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, Clock, ListChecks } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Callout from "@/components/Callout";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
import { getLessonsByPath, getPathProgress } from "@/lib/content";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import Reveal from "@/components/ui/Reveal";
import ProgressBar from "@/components/ui/ProgressBar";
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

type PathItemProps = {
  path: LearningPath;
  index: number;
  lessons: LessonListItem[];
  learningPaths: LearningPath[];
  glossaryTerms: GlossaryTerm[];
};

function PathItem({ path, index, lessons, learningPaths, glossaryTerms }: PathItemProps) {
  const { completedLessons, locale, markPathStarted, startedPaths } = useAppState();
  const t = useTranslations("paths");
  const tCommon = useTranslations("common");

  const pathLessons = getLessonsByPath(path.id, lessons, learningPaths);
  const progress = getPathProgress(path.id, Array.from(completedLessons), lessons, learningPaths);
  const isStarted = startedPaths.includes(path.id) || progress.completedCount > 0;
  const nextLesson = pathLessons.find((lesson) => !completedLessons.has(lesson.id)) ?? pathLessons[0];

  return (
    <Reveal delay={Math.min(index * 0.05, 0.2)}>
      <section id={path.id} className="surface-card-strong scroll-mt-24 px-6 py-6 md:px-8 md:py-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-primary-fixed text-2xl shadow-elevation-1"
                aria-hidden="true"
              >
                {path.icon}
              </div>
              <span className="chip-active">{isStarted ? t("resumeJourney") : t("goodPlaceToStart")}</span>
              <span className="chip inline-flex items-center gap-2">
                <Clock size={14} aria-hidden="true" />
                {path.duration}
              </span>
              <span className="chip">{formatLevel(path.level, locale)}</span>
            </div>
            <h2 className="font-display text-headline-lg text-primary">{path.title}</h2>
            <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">{path.description}</p>
          </div>

          <ButtonLink
            href={nextLesson ? `/learn/${nextLesson.id}` : "/learn"}
            icon={<ArrowRight size={18} />}
            onClick={() => markPathStarted(path.id)}
          >
            {isStarted ? t("continue") : t("startPath")}
          </ButtonLink>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-5">
            {path.content?.sections.map((section) => (
              <div key={section.title} className="surface-card-muted px-5 py-5 md:px-6">
                <h3 className="mb-3 font-display text-headline-md text-primary">{section.title}</h3>
                <MarkdownRenderer text={section.content} glossaryTerms={glossaryTerms} />
                {section.callouts?.map((callout, calloutIndex) => (
                  <Callout key={`${section.title}-${calloutIndex}`} type={callout.type} className="mt-4">
                    <MarkdownRenderer text={callout.content} glossaryTerms={glossaryTerms} />
                  </Callout>
                ))}
              </div>
            ))}

            <div className="surface-card-muted px-5 py-5 md:px-6">
              <ProgressBar
                value={progress.percentage}
                label={`${t("lesson")} ${Math.min(progress.completedCount + 1, Math.max(progress.totalCount, 1))} ${tCommon("of")} ${progress.totalCount}`}
                showPercentage
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-outline-variant bg-surface px-4 py-4">
                  <div className="text-label-md text-on-surface-variant">{t("upNext")}</div>
                  <div className="mt-2 text-label-lg font-semibold text-primary">{nextLesson?.title}</div>
                </div>
                <div className="rounded-[1.2rem] border border-outline-variant bg-surface px-4 py-4">
                  <div className="text-label-md text-on-surface-variant">{t("progressLabel")}</div>
                  <div className="mt-2 text-label-lg font-semibold text-primary">
                    {progress.completedCount}/{progress.totalCount} {t("complete")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card-glass px-5 py-5 md:px-6">
            <div className="mb-4 flex items-center gap-2 text-label-md text-primary">
              <ListChecks size={18} />
              {t("includedLessons")}
            </div>
            <div className="space-y-3">
              {pathLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/learn/${lesson.id}`}
                  className="flex items-start justify-between gap-4 rounded-[1.2rem] border border-outline-variant bg-surface px-4 py-3 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-surface-container hover:shadow-elevation-2"
                  onClick={() => markPathStarted(path.id)}
                >
                  <div>
                    <div className="text-label-md text-on-surface">{lesson.title}</div>
                    <div className="mt-1 text-label-md text-on-surface-variant">{lesson.duration}</div>
                  </div>
                  <div className="text-label-md font-semibold text-primary">
                    {completedLessons.has(lesson.id) ? t("done") : t("ready")}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

export default function LearningPathsClient({
  lessons,
  learningPaths,
  glossaryTerms,
}: LearningPathsClientProps) {
  const t = useTranslations("paths");
  const tLearn = useTranslations("learn");

  return (
    <div className="py-10 md:py-14">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader
          badge={t("pageBadge")}
          title={t("pageTitle")}
          description={tLearn("description")}
          className="mb-8"
        />

        <div className="space-y-8">
          {learningPaths.map((path, index) => (
            <PathItem
              key={path.id}
              path={path}
              index={index}
              lessons={lessons}
              learningPaths={learningPaths}
              glossaryTerms={glossaryTerms}
            />
          ))}
        </div>

        <MedicalDisclaimer />
      </div>
    </div>
  );
}
