import { getTranslations, setRequestLocale } from "next-intl/server";
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
import ProgressClient from "./ProgressClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "progress" });
  return { title: t("title"), robots: { index: false } };
}

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function ProgressPage({ params, searchParams }: Props) {
  const { locale: localeStr } = await params;
  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);
  const locale = requireLocale(localeStr);
  setRequestLocale(locale);
  const user = await requireAuth(locale, "/dashboard/progress");
  const supabase = await createClient();

  const [summary, quizPerformance, completedPage1, activeDays, profile, allLessons] = await Promise.all([
    getUserProgressSummary(supabase, user.id, locale),
    getQuizPerformanceByCategory(supabase, user.id, locale),
    getCompletedLessonsPaginated(supabase, user.id, locale, page, 10),
    getDailyLogForRange(supabase, user.id, 30),
    getUserProfile(supabase, user.id),
    Promise.resolve(getAllLessons(locale)),
  ]);

  const totalBeginnerLessons = allLessons.filter((l) => l.level === "beginner").length;

  const { data: lessonProgressData } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("completed", true);

  // Deduplicate progress entries exactly as originally done
  const completedSet = new Set((lessonProgressData ?? []).map((p: { lesson_id: string }) => p.lesson_id));

  const categoryProgress: Record<
    string,
    {
      categoryId: string;
      label: string;
      total: number;
      completed: number;
      quizStats: { attempts: number; passed: number };
    }
  > = {};

  const lessonCategoryMap = new Map<string, string>();

  // Build the base structure and lookup map once (O(N) total lessons)
  for (const lesson of allLessons) {
    const catId = lesson.categoryId;
    lessonCategoryMap.set(lesson.id, catId);
    let catProg = categoryProgress[catId];
    if (!catProg) {
      catProg = categoryProgress[catId] = {
        categoryId: catId,
        label: lesson.category,
        total: 0,
        completed: 0,
        quizStats: { attempts: 0, passed: 0 },
      };
    }
    catProg.total += 1;
  }

  // Iterate the deduplicated set of completed lessons (O(M) completed lessons)
  for (const lessonId of completedSet) {
    const catId = lessonCategoryMap.get(lessonId);
    if (catId && categoryProgress[catId]) {
      categoryProgress[catId].completed += 1;
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
