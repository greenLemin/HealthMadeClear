import type { SupabaseClient } from "@supabase/supabase-js";
import { logQueryError } from "./utils";

export async function updateDailyLog(supabase: SupabaseClient, userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  const { error } = await supabase
    .from("daily_log")
    .upsert({ user_id: userId, activity_date: today }, { onConflict: "user_id,activity_date" });
  logQueryError("updateDailyLog", error);
}

export async function getDailyLogForRange(
  supabase: SupabaseClient,
  userId: string,
  daysBack: number
): Promise<string[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startStr = startDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_log")
    .select("activity_date")
    .eq("user_id", userId)
    .gte("activity_date", startStr)
    .order("activity_date", { ascending: false });

  logQueryError("getDailyLogForRange", error);

  return (data ?? []).map((d) => d.activity_date);
}
