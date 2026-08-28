# HealthMadeClear Launch Revamp — Implementation Plan

> **Superseded by `REVAMP/PLAN.v2.md` (2026-08-27).** Do not implement from this file. Round-1 critique: `REVAMP/CRITIQUES/ROUND-1.md`.

**Status:** Historical v1 (blocked). Contract is v2.  
**Date:** 2026-08-27  
**Inputs:** `REVAMP/AUDIT-CODE.md` (file audit + independent adversarial/live-DB audit), `REVAMP/AUDIT-VISUAL.md`  
**Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, next-intl (EN/ES), Supabase (`xdmbyadosmzixsxqullj`, us-east-1), Vitest, Playwright, Netlify

This document is the only source of truth for what ships. If a later chat disagrees with this file, update this file first. Vagueness here causes failed PRs later.

---

## 0. How to execute this plan

### 0.1 Rules every agent must follow

1. **One phase = one PR.** Do not mix phases. Each PR must leave `main` shippable (build, lint, typecheck, unit tests, e2e green).
2. **Read this phase section completely** before touching files. Do not invent extra scope.
3. **EN and ES catalogs must stay in parity.** Every new `en.json` key gets the same path in `es.json`. Run existing locale tests.
4. **Do not replay** `supabase/migrations/001_*.sql` through `013_*.sql` against production. Live schema already diverged. Only apply **new** dated migrations starting at `014_`.
5. **Never put `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_*` variable** or client bundle.
6. **Do not** add email, Resend, PWA service workers, TTS, or new clinical tools in this window.
7. After UI work, verify in the browser (desktop 1440 and mobile 390) on the routes listed in that phase. Screenshots in `REVAMP/SCREENSHOTS/` are the **before** state, not the target.
8. Commits and PR titles: normal English, conventional commits (`fix:`, `feat:`, `security:`, `a11y:`).
9. If a step says "verify current code first" and the bug is already gone, record that in the PR description and skip the rewrite. Do not revert a working fix.

