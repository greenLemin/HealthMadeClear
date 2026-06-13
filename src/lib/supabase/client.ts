import { createBrowserClient } from "@supabase/ssr";
import { getMockSupabaseClient } from "./mockClient";
import { getSupabaseAnonKey, getSupabaseUrl, shouldUseMockClient } from "./env";

export function createClient() {
  if (shouldUseMockClient()) {
    return getMockSupabaseClient();
  }
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}