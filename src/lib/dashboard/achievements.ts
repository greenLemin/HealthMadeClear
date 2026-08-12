import type { SupabaseClient } from "@supabase/supabase-js";
import { ACHIEVEMENTS, getLocalizedAchievement } from "@/lib/achievements";
import type { Locale } from "@/lib/i18n";
import type { AchievementItem } from "@/types/dashboard";
import { logQueryError } from "./utils";

export async function getUserAchievements(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = "en"
): Promise<AchievementItem[]> {
  const { data: earnedData, error: earnedError } = await supabase
    .from("achievements")
    .select("achievement_id, earned_at")
    .eq("user_id", userId);

  logQueryError("getUserAchievements", earnedError);

  const earnedMap = new Map((earnedData ?? []).map((a) => [a.achievement_id, a.earned_at]));

  return Object.values(ACHIEVEMENTS).map((achievement) => {
    const localized = getLocalizedAchievement(achievement.id, locale);
    return {
      id: achievement.id,
      title: localized.title,
      description: localized.description,
      icon: achievement.icon,
      earned: earnedMap.has(achievement.id),
      earnedAt: earnedMap.get(achievement.id) ?? null,
    };
  });
}
