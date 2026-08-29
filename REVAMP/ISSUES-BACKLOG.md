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
**Status:** done

`src/lib/supabase/codemap.md` lists `schema.ts` and `schema.test.ts`.

## P2-1 — Mock auth has no `verifyOtp`

**Found:** Phase 2 (2026-08-28)  
**Severity:** Medium (local/dev only)  
**Status:** done

`createMockAuth` `verifyOtp` consumes `token_hash` / `token` on the same path as `exchangeCodeForSession`. Covered in `mockClient.test.ts`.

## P2-2 — Auth codemaps omit `parseAuthRedirect.ts`

**Found:** Phase 2  
**Severity:** Low  
**Status:** done

`src/lib/auth/codemap.md` lists `parseAuthRedirect.ts`. Auth app map names `callback/route.ts` and `confirm/route.ts`.

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
**Status:** done

`REVAMP/PLAN.v10.md` is on `main` (`90aaad56`).

## P3-1 — Contact sidebar still says “local storage”

**Found:** Phase 3 (2026-08-28)  
**Severity:** Low (copy drift)  
**Status:** done

`contact.supportPrivacyBody` now names Contact messages stored on the server. ES uses _usted_.

## P3-2 — PostgREST anon INSERT still open until `014` applies

**Found:** Phase 3  
**Severity:** High (same as ADV-10; expected)  
**Status:** open

Phase 3 contact path is the Next route + env gate only. Live `contact_submissions` still has public INSERT until Phase 1 `014` is applied (Gate 0 + Gate 1 still blocking). Do not treat the Phase 3 “after Phase 1” acceptance line as green.

## P3-3 — `PrivacyClient.tsx` is the privacy renderer, not `page.tsx`

**Found:** Phase 3  
**Severity:** Low (docs/scope)  
**Status:** done

`src/app/[locale]/privacy/codemap.md` names `PrivacyClient.tsx`. Locale `codemap.md` already did.

## P4-1 — Tools index still asks “Where should I go?”

**Found:** Phase 4 (2026-08-28)  
**Severity:** Medium (copy drift vs care-guide)  
**Status:** done

`tools.careTitle` matches `careGuideTitle` (EN/ES). Card no longer asks where to go.

## P4-2 — Articles catalog still titles a 911 “decision guide”

**Found:** Phase 4  
**Severity:** Medium (content vs liability framing)  
**Status:** done

`when-to-call-your-doctor` title/description (EN+ES) drop “decision guide” / triage promise. Lead sentence states the page is not a recommendation. 911 lists unchanged.

## P4-3 — Disclaimer emergency strings still informal _tú_ in ES

**Found:** Phase 4  
**Severity:** Low (voice)  
**Status:** done

`disclaimer.emergencyTitle` / `emergencyBody` now use _usted_.

## P6-1 — `supabase/codemap.md` still lists 015 as pending

**Found:** Phase 6 (2026-08-28)  
**Severity:** Low (docs)  
**Status:** done

`supabase/codemap.md` lists `migrations/015_quiz_attempts_best_score.sql` and `rollback/015_emergency.sql`. Apply remains P6-3.

## P6-2 — `src/lib/codemap.md` omits `quizScore.ts`

**Found:** Phase 6  
**Severity:** Low (docs)  
**Status:** done

`src/lib/codemap.md` lists `quizScore.ts`.

## P6-3 — Production `015` apply is post-Published, not this PR

**Found:** Phase 6  
**Severity:** High (ops; expected)  
**Status:** open

§9.2 step 0: wait until Netlify **Published** for the P6 SHA, then backup + `npx supabase db push` **only** 015. Do not apply if the deploy failed. Preflight `SELECT COUNT(*) FROM quiz_attempts WHERE score = max_score AND score > 10`. Spot-check logs 30 minutes after apply for quiz-retake `23505`. This PR ships the client + migration file; it does **not** apply 015.

## P8-1 — ES prescription-label Poison Help paste mixes _tú_ and _usted_

**Found:** Phase 8 (2026-08-28)  
**Severity:** Low (voice)  
**Status:** done

Dosage `:::warning` now uses _usted_ throughout. 911-first and `1-800-222-1222` unchanged.

