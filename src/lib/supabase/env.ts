const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder_anon_key";
const CI_PLACEHOLDER_URL = "https://ci-build.supabase.co";

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

/** CI build uses placeholder credentials — not a real Supabase project. */
export function isCiPlaceholderSupabase(): boolean {
  return process.env.CI === "true" && getSupabaseUrl() === CI_PLACEHOLDER_URL;
}

/** Mock client in local dev without real Supabase, or with CI placeholder credentials. */
export function shouldUseMockClient(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  return !isSupabaseConfigured() || isCiPlaceholderSupabase();
}
