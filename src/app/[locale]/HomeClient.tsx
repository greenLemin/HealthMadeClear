"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen, Heart, Search, Shield, Wrench } from "lucide-react";
import Hero from "@/components/Hero";
import SectionNav from "@/components/SectionNav";
import Callout from "@/components/Callout";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
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
  const exploreLabel = locale === "es" ? "Explorar" : "Explore";

  const lastUncompletedRecentLessonId = useMemo(() => {
    return recentLessons.find((id) => !completedLessons.has(id));
  }, [recentLessons, completedLessons]);

  const lastRecentLesson = useMemo(() => {
    if (!lastUncompletedRecentLessonId) return null;
    return lessons.find((l) => l.id === lastUncompletedRecentLessonId);
  }, [lastUncompletedRecentLessonId, lessons]);

  return (
    <div className="pb-14">
      <Hero />
      <SectionNav />

      <section className="px-4 py-8 md:px-6 md:py-10" aria-labelledby="intro-heading">
        <div className="mx-auto max-w-container">
          <Reveal className="section-frame px-8 py-8 md:px-10 md:py-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="eyebrow mb-4">{t("introBadge")}</div>
                <h2 id="intro-heading" className="font-display text-headline-lg text-primary">
                  {t("introTitle")}
                </h2>
                <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">{t("introBody")}</p>
              </div>
              <Link href="/learning-paths" className="btn-primary shrink-0">
                {t("takeTour")}
                <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14" aria-labelledby="mission-heading">
        <div className="mx-auto max-w-container">
          <Reveal>
            <div className="eyebrow mb-4">{t("introBadge")}</div>
          </Reveal>
          <h2 id="mission-heading" className="font-display text-headline-lg text-primary">
            {t("whyMattersTitle")}
          </h2>
          <p className="mb-10 mt-3 max-w-readable text-body-lg text-on-surface-variant">
            {t("whyMattersBody")}
          </p>
          <div className="grid gap-6 md:grid-cols-6">
            <Reveal className="md:col-span-3">
              <div className="surface-card-strong h-full p-8">
                <Heart size={28} className="mb-4 text-primary" aria-hidden="true" />
                <h3 className="font-display text-headline-md text-primary">{t("valueKnowledgeTitle")}</h3>
                <p className="mt-3 text-body-md text-on-surface-variant">{t("valueKnowledgeBody")}</p>
              </div>
            </Reveal>

            <Reveal className="md:col-span-3" delay={0.05}>
              <div className="surface-card-muted h-full p-8">
                <Shield size={28} className="mb-4 text-secondary" aria-hidden="true" />
                <h3 className="font-display text-headline-md text-primary">{t("valueConfidenceTitle")}</h3>
                <p className="mt-3 text-body-md text-on-surface-variant">{t("valueConfidenceBody")}</p>
              </div>
            </Reveal>

            <Reveal className="md:col-span-6" delay={0.1}>
              <div className="surface-card flex flex-col gap-6 p-8 md:flex-row md:items-center">
                <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-fixed/80 text-primary shadow-elevation-1">
                  <BookOpen size={28} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-headline-md text-primary">{t("valueAccessTitle")}</h3>
                  <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">
                    {t("valueAccessBody")}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

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
            <Link href="/learning-paths" className="btn-secondary hidden sm:inline-flex">
              {t("viewAllPaths")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
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
                            {progress.completedCount} {tCommon("of")} {progress.totalCount}{" "}
                            {tCommon("modules")}
                          </span>
                          <span>{progress.percentage}%</span>
                        </div>
                        <div
                          className="progress-bar w-full"
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
            <Link href="/learning-paths" className="btn-secondary">
              {t("viewAllPaths")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14" aria-labelledby="tools-heading">
        <div className="mx-auto max-w-container">
          <div className="eyebrow mb-4">{t("toolsSectionTitle")}</div>
          <h2 id="tools-heading" className="font-display text-headline-lg text-primary">
            {t("toolsTitle")}
          </h2>
          <p className="mb-10 mt-3 max-w-readable text-body-lg text-on-surface-variant">{t("toolsBody")}</p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                href: "/learn",
                icon: <BookOpen size={24} className="text-primary" aria-hidden="true" />,
                title: tCommon("exploreLibrary"),
                body: t("learnPreviewBody"),
              },
              {
                href: "/glossary",
                icon: <Search size={24} className="text-secondary" aria-hidden="true" />,
                title: t("glossaryTitle"),
                body: t("glossaryPreviewBody"),
              },
              {
                href: "/tools",
                icon: <Wrench size={24} className="text-primary" aria-hidden="true" />,
                title: t("toolsSectionTitle"),
                body: t("toolsPreviewBody"),
              },
            ].map((item, index) => (
              <Reveal key={item.href} delay={index * 0.05}>
                <Link
                  href={item.href}
                  className="surface-card group block h-full px-6 py-6 transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <div className="inline-flex rounded-full bg-surface-container-low p-4 shadow-elevation-1">
                    {item.icon}
                  </div>
                  <h3 className="mt-5 font-display text-headline-md text-primary">{item.title}</h3>
                  <p className="mt-3 text-body-md text-on-surface-variant">{item.body}</p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-label-md font-semibold text-primary">
                    {exploreLabel}
                    <ArrowRight size={16} aria-hidden="true" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className="px-4 py-10 md:px-6 md:py-14"
        aria-labelledby={user ? "cta-heading-authenticated" : "cta-heading-unauthenticated"}
      >
        <div className="mx-auto max-w-container">
          <Reveal>
            {user ? (
              lastRecentLesson ? (
                <div className="surface-card-strong p-8 md:p-10">
                  <div className="eyebrow mb-4">{tCommon("continue")}</div>
                  <h2 id="cta-heading-authenticated" className="font-display text-headline-lg text-primary">
                    {tCommon("continue")}
                  </h2>
                  <div className="surface-card mt-6 p-5">
                    <div className="mb-2 text-label-md font-bold uppercase tracking-wider text-secondary">
                      {locale === "es" ? "En curso" : "In Progress"}
                    </div>
                    <h3 className="font-display text-headline-md text-primary">{lastRecentLesson.title}</h3>
                    <p className="mt-2 text-body-md text-on-surface-variant">
                      {lastRecentLesson.description}
                    </p>
                  </div>
                  <div className="mt-6">
                    <Link href={`/learn/${lastRecentLesson.id}`}>
                      <Button variant="primary" size="md">
                        {tDashboard("continueCta")}
                        <ArrowRight size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : completedLessons.size === 0 ? (
                <div className="surface-card-strong p-8 md:p-10">
                  <div className="eyebrow mb-4">{tDashboard("startFirstLessonCta")}</div>
                  <h2 id="cta-heading-authenticated" className="font-display text-headline-lg text-primary">
                    {tDashboard("startFirstLessonCta")}
                  </h2>
                  <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">
                    {tDashboard("startJourney")}
                  </p>
                  <div className="mt-6">
                    <Link href="/learn">
                      <Button variant="primary" size="md">
                        {tCommon("exploreLibrary")}
                        <ArrowRight size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="surface-card-strong p-8 md:p-10">
                  <div className="eyebrow mb-4">{tCommon("continue")}</div>
                  <h2 id="cta-heading-authenticated" className="font-display text-headline-lg text-primary">
                    {tCommon("continue")}
                  </h2>
                  <p className="mt-3 text-body-md text-on-surface-variant">
                    {tCommon("completed")}: {completedLessons.size} {tCommon("modules")}
                  </p>
                  <div className="mt-6">
                    <Link href="/dashboard">
                      <Button variant="primary" size="md">
                        {tCommon("exploreLibrary")}
                        <ArrowRight size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            ) : (
              <div className="surface-card-strong p-8 text-center md:p-10 md:text-left">
                <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
                  <div className="max-w-2xl">
                    <div className="eyebrow mb-4">{tAuth("signupButton")}</div>
                    <h2
                      id="cta-heading-unauthenticated"
                      className="font-display text-headline-lg text-primary"
                    >
                      {tAuth("signupTitle")}
                    </h2>
                    <p className="mt-3 text-body-md text-on-surface-variant">{tAuth("signupSubtitle")}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-center gap-4">
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
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-container px-4 md:px-6">
        <Callout type="info" title={tDisclaimer("educationalTitle")} className="mb-8">
          <p>{tDisclaimer("educationalLong")}</p>
        </Callout>
      </div>

      <div className="mx-auto max-w-container px-4 pb-16 md:px-6">
        <MedicalDisclaimer variant="emergency" />
      </div>
    </div>
  );
}
