# VERIFY-PHASE-1

**Verdict: APPROVED** (follow-up 2026-08-29)

Product/SQL punches from the 2026-08-28 write/review are closed in the repo. This remains a **write** approval. **Do not treat as apply-green.**

Closed punches:

1. `delete_user` now `REVOKE … FROM anon, authenticated` then `GRANT authenticated` (`014_launch_reconcile.sql`).
2. `015` backup table immediately `REVOKE`s `anon`/`authenticated`, enables RLS, no policies.
3. `014` header + `supabase/repair/history-match-001-013.sql` history-match **001–008 and 009–013**. Unit pins in `schema.test.ts`.
4. Mixed git index / one-PR process — obsolete; work is on `main` for human review.

Apply-gated §4.5 rows stay **BLOCKED until a human** proves Gate 0 (Netlify `SUPABASE_SERVICE_ROLE_KEY`) and Gate 1 (Phase 9 production Ready), then follows the repair runbook and pushes **only** `014` (park `015`). Live 2026-08-29: `schema_migrations` still 001–008 + dummy; anon still `INSERT` on `contact_submissions`; no `quiz_attempts` unique.

---

## Historical write/review (2026-08-28)

Original verdict was **CHANGES REQUIRED**. Do not re-open closed product punches from that snapshot.

Reviewer is not the Phase 1 author. Spec read from `cursor/plan-v10-0f7a:REVAMP/PLAN.v10.md` (file is **not** on `main` disk; workspace `REVAMP/` had only `ISSUES-BACKLOG.md`). Completion report read from the Phase 1 agent transcript (never committed).

This is a **write/review** verdict, not an apply verdict. `014` is correctly **not** on production. Apply remains forbidden until Gate 0, Gate 1, and punch-list item 3.

---

## Method

- Diff: `git diff --staged` (Phase 1 files isolated from a mixed index; see process).
- Live project `xdmbyadosmzixsxqullj` (PG 17.6, `us-east-1`): `list_migrations`, `pg_policies`, `pg_proc`, `pg_constraint`, `pg_indexes`, `pg_default_acl`, table privileges, `rolbypassrls`, `relforcerowsecurity`, FK `confdeltype`.
- Compared `014` to `009`–`013` and to the §4.3 contract (including `handle_new_user` `[[:cntrl:]]` body).
- Compared parked `015` to §4.3 B.
- Ran `npx vitest run src/lib/supabase/schema.test.ts`, `npm test`, `npm run lint`, `npm run typecheck`.
- No UI in this phase. No screenshots. Playwright N/A (§4.4).
- Did **not** `db push`. Did **not** run `/api/contact` against production.

---

## Punch list (must fix before APPROVED)

### 1. `supabase/migrations/014_launch_reconcile.sql:65-66` — 🔴 bug: `delete_user` EXECUTE remains on `anon`

§4.5: EXECUTE must **not** be granted to `PUBLIC` **or** `anon`.

`014` only does:

```sql
REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
```

Live `pg_default_acl` for `postgres` / schema `public` / functions is:

`{postgres=X, anon=X, authenticated=X, service_role=X}`

`CREATE FUNCTION` therefore grants `anon=X` **directly**. `REVOKE FROM PUBLIC` removes `{=X}` only. `anon` keeps EXECUTE. Same default ACL is why live `handle_new_user` is `{=X, postgres=X, anon=X, authenticated=X, service_role=X}`.

`014` already does the extra revoke for `handle_new_user` (`:97-98`). Rollback Recipe A already revokes `anon` (`014_emergency.sql:11`). Forward migration does not.

`auth.uid()` null-check means anon RPC cannot delete a user, but the acceptance line still fails and advisor `anon_security_definer_function_executable` will fire after apply.

**Fix:** after `CREATE OR REPLACE`, match rollback:

```sql
REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
```

### 2. `supabase/pending/015_quiz_attempts_best_score.sql:8` — 🔴 security: backup table inherits `anon ALL`

```sql
CREATE TABLE quiz_attempts_backup_20260827 AS SELECT * FROM quiz_attempts;
```

Live default table ACL on `public` is `anon=arwdDxtm` (ALL). `CREATE TABLE AS` does **not** copy RLS from `quiz_attempts`. Result: every quiz row (scores, `answers` jsonb, `user_id`) in an unprotected `public` table with table-level ALL for `anon` / `authenticated`.

Plan pasted this statement; on **this** project it is a PII dump. Phase 1 parks the file — Phase 6 will apply it as written.

**Fix (now, while the file is in this PR):** create in a non-exposed schema, **or** immediately `REVOKE ALL ON TABLE … FROM anon, authenticated`, `ENABLE ROW LEVEL SECURITY`, no policies. Do not leave a public backup with default grants.