### 0.2 Commands every phase uses

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e   # after UI/auth/routing changes
```

Content changes also require:

```bash
npm run content:validate
```

Production env gate (Netlify builds):

```bash
CI=true NETLIFY=true npm run build
```

### 0.3 Branch naming

`revamp/pNN-short-slug` (example: `revamp/p02-auth-recovery`).

---

## 1. Synthesis of the three audits

### 1.1 What each audit is authoritative for

| Source                                               | Trust for                                                                                                                           | Do not trust for                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| File audit (`AUDIT-CODE.md` §§1–8 + Top 20)          | App source bugs, missing tests, client bundle imports, contrast math, article citation omission                                     | Live RLS, live functions, live constraints, "migrations are applied"             |
| Adversarial audit (`AUDIT-CODE.md` Independent pass) | Production `pg_policies`, `schema_migrations`, `pg_proc`, grants, quiz unique drift, privacy copy vs network, `delete_user` absence | Visual layout, tap targets, 1440px header                                        |
| Visual audit (`AUDIT-VISUAL.md`)                     | 1440/390 screenshots, header `2xl` bug, hero type, 404 chrome, glossary wrap, quiz CLS, search grouping                             | Live DB, auth PKCE, whether a component was already patched after the screenshot |

### 1.2 Conflict resolution (accepted)

| ID  | Conflict                                                                                                                                                                                                                    | Decision                                                                                                                                                               | Reasoning                                                                                                                                             |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | File audit RLS matrix scores every table "✅ Secure". Adversarial audit shows live DB only has `001`–`008` (+ dummy), public INSERT on `contact_submissions`, no `delete_user`, no quiz unique, missing `daily_log` UPDATE. | **Adversarial wins.** Treat file SQL as intent, not runtime.                                                                                                           | Launch risk is production, not the git tree.                                                                                                          |
| C2  | File audit SEC-01 (missing service-role env → Next `/api/contact` 503) vs ADV-10 (anon can INSERT via PostgREST).                                                                                                           | **Both accepted.** They are different layers.                                                                                                                          | Env gate without dropping the live INSERT policy still leaves an open spam/PII pipe. Policy drop without the env gate still 503s the legitimate form. |
| C3  | File audit implies applying repo `003_quiz_attempts.sql` unique is fine. ADV-01: live has duplicates; client `.insert()`; unique would 23505 on retake.                                                                     | **Do not apply `003` as-is.** Dedupe in `014`, add unique, change client to upsert-best-score.                                                                         | Product UI already shows best score. History-everywhere is a post-launch project.                                                                     |
| C4  | "Just run `supabase db push` / replay 001–013." vs "production was mutated outside migrations."                                                                                                                             | **Write `014_launch_reconcile.sql` (and follow-ons) that IF NOT EXISTS / DROP POLICY IF EXISTS against live names.** Never replay 001–008.                             | Live policy names are split (`lesson_progress_select`, etc.). Replaying `FOR ALL` would collide and weaken WITH CHECK splits.                         |
| C5  | File audit §8 "Print-friendly PDF." Adversarial: print CSS + visit planner/checklist `window.print()` already exist.                                                                                                        | **No new PDF library.** Add print CTAs on lesson/article/care-guide only.                                                                                              | Four days; print path already works.                                                                                                                  |
| C6  | Visual audit: checklist checkboxes `20×20px`. Current `VisitChecklistClient.tsx` wraps each row in `<label className="… py-4">`.                                                                                            | **Verify first.** If full-row label already hit-tests, only enlarge the native control + `min-h-[48px]`. Do not rewrite the list.                                      | Screenshot may predate the label wrap.                                                                                                                |
| C7  | Visual audit praises care-guide emergency flagging. ADV-12: copy reads as triage/OTC treatment.                                                                                                                             | **Keep the visual hierarchy (red emergency banner).** Rewrite copy to educational comparison, not instructions to take medicine or "go to urgent care" as a directive. | Liability > visual praise.                                                                                                                            |
| C8  | File audit treats mock `any` as the main type debt. Adversarial lists production `as unknown as` and unvalidated `JSON.parse`.                                                                                              | **Fix guest `JSON.parse` in Phase 5.** Defer mock-client generics. Auth `nextUrl` casts: replace with `request.nextUrl` in Phase 2.                                    | Launch integrity is guest storage + auth routes, not the in-memory mock.                                                                              |
| C9  | File audit MED-03 `tel:911` unlabeled. `disclaimer.emergencyCallAria` already says "911 in the US"; visible button does not.                                                                                                | **Change visible string + keep `tel:911`.** Do not add 112 routing.                                                                                                    | Audience is US EN/ES. Hidden aria is not enough.                                                                                                      |
| C10 | File audit A11Y LanguageToggle missing aria. Current `LanguageToggle.tsx` already has `aria-label={t("switchToEnglish")}` / Spanish.                                                                                        | **Verify-only.** Skip rewrite if labels present on both breakpoints.                                                                                                   | Avoid churn.                                                                                                                                          |
| C11 | File audit: AppProviders key `hmc_completed_lessons`. Actual key is `STORAGE_KEYS.completedLessons` = `hmc-completed-lessons`. Guest key is `hmc_guest_completedLessons` in **sessionStorage**.                             | **Use actual keys.** Dual-storage bug still stands.                                                                                                                    | Audit key names were wrong; mechanism was right.                                                                                                      |
| C12 | First-audit feature list (med schedule, lab decoder, PWA, TTS, screening timeline, bill dispute, glossary audio, email plan). Adversarial: do not add email until privacy is true; several "features" already shipped.      | **Out of scope** except the small S-effort items in Phase 15.                                                                                                          | After P0/P1 work, M-effort tools will slip the window and add clinical liability.                                                                     |
| C13 | Ownership RLS vs cheat-proof integrity (client can forge streaks).                                                                                                                                                          | **Out of scope to make gamification server-authoritative.** Keep BOLA-safe ownership.                                                                                  | Not a PHI leak. Full SECURITY DEFINER completion RPC is a post-launch project.                                                                        |
| C14 | `ArticlePageClient` already renders `MedicalDisclaimer`. ADV-12 says articles **index** has none. File audit said article **reader** omits sources (true) and implied no disclaimer (false for reader).                     | **Add disclaimer to `ArticlesClient` (catalog).** Add `ArticleNotes` sources/reviewedBy on the reader.                                                                 | Split the finding.                                                                                                                                    |
| C15 | Dashboard "minutes learned" vs dead `time_spent_seconds`.                                                                                                                                                                   | **Honesty: hide or show em dash when zero.** Do not fake minutes. Instrumentation is out of scope.                                                                     | Product lie is worse than an empty metric.                                                                                                            |

### 1.3 Product decisions locked for this window

| Decision           | Choice                                                                                                                                                                | Why                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Quiz storage model | **One best-score row per `(user_id, quiz_id)`**                                                                                                                       | Matches lesson UI (`useSupabaseProgress` already keeps max). Dashboard must use the same rule. |
| Guest progress     | **`localStorage` is canonical** (`hmc-completed-lessons`, `hmc-quiz-scores`). Guest helpers read/write the same keys, with sessionStorage as a one-time migrate-from. | Tab close must not wipe progress.                                                              |
| Care guide voice   | **Education, not triage.** Describe typical settings; never "take OTC" or "go to X now" as an instruction. Emergency banner stays, qualified as US 911.               | Highest clinical-liability surface.                                                            |
| Privacy            | **Describe both modes** (anonymous local vs signed-in sync) and GA path collection.                                                                                   | Current copy is false for authenticated users.                                                 |
| Account deletion   | **Deploy `delete_user`**, then `signOut()`. Contact rows stay (not user-linked). Privacy copy must say that.                                                          | GDPR/CCPA control must work.                                                                   |
| New tools          | **None.**                                                                                                                                                             | See §11.                                                                                       |
| Print              | **`window.print()` + existing `@media print`.**                                                                                                                       | No jsPDF.                                                                                      |

### 1.4 Already fixed or verify-only (do not redo blindly)

Confirm in the phase that owns the surface. If still broken, fix. If already good, note in PR and move on.

| Surface                   | Current code                                                                          | Visual/file claim                         |
| ------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------- |
| Visit checklist row tap   | `VisitChecklistClient.tsx` wraps `<input>` in full-width `<label className="… py-4">` | 20×20 raw checkbox                        |
| Glossary letter size      | buttons use `h-11 min-w-11` (44px)                                                    | 28×28 — **wrapping** is the remaining bug |
| Language toggle names     | `aria-label` on each radio                                                            | missing accessible name                   |
| Article reader disclaimer | `ArticlePageClient.tsx` includes `<MedicalDisclaimer />`                              | sometimes described as absent             |
| Search locale split       | `import(\`@/data/searchIndex.${locale}.ts\`)`                                         | lessons/quizzes still dual-bundle         |
| Emergency aria            | `emergencyCallAria` mentions US 911                                                   | visible label does not                    |

---

## 2. Finding → phase matrix (every accepted item)

Severity: 🔴 blocker / 🟡 should-fix this window / 🟢 include only if the phase is already open.

| Finding                                                              | Sev     | Phase                | Notes                                     |
| -------------------------------------------------------------------- | ------- | -------------------- | ----------------------------------------- |
| ADV-10 public INSERT `contact_submissions`                           | 🔴      | 1                    | Plus REVOKE                               |
| ADV-09 `delete_user` missing                                         | 🔴      | 1                    |                                           |
| ADV-15 `handle_new_user` search_path + EXECUTE PUBLIC                | 🟡      | 1                    | Same migration                            |
| ADV-01 quiz unique vs insert vs live dupes                           | 🔴      | 1 (SQL) + 6 (client) |                                           |
| `daily_log` no UPDATE (upsert fails day 2)                           | 🟡      | 1                    |                                           |
| Indexes 011/012 not applied                                          | 🟡      | 1                    |                                           |
| `set_updated_at` / 010 absent                                        | 🟢      | 1                    | Cheap with 014                            |
| FORCE RLS + REVOKE TRUNCATE/TRIGGER from `anon`                      | 🟡      | 1                    | Defense in depth                          |
| `auth_rls_initplan` wrap `(select auth.uid())` on remaining policies | 🟢      | 1                    | profiles SELECT                           |
| SEC-01 `SUPABASE_SERVICE_ROLE_KEY` env gate                          | 🔴      | 3                    | NETLIFY-only, not GitHub CI               |
| BUG-01 reset hash-only                                               | 🔴      | 2                    |                                           |
| BUG-02 confirm ignores `token_hash`                                  | 🔴      | 2                    |                                           |
| BUG-05 locale-less auth redirects                                    | 🟡      | 2                    |                                           |
| ADV-11 (same as BUG-01/02)                                           | 🔴      | 2                    |                                           |
| ADV-08 privacy lie                                                   | 🔴      | 3                    |                                           |
| ADV-06 contact double-submit                                         | 🟡      | 3                    | Client lock; no new DB column             |
| ADV-12 care-guide treatment voice                                    | 🔴      | 4                    |                                           |
| A11Y-01 urgent-care contrast                                         | 🔴      | 4                    |                                           |
| MED-03 911 visible qualifier                                         | 🟡      | 4                    |                                           |
| Articles catalog missing disclaimer                                  | 🟡      | 4                    |                                           |
| BUG-03 guest session vs local                                        | 🟡      | 5                    |                                           |
| BUG-04 / ADV-03 migration race + unhandled rejection                 | 🟡      | 5                    |                                           |
| Guest `JSON.parse as T`                                              | 🟡      | 5                    |                                           |
| ADV-04 quiz optimistic no rollback                                   | 🟡      | 6                    |                                           |
| Client quiz `.insert`                                                | 🔴      | 6                    | After 014 unique                          |
| Dashboard summary sums all quiz rows                                 | 🟡      | 6                    | Best-score aggregation                    |
| ADV-02 dead achievements + side-effect order                         | 🟡      | 7                    |                                           |
| ADV-14 English achievement toasts                                    | 🟡      | 7                    |                                           |
| MED-01 article sources omitted                                       | 🔴      | 8                    |                                           |
| LessonNotes omits `reviewedBy`                                       | 🟡      | 8                    |                                           |
| MED-02 validate-content sources/reviewedBy                           | 🟡      | 8                    |                                           |
| Visual trust banner / compact review line                            | 🟡      | 8                    |                                           |
| ADV-13 signup email enumeration                                      | 🟡      | 9                    |                                           |
| ADV-05 expired JWT generic error                                     | 🟡      | 9                    |                                           |
| TEST-01 auth form unit tests                                         | 🟡      | 9                    |                                           |
| Visual header `2xl` → `lg`                                           | 🔴 UX   | 10                   |                                           |
| Display button duplicate accessible name                             | 🟡      | 10                   |                                           |
| Unstyled root 404                                                    | 🔴 UX   | 10                   |                                           |
| ErrorBoundary hardcoded English                                      | 🟡      | 10                   |                                           |
| Onboarding title hardcoded                                           | 🟢      | 10                   |                                           |
| Footer / drawer / terms / inputs tap                                 | 🔴 UX   | 11                   |                                           |
| Inline glossary tap expander                                         | 🔴 UX   | 11                   |                                           |
| Glossary A-Z horizontal snap                                         | 🟡      | 11                   |                                           |
| A11Y-03 search `aria-live` + loading                                 | 🟡      | 12                   |                                           |
| Visual search grouping                                               | 🟡      | 12                   |                                           |
| A11Y-02 planner focus                                                | 🟡      | 12                   |                                           |
| BUG-06 planner locale strings                                        | 🟡      | 12                   |                                           |
| Visual planner summary contrast                                      | 🟡      | 12                   |                                           |
| Hero type scale                                                      | 🟡      | 13                   |                                           |
| Article `max-w-prose` + TOC                                          | 🟡      | 13                   |                                           |
| Quiz feedback CLS                                                    | 🟡      | 13                   |                                           |
| Learn pills/cards                                                    | 🟡      | 13                   |                                           |
| Path mobile stacked steps                                            | 🟡      | 13                   |                                           |
| PERF-01 EN+ES lesson/quiz(/path/glossary) eager import               | 🔴 perf | 14                   |                                           |
| Print CTAs lesson/article/care-guide                                 | 🟡 feat | 15                   |                                           |
| Lesson copy/share parity                                             | 🟢 feat | 15                   |                                           |
| `markLessonViewed` on lesson page                                    | 🟢 feat | 15                   |                                           |
| Empty achievements section                                           | 🟢      | 15                   |                                           |
| SEC-02 CSP dual source                                               | 🟡      | 16                   |                                           |
| JsonLd extra validation                                              | 🟢      | 16                   |                                           |
| ADV-16 Sentry `extra`/breadcrumbs                                    | 🟡      | 16                   |                                           |
| SEC-03 server Sentry                                                 | 🟢      | 16                   |                                           |
| PERF-02 AppProviders split                                           | 🟡      | 16                   | Drop if Day 4 slips                       |
| PERF-03 dashboard N+1                                                | 🟢      | 16                   | Drop if Day 4 slips                       |
| ADV-07 minutes learned lie                                           | 🟡      | 16                   |                                           |
| TEST-02 tool unit tests                                              | 🟡      | 4, 12                | In those phases                           |
| Home autoplay video 1.3MB                                            | 🟢      | 16                   | `preload="none"` / respect reduced motion |

**Rejected for this window** (still listed in §11): mock strict types, Flesch-Kincaid linter, localhost CSRF port match, Logo `next/image`, cheat-proof RPCs, PWA, TTS, new clinical tools, email send, glossary audio, reading-time instrumentation.

---

## 3. Four-day calendar

Assume ~10 hour days, mergeable PRs, CI ~15 min/PR.

| Day       | Phases           | Theme                                                                                 |
| --------- | ---------------- | ------------------------------------------------------------------------------------- |
| **Day 1** | 1, 2, 3          | Security + auth + legal copy. **Do not announce launch until 1–3 are on production.** |
| **Day 2** | 4, 5, 6, 7       | Clinical honesty + progress correctness                                               |
| **Day 3** | 8, 9, 10, 11, 12 | Citations, auth UX tests, visual/a11y chrome                                          |
| **Day 4** | 13, 14, 15, 16   | Reading UX, bundle split, small features, hardening                                   |

**Slip protocol:** If Day 3 is not done by start of Day 4, **cut Phase 14 last-half (path/glossary split) and Phase 16 AppProviders/N+1**. Never cut Phases 1–6.

**Parallelism:** Phase 2 can start while Phase 1 SQL is in review. Phase 4 is independent of 1–3. Phase 6 **must not merge before** Phase 1 unique constraint is applied to production (otherwise upsert `onConflict` is a no-op and duplicates continue).

---

## 4. Global implementation constraints

- Locales: `en`, `es` only. `localePrefix: "always"`. Every auth redirect is `/${locale}/...`.
- Dashboard remains the only middleware-guarded area.
- Guest mode must keep working with no Supabase.
- Do not add Zod as a new production dependency unless a phase explicitly says so; prefer existing `parsePlannerState`-style allowlists.
- New i18n keys: add to **both** `src/messages/en.json` and `src/messages/es.json` at the same JSON path. Spanish must be real translation, not English leftovers.
- Tests: colocate `*.test.ts(x)` next to the file. E2E lives in `e2e/`. Follow existing `vi.mock` + Testing Library patterns (see `src/app/[locale]/auth/confirm/route.test.ts`, `src/lib/guestProgress.test.ts`).
- Playwright: use `waitForAppReady` from `e2e/setup.ts`. Prefer role/label selectors.
- CI (`.github/workflows/ci.yml`) sets fake `NEXT_PUBLIC_SUPABASE_*` only on `npm run build`. Do **not** require `SUPABASE_SERVICE_ROLE_KEY` in GitHub Actions.

---

# PHASES

---

## Phase 1 — Production schema reconciliation

**Goal:** Production Postgres matches the security intent of migrations 009–013 without replaying 001–008, and quiz/daily-log constraints match the client we will ship in Phase 6.

**Rationale:** Live DB is the launch blocker the file audit could not see. Public INSERT on `contact_submissions` bypasses CSRF, honeypot, and rate limits. Account deletion is a placebo. Quiz retakes duplicate rows. Naive `db push` of old files will collide.

**Complexity:** High  
**Risk:** High (data-changing SQL)  
**Dependencies:** None. **Gate for Phase 6.**

### 4.1 Scope (files)

| File                                                   | Change                                                                                                            |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/014_launch_reconcile.sql`         | **Create.** Inventory migration. Idempotent.                                                                      |
| `supabase/migrations/015_quiz_attempts_best_score.sql` | **Create.** Dedupe + unique `(user_id, quiz_id)`. Separate file so it can be reviewed/rolled back apart from RLS. |
| `supabase/codemap.md`                                  | List 014/015.                                                                                                     |
| `REVAMP/PLAN.md`                                       | After apply, check off verification queries in the PR (do not edit plan unless decisions change).                 |

No application TypeScript in this phase except optional comments. Client quiz upsert is Phase 6.

### 4.2 Preflight (human + agent)

1. Confirm project ref `xdmbyadosmzixsxqullj`.
2. Snapshot: in Supabase SQL editor (or MCP `execute_sql` read-only), save outputs of:

```sql
select version, name from supabase_migrations.schema_migrations order by version;
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies where schemaname = 'public' order by tablename, policyname;
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public';
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.quiz_attempts'::regclass;
```

3. **Stop** if you cannot take this snapshot. Do not apply SQL blind.
4. Confirm `SUPABASE_SERVICE_ROLE_KEY` exists in Netlify env (needed after INSERT revoke). If missing, add it **before** applying the contact revoke, or contact form dies. Coordinate with Phase 3; if key is missing, apply contact revoke in the same deploy window as the env var.

### 4.3 Implementation steps

**A. Write `014_launch_reconcile.sql`** with this exact intent (adapt only if live names differ from the 2026-08-27 audit; if they differ, update names from the snapshot, do not invent):

1. **Contact lock**
   - `DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;`
   - Keep SELECT `USING (false)` (policy `"Only service role can read contact submissions"` or live equivalent).
   - `REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.contact_submissions FROM anon, authenticated;`
   - Do **not** revoke from `service_role`.
2. **`delete_user`** — copy body from `009_delete_user.sql` (`SECURITY DEFINER`, `SET search_path = public`, `auth.uid()` null check, `DELETE FROM auth.users WHERE id = auth.uid()`). Then:
   - `REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC;`
   - `GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;`
3. **`handle_new_user`** — `CREATE OR REPLACE` using `001_profiles.sql` body (`SET search_path = public`, insert profile from `raw_user_meta_data->>'display_name'`). Then:
   - `REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;`
   - `REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;`
   - Trigger `on_auth_user_created` must remain. Do not drop it.
   - **Never** use `raw_user_meta_data` for authorization (display name only).
4. **`set_updated_at`** — from `010_updated_at_triggers.sql`. Use `CREATE OR REPLACE FUNCTION`. Triggers: `DROP TRIGGER IF EXISTS` then create on `profiles`, `lesson_progress`, `streaks`.
5. **`daily_log` UPDATE policy** — live has select/insert/delete only. Add:
   - `DROP POLICY IF EXISTS daily_log_update ON public.daily_log;`
   - `CREATE POLICY daily_log_update ON public.daily_log FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);`
6. **Profiles SELECT wrap** (lint 0003): drop and recreate `"Users can view their own profile"` as `TO authenticated` (or keep `TO public` if you must match live, but **USING `((select auth.uid()) = id)`**). Do **not** add a client-callable INSERT policy if signup still uses the trigger; live missing INSERT is OK.
7. **FORCE ROW LEVEL SECURITY** on: `profiles`, `lesson_progress`, `quiz_attempts`, `achievements`, `streaks`, `daily_log`, `notifications`, `contact_submissions`.
8. **REVOKE** `TRUNCATE, TRIGGER` on all those tables `FROM anon, authenticated`. Leave SELECT/INSERT/UPDATE/DELETE as today so RLS remains the row gate.
9. **Indexes** — copy `011_indexes.sql` and `012_additional_indexes.sql` (`IF NOT EXISTS`).

**B. Write `015_quiz_attempts_best_score.sql`:**

1. Dedupe, keeping the highest `score`, then latest `attempted_at`, then highest `id`:

```sql
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
```

2. `ALTER TABLE public.quiz_attempts ADD CONSTRAINT quiz_attempts_user_id_quiz_id_key UNIQUE (user_id, quiz_id);`  
   Use `IF NOT EXISTS` pattern: wrap in a `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;` if needed.
3. Do **not** change RLS to `FOR ALL`. Keep live split policies.

**C. Apply** with Supabase CLI against the linked prod project (or CI migration workflow if one exists). This repo has no apply script; use:

```bash
npx supabase db push
```

only after confirming the CLI will apply **pending** 014/015 and will **not** try to recreate 001–013 objects destructively. If `schema_migrations` already has 001–008, new files 014/015 are the ones that should apply.

**D. Verify** with the queries in §4.5.

### 4.4 Tests (this phase)

No app unit tests for SQL. Add a **runbook test file** so CI documents the invariant (does not connect to prod):

- `supabase/migrations/014_launch_reconcile.test.ts` — **skip** if too awkward. Prefer:
- `docs` is out of scope; instead add `src/lib/supabase/schema-invariants.test.ts` that **documents expected client behavior** (upsert conflict targets) as comments + a constant:

```ts
export const QUIZ_ATTEMPTS_ON_CONFLICT = "user_id,quiz_id";
```

Phase 6 will import that constant. In Phase 1, export the constant from `src/lib/supabase/schema.ts` (new file) so the migration comment and client cannot drift.

**New tests:**

- `src/lib/supabase/schema.test.ts` — asserts the exported conflict strings equal `"user_id,quiz_id"` and `"user_id,lesson_id"`.

**Playwright:** none.

### 4.5 Acceptance

- [ ] Live `pg_policies` has **no** `"Anyone can insert contact submissions"`.
- [ ] `anon` cannot INSERT into `contact_submissions` (PostgREST 401/403 with anon key).
- [ ] `public.delete_user` exists, `prosecdef = true`, `proconfig` includes `search_path=public`, EXECUTE not granted to `PUBLIC`/`anon`.
- [ ] `handle_new_user` has `search_path`, EXECUTE revoked from `anon`/`authenticated`/`PUBLIC`.
- [ ] New signup still creates a `profiles` row (trigger works).
- [ ] `daily_log` has an UPDATE policy; second upsert same UTC day succeeds.
- [ ] `quiz_attempts` unique `(user_id, quiz_id)` exists; duplicate count is 0.
- [ ] Indexes from 011/012 exist.
- [ ] Settings delete still **fails until Phase 1 is applied**; after apply, RPC exists (full UI path tested in Phase 9 e2e if auth available).
- [ ] `npm test` still green (constant test).

### 4.6 Rollback

```sql
-- Emergency only. Prefer revert migration 015 first (drop unique), then 014 pieces.
ALTER TABLE public.quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_user_id_quiz_id_key;
-- Recreating public INSERT is a security rollback — do not do it unless the site is down
-- and service_role is missing. Prefer adding the Netlify env var.
```

Git: revert the PR. Database: apply a new `016_revert_...` rather than `supabase db reset` on production.

**Warning:** Deduping quiz rows is not lossless. Snapshot `quiz_attempts` before 015 (`create table quiz_attempts_backup_20260827 as select * from quiz_attempts`).

---

## Phase 2 — Auth recovery (reset + confirm + locale)

**Goal:** Password reset and email confirmation work with current Supabase PKCE and OTP templates, and errors stay in the user's locale.

**Rationale:** Users cannot recover accounts. Spanish users get bounced to `/en`. Do not ship auth until this matches templates.

**Complexity:** Medium  
**Risk:** Medium (auth)  
**Dependencies:** None (parallel with Phase 1).

### 5.1 Scope

| File                                                           | How                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx` | Parse `code` from `window.location.search` first, then hash. Also handle `token_hash` + `type` if present (call `verifyOtp`). Show a dedicated i18n error if neither exists (`auth.errorInvalidResetLink`) instead of generic.                                                                                                |
| `src/app/[locale]/auth/confirm/route.ts`                       | If `code`, `exchangeCodeForSession`. Else if `token_hash` + `type`, `verifyOtp({ token_hash, type })` with `type` allowlisted (`signup`, `email`, `invite`, `magiclink`, `recovery`, `email_change`). Failure/rate-limit redirects: `/${locale}/auth/login?error=...`. Use `request.nextUrl.pathname` (drop `as unknown as`). |
| `src/app/[locale]/auth/callback/route.ts`                      | Same locale-prefixed error redirects. Same `request.nextUrl`.                                                                                                                                                                                                                                                                 |
| `src/lib/auth/parseAuthRedirect.ts`                            | **Create.** Shared helper: extract locale from pathname, allowlisted OTP types, `code` vs `token_hash`. Used by confirm + client reset.                                                                                                                                                                                       |
| `src/messages/en.json` / `es.json`                             | `auth.errorInvalidResetLink`, keep existing `errorGeneric`.                                                                                                                                                                                                                                                                   |
| `src/app/[locale]/auth/confirm/route.test.ts`                  | token_hash path; locale on redirects (`/es/auth/confirm` → `/es/auth/login?...`).                                                                                                                                                                                                                                             |
| `src/app/[locale]/auth/callback/route.test.ts`                 | locale on `auth_failed` and `rate_limited`.                                                                                                                                                                                                                                                                                   |

