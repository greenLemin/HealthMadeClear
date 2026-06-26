import type { SupabaseClient } from "@supabase/supabase-js";
import { logQueryError } from "./utils";

export async function updateDailyLog(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase.rpc("log_daily_activity", { user_id: userId });
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
