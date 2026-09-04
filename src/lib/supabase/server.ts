import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getMockSupabaseClient } from "./mockClient";
import { getSupabaseAnonKey, getSupabaseUrl, shouldUseMockClient } from "./env";

export async function createClient() {
  if (shouldUseMockClient()) {
    const cookieStore = await cookies();
    return getMockSupabaseClient(cookieStore);
  }

  // NOTE: intentionally no isSupabaseConfigured() throw here. During static
  // prerendering with placeholder credentials this function must still return a
  // client; callers handle query failures gracefully. Deploy-time enforcement
  // lives in scripts/check-production-env.mjs.

  const cookieStore = await cookies();
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called during static prerender / Server Component render where
          // cookies().set() throws. Expected — middleware refreshes sessions.
        }
      },
    },
  });
}