### 5.2 Step-by-step

1. Add `src/lib/auth/parseAuthRedirect.ts`:
   - `getLocaleFromPathname(pathname: string): "en" \| "es"` — first segment, default `"en"`.
   - `OTP_TYPES` const array + type guard.
   - `loginErrorUrl(origin, locale, errorCode)` → `${origin}/${locale}/auth/login?error=${errorCode}`.
2. `confirm/route.ts`:
   - Rate limit unchanged.
   - `const locale = getLocaleFromPathname(request.nextUrl.pathname)`.
   - `next` still `sanitizeRedirectPath(..., \`/${locale}/dashboard\`)`.
   - Branch: `code` → exchange; else `token_hash` + valid `type` → `verifyOtp`; else fail.
   - All redirects via `loginErrorUrl` or success `next`.
3. `callback/route.ts`: same locale helper; only `code` exchange (OAuth). Errors → `/${locale}/auth/login?error=auth_failed` or `rate_limited`.
4. `ResetPasswordClient.tsx` `useEffect`:
   ```
   const search = new URLSearchParams(window.location.search);
   const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
   const code = search.get("code") || hash.get("code");
   const token_hash = search.get("token_hash") || hash.get("token_hash");
   const type = search.get("type") || hash.get("type");
   ```
   - If `code`: `exchangeCodeForSession(code)`.
   - Else if `token_hash` and type guard: `verifyOtp({ token_hash, type })`.
   - Else: `setError(t("errorInvalidResetLink"))`.
5. Confirm Supabase email templates (dashboard) use site URL `https://<prod>/{locale}/auth/confirm` and recovery `.../auth/reset-password`. If templates still point at `/auth/v1/verify` only, document required dashboard edits in the PR (human step). Do not change templates from code.

### 5.3 Tests

**Vitest**

- `src/lib/auth/parseAuthRedirect.test.ts` — locale parse; OTP allowlist rejects `foo`.
- `src/app/[locale]/auth/reset-password/ResetPasswordClient.test.tsx` — **new**:
  - mock `useAuthFormState` supabase.
  - `jsdom` with `window.location` search `?code=abc` → `exchangeCodeForSession("abc")`.
  - hash-only `#code=xyz` still works (legacy).
  - empty → invalid-link error, no exchange.
  - `?token_hash=th&type=recovery` → `verifyOtp`.
- Update `confirm/route.test.ts`:
  - `http://localhost/es/auth/confirm` no code → location contains `/es/auth/login?error=confirmation_failed`.
  - `?token_hash=h&type=signup` calls `verifyOtp`, success redirects to next.
  - `?type=not-a-type` fails.
- Update `callback/route.test.ts` for `/es/auth/callback` error locale.

**Playwright** (`e2e/auth.spec.ts` additions):

- `/en/auth/reset-password` with no params shows invalid-link (or generic) alert, form not in a successful session state.
- `/es/auth/reset-password` page renders Spanish heading (`auth.resetPasswordTitle`).

Cannot click real email links in CI. Unit tests carry PKCE.

### 5.4 Acceptance

- [ ] Query-string `?code=` exchanges session; hash fallback still works.
- [ ] Confirm route accepts `token_hash` + allowlisted `type`.
- [ ] `/es/auth/confirm` failures land on `/es/auth/login?error=...`, not `/auth/login`.
- [ ] Same for callback rate-limit and `auth_failed`.
- [ ] No `as unknown as { nextUrl }` casts on those two routes.
- [ ] EN/ES keys added.

### 5.5 Rollback

`git revert` the PR. Supabase templates unchanged by this PR. No DB.

---

## Phase 3 — Privacy honesty + contact path

**Goal:** Privacy/terms match what the app actually does, contact submissions only succeed through `/api/contact` with a service-role key, and the form cannot double-post.

**Rationale:** A journalist can quote `privacy.collectBody` against the network tab. After Phase 1, the Next route is the only insert path — it must not 503.

**Complexity:** Low–medium  
**Risk:** Medium (legal copy)  
**Dependencies:** Phase 1 should be applied (or ship copy first, apply 1 immediately after). Env gate can merge before 1 but must not go to Netlify without the key if 1 is already live.

### 6.1 Scope

| File                                         | How                                                                                                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/messages/en.json` `privacy.*`           | Rewrite. See copy spec below.                                                                                                                        |
| `src/messages/es.json` `privacy.*`           | Matching Spanish.                                                                                                                                    |
| `src/messages/en.json` / `es.json` `terms.*` | If any sentence says data never leaves the device, fix. `terms.disclaimerBody` educational disclaimer can stay.                                      |
| `scripts/check-production-env.mjs`           | If `NETLIFY === "true"`, require non-empty `SUPABASE_SERVICE_ROLE_KEY` (not placeholder). **Do not** require it when `NETLIFY` is unset (GitHub CI). |
| `scripts/check-production-env.test.ts`       | Cases: CI+NETLIFY without key → exit 1; CI without NETLIFY → exit 0 with existing supabase public vars.                                              |
| `src/app/[locale]/contact/ContactClient.tsx` | `inFlight` ref; ignore submit if true; stay true until `finally`. Disable submit button while in flight.                                             |
| `src/app/api/contact/route.ts`               | Optional: generate/accept `Idempotency-Key` header (UUID). If adding, store in memory LRU only (no schema). Skip DB column. Minimum is client lock.  |
| `src/app/[locale]/privacy/page.tsx`          | If it inlines English, switch to messages (likely already uses `useTranslations("privacy")`).                                                        |

### 6.2 Privacy copy spec (implement exactly)

Replace `privacy.collectBody` and expand keys:

**Required keys (add if missing):**

- `privacy.collectBodyGuest` — Anonymous use: progress and preferences stay in the browser (`localStorage` / cookies). We do not create an account unless you sign up.
- `privacy.collectBodyAccount` — If you create an account, we store on our database (Supabase, United States): display name, email (Auth), lesson completion, quiz scores and answers, streaks, daily activity dates, and in-app notifications. This syncs progress across devices.
- `privacy.collectBodyContact` — If you use Contact, we store your name, email, subject, and message to respond. These messages are not linked to a learning account. Deleting your account does not delete contact messages you already sent.
- `privacy.collectBodyAnalytics` — We use Google Analytics for page views. The page URL can include lesson or article slugs (topics you opened), not your name.
- `privacy.controlBody` — Signed-in: Dashboard → Settings to delete your account (auth user + learning data). Guests: clear site data in the browser. You can export progress from Settings (if that UI exists — keep consistent with `progressExport`).
- `privacy.educationBody` — Keep educational; **remove** any implication that no health-related learning data is stored. Quiz answers are not medical records but are learning data about health topics.

`privacy.collectBody` may become a short intro + the new paragraphs rendered as separate `<p>` in the privacy page. Update `src/app/[locale]/privacy/page.tsx` to render the new keys.

**Do not claim HIPAA.** Site is educational, not a covered entity — do not newly claim HIPAA compliance.

### 6.3 Env gate steps

In `check-production-env.mjs`, after existing supabase public checks:

```js
if (process.env.NETLIFY === "true") {
  const sr = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!sr || sr === "placeholder_service_role_key") {
    console.error("SUPABASE_SERVICE_ROLE_KEY must be set for Netlify production/preview builds.");
    process.exit(1);
  }
}
```

Extend `SUPABASE_ENV_KEYS` in the test harness so leftover keys do not leak between cases.

### 6.4 Tests

- `scripts/check-production-env.test.ts` — NETLIFY + CI + public supabase vars, missing service role → status 1; GitHub-style CI without NETLIFY → 0.
- `src/app/[locale]/contact/ContactClient.test.tsx` — **new**: mock `fetch`; double-click submit → one POST.
- Existing `src/app/api/contact/route.test.ts` — still pass.

**Playwright:** `e2e/smoke.spec.ts` or `e2e/flows.spec.ts` — `/en/privacy` contains a sentence that data **is** stored when you have an account (assert a unique substring from the new copy). `/es/privacy` Spanish equivalent.

### 6.5 Acceptance

- [ ] No remaining string "never transmitted to our servers" / "nunca se transmiten a nuestros servidores".
- [ ] Privacy lists guest vs account vs contact vs analytics.
- [ ] Account deletion limitation for contact PII is stated.
- [ ] Netlify build without service role fails; GitHub CI build still passes.
- [ ] Contact form cannot fire two POSTs from double submit.
- [ ] After Phase 1: PostgREST anon INSERT fails; browser contact form still 200 with service role.

### 6.6 Rollback

Revert PR. If privacy copy already public, reverting restores the lie — only roll back if the new copy is factually wrong.

---

## Phase 4 — Clinical liability, contrast, 911 qualifier

**Goal:** Care guide is clearly educational, urgent-care text meets WCAG AA contrast, emergency dialer is visibly US-911, article catalog shows the medical disclaimer.

**Rationale:** Highest harm-to-people surface after auth/DB.

**Complexity:** Medium  
**Risk:** Medium (copy + a11y)  
**Dependencies:** None.

### 7.1 Scope

| File                                                                                                                                                       | How                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/globals.css`                                                                                                                                      | Light: `--color-on-secondary-container: #2a5245` (or darker if dark-mode pair also fails). Recheck dark-theme tokens in the same file.                        |
| `src/app/[locale]/tools/care-guide/CareGuideClient.tsx`                                                                                                    | Remove `/90` opacity on urgent-care body (`textColor`). Keep emergency card error tokens.                                                                     |
| `src/messages/en.json` / `es.json` `tools.homeCareBody`, `homeCareChecklist`, scenario bodies, `whenInDoubtBody`, `urgentCareBody`, `careGuideDescription` | Rewrite per copy spec.                                                                                                                                        |
| `src/messages/en.json` / `es.json` `disclaimer.emergencyCall`                                                                                              | Visible: include US 911. ES equivalent. `tools.emergencyShort` already says 911 — add "US" if missing.                                                        |
| `src/components/MedicalDisclaimer.tsx`                                                                                                                     | Visible link text uses updated `emergencyCall`. Optional small note under the button: `disclaimer.emergencyRegionNote`.                                       |
| `src/app/[locale]/articles/ArticlesClient.tsx`                                                                                                             | Render `<MedicalDisclaimer />` at the bottom of the catalog (same as `LearnClient`).                                                                          |
| `src/components/MedicalDisclaimer.test.tsx`                                                                                                                | Assert 911 / US in emergency variant.                                                                                                                         |
| `src/app/[locale]/tools/care-guide/CareGuideClient.test.tsx`                                                                                               | **New.** Renders heading; does **not** include leftover "over-the-counter medicine" / "medicinas de venta libre" as a directive if those strings are removed. |

