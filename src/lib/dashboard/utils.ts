import type { PostgrestError, AuthError } from "@supabase/supabase-js";
import { logger } from "../logger";

export function logQueryError(context: string, error: PostgrestError | AuthError | Error | null): void {
  if (error) {
    logger.error(`Query error in ${context}:`, error);
  }
}
