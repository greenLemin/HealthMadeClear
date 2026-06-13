import { getTranslations } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { requireAuth } from "@/lib/auth/requireAuth";
import { createClient } from "@/lib/supabase/server";
import {
  getUserProgressSummary,
  getQuizPerformanceByCategory,
  getCompletedLessonsPaginated,
  getDailyLogForRange,
  getUserProfile,
} from "@/lib/dashboard";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import ProgressClient from "./progress-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: "My Progress | Dashboard", robots: { index: false } };
}

type Props = { params: Promise<{ locale: string }> };

export default async function ProgressPage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  const user = await requireAuth(locale, "/dashboard/progress");
  const supabase = await createClient();

  const [summary, quizPerformance, completedPage1, activeDays, profile, allLessons] = await Promise.all([
    getUserProgressSummary(supabase, user.id, locale),
    getQuizPerformanceByCategory(supabase, user.id, locale),
    getCompletedLessonsPaginated(supabase, user.id, locale, 1, 10),
    getDailyLogForRange(supabase, user.id, 30),
    getUserProfile(supabase, user.id),
    Promise.resolve(getAllLessons(locale)),
  ]);

  const totalBeginnerLessons = allLessons.filter((l) => l.level === "beginner").length;

  const categoryProgress = allLessons.reduce(
    (acc, lesson) => {
      const catId = lesson.categoryId;
      if (!acc[catId]) {
        acc[catId] = {
          categoryId: catId,
          label: lesson.category,
          total: 0,
          completed: 0,
          quizStats: { attempts: 0, passed: 0 },
        };
      }
      acc[catId].total += 1;
      return acc;
    },
    {} as Record<
      string,
      {
        categoryId: string;
        label: string;
        total: number;
        completed: number;
        quizStats: { attempts: number; passed: number };
      }
    >
  );

  const { data: lessonProgressData } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("completed", true);

  const completedSet = new Set((lessonProgressData ?? []).map((p: any) => p.lesson_id));
  for (const lesson of allLessons) {
    if (completedSet.has(lesson.id) && categoryProgress[lesson.categoryId]) {
      categoryProgress[lesson.categoryId].completed += 1;
    }
  }

  for (const perf of quizPerformance) {
    if (categoryProgress[perf.categoryId]) {
      categoryProgress[perf.categoryId].quizStats.attempts = perf.attemptsCount;
      categoryProgress[perf.categoryId].quizStats.passed = Math.round(
        (perf.passRate / 100) * perf.attemptsCount
      );
    }
  }

  return (
    <ProgressClient
      summary={summary}
      quizPerformance={quizPerformance}
      completedLessons={completedPage1}
      activeDays={activeDays}
      categoryProgress={Object.values(categoryProgress)}
      memberSince={profile?.createdAt ?? ""}
      locale={locale}
    />
  );
}
