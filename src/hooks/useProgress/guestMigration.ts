import type { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGuestProgress, migrateGuestProgressToSupabase } from "@/lib/guestProgress";

export function useGuestMigration(
  user: User | null,
  supabase: ReturnType<typeof createClient>,
  authLoading: boolean
) {
  const [migratedUserId, setMigratedUserId] = useState<string | null>(null);

  const guest = getGuestProgress();
  const hasGuestProgress = guest.completedLessons.length > 0 || guest.quizAttempts.length > 0;

  const isMigrationLoading = Boolean(user && hasGuestProgress && migratedUserId !== user.id);

  useEffect(() => {
    if (authLoading || !user) return;

    if (hasGuestProgress && migratedUserId !== user.id) {
      migrateGuestProgressToSupabase(supabase, user.id).then((result) => {
        if (result.ok) setMigratedUserId(user.id);
      });
    }
  }, [user, authLoading, supabase, migratedUserId, hasGuestProgress]);

  return { isMigrationLoading };
}
