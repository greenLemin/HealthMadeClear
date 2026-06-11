"use client";

import { Link } from "@/i18n/navigation";
import Hero from "@/components/Hero";
import SectionNav from "@/components/SectionNav";
import Callout from "@/components/Callout";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { useAppState } from "@/components/AppProviders";
import { formatLevel } from "@/lib/i18n";
import { getPathProgress } from "@/lib/content";
import type { LessonListItem } from "@/types/lesson";
import type { LearningPath } from "@/types/learningPath";
import { useTranslations } from "next-intl";

type HomeClientProps = {
  lessons: LessonListItem[];
  learningPaths: LearningPath[];
};

export default function HomeClient({ lessons, learningPaths }: HomeClientProps) {
  const { completedLessons, locale } = useAppState();
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tDisclaimer = useTranslations("disclaimer");

  return (
    <div>
      <Hero />
      <SectionNav />

      <section className="pb-12">
        <div className="max-w-container mx-auto px-4 md:px-6">
          <div className="mb-12 rounded-lg border border-outline-variant bg-surface p-6 shadow-elevation-2 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex rounded-full bg-secondary-container px-4 py-2 text-sm font-semibold text-primary">
                  {t("introBadge")}
                </div>
                <h2 className="mb-2 text-headline-md text-primary">{t("introTitle")}</h2>
                <p className="text-body-md text-on-surface-variant">{t("introBody")}</p>
              </div>
              <Link href="/learning-paths" className="btn-primary inline-flex items-center justify-center">
                {t("takeTour")}
              </Link>
            </div>
          </div>

          <section className="mb-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-headline-lg text-primary">{t("featuredPaths")}</h2>
                <p className="text-body-md text-on-surface-variant">{t("featuredPathsBody")}</p>
              </div>
              <Link href="/learning-paths" className="text-sm font-semibold text-primary">
                {t("viewAllPaths")}
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {learningPaths.slice(0, 2).map((path) => {
                const progress = getPathProgress(path.id, completedLessons, lessons, learningPaths);
                return (
                  <Link
                    key={path.id}
                    href={`/learning-paths#${path.id}`}
                    className="group hover-lift card-hover rounded-lg border border-outline-variant bg-surface p-6 shadow-elevation-1"
                  >
                    <div className="mb-3 inline-flex rounded-full bg-surface-container px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                      {formatLevel(path.level, locale)}
                    </div>
                    <div className="mb-3 text-4xl" aria-hidden="true">
                      {path.icon}
                    </div>
                    <h3 className="mb-3 text-headline-md text-primary">{path.title}</h3>
                    <p className="mb-4 text-body-md text-on-surface-variant">{path.description}</p>
                    {progress.totalCount > 0 ? (
                      <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between text-sm text-on-surface-variant">
                          <span>
                            {progress.completedCount} {tCommon("of")} {progress.totalCount}{" "}
                            {tCommon("modules")}
                          </span>
                          <span>{progress.percentage}%</span>
                        </div>
                        <div
                          className="progress-bar h-3"
                          role="progressbar"
                          aria-valuenow={progress.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${path.title} progress`}
                        >
                          <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
                        </div>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between text-sm text-on-surface-variant">
                      <span>
                        {path.lessons.length} {tCommon("modules")}
                      </span>
                      <span>{path.duration}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <Callout type="info" title={tDisclaimer("educationalTitle")} className="mb-8">
            <p>{tDisclaimer("educationalLong")}</p>
          </Callout>

          <MedicalDisclaimer variant="emergency" />
        </div>
      </section>
    </div>
  );
}