### 7.2 Care-guide copy spec

Voice: **compare typical care settings** so people can talk with a clinician. Forbidden: instructing the reader to take a drug, skip the ER, or treat this as a diagnosis.

Examples of direction:

- `homeCareBody`: "Home care often means rest and fluids while mild symptoms improve. A clinician or pharmacist can advise whether an over-the-counter option is appropriate for you."
- Sore throat scenario: "People often start by contacting their usual clinic or nurse line. This page cannot tell you what you have."
- `whenInDoubtBody`: "If you think you may be having an emergency, use local emergency services. In the United States that is 911. This site cannot triage you."

Keep the four cards (home / primary / urgent / emergency) as **definitions**, not a decision tree that outputs an action.

### 7.3 Contrast steps

1. Change `--color-on-secondary-container` in `:root` to `#2a5245`.
2. Check `.dark` / `[data-theme="dark"]` pair in `globals.css`; if urgent card uses the same tokens, verify ≥4.5:1.
3. Remove `text-on-secondary-container/90` in `CareGuideClient.tsx`.
4. Recompute: `#2a5245` on `#c0ecda` should exceed 4.5:1. If not, darken further.

### 7.4 Tests

- `CareGuideClient.test.tsx` — render with `next-intl` provider pattern from `MedicalDisclaimer.test.tsx`.
- `MedicalDisclaimer.test.tsx` — emergency variant name matches `/911/`.
- Update any snapshot/string tests that expected old homeCareBody.

**Playwright:** `e2e/visual.spec.ts` or new `e2e/care-guide.spec.ts`:

- `/en/tools/care-guide` shows disclaimer + 911.
- `/en/articles` shows educational disclaimer text.
- `/es/tools/care-guide` Spanish.

### 7.5 Acceptance

- [ ] No copy tells the user to take OTC medicine as an instruction.
- [ ] Urgent-care body contrast ≥ 4.5:1 (document the pair in the PR).
- [ ] Visible emergency CTA includes US 911.
- [ ] Articles index includes `MedicalDisclaimer`.
- [ ] EN/ES parity.

### 7.6 Rollback

Revert PR. Tokens and copy only.

---

## Phase 5 — Guest progress unification + login migration

**Goal:** Guest completions survive tab close and migrate to Supabase on signup/login; UI refetches after migrate; malformed storage cannot crash upserts.

**Rationale:** Dual `sessionStorage` vs `localStorage` drops history. Parallel fetch vs migrate shows empty dashboard.

**Complexity:** Medium  
**Risk:** Medium (data)  
**Dependencies:** None. Works with Phase 1 unique for quiz upsert during migrate (guest migrate already uses `onConflict: "user_id,quiz_id"`).

### 8.1 Scope

