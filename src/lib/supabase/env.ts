const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder_anon_key";

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return url !== PLACEHOLDER_URL && key !== PLACEHOLDER_KEY && url.length > 0 && key.length > 0;
}

/** Mock client only in local development without Supabase credentials. */
export function shouldUseMockClient(): boolean {
  return process.env.NODE_ENV === "development" && !isSupabaseConfigured();
}
