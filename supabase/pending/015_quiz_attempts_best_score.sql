-- pending/015_quiz_attempts_best_score.sql
-- Phase 6 moves this file into supabase/migrations/ and applies it.
-- Do NOT apply in Phase 1. Do NOT place this file in migrations/ yet.
-- Client onConflict target must stay in sync with QUIZ_ATTEMPTS_ON_CONFLICT
-- in src/lib/supabase/schema.ts ("user_id,quiz_id").

-- Snapshot backup first (Phase 6 apply).
-- CREATE TABLE AS does not copy RLS. Live public default ACL grants table ALL to
-- anon/authenticated — revoke immediately and enable RLS with no policies so this
-- is not a PII dump via the Data API.
CREATE TABLE quiz_attempts_backup_20260827 AS SELECT * FROM quiz_attempts;
REVOKE ALL ON TABLE quiz_attempts_backup_20260827 FROM PUBLIC;
REVOKE ALL ON TABLE quiz_attempts_backup_20260827 FROM anon, authenticated;
ALTER TABLE quiz_attempts_backup_20260827 ENABLE ROW LEVEL SECURITY;

-- Preflight: record this count in the apply note (expect 0 on a clean HEAD-shaped DB).
-- SELECT COUNT(*) FROM public.quiz_attempts WHERE score = max_score AND score > 10;

-- Convert percent-in-score rows (80/5) to count/count (4/5).
-- Convert percent-in-both rows (60/60) to 36/60 (percent preserved; absolute count still not question-count).
-- Leave 4/5, 8/10, and 80/100 (score < max, already looks like count/count or percent-with-max-100) alone.
-- Do not replace `score > max_score` with `score > 10 AND max_score <= 10` — that misses 60/60.
UPDATE public.quiz_attempts
SET score = LEAST(max_score, GREATEST(0, ROUND(score * max_score / 100.0)::int))
WHERE max_score > 0 AND (
  score > max_score
  OR (score = max_score AND score > 10)
);

UPDATE public.quiz_attempts
SET passed = (max_score > 0 AND score::numeric / max_score >= 0.7);

-- id comparison is a deterministic tiebreak only (UUID is not temporal).
-- Run only after the percent→count UPDATE above.
DELETE FROM public.quiz_attempts a
USING public.quiz_attempts b
WHERE a.user_id = b.user_id
  AND a.quiz_id = b.quiz_id
  AND a.id <> b.id
  AND (
    a.score < b.score
    OR (a.score = b.score AND a.attempted_at < b.attempted_at)
    OR (a.score = b.score AND a.attempted_at = b.attempted_at AND a.id < b.id)
  );

DO $$
BEGIN
  ALTER TABLE public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_user_id_quiz_id_key UNIQUE (user_id, quiz_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
