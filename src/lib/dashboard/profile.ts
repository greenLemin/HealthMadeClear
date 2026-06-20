import type { SupabaseClient } from "@supabase/supabase-js";
import { logQueryError } from "./utils";

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  displayName: string;
  email: string;
  createdAt: string;
} | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", userId)
    .single();

  logQueryError("getUserProfile", profileError);

  if (!profile) return null;

  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError) console.error("[dashboard:getUserProfile:auth]", authError.message);
  const email = userData?.user?.email ?? "";

  return {
    displayName: profile.display_name ?? "User",
    email,
    createdAt: profile.created_at,
  };
}
