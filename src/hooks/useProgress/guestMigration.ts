import type { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGuestProgress, migrateGuestProgressToSupabase } from "@/lib/guestProgress";

export function useGuestMigration(
  user: User | null,
  supabase: ReturnType<typeof createClient>,
  authLoading: boolean
) {
  const [migrated, setMigrated] = useState(false);
  const [isMigrationLoading, setIsMigrationLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (user && !migrated) {
      const guest = getGuestProgress();
      if (guest.completedLessons.length > 0 || guest.quizAttempts.length > 0) {
        migrateGuestProgressToSupabase(supabase, user.id).then((result) => {
          if (result.ok) setMigrated(true);
          setIsMigrationLoading(false);
        });
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Mark migration done for guests with no progress after mount
        setIsMigrationLoading(false);
        setMigrated(true);
      }
    } else if (!user) {
      setIsMigrationLoading(false);
      setMigrated(false);
    }
  }, [user, authLoading, supabase, migrated]);

  return { isMigrationLoading };
}
