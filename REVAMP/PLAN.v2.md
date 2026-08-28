# HealthMadeClear Launch Revamp — Implementation Plan v2

**Status:** Contract for all implementation work in the 4-day launch window. **Supersedes `REVAMP/PLAN.md` (v1).**  
**Date:** 2026-08-27  
**Inputs:** `REVAMP/AUDIT-CODE.md` (file audit + independent adversarial/live-DB audit), `REVAMP/AUDIT-VISUAL.md`, `REVAMP/CRITIQUES/ROUND-1.md` (panel + Cursor/Grok second opinion)  
**Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, next-intl (EN/ES), Supabase (`xdmbyadosmzixsxqullj`, us-east-1), Vitest, Playwright, Netlify

This document is the only source of truth for what ships. If a later chat disagrees with this file, update this file first. Vagueness here causes failed PRs later.

---

## Changelog from v1

Every row is a delta vs `REVAMP/PLAN.md`. Critiques: `Staff` / `Sec` / `UX` / `Clin` / `PM` = panel ROUND-1; `CF-N` = combined flaws in the Cursor/Grok second opinion; `SO` = second-opinion follow-through that was not a panel 🔴.

| Change                                                                                                                                                                                                                                                                 | Driven by                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| This file is the contract; v1 is historical.                                                                                                                                                                                                                           | Process                                       |
| **Do not** `db push` pending `009`–`013`. Repair them as applied after confirming `014` supersets their intent. Live history is `001`–`008` (+ dummy).                                                                                                                 | **CF-1**                                      |
| Day 1 applies **`014` only**. `015` lives in `supabase/pending/` until Phase 6. Unique constraint and client upsert ship in one production window.                                                                                                                     | **PM 🔴 1**, **CF-1**                         |
| Rollback SQL goes in `supabase/rollback/`, **never** `supabase/migrations/` (CLI would apply a reverse migration).                                                                                                                                                     | **PM 🟡 4** (rejected as stated), **CF-6**    |
| `ResetPasswordClient`: URL tokens → exchange/verify; else wait for auth; **session present → show form**; else invalid-link.                                                                                                                                           | **Staff 🔴 1**, **CF-2**                      |
| Confirm: `type=recovery` **forces** `next` to `/{locale}/auth/reset-password` (never dashboard default). Canonical recovery template URL is the reset page.                                                                                                            | **Staff 🔴 1**, **CF-2**                      |
| Phase 3 does **not** add origin/rate-limit/honeypot (already in `src/app/api/contact/route.ts`). Keep those checks. Add ~10KB JSON body cap + client `inFlight`. Regression test: do not send search `q` to GA (`SEARCH_PERFORMED` unused; `anonymize_ip` already on). | **Sec 🔴 1 REJECT**, **Sec 🟡 4**             |
| Guest quiz is **not** merged into `QuizScore` (`lessonId`). Guest attempts stay `{ quizId, score, maxScore, … }` in **localStorage** guest keys; sessionStorage one-time migrate; AppProviders `quizScores` remains UI-only.                                           | **Staff 🔴 3**, **CF-3**                      |
| Phase 4 key list is exhaustive: bodies, **four checklists**, both scenarios (sore throat, chest pain — there is no larger `tools.scenarios.*` tree), `whenInDoubtBody`, `careGuideDescription`. EN+ES. Chest-pain 911 stays, US-qualified.                             | **Clin 🔴 1**, **CF-5**                       |
| Validator: `sources.length ≥ 1`, non-empty `reviewedBy`, **placeholder denylist**. Keep existing **400-day** `lastReviewed` fail. **No** credential regex. **No** 24-month rule (would weaken 400-day).                                                                | **Clin 🔴 2 REJECT/PARTIAL**                  |
| Phase 11: breadcrumbs `min-h-11`. Drawer close, learn `.chip` pills, quiz option rows: **verify-first** (current code already ≥44px). Do not rewrite if still good.                                                                                                    | **UX 🔴 1 PARTIAL**                           |
| Phase 14: **descope**. Change **generators** so combined barrels are not the client import path. Split client `loadPaths` by locale. **Keep** sync server loaders. Do **not** async-convert every `getAllLessons` caller. Do **not** move this rewrite to Day 2.       | **Staff 🔴 2**, **PM 🔴 2 PARTIAL**, **CF-4** |
| Phase 7: beginner counts from slim `lessonMeta` (`id` + `level` only). **Forbidden:** `import("@/lib/lessons/loadLessons")` from client `sideEffects` (re-opens PERF-01).                                                                                              | **CF-4**, **SO**                              |
| `handle_new_user` truncates `display_name` to 100 chars.                                                                                                                                                                                                               | **Sec 🟡 2**                                  |
| `015` dedupe: comment that UUID `<` is an arbitrary deterministic tiebreak, not time order.                                                                                                                                                                            | **Staff 🟡 4**                                |
| Search: debounce `aria-live` 350ms; results `max-h-[calc(100dvh-14rem)]`.                                                                                                                                                                                              | **UX 🟡 3**                                   |
| Hero + TrustBanner on `<sm`: compact banner; video **below** primary CTAs.                                                                                                                                                                                             | **UX 🟡 2**                                   |
| Planner defaults: `["medication:1","followup:3"]` (side effects + follow-up), not curiosity `new-symptom:0/1`.                                                                                                                                                         | **Clin 🟡 4**                                 |
| Calendar: P9 after P2 (Day 1 if capacity). P8 with P4 on Day 2. Day 3 = 10/11/12 (+ P13 if ahead). P14 descoped stays Day 4, not morning-first.                                                                                                                        | **PM 🟡 3**, **PM 🔴 2**                      |
| Phase 16: `beforeBreadcrumb` strips URL query strings; do not send `ui.input` values. Existing `beforeSend` PII patterns stay.                                                                                                                                         | **Sec 🟡 3**                                  |
| `delete_user`: throwaway RPC that actually removes `auth.users` is a **Phase 1 gate**. Privilege failure is a bug, not “UI later.”                                                                                                                                     | **CF-7**                                      |
| Privacy/analytics copy: state page-path-only GA; no search-query events.                                                                                                                                                                                               | **Sec 🟡 4**                                  |
| Spanish care-guide / disclaimer / trust strings: MedlinePlus-en-español terms (`medicamentos de venta libre`, `centro de urgencias médicas`). Not a new translation program.                                                                                           | **Clin 🟡 3**                                 |
| Root `not-found.tsx`: import `globals.css`; static `theme-light` on `<html>`. File already has `<html>`/`<body>`.                                                                                                                                                      | **Staff 🟡 5**, visual 404                    |
| Scope **not** cut: P0–P6, citations, auth recovery, privacy honesty, care-guide rewrite, guest migrate, quiz upsert, achievements wiring, header/404, search/planner, print/share.                                                                                     | Explicit                                      |

**Rejected with justification (not in the table as a code change):**

- “Add origin/rate-limit/honeypot to `/api/contact`” — already present; rewriting would churn a working control. (`Sec 🔴 1`)
- Credential regex / 24-month `lastReviewed` — breaks real `reviewedBy`; 400-day fail already exists. (`Clin 🔴 2`)
- Rewrite quiz options, drawer close, learn pills — current hit targets already meet 44px. (`UX 🔴 1` overstated)
- Move Phase 14 to Day 2 — stacks High-risk SSG on auth/DB day. Descope instead. (`PM 🔴 2` Option A)
- `016_*.sql` in `supabase/migrations/` — CLI would apply rollback. (`PM 🟡 4`)

---

## 0. How to execute this plan

### 0.1 Rules every agent must follow

1. **One phase = one PR.** Do not mix phases. Each PR must leave `main` shippable (build, lint, typecheck, unit tests, e2e green).
2. **Read this phase section completely** before touching files. Do not invent extra scope.
3. **EN and ES catalogs must stay in parity.** Every new `en.json` key gets the same path in `es.json`. Run existing locale tests.
4. **Do not replay** `supabase/migrations/001_*.sql` through `013_*.sql` against production. Live `schema_migrations` is `001`–`008` (+ dummy). Local files `009`–`013` are **pending**. Blind `npx supabase db push` would execute `009`–`013` then `014`/`015`. That is forbidden. **Repair `009`–`013` as already applied** (without executing) once `014` is written to superset their intent, then push **only** forward files that are meant to run. See Phase 1.
5. **Never put `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_*` variable** or client bundle.
6. **Do not** add email, Resend, PWA service workers, TTS, or new clinical tools in this window.
7. After UI work, verify in the browser (desktop 1440 and mobile 390) on the routes listed in that phase. Screenshots in `REVAMP/SCREENSHOTS/` are the **before** state, not the target.
8. Commits and PR titles: normal English, conventional commits (`fix:`, `feat:`, `security:`, `a11y:`).
9. If a step says "verify current code first" and the bug is already gone, record that in the PR description and skip the rewrite. Do not revert a working fix.
10. **Never put rollback SQL in `supabase/migrations/`.** Emergency reverse scripts live in `supabase/rollback/` so the CLI cannot apply them as forward migrations.

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
| C16 | Panel: `/api/contact` has no origin/rate-limit/honeypot after RLS lock. File: those checks already exist.                                                                                                                   | **Keep existing server controls.** Add body-size cap + client `inFlight` only.                                                                                         | Panel 🔴 described a missing file. Churn would risk regressing a working gate.                                                                        |
| C17 | v1 calendars `015` unique on Day 1 and quiz `.upsert()` on Day 2. Live client `.insert()`.                                                                                                                                  | **`015` not applied until Phase 6 is on Netlify.** Day 1 = `014` only.                                                                                                 | Else authenticated retakes 23505 for a day. Guest migrate already upserts.                                                                            |
| C18 | v1 ResetPassword errors if URL has no `code`/`token_hash`. Confirm recovery can already have set cookies. Confirm `next` defaults to dashboard.                                                                             | **Session-aware reset. Force recovery `next` to reset-password.** Canonical email template: reset page with PKCE `code`.                                               | Server OTP and PKCE are both real Supabase templates. v1 broke the intersection.                                                                      |
| C19 | v1 merges guest quizzes into `QuizScore` (`lessonId`). Migrate + `015` need `quiz_id`.                                                                                                                                      | **Keep guest attempt shape. Do not merge into `quizScores`.**                                                                                                          | Shape mismatch becomes a unique-constraint failure, not a duplicate row.                                                                              |
| C20 | v1 P14 hand-edits combined barrels; generators rewrite them. v1 P7 dynamic-imports `loadLessons` (both locales) into client.                                                                                                | **Generators in P14. Slim `lessonMeta` for P7. No client `loadLessons` import. Keep sync server loaders.**                                                             | P14 slip would leave P7 worse than HEAD.                                                                                                              |
| C21 | Panel: put `016_rollback` in `migrations/`.                                                                                                                                                                                 | **`supabase/rollback/` only.**                                                                                                                                         | Forward CLI would undo 014/015.                                                                                                                       |
| C22 | Panel: move P14 to Day 2.                                                                                                                                                                                                   | **Descope P14; keep Day 4.** Do not stack SSG graph surgery on auth/DB day.                                                                                            | Option A increases blast radius.                                                                                                                      |

