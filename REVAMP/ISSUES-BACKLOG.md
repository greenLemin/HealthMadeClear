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

Phase 8 (2026-08-28) confirmed this is still live on `/en/articles`. Validator already passed (sources/reviewedBy present), so the required MDX inventory did not include a rewrite. Leave for a copy follow-up.

## P4-3 — Disclaimer emergency strings still informal _tú_ in ES

**Found:** Phase 4  
**Severity:** Low (voice)  
**Status:** open

Care-guide `tools.*` copy now uses _usted_. `disclaimer.emergencyTitle` / `emergencyBody` still use _tú_ (“¿Tienes una emergencia médica?”, “No dependas… Llama…”). Phase 4 only rewrote `emergencyCall` (+ optional `emergencyRegionNote`). Align remaining disclaimer emergency keys in a copy follow-up.

## P6-1 — `supabase/codemap.md` still lists 015 as pending

**Found:** Phase 6 (2026-08-28)  
**Severity:** Low (docs)  
**Status:** open

Phase 6 moved `015_quiz_attempts_best_score.sql` into `supabase/migrations/` and added `supabase/rollback/015_emergency.sql`. File scope did not include `supabase/codemap.md`, which still describes 015 as pending and lists migrations through 014.

## P6-2 — `src/lib/codemap.md` omits `quizScore.ts`

**Found:** Phase 6  
**Severity:** Low (docs)  
**Status:** open

New `src/lib/quizScore.ts` (pass ratio, normalize, percent, lesson quiz ids) is out of the lib atlas. Docs-only follow-up.

## P6-3 — Production `015` apply is post-Published, not this PR

**Found:** Phase 6  
**Severity:** High (ops; expected)  
**Status:** open

§9.2 step 0: wait until Netlify **Published** for the P6 SHA, then backup + `npx supabase db push` **only** 015. Do not apply if the deploy failed. Preflight `SELECT COUNT(*) FROM quiz_attempts WHERE score = max_score AND score > 10`. Spot-check logs 30 minutes after apply for quiz-retake `23505`. This PR ships the client + migration file; it does **not** apply 015.

## P8-1 — ES prescription-label Poison Help paste mixes _tú_ and _usted_

**Found:** Phase 8 (2026-08-28)  
**Severity:** Low (voice)  
**Status:** open

`content/lessons/es/understanding-prescription-labels.mdx` dosage `:::warning` still opens with HEAD _tú_ (“Nunca tomes más de la cantidad indicada”). Phase 8 v10 paste adds _usted_ (“llame primero al 911”). Same callout, two registers. Follow-up should pick one voice; do not change the required 911-first / `1-800-222-1222` facts.

## P10-path — NavLink lives in `header/NavLink.tsx`, not inline in Header

**Found:** Phase 10 (2026-08-28)  
**Severity:** Low (docs/scope)  
**Status:** open

Nav is `src/components/header/NavLink.tsx`, not an inline block in `Header.tsx`. Pre-authorized. Desktop tokens now `xl:text-label-sm xl:px-1.5 xl:gap-0.5`. Update maps/plans that still describe Header-inline nav.

## P10-1 — `.theme-light` has no CSS rule

**Found:** Phase 10 (2026-08-28)  
**Severity:** Low  
**Status:** open

Root 404 (`src/app/not-found.tsx`) sets `className="theme-light"`. `src/app/globals.css` has no `.theme-light` rule. Light tokens come from `:root`. Class is a no-op today; add the rule or drop the class so theme hooks stay honest.

## P10-2 — ErrorBoundary copy is hardcoded bilingual, not catalog keys

**Found:** Phase 10 (2026-08-28)  
**Severity:** Low (i18n wiring)  
**Status:** open

`src/components/ErrorBoundary.tsx` crash/retry strings are hardcoded EN+ES. Catalogs already have `errors.crashBody` / `errors.tryAgain`. Not wired. Follow-up should use those keys (or next-intl) so crash copy cannot drift from catalogs.

## P11-path — Terms TOC lives in `TermsClient.tsx`, not `page.tsx`

**Found:** Phase 11 (2026-08-28)  
**Severity:** Low (docs/scope)  
**Status:** open

`src/app/[locale]/terms/page.tsx` only sets locale and mounts the client. TOC / in-page nav is in `TermsClient.tsx`. Same pattern as privacy (`P3-3`). Update maps that list `page.tsx` as the TOC owner.

## P11-1 — `scrollbar-none` is not a Tailwind utility in this project

**Found:** Phase 11 (2026-08-28)  
**Severity:** Low  
**Status:** open

