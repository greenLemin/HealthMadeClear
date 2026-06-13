import { getTranslations } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { requireAuth } from "@/lib/auth/requireAuth";
import { createClient } from "@/lib/supabase/server";
import { getUserAchievements } from "@/lib/dashboard";
import AchievementsClient from "./achievements-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "achievements" });
  return { title: t("title"), robots: { index: false } };
}

type Props = { params: Promise<{ locale: string }> };

export default async function AchievementsPage({ params }: Props) {
  const { locale } = await params;
  const user = await requireAuth(locale, "/dashboard/achievements");
  const supabase = await createClient();

  const achievements = await getUserAchievements(supabase, user.id, locale as "en" | "es");
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <AchievementsClient
      achievements={achievements}
      earnedCount={earnedCount}
      totalCount={achievements.length}
    />
  );
}