### 1.3 Product decisions locked for this window

| Decision           | Choice                                                                                                                                                                                                                                                                                                                                                   | Why                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Quiz storage model | **One best-score row per `(user_id, quiz_id)`**                                                                                                                                                                                                                                                                                                          | Matches lesson UI (`useSupabaseProgress` already keeps max). Dashboard must use the same rule. |
| Guest progress     | **`localStorage` is canonical** for AppProviders UI keys (`hmc-completed-lessons`, `hmc-quiz-scores`) **and** for guest migrate keys (`hmc_guest_completedLessons`, `hmc_guest_quizAttempts`). SessionStorage is a one-time migrate-from. **Do not** merge guest quiz attempts into `QuizScore` (`lessonId`). Guest attempts keep `quizId` / `maxScore`. | Tab close must not wipe progress. Signup migrate must send real `quiz_id`.                     |
| Care guide voice   | **Education, not triage.** Describe typical settings; never "take OTC" or "go to X now" as an instruction. Emergency banner stays, qualified as US 911. **Rewrite all care-guide i18n keys** (bodies, checklists, both scenarios, when-in-doubt), not only `homeCareBody`.                                                                               | Highest clinical-liability surface.                                                            |
| Privacy            | **Describe both modes** (anonymous local vs signed-in sync) and GA **page-path** collection. Do not claim search queries are sent (they are not).                                                                                                                                                                                                        | Current copy is false for authenticated users.                                                 |
| Account deletion   | **Deploy `delete_user`**, then `signOut()`. Contact rows stay (not user-linked). Privacy copy must say that.                                                                                                                                                                                                                                             | GDPR/CCPA control must work.                                                                   |
| New tools          | **None.**                                                                                                                                                                                                                                                                                                                                                | See §11.                                                                                       |
| Print              | **`window.print()` + existing `@media print`.**                                                                                                                                                                                                                                                                                                          | No jsPDF.                                                                                      |

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

| Finding                                                              | Sev     | Phase                                                             | Notes                                                                              |
| -------------------------------------------------------------------- | ------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| ADV-10 public INSERT `contact_submissions`                           | 🔴      | 1                                                                 | Plus REVOKE                                                                        |
| ADV-09 `delete_user` missing                                         | 🔴      | 1                                                                 | Throwaway RPC that deletes `auth.users` is a **gate**                              |
| ADV-15 `handle_new_user` search_path + EXECUTE PUBLIC                | 🟡      | 1                                                                 | Same migration; truncate `display_name` to 100                                     |
| ADV-01 quiz unique vs insert vs live dupes                           | 🔴      | 1 (write `015` file in `pending/`) + **6 (apply `015` + client)** | **Do not apply `015` in Phase 1.**                                                 |
| `daily_log` no UPDATE (upsert fails day 2)                           | 🟡      | 1                                                                 |                                                                                    |
| Indexes 011/012 not applied                                          | 🟡      | 1                                                                 | Folded into `014`; do not run `011`/`012` files via `db push`                      |
| Pending repo `009`–`013` vs live `001`–`008`                         | 🔴      | 1                                                                 | Repair-as-applied; `014` supersets. Never execute `013` separately.                |
| SEC-01 `SUPABASE_SERVICE_ROLE_KEY` env gate                          | 🔴      | 3                                                                 | NETLIFY-only, not GitHub CI. **Before** `014` contact revoke goes live.            |
| `set_updated_at` / 010 absent                                        | 🟢      | 1                                                                 | Cheap with 014                                                                     |
| FORCE RLS + REVOKE TRUNCATE/TRIGGER from `anon`                      | 🟡      | 1                                                                 | Defense in depth                                                                   |
| `auth_rls_initplan` wrap `(select auth.uid())` on remaining policies | 🟢      | 1                                                                 | profiles SELECT                                                                    |
| BUG-01 reset hash-only                                               | 🔴      | 2                                                                 | Plus session-aware reset (confirm may have already set cookies)                    |
| BUG-02 confirm ignores `token_hash`                                  | 🔴      | 2                                                                 |                                                                                    |
| BUG-05 locale-less auth redirects                                    | 🟡      | 2                                                                 |                                                                                    |
| ADV-11 (same as BUG-01/02)                                           | 🔴      | 2                                                                 |                                                                                    |
| ADV-08 privacy lie                                                   | 🔴      | 3                                                                 |                                                                                    |
| ADV-06 contact double-submit                                         | 🟡      | 3                                                                 | Client lock; no new DB column                                                      |
| ADV-12 care-guide treatment voice                                    | 🔴      | 4                                                                 |                                                                                    |
| A11Y-01 urgent-care contrast                                         | 🔴      | 4                                                                 |                                                                                    |
| MED-03 911 visible qualifier                                         | 🟡      | 4                                                                 |                                                                                    |
| Articles catalog missing disclaimer                                  | 🟡      | 4                                                                 |                                                                                    |
| BUG-03 guest session vs local                                        | 🟡      | 5                                                                 |                                                                                    |
| BUG-04 / ADV-03 migration race + unhandled rejection                 | 🟡      | 5                                                                 |                                                                                    |
| Guest `JSON.parse as T`                                              | 🟡      | 5                                                                 |                                                                                    |
| ADV-04 quiz optimistic no rollback                                   | 🟡      | 6                                                                 |                                                                                    |
| Client quiz `.insert`                                                | 🔴      | 6                                                                 | **Same deploy as applying `015`.** Unique without upsert → retakes 23505.          |
| Dashboard summary sums all quiz rows                                 | 🟡      | 6                                                                 | Best-score aggregation                                                             |
| ADV-02 dead achievements + side-effect order                         | 🟡      | 7                                                                 | Slim `lessonMeta` only — **no** client `loadLessons` import                        |
| ADV-14 English achievement toasts                                    | 🟡      | 7                                                                 |                                                                                    |
| MED-01 article sources omitted                                       | 🔴      | 8                                                                 |                                                                                    |
| LessonNotes omits `reviewedBy`                                       | 🟡      | 8                                                                 |                                                                                    |
| MED-02 validate-content sources/reviewedBy                           | 🟡      | 8                                                                 | Presence + placeholder denylist. Keep 400-day `lastReviewed`. No credential regex. |
| Visual trust banner / compact review line                            | 🟡      | 8                                                                 | Mobile compact (with Phase 13) so CTAs stay on-screen                              |
| ADV-13 signup email enumeration                                      | 🟡      | 9                                                                 |                                                                                    |
| ADV-05 expired JWT generic error                                     | 🟡      | 9                                                                 |                                                                                    |
| TEST-01 auth form unit tests                                         | 🟡      | 9                                                                 | Prefer Day 1 after Phase 2 if time                                                 |
| Visual header `2xl` → `lg`                                           | 🔴 UX   | 10                                                                |                                                                                    |
| Display button duplicate accessible name                             | 🟡      | 10                                                                |                                                                                    |
| Unstyled root 404                                                    | 🔴 UX   | 10                                                                | Import `globals.css`; static `theme-light`. `<html>` already present.              |
| ErrorBoundary hardcoded English                                      | 🟡      | 10                                                                |                                                                                    |
| Onboarding title hardcoded                                           | 🟢      | 10                                                                |                                                                                    |
| Footer / drawer / terms / inputs tap                                 | 🔴 UX   | 11                                                                | Drawer: **verify-first** (toggle already `min-h-11`)                               |
| Inline glossary tap expander                                         | 🔴 UX   | 11                                                                |                                                                                    |
| Breadcrumbs (`PageHeader` links)                                     | 🟡      | 11                                                                | `min-h-11 inline-flex` — real gap. Quiz rows / learn `.chip` already 44px.         |
| Glossary A-Z horizontal snap                                         | 🟡      | 11                                                                |                                                                                    |
| A11Y-03 search `aria-live` + loading                                 | 🟡      | 12                                                                | Debounce 350ms; `max-h-[calc(100dvh-14rem)]`                                       |
| Visual search grouping                                               | 🟡      | 12                                                                |                                                                                    |
| A11Y-02 planner focus                                                | 🟡      | 12                                                                |                                                                                    |
| BUG-06 planner locale strings                                        | 🟡      | 12                                                                | Defaults `["medication:1","followup:3"]`                                           |
| Visual planner summary contrast                                      | 🟡      | 12                                                                |                                                                                    |
| Hero type scale                                                      | 🟡      | 13                                                                | `<sm`: compact TrustBanner; video below CTAs                                       |
| Article `max-w-prose` + TOC                                          | 🟡      | 13                                                                |                                                                                    |
| Quiz feedback CLS                                                    | 🟡      | 13                                                                |                                                                                    |
| Learn pills/cards                                                    | 🟡      | 13                                                                | Pills already `.chip` 44px — cards/gap only if still needed                        |
| Path mobile stacked steps                                            | 🟡      | 13                                                                |                                                                                    |
| PERF-01 EN+ES lesson/quiz(/path/glossary) eager import               | 🔴 perf | 14                                                                | Generators + **client** graph. Keep sync server loaders.                           |
| Print CTAs lesson/article/care-guide                                 | 🟡 feat | 15                                                                |                                                                                    |
| Lesson copy/share parity                                             | 🟢 feat | 15                                                                |                                                                                    |
| `markLessonViewed` on lesson page                                    | 🟢 feat | 15                                                                |                                                                                    |
| Empty achievements section                                           | 🟢      | 15                                                                |                                                                                    |
| SEC-02 CSP dual source                                               | 🟡      | 16                                                                |                                                                                    |
| JsonLd extra validation                                              | 🟢      | 16                                                                |                                                                                    |
| ADV-16 Sentry `extra`/breadcrumbs                                    | 🟡      | 16                                                                |                                                                                    |
| SEC-03 server Sentry                                                 | 🟢      | 16                                                                |                                                                                    |
| PERF-02 AppProviders split                                           | 🟡      | 16                                                                | Drop if Day 4 slips                                                                |
| PERF-03 dashboard N+1                                                | 🟢      | 16                                                                | Drop if Day 4 slips                                                                |
| ADV-07 minutes learned lie                                           | 🟡      | 16                                                                |                                                                                    |
| TEST-02 tool unit tests                                              | 🟡      | 4, 12                                                             | In those phases                                                                    |
| Home autoplay video 1.3MB                                            | 🟢      | 16                                                                | `preload="none"` / respect reduced motion                                          |

