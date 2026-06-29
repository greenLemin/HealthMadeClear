"use client";

import { useMemo } from "react";
import { ArrowRight, CheckCircle2, Clock, ListChecks, BookOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/components/AppProviders";
import { useProgress } from "@/hooks/useProgress";
import Callout from "@/components/Callout";
import PageHeader from "@/components/PageHeader";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
import Reveal from "@/components/ui/Reveal";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatLevel, getCategoryLabel } from "@/lib/i18n";
import type { Lesson } from "@/types/lesson";
import type { GlossaryTerm } from "@/types/glossary";
import type { LearningPath } from "@/types/learningPath";
import { useTranslations } from "next-intl";

type Props = {
  path: LearningPath;
  lessons: Lesson[];
  glossaryTerms: GlossaryTerm[];
};

export default function LearningPathDetailClient({ path, lessons, glossaryTerms }: Props) {
  const { locale } = useAppState();
  const { completedLessonIds, getLearningPathProgress } = useProgress();
  const t = useTranslations("paths");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  const pathLessons = useMemo(
    () => path.lessons.map((id) => lessons.find((l) => l.id === id)).filter(Boolean) as Lesson[],
    [path.lessons, lessons]
  );

  const progress = getLearningPathProgress(path.lessons);
  const completedLessonIdsSet = new Set(completedLessonIds);
  const firstUncompleted = pathLessons.find((l) => !completedLessonIdsSet.has(l.id));
  const nextLesson = firstUncompleted ?? pathLessons[0];
  const allDone = progress.percentage === 100 && pathLessons.length > 0;

  return (
    <div className="py-10 md:py-14">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader
          breadcrumb={[
            { label: tNav("home"), href: "/" },
            { label: t("pageTitle"), href: "/learning-paths" },
            { label: path.title },
          ]}
          badge={path.icon ? `${path.icon} ${t("pageBadge")}` : t("pageBadge")}
          title={path.title}
          description={path.description}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="chip inline-flex items-center gap-2">
              <Clock size={14} aria-hidden="true" />
              {path.duration}
            </span>
            <span className="chip">{formatLevel(path.level, locale)}</span>
            <span className="chip">{path.lessons.length}</span>
          </div>
          {pathLessons.length > 0 ? (
            <div className="mt-5 max-w-xl">
              <ProgressBar
                value={progress.percentage}
                label={`${progress.completed} ${tCommon("of")} ${progress.total} ${t("complete")}`}
                showPercentage
                size="md"
              />
            </div>
          ) : null}
        </PageHeader>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            {path.content?.sections ? (
              <Reveal>
                <div className="surface-card px-6 py-6 md:px-8 md:py-8">
                  <div className="space-y-6">
                    {path.content.sections.map((section, i) => (
                      <div key={i} className={i > 0 ? "border-t border-outline-variant pt-6" : undefined}>
                        {section.title ? (
                          <h2 className="mb-3 font-display text-headline-md text-primary">{section.title}</h2>
                        ) : null}
                        {section.content ? (
                          <div className="text-body-md text-on-surface-variant">
                            <MarkdownRenderer text={section.content} glossaryTerms={glossaryTerms} />
                          </div>
                        ) : null}
                        {section.callouts?.map((callout, ci) => (
                          <Callout key={ci} type={callout.type} className="mt-4">
                            {callout.content}
                          </Callout>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ) : null}

            <Reveal delay={0.06}>
              <div className="surface-card px-6 py-6 md:px-8 md:py-8">
                <div className="mb-5 flex items-center gap-2 text-label-md text-primary">
                  <ListChecks size={18} aria-hidden="true" />
                  {t("includedLessons")}
                </div>
                <div className="space-y-3">
                  {pathLessons.map((lesson, index) => {
                    const isCompleted = completedLessonIdsSet.has(lesson.id);
                    const isNext = lesson.id === nextLesson?.id;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${lesson.id}`}
                        className={`flex items-center gap-4 rounded-[1.35rem] border px-4 py-4 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-elevation-2 ${
                          isCompleted
                            ? "border-secondary/30 bg-secondary-container/15"
                            : isNext && !allDone
                              ? "border-primary/40 bg-primary-fixed/20"
                              : "border-outline-variant bg-surface"
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-label-md font-bold ${
                            isCompleted
                              ? "bg-secondary text-on-secondary"
                              : isNext && !allDone
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 size={20} /> : index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-label-md text-on-surface">{lesson.title}</span>
                          <span className="mt-1 block text-label-md text-on-surface-variant">
                            {lesson.duration}
                          </span>
                        </div>
                        {isNext && !allDone ? (
                          <span className="btn-primary shrink-0 px-4 py-2 text-label-md">
                            {tCommon("start")}
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-label-md font-semibold text-secondary">
                            {tCommon("completed")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-label-md text-primary">
                            <BookOpen size={16} />
                            {tCommon("read")}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <aside className="space-y-6">
              <div className="surface-card-glass sticky top-24 px-5 py-5 md:px-6">
                <h3 className="font-display text-headline-md text-primary">{t("progressLabel")}</h3>
                <div className="mt-4 flex items-center gap-3 text-label-md text-on-surface-variant">
                  <ListChecks size={18} aria-hidden="true" />
                  <span>
                    {progress.completed} {tCommon("of")} {progress.total}
                  </span>
                </div>
                {!allDone ? (
                  <div className="mt-5 rounded-[1.2rem] border border-outline-variant bg-surface px-4 py-4">
                    <div className="text-label-md text-on-surface-variant">{t("upNext")}</div>
                    <div className="mt-2 text-label-lg font-semibold text-primary">{nextLesson?.title}</div>
                    <Link
                      href={nextLesson ? `/learn/${nextLesson.id}` : "/learning-paths"}
                      className="btn-primary mt-4 inline-flex items-center gap-2"
                    >
                      {progress.completed > 0 ? t("continue") : t("startPath")}
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 flex items-center gap-2 rounded-[1.2rem] bg-secondary-container/30 px-4 py-4 text-label-md font-semibold text-secondary">
                    <CheckCircle2 size={20} />
                    {tCommon("completed")}
                  </div>
                )}
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
