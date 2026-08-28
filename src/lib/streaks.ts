import type { SupabaseClient } from "@supabase/supabase-js";

const STREAK_MILESTONES = [3, 7, 14, 21, 30];

/** Returns the current UTC date as YYYY-MM-DD. */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns the previous UTC date as YYYY-MM-DD. */
function yesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function updateStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  currentStreak: number;
  longestStreak: number;
  isNewDay: boolean;
  milestoneReached: number | null;
}> {
  const today = todayUTC();
  const yesterday = yesterdayUTC();

  const { data: existing, error: selectError } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  // PGRST116 = no rows found, which is expected for first-time users
  if (selectError && selectError.code !== "PGRST116") {
    throw selectError;
  }

  if (!existing) {
    const { data: inserted, error: upsertError } = await supabase
      .from("streaks")
      .upsert(
        {
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (upsertError) throw upsertError;

    return {
      currentStreak: inserted?.current_streak ?? 1,
      longestStreak: inserted?.longest_streak ?? 1,
      isNewDay: true,
      milestoneReached: null,
    };
  }

  const lastDate = existing.last_activity_date;
  let currentStreak = existing.current_streak;
  let longestStreak = existing.longest_streak;
  let isNewDay = false;

  if (lastDate === today) {
    isNewDay = false;
  } else {
    if (lastDate === yesterday) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    isNewDay = true;
  }

  const { error: updateError } = await supabase.from("streaks").upsert(
    {
      user_id: userId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
    },
    { onConflict: "user_id" }
  );

  if (updateError) throw updateError;

  const milestoneReached = isNewDay && STREAK_MILESTONES.includes(currentStreak) ? currentStreak : null;

  return { currentStreak, longestStreak, isNewDay, milestoneReached };
}