### 3. `supabase/migrations/014_launch_reconcile.sql:8` — 🔴 apply trap: repair text omits 001–008

Header says: repair **009–013** as applied, then push only `014`.

Independent live `schema_migrations`:

| version        | name                    |
| -------------- | ----------------------- |
| 20260612202742 | 001_profiles            |
| …              | …                       |
| 20260612202824 | 008_contact_submissions |
| 20260825133455 | create_test_file        |

Repo files are `001_profiles.sql` … `014_launch_reconcile.sql`. CLI version for those filenames is **not** `20260612202742`. Repairing only 009–013 leaves numbered `001`–`008` looking unapplied. Blind `db push` then tries to **execute** `001`–`013` (local `003_quiz_attempts.sql` even contains `unique(user_id, quiz_id)` — the thing Phase 1 must not add).

Logged as P1-1, but the file operators will actually read still tells them the unsafe subset. Update `:8` (and the apply runbook) to history-match **001–008 as well as 009–013**, same `version`/`name` shape as existing rows, no invented colliding versions.

### 4. Git index — 🟡 process: Phase 1 is not one PR

Plan §0.1: one phase = one PR. §0.3: branch `revamp/pNN-short-slug`.

`git diff --staged --name-only` currently includes Phase 2 auth/i18n/e2e files plus this Phase 1 set. `REVAMP/ISSUES-BACKLOG.md` has P2-1…P2-5 mixed into the Phase 1 staging. Work is on `main`, uncommitted.

**Fix:** unstage everything that is not Phase 1; open `revamp/p01-schema-reconcile` with only:

- `supabase/migrations/014_launch_reconcile.sql`
- `supabase/pending/015_quiz_attempts_best_score.sql`
- `supabase/rollback/014_emergency.sql`
- `supabase/codemap.md`
- `src/lib/supabase/schema.ts`
- `src/lib/supabase/schema.test.ts`
- `REVAMP/ISSUES-BACKLOG.md` **P1-1…P1-3 only**

---

## Acceptance criteria (re-checked)

| Criterion                                                                              | Result                     | Evidence                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gate 0: Netlify `SUPABASE_SERVICE_ROLE_KEY` proven before `db push`                    | **BLOCKED (expected)**     | No `db push`. No env proof in repo. Author reported `netlify env:get` unlinked.                                                                                                                                                                             |
| Gate 1: Phase 9 production-Ready before `014` push                                     | **BLOCKED (expected)**     | HEAD `SettingsClient.tsx:79-89` still `rpc("delete_user")` then `signOut()` with no `try/finally` local wipe. Live `delete_user` **absent**. Do not apply.                                                                                                  |
| `migration list`: 009–013 not pending execution; `014` applied; `015` not applied      | **FAIL apply / PASS park** | Remote history = 001–008 + dummy only. `015` is in `supabase/pending/`, not `migrations/`. `014` file exists, not in remote history.                                                                                                                        |
| No live policy `"Anyone can insert contact submissions"`                               | **FAIL (not applied)**     | Live policy still present, `cmd=INSERT`, `roles={public}`, `with_check=true`. SQL to drop it is last in `014` (`:173-176`).                                                                                                                                 |
| `anon` cannot INSERT `contact_submissions`                                             | **FAIL (not applied)**     | Live grants: `anon` has INSERT (and UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES). `014:174-176` revokes those. Table privileges have **no** `PUBLIC` grantee — revoke-from-anon/authenticated matches live.                                                   |
| `/api/contact` still 2xx with service role                                             | **NOT RUN**                | Route still uses service role (out of Phase 1 file scope). `service_role.rolbypassrls = true` (FORCE RLS abort check would pass). Post-apply only.                                                                                                          |
| `delete_user` exists, `prosecdef`, `search_path=public`, EXECUTE not PUBLIC/anon       | **SQL incomplete**         | Body/`SECURITY DEFINER`/`search_path` match `009` and §4.3. Grants **miss `anon`** (punch 1). Not on live yet.                                                                                                                                              |
| Throwaway `rpc('delete_user')`                                                         | **SKIP**                   | Plan: not a merge blocker; `014` not applied.                                                                                                                                                                                                               |
| `handle_new_user` search_path, EXECUTE revoked, display_name truncated + `[[:cntrl:]]` | **SQL OK, not applied**    | Live: `proconfig` null, `proacl` includes anon+authenticated+PUBLIC, body is raw `display_name`. `014:70-98` matches spec; extra `REVOKE` from anon/authenticated is correct. Trigger `on_auth_user_created` still on `auth.users`; `014` does not drop it. |
| New signup still creates `profiles` row                                                | **NOT RUN**                | Trigger still present. Replace not applied.                                                                                                                                                                                                                 |
| `daily_log` UPDATE policy; second upsert same UTC day                                  | **SQL OK, not applied**    | Live policies: select/insert/delete only (no UPDATE). Unique `(user_id, activity_date)` exists. App `dailyLog.ts:8` upserts `onConflict: user_id,activity_date`. `014:128-134` adds `USING` + `WITH CHECK` `(select auth.uid()) = user_id`.                 |
| `quiz_attempts` unique **not** required yet                                            | **PASS**                   | Live constraints: pkey + FK only. `014` has no unique. `.insert()` retakes still valid.                                                                                                                                                                     |
| Indexes from 011/012 exist                                                             | **SQL OK, not applied**    | Live: those `idx_*` names absent. `014:165-170` copies `011`+`012` `IF NOT EXISTS` (same six indexes).                                                                                                                                                      |
| `npm test` green (constant test)                                                       | **PASS**                   | See commands.                                                                                                                                                                                                                                               |