| File                                            | How                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/guestProgress.ts`                      | Canonical store: `localStorage`. Keys: reuse `STORAGE_KEYS.completedLessons` and a dedicated quiz guest list **or** keep prefix `hmc_guest_*` but in **localStorage**. **Chosen approach:** write guest completions into the same `STORAGE_KEYS` AppProviders already uses. Guest quiz attempts: merge into `STORAGE_KEYS.quizScores` shape used by AppProviders. On read, if new keys empty, **once** copy from `sessionStorage` `hmc_guest_*` then delete session keys. Validate arrays with type guards (string lesson IDs; quiz objects with quizId/score/maxScore numbers). |
| `src/components/AppProviders.tsx`               | Keep writing `STORAGE_KEYS`. Ensure `markLessonComplete` / `recordQuizScore` stay the guest UI source. Avoid double-write bugs: `guestProgress.markLessonComplete` can call the same storage helpers as AppProviders **or** AppProviders remains writer and guestProgress only reads for migrate. **Chosen:** AppProviders remains the writer for UI state. `guestProgress.markLessonComplete` also writes `STORAGE_KEYS.completedLessons` (same array merge) so migrate works even if a code path only called guest helpers.                                                    |
| `src/hooks/useProgress/guestMigration.ts`       | `.then/.catch/.finally`. On throw, `setIsMigrationLoading(false)`. On `result.ok` or empty guest, `setMigrated(true)`. Export `migrationGeneration` or callback `onMigrated` to refetch.                                                                                                                                                                                                                                                                                                                                                                                         |
| `src/hooks/useProgress.ts`                      | Pass `onMigrated` into `useSupabaseProgress` **or** return `refreshProgress` from supabaseProgress and call it when migration completes. **Do not** fetch progress until migration finished when guest data exists. Algorithm: if user && guest has data → migrate first → then fetch. If no guest data → fetch immediately.                                                                                                                                                                                                                                                     |
| `src/hooks/useProgress/supabaseProgress.ts`     | Accept `enabled: boolean` or `refreshToken`. When `enabled` goes true, fetch. Expose `refetch`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `src/lib/guestProgress.test.ts`                 | localStorage tests; session fallback; schema guard rejects `{foo:1}`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `src/hooks/useProgress/guestMigration.test.tsx` | catch path; refetch order (mock).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

### 8.2 Step-by-step

1. Add `function isStringArray(x: unknown): x is string[]`.
2. Add quiz attempt guard.
3. `getStorage()` → `localStorage` with try/catch.
4. `migrateLegacySessionGuest()`: if local guest keys empty, read `sessionStorage` `hmc_guest_completedLessons` / `hmc_guest_quizAttempts`, parse safely, write local, `sessionStorage.removeItem`.
5. `getGuestProgress()`: also union `JSON.parse(localStorage[STORAGE_KEYS.completedLessons])` so AppProviders-only guests migrate.
6. `migrateGuestProgressToSupabase`: unchanged upsert targets; still `clearGuestProgress` only if `errors.length === 0`. Clearing must remove **both** `hmc_guest_*` and must **not** wipe preferences. After successful migrate, do not delete `hmc-completed-lessons` until supabase fetch confirms (or delete guest prefix only). **Do not** clear AppProviders keys before refetch or the UI will flash empty for guests who stay logged in… actually after login, UI uses supabase state. Clearing local completed lessons after successful migrate is OK if supabase fetch follows. Order: migrate → refetch → then `clearGuestProgress`.
7. Wire `useProgress`: `const { isMigrationLoading, migrated } = useGuestMigration(...)`. `useSupabaseProgress(user, supabase, { fetchWhen: !isMigrationLoading && !!user })`. When `migrated` flips true, `refetch()`.
8. `isLoading` remains `isMigrationLoading \|\| authLoading` plus fetch in-flight if you add `isFetchLoading`.

### 8.3 Tests

- `guestProgress.test.ts` — existing session tests updated to localStorage; new test: data only in `hmc-completed-lessons` still migrates; malformed JSON → `[]`.
- `guestMigration.test.tsx` — migrate reject → loading false; after resolve refetch called.
- `useProgress.test.tsx` — if it asserts parallel fetch, update.

**Playwright:** hard without real auth. Skip live migrate e2e. Optional mock-auth flow if `e2e` already has it (`e2e/dashboard.spec.ts`) — do not invent a new auth stack.

### 8.4 Acceptance

- [ ] Complete a lesson as guest, close tab, reopen, signup/login (manual or mock) migrates completions.
- [ ] `sessionStorage`-only legacy data still migrates once.
- [ ] Malformed JSON does not throw; migrate skips bad entries.
- [ ] After login with guest data, completed IDs appear without requiring a second mutation.
- [ ] Failed migrate does not clear storage; `isMigrationLoading` does not stick true.

### 8.5 Rollback

Revert PR. Users who already wrote the new keys keep `hmc-completed-lessons` (pre-existing).

---

## Phase 6 — Quiz persist integrity

**Goal:** Authenticated quiz save upserts best score, rolls back optimistic UI on error, dashboard stats match lesson UI (no retake inflation).

**Rationale:** Phase 1 unique makes `.insert()` on retake fail. Optimistic score without rollback is a lie.

**Complexity:** Medium  
**Risk:** Medium  
**Dependencies:** **Phase 1 applied to production** before this PR goes live. Can merge to `main` after 015 is applied.

### 9.1 Scope

| File                                      | How                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/hooks/useProgress/mutations.ts`      | `saveQuizAttempt`: keep previous attempts snapshot; on error restore and toast; use `.upsert(..., { onConflict: "user_id,quiz_id" })` with `ignoreDuplicates: false`. If new score < existing DB score, still upsert only if we send `max(old,new)` — client already Math.max in setState; send the **best** score in the payload. Include `answers` from the **best** attempt (if new score wins, new answers; if old wins, do not overwrite answers — requires select-before-upsert or `score` compare in a small helper). **Minimum:** upsert the new row only when `score >= existing` in memory; if in-memory existing is higher, skip network write but do not error. |
| `src/lib/supabase/schema.ts`              | Use `QUIZ_ATTEMPTS_ON_CONFLICT` from Phase 1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `src/hooks/useProgress/mutations.test.ts` | Error path restores previous; upsert called not insert; lower score does not clobber (if implemented).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/lib/dashboard/progress.ts`           | `getUserProgressSummary`: unique by `quiz_id` keeping max score before counting passed / average. `totalQuizzesAttempted` = unique quiz ids, not row count.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `src/lib/dashboard/progress.test.ts`      | Fixture with two rows same quiz_id (if mock returns dupes) → one attempt.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `src/lib/guestProgress.ts`                | Already upserts; confirm `onConflict` string matches.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

### 9.2 Step-by-step

1. In `saveQuizAttempt` authenticated branch:
   - `const prev =` capture via functional update or ref for rollback.
   - Compute `bestScore = existing ? Math.max(existing.score, score) : score`.
   - If `existing && score < existing.score`, skip insert/upsert (optional toast none).
   - Else optimistic set then `upsert({ user_id, quiz_id, score: bestScore, max_score, passed, answers })`.
   - On error: `setSupabaseQuizAttempts(prev)` + toast `quizSaveError`.
2. Dashboard summary: build `Map<quiz_id, best>` then aggregate.

### 9.3 Tests

- `mutations.test.ts` — already documents no revert; **change expectation** to revert on error.
- `progress.test.ts` — duplicate quiz rows.

**Playwright:** none required (auth).

### 9.4 Acceptance

- [ ] No `.insert()` on `quiz_attempts` in `src/` except tests/mocks.
- [ ] Retake with unique constraint does not toast save error when score updates or is lower.
- [ ] Failed network restores previous best score in UI.
- [ ] Dashboard average/passed counts unique quizzes.

### 9.5 Rollback

Revert PR. If 015 unique is live and this client revert restores `.insert()`, **retakes break**. Rollback of Phase 6 is only safe with Phase 6 kept or unique dropped. **Do not revert 6 while 15 unique remains** without a hotfix.

---

## Phase 7 — Achievements, streaks order, i18n gamification

**Goal:** Streak/path/beginner/glossary achievements can fire; toasts and notifications follow UI locale; daily log runs before streak check.

**Rationale:** Five catalog badges are dead. Spanish users get English bells.

**Complexity:** Medium  
**Risk:** Low–medium  
**Dependencies:** Phase 1 (`daily_log` UPDATE) so the calendar is not silently empty.

### 10.1 Scope

| File                                        | How                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/hooks/useProgress/sideEffects.ts`      | Order: `updateDailyLog` → `updateStreak` (capture return) → `checkAndAwardAchievements` with full context → path close-to-complete notifications. Toast via `getLocalizedAchievement(id, locale)`. Path "Almost there" strings from messages.                                                                                                                                                                                                                                                                                                                                      |
| `src/lib/achievements.ts`                   | Notification title/body from `getLocalizedAchievement`. Keep `ACHIEVEMENTS` ids/icons.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `src/lib/streaks.ts`                        | Milestone notification strings from messages (pass locale into `updateStreak` **or** return milestone ids and let sideEffects notify). Prefer return value + sideEffects for i18n.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `src/messages/en.json` / `es.json`          | `progress.achievementUnlocked` with `{title}`; `progress.pathAlmostThere` with `{title}`; streak milestone keys if hardcoded English exists in `streaks.ts` (~line 100).                                                                                                                                                                                                                                                                                                                                                                                                           |
| `src/hooks/useProgress/sideEffects` tests   | If none, `src/hooks/useProgress/sideEffects.test.ts` **new**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/lib/achievements.test.ts`              | Pass `currentStreak: 3` → three-day id when not earned.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `src/components/mdx/InlineGlossaryTerm.tsx` | On open, increment `localStorage` `hmc-glossary-lookups` (count unique term ids, cap 20). Callback or `checkAndAwardAchievements` if user signed in — **must not** block popover. If wiring auth here is too heavy, increment storage and award on next lesson complete (pass `glossaryTermsLookedUp` from storage). **Chosen:** read count in `handleLessonCompletionSideEffects` from localStorage; also try award on popover open via optional `useProgress` would create a hook-in-mdx cycle. **Stay with lesson-complete + quiz-complete passing `Number(localStorage...)`.** |
| `src/lib/glossaryLookups.ts`                | **New.** get/set unique term ids.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Beginner complete: in sideEffects, `getAllLessons(locale).filter(l => l.level==="beginner")` vs completed set. **Watch PERF-01:** this runs on client after complete. Prefer importing `getAllLessons` only if that module is already in the lesson client graph; otherwise pass `beginnerIds` from `LessonPageClient` through mark complete. **Chosen for 4 days:** dynamic `import("@/lib/lessons/loadLessons")` inside sideEffects after complete (not on initial paint). Phase 14 will split locales.

Path complete: after adding lesson, if any path's lessons all ⊆ completed set, `pathCompleted: true`.

### 10.2 Tests

- `achievements.test.ts` — streak/path/beginner/glossary conditions.
- `sideEffects.test.ts` — mock supabase; assert `updateStreak` called before `checkAndAwardAchievements`; toast not English `"Achievement unlocked:"` hardcoded.
- `glossaryLookups.test.ts`.

**Playwright:** none.

### 10.3 Acceptance

- [ ] Completing lessons on consecutive UTC days can award `three-day-streak` (logic unit-tested; e2e optional).
- [ ] Completing last lesson of a path awards `first-path-complete`.
- [ ] Completing all beginner lessons awards `all-beginner`.
- [ ] 10 unique glossary opens then a lesson complete awards `glossary-reader`.
- [ ] Toasts/notifications use ES when locale is `es`.
- [ ] Side-effect order is log → streak → achievements.

### 10.4 Rollback

Revert PR. No schema.

---

## Phase 8 — Citations, trust chrome, content validation

**Goal:** Articles and lessons show sources + reviewer near the title; catalogs show a trust line; prebuild fails if sources/reviewedBy missing.

**Rationale:** Clinical credibility. MED-01 is P1.

**Complexity:** Medium  
**Risk:** Low  
**Dependencies:** None. Mini-specs §10.1–10.2.

### 11.1 Scope

| File                                                                       | How                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/content/ClinicalCitationBlock.tsx`                         | **New.** Props: `sources?: string[]`, `reviewedBy?: string`, `lastReviewed?: string \| null`, `compact?: boolean`. Renders nothing if all empty. Compact: one line under H1. Full: list like `LessonNotes`.                         |
| `src/components/content/TrustBanner.tsx`                                   | **New.** i18n `trust.banner` — "Clinically reviewed health education — plain language. Not medical advice." Used on home hero and optionally learn/articles headers.                                                                |
| `src/components/Hero.tsx`                                                  | Place TrustBanner above H1 (below existing eyebrow or replace eyebrow if duplicate).                                                                                                                                                |
| `src/components/lesson/LessonHeader.tsx`                                   | After H1, compact citation (`reviewedBy`, sources join with `/`, date).                                                                                                                                                             |
| `src/components/lesson/LessonNotes.tsx`                                    | Also show `reviewedBy`. Keep bottom sources list (OK to duplicate compact + full; if duplicate feels noisy, compact in header + sources only in notes). **Chosen:** compact in header; notes keep full sources + reviewedBy + date. |
| `src/app/[locale]/articles/[slug]/ArticlePageClient.tsx`                   | Compact under title chips; full `ClinicalCitationBlock` after article body (before share row).                                                                                                                                      |
| `src/components/PageHeader.tsx`                                            | Optional `trust?: boolean` slot — use on learn/articles/tools index pages.                                                                                                                                                          |
| `src/app/[locale]/learn/page.tsx` / `articles/page.tsx` / `tools/page.tsx` | Pass trust slot or mount TrustBanner.                                                                                                                                                                                               |
| `src/messages/en.json` / `es.json`                                         | `trust.banner`, `learn.reviewedBy`, `articles.sources`, `articles.reviewedBy` (if missing).                                                                                                                                         |
| `scripts/validate-content.ts`                                              | Lessons + articles: `sources` array length ≥ 1; `reviewedBy` non-empty string. Fail build.                                                                                                                                          |
| `scripts/validate-content.test.ts`                                         | Assert current MDX corpus passes (will fail if any file lacks sources — **fix MDX** in this PR, do not weaken the assertion).                                                                                                       |
| `content/articles/{en,es}/*.mdx` / `content/lessons/{en,es}/*.mdx`         | Only if validator finds gaps.                                                                                                                                                                                                       |

### 11.2 Steps

1. Build `ClinicalCitationBlock` with `useTranslations("learn")` or `common` keys shared.
2. Wire header + article.
3. Run `npm run content:validate` — fix any MDX frontmatter.
4. `npm run content:bundle` if MDX changed.
5. TrustBanner on home + three catalogs.

### 11.3 Tests

- `src/components/content/ClinicalCitationBlock.test.tsx`
- `src/app/[locale]/articles/[slug]/ArticlePageClient.test.tsx` — **new**: sources text visible (pass fixture article with sources).
- `LessonHeader` test if exists; else add `LessonHeader.test.tsx` for compact line.
- `scripts/validate-content.test.ts` — keep quiz stubs; add sources presence via real parser on one known article.

**Playwright:** `e2e/flows.spec.ts` — `/en/articles/understanding-your-eob` (or actual slug) contains "CDC" or fixture source string from bundle. `/en/learn/reading-nutrition-labels` contains sources near top.

### 11.4 Acceptance

- [ ] Article reader shows `sources` and `reviewedBy`, not only `lastReviewed`.
- [ ] Lesson header shows compact review/source line.
- [ ] Home shows trust banner.
- [ ] `content:validate` fails if sources or reviewedBy stripped from an MDX file.
- [ ] EN/ES.

### 11.5 Rollback

Revert PR. If MDX was filled in, keep MDX (harmless).

---

## Phase 9 — Auth UX leftovers + auth unit tests

**Goal:** Signup does not enumerate emails; expired sessions get a clear message; critical auth forms have unit tests.

**Complexity:** Medium  
**Risk:** Low  
**Dependencies:** Phase 2 (reset client exists to test).

### 12.1 Scope

| File                                                     | How                                                                                                                                                                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/auth/signup/SignupForm.tsx`            | Any `already registered` / similar → `t("errorGeneric")` (same as login). Do not use `errorEmailInUse` for API errors. Keep client-side "email already in form" only if it is local validation, not server. |
| `src/messages`                                           | `errorEmailInUse` may remain unused or only for identical-email confirm field — do not map server errors to it.                                                                                             |
| `src/hooks/useProgress/mutations.ts`                     | If error code/message looks like JWT/401, toast `progress.sessionExpired` instead of `saveError`.                                                                                                           |
| `src/messages`                                           | `progress.sessionExpired` EN/ES.                                                                                                                                                                            |
| `src/lib/auth/isAuthSessionError.ts`                     | **New.** Detect supabase auth errors.                                                                                                                                                                       |
| Auth forms tests                                         | See list below.                                                                                                                                                                                             |
| `src/app/[locale]/dashboard/settings/SettingsClient.tsx` | After Phase 1, delete works. Add unit test mocking `rpc("delete_user")`. If error, toast. Document JWT: `signOut()` after success (already).                                                                |

### 12.2 Tests (filenames required)

**Vitest (new unless noted):**

- `src/app/[locale]/auth/signup/SignupForm.test.tsx` — server "already registered" → generic error, not in-use string.
- `src/app/[locale]/auth/login/LoginForm.test.tsx` — validation; sanitize redirect if present.
- `src/app/[locale]/auth/forgot-password/ForgotPasswordForm.test.tsx` — success heading focus / status.
- `src/app/[locale]/dashboard/settings/SettingsClient.test.tsx` — rpc failure toast; success calls signOut.
- `src/lib/auth/isAuthSessionError.test.ts`

Phase 2 already added `ResetPasswordClient.test.tsx`.

**Playwright:** extend `e2e/auth.spec.ts` — signup invalid email shows error; do **not** assert in-use copy.

### 12.3 Acceptance

- [ ] Signup API duplicate email looks like generic failure.
- [ ] Completing a lesson with expired JWT shows session-expired copy (unit).
- [ ] Listed unit tests exist and pass.
- [ ] Settings delete unit-tested.

### 12.4 Rollback

Revert PR.

---

## Phase 10 — Header, 404, ErrorBoundary, Display control

**Goal:** 1440px desktops see primary nav; 404 is branded and tappable; screen readers do not hear "Display" twice; crash fallback is i18n.

**Complexity:** Medium  
**Risk:** Low–medium (header is global)  
**Dependencies:** None.

### 13.1 Scope

| File                                            | How                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/Header.tsx`                     | Replace nav `2xl:flex` with `lg:flex` (line ~124). Hamburger `2xl:hidden` → `lg:hidden` (~199, ~218, ~250). Auth button `2xl:` compactness: keep `lg:` as the desktop split so 1024–1536 is desktop nav, not icon-only chaos. **Rule:** `< lg` (1024) = drawer; `lg+` = inline nav. Re-read all `2xl:` in this file and convert nav-visibility ones. Do not convert unrelated 2xl padding without checking. |
| `src/components/Header.test.tsx`                | Assert desktop nav class includes `lg:flex` and hamburger `lg:hidden`.                                                                                                                                                                                                                                                                                                                                      |
| `src/components/AccessibilityControls.tsx`      | Single visible or sr-only label. Trigger: `aria-label={t("display")}` and **one** inner span. Remove the pair `hidden 2xl:inline` + `sr-only 2xl:hidden`.                                                                                                                                                                                                                                                   |
| `src/components/AccessibilityControls.test.tsx` | `getAllByText` display length 1 for accessible name (or `getByRole('button', {name})` count 1).                                                                                                                                                                                                                                                                                                             |
| `src/app/not-found.tsx`                         | Import global stylesheet and fonts used by root layout (`src/app/globals.css`, font variables from `src/app/fonts.ts` if needed). Wrap buttons with `size` via `getButtonClasses` adding `min-h-12 px-6`. This file is a **full html/body** (cannot use locale layout). Duplicate minimum tokens so buttons are not 18px tall. Optional: link to `/en` `/es` already exists — enlarge.                      |
| `src/app/[locale]/not-found.tsx`                | Use `ButtonLink` `size` large if prop exists; ensure `min-h-12`. Add secondary link to `/learn` and search hint text from messages `errors.searchHint`.                                                                                                                                                                                                                                                     |
| `src/components/ErrorBoundary.tsx`              | Cannot use `useTranslations` in class component. Pass strings via props from a wrapper `ErrorBoundaryI18n` **new** client component using `useTranslations("errors")`, or default English **and** Spanish both on the fallback (bilingual like root 404). **Chosen:** bilingual fallback (EN + ES paragraphs) + `Try again` / `Intentar de nuevo` so it works without locale provider.                      |
| `src/components/OnboardingDialog.tsx`           | `h2` from `onboarding.title` message, not hardcoded `"Health Made Clear"`. `lockBodyScroll: true` if that option exists on the overlay hook; else document skip.                                                                                                                                                                                                                                            |
| `src/messages`                                  | `onboarding.title`, `errors.tryAgain`, `errors.crashBody`.                                                                                                                                                                                                                                                                                                                                                  |

