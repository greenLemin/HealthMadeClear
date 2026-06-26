import type { PostgrestError, AuthError } from "@supabase/supabase-js";

export function logQueryError(context: string, error: PostgrestError | AuthError | Error | null): void {
  if (error) console.error(`[dashboard:${context}]`, error.message);
}
