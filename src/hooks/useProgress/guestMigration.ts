import type { User } from "@supabase/supabase-js";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGuestProgress, migrateGuestProgressToSupabase, clearGuestProgress } from "@/lib/guestProgress";

export function useGuestMigration(
  user: User | null,
  supabase: ReturnType<typeof createClient>,
  authLoading: boolean,
  /** Called after a successful migration so the caller can refetch Supabase progress. */
  onMigrated?: () => void | Promise<void>
) {
  const [migrated, setMigrated] = useState(false);
  const [isMigrationLoading, setIsMigrationLoading] = useState(true);

  // Keep onMigrated in a ref so the effect doesn't need it as a dep,
  // preventing re-runs that race with the in-flight promise.
  const onMigratedRef = useRef(onMigrated);
  useEffect(() => {
    onMigratedRef.current = onMigrated;
  }, [onMigrated]);

  useEffect(() => {
    if (authLoading) return;

    if (user && !migrated) {
      const guest = getGuestProgress();
      if (guest.completedLessons.length > 0 || guest.quizAttempts.length > 0) {
        migrateGuestProgressToSupabase(supabase, user.id)
          .then(async (result) => {
            if (result.ok) {
              setMigrated(true);
              await onMigratedRef.current?.();
              clearGuestProgress();
            }
          })
          .catch(() => {
            // Non-fatal: migration threw unexpectedly — unblock the UI
          })
          .finally(() => {
            setIsMigrationLoading(false);
          });
      } else {
        // No guest data — mark done immediately
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Mark migration done for guests with no progress after mount
        setIsMigrationLoading(false);
        setMigrated(true);
      }
    } else if (!user) {
      setIsMigrationLoading(false);
      setMigrated(false);
    }
  }, [user, authLoading, supabase, migrated]);

  return { isMigrationLoading, migrated };
}
