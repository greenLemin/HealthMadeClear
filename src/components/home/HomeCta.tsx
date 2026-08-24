"use client";

import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Reveal from "@/components/ui/Reveal";
import type { LessonListItem } from "@/types/lesson";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";

type HomeCtaProps = {
  user: User | null;
  lastRecentLesson: LessonListItem | null;
  completedLessonsSize: number;
};

export default function HomeCta({ user, lastRecentLesson, completedLessonsSize }: HomeCtaProps) {
  const tCommon = useTranslations("common");
  const tDashboard = useTranslations("dashboard");
  const tAuth = useTranslations("auth");

  return (
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
                    {tDashboard("inProgress")}
                  </div>
                  <h3 className="font-display text-headline-md text-primary">{lastRecentLesson.title}</h3>
                  <p className="mt-2 text-body-md text-on-surface-variant">{lastRecentLesson.description}</p>
                </div>
                <div className="mt-6">
                  <ButtonLink href={`/learn/${lastRecentLesson.id}`} variant="primary" size="md">
                    {tDashboard("continueCta")}
                    <ArrowRight size={18} />
                  </ButtonLink>
                </div>
              </div>
            ) : completedLessonsSize === 0 ? (
              <div className="surface-card-strong p-8 md:p-10">
                <div className="eyebrow mb-4">{tDashboard("startFirstLessonCta")}</div>
                <h2 id="cta-heading-authenticated" className="font-display text-headline-lg text-primary">
                  {tDashboard("startFirstLessonCta")}
                </h2>
                <p className="mt-3 max-w-readable text-body-md text-on-surface-variant">
                  {tDashboard("startJourney")}
                </p>
                <div className="mt-6">
                  <ButtonLink href="/learn" variant="primary" size="md">
                    {tCommon("exploreLibrary")}
                    <ArrowRight size={18} />
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <div className="surface-card-strong p-8 md:p-10">
                <div className="eyebrow mb-4">{tCommon("continue")}</div>
                <h2 id="cta-heading-authenticated" className="font-display text-headline-lg text-primary">
                  {tCommon("continue")}
                </h2>
                <p className="mt-3 text-body-md text-on-surface-variant">
                  {tCommon("completed")}: {completedLessonsSize} {tCommon("modules")}
                </p>
                <div className="mt-6">
                  <ButtonLink href="/dashboard" variant="primary" size="md">
                    {tCommon("exploreLibrary")}
                    <ArrowRight size={18} />
                  </ButtonLink>
                </div>
              </div>
            )
          ) : (
            <div className="surface-card-strong p-8 text-center md:p-10 md:text-left">
              <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
                <div className="max-w-2xl">
                  <div className="eyebrow mb-4">{tAuth("signupButton")}</div>
                  <h2 id="cta-heading-unauthenticated" className="font-display text-headline-lg text-primary">
                    {tAuth("signupTitle")}
                  </h2>
                  <p className="mt-3 text-body-md text-on-surface-variant">{tAuth("signupSubtitle")}</p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-center gap-4">
                  <ButtonLink href="/auth/login" variant="secondary" size="md">
                    {tAuth("loginButton")}
                  </ButtonLink>
                  <ButtonLink href="/auth/signup" variant="primary" size="md">
                    {tAuth("signupButton")}
                  </ButtonLink>
                </div>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
