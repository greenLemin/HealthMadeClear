"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen, Heart, Search, Shield, Wrench } from "lucide-react";
import Hero from "@/components/Hero";
import SectionNav from "@/components/SectionNav";
import Callout from "@/components/Callout";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import Button from "@/components/ui/Button";
import { useAppState } from "@/components/AppProviders";
import { useAuth } from "@/hooks/useAuth";
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
  const { completedLessons, recentLessons, locale } = useAppState();
  const { user } = useAuth();
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tDisclaimer = useTranslations("disclaimer");
  const tAuth = useTranslations("auth");
  const tDashboard = useTranslations("dashboard");

  const lastUncompletedRecentLessonId = useMemo(() => {
    return recentLessons.find((id) => !completedLessons.has(id));
  }, [recentLessons, completedLessons]);

  const lastRecentLesson = useMemo(() => {
    if (!lastUncompletedRecentLessonId) return null;
    return lessons.find((l) => l.id === lastUncompletedRecentLessonId);
  }, [lastUncompletedRecentLessonId, lessons]);

  return (
    <div>
      <Hero />
      <SectionNav />

      {/* Intro / CTA section */}
      <section className="py-16 md:py-20 bg-surface-container-low" aria-labelledby="intro-heading">
        <div className="max-w-container mx-auto px-4 md:px-16">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 md:p-10 shadow-card">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex rounded-full bg-secondary-container px-4 py-2 text-label-md font-semibold text-primary">
                  {t("introBadge")}
                </div>
                <h2 id="intro-heading" className="mb-3 text-headline-md text-primary">
                  {t("introTitle")}
                </h2>
                <p className="text-body-md text-on-surface-variant">{t("introBody")}</p>
              </div>
              <Link
                href="/learning-paths"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-label-lg font-semibold text-on-primary hover:bg-primary-container transition-colors shrink-0"
              >
                {t("takeTour")}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why health literacy matters — asymmetric layout */}
      <section className="py-16 md:py-20" aria-labelledby="mission-heading">
        <div className="max-w-container mx-auto px-4 md:px-16">
          <h2 id="mission-heading" className="mb-4 text-headline-lg text-primary">
            {t("whyMattersTitle")}
          </h2>
          <p className="mb-10 max-w-3xl text-body-lg text-on-surface-variant">{t("whyMattersBody")}</p>
          <div className="grid gap-6 md:grid-cols-6">
            {/* Knowledge — spans 3 cols, teal background highlight */}
            <div className="md:col-span-3 rounded-2xl border border-outline-variant bg-primary-container/10 p-8">
              <Heart size={28} className="text-primary mb-4" aria-hidden="true" />
              <h3 className="mb-3 text-headline-md text-primary">{t("valueKnowledgeTitle")}</h3>
              <p className="text-body-md text-on-surface-variant">{t("valueKnowledgeBody")}</p>
            </div>

            {/* Confidence — spans 3 cols, subtle surface tint */}
            <div className="md:col-span-3 rounded-2xl border border-outline-variant bg-surface-container-low p-8">
              <Shield size={28} className="text-secondary mb-4" aria-hidden="true" />
              <h3 className="mb-3 text-headline-md text-primary">{t("valueConfidenceTitle")}</h3>
              <p className="text-body-md text-on-surface-variant">{t("valueConfidenceBody")}</p>
            </div>

            {/* Access — full width, simple treatment */}
            <div className="md:col-span-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-card">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <BookOpen size={28} className="text-primary mb-4 shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="mb-2 text-headline-md text-primary">{t("valueAccessTitle")}</h3>
                  <p className="text-body-md text-on-surface-variant">{t("valueAccessBody")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured paths */}
      <section className="py-16 md:py-20 bg-surface-container-low" aria-labelledby="featured-heading">
        <div className="max-w-container mx-auto px-4 md:px-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 id="featured-heading" className="text-headline-lg text-primary">
                {t("featuredPaths")}
              </h2>
              <p className="text-body-md text-on-surface-variant">{t("featuredPathsBody")}</p>
            </div>
            <Link
              href="/learning-paths"
              className="hidden shrink-0 items-center gap-1 text-label-md font-semibold text-primary underline underline-offset-2 sm:flex"
            >
              {t("viewAllPaths")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {learningPaths.slice(0, 2).map((path) => {
              const progress = getPathProgress(path.id, Array.from(completedLessons), lessons, learningPaths);
              return (
                <Link
                  key={path.id}
                  href={`/learning-paths#${path.id}`}
                  className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <div className="mb-3 inline-flex rounded-full bg-surface-container px-3 py-1 text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                    {formatLevel(path.level, locale)}
                  </div>
                  <div className="mb-3 text-headline-xl" aria-hidden="true">
                    {path.icon}
                  </div>
                  <h3 className="mb-3 text-headline-md text-primary">{path.title}</h3>
                  <p className="mb-4 text-body-md text-on-surface-variant">{path.description}</p>
                  {progress.totalCount > 0 ? (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between text-label-md text-on-surface-variant">
                        <span>
                          {progress.completedCount} {tCommon("of")} {progress.totalCount} {tCommon("modules")}
                        </span>
                        <span>{progress.percentage}%</span>
                      </div>
                      <div
                        className="h-3 w-full overflow-hidden rounded-full bg-surface-container"
                        role="progressbar"
                        aria-valuenow={progress.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${path.title} progress`}
                      >
                        <div
                          className="h-full rounded-full bg-secondary-container transition-all duration-500"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between text-label-md text-on-surface-variant">
                    <span>
                      {path.lessons.length} {tCommon("modules")}
                    </span>
                    <span>{path.duration}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/learning-paths"
              className="inline-flex items-center gap-1 text-label-md font-semibold text-primary underline underline-offset-2"
            >
              {t("viewAllPaths")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature preview: learn + glossary + tools */}
      <section className="py-16 md:py-20" aria-labelledby="tools-heading">
        <div className="max-w-container mx-auto px-4 md:px-16">
          <h2 id="tools-heading" className="mb-4 text-headline-lg text-primary">
            {t("toolsTitle")}
          </h2>
          <p className="mb-10 max-w-3xl text-body-lg text-on-surface-variant">{t("toolsBody")}</p>
          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/learn"
              className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <BookOpen size={24} className="text-primary mb-4" aria-hidden="true" />
              <h3 className="mb-2 text-label-lg text-primary">{tCommon("exploreLibrary")}</h3>
              <p className="text-body-md text-on-surface-variant">{t("learnPreviewBody")}</p>
            </Link>
            <Link
              href="/glossary"
              className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <Search size={24} className="text-secondary mb-4" aria-hidden="true" />
              <h3 className="mb-2 text-label-lg text-primary">{t("glossaryTitle")}</h3>
              <p className="text-body-md text-on-surface-variant">{t("glossaryPreviewBody")}</p>
            </Link>
            <Link
              href="/tools"
              className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <Wrench size={24} className="text-primary mb-4" aria-hidden="true" />
              <h3 className="mb-2 text-label-lg text-primary">{t("toolsSectionTitle")}</h3>
              <p className="text-body-md text-on-surface-variant">{t("toolsPreviewBody")}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA — auth-aware */}
      <section
        className="py-16 md:py-20 bg-surface-container-low"
        aria-labelledby={user ? "cta-heading-authenticated" : "cta-heading-unauthenticated"}
      >
        <div className="max-w-container mx-auto px-4 md:px-16">
          {user ? (
            lastRecentLesson ? (
              // Resume lesson state
              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 md:p-10 shadow-card">
                <h2 id="cta-heading-authenticated" className="mb-4 text-headline-md text-primary font-bold">
                  {tCommon("continue")}
                </h2>
                <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-low p-5">
                  <div className="mb-2 text-label-md font-bold uppercase tracking-wider text-secondary">
                    {locale === "es" ? "En curso" : "In Progress"}
                  </div>
                  <h3 className="mb-2 text-headline-md font-semibold text-primary">
                    {lastRecentLesson.title}
                  </h3>
                  <p className="text-body-md text-on-surface-variant">{lastRecentLesson.description}</p>
                </div>
                <Link href={`/learn/${lastRecentLesson.id}`}>
                  <Button variant="primary" size="md">
                    {tDashboard("continueCta")}
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            ) : completedLessons.size === 0 ? (
              // Brand new user empty state
              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 md:p-10 shadow-card">
                <h2 id="cta-heading-authenticated" className="mb-2 text-headline-md text-primary font-bold">
                  {tDashboard("startFirstLessonCta")}
                </h2>
                <p className="mb-6 text-body-md text-on-surface-variant">{tDashboard("startJourney")}</p>
                <Link href="/learn">
                  <Button variant="primary" size="md">
                    {tCommon("exploreLibrary")}
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            ) : (
              // Completed all started lessons state
              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 md:p-10 shadow-card">
                <h2 id="cta-heading-authenticated" className="mb-4 text-headline-md text-primary font-bold">
                  {tCommon("continue")}
                </h2>
                <p className="mb-6 text-body-md text-on-surface-variant">
                  {tCommon("completed")}: {completedLessons.size} {tCommon("modules")}
                </p>
                <Link href="/dashboard">
                  <Button variant="primary" size="md">
                    {tCommon("exploreLibrary")}
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-outline-variant bg-primary-container/10 p-8 md:p-10 text-center md:text-left">
              <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
                <div className="max-w-2xl">
                  <h2 id="cta-heading-unauthenticated" className="mb-3 text-headline-md text-primary">
                    {tAuth("signupTitle")}
                  </h2>
                  <p className="text-body-md text-on-surface-variant">{tAuth("signupSubtitle")}</p>
                </div>
                <div className="flex shrink-0 gap-4">
                  <Link href="/auth/login">
                    <Button variant="secondary" size="md">
                      {tAuth("loginButton")}
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button variant="primary" size="md">
                      {tAuth("signupButton")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Callout
        type="info"
        title={tDisclaimer("educationalTitle")}
        className="max-w-container mx-auto mb-8 px-4 md:px-16"
      >
        <p>{tDisclaimer("educationalLong")}</p>
      </Callout>

      <div className="max-w-container mx-auto px-4 pb-16 md:px-16">
        <MedicalDisclaimer variant="emergency" />
      </div>
    </div>
  );
}