**Rejected for this window** (still listed in §11): mock strict types, Flesch-Kincaid linter, localhost CSRF port match, Logo `next/image`, cheat-proof RPCs, PWA, TTS, new clinical tools, email send, glossary audio, reading-time instrumentation.

---

## 3. Four-day calendar

Assume ~10 hour days, mergeable PRs, CI ~15 min/PR.

| Day       | Phases                                                 | Theme                                                                                                              |
| --------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Day 1** | **1 (`014` only)**, 2, 3, **9 if Phase 2 lands early** | Security + auth + legal copy. **Do not announce launch until 1–3 are on production.** **Do not apply `015`.**      |
| **Day 2** | 4, 5, **6 (`015` + client, one window)**, 7, **8**     | Clinical honesty + progress correctness + citations                                                                |
| **Day 3** | 10, 11, 12                                             | Visual/a11y chrome, search, planner. If Day 2 finished 8, start 13 here.                                           |
| **Day 4** | 13 (if leftover), **14 (descoped)**, 15, 16            | Reading UX, **generator + client** split, small features, hardening. P14 is **not** the first task of the morning. |

**Slip protocol:** If Day 3 is not done by start of Day 4, **cut Phase 16 AppProviders/N+1** and any remaining P14 **path/glossary** generator work after lessons/quizzes client split is done. Never cut Phases 1–6. Never apply `015` without the Phase 6 client.

**Parallelism:** Phase 2 can start while Phase 1 SQL is in review. Phase 4 is independent of 1–3. Phase 6 **must not apply `015` to production** until the upsert client is in the same Netlify deploy (or already live). Phase 8 can run parallel with Phase 4 (copy vs MDX).

**Atomic quiz gate:** `014` (RLS/functions/indexes/contact lock) ≠ `015` (dedupe + unique). Mixing them on Day 1 breaks retakes.

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

## Phase 1 — Production schema reconciliation (`014` only)

**Goal:** Production Postgres matches the security intent of migrations 009–013 without executing those files, without replaying 001–008, and **without** adding `quiz_attempts` unique (that is Phase 6).

**Rationale:** Live DB is the launch blocker the file audit could not see. Public INSERT on `contact_submissions` bypasses CSRF, honeypot, and rate limits already implemented on `/api/contact`. Account deletion is a placebo. Naive `db push` applies **pending `009`–`013`** (live history stops at `008`). `013` is a one-line `DROP POLICY` on public contact INSERT — same outage risk as `014` contact lock, unreviewed as a bundle.

**Complexity:** High  
**Risk:** High (data-changing SQL)  
**Dependencies:** None. Contact lock **coordinates with Phase 3 env**. Unique/dedupe is **not** this phase.

### 4.1 Scope (files)

| File                                                | Change                                                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `supabase/migrations/014_launch_reconcile.sql`      | **Create.** Inventory migration. Idempotent. **No unique on `quiz_attempts`.**                        |
| `supabase/pending/015_quiz_attempts_best_score.sql` | **Create here, do not move to `migrations/` yet.** Same SQL as v1 §4.3 B. Phase 6 moves + applies it. |
| `supabase/rollback/014_emergency.sql`               | **Create.** Reverse of 014 pieces (not a forward migration).                                          |
| `supabase/codemap.md`                               | List 014; note 015 pending.                                                                           |
| `src/lib/supabase/schema.ts`                        | Conflict-target constants for Phase 6.                                                                |

No quiz client TypeScript. Do not apply `015`.

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
select rolname, rolbypassrls from pg_roles where rolname in ('anon','authenticated','service_role');
```

3. **Stop** if you cannot take this snapshot. Do not apply SQL blind.
4. Confirm `SUPABASE_SERVICE_ROLE_KEY` exists in Netlify env (needed after INSERT revoke). If missing, add it **before** applying the contact revoke, or contact form dies. Coordinate with Phase 3; if key is missing, apply contact revoke in the same deploy window as the env var.
5. Run `npx supabase migration list` (or dashboard equivalent). Expect remote `001`–`008` applied, local `009`–`013` **pending**. If `009`–`013` show as pending, **do not `db push` yet.**

### 4.3 Implementation steps

**A. Write `014_launch_reconcile.sql`** with this exact intent (adapt only if live names differ from the 2026-08-27 audit; if they differ, update names from the snapshot, do not invent):

1. **Contact lock**
   - `DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;`
   - Keep SELECT `USING (false)` (policy `"Only service role can read contact submissions"` or live equivalent).
   - `REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.contact_submissions FROM anon, authenticated;`
   - Do **not** revoke from `service_role`.
   - `service_role` must keep `rolbypassrls` (Supabase default). FORCE RLS must not break `/api/contact` service-role insert. If snapshot shows `service_role.rolbypassrls = false`, **stop** and do not FORCE RLS on `contact_submissions`.
2. **`delete_user`** — copy body from `009_delete_user.sql` (`SECURITY DEFINER`, `SET search_path = public`, `auth.uid()` null check, `DELETE FROM auth.users WHERE id = auth.uid()`). Then:
   - `REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC;`
   - `GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;`
   - Function owner must be a role that can delete `auth.users` (typically `postgres` / superuser on this project). If a throwaway RPC fails, fix owner/grants in this phase — do not ship a second placebo.
3. **`handle_new_user`** — `CREATE OR REPLACE` using `001_profiles.sql` body (`SET search_path = public`) with truncated display name:

```sql
insert into public.profiles (id, display_name)
values (
  new.id,
  substring(trim(coalesce(new.raw_user_meta_data->>'display_name', '')) from 1 for 100)
);
```

Then:

- `REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;`
- `REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;`
- Trigger `on_auth_user_created` must remain. Do not drop it.
- **Never** use `raw_user_meta_data` for authorization (display name only).

4. **`set_updated_at`** — from `010_updated_at_triggers.sql`. Use `CREATE OR REPLACE FUNCTION`. Triggers: `DROP TRIGGER IF EXISTS` then create on `profiles`, `lesson_progress`, `streaks`.
5. **`daily_log` UPDATE policy** — live has select/insert/delete only. Add:
   - `DROP POLICY IF EXISTS daily_log_update ON public.daily_log;`
   - `CREATE POLICY daily_log_update ON public.daily_log FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);`
6. **Profiles SELECT wrap** (lint 0003): drop and recreate `"Users can view their own profile"` as `TO authenticated` (or keep `TO public` if you must match live, but **USING `((select auth.uid()) = id)`**). Do **not** add a client-callable INSERT policy if signup still uses the trigger; live missing INSERT is OK.
7. **FORCE ROW LEVEL SECURITY** on: `profiles`, `lesson_progress`, `quiz_attempts`, `achievements`, `streaks`, `daily_log`, `notifications`, `contact_submissions` — **after** step A.1 bypass check.
8. **REVOKE** `TRUNCATE, TRIGGER` on all those tables `FROM anon, authenticated`. Leave SELECT/INSERT/UPDATE/DELETE as today so RLS remains the row gate.
9. **Indexes** — copy `011_indexes.sql` and `012_additional_indexes.sql` (`IF NOT EXISTS`). Do not `db push` those original files.

**B. Write `supabase/pending/015_quiz_attempts_best_score.sql` (do not apply):**

1. Snapshot backup first (Phase 6 apply): `create table quiz_attempts_backup_20260827 as select * from quiz_attempts;`
2. Dedupe, keeping the highest `score`, then latest `attempted_at`, then `id` as **arbitrary deterministic tiebreak** (UUID `<` is **not** insertion order — comment that in SQL):

```sql
-- id comparison is a deterministic tiebreak only (UUID is not temporal).
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

3. `ALTER TABLE public.quiz_attempts ADD CONSTRAINT quiz_attempts_user_id_quiz_id_key UNIQUE (user_id, quiz_id);`  
   Use `IF NOT EXISTS` pattern: wrap in a `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;` if needed.
4. Do **not** change RLS to `FOR ALL`. Keep live split policies.

**C. Apply `014` only**

1. Confirm `014` supersets `009` (delete_user), `010` (updated_at), `011`/`012` (indexes), `013` (drop contact INSERT policy).
2. Mark `009`–`013` applied **without executing** them. Exact CLI (confirm against `supabase --help` for this CLI version):

```bash
npx supabase migration list
# Then repair each pending 009–013 as applied, e.g.:
npx supabase migration repair --status applied <version_009>
# … repeat for 010, 011, 012, 013
```

If the CLI cannot repair by the `001`-style names, insert matching rows into `supabase_migrations.schema_migrations` from the SQL editor using the same `version`/`name` shape as existing rows — **after** 014 is written and reviewed. Do not invent versions that collide. 3. Push **only** `014`:

```bash
npx supabase db push
```

**Abort** if the plan lists `009`–`013` or `015` as about to run. `015` must still be outside `migrations/`.

**D. Verify** with the queries in §4.5.

**E. `delete_user` gate:** create a throwaway auth user, `rpc('delete_user')` as that user, confirm the `auth.users` row is gone. If this fails, 014 is not done.

### 4.4 Tests (this phase)

No app unit tests for SQL. Add a **runbook test file** so CI documents the invariant (does not connect to prod):

```ts
export const QUIZ_ATTEMPTS_ON_CONFLICT = "user_id,quiz_id";
```

Phase 6 will import that constant. In Phase 1, export the constant from `src/lib/supabase/schema.ts` (new file) so the migration comment and client cannot drift.

**New tests:**

- `src/lib/supabase/schema.test.ts` — asserts the exported conflict strings equal `"user_id,quiz_id"` and `"user_id,lesson_id"`.

**Playwright:** none.

### 4.5 Acceptance

- [ ] `migration list`: `009`–`013` are **not** pending execution; `014` applied; `015` **not** applied.
- [ ] Live `pg_policies` has **no** `"Anyone can insert contact submissions"`.
- [ ] `anon` cannot INSERT into `contact_submissions` (PostgREST 401/403 with anon key).
- [ ] `/api/contact` still 2xx with service role (after env present).
- [ ] `public.delete_user` exists, `prosecdef = true`, `proconfig` includes `search_path=public`, EXECUTE not granted to `PUBLIC`/`anon`.
- [ ] **Throwaway account:** `rpc('delete_user')` removes `auth.users` row.
- [ ] `handle_new_user` has `search_path`, EXECUTE revoked from `anon`/`authenticated`/`PUBLIC`; display_name truncated at 100.
- [ ] New signup still creates a `profiles` row (trigger works).
- [ ] `daily_log` has an UPDATE policy; second upsert same UTC day succeeds.
- [ ] **`quiz_attempts` unique `(user_id, quiz_id)` is NOT required yet.** Duplicates may still exist. `.insert()` retakes still work.
- [ ] Indexes from 011/012 exist.
- [ ] `npm test` still green (constant test).

### 4.6 Rollback

Committed at `supabase/rollback/014_emergency.sql` (not a numbered forward migration). Contents: drop `delete_user` only if you must; restore contact INSERT **only** if the site is down **and** service_role is missing (prefer adding the Netlify env var). Do not `supabase db reset` on production.

Git: revert the PR. Database: apply the rollback file by hand in the SQL editor.

**Warning:** `015` is not applied in this phase. Quiz dedupe backup happens in Phase 6.

---

## Phase 2 — Auth recovery (reset + confirm + locale)

**Goal:** Password reset and email confirmation work with current Supabase PKCE and OTP templates, and errors stay in the user's locale.

**Rationale:** Users cannot recover accounts. Spanish users get bounced to `/en`. Do not ship auth until this matches templates.

**Complexity:** Medium  
**Risk:** Medium (auth)  
**Dependencies:** None (parallel with Phase 1).

### 5.1 Scope

