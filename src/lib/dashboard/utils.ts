import { PostgrestError } from "@supabase/supabase-js";

export function logQueryError(context: string, error: PostgrestError | null): void {
  if (error) {
    console.error(`Query error in ${context}:`, error);
  }
}
