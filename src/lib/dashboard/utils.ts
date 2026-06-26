import { PostgrestError } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

export function logQueryError(context: string, error: PostgrestError | null): void {
  if (error) {
    logger.error(`Query error in ${context}:`, error);
  }
}