## P10-path — NavLink lives in `header/NavLink.tsx`, not inline in Header

**Found:** Phase 10 (2026-08-28)  
**Severity:** Low (docs/scope)  
**Status:** done

Nav is `src/components/header/NavLink.tsx`, not an inline block in `Header.tsx`. Pre-authorized. Desktop tokens now `xl:text-label-sm xl:px-1.5 xl:gap-0.5`. `src/components/codemap.md` names `header/NavLink.tsx`.

## P10-1 — `.theme-light` has no CSS rule

**Found:** Phase 10 (2026-08-28)  
**Severity:** Low  
**Status:** done

Root 404 (`src/app/not-found.tsx`) sets `className="theme-light"`. `html.theme-light { color-scheme: light; }` now exists in `globals.css`.

## P10-2 — ErrorBoundary copy is hardcoded bilingual, not catalog keys

**Found:** Phase 10 (2026-08-28)  
**Severity:** Low (i18n wiring)  
**Status:** done

Default fallback is a function child using `useTranslations("errors")` for `title`, `crashBody`, and `tryAgain`. Units cover EN and ES.

## P11-path — Terms TOC lives in `TermsClient.tsx`, not `page.tsx`

**Found:** Phase 11 (2026-08-28)  
**Severity:** Low (docs/scope)  
**Status:** done

`src/app/[locale]/terms/page.tsx` only sets locale and mounts the client. TOC / in-page nav is in `TermsClient.tsx`. `src/app/[locale]/codemap.md` names `TermsClient.tsx`.

## P11-1 — `scrollbar-none` is not a Tailwind utility in this project

**Found:** Phase 11 (2026-08-28)  
**Severity:** Low  
**Status:** done

`@utility scrollbar-none` is now in `globals.css`. Glossary A–Z uses that class.

## P11-2 — `PageHeader.test.tsx` Link mock drops `className`

**Found:** Phase 11 (2026-08-28)  
**Severity:** Low (test gap)  
**Status:** done

PageHeader Link mock forwards `className`. Breadcrumb `min-h-11` is unit-asserted.

## P11-3 — Same-tab logout: checklist persist skip works; React ticks until remount

**Found:** Phase 11 (2026-08-28)  
**Severity:** Medium (logout UX)  
**Status:** done

Same-tab wipe now clears checklist ticks and resets planner state when `wipeGeneration` increases. Persist skip remains; guest can persist again after the hydrate-generation ref advances.

## P12-path — Step1 visit-type buttons rely on `inert`

**Found:** Phase 12 (2026-08-28)  
**Severity:** Low (defense in depth)  
**Status:** done

Step1 visit-type buttons and Continue now take `disabled={!hydrated}` in addition to the `inert` wrapper.

## P12-1 — Search group header "Other" is English-only

**Found:** Phase 12 (2026-08-28)  
**Severity:** Medium (i18n)  
**Status:** done

Catalog key `search.groupOther` (EN “Other” / ES “Otros”).

## P12-2 — Locale-switch planner display is unit-proven, not e2e

**Found:** Phase 12 (2026-08-28)  
**Severity:** Low (coverage)  
**Status:** done

VisitPlannerClient unit test remounts with `es.json` and asserts Spanish checkbox labels for saved ids.

## P13A-2 — H1 ≤ 56px is CSS clamp max, not 1440 computed style

**Found:** Phase 13A (2026-08-28)  
**Severity:** Low (measurement)  
**Status:** done

P13A e2e at 1440 reads `getComputedStyle` on `main h1` and asserts `font-size <= 56`.

## P13A-3 — `useMotionSafe` can autoplay once on first paint for reduced-motion

**Found:** Phase 13A (2026-08-28)  
**Severity:** Medium (a11y)  
**Status:** done

`useMotionSafe` is now `useReducedMotion() ?? true`. Unknown preference skips autoplay; HomeClient also pauses the video when the flag is set. P13A e2e asserts no `autoplay` under `reducedMotion: "reduce"`.

## P13A-4 — Stitch image crop (3:2 + max-h) may clip faces

**Found:** Phase 13A (2026-08-28)  
**Severity:** Low (visual)  
**Status:** done

Stitch image uses `object-cover object-top` so faces stay in the fold crop.

