"use client";

import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import ButtonLink from "@/components/ui/ButtonLink";
import Reveal from "@/components/ui/Reveal";
import { formatLevel } from "@/lib/i18n";
import { getPathProgress } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { LessonListItem } from "@/types/lesson";
import type { LearningPath } from "@/types/learningPath";
import { useTranslations } from "next-intl";

type HomeFeaturedPathsProps = {
  learningPaths: LearningPath[];
  lessons: LessonListItem[];
  completedLessons: Set<string>;
  locale: Locale;
};

export default function HomeFeaturedPaths({
  learningPaths,
  lessons,
  completedLessons,
  locale,
}: HomeFeaturedPathsProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tPaths = useTranslations("paths");

  return (
    <section className="px-4 py-10 md:px-6 md:py-14" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="eyebrow mb-4">{t("featuredPaths")}</div>
            <h2 id="featured-heading" className="font-display text-headline-lg text-primary">
              {t("featuredPaths")}
            </h2>
            <p className="mt-2 max-w-readable text-body-md text-on-surface-variant">
              {t("featuredPathsBody")}
            </p>
          </div>
          <ButtonLink href="/learning-paths" variant="secondary" className="hidden sm:inline-flex">
            {t("viewAllPaths")}
            <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {learningPaths.slice(0, 2).map((path, index) => {
            const progress = getPathProgress(path.id, Array.from(completedLessons), lessons, learningPaths);
            return (
              <Reveal key={path.id} delay={index * 0.06}>
                <Link
                  href={`/learning-paths#${path.id}`}
                  className="surface-card group block px-6 py-6 transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="chip min-h-9 px-3 py-1 text-label-sm">
                      {formatLevel(path.level, locale)}
                    </span>
                    <span className="metric-pill">
                      {path.lessons.length} {tCommon("modules")}
                    </span>
                  </div>
                  <div className="mb-3 text-headline-xl" aria-hidden="true">
                    {path.icon}
                  </div>
                  <h3 className="font-display text-headline-md text-primary">{path.title}</h3>
                  <p className="mt-3 text-body-md text-on-surface-variant">{path.description}</p>
                  {progress.totalCount > 0 ? (
                    <div className="mb-5 mt-5">
                      <div className="mb-2 flex items-center justify-between text-label-md text-on-surface-variant">
                        <span>
                          {progress.completedCount} {tCommon("of")} {progress.totalCount} {tCommon("modules")}
                        </span>
                        <span>{progress.percentage}%</span>
                      </div>
                      <div
                        className="progress-bar w-full"
                        role="progressbar"
                        aria-valuenow={progress.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={tPaths("progressForPath", { title: path.title })}
                      >
                        <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between text-label-md text-on-surface-variant">
                    <span>{path.duration}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      {t("viewAllPaths")}
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <ButtonLink href="/learning-paths" variant="secondary">
            {t("viewAllPaths")}
            <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
