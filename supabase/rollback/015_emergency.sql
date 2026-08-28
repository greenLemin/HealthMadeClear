-- supabase/rollback/015_emergency.sql
-- Drop unique only. NOT a forward migration. Never put this file in supabase/migrations/.
-- Does NOT reverse the percent→count UPDATE (data repair stays).
-- Unique dropped + any upsert client = Postgres 42P10.
-- Never run while an upsert client is on Netlify.
-- Order: revert P5 if merged → revert P6 client → then drop unique.

ALTER TABLE public.quiz_attempts
  DROP CONSTRAINT IF EXISTS quiz_attempts_user_id_quiz_id_key;