| File                                                           | How                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx` | Parse `code` from search then hash. Handle `token_hash` + allowlisted `type` via `verifyOtp`. **If no URL tokens:** wait until auth loading finishes; if `getUser()` / `useAuth()` has a session, **show the form** (server confirm already exchanged). Only then `auth.errorInvalidResetLink`. Do **not** error on first paint before auth resolves.                                                                                                               |
| `src/app/[locale]/auth/confirm/route.ts`                       | If `code`, `exchangeCodeForSession`. Else if `token_hash` + `type`, `verifyOtp` with allowlisted types (`signup`, `email`, `invite`, `magiclink`, `recovery`, `email_change`). **If `type=recovery`, ignore dashboard default `next` — always redirect to `/${locale}/auth/reset-password`.** Other types: `sanitizeRedirectPath(..., \`/${locale}/dashboard\`)`. Failures: `/${locale}/auth/login?error=...`. Use `request.nextUrl.pathname`(drop`as unknown as`). |
| `src/app/[locale]/auth/callback/route.ts`                      | Same locale-prefixed error redirects. Same `request.nextUrl`.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `src/lib/auth/parseAuthRedirect.ts`                            | **Create.** Locale from pathname, OTP allowlist, `code` vs `token_hash`, `recoveryRedirect(locale)`.                                                                                                                                                                                                                                                                                                                                                                |
| `src/messages/en.json` / `es.json`                             | `auth.errorInvalidResetLink`, keep existing `errorGeneric`.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `src/app/[locale]/auth/confirm/route.test.ts`                  | token_hash path; locale on redirects; **`type=recovery` → `/es/auth/reset-password` even if `next=/es/dashboard`**.                                                                                                                                                                                                                                                                                                                                                 |
| `src/app/[locale]/auth/callback/route.test.ts`                 | locale on `auth_failed` and `rate_limited`.                                                                                                                                                                                                                                                                                                                                                                                                                         |

### 5.2 Step-by-step

1. Add `src/lib/auth/parseAuthRedirect.ts`:
   - `getLocaleFromPathname(pathname: string): "en" \| "es"` — first segment, default `"en"`.
   - `OTP_TYPES` const array + type guard.
   - `loginErrorUrl(origin, locale, errorCode)` → `${origin}/${locale}/auth/login?error=${errorCode}`.
2. `confirm/route.ts`:
   - Rate limit unchanged.
   - `const locale = getLocaleFromPathname(request.nextUrl.pathname)`.
   - Branch: `code` → exchange; else `token_hash` + valid `type` → `verifyOtp`; else fail.
   - **Recovery:** if `type === "recovery"`, success location is always `/${locale}/auth/reset-password` (drop attacker-controlled `next` for this type).
   - Other types: `next` = `sanitizeRedirectPath(..., \`/${locale}/dashboard\`)`.
   - All failures via `loginErrorUrl`.
3. `callback/route.ts`: same locale helper; only `code` exchange (OAuth). Errors → `/${locale}/auth/login?error=auth_failed` or `rate_limited`.
4. `ResetPasswordClient.tsx`:
   ```
   const search = new URLSearchParams(window.location.search);
   const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
   const code = search.get("code") || hash.get("code");
   const token_hash = search.get("token_hash") || hash.get("token_hash");
   const type = search.get("type") || hash.get("type");
   ```
   - If `code`: `exchangeCodeForSession(code)`.
   - Else if `token_hash` and type guard: `verifyOtp({ token_hash, type })`.
   - Else: **do not set invalid-link yet.** Wait until auth `loading === false`. If session user exists, render the password form (no error). If no session, `setError(t("errorInvalidResetLink"))`.
5. **Canonical templates (human, dashboard):**
   - Confirmation / signup: `https://<prod>/{locale}/auth/confirm?token_hash=...&type=signup` (or PKCE `code`).
   - **Recovery: `https://<prod>/{locale}/auth/reset-password` with PKCE `code` (query or hash).** Confirm is a fallback if templates still point at `/auth/confirm?type=recovery` — hence the forced `next`.
   - If templates still point at `/auth/v1/verify` only, document required dashboard edits in the PR. Do not change templates from code.

### 5.3 Tests

**Vitest**

- `src/lib/auth/parseAuthRedirect.test.ts` — locale parse; OTP allowlist rejects `foo`.
- `src/app/[locale]/auth/reset-password/ResetPasswordClient.test.tsx` — **new**:
  - mock `useAuthFormState` supabase.
  - `jsdom` with `window.location` search `?code=abc` → `exchangeCodeForSession("abc")`.
  - hash-only `#code=xyz` still works (legacy).
  - empty URL **and** mocked signed-in user → **no** invalid-link error; form visible; no exchange.
  - empty URL **and** auth loaded with no user → invalid-link error, no exchange.
  - `?token_hash=th&type=recovery` → `verifyOtp`.
- Update `confirm/route.test.ts`:
  - `http://localhost/es/auth/confirm` no code → location contains `/es/auth/login?error=confirmation_failed`.
  - `?token_hash=h&type=signup` calls `verifyOtp`, success redirects to next.
  - `?token_hash=h&type=recovery&next=/es/dashboard` redirects to `/es/auth/reset-password`, **not** dashboard.
  - `?type=not-a-type` fails.
- Update `callback/route.test.ts` for `/es/auth/callback` error locale.

**Playwright** (`e2e/auth.spec.ts` additions):

- `/en/auth/reset-password` with no params shows invalid-link (or generic) alert, form not in a successful session state.
- `/es/auth/reset-password` page renders Spanish heading (`auth.resetPasswordTitle`).

Cannot click real email links in CI. Unit tests carry PKCE.

### 5.4 Acceptance

- [ ] Query-string `?code=` exchanges session; hash fallback still works.
- [ ] Confirm route accepts `token_hash` + allowlisted `type`.
- [ ] Confirm `type=recovery` always lands on `/{locale}/auth/reset-password`.
- [ ] Reset page with **no URL tokens** and an existing session shows the form, not invalid-link.
- [ ] Reset page with no tokens and no session (auth loaded) shows invalid-link.
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

| File                                         | How                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/messages/en.json` `privacy.*`           | Rewrite. See copy spec below.                                                                                                                                                                                                                                                                                                                                                              |
| `src/messages/es.json` `privacy.*`           | Matching Spanish.                                                                                                                                                                                                                                                                                                                                                                          |
| `src/messages/en.json` / `es.json` `terms.*` | If any sentence says data never leaves the device, fix. `terms.disclaimerBody` educational disclaimer can stay.                                                                                                                                                                                                                                                                            |
| `scripts/check-production-env.mjs`           | If `NETLIFY === "true"`, require non-empty `SUPABASE_SERVICE_ROLE_KEY` (not placeholder). **Do not** require it when `NETLIFY` is unset (GitHub CI).                                                                                                                                                                                                                                       |
| `scripts/check-production-env.test.ts`       | Cases: CI+NETLIFY without key → exit 1; CI without NETLIFY → exit 0 with existing supabase public vars.                                                                                                                                                                                                                                                                                    |
| `src/app/[locale]/contact/ContactClient.tsx` | `inFlight` ref; ignore submit if true; stay true until `finally`. Disable submit button while in flight.                                                                                                                                                                                                                                                                                   |
| `src/app/api/contact/route.ts`               | **Keep** Origin check, `checkRateLimitDistributed`, `website` honeypot, `EMAIL_REGEX`, field length limits. **Do not rewrite.** Add: reject body over ~10KB **before** `request.json()` (read `Content-Length` if present; if absent, cap parsed JSON `JSON.stringify(body).length` after parse and 413). Do **not** add `hp_company`. Idempotency-Key remains optional (memory LRU only). |
| `src/lib/analytics.ts` / `SearchDialog.tsx`  | **Regression:** `EVENTS.SEARCH_PERFORMED` must stay unused (or, if wired, must **not** include query text). `trackPageView` must keep pathname-only.                                                                                                                                                                                                                                       |
| `src/app/[locale]/privacy/page.tsx`          | If it inlines English, switch to messages (likely already uses `useTranslations("privacy")`).                                                                                                                                                                                                                                                                                              |

### 6.2 Privacy copy spec (implement exactly)

Replace `privacy.collectBody` and expand keys:

**Required keys (add if missing):**

- `privacy.collectBodyGuest` — Anonymous use: progress and preferences stay in the browser (`localStorage` / cookies). We do not create an account unless you sign up.
- `privacy.collectBodyAccount` — If you create an account, we store on our database (Supabase, United States): display name, email (Auth), lesson completion, quiz scores and answers, streaks, daily activity dates, and in-app notifications. This syncs progress across devices.
- `privacy.collectBodyContact` — If you use Contact, we store your name, email, subject, and message to respond. These messages are not linked to a learning account. Deleting your account does not delete contact messages you already sent.
- `privacy.collectBodyAnalytics` — We use Google Analytics for page views. We send the page path (which can include lesson or article slugs — topics you opened), not your name, and not search-box text. IP anonymization is on. We do not send the URL query string.
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
- Existing `src/app/api/contact/route.test.ts` — still pass (origin 403, honeypot fake-success, rate limit). Add: oversized body → 413.
- `src/app/[locale]/contact/ContactClient.test.tsx` — **new**: mock `fetch`; double-click submit → one POST.

**Playwright:** `e2e/smoke.spec.ts` or `e2e/flows.spec.ts` — `/en/privacy` contains a sentence that data **is** stored when you have an account (assert a unique substring from the new copy). `/es/privacy` Spanish equivalent.

### 6.5 Acceptance

- [ ] No remaining string "never transmitted to our servers" / "nunca se transmiten a nuestros servidores".
- [ ] Privacy lists guest vs account vs contact vs analytics.
- [ ] Account deletion limitation for contact PII is stated.
- [ ] Netlify build without service role fails; GitHub CI build still passes.
- [ ] Contact form cannot fire two POSTs from double submit.
- [ ] `/api/contact` still rejects bad Origin, filled `website` honeypot, and oversize bodies. Do not remove those checks.
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

| File                                                          | How                                                                                                                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/globals.css`                                         | Light: `--color-on-secondary-container: #2a5245` (or darker if dark-mode pair also fails). Recheck dark-theme tokens in the same file.                        |
| `src/app/[locale]/tools/care-guide/CareGuideClient.tsx`       | Remove `/90` opacity on urgent-care body (`textColor`). Keep emergency card error tokens.                                                                     |
| `src/messages/en.json` / `es.json`                            | **Rewrite every key listed in §7.2.** ES: MedlinePlus-style terms (`medicamentos de venta libre`, `centro de urgencias médicas`), not calques.                |
| `src/messages/en.json` / `es.json` `disclaimer.emergencyCall` | Visible: include US 911. ES equivalent. `tools.emergencyShort` already says 911 — add "US" if missing.                                                        |
| `src/components/MedicalDisclaimer.tsx`                        | Visible link text uses updated `emergencyCall`. Optional small note under the button: `disclaimer.emergencyRegionNote`.                                       |
| `src/app/[locale]/articles/ArticlesClient.tsx`                | Render `<MedicalDisclaimer />` at the bottom of the catalog (same as `LearnClient`).                                                                          |
| `src/components/MedicalDisclaimer.test.tsx`                   | Assert 911 / US in emergency variant.                                                                                                                         |
| `src/app/[locale]/tools/care-guide/CareGuideClient.test.tsx`  | **New.** Renders heading; does **not** include leftover "over-the-counter medicine" / "medicinas de venta libre" as a directive if those strings are removed. |

### 7.2 Care-guide copy spec

Voice: **compare typical care settings** so people can talk with a clinician. Forbidden: instructing the reader to take a drug, skip the ER, or treat this as a diagnosis.

**There is no `tools.scenarios.*` object.** Inventory is these keys (both `en.json` and `es.json`). All must be reviewed and rewritten if they still read as personal triage:

| Key                                                                            | Notes                                                                                                     |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `careGuideTitle`, `careGuideDescription`                                       | Description must not promise “choosing the right place.”                                                  |
| `homeCare`, `homeCareBody`, `homeCareChecklist`                                | Checklist is educational examples, not “if you have X, stay home.”                                        |
| `primaryCare`, `primaryCareBody`, `primaryCareChecklist`                       |                                                                                                           |
| `urgentCare`, `urgentCareBody`, `urgentCareChecklist`                          | “Sprains / moderate fever” as examples of what urgent-care clinics **often treat**, not instructions.     |
| `emergency`, `emergencyBody`, `emergencyChecklist`                             | Keep life-threatening examples.                                                                           |
| `scenarioSoreThroatTitle`, `scenarioSoreThroatBody`, `scenarioSoreThroatLevel` | “How settings differ,” plus: this is not a recommendation for your symptoms.                              |
| `scenarioChestPainTitle`, `scenarioChestPainBody`, `scenarioChestPainLevel`    | **Keep US 911** as emergency education, not deleted. Qualify region.                                      |
| `whenInDoubtTitle`, `whenInDoubtBody`                                          | No “go to urgent care” as a directive.                                                                    |
| Persistent line on the page (new key `tools.scenarioNotAdvice` if needed)      | “These examples describe common care settings. They are not a clinical recommendation for your symptoms.” |

Examples of direction:

- `homeCareBody`: "Home care often means rest and fluids while mild symptoms improve. A clinician or pharmacist can advise whether an over-the-counter option is appropriate for you."
- Sore throat: "People often start by contacting their usual clinic or nurse line. This page cannot tell you what you have."
- `whenInDoubtBody`: "If you think you may be having an emergency, use local emergency services. In the United States that is 911. This site cannot triage you."

Keep the four cards (home / primary / urgent / emergency) as **definitions**, not a decision tree that outputs an action. Each scenario: (1) how clinicians evaluate that presentation in different settings, (2) warning signs that are emergencies, (3) the not-advice line.

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
- [ ] All §7.2 keys rewritten in EN and ES; checklists are not a stay-home/go-now tree.
- [ ] Chest-pain scenario still names US 911.
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
**Dependencies:** None. Guest migrate already uses `onConflict: "user_id,quiz_id"` (no-op until Phase 6 unique exists; still correct).

### 8.1 Scope

| File                                            | How                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/guestProgress.ts`                      | Canonical guest store: **`localStorage`**, keys stay `hmc_guest_completedLessons` and `hmc_guest_quizAttempts`. **Do not** merge quiz attempts into `STORAGE_KEYS.quizScores`. Guest quiz type: `{ quizId: string, score: number, maxScore: number, passed?: boolean, answers?: number[] }`. Type-guard on read. One-time copy from `sessionStorage` same keys, then delete session keys. |
| `src/components/AppProviders.tsx`               | Keep writing `STORAGE_KEYS` for **UI** (`QuizScore` = `{ lessonId, score, passed, completedAt }`). `guestProgress.markLessonComplete` also merges into `STORAGE_KEYS.completedLessons`. `guestProgress.saveQuizAttempt` writes **guest quiz keys only** (quizId). `recordQuizScore` still updates UI `quizScores` with `lessonId` — separate object.                                      |
| `src/hooks/useProgress/guestMigration.ts`       | `.then/.catch/.finally`. On throw, `setIsMigrationLoading(false)`. On `result.ok` or empty guest, `setMigrated(true)`. Export callback `onMigrated` to refetch.                                                                                                                                                                                                                           |
| `src/hooks/useProgress.ts`                      | Pass `onMigrated` into `useSupabaseProgress` **or** return `refreshProgress` from supabaseProgress and call it when migration completes. **Do not** fetch progress until migration finished when guest data exists. Algorithm: if user && guest has data → migrate first → then fetch. If no guest data → fetch immediately.                                                              |
| `src/hooks/useProgress/supabaseProgress.ts`     | Accept `enabled: boolean` or `refreshToken`. When `enabled` goes true, fetch. Expose `refetch`.                                                                                                                                                                                                                                                                                           |
| `src/lib/guestProgress.test.ts`                 | localStorage tests; session fallback; schema guard rejects `{foo:1}` and `{ lessonId: "x" }` without `quizId`.                                                                                                                                                                                                                                                                            |
| `src/hooks/useProgress/guestMigration.test.tsx` | catch path; refetch order (mock).                                                                                                                                                                                                                                                                                                                                                         |

### 8.2 Step-by-step

1. Add `function isStringArray(x: unknown): x is string[]`.
2. Add quiz attempt guard.
3. `getStorage()` → `localStorage` with try/catch.
4. `migrateLegacySessionGuest()`: if local guest keys empty, read `sessionStorage` `hmc_guest_completedLessons` / `hmc_guest_quizAttempts`, parse safely, write local, `sessionStorage.removeItem`.
5. `getGuestProgress()`: union lesson IDs from guest key **and** `STORAGE_KEYS.completedLessons`. Quiz list = **only** guest attempt objects with `quizId` (never map `lessonId` → `quiz_id`).
6. `migrateGuestProgressToSupabase`: upsert lessons by `lesson_id`; upsert quizzes by `quiz_id` from guest attempts only. `clearGuestProgress` only if `errors.length === 0`. Clearing removes `hmc_guest_*` and must **not** wipe preferences. Order: migrate → refetch → then `clearGuestProgress`. Do not send `QuizScore.lessonId` as `quiz_id`.
7. Wire `useProgress`: `const { isMigrationLoading, migrated } = useGuestMigration(...)`. `useSupabaseProgress(user, supabase, { fetchWhen: !isMigrationLoading && !!user })`. When `migrated` flips true, `refetch()`.
8. `isLoading` remains `isMigrationLoading \|\| authLoading` plus fetch in-flight if you add `isFetchLoading`.

### 8.3 Tests

- `guestProgress.test.ts` — existing session tests updated to localStorage; new test: data only in `hmc-completed-lessons` still migrates; malformed JSON → `[]`.
- `guestMigration.test.tsx` — migrate reject → loading false; after resolve refetch called.
- `useProgress.test.tsx` — if it asserts parallel fetch, update.

**Playwright:** hard without real auth. Skip live migrate e2e. Optional mock-auth flow if `e2e` already has it (`e2e/dashboard.spec.ts`) — do not invent a new auth stack.

### 8.4 Acceptance

- [ ] Guest quiz JSON in localStorage contains `quizId`, never only `lessonId`.
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

**Rationale:** Unique `(user_id, quiz_id)` makes `.insert()` on retake fail (`23505`). Optimistic score without rollback is a lie. Guest migrate already upserts — authenticated path does not.

**Complexity:** Medium  
**Risk:** Medium (data + deploy coupling)  
**Dependencies:** Phase 1 **`014` applied**. **`015` is applied in this phase, in the same production window as the upsert client.** Do not apply `015` while `mutations.ts` still `.insert()`.

### 9.1 Scope

| File                                                | How                                                                                                                                                                                                                                                                         |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/pending/015_quiz_attempts_best_score.sql` | **Move** to `supabase/migrations/015_quiz_attempts_best_score.sql`.                                                                                                                                                                                                         |
| `supabase/rollback/015_emergency.sql`               | Drop unique only. Not a forward migration.                                                                                                                                                                                                                                  |
| `src/hooks/useProgress/mutations.ts`                | `saveQuizAttempt`: keep previous attempts snapshot; on error restore and toast; use `.upsert(..., { onConflict: QUIZ_ATTEMPTS_ON_CONFLICT })` with `ignoreDuplicates: false`. If new score < existing in memory, skip network write. If new score wins, send new `answers`. |
| `src/lib/supabase/schema.ts`                        | Use `QUIZ_ATTEMPTS_ON_CONFLICT` from Phase 1.                                                                                                                                                                                                                               |
| `src/hooks/useProgress/mutations.test.ts`           | Error path restores previous; upsert called not insert; lower score does not clobber (if implemented).                                                                                                                                                                      |
| `src/lib/dashboard/progress.ts`                     | `getUserProgressSummary`: unique by `quiz_id` keeping max score before counting passed / average. `totalQuizzesAttempted` = unique quiz ids, not row count.                                                                                                                 |
| `src/lib/dashboard/progress.test.ts`                | Fixture with two rows same quiz_id (if mock returns dupes) → one attempt.                                                                                                                                                                                                   |
| `src/lib/guestProgress.ts`                          | Already upserts; confirm `onConflict` string matches.                                                                                                                                                                                                                       |

### 9.2 Step-by-step

0. **Backup + apply `015` (production), same window as this Netlify deploy:**
   - `create table quiz_attempts_backup_20260827 as select * from quiz_attempts;`
   - Move pending file into `supabase/migrations/`.
   - `npx supabase db push` must list **only** `015` as new. Abort if `009`–`014` replay.
   - Verify unique exists and duplicate pairs = 0 **before** or **immediately as** the upsert client goes live. If unique lands while old client is still serving, authenticated retakes 23505 — keep the previous deploy until this one is ready, or take a short maintenance window.
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

- [ ] `015` applied: unique `(user_id, quiz_id)` exists; duplicate pairs = 0.
- [ ] No `.insert()` on `quiz_attempts` in `src/` except tests/mocks.
- [ ] Retake with unique constraint does not toast save error when score updates or is lower.
- [ ] Failed network restores previous best score in UI.
- [ ] Dashboard average/passed counts unique quizzes.

### 9.5 Rollback

Client revert **and** `supabase/rollback/015_emergency.sql` (drop unique) must be paired. Unique live + `.insert()` client = broken retakes. Do not put rollback SQL in `supabase/migrations/`.

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
| `src/data/lessonMeta.ts`                    | **New, hand-written or generated in this phase (small).** Export `BEGINNER_LESSON_IDS: readonly string[]` (locale-identical IDs + levels from frontmatter). **No MDX bodies. Do not import `lessonBundles` or `loadLessons`.** If generating, a tiny script is OK; do not wait for Phase 14.                                                                                                                                                                                                                                                                                       |
| `src/lib/glossaryLookups.ts`                | **New.** get/set unique term ids.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Beginner complete: in `handleLessonCompletionSideEffects`, count `completedIdsAfter.filter(id => BEGINNER_LESSON_IDS.includes(id))` vs `BEGINNER_LESSON_IDS.length`. Pass `totalBeginnerLessonsCompleted` / `totalBeginnerLessonsAvailable` into `checkAndAwardAchievements` (API already exists).

**Forbidden:** `import("@/lib/lessons/loadLessons")` or `@/data/lessonBundles` from any `'use client'` module or from `sideEffects.ts`. That re-opens PERF-01 and fights Phase 14.

Path complete: after adding lesson, if any path's lessons all ⊆ completed set, `pathCompleted: true`. Keep existing dynamic `import("@/lib/paths/loadPaths")` for now; Phase 14 splits that import by locale.

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

| File                                                                       | How                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/content/ClinicalCitationBlock.tsx`                         | **New.** Props: `sources?: string[]`, `reviewedBy?: string`, `lastReviewed?: string \| null`, `compact?: boolean`. Renders nothing if all empty. Compact: one line under H1. Full: list like `LessonNotes`.                                                                                                                                                                                                                                                                                         |
| `src/components/content/TrustBanner.tsx`                                   | **New.** i18n `trust.banner` — "Clinically reviewed health education — plain language. Not medical advice." Home + catalog headers. **`<sm`:** `text-label-sm py-1 px-3` single line (Phase 13 also moves hero video below CTAs). Not dismissible.                                                                                                                                                                                                                                                  |
| `src/components/Hero.tsx`                                                  | Place TrustBanner above H1 (below existing eyebrow or replace eyebrow if duplicate).                                                                                                                                                                                                                                                                                                                                                                                                                |
| `src/components/lesson/LessonHeader.tsx`                                   | After H1, compact citation (`reviewedBy`, sources join with `/`, date).                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `src/components/lesson/LessonNotes.tsx`                                    | Also show `reviewedBy`. Keep bottom sources list (OK to duplicate compact + full; if duplicate feels noisy, compact in header + sources only in notes). **Chosen:** compact in header; notes keep full sources + reviewedBy + date.                                                                                                                                                                                                                                                                 |
| `src/app/[locale]/articles/[slug]/ArticlePageClient.tsx`                   | Compact under title chips; full `ClinicalCitationBlock` after article body (before share row).                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/components/PageHeader.tsx`                                            | Optional `trust?: boolean` slot — use on learn/articles/tools index pages.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/app/[locale]/learn/page.tsx` / `articles/page.tsx` / `tools/page.tsx` | Pass trust slot or mount TrustBanner.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `src/messages/en.json` / `es.json`                                         | `trust.banner`, `learn.reviewedBy`, `articles.sources`, `articles.reviewedBy` (if missing).                                                                                                                                                                                                                                                                                                                                                                                                         |
| `scripts/validate-content.ts`                                              | Lessons + articles: `sources.length ≥ 1`; each source trimmed length ≥ 3; `reviewedBy` trimmed length ≥ 3. **Denylist (case-insensitive exact or whole-string):** `Web`, `TBD`, `TODO`, `lorem`, `placeholder`, `Medical Team`. `"Health Education Review Team"` and `"RN Health Education Team"` **pass**. Keep existing `assertFreshReview` (400-day fail / 365-day warn). **Do not** add credential regex (`MD\|DO\|PharmD`). **Do not** change fail window to 24 months (that weakens 400-day). |
| `scripts/validate-content.test.ts`                                         | Assert current MDX corpus passes (will fail if any file lacks sources — **fix MDX** in this PR, do not weaken the assertion).                                                                                                                                                                                                                                                                                                                                                                       |
| `content/articles/{en,es}/*.mdx` / `content/lessons/{en,es}/*.mdx`         | Only if validator finds gaps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

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
- [ ] Home shows trust banner (compact on mobile).
- [ ] `content:validate` fails if sources/reviewedBy missing **or** placeholder-denylisted. Existing 400-day `lastReviewed` fail still on.
- [ ] `"Health Education Review Team"` still passes.
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
| `src/app/not-found.tsx`                         | **Already has `<html>`/`<body>`.** Import `src/app/globals.css`. Set `<html className="theme-light" lang="en">` (or equivalent static token). **Do not** read preference cookies here (hydration / static constraint already documented in file). Wrap buttons with `size` via `getButtonClasses` adding `min-h-12 px-6`.                                                                                   |
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
| `src/components/Header.tsx`                                       | Drawer close already `min-h-11` on the menu **toggle** (no separate 36px control). **Verify** bounding box ≥ 44 on 390px; bump only if still short.                                                |
| `src/components/PageHeader.tsx`                                   | Breadcrumb `Link`: `inline-flex min-h-11 items-center py-2.5`.                                                                                                                                     |
| `src/app/[locale]/learn/LearnClient.tsx`                          | Filter pills already use `.chip` (`min-height: 44px`) + `px-4 py-3`. **Verify-first.** If still < 44, add `min-h-11`. Do not restyle from `py-1` (that class is not current).                      |
| `src/components/quiz/QuizQuestion.tsx`                            | Options already full-row `px-5 py-4` labels. **Verify-first** on 390px. Rewrite only if bounding box < 44.                                                                                         |
| `src/app/[locale]/glossary/GlossaryClient.tsx`                    | Mobile `< sm`: `flex flex-nowrap overflow-x-auto snap-x snap-mandatory` + `scrollbar-none`; each letter `snap-center min-h-11 min-w-11 shrink-0`. Desktop can keep wrap. `showAlphabet` unchanged. |
| `src/app/[locale]/glossary/GlossaryClient.test.tsx`               | if missing, add **new** for letter buttons.                                                                                                                                                        |
| `src/components/mdx/InlineGlossaryTerm.tsx`                       | Trigger: `relative` + `after:absolute after:-inset-y-1.5 after:-inset-x-1`; parent paragraph `leading-[1.75]` may live in `MarkdownRenderer` / `prose-hmc`.                                        |
| `src/components/mdx/InlineGlossaryTerm.test.tsx`                  | exists — assert expander class.                                                                                                                                                                    |
| `src/app/[locale]/tools/visit-checklist/VisitChecklistClient.tsx` | Verify label wrap. Set checkbox `h-6 w-6` and row `min-h-12`. If already good, only checkbox size.                                                                                                 |

### 14.2 Tests

- Footer, GlossaryClient, InlineGlossaryTerm, VisitChecklistClient (existing), LearnClient if tests exist.

**Playwright:** `e2e/visual.spec.ts` mobile 390:

- Footer About link box height ≥ 44.
- Glossary: letter row `overflow-x` (evaluate computed style) or screenshot.
- Learn filter pill height ≥ 44.

### 14.3 Acceptance

- [ ] Footer links ≥ 44px tall.
- [ ] Terms TOC links ≥ 44px.
- [ ] PageHeader breadcrumb links ≥ 44px tall.
- [ ] Inputs ≥ 48px / 16px font.
- [ ] Glossary A-Z does not wrap into a 26-button grid on 390px.
- [ ] Inline terms have expanded hit area.
- [ ] Checklist rows full-label tappable.
- [ ] Quiz options / learn chips / header toggle: verified ≥ 44 or patched.

### 14.4 Rollback

Revert PR.

---

## Phase 12 — Search UX/a11y + visit planner i18n/focus

**Goal:** Search announces counts, groups by type, shows index loading; planner persists IDs not translations; step changes move focus; summary has contrast.

**Complexity:** Medium–high (planner storage migration)  
**Risk:** Medium  
**Dependencies:** None.

### 15.1 Scope

| File                                                                       | How                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/SearchDialog.tsx`                                          | `indexStatus: "loading" \| "ready" \| "error"`. While loading, `aria-busy` and status text `search.loadingIndex`. Do not show "no results" when `entries.length===0 && query==="" && loading`.                                                                                                                     |
| `src/components/search/SearchDialogContent.tsx`                            | Group `results` by `type` order: lesson, path, article, glossary, tool. Section headers `search.groupLessons` etc. with counts. Visually hidden `role="status" aria-live="polite"` `{count} {search.resultsFound}` — **debounce 350ms** after last keystroke. Panel: `max-h-[calc(100dvh-14rem)] overflow-y-auto`. |
| `src/messages`                                                             | `search.loadingIndex`, `search.resultsFound`, group labels (some `typeLesson` exist — reuse).                                                                                                                                                                                                                      |
| `src/types/visitPlanner.ts`                                                | `selectedQuestions` remains `string[]` but values are ids `new-symptom:0`.                                                                                                                                                                                                                                         |
| `src/app/[locale]/tools/visit-planner/useVisitPlanner.ts`                  | Persist ids. Hydrate: if value matches `/^(new-symptom\|medication\|followup):\d+$/` use as-is; else map old locale text → id via provided `questionCatalog`; else drop. Custom questions unchanged.                                                                                                               |
| `src/app/[locale]/tools/visit-planner/VisitPlannerClient.tsx`              | Build catalog `{ id, text }[]` from `t.raw("plannerQuestions")` with index ids. Pass texts to step 2 by resolving ids. `useRef` on step `<h2 tabIndex={-1}>`; `useEffect` on `step` → `headingRef.current?.focus()`.                                                                                               |
| `src/app/[locale]/tools/visit-planner/components/Step2SelectQuestions.tsx` | Toggle by id.                                                                                                                                                                                                                                                                                                      |
| `src/app/[locale]/tools/visit-planner/components/Step3Review.tsx`          | Summary container `border-2 border-primary/20 bg-surface-container-lowest p-6 shadow-elevation-2`. Resolve ids to current locale text.                                                                                                                                                                             |
| `src/app/[locale]/tools/visit-planner/useVisitPlanner.test.ts`             | ID persist; EN strings in storage migrate when catalog passed.                                                                                                                                                                                                                                                     |
| `src/app/[locale]/tools/visit-planner/VisitPlannerClient.test.tsx`         | **New.** Step 1→2; mock focus.                                                                                                                                                                                                                                                                                     |
| `src/components/search/SearchDialogContent.test.tsx`                       | Group headers; live region.                                                                                                                                                                                                                                                                                        |

### 15.2 Planner ID scheme

`{visitType}:{zeroBasedIndex}` matching array order in `en.json` / `es.json` (must stay same length/order — already locale-parity).

Default selected → `["medication:1","followup:3"]` (side effects to watch for; when to follow up). **Not** `new-symptom:0/1` (cause / which tests).

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

| File                                                                    | How                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/Hero.tsx`                                               | H1 `text-[clamp(2.25rem,3.5vw+1rem,3.5rem)] leading-[1.1] mb-4` instead of `clamp(3rem,7vw,5.6rem) leading-[0.95]`. **`<sm`:** primary CTAs immediately under subtitle; autoplay video **below** those buttons in DOM. TrustBanner already compact from Phase 8. |
| `src/components/Hero.test.tsx`                                          | class contains new clamp.                                                                                                                                                                                                                                        |
| `src/app/[locale]/articles/[slug]/ArticlePageClient.tsx`                | Body `max-w-prose` (~65ch) `leading-[1.75]`. Desktop `lg:` grid: sticky TOC `w-60` from `article.content.sections` titles, `position: sticky top-24`. TOC links `#section-slug`. Add `id` on each `<section>`.                                                   |
| `src/lib/slugify.ts`                                                    | Reuse if exists; else small slug helper.                                                                                                                                                                                                                         |
| `src/components/quiz/QuizFeedback.tsx`                                  | Always render wrapper `min-h-[140px]`. Inner alert only when `showResult`.                                                                                                                                                                                       |
| `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx`                     | Sticky action bar optional; min-height on feedback is enough.                                                                                                                                                                                                    |
| `src/components/learn/LessonCard.tsx` / `ResourceCard`                  | Title `text-title-md line-clamp-2`; grid gap on parent `LearnClient` `gap-6`.                                                                                                                                                                                    |
| `src/app/[locale]/learn/LearnClient.tsx`                                | `gap-6` on card grids.                                                                                                                                                                                                                                           |
| `src/app/[locale]/learning-paths/[pathId]/LearningPathDetailClient.tsx` | `< sm`: stacked card + `Step X of Y` badge instead of cramped horizontal milestone.                                                                                                                                                                              |
| `src/components/quiz/QuizFeedback.test.tsx`                             | **new** if missing — wrapper always in document.                                                                                                                                                                                                                 |
| `src/app/[locale]/learn/[slug]/quiz/QuizClient.test.tsx`                | **new** — light: renders question title from fixture (heavy supabase mocked).                                                                                                                                                                                    |

### 16.2 Tests

As table.

**Playwright:** 1440 `/en` — primary CTA `Start learning` bounding box `y + height < 900`. Article `/en/articles/understanding-your-eob` — TOC visible at lg; paragraph max width ≤ 720px (evaluate). Quiz: optional screenshot stability skip.

### 16.3 Acceptance

- [ ] Hero H1 ≤ 56px at 1440.
- [ ] 390px: primary CTAs above video; TrustBanner one line.
- [ ] Article measure ~65ch; TOC on desktop.
- [ ] Quiz feedback slot reserved.
- [ ] Lesson card titles clamp; filters from Phase 11.
- [ ] Path detail usable at 390.

### 16.4 Rollback

Revert PR.

---

## Phase 14 — Locale content code-splitting (descoped)

**Goal:** Client JS for a given locale does not parse the other locale’s **path** (and lesson/quiz/glossary **if they are in the client graph**) bundles. Server SSG keep sync loaders.

**Rationale:** Combined barrels are regenerated by `scripts/bundle-*.ts`. Hand-editing them is undone by Phase 8 `content:bundle`. Today `QuizClient` already receives props; the real client dual-locale hit is `sideEffects` → `import("@/lib/paths/loadPaths")` → `pathBundles` (both locales). `src/data/lessons.ts` imports the combined lesson barrel then exports EN only — still packs ES into that module for anyone who imports it.

**Complexity:** Medium (was High)  
**Risk:** Medium (was High) — **no** mass `getAllLessons` → async conversion  
**Dependencies:** After correctness phases. **Day 4, not first thing in the morning.** Do **not** move this to Day 2.

### 17.1 Scope

| File                                                                   | How                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/bundle-lessons.ts`                                            | Still emit `lessonBundles.en.ts` / `.es.ts`. Combined `lessonBundles.ts`: either **stop emitting** it, or emit a file that **only** re-exports types + documents “do not import from client.” Preferred: emit `loadLessonBundle(locale)` **dynamic** helper in a **non-generated** `src/lib/lessons/loadLessonsForLocale.ts` that `switch`es `import("@/data/lessonBundles.en")`. Generator must not overwrite that helper. |
| `scripts/bundle-quizzes.ts` / `bundle-paths.ts` / `bundle-glossary.ts` | Same: locale files remain generated; **stop** or stop-using combined barrels from client. Update scripts so CI `content:bundle` cannot restore `import { en } from "./x.en"; import { es } from "./x.es"` into a module that client imports.                                                                                                                                                                                |
| `src/lib/paths/loadPaths.ts`                                           | **Client-safe:** `export async function loadPathsForLocale(locale)` with `switch` dynamic import of `pathBundles.en` / `.es` **only**. `getAllLearningPaths` sync may remain for **server** files if it imports **one** locale via a server-only wrapper. `pathsCache.ts` must call the async **single-locale** loader, not the combined barrel.                                                                            |
| `src/data/lessons.ts`                                                  | Stop `import { lessonBundles } from "@/data/lessonBundles"` (pulls both). Import `@/data/lessonBundles.en` only (IDs are locale-identical for `generateStaticParams`).                                                                                                                                                                                                                                                      |
| `src/lib/lessons/loadLessons.ts`                                       | **Keep sync `getAllLessons` for server.** Implement by importing **one** locale module inside a `switch` **without** a shared `Record` object that statically imports both. If a static switch still dual-packs in webpack, use **separate server files** `loadLessons.en.ts` / `loadLessons.es.ts` imported only from server `page.tsx` via locale branch. **Do not** convert every `getAllLessons(` caller to async.      |
| `src/lib/localizedQuiz.ts`                                             | Server-only (already used from `page.tsx`). Same single-locale static pattern. Not imported from `QuizClient`.                                                                                                                                                                                                                                                                                                              |
| `src/hooks/useProgress/sideEffects.ts`                                 | **No** `loadLessons`. Paths: single-locale dynamic import.                                                                                                                                                                                                                                                                                                                                                                  |
| Tests                                                                  | Generator tests or snapshot: combined barrel is not imported from any file matching `'use client'`. Analyzer: EN client chunk lacks a distinctive ES lesson title.                                                                                                                                                                                                                                                          |

### 17.2 Steps (do not guess)

1. `rg 'use client' -l src | xargs rg 'lessonBundles|quizBundles|pathBundles|glossaryBundles|loadLessons|localizedQuiz|loadPaths'` — list client hits. Expected today: `pathsCache` / `sideEffects` / maybe glossary tokenizer. Lesson/quiz pages already pass props.
2. Change generators so `content:bundle` cannot recreate a client-imported dual barrel.
3. Fix each **client** hit with locale-dynamic import or props from server.
4. Keep server `getAllLessons(locale)` sync.
5. `npm run analyze` (or `source-map-explorer` on the lesson client chunk): English session must not contain a distinctive Spanish string from `lessonBundles.es.ts`. If only path bundles were in the client graph, prove path ES strings are absent.

### 17.3 Tests

- Generator still writes `*.en.ts` / `*.es.ts`.
- `loadPaths` client path: mock shows only one locale module imported.
- Existing `loadLessons.test.ts` can stay sync.

**Playwright:** smoke `/en/learn` and `/es/learn` still render titles.

### 17.4 Acceptance

- [ ] `content:bundle` does not restore a client dual-locale barrel.
- [ ] Client graph for `/en/learn/[slug]` does not include `lessonBundles.es` **or** `pathBundles.es` (analyzer evidence on the PR).
- [ ] All locales still SSG. `getAllLessons` remains sync on the server.
- [ ] Search still lazy-loads `searchIndex.${locale}`.
- [ ] Phase 7 still uses `BEGINNER_LESSON_IDS`, not `loadLessons`.

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
| `src/lib/errorReporting.ts`                                | `beforeSend`: scrub `event.extra`, `event.user`, `breadcrumbs[].data` with `sanitizeContext` + `scrubPII`. Keys: lesson, quiz, path, email. **Also:** strip `?…` from `event.request.url` and breadcrumb URLs; drop `ui.input` breadcrumb values (or replace with `[redacted]`). Keep existing console-breadcrumb drop.                                                                                                                                       |
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

**Edge cases:** simple mode still shows it (high importance). Dark theme: use `bg-surface-container` + `text-on-surface`, not low-contrast mint. **Mobile:** compact padding so hero CTAs stay in view (Phase 13).

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

**Data model:** existing `achievements` table. Unique `(user_id, achievement_id)`. RLS ownership unchanged. **No new tables.** Glossary count is **localStorage** `hmc-glossary-lookups` (JSON string array of term ids), not a cloud column. Beginner set is `BEGINNER_LESSON_IDS` in `lessonMeta.ts` — **not** `loadLessons` / MDX bundles.

**Edge cases:** user switches browsers → glossary-reader progress resets (acceptable). Streak uses UTC dates (`streaks.ts`). Parallel lesson completes can still race streaks (out of scope to RPC).

**Analytics:** none.

**A11y:** toasts already `aria-live`; Spanish strings required.

**Phase:** 7 (+ empty state in 15).

---

### 10.9 Visit planner locale-stable storage (BUG-06)

**User story:** As a bilingual user, my saved questions stay the same questions after I switch language.

**UX flow:** unchanged stepper. Persistence format version: ids. Custom questions still `{id, text}` in the language they typed (not translated).

**Data:** `localStorage` `hmc-visit-planner` only. No Supabase.

**Edge cases:** see Phase 12 hydrate. Default ids `medication:1` and `followup:3`. Changing visit type still resets selected ids (keep current `changeVisitType` behavior unless tests require otherwise).

**Analytics:** none.

**A11y:** step heading focus (Phase 12).

**Phase:** 12.

---

# 11. Out of scope (4-day window)

| Item                                                                               | Why                                                                               |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Medication schedule generator                                                      | M effort + clinical dosing liability after P0s                                    |
| Lab results decoder                                                                | M effort + range-misinterpretation harm                                           |
| USPSTF screening timeline                                                          | M effort + sex/age medical advice                                                 |
| Medical bill dispute workflow                                                      | M; EOB article already exists                                                     |
| Offline PWA / service worker                                                       | Cache invalidation + PHI-adjacent progress in SW is a project                     |
| Lesson/article TTS                                                                 | M; a11y win but needs voice QA EN/ES                                              |
| Glossary pronunciation audio                                                       | Asset pipeline + hosting                                                          |
| Symptom journal                                                                    | New PHI-ish local dataset + privacy rewrite again                                 |
| Email visit plan (Resend)                                                          | Widens PII; adversarial: not until privacy is true **and** still skip this window |
| jsPDF / clinician PDF                                                              | Print CSS exists                                                                  |
| Cheat-proof streaks/achievements (SECURITY DEFINER RPCs)                           | Integrity, not launch-blocking PHI                                                |
| `time_spent_seconds` instrumentation                                               | Honesty via hiding metric is enough                                               |
| Flesch-Kincaid linter                                                              | NTH; false positives on medical terms                                             |
| Mock client strict `Database` generics                                             | Dev-only                                                                          |
| Localhost CSRF exact port                                                          | Dev-only                                                                          |
| Logo `next/image`                                                                  | NTH                                                                               |
| `@sentry/nextjs` full wizard                                                       | Partial ingest in Phase 16                                                        |
| Credential regex / 24-month `lastReviewed` in validate-content                     | Would fail honest `reviewedBy`; 400-day fail already exists                       |
| Applying/replaying `001`–`013` as-is (including pending `009`–`013` via `db push`) | Would break live policies / lock contact outside 014                              |
| Quiz attempt **history** product (many rows)                                       | Opposite of unique+best-score decision                                            |
| New locales beyond EN/ES                                                           |                                                                                   |
| HIPAA program, patient accounts, messaging                                         | Wrong product                                                                     |
| Upstash fail-closed rate limit                                                     | Availability choice; document only                                                |
| Onboarding on every first lesson (not only `/`)                                    | Nice; skip unless Phase 10 leftover time                                          |
| Streak celebratory animation                                                       | Visual NTH                                                                        |

---

# 12. Global Definition of Done (entire revamp)

The revamp is done when **all** of the following are true. Phase 16 AppProviders-split and N+1 may be unchecked if explicitly dropped in a Day-4 slip note on this file. Phase 14 descoped split must still have analyzer evidence **or** an explicit slip note.

### Security & data

- [ ] Production `contact_submissions` has no public INSERT; anon PostgREST insert fails.
- [ ] Netlify has `SUPABASE_SERVICE_ROLE_KEY`; `/api/contact` returns 2xx on a valid POST in production.
- [ ] `delete_user` exists; Settings deletion removes auth user (spot-check on a throwaway account).
- [ ] `handle_new_user` has `search_path`; not executable by `anon`.
- [ ] `quiz_attempts` unique `(user_id, quiz_id)`; no duplicate pairs. **Applied with Phase 6 client, not Day 1.**
- [ ] Privacy page does not say learning data never leaves the device.
- [ ] CSP in `netlify.toml` and `next.config.mjs` match the canonical list.

### Auth

- [ ] Recovery: `?code=` on reset page **or** confirm `type=recovery` → reset page with session; form not invalid-link.
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

- [ ] Guest progress survives tab close and migrates on login (`quizId` preserved; not `lessonId` as `quiz_id`).
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

- [ ] English session does not download Spanish lesson/quiz/**path** bundles in the main client graph (analyzer evidence attached to Phase 14 PR).

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
P1 (014 only; repair 009–013) ──► P3 env+contact path
P1 daily_log UPDATE ──► P7
P2 (auth routes, session-aware reset) ──► P9
P6 (015 + upsert client, one window) ──► unique live
P4, P8 parallel (copy vs MDX)
P5 independent (guest keys; unique optional until P6)
P7 **no** loadLessons; lessonMeta only
P10–P13 independent
P14 generators + client path split (Day 4, not morning-first)
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
supabase/pending/015_quiz_attempts_best_score.sql
supabase/rollback/014_emergency.sql
supabase/rollback/015_emergency.sql
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
ADV-10, ADV-09, ADV-15 → P1 (`014`)  
ADV-01 SQL file → `supabase/pending/` until P6  
ADV-01 apply + client, ADV-04 → P6  
ADV-12, A11Y-01, MED-03 → P4  
BUG-03, BUG-04, ADV-03 → P5  
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
