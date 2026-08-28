-- 014_launch_reconcile.sql
-- Inventory migration: security intent of 009–013 without executing those files.
-- No unique on quiz_attempts (that is pending/015, Phase 6).
--
-- APPLY BLOCKED until:
--   Gate 0: Netlify production SUPABASE_SERVICE_ROLE_KEY is non-empty (not a placeholder).
--   Gate 1: Phase 9 is merged and that commit's Netlify production deploy is Ready.
-- Do not replay 001–013. History-match local files 001–008 AND 009–013 as applied
-- without executing, then push only 014.
-- Live schema_migrations already has timestamp versions
-- (20260612202742 / 001_profiles … 20260612202824 / 008_contact_submissions)
-- plus dummy 20260825133455 / create_test_file. Local numbered filenames are NOT
-- those versions — repairing only 009–013 still leaves 001–008 pending and
-- `db push` would execute them (003 even adds quiz_attempts unique).
-- Use the same version/name shape as existing rows; do not invent colliding versions.
--
-- Live snapshot 2026-08-28 project xdmbyadosmzixsxqullj (us-east-1):
--   schema_migrations: 001_profiles … 008_contact_submissions (timestamp versions) + dummy create_test_file
--   009–013 not applied. delete_user / set_updated_at absent. handle_new_user has no search_path.
--   contact INSERT policy "Anyone can insert contact submissions" still present.
--   daily_log has select/insert/delete only. profiles SELECT is unwrapped auth.uid().
--   service_role.rolbypassrls = true. All public FKs to auth.users / profiles are ON DELETE CASCADE.
--   011/012 indexes missing. quiz_attempts unique (user_id, quiz_id) absent — leave it that way.

-- Abort if service_role cannot bypass RLS: FORCE RLS on contact_submissions would break /api/contact.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname = 'service_role' AND rolbypassrls = true
  ) THEN
    RAISE EXCEPTION '014 abort: service_role.rolbypassrls is not true; do not FORCE RLS';
  END IF;
END $$;

-- Abort if any public FK to auth.users / profiles is not ON DELETE CASCADE (confdeltype 'c').
-- auth.* GoTrue FKs are not in this check (cannot ALTER platform tables).
DO $$
DECLARE
  bad_count integer;
BEGIN
  SELECT count(*) INTO bad_count
  FROM pg_constraint c
  JOIN pg_class rel ON rel.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = rel.relnamespace
  WHERE c.contype = 'f'
    AND n.nspname = 'public'
    AND c.confrelid IN ('auth.users'::regclass, 'public.profiles'::regclass)
    AND c.confdeltype IS DISTINCT FROM 'c';

  IF bad_count > 0 THEN
    RAISE EXCEPTION '014 abort: % public FK(s) to auth.users/profiles are not ON DELETE CASCADE', bad_count;
  END IF;
END $$;

-- 009: self-service delete. Owner must be able to DELETE auth.users (postgres on this project).
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

-- handle_new_user: keep trigger on_auth_user_created; do not drop it.
-- Display name is display-only (never authorization). POSIX [[:cntrl:]] — not JS-style [\x00-\x1F].
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    nullif(
      substring(
        regexp_replace(
          trim(coalesce(new.raw_user_meta_data->>'display_name', '')),
          '[[:cntrl:]]',
          '',
          'g'
        )
        FROM 1 FOR 100
      ),
      ''
    )
  );
  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- 010: updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS lesson_progress_updated_at ON public.lesson_progress;
CREATE TRIGGER lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS streaks_updated_at ON public.streaks;
CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- daily_log: live has select/insert/delete only; upsert needs UPDATE.
DROP POLICY IF EXISTS daily_log_update ON public.daily_log;
CREATE POLICY daily_log_update
  ON public.daily_log
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Profiles SELECT wrap (lint 0003). Do not add INSERT — signup uses the trigger.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress FORCE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.achievements FORCE ROW LEVEL SECURITY;
ALTER TABLE public.streaks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.daily_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;

REVOKE TRUNCATE, TRIGGER ON
  public.profiles,
  public.lesson_progress,
  public.quiz_attempts,
  public.achievements,
  public.streaks,
  public.daily_log,
  public.notifications,
  public.contact_submissions
FROM anon, authenticated;

-- 011 + 012 indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_attempted_at ON public.quiz_attempts (user_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts (user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_completed_at ON public.lesson_progress (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_log_user_activity_date ON public.daily_log (user_id, activity_date DESC);

-- Contact lock LAST (supersets 013). Keep SELECT USING (false). Do not revoke from service_role.
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.contact_submissions
  FROM anon, authenticated;
