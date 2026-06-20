"use client";

import { useMemo } from "react";
import { ArrowRight, CheckCircle2, Clock, ListChecks, BookOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/components/AppProviders";
import { useProgress } from "@/hooks/useProgress";
import Callout from "@/components/Callout";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
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
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <nav
          className="mb-6 flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-primary transition-colors">
            {tCommon("back")}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/learning-paths" className="hover:text-primary transition-colors">
            {t("pageTitle")}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface">{path.title}</span>
        </nav>

        <div className="mb-8">
          {path.icon ? (
            <span className="mb-3 block text-headline-2xl" aria-hidden="true">
              {path.icon}
            </span>
          ) : null}
          <h1 className="mb-3 text-headline-xl text-primary">{path.title}</h1>
          <p className="mb-6 max-w-3xl text-body-lg text-on-surface-variant">{path.description}</p>

          <div className="mb-6 flex flex-wrap items-center gap-4 text-label-md text-on-surface-variant">
            <span className="rounded-full bg-surface-container px-3 py-1">
              {path.lessons.length} {path.lessons.length === 1 ? "lesson" : "lessons"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} aria-hidden="true" />
              {path.duration}
            </span>
            <span className="rounded-full bg-surface-container px-3 py-1">
              {formatLevel(path.level, locale)}
            </span>
          </div>

          {/* Overall progress */}
          {pathLessons.length > 0 ? (
            <div className="mb-8 max-w-lg">
              <ProgressBar
                value={progress.percentage}
                label={`${progress.completed} of ${progress.total} complete`}
                showPercentage
                size="md"
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Main content */}
          <div>
            {path.content?.sections ? (
              <div className="mb-8 space-y-6">
                {path.content.sections.map((section, i) => (
                  <div key={i}>
                    {section.title ? (
                      <h2 className="mb-3 text-headline-lg text-primary">{section.title}</h2>
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
            ) : null}

            {/* Lesson list */}
            <h2 className="mb-4 text-headline-lg text-primary">Lessons in this path</h2>
            <div className="space-y-3">
              {pathLessons.map((lesson, index) => {
                const isCompleted = completedLessonIdsSet.has(lesson.id);
                const isNext = lesson.id === nextLesson?.id;
                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${lesson.id}`}
                    className={`flex items-center gap-4 rounded-xl border p-4 transition-shadow hover:shadow-card-hover ${
                      isCompleted
                        ? "border-secondary/30 bg-secondary-container/10"
                        : isNext && !allDone
                          ? "border-primary bg-primary-fixed/10"
                          : "border-outline-variant bg-surface-container-lowest"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-label-md font-bold ${
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
                      <span className="text-label-md text-on-surface-variant">{lesson.duration}</span>
                    </div>
                    {isNext && !allDone ? (
                      <span className="btn-primary shrink-0 px-4 py-2 text-label-md">{tCommon("start")}</span>
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

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
              <h3 className="mb-3 text-headline-md text-primary">Your progress</h3>
              <div className="mb-4 flex items-center gap-3 text-label-md text-on-surface-variant">
                <ListChecks size={18} aria-hidden="true" />
                <span>
                  {progress.completed} of {progress.total} lessons
                </span>
              </div>
              {!allDone ? (
                <div className="flex items-center justify-between rounded-xl bg-surface-container p-4">
                  <div>
                    <div className="text-label-md text-on-surface-variant">Next lesson</div>
                    <div className="text-label-lg font-semibold text-primary">{nextLesson?.title}</div>
                  </div>
                  <Link
                    href={nextLesson ? `/learn/${nextLesson.id}` : "/learning-paths"}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {progress.completed > 0 ? t("continue") : t("startPath")}
                    <ArrowRight size={18} />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-label-md font-semibold text-secondary">
                  <CheckCircle2 size={20} />
                  Path completed!
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
