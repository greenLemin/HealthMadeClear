-- supabase/rollback/014_emergency.sql
-- Reverse of 014 pieces. NOT a forward migration. Never put this file in supabase/migrations/.
-- Default is recipe A. If 014 is live, do not revert Phase 9 until recipe A has dropped delete_user.
-- Never run recipe B if service_role can insert via /api/contact (fix the env var instead).
-- If both kiosk and contact are on fire, run A then B as two statements.

-- RECIPE A (kiosk) — default
-- Drop self-service delete so HEAD / reverted Settings cannot leak a kiosk session.
-- Contact lock, FORCE RLS, daily_log UPDATE, handle_new_user, and indexes stay.
REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user() FROM anon, authenticated;
DROP FUNCTION IF EXISTS public.delete_user();

-- RECIPE B (contact outage) — exception only. Commented so a full-file run is A only.
-- Restore the 008 public INSERT path only if /api/contact returns 503 AND
-- SUPABASE_SERVICE_ROLE_KEY cannot be set in minutes. Never B if service role is present.
-- DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;
-- CREATE POLICY "Anyone can insert contact submissions"
--   ON public.contact_submissions
--   FOR INSERT
--   WITH CHECK (true);
-- GRANT INSERT ON public.contact_submissions TO anon;
