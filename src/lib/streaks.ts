import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/notifications";

const STREAK_MILESTONES = [3, 7, 14, 21, 30];

export async function updateStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  currentStreak: number;
  longestStreak: number;
  isNewDay: boolean;
}> {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase.from("streaks").select("*").eq("user_id", userId).single();

  if (!existing) {
    const { data: inserted } = await supabase
      .from("streaks")
      .upsert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
      })
      .select()
      .single();

    return {
      currentStreak: 1,
      longestStreak: 1,
      isNewDay: true,
    };
  }

  const lastDate = existing.last_activity_date;
  let currentStreak = existing.current_streak;
  let longestStreak = existing.longest_streak;
  let isNewDay = false;

  if (lastDate === today) {
    isNewDay = false;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastDate === yesterdayStr) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    isNewDay = true;
  }

  await supabase.from("streaks").upsert({
    user_id: userId,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_activity_date: today,
  });

  if (isNewDay && STREAK_MILESTONES.includes(currentStreak)) {
    await createNotification(supabase, userId, {
      type: "streak",
      title: `${currentStreak}-Day Streak!`,
      body: `You're on a ${currentStreak}-day learning streak. Keep it up!`,
    });
  }

  return { currentStreak, longestStreak, isNewDay };
}