## P13B-1 — Wave 0 missed `paths.stepXofY`; badge uses `tools.step` + `common.of`

**Found:** Phase 13B (2026-08-28)  
**Severity:** Low (i18n)  
**Status:** done

Path badge uses `paths.stepXofY` (`Step {current} of {total}` / `Paso {current} de {total}`).

## P13B-2 — `text-title-md` missing from Tailwind type scale

**Found:** Phase 13B (2026-08-28)  
**Severity:** Medium (design token)  
**Status:** done

`title-md` is registered on the Tailwind type scale (20px / 1.35 / 600) and scales with Display large/largest.

## P13B-3 — `src/lib/codemap.md` omits `slugify.ts`

**Found:** Phase 13B (2026-08-28)  
**Severity:** Low (docs)  
**Status:** done

`src/lib/codemap.md` lists `slugify.ts`.

## P13B-5 — Article progress stays 0 until first scroll

**Found:** Phase 13B (2026-08-28)  
**Severity:** Medium (UX)  
**Status:** done

`useReadingProgress` samples on mount and resize as well as scroll (article + lesson).

## P13B-path — ResourceCard is `src/components/ui/ResourceCard.tsx`

**Found:** Phase 13B (2026-08-28)  
**Severity:** Low (docs/scope)  
**Status:** done

`src/components/codemap.md` lists `ResourceCard` under `ui/`.

## P14-1 — `ANALYZE=true npm run analyze` still pending

**Found:** Phase 14 (2026-08-28)  
**Severity:** Medium (bundle split unproven)  
**Status:** done/resolved

Analyzer proof in `REVAMP/VERIFY-PHASE-14.md`: EN `/learn/[slug]` required client JS lacks `lessonBundles.es`; `pathBundles.es` only in async chunk 6982, not in that route's required list.

## P14-2 — Leftover combined-barrel server importers

**Found:** Phase 14 (2026-08-28)  
**Severity:** Medium  
**Status:** done

`paths.ts`, `learningPaths.ts`, `glossary.ts`, `loadGlossary.ts`, and `sitemap.ts` import locale files (`.en` / `.es`) instead of combined barrels.

## P14-3 — Split `loadLessons.en.ts` / `.es.ts` if analyzer still shows ES in EN client

**Found:** Phase 14 (2026-08-28)  
**Severity:** Low (contingent)  
**Status:** open

If `P14-1` still shows ES strings in the EN client after the leftover importers in `P14-2` are gone, next step is `loadLessons.en.ts` / `loadLessons.es.ts` imported only from server `page.tsx` (no shared client barrel). Do not do this until the analyzer run says it is needed.

## P14-5 — Codemaps still mention combined barrels

**Found:** Phase 14 (2026-08-28)  
**Severity:** Low (docs)  
**Status:** done

`src/data/codemap.md` and loader maps (`lessons`, `paths`, `articles`, `glossary`) describe locale files as the runtime import; combined barrels are generator-only and banned from `'use client'`.

## P14-path — `useProgress.test.tsx` mock updated for `loadPathsForLocale`

**Found:** Phase 14 (2026-08-28)  
**Severity:** Low (test contract)  
**Status:** done

`useProgress.test.tsx` mocks `loadPathsForLocale`. Later loader renames must keep that mock in lockstep.

## P15-4 — Care-guide print footer date is mount-time

**Found:** Phase 15 (2026-08-28)  
**Severity:** Low  
**Status:** done

`usePrintDate` refreshes on `beforeprint` for care-guide, article, and lesson footers.

## P16A-1 — `ProgressClient.tsx` still `formatDuration(totalTimeSpentMinutes)`

**Found:** Phase 16A (2026-08-28)  
**Severity:** Medium (wrong dashboard number)  
**Status:** done

Progress page uses `formatTimeSpentMinutes` — unused column shows `—`, not `0 min`.

## P16A-2 — `.env.example` and `docs/DEPLOYMENT.md` omit server Sentry vars

**Found:** Phase 16A (2026-08-28)  
**Severity:** Low (docs)  
**Status:** done

`.env.example` and `docs/DEPLOYMENT.md` document `SENTRY_DSN` and `SENTRY_SERVER_SAMPLE_RATE`.

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