### 13.2 Tests

- Header / AccessibilityControls as above.
- `src/app/[locale]/not-found.test.tsx` if missing — go-home button min size via class.
- `OnboardingDialog.test.tsx` — title from mock messages.

**Playwright:** `e2e/visual.spec.ts` — viewport 1440×900 `/en` — `getByRole('navigation')` in header visible (not only drawer). `/en/this-page-does-not-exist` — home button visible, height ≥ 44 (bounding box).

### 13.3 Acceptance

- [ ] 1440px: Learn/Articles/Tools/etc. inline; hamburger hidden.
- [ ] 390px: hamburger visible; drawer `min-h-11` close control (if still 36px, bump in this phase — `min-h-11 min-w-11`).
- [ ] Display button accessible name not duplicated.
- [ ] Root and locale 404 use padded buttons.
- [ ] ErrorBoundary not English-only.

### 13.4 Rollback

Revert PR. Header is the risky file — visual-regression via Playwright.

---

## Phase 11 — Touch targets, glossary A-Z, inline terms

**Goal:** Footer/legal/drawer/forms meet 44px; glossary A-Z is a horizontal snap row on small screens; inline glossary terms are easier to hit.

**Complexity:** Medium  
**Risk:** Low  
**Dependencies:** Phase 10 (drawer close size can land here if not done).

### 14.1 Scope

| File                                                              | How                                                                                                                                                                                                |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/Footer.tsx`                                       | Platform + legal `Link` classes: `inline-flex min-h-11 items-center py-2.5`.                                                                                                                       |
| `src/components/Footer.test.tsx`                                  | class includes `min-h-11`.                                                                                                                                                                         |
| `src/app/[locale]/terms/page.tsx`                                 | Jump links `min-h-11 py-2.5`.                                                                                                                                                                      |
| `src/components/ui/Input.tsx`                                     | Input element `min-h-12 text-base` (16px) to stop iOS zoom.                                                                                                                                        |
| `src/app/[locale]/contact/ContactClient.tsx`                      | If it uses raw inputs, switch to `Input` or same min-height.                                                                                                                                       |
| `src/components/Header.tsx`                                       | Drawer close already `min-h-11`? Confirm; bump to 44 if 36.                                                                                                                                        |
| `src/app/[locale]/glossary/GlossaryClient.tsx`                    | Mobile `< sm`: `flex flex-nowrap overflow-x-auto snap-x snap-mandatory` + `scrollbar-none`; each letter `snap-center min-h-11 min-w-11 shrink-0`. Desktop can keep wrap. `showAlphabet` unchanged. |
| `src/app/[locale]/glossary/GlossaryClient.test.tsx`               | if missing, add **new** for letter buttons.                                                                                                                                                        |
| `src/components/mdx/InlineGlossaryTerm.tsx`                       | Trigger: `relative` + `after:absolute after:-inset-y-1.5 after:-inset-x-1`; parent paragraph `leading-[1.75]` may live in `MarkdownRenderer` / `prose-hmc`.                                        |
| `src/components/mdx/InlineGlossaryTerm.test.tsx`                  | exists — assert expander class.                                                                                                                                                                    |
| `src/app/[locale]/tools/visit-checklist/VisitChecklistClient.tsx` | Verify label wrap. Set checkbox `h-6 w-6` and row `min-h-12`. If already good, only checkbox size.                                                                                                 |
| `src/app/[locale]/learn/LearnClient.tsx`                          | Filter pills `min-h-11 px-4 py-2.5 border border-outline/40`.                                                                                                                                      |

### 14.2 Tests

- Footer, GlossaryClient, InlineGlossaryTerm, VisitChecklistClient (existing), LearnClient if tests exist.

**Playwright:** `e2e/visual.spec.ts` mobile 390:

- Footer About link box height ≥ 44.
- Glossary: letter row `overflow-x` (evaluate computed style) or screenshot.
- Learn filter pill height ≥ 44.

### 14.3 Acceptance

- [ ] Footer links ≥ 44px tall.
- [ ] Terms TOC links ≥ 44px.
- [ ] Inputs ≥ 48px / 16px font.
- [ ] Glossary A-Z does not wrap into a 26-button grid on 390px.
- [ ] Inline terms have expanded hit area.
- [ ] Checklist rows full-label tappable.

### 14.4 Rollback

Revert PR.

---

## Phase 12 — Search UX/a11y + visit planner i18n/focus

**Goal:** Search announces counts, groups by type, shows index loading; planner persists IDs not translations; step changes move focus; summary has contrast.

**Complexity:** Medium–high (planner storage migration)  
**Risk:** Medium  
**Dependencies:** None.

### 15.1 Scope

| File                                                                       | How                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/SearchDialog.tsx`                                          | `indexStatus: "loading" \| "ready" \| "error"`. While loading, `aria-busy` and status text `search.loadingIndex`. Do not show "no results" when `entries.length===0 && query==="" && loading`.                       |
| `src/components/search/SearchDialogContent.tsx`                            | Group `results` by `type` order: lesson, path, article, glossary, tool. Section headers `search.groupLessons` etc. with counts. Visually hidden `role="status" aria-live="polite"` `{count} {search.resultsFound}`.  |
| `src/messages`                                                             | `search.loadingIndex`, `search.resultsFound`, group labels (some `typeLesson` exist — reuse).                                                                                                                        |
| `src/types/visitPlanner.ts`                                                | `selectedQuestions` remains `string[]` but values are ids `new-symptom:0`.                                                                                                                                           |
| `src/app/[locale]/tools/visit-planner/useVisitPlanner.ts`                  | Persist ids. Hydrate: if value matches `/^(new-symptom\|medication\|followup):\d+$/` use as-is; else map old locale text → id via provided `questionCatalog`; else drop. Custom questions unchanged.                 |
| `src/app/[locale]/tools/visit-planner/VisitPlannerClient.tsx`              | Build catalog `{ id, text }[]` from `t.raw("plannerQuestions")` with index ids. Pass texts to step 2 by resolving ids. `useRef` on step `<h2 tabIndex={-1}>`; `useEffect` on `step` → `headingRef.current?.focus()`. |
| `src/app/[locale]/tools/visit-planner/components/Step2SelectQuestions.tsx` | Toggle by id.                                                                                                                                                                                                        |
| `src/app/[locale]/tools/visit-planner/components/Step3Review.tsx`          | Summary container `border-2 border-primary/20 bg-surface-container-lowest p-6 shadow-elevation-2`. Resolve ids to current locale text.                                                                               |
| `src/app/[locale]/tools/visit-planner/useVisitPlanner.test.ts`             | ID persist; EN strings in storage migrate when catalog passed.                                                                                                                                                       |
| `src/app/[locale]/tools/visit-planner/VisitPlannerClient.test.tsx`         | **New.** Step 1→2; mock focus.                                                                                                                                                                                       |
| `src/components/search/SearchDialogContent.test.tsx`                       | Group headers; live region.                                                                                                                                                                                          |

### 15.2 Planner ID scheme

`{visitType}:{zeroBasedIndex}` matching array order in `en.json` / `es.json` (must stay same length/order — already locale-parity).

Default selected (currently first two texts of new-symptom) → `["new-symptom:0","new-symptom:1"]`.

### 15.3 Tests

Listed above.

**Playwright:** `e2e/flows.spec.ts` or `e2e/polish.spec.ts`:

- Open search (button), type `eob`, status region eventually matches `/\d+/`.
- `/en/tools/visit-planner` — click next, focused element is step heading (`document.activeElement` tag/role).

### 15.4 Acceptance

- [ ] Search loading ≠ empty miss.
- [ ] Results grouped; SR count announced.
- [ ] Switch locale after saving planner: questions display Spanish (or EN) from ids, not mixed.
- [ ] Old localStorage text values migrate or drop safely.
- [ ] Step change focuses heading.
- [ ] Step 3 summary visually separated.

### 15.5 Rollback

Revert PR. Users with new id format in `hmc-visit-planner`: old code would show ids as labels — **forward-only**. If reverting, add a one-line parser in the old hook or accept reset. Prefer not to revert after users save ids.

---

## Phase 13 — Reading UX (hero, articles TOC, quiz CLS, cards, paths)

**Goal:** Hero CTAs above the fold on 1440; article line length ~65ch with desktop TOC; quiz Next button does not jump; learn cards/path mobile readable.

**Complexity:** Medium  
**Risk:** Low  
**Dependencies:** Phase 8 PageHeader/trust may already change home — re-check fold.

### 16.1 Scope

| File                                                                    | How                                                                                                                                                                                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/Hero.tsx`                                               | H1 `text-[clamp(2.25rem,3.5vw+1rem,3.5rem)] leading-[1.1] mb-4` instead of `clamp(3rem,7vw,5.6rem) leading-[0.95]`.                                                                                            |
| `src/components/Hero.test.tsx`                                          | class contains new clamp.                                                                                                                                                                                      |
| `src/app/[locale]/articles/[slug]/ArticlePageClient.tsx`                | Body `max-w-prose` (~65ch) `leading-[1.75]`. Desktop `lg:` grid: sticky TOC `w-60` from `article.content.sections` titles, `position: sticky top-24`. TOC links `#section-slug`. Add `id` on each `<section>`. |
| `src/lib/slugify.ts`                                                    | Reuse if exists; else small slug helper.                                                                                                                                                                       |
| `src/components/quiz/QuizFeedback.tsx`                                  | Always render wrapper `min-h-[140px]`. Inner alert only when `showResult`.                                                                                                                                     |
| `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx`                     | Sticky action bar optional; min-height on feedback is enough.                                                                                                                                                  |
| `src/components/learn/LessonCard.tsx` / `ResourceCard`                  | Title `text-title-md line-clamp-2`; grid gap on parent `LearnClient` `gap-6`.                                                                                                                                  |
| `src/app/[locale]/learn/LearnClient.tsx`                                | `gap-6` on card grids.                                                                                                                                                                                         |
| `src/app/[locale]/learning-paths/[pathId]/LearningPathDetailClient.tsx` | `< sm`: stacked card + `Step X of Y` badge instead of cramped horizontal milestone.                                                                                                                            |
| `src/components/quiz/QuizFeedback.test.tsx`                             | **new** if missing — wrapper always in document.                                                                                                                                                               |
| `src/app/[locale]/learn/[slug]/quiz/QuizClient.test.tsx`                | **new** — light: renders question title from fixture (heavy supabase mocked).                                                                                                                                  |

### 16.2 Tests

As table.

**Playwright:** 1440 `/en` — primary CTA `Start learning` bounding box `y + height < 900`. Article `/en/articles/understanding-your-eob` — TOC visible at lg; paragraph max width ≤ 720px (evaluate). Quiz: optional screenshot stability skip.

### 16.3 Acceptance

