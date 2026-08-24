"use client";

import { useMemo } from "react";
import Hero from "@/components/Hero";
import SectionNav from "@/components/SectionNav";
import Callout from "@/components/Callout";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import HomeIntro from "@/components/home/HomeIntro";
import HomeMission from "@/components/home/HomeMission";
import HomeFeaturedPaths from "@/components/home/HomeFeaturedPaths";
import HomeTools from "@/components/home/HomeTools";
import HomeCta from "@/components/home/HomeCta";
import { useAppState } from "@/components/AppProviders";
import { useAuth } from "@/hooks/useAuth";
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
  const tDisclaimer = useTranslations("disclaimer");

  const lastUncompletedRecentLessonId = useMemo(() => {
    return recentLessons.find((id) => !completedLessons.has(id));
  }, [recentLessons, completedLessons]);

  const lessonMap = useMemo(() => {
    const map = new Map<string, LessonListItem>();
    for (const lesson of lessons) {
      map.set(lesson.id, lesson);
    }
    return map;
  }, [lessons]);

  const lastRecentLesson = useMemo(() => {
    if (!lastUncompletedRecentLessonId) return null;
    return lessonMap.get(lastUncompletedRecentLessonId) || null;
  }, [lastUncompletedRecentLessonId, lessonMap]);

  return (
    <div className="pb-14">
      <div className="w-full overflow-hidden">
        <video
          src="/HMC_Video.mp4"
          poster="/hmc-video-poster.jpg"
          width={1280}
          height={720}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="block h-auto w-full"
        />
      </div>
      <Hero />
      <SectionNav />

      <HomeIntro />
      <HomeMission />
      <HomeFeaturedPaths
        learningPaths={learningPaths}
        lessons={lessons}
        completedLessons={completedLessons}
        locale={locale}
      />
      <HomeTools />
      <HomeCta user={user} lastRecentLesson={lastRecentLesson} completedLessonsSize={completedLessons.size} />

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
