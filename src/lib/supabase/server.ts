import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function createClient() {
  if (getSupabaseUrl() === "https://placeholder.supabase.co") {
    const cookieStore = await cookies();
    return getMockSupabaseClient(cookieStore);
  }
  const cookieStore = await cookies();
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}