`scrollbar-none` is not a configured Tailwind utility here. Scrollbar hiding is extra arbitrary utilities. Either add the utility (plugin/theme) or keep documenting the arbitrary workaround so a later Tailwind bump does not silently show scrollbars.

## P11-2 — `PageHeader.test.tsx` Link mock drops `className`

**Found:** Phase 11 (2026-08-28)  
**Severity:** Low (test gap)  
**Status:** open

The `Link` mock in `PageHeader` unit tests does not forward `className`, so breadcrumb `min-h-11` is not unit-asserted. Forward `className` (and other props) on the mock before treating breadcrumb tap-target as covered.

## P11-3 — Same-tab logout: checklist persist skip works; React ticks until remount

**Found:** Phase 11 (2026-08-28)  
**Severity:** Medium (logout UX)  
**Status:** open

Visit-checklist persist skip on logout is in place. Same-tab React ticks can still show prior checklist state until remount. Not a persist bug. Follow-up should reset client state on logout in the same tab, or force remount of checklist consumers.

## P12-path — Step1 visit-type buttons rely on `inert`

**Found:** Phase 12 (2026-08-28)  
**Severity:** Low (defense in depth)  
**Status:** open

Step1 visit-type buttons are gated with `inert`. If a browser ignores `inert`, those controls stay activatable. Pass `disabled` into Step1 as well so non-`inert` agents cannot change visit type.

## P12-1 — Search group header "Other" is English-only

**Found:** Phase 12 (2026-08-28)  
**Severity:** Medium (i18n)  
**Status:** open

Search result grouping still labels the leftover bucket `"Other"` in English on both locales. Add a catalog key and use it for the group header.

## P12-2 — Locale-switch planner display is unit-proven, not e2e

**Found:** Phase 12 (2026-08-28)  
**Severity:** Low (coverage)  
**Status:** open

Visit-planner locale switch is covered at unit level (stable ids). There is no e2e that remounts EN→ES and checks displayed copy. Add a Playwright remount if that path is launch-critical; ids-only tests do not prove catalog strings.

## P13A-2 — H1 ≤ 56px is CSS clamp max, not 1440 computed style

**Found:** Phase 13A (2026-08-28)  
**Severity:** Low (measurement)  
**Status:** open

Hero H1 “≤ 56px” is the CSS `clamp` maximum, not a computed-style read at 1440px viewport. Do not treat the fold token as visually proven at 1440 until that measurement exists.

## P13A-3 — `useMotionSafe` can autoplay once on first paint for reduced-motion

**Found:** Phase 13A (2026-08-28)  
**Severity:** Medium (a11y)  
**Status:** open

`useMotionSafe` is `useReducedMotion() ?? false`. First paint with `null` treats motion as allowed, so reduced-motion users can get one autoplay before the hook resolves. Default to no-motion until known, or gate autoplay on a definite `false`.

## P13A-4 — Stitch image crop (3:2 + max-h) may clip faces

**Found:** Phase 13A (2026-08-28)  
**Severity:** Low (visual)  
**Status:** open

Stitch/hero image is cropped to 3:2 plus a max-height for the fold. Faces (or other focal points) can clip. Visual follow-up: `object-position` or a crop that keeps faces in frame at fold breakpoints.

## P13B-1 — Wave 0 missed `paths.stepXofY`; badge uses `tools.step` + `common.of`

**Found:** Phase 13B (2026-08-28)  
**Severity:** Low (i18n)  
**Status:** open

Wave 0 did not add `paths.stepXofY`. Path step badge composes `tools.step` + `common.of`. Works, but it is the wrong namespace and may not match a dedicated “step X of Y” string. Add `paths.stepXofY` (EN/ES) and switch the badge.

## P13B-2 — `text-title-md` missing from Tailwind type scale

**Found:** Phase 13B (2026-08-28)  
**Severity:** Medium (design token)  
**Status:** open

Cards use `text-title-md`, but that token is not on the Tailwind type scale in this project. Class is present; computed size may not change. Register the token or replace with a real scale class.

## P13B-3 — `src/lib/codemap.md` omits `slugify.ts`

**Found:** Phase 13B (2026-08-28)  
**Severity:** Low (docs)  
**Status:** open

New `src/lib/slugify.ts` is out of the lib atlas (same class of gap as `P6-2` / `quizScore.ts`). Docs-only follow-up.

## P13B-5 — Article progress stays 0 until first scroll

**Found:** Phase 13B (2026-08-28)  
**Severity:** Medium (UX)  
**Status:** open

Article reading progress stays 0 until the first scroll event. Same as lessons: no `handleScroll` on mount. Short articles / already-scrolled restores look empty. Call the scroll handler once on mount (and on resize) so initial percent is correct.