- [ ] Hero H1 ≤ 56px at 1440.
- [ ] Article measure ~65ch; TOC on desktop.
- [ ] Quiz feedback slot reserved.
- [ ] Lesson card titles clamp; filters from Phase 11.
- [ ] Path detail usable at 390.

### 16.4 Rollback

Revert PR.

---

## Phase 14 — Locale content code-splitting

**Goal:** Client JS for a given locale does not parse the other locale’s lesson/quiz/path/glossary bundles.

**Rationale:** ~860KB+ uncompressed dual MDX on mobile TBT.

**Complexity:** High  
**Risk:** High (SSG/import graph)  
**Dependencies:** Prefer after Phases 1–13 so we are not debugging auth+bundles together. **Ship morning of Day 4.**

### 17.1 Scope

| File                                                                                              | How                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/lessons/loadLessons.ts`                                                                  | Mirror `loadArticlesForLocale`: `switch (locale)` dynamic `import("@/data/lessonBundles.en")`. Keep sync `getAllLessons` **only if** still required by server components — **server can keep sync import of one locale via async pages**. Convert callers that run on the **client** to async/props. **Preferred pattern (already used by articles catalog):** server page loads locale bundle, passes props to client. Hunt client imports of `getAllLessons` / `lessonBundles` / `getAllQuizzes` / `pathBundles` / `glossaryBundles`. |
| `src/lib/localizedQuiz.ts`                                                                        | Same dynamic split; or delete barrel and load in quiz `page.tsx` server-side only.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/data/lessonBundles.ts` / `quizBundles.ts` / `pathBundles.ts` / `src/data/glossaryBundles.ts` | Stop being imported from client. Optionally keep for server-only. Adding `import 'server-only'` if the package is used — **check** `server-only` dependency; if absent, do not add unless needed. Prefer not introducing new deps: enforce via eslint comment + tests.                                                                                                                                                                                                                                                                  |
| `src/data/lessons.ts`                                                                             | If it re-exports both locales, stop client from importing it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `src/lib/localizedContent.ts`                                                                     | Server-only usage.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/hooks/useProgress/sideEffects.ts`                                                            | Phase 7 dynamic import must import **one** locale module, not `lessonBundles.ts`.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `src/lib/dashboard/progress.ts`                                                                   | Server component — sync import of **one** locale OK: `getAllLessons(locale)` implementing switch **without** a combined object import.                                                                                                                                                                                                                                                                                                                                                                                                  |
| `next.config.mjs`                                                                                 | unchanged unless analyze needs it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Tests                                                                                             | `loadLessons.test.ts` currently mocks combined map — switch to mocking locale modules or keep a thin sync map **server-only**.                                                                                                                                                                                                                                                                                                                                                                                                          |

### 17.2 Steps (do not guess)

1. `npx rg "from \\\"@/data/(lesson|quiz|path|glossary)Bundles" src` and `from \"@/lib/lessons/loadLessons\"` in `'use client'` files.
2. For each client hit: move data load to `page.tsx` and pass props (pattern: `ArticlesClient`).
3. Replace `src/data/lessonBundles.ts` combined export usage with:

```ts
export async function loadLessonsForLocale(locale: Locale): Promise<Lesson[]> {
  switch (locale) {
    case "en":
      return (await import("@/data/lessonBundles.en")).lessons;
    case "es":
      return (await import("@/data/lessonBundles.es")).lessons;
  }
}
```

4. Sync `getAllLessons` for tests/scripts: either keep combined import **only** in `scripts/` and server files that cannot be async, or make `getAllLessons` async and update all callers (many). **Chosen:** add async loaders; keep sync `getAllLessons` in `loadLessons.ts` implemented as:

```ts
import { lessons as enLessons } from "@/data/lessonBundles.en";
```

**WRONG** — that still bundles EN into any importer. Sync function **must not** statically import both. Therefore: **make loaders async** and update server pages (`generateStaticParams` already async). Grep all `getAllLessons(` and convert.

5. `npm run analyze` — English client chunk must not contain Spanish lesson titles (search the stats for a distinctive Spanish string from `lessonBundles.es.ts`).

### 17.3 Tests

- Rewrite `src/lib/lessons/loadLessons.test.ts` for async.
- `src/lib/localizedQuiz.test.ts` if exists; else add.
- `src/lib/paths/loadPaths.test.ts`, `src/lib/glossary/loadGlossary.test.ts` — async.

**Playwright:** smoke `/en/learn` and `/es/learn` still render titles.

### 17.4 Acceptance

- [ ] Client graph for `/en/learn/[slug]` does not include `lessonBundles.es` (bundle analyzer or `source-map-explorer`).
- [ ] All locales still SSG.
- [ ] Search still lazy-loads `searchIndex.${locale}`.
- [ ] Dashboard server functions still resolve lessons for the active locale.

### 17.5 Rollback

Revert PR. Combined barrels come back. High value to keep if green.

---

## Phase 15 — Approved small features

**Goal:** Print from lesson/article/care-guide; share/copy on lessons; resume recents from the lesson page; empty achievements not a hole.

**Complexity:** Medium  
**Risk:** Low  
**Dependencies:** Phase 8 citations should print; Phase 13 article layout.

See **mini-specs in §10**.

### 18.1 Scope

| File                                                           | How                                                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/components/content/PrintButton.tsx`                       | **New.** `onClick={() => window.print()}`; `aria-label` from `common.print`; `className="no-print"` on the button itself. |
| `src/components/lesson/LessonHeader.tsx`                       | PrintButton + copy/share (clone article handlers; extract `src/lib/shareCurrentPage.ts`).                                 |
| `src/app/[locale]/articles/[slug]/ArticlePageClient.tsx`       | PrintButton in the share row.                                                                                             |
| `src/app/[locale]/tools/care-guide/CareGuideClient.tsx`        | PrintButton in header.                                                                                                    |
| `src/app/[locale]/learn/[slug]/LessonPageClient.tsx`           | `useEffect` → `markLessonViewed(lesson.id)` once on mount.                                                                |
| `src/app/[locale]/dashboard/components/EarnedAchievements.tsx` | Empty: `EmptyState` + link to `/learn`, not `return null`.                                                                |
| `src/messages`                                                 | `common.print`, `common.shareOnX` already under articles — move shared keys to `common` if duplicated.                    |
| `src/app/[locale]/learn/[slug]/LessonPageClient.test.tsx`      | **new** if missing — viewed called.                                                                                       |
| `src/components/content/PrintButton.test.tsx`                  | clicks `print`.                                                                                                           |
| `EarnedAchievements` test                                      | empty state.                                                                                                              |

### 18.2 Tests

As table.

**Playwright:** lesson page has a Print control; dashboard empty achievements shows CTA (needs auth — if dashboard e2e uses mock, add; else unit only).

### 18.3 Acceptance

- [ ] Lesson, article, care-guide have Print; `@media print` hides `no-print`.
- [ ] Lesson has copy link + X share like articles.
- [ ] Opening a lesson updates recents without catalog click.
- [ ] Zero achievements shows empty state.

### 18.4 Rollback

Revert PR.

---

## Phase 16 — Hardening

**Goal:** Headers cannot drift; Sentry does not leak lesson extras; dashboard minutes are honest; remaining perf nits if time.

**Complexity:** Medium  
**Risk:** Low–medium  
**Dependencies:** Most prior phases. **Drop AppProviders split and N+1 if Day 4 is gone.**

### 19.1 Must-do (do not drop)

| File                                                       | How                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/sync-security-headers.mjs`                        | **New.** Single CSP/HSTS/Permissions-Policy string source. Writes/checks `next.config.mjs` is hard — **simpler:** extract `securityHeaders` to `security-headers.mjs` imported by `next.config.mjs`; Netlify cannot import JS in `netlify.toml`. **Chosen:** `scripts/check-security-headers.mjs` reads both files and asserts CSP `connect-src` tokens match a canonical list in `security-headers.json`. CI runs it.                                        |
| `security-headers.json`                                    | Canonical directives.                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `netlify.toml` / `next.config.mjs`                         | Edit to match JSON (script can be check-only).                                                                                                                                                                                                                                                                                                                                                                                                                |
| `src/lib/errorReporting.ts`                                | `beforeSend`: scrub `event.extra`, `event.user`, `breadcrumbs[].data` with `sanitizeContext` + `scrubPII`. Keys: lesson, quiz, path, email.                                                                                                                                                                                                                                                                                                                   |
| `src/lib/errorReporting.test.ts`                           | extra.lessonId redacted.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/lib/errorReporting.ts` `reportServerError`            | If `SENTRY_DSN` or `NEXT_PUBLIC_SENTRY_DSN` set, POST to Sentry envelope **or** log JSON with `level`. Do not add `@sentry/nextjs` unless already trivial. Minimum: include `dsn` fetch in serverless; if too much, log `console.error` **and** a `TODO` is forbidden — implement a 30-line ingest using `@sentry/browser` is client-only. **Chosen:** HTTP ingest with `SENTRY_DSN` server env (not public) in `reportServerError`. Document env in Netlify. |
| `src/app/[locale]/dashboard/components/DashboardStats.tsx` | If `totalTimeSpentMinutes === 0`, show `t("statsTimeSpentUnavailable")` (`—`) not `0 min`.                                                                                                                                                                                                                                                                                                                                                                    |
| `src/components/JsonLd.tsx`                                | Keep stringify escapes; reject non-plain objects (`data` must be JSON-serializable; `JSON.parse(JSON.stringify(data))` round-trip). Test already in `JsonLd.test.tsx` — extend.                                                                                                                                                                                                                                                                               |
| `src/app/[locale]/HomeClient.tsx`                          | Video: `preload="none"`; `muted` playsInline keep; `matchMedia('(prefers-reduced-motion: reduce)')` → do not autoplay (show poster).                                                                                                                                                                                                                                                                                                                          |

### 19.2 Time-permitting (drop first)

| File                              | How                                                                                                                                                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/AppProviders.tsx` | Split `PreferencesContext` vs `ProgressContext`. Update `useAppState` to a compatibility hook merging both **or** migrate callers. High churn — only if tests in `AppProviders.test.tsx` stay green and grep `useAppState` is updated. |
| `src/lib/dashboard/progress.ts`   | Parallelize the two queries (`Promise.all`) — already sequential. Easy win: `Promise.all` progress + quiz. Skip Postgres view.                                                                                                         |

### 19.3 Tests

- `scripts/check-security-headers.test.ts` or spawn like env check.
- `errorReporting.test.ts` extra/breadcrumb.
- `DashboardStats` test if exists.
- `JsonLd.test.tsx`.
- `HomeClient` video reduced-motion if testable.

**Playwright:** none required.

### 19.4 Acceptance

- [ ] CI fails if netlify CSP connect-src diverges from next.config.
- [ ] Sentry client events do not include raw `lessonId` in extra.
- [ ] Server reporter attempts ingest when DSN set.
- [ ] Dashboard does not claim minutes learned when column unused.
- [ ] JsonLd still escapes `<`.
- [ ] Reduced-motion: home video does not autoplay.

### 19.5 Rollback

Revert PR. Header script is check-only — safe.

---

# 10. Mini-specs (approved new / newly productized UI)

Only these net-new UX pieces are in scope. Bugfixes above are not repeated unless they need a story.

---

### 10.1 Clinical citation block

**User story:** As a reader, I see who reviewed this page and which agencies it draws from, so I can trust it is education with sources.

**UX flow:**

1. Open any article or lesson.
2. Directly under the title, a compact line: `Reviewed by {reviewedBy} · {date} · Sources: A / B`.
3. End of content: full list (articles were missing this entirely).
4. Print includes citations; share buttons remain `no-print`.

**Data model / RLS:** none. Fields already on MDX/`Article`/`Lesson` types (`sources?`, `reviewedBy?`, `lastReviewed?`).

**Edge cases:** missing date → omit date; empty sources → validator should prevent in Phase 8; compact mode hides empty parts.

**Analytics:** none. Do not send source clicks to GA.

**A11y:** list is a `<ul>`; compact line is `<p>` not color-only; 4.5:1 text.

**Phase:** 8.

---

### 10.2 Trust banner

**User story:** As a first-time visitor, I understand this is clinically reviewed education, not a clinic.

**UX flow:** Home (and learn/articles/tools indexes): one-line banner above the H1/page title. Not a modal. Dismissible? **No** (legal/education, not a cookie banner).

**Data:** i18n only.

**Edge cases:** simple mode still shows it (high importance). Dark theme: use `bg-surface-container` + `text-on-surface`, not low-contrast mint.

