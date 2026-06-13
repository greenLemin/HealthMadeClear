import { getTranslations } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { requireAuth } from "@/lib/auth/requireAuth";
import { createClient } from "@/lib/supabase/server";
import {
  getUserProgressSummary,
  getUserLearningPaths,
  getRecentActivity,
  getUserAchievements,
  getRecommendedNextLesson,
} from "@/lib/dashboard";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false },
  };
}

type Props = { params: Promise<{ locale: string }> };

export default async function Dashboard({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  const user = await requireAuth(locale, "/dashboard");
  const supabase = await createClient();

  const [summary, learningPaths, recentActivity, achievements, recommendedNext] = await Promise.all([
    getUserProgressSummary(supabase, user.id, locale),
    getUserLearningPaths(supabase, user.id, locale),
    getRecentActivity(supabase, user.id, locale),
    getUserAchievements(supabase, user.id),
    getRecommendedNextLesson(supabase, user.id, locale),
  ]);

  const displayName = user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "User";

  return (
    <DashboardClient
      summary={summary}
      learningPaths={learningPaths}
      recentActivity={recentActivity}
      achievements={achievements}
      recommendedNext={recommendedNext}
      displayName={displayName}
      locale={locale}
    />
  );
}