## P13B-path — ResourceCard is `src/components/ui/ResourceCard.tsx`

**Found:** Phase 13B (2026-08-28)  
**Severity:** Low (docs/scope)  
**Status:** open

`ResourceCard` lives at `src/components/ui/ResourceCard.tsx`, not `src/components/learn/`. Update maps/plans that still point at `components/learn/`.

## P14-1 — `ANALYZE=true npm run analyze` still pending

**Found:** Phase 14 (2026-08-28)  
**Severity:** Medium (bundle split unproven)  
**Status:** done/resolved

Analyzer proof in `REVAMP/VERIFY-PHASE-14.md`: EN `/learn/[slug]` required client JS lacks `lessonBundles.es`; `pathBundles.es` only in async chunk 6982, not in that route's required list.

## P14-2 — Leftover combined-barrel server importers

**Found:** Phase 14 (2026-08-28)  
**Severity:** Medium  
**Status:** open

These still import combined barrels on the server: `learningPaths.ts`, `paths.ts`, `glossary.ts`, `loadGlossary.ts`, `sitemap.ts`. Switch them to locale-split loaders (or equivalent) so ES/EN data is not pulled together at the old entry points.

## P14-3 — Split `loadLessons.en.ts` / `.es.ts` if analyzer still shows ES in EN client

**Found:** Phase 14 (2026-08-28)  
**Severity:** Low (contingent)  
**Status:** open

If `P14-1` still shows ES strings in the EN client after the leftover importers in `P14-2` are gone, next step is `loadLessons.en.ts` / `loadLessons.es.ts` imported only from server `page.tsx` (no shared client barrel). Do not do this until the analyzer run says it is needed.

## P14-5 — Codemaps still mention combined barrels

**Found:** Phase 14 (2026-08-28)  
**Severity:** Low (docs)  
**Status:** open

Codemaps still describe combined lesson/path/glossary barrels. Update them to locale-split modules after the split is the real import graph (`P14-1` / `P14-2`).

## P14-path — `useProgress.test.tsx` mock updated for `loadPathsForLocale`

**Found:** Phase 14 (2026-08-28)  
**Severity:** Low (test contract)  
**Status:** open

`useProgress.test.tsx` mock was updated for `loadPathsForLocale`. That mock is required or the suite fails. Any later loader rename must keep the test mock in lockstep.

## P15-4 — Care-guide print footer date is mount-time

**Found:** Phase 15 (2026-08-28)  
**Severity:** Low  
**Status:** open

Care-guide print footer date is captured at mount. An overnight tab can print yesterday’s date. Refresh the date on `beforeprint` (or equivalent) so the footer matches print time.

## P16A-1 — `ProgressClient.tsx` still `formatDuration(totalTimeSpentMinutes)`

**Found:** Phase 16A (2026-08-28)  
**Severity:** Medium (wrong dashboard number)  
**Status:** open

`/dashboard/progress` can show `0 min` because `ProgressClient.tsx` still calls `formatDuration(totalTimeSpentMinutes)`. Out of 16A allowed files. Follow-up should use the same duration source as the rest of the dashboard (or convert units) so progress time matches stats.

## P16A-2 — `.env.example` and `docs/DEPLOYMENT.md` omit server Sentry vars

**Found:** Phase 16A (2026-08-28)  
**Severity:** Low (docs)  
**Status:** open

Server `SENTRY_DSN` and `SENTRY_SERVER_SAMPLE_RATE` are mentioned in `netlify.toml` comments only. `.env.example` and `docs/DEPLOYMENT.md` omit them. Document both so production is not configured with the public DSN alone.

## P16A-3 — Server Sentry stays console-only if Netlify has only `NEXT_PUBLIC_SENTRY_DSN`

**Found:** Phase 16A (2026-08-28)  
**Severity:** Medium (ops)  
**Status:** open

If Netlify defines `NEXT_PUBLIC_SENTRY_DSN` but not server `SENTRY_DSN`, `reportServerError` stays console-only. Set the server DSN (and sample rate) in the Netlify env for the production site; public DSN does not cover server reports.

## P10-16-e2e — Chromium-only wave verification; mock-auth dashboard redirect locale prefix

**Found:** Phase 10–16 (2026-08-28)  
**Severity:** Low (env / pre-existing e2e)  
**Status:** open

This wave’s Playwright checks ran Chromium only. Firefox/WebKit binaries are still missing locally (`P2-3`; do not duplicate). Separate pre-existing mock-auth dashboard redirect expects `redirect=%2Fdashboard` but got `redirect=%2Fen%2Fdashboard`. Locale-prefixed redirect is out of P10–16 product scope; fix the assertion (or mock-auth helper) in an auth/e2e follow-up.
