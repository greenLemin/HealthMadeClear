# Issues backlog

New findings from phase work. Not fixed in the discovering phase.

## P1-1 — Local migration filenames vs live timestamp versions

**Found:** Phase 1 (2026-08-28)  
**Severity:** High (apply hazard)  
**Status:** open

Live `supabase_migrations.schema_migrations` uses timestamp `version` values (`20260612202742` / name `001_profiles`, … `008_contact_submissions`, plus dummy `20260825133455` / `create_test_file`). Repo files are `001_profiles.sql` … `014_launch_reconcile.sql`.

`npx supabase db push` may treat numbered local files as unapplied even though 001–008 already ran under timestamps. Plan already requires repair-as-applied for 009–013; apply runbook must also history-match 001–008 (same `version`/`name` shape as existing rows) so 001–008 are not replayed. Do not invent colliding versions.

## P1-2 — Dummy remote migration `create_test_file`

**Found:** Phase 1 snapshot  
**Severity:** Low  
**Status:** open

Production history includes `20260825133455` / `create_test_file`. Harmless for 014, but it is extra history a future `migration list` must not confuse with numbered launch files. Leave it unless a later hardening phase deletes dummy rows.

## P1-3 — `src/lib/supabase/codemap.md` does not list `schema.ts`

**Found:** Phase 1  
**Severity:** Low  
**Status:** open

Phase 1 file scope listed `supabase/codemap.md` only. `src/lib/supabase/schema.ts` and `schema.test.ts` exist but are absent from `src/lib/supabase/codemap.md`. Update that map in a docs-only follow-up.

## P2-1 — Mock auth has no `verifyOtp`

**Found:** Phase 2 (2026-08-28)  
**Severity:** Medium (local/dev only)  
**Status:** open

`src/lib/supabase/mock/auth.ts` implements `exchangeCodeForSession` but not `verifyOtp`. Phase 2 client now calls `verifyOtp` for `token_hash` recovery. Local mock-client recovery links that still use OTP templates will throw. Out of Phase 2 file scope. Add `verifyOtp` on the mock in a later auth/mock phase.

## P2-2 — Auth codemaps omit `parseAuthRedirect.ts`

**Found:** Phase 2  
**Severity:** Low  
**Status:** open

Phase 2 file scope did not include maps. `src/lib/auth/codemap.md` still lists only `requireAuth.ts` and `sanitizeRedirect.ts`. `src/app/[locale]/auth/codemap.md` still names `callback/page.tsx` and `confirm/page.tsx` though those routes are `route.ts`. Docs-only follow-up.

## P2-3 — Playwright Firefox/WebKit binaries missing locally

**Found:** Phase 2 e2e  
**Severity:** Low (env)  
**Status:** open

`npx playwright test e2e/auth.spec.ts` failed on firefox/webkit: `Executable doesn't exist` under `~/Library/Caches/ms-playwright/`. Chromium passed. Not a product bug. `npx playwright install firefox webkit` on this machine (or CI image) before relying on the three-project config.

## P2-4 — Supabase Auth email templates still a human check

**Found:** Phase 2  
**Severity:** Medium (recovery/confirm in production)  
**Status:** open

Phase 2 §5.2 step 5: dashboard templates must point confirmation at `/{locale}/auth/confirm` (token_hash or PKCE `code`) and recovery at `/{locale}/auth/reset-password` (PKCE `code`). Code cannot change templates. Confirm in the Supabase dashboard before launch; if they still hit `/auth/v1/verify` only, document the required dashboard edits on the Phase 2 PR.

## P2-5 — `REVAMP/PLAN.v10.md` not on `main` disk

**Found:** Phase 2  
**Severity:** Medium (agent contract)  
**Status:** open

Workspace `REVAMP/` on disk had only `ISSUES-BACKLOG.md`. Phase 2 contract was recovered from `origin/cursor/plan-v10-0f7a` (`f7c112ed`). Later phase agents will miss the plan unless that file is copied onto the implementation branch or the plan branch is merged.

## P3-1 — Contact sidebar still says “local storage”

**Found:** Phase 3 (2026-08-28)  
**Severity:** Low (copy drift)  
**Status:** open

`contact.supportPrivacyBody` still reads as questions about “data, local storage, and account preferences.” Privacy copy now says Contact messages live on the server and are not deleted with the account. Out of Phase 3 file scope (`contact.*` keys were not in §6.1). Update that string in a copy follow-up so the contact page does not undercut `/privacy`.

## P3-2 — PostgREST anon INSERT still open until `014` applies

**Found:** Phase 3  
**Severity:** High (same as ADV-10; expected)  
**Status:** open

Phase 3 contact path is the Next route + env gate only. Live `contact_submissions` still has public INSERT until Phase 1 `014` is applied (Gate 0 + Gate 1 still blocking). Do not treat the Phase 3 “after Phase 1” acceptance line as green.

## P3-3 — `PrivacyClient.tsx` is the privacy renderer, not `page.tsx`

**Found:** Phase 3  
**Severity:** Low (docs/scope)  
**Status:** open

§6.1 listed `src/app/[locale]/privacy/page.tsx`. That file only sets locale + mounts `PrivacyClient`. New collect paragraphs had to go in `PrivacyClient.tsx`. Codemap still describes the folder as a generic privacy page. Docs-only follow-up if maps should name the client.

## P4-1 — Tools index still asks “Where should I go?”

**Found:** Phase 4 (2026-08-28)  
**Severity:** Medium (copy drift vs care-guide)  
**Status:** open

§7.2 rewrote `careGuideTitle` to “How care settings differ.” `/en/tools` still uses `tools.careTitle` (“Where should I go?”) and ES `¿Dónde debo ir?` as the card that links to the care guide. Those keys were not in the Phase 4 inventory. Follow-up copy so the tools index does not reintroduce a triage promise.

## P4-2 — Articles catalog still titles a 911 “decision guide”

**Found:** Phase 4  
**Severity:** Medium (content vs liability framing)  
**Status:** open

`/en/articles` now shows `MedicalDisclaimer`, but the catalog still lists “When to Call Your Doctor vs Urgent Care vs 911” with description “A simple decision guide for non-emergency symptoms.” Article MDX is out of Phase 4 file scope (closer to Phase 8). Review that article so it does not undercut the care-guide “not a recommendation” voice.

## P4-3 — Disclaimer emergency strings still informal _tú_ in ES

**Found:** Phase 4  
**Severity:** Low (voice)  
**Status:** open

Care-guide `tools.*` copy now uses _usted_. `disclaimer.emergencyTitle` / `emergencyBody` still use _tú_ (“¿Tienes una emergencia médica?”, “No dependas… Llama…”). Phase 4 only rewrote `emergencyCall` (+ optional `emergencyRegionNote`). Align remaining disclaimer emergency keys in a copy follow-up.
