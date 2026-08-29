# supabase/

## Responsibility

Supabase project configuration and database migrations.

## Key Files

- `migrations/`: SQL migration files for database schema (`001`–`015`)
- `migrations/014_launch_reconcile.sql`: Launch inventory migration. Supersets 009–013 intent (delete_user, updated_at, indexes, contact INSERT lock). Idempotent. **No** `quiz_attempts` unique. Do not apply until Gate 0 (Netlify `SUPABASE_SERVICE_ROLE_KEY`) and Gate 1 (Phase 9 live on production). History-match local **001–008 and 009–013** as applied (live 001–008 use timestamp versions; numbered local files are not those versions) before `db push`. `delete_user` EXECUTE: REVOKE PUBLIC **and** anon/authenticated, then GRANT authenticated only.
- `migrations/015_quiz_attempts_best_score.sql`: Normalize percent scores, dedupe, then unique `(user_id, quiz_id)`. Apply only after Netlify **Published** for the Phase 6 SHA (see P6-3). Backup `CREATE TABLE AS` immediately REVOKEs `anon`/`authenticated` and enables RLS with no policies.
- `rollback/014_emergency.sql`: Emergency reverse of 014. Recipe A (default) drops `delete_user` only. Recipe B restores anon contact INSERT — only if `/api/contact` 503s and the service role key cannot be set. Never a forward migration.
- `rollback/015_emergency.sql`: Emergency reverse of 015 unique constraint / score normalize. Never a forward migration.

## Integration

- Consumed by: Supabase project deployment
- Depends on: Supabase CLI for running migrations
