import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getMockSupabaseClient } from "./mockClient";
import { getSupabaseAnonKey, getSupabaseUrl, shouldUseMockClient } from "./env";

export async function createClient() {
  if (shouldUseMockClient()) {
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
