import { createBrowserClient } from "@supabase/ssr";

function getSupabaseUrl(): string {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  } catch {
    return "https://placeholder.supabase.co";
  }
}

function getSupabaseAnonKey(): string {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_anon_key";
  } catch {
    return "placeholder_anon_key";
  }
}

import { getMockSupabaseClient } from "./mockClient";

export function createClient() {
  if (getSupabaseUrl() === "https://placeholder.supabase.co") {
    return getMockSupabaseClient();
  }
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
