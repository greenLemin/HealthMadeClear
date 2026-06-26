import type { PostgrestError } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

export function logQueryError(context: string, error: PostgrestError | null): void {
  if (error) logger.error(`[dashboard:${context}]`, error.message);
}