---

## What is actually correct (do not redo)

- File scope for SQL/constants matches §4.1. No quiz client TS. `015` not in `migrations/`. Rollback not in `migrations/`.
- Did **not** apply `014` without Gate 0/1. Correct Day-1 slip.
- Contact lock is last (`DROP POLICY` then `REVOKE INSERT…` on `contact_submissions` only). SELECT policy `"Only service role can read contact submissions"` / `USING (false)` left in place. `service_role` grants not revoked.
- Abort `DO` blocks for `service_role.rolbypassrls` and public FK `confdeltype <> 'c'` match live (bypass = true; all seven public FKs are `'c'`). No FK rewrite — correct.
- `delete_user` body matches `009_delete_user.sql`. Owner will be `postgres` if `db push` runs as postgres (live `handle_new_user` owner is already `postgres`).
- `set_updated_at` + `DROP TRIGGER IF EXISTS` / `EXECUTE FUNCTION` matches `010` (idempotent-ized). Live has **no** those triggers today.
- Profiles SELECT wrap + `TO authenticated`; no client INSERT policy added (live has none — 001 file’s INSERT policy is not on prod).
- `FORCE ROW LEVEL SECURITY` on all eight tables (live: RLS on, FORCE off).
- `REVOKE TRUNCATE, TRIGGER` on those tables from `anon, authenticated` — live contact grants include those privileges; pattern is right.
- `015` normalize / `passed` rewrite / dedupe / unique `DO $$ … duplicate_object` match §4.3 B. Unique stays out of `014`.
- Recipe B commented so a full-file rollback run is Recipe A only — acceptable vs “default is A”.
- `schema.ts` exports both conflict strings; `schema.test.ts` locks the literals the plan named. Weak lock, but it is the specified test, not an empty `expect(true)`.
- Live snapshot in the completion report matches what this review queried. Author did not invent object names.

---

## Tests / commands (this review)

```
npx vitest run src/lib/supabase/schema.test.ts
  Test Files  1 passed (1)
  Tests       1 passed (1)

npm test
  Test Files  107 passed (107)
  Tests       731 passed (731)

npm run lint       → 0 errors (pre-existing warning: GoogleAnalytics.test.tsx)
npm run typecheck  → pass
```

Completion report said 105 / 711. Delta is later Phase 2 tests in the same working tree, not a Phase 1 lie.

Playwright: not required. Not run.

Local `014` then Recipe A smoke: not run (`supabase start` not up). Plan: do not block on this.

`npx supabase migration list --project-ref xdmbyadosmzixsxqullj` failed here (`LegacyPlatformAuthRequiredError`). Remote history confirmed via MCP `list_migrations` instead.

---

## Completion-report audit

Honest on apply: Gate 0/1 marked **BLOCKED**, not passed. `015` location passed. Unique-not-required passed.

Missed punch 1 (anon EXECUTE / default ACLs) and punch 2 (backup table ACLs). Logged P1-1 but left the dangerous one-line repair instruction in `014:8`.

“Staged set is the seven files” was true at completion; the index is no longer a Phase 1 PR (punch 4).

---

## Out of scope / logged, not re-opened as Phase 1 code fixes

- **P1-2** dummy `create_test_file` — confirmed live. Leave.
- **P1-3** `src/lib/supabase/codemap.md` omits `schema.ts` — still true; §4.1 did not list that map.
- Achievements live: select/insert/delete only (no UPDATE). Not in §4.3.
- `PLAN.v10.md` missing from `main` disk — later logged as P2-5; blocks future agents unless copied.

---

## Apply status (do not treat as merge-green for production SQL)

`014` is **not** applied. ADV-10 public INSERT is still open. `delete_user` is still missing. That is correct given Gate 1 (`SettingsClient` still kiosk-shaped).

Do not `db push` until: punch 1–3 landed, Gate 0 proof attached, Phase 9 production deploy Ready, and `schema_migrations` history-matched for **001–013** numbered local versions.