**Analytics:** none.

**A11y:** not `role="alert"` (not an emergency). Plain text or `role="note"`.

**Phase:** 8.

---

### 10.3 Print CTA (lesson, article, care-guide)

**User story:** As a patient in a waiting room, I print the page without the chrome.

**UX flow:** Button "Print" → `window.print()`. Existing `globals.css` `@media print` and `.no-print` hide header/footer/share. Visit planner/checklist already print; do not duplicate a PDF export.

**Data:** none.

**Edge cases:** browsers without print → button still invokes `print()`; no toast required. Care-guide emergency banner: `no-print` already on the top alert — printed page should still include educational cards + disclaimer.

**Analytics:** optional `trackEvent` is unused in prod — **do not** wire GA.

**A11y:** `type="button"`; label `common.print`; min 44px.

**Phase:** 15.

---

### 10.4 Lesson copy link + share

**User story:** As a learner, I share a lesson the same way I share an article.

**UX flow:** Same controls as `ArticlePageClient` (`clipboard` + X intent). Toast success/fail. `no-print`.

**Data:** none.

**Edge cases:** non-HTTPS clipboard failure → error toast. Share URL is canonical `window.location.href` (includes locale prefix).

**Analytics:** none.

**A11y:** `aria-label` on icon-only if labels collapse; prefer visible text like articles.

**Phase:** 15.

---

### 10.5 Resume last lesson from the lesson route

**User story:** As a returning guest, the home/dashboard "continue" list includes lessons I opened from a deep link, not only catalog clicks.

**UX flow:** Mount `LessonPageClient` → `markLessonViewed(lesson.id)` once. Existing `recentLessons` in AppProviders/localStorage.

**Data:** `STORAGE_KEYS.recentLessons` only. No Supabase column.

**Edge cases:** Strict mode double mount → viewed twice; `markLessonViewed` must be idempotent (already unshifts unique). Do not mark complete.

**Analytics:** none (GA page_view already fires).

**A11y:** no UI.

**Phase:** 15.

---

### 10.6 Search grouped results + live region

**User story:** As a keyboard/SR user, I know how many hits and which type they are.

**UX flow:** Cmd/Ctrl+K → type → grouped lists with headers. Status: "8 results". Loading index: "Loading search…".

**Data:** existing `SearchEntry.type`.

**Edge cases:** unknown type → "Other". Empty query: show no groups, not "0 results" (unless product already shows suggestions — keep current empty state).

**Analytics:** none.

**A11y:** `role="status" aria-live="polite"` visually hidden; groups as `<h3>` + `<ul>`. Focus trap unchanged.

**Phase:** 12.

---

### 10.7 Article sticky TOC

**User story:** As a desktop reader, I jump sections without 100-character lines.

**UX flow:** `lg+` two columns; TOC sticky; click scrolls to `id`. Mobile: no TOC (sections still have headings).

**Data:** `article.content.sections[].title`.

**Edge cases:** duplicate titles → suffix `-2`. Hash on load: optional skip for time.

**Analytics:** none.

**A11y:** TOC `nav aria-label={t("onThisPage")}`; skip link already to `#main-content`.

**Phase:** 13.

---

### 10.8 Achievement wiring (product completion, not a new system)

**User story:** As a signed-in learner, badges in the catalog can actually unlock.

**UX flow:** Unchanged celebration toast + notification bell. Empty dashboard uses Phase 15 empty state.

**Data model:** existing `achievements` table. Unique `(user_id, achievement_id)`. RLS ownership unchanged. **No new tables.** Glossary count is **localStorage** `hmc-glossary-lookups` (JSON string array of term ids), not a cloud column.

**Edge cases:** user switches browsers → glossary-reader progress resets (acceptable). Streak uses UTC dates (`streaks.ts`). Parallel lesson completes can still race streaks (out of scope to RPC).

**Analytics:** none.

**A11y:** toasts already `aria-live`; Spanish strings required.

**Phase:** 7 (+ empty state in 15).

---

### 10.9 Visit planner locale-stable storage (BUG-06)

**User story:** As a bilingual user, my saved questions stay the same questions after I switch language.

**UX flow:** unchanged stepper. Persistence format version: ids. Custom questions still `{id, text}` in the language they typed (not translated).

**Data:** `localStorage` `hmc-visit-planner` only. No Supabase.

**Edge cases:** see Phase 12 hydrate. Changing visit type still resets selected ids (keep current `changeVisitType` behavior unless tests require otherwise).

**Analytics:** none.

**A11y:** step heading focus (Phase 12).

**Phase:** 12.

---

# 11. Out of scope (4-day window)

| Item                                                     | Why                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Medication schedule generator                            | M effort + clinical dosing liability after P0s                                    |
| Lab results decoder                                      | M effort + range-misinterpretation harm                                           |
| USPSTF screening timeline                                | M effort + sex/age medical advice                                                 |
| Medical bill dispute workflow                            | M; EOB article already exists                                                     |
| Offline PWA / service worker                             | Cache invalidation + PHI-adjacent progress in SW is a project                     |
| Lesson/article TTS                                       | M; a11y win but needs voice QA EN/ES                                              |
| Glossary pronunciation audio                             | Asset pipeline + hosting                                                          |
| Symptom journal                                          | New PHI-ish local dataset + privacy rewrite again                                 |
| Email visit plan (Resend)                                | Widens PII; adversarial: not until privacy is true **and** still skip this window |
| jsPDF / clinician PDF                                    | Print CSS exists                                                                  |
| Cheat-proof streaks/achievements (SECURITY DEFINER RPCs) | Integrity, not launch-blocking PHI                                                |
| `time_spent_seconds` instrumentation                     | Honesty via hiding metric is enough                                               |
| Flesch-Kincaid linter                                    | NTH; false positives on medical terms                                             |
| Mock client strict `Database` generics                   | Dev-only                                                                          |
| Localhost CSRF exact port                                | Dev-only                                                                          |
| Logo `next/image`                                        | NTH                                                                               |
| `@sentry/nextjs` full wizard                             | Partial ingest in Phase 16                                                        |
| Applying/replaying `001`–`013` as-is                     | Would break live policies                                                         |
| Quiz attempt **history** product (many rows)             | Opposite of unique+best-score decision                                            |
| New locales beyond EN/ES                                 |                                                                                   |
| HIPAA program, patient accounts, messaging               | Wrong product                                                                     |
| Upstash fail-closed rate limit                           | Availability choice; document only                                                |
| Onboarding on every first lesson (not only `/`)          | Nice; skip unless Phase 10 leftover time                                          |
| Streak celebratory animation                             | Visual NTH                                                                        |

---

# 12. Global Definition of Done (entire revamp)

The revamp is done when **all** of the following are true. Phases 14 AppProviders-split and 16 N+1 may be unchecked if explicitly dropped in a Day-4 slip note on this file.

### Security & data

- [ ] Production `contact_submissions` has no public INSERT; anon PostgREST insert fails.
- [ ] Netlify has `SUPABASE_SERVICE_ROLE_KEY`; `/api/contact` returns 2xx on a valid POST in production.
- [ ] `delete_user` exists; Settings deletion removes auth user (spot-check on a throwaway account).
- [ ] `handle_new_user` has `search_path`; not executable by `anon`.
- [ ] `quiz_attempts` unique `(user_id, quiz_id)`; no duplicate pairs.
- [ ] Privacy page does not say learning data never leaves the device.
- [ ] CSP in `netlify.toml` and `next.config.mjs` match the canonical list.

### Auth

- [ ] Recovery email `?code=` (and `token_hash` confirm) works on a real Supabase email in staging/prod.
- [ ] ES auth error URLs stay under `/es/`.
- [ ] Signup does not confirm whether an email is registered.

### Clinical & trust

- [ ] Care guide does not instruct OTC use or personal triage.
- [ ] Urgent-care text contrast ≥ 4.5:1.
- [ ] Visible 911 control says US.
- [ ] Every article shows sources + reviewedBy.
- [ ] `npm run content:validate` enforces sources + reviewedBy.
- [ ] Home trust banner visible.

### Progress

- [ ] Guest progress survives tab close and migrates on login.
- [ ] Quiz save upserts; error rolls back optimistic UI.
- [ ] Dashboard quiz stats match unique best scores.
- [ ] Streak/path/beginner/glossary achievements can unlock (unit-proven).

### UX / a11y

- [ ] 1440px header shows desktop nav (`lg`).
- [ ] Footer/legal/glossary letters/checklist/pills meet 44px on 390px.
- [ ] Search announces result counts; groups by type.
- [ ] Planner survives EN↔ES; step focus moves.
- [ ] 404 buttons are padded and branded.
- [ ] Quiz feedback does not shove the Next control (reserved min-height).
- [ ] Article body ~65ch + desktop TOC.

### Performance

- [ ] English session does not download Spanish lesson/quiz bundles in the main client graph (analyzer evidence attached to Phase 14 PR).

### Quality gates (CI on `main`)

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run content:validate`
- [ ] `npm run test:e2e`
- [ ] `npm run build` (GitHub CI with public supabase placeholders; Netlify with real secrets)

### i18n

- [ ] `en.json` / `es.json` key parity (existing test still 0 missing).
- [ ] No new user-visible hardcoded English in components touched (ErrorBoundary bilingual or i18n; achievement toasts localized).

### Explicit non-goals remain out

- [ ] PR descriptions list anything deferred from §11 (so the next sprint does not forget).

---

# 13. Appendix

### 13.1 Phase dependency graph

```
P1 (DB) ──► P6 (quiz client)
 P1 ──► P7 (daily_log UPDATE)
P2 (auth routes) ──► P9 (auth tests/UX)
P3 (privacy/env) independent; coordinate env with P1 contact revoke
P4, P5, P8, P10–P13 independent after P2 for auth pages
P14 after correctness (Day 4)
P15 after P8/P13
P16 last
```

### 13.2 Distinctive files junior engineers touch most

```
src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx
src/app/[locale]/auth/confirm/route.ts
src/app/[locale]/auth/callback/route.ts
src/lib/guestProgress.ts
src/hooks/useProgress.ts
src/hooks/useProgress/mutations.ts
src/hooks/useProgress/sideEffects.ts
src/lib/achievements.ts
src/messages/en.json
src/messages/es.json
src/components/Header.tsx
src/app/globals.css
src/app/[locale]/articles/[slug]/ArticlePageClient.tsx
src/app/[locale]/tools/care-guide/CareGuideClient.tsx
src/app/[locale]/tools/visit-planner/useVisitPlanner.ts
scripts/check-production-env.mjs
scripts/validate-content.ts
supabase/migrations/014_launch_reconcile.sql
supabase/migrations/015_quiz_attempts_best_score.sql
```

### 13.3 Live verification cheatsheet (post-Phase 1)

```sql
-- must be 0
select count(*) from pg_policies
where tablename = 'contact_submissions' and policyname = 'Anyone can insert contact submissions';

select proname from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and proname in ('delete_user', 'handle_new_user', 'set_updated_at');

select pg_get_constraintdef(oid) from pg_constraint
where conrelid = 'public.quiz_attempts'::regclass and contype = 'u';
```

### 13.4 Screenshot regression set (re-capture after visual phases)

Replace `REVAMP/SCREENSHOTS/` for: `desktop-01-home`, `desktop-08-article`, `desktop-09-glossary`, `desktop-10–13` tools, `desktop-26-not-found`, `desktop-27–28` search, `mobile-00` drawer, `mobile-01`, `mobile-09`, `mobile-11–13`. Not a merge blocker if Playwright covers the assertions.

### 13.5 Audit ID index (quick)

BUG-01, BUG-02, BUG-05 → P2  
SEC-01, ADV-08, ADV-06 → P3  
ADV-10, ADV-09, ADV-15, ADV-01 SQL → P1  
ADV-12, A11Y-01, MED-03 → P4  
BUG-03, BUG-04, ADV-03 → P5  
ADV-01 client, ADV-04 → P6  
ADV-02, ADV-14 → P7  
MED-01, MED-02 → P8  
ADV-13, ADV-05, TEST-01 → P9  
Visual 1, 8, 10 → P10  
Visual 2, 5, glossary, inline terms → P11  
A11Y-02, A11Y-03, BUG-06, Visual 9 → P12  
Visual 3–4, 7, quiz CLS, cards, paths → P13  
PERF-01 → P14  
Print/share/resume → P15  
SEC-02, ADV-16, SEC-03, ADV-07, PERF-02/03 → P16
