import type { PostgrestError, AuthError } from "@supabase/supabase-js";
import { reportServerError } from "@/lib/errorReporting";

export function logQueryError(context: string, error: PostgrestError | AuthError | Error | null): void {
  if (error) {
    reportServerError(error, { context });
  }
}
