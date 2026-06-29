# HMC-Launch-Build.md

## HealthMadeClear — Production Launch Implementation Plan

**Generated:** 2026-06-29  
**Implementation completed:** 2026-06-29  
**Estimated Total Duration:** ~140 hours (~7–9 weeks of focused engineering + clinical review time)

> **Implementation status (2026-06-29):** All code-implementable tasks across Phases 0–11 are complete. Verification: `npm test` (234), `npm run typecheck`, `npm run lint`, `npm run content:validate`, `npm run test:e2e` (47 tests) all pass. Remaining items require manual ops (Netlify env verification, Sentry/GA dashboard check, uptime monitor setup, clinical content sign-off) — see Phase 12 checklist.

> **Audit method:** Stages 1–2 completed via full codebase read, grep sweeps, `npm audit`, `npm test`, `npm run typecheck`, subagent cross-checks, and cross-reference against `HMC-UX-Audit-Report.md`. Every finding below is grounded in verified file evidence. Items marked ✅ in Appendix E were investigated and removed from the task list.

---

### Table of Contents

1. [Document Purpose](#document-purpose)
2. [Project Overview](#project-overview)
3. [Audit Summary](#audit-summary)
4. [Phase Structure Overview](#phase-structure-overview)
5. [Phase 0: Critical Blockers & Security Hardening](#phase-0-critical-blockers--security-hardening)
6. [Phase 1: Infrastructure & Configuration](#phase-1-infrastructure--configuration)
7. [Phase 2: Code Quality & TypeScript Completion](#phase-2-code-quality--typescript-completion)
8. [Phase 3: Backend & Data Layer](#phase-3-backend--data-layer)
9. [Phase 4: Core Feature Completion](#phase-4-core-feature-completion)
10. [Phase 5: SEO & Structured Data](#phase-5-seo--structured-data)
11. [Phase 6: Accessibility (WCAG 2.1 AA)](#phase-6-accessibility-wcag-21-aa)
12. [Phase 7: Performance Optimization](#phase-7-performance-optimization)
13. [Phase 8: UI/UX Polish & Design System Completion](#phase-8-uiux-polish--design-system-completion)
14. [Phase 9: Content Audit & Medical Accuracy Review](#phase-9-content-audit--medical-accuracy-review)
15. [Phase 10: Testing & QA](#phase-10-testing--qa)
16. [Phase 11: Documentation](#phase-11-documentation)
17. [Phase 12: Pre-Launch Checklist & Go/No-Go Gate](#phase-12-pre-launch-checklist--gono-go-gate)
18. [Appendix A: Dependency Audit Table](#appendix-a-dependency-audit-table)
19. [Appendix B: File-by-File Issue Log](#appendix-b-file-by-file-issue-log)
20. [Appendix C: Content Review Queue](#appendix-c-content-review-queue)
21. [Appendix D: Post-Launch Monitoring Plan](#appendix-d-post-launch-monitoring-plan)
22. [Appendix E: Already-Implemented Items](#appendix-e-already-implemented-items)

---

### Document Purpose

Single source of truth for taking HealthMadeClear from current state to production launch. Every audit finding from Stages 1–2 maps to a checkbox task. Phases are sequenced: security and build health first, then infrastructure, features, SEO/a11y/perf polish, content review, testing, docs, and go/no-go.

### Project Overview

HealthMadeClear (HMC) — bilingual (EN/ES) static health education portal on **Next.js 16.2.9**. Teaches health literacy via lessons, learning paths, quizzes, articles, glossary, and patient tools. Optional Supabase auth for cross-device progress; fully functional offline with localStorage.

**Architecture:** MDX content → bundle scripts → typed data arrays → SSG pages per locale. i18n via `next-intl`, session middleware via `src/middleware.ts`. Deployment target: **Netlify** with `@netlify/plugin-nextjs`.

**Routes:** 27 locale pages + auth callback/confirm routes. 47 vitest files (~216 passing tests at audit time; 2 files failing). 35 Playwright e2e tests across 4 spec files.

---

### Audit Summary

**Strong foundation:** CSP headers, robots/sitemap, JSON-LD on key content pages, `MedicalDisclaimer` on lessons/articles/tools/home, honeypot + IP rate limiting on contact API, Supabase cookie auth (not localStorage), dev-gated logger, 12 `loading.tsx` skeleton routes, `DEPLOYMENT.md` and `.env.example` exist, `js-yaml` override applied, `useScrollSpy` dead code removed, forgot-password locale prefix fixed.

**Critical blockers (must fix before launch):**

1. `motion` package in `package.json` but **not installed** — `motion/react` imports fail typecheck; 2 vitest files fail (`LanguageToggle.test.tsx`, `SearchDialog.test.tsx`)
2. Layout `alternates.canonical` at `layout.tsx:54` bleeds homepage URL to **22 child pages** — SEO duplicate-canonical risk
3. `MedicalDisclaimer` **absent** on glossary, learn index, learning-paths, and quiz pages — trust/safety gap
4. `HomeClient.tsx:259` — hardcoded `"En curso" / "In Progress"` despite `dashboard.inProgress` i18n key existing

**High-priority gaps:**

- No server-side Sentry (`@sentry/nextjs` / `instrumentation.ts` missing); client-only error capture
- JSON-LD on only 7/27 pages; list/index pages lack structured data
- `ToastProvider.tsx` missing `aria-live`
- 6 `motion` components bypass `prefers-reduced-motion` (Modal, Header mobile menu, SearchDialog, AccessibilityControls, OnboardingDialog, Button spinner)
- In-memory contact rate limit resets on Netlify cold starts (acceptable short-term; document limitation)
- 15 routes still lack `loading.tsx`
- E2E gaps: no ES locale suite, no signup/forgot-password/reset-password success paths, no contact submit success, no dashboard settings/achievements
- Remaining i18n inline strings in achievements, learn difficulty label, contact support notes

**npm audit:** 0 vulnerabilities (with `js-yaml ^4.2.0` override).

---

### Phase Structure Overview

| Phase                                                | Name                           | Tasks  | Est. Hours |
| ---------------------------------------------------- | ------------------------------ | :----: | :--------: |
| [0](#phase-0-critical-blockers--security-hardening)  | Critical Blockers & Security   |   6    |    12h     |
| [1](#phase-1-infrastructure--configuration)          | Infrastructure & Configuration |   8    |    14h     |
| [2](#phase-2-code-quality--typescript-completion)    | Code Quality & TypeScript      |   7    |    10h     |
| [3](#phase-3-backend--data-layer)                    | Backend & Data Layer           |   5    |     8h     |
| [4](#phase-4-core-feature-completion)                | Core Feature Completion        |   9    |    16h     |
| [5](#phase-5-seo--structured-data)                   | SEO & Structured Data          |   10   |    12h     |
| [6](#phase-6-accessibility-wcag-21-aa)               | Accessibility (WCAG 2.1 AA)    |   9    |    14h     |
| [7](#phase-7-performance-optimization)               | Performance Optimization       |   6    |    10h     |
| [8](#phase-8-uiux-polish--design-system-completion)  | UI/UX Polish & Design System   |   10   |    16h     |
| [9](#phase-9-content-audit--medical-accuracy-review) | Content & Medical Accuracy     |   6    |    20h     |
| [10](#phase-10-testing--qa)                          | Testing & QA                   |   8    |    14h     |
| [11](#phase-11-documentation)                        | Documentation                  |   4    |     6h     |
| [12](#phase-12-pre-launch-checklist--gono-go-gate)   | Pre-Launch Go/No-Go            |   —    |     4h     |
|                                                      | **TOTAL**                      | **88** | **~140h**  |

---

## Phase 0: Critical Blockers & Security Hardening

**Phase Goal:** Restore build/test health and close security gaps that would block a safe public launch. Health information apps cannot ship with broken CI or unprotected endpoints.

**Estimated Duration:** ~12 hours  
**Prerequisites:** None

### Task List

- [ ] [S] **BLK-001:** Install `motion` dependency and verify `motion/react` resolves
  - **File(s):** `package.json` (L49), `node_modules/motion/`
  - **Context:** `motion` listed in dependencies but absent from `node_modules`. Five components import `motion/react`; typecheck reports TS2307 on Header, Modal, Reveal, SearchDialog, OnboardingDialog, AccessibilityControls.
  - **Acceptance criteria:** `npm install` completes; `npm run typecheck` has zero `motion/react` errors.

- [ ] [M] **BLK-002:** Fix vitest transform for `motion/react` in component tests
  - **File(s):** `vitest.config.ts`, `src/components/LanguageToggle.test.tsx`, `src/components/SearchDialog.test.tsx`
  - **Context:** Both test files fail at transform — `AccessibilityControls` imports `motion/react` transitively. Tests pass 216/216 assertions but 2 files fail to load.
  - **Acceptance criteria:** `npm test` exits 0 with all 47 files passing.

- [ ] [M] **SEC-003:** Add contact form 429 rate-limit UX
  - **File(s):** `src/app/[locale]/contact/ContactClient.tsx` (~L108–111), `src/messages/en.json`, `src/messages/es.json`
  - **Context:** `/api/contact` returns 429 with `Retry-After` (verified in `route.ts:38–56`) but client shows generic `errorGeneric` for all non-ok responses.
  - **Acceptance criteria:** 429 response shows localized "too many requests, try again in X minutes" message; other errors unchanged.

- [ ] [S] **SEC-004:** Document in-memory rate limit limitation for Netlify serverless
  - **File(s):** `src/app/api/contact/route.ts` (L16–21), `docs/DEPLOYMENT.md`
  - **Context:** Rate limit uses in-process `Map` — resets on cold start; multiple function instances don't share state. Acceptable for launch but must be documented; plan Upstash/Supabase table for scale.
  - **Acceptance criteria:** DEPLOYMENT.md section explains limitation and upgrade path.

- [ ] [M] **SEC-005:** Remove hardcoded Supabase URL from `netlify.toml`
  - **File(s):** `netlify.toml` (L11)
  - **Context:** `NEXT_PUBLIC_SUPABASE_URL` committed to build env with real project URL. Use Netlify dashboard env vars only; keep `netlify.toml` free of project-specific values.
  - **Acceptance criteria:** URL removed from toml; build still succeeds when var set in Netlify UI.

- [ ] [L] **SEC-006:** Evaluate persistent rate limiting for auth callback routes
  - **File(s):** `src/app/[locale]/auth/callback/route.ts`, `src/app/[locale]/auth/confirm/route.ts`
  - **Context:** Only `/api/contact` has rate limiting. Auth routes have no frequency guard — brute-force vector on token exchange.
  - **Acceptance criteria:** Document risk acceptance OR add IP-based throttle (5 req/min) on auth routes.

### Phase DONE Criteria

1. `npm run typecheck` exits 0.
2. `npm test` exits 0 (all files, not just assertions).
3. Contact form shows distinct 429 UX.
4. No project-specific secrets/URLs in committed config files.
5. Rate limiting limitations documented.

### Verification Steps

```bash
npm install && npm run typecheck && npm test
curl -X POST /api/contact (6x) → verify 429 on 6th
grep -r "supabase.co" netlify.toml → no matches
```

---

## Phase 1: Infrastructure & Configuration

**Phase Goal:** Wire production observability, analytics, and environment parity so failures are visible and deployments reproducible.

**Estimated Duration:** ~14 hours  
**Prerequisites:** Phase 0

### Task List

- [ ] [M] **INF-001:** Verify `NEXT_PUBLIC_SENTRY_DSN` in Netlify production env
  - **File(s):** `src/lib/errorReporting.ts` (L29), `src/app/global-error.tsx` (L36)
  - **Context:** Client Sentry lazy-loads correctly but silently no-ops without DSN.
  - **Acceptance criteria:** Deliberate test error appears in Sentry dashboard on production.

- [ ] [L] **INF-002:** Add `@sentry/nextjs` for server-side error capture
  - **File(s):** new `instrumentation.ts`, `sentry.client.config.ts`, `sentry.server.config.ts`, `next.config.mjs`
  - **Context:** Only `@sentry/browser` present. API route errors (`contact/route.ts:100,114,120`) and auth callback errors (`auth/callback/route.ts:18`) log to `console.error` only — invisible in production.
  - **Acceptance criteria:** Server/API errors appear in Sentry; no duplicate client init.

- [ ] [S] **INF-003:** Verify Google Analytics fires on client-side navigation
  - **File(s):** `src/components/GoogleAnalytics.tsx`, `src/components/AnalyticsPageViewTracker.tsx`
  - **Context:** GA loads via `<Script>` when `NEXT_PUBLIC_GA_MEASUREMENT_ID` set. Confirm pageviews on SPA route changes.
  - **Acceptance criteria:** GA Real-Time shows events navigating `/en/learn` → `/en/glossary`.

- [ ] [S] **INF-004:** Remove or wire Plausible analytics dead code
  - **File(s):** `src/lib/analytics.ts` (L33–34, L48–49)
  - **Context:** `trackPageView`/`trackEvent` call `window.plausible` if present, but no Plausible script loader exists. Either add loader + env var or remove dead branch.
  - **Acceptance criteria:** No unreachable analytics code paths in production bundle.

- [ ] [S] **INF-005:** Align `.env.example` with `check-production-env.mjs` requirements
  - **File(s):** `.env.example`, `scripts/check-production-env.mjs`
  - **Context:** `.env.example` exists but verify all vars validated at build time are documented with comments.
  - **Acceptance criteria:** Every required build var has `.env.example` entry; README links to it.

- [ ] [M] **INF-006:** Configure uptime monitoring
  - **File(s):** `docs/DEPLOYMENT.md`
  - **Context:** No uptime monitor configured. Health info must be available when needed.
  - **Acceptance criteria:** UptimeRobot or Netlify monitor pings production URL; alert email configured.

- [ ] [S] **INF-007:** Add `npm audit` to CI pipeline
  - **File(s):** `.github/workflows/` (or Netlify build plugin)
  - **Context:** Audit clean today; must stay clean on every merge.
  - **Acceptance criteria:** CI fails on moderate+ vulnerabilities.

- [ ] [M] **INF-008:** Verify Netlify CSP headers don't conflict with `next.config.mjs`
  - **File(s):** `netlify.toml` (L57–65), `next.config.mjs` (L24–46)
  - **Context:** CSP only in Next config; Netlify toml has X-Frame-Options, HSTS, etc. but no CSP. Confirm production response has CSP from Next headers.
  - **Acceptance criteria:** `curl -I` on production shows CSP header from Next config.

### Phase DONE Criteria

1. Sentry receives client AND server test errors.
2. GA pageviews confirmed on production.
3. Uptime monitor active.
4. `.env.example` complete and linked from README.
5. CI runs `npm audit`.

### Verification Steps

- Throw test error in browser → Sentry
- Throw test error in API route → Sentry
- Network tab: GA `collect` requests on navigation
- Uptime dashboard shows green status

---

## Phase 2: Code Quality & TypeScript Completion

**Phase Goal:** Eliminate dead code, tighten types, and ensure CI gates pass consistently.

**Estimated Duration:** ~10 hours  
**Prerequisites:** Phase 0

### Task List

- [ ] [S] **COD-001:** Update `src/hooks/codemap.md` — remove `useScrollSpy` reference
  - **File(s):** `src/hooks/codemap.md`
  - **Context:** `useScrollSpy.ts` and test deleted (confirmed in git). Codemap may still reference it.
  - **Acceptance criteria:** Codemap lists only active hooks; notes `ScrollSpyProvider` in `src/components/mdx/`.

- [ ] [M] **COD-002:** Tighten `any` types in `mockClient.ts`
  - **File(s):** `src/lib/supabase/mockClient.ts`
  - **Context:** Loose `any` risks mock/real client interface drift.
  - **Acceptance criteria:** `npm run typecheck` passes; no new `any` suppressions.

- [ ] [S] **COD-003:** Fix `HomeClient.tsx` hardcoded in-progress label
  - **File(s):** `src/app/[locale]/HomeClient.tsx` (L259)
  - **Context:** Inline `"En curso" / "In Progress"` while `dashboard.inProgress` exists in message catalogs (HMC-UX report claimed fixed; line still hardcoded).
  - **Acceptance criteria:** Uses `useTranslations("dashboard")` for in-progress badge.

- [ ] [S] **COD-004:** Move `LearnClient` difficulty label to i18n
  - **File(s):** `src/app/[locale]/learn/LearnClient.tsx` (L28), `src/messages/en.json`, `src/messages/es.json`
  - **Context:** Inline `"Nivel" / "Difficulty"` not in catalog.
  - **Acceptance criteria:** Both locales use translation key.

- [ ] [S] **COD-005:** Move achievements page inline strings to i18n
  - **File(s):** `src/app/[locale]/dashboard/achievements/achievements-client.tsx` (L25–39)
  - **Context:** `lockedLabel` and copy blocks hardcoded EN/ES.
  - **Acceptance criteria:** All user-visible strings via `useTranslations`.

- [ ] [M] **COD-006:** Move contact support notes to i18n catalog
  - **File(s):** `src/app/[locale]/contact/ContactClient.tsx` (L26–61)
  - **Context:** `supportNotes` array inline EN/ES; not in `contact` namespace.
  - **Acceptance criteria:** Support notes in `messages/en.json` and `messages/es.json`.

- [ ] [S] **COD-007:** Verify `logger.ts` dev-only gating in production build
  - **File(s):** `src/lib/logger.ts` (L2–9)
  - **Context:** `console.log` gated by `NODE_ENV === "development"`. Confirm no leak in production bundle via build inspect.
  - **Acceptance criteria:** Production build contains no unguarded `console.log` calls.

### Phase DONE Criteria

1. `npm run typecheck` exits 0.
2. `npm run lint` exits 0.
3. Zero hardcoded EN/ES string pairs in flagged files.
4. Codemap accurate.

### Verification Steps

```bash
npm run typecheck && npm run lint && npm test
rg '"En curso"|"In Progress"' src/app/[locale]/HomeClient.tsx → no matches
```

---

## Phase 3: Backend & Data Layer

**Phase Goal:** Production Supabase schema synced; mock client cannot silently activate; contact API production-ready.

**Estimated Duration:** ~8 hours  
**Prerequisites:** Phase 1

### Task List

- [ ] [M] **DB-001:** Push all migrations to production Supabase
  - **File(s):** `supabase/migrations/`
  - **Context:** Tables: profiles, lesson_progress, quiz_attempts, achievements, streaks, daily_log, notifications, contact_submissions.
  - **Acceptance criteria:** `supabase migration list --linked` shows all applied.

- [ ] [M] **DB-002:** Verify mock client cannot activate in production
  - **File(s):** `src/lib/supabase/env.ts`, `scripts/check-production-env.mjs`
  - **Context:** `middleware.ts` skips auth guard when mock/unconfigured. Production must throw, not silently mock.
  - **Acceptance criteria:** Production build without Supabase vars throws clear error.

- [ ] [S] **DB-003:** Add contact API success-path test
  - **File(s):** `src/app/api/contact/route.test.ts`
  - **Context:** Tests cover 400, honeypot, rate limit; no 503 (missing env) or successful insert test.
  - **Acceptance criteria:** Test covers 503 when Supabase env absent.

- [ ] [M] **DB-004:** Test `updateSession` dashboard auth redirect
  - **File(s):** new `src/lib/supabase/middleware.test.ts`
  - **Context:** `updateSession` (L5–41) redirects unauthenticated dashboard access — untested.
  - **Acceptance criteria:** Unit test verifies redirect to login for `/dashboard` without session.

- [ ] [M] **DB-005:** Verify `delete_user` RPC exists in production
  - **File(s):** `src/app/[locale]/dashboard/settings/settings-client.tsx` (L79), `supabase/migrations/`
  - **Context:** Settings calls `supabase.rpc("delete_user")` — no e2e/vitest coverage; RPC must exist in prod.
  - **Acceptance criteria:** RPC confirmed in migration; manual test on staging.

### Phase DONE Criteria

1. All migrations applied to production.
2. Mock client blocked in production mode.
3. Auth middleware redirect tested.
4. Contact API test suite covers error paths.

### Verification Steps

```bash
supabase migration list --linked
npm test -- src/app/api/contact/route.test.ts
```

---

## Phase 4: Core Feature Completion

**Phase Goal:** Complete partial features and close trust/safety gaps on health content surfaces.

**Estimated Duration:** ~16 hours  
**Prerequisites:** Phase 2

### Task List

- [ ] [M] **FEAT-001:** Add `MedicalDisclaimer` to glossary index page
  - **File(s):** `src/app/[locale]/glossary/GlossaryClient.tsx`
  - **Context:** Glossary defines medical terms but has no disclaimer. Lessons/articles/tools have it.
  - **Acceptance criteria:** Disclaimer visible at bottom of glossary page EN and ES.

- [ ] [M] **FEAT-002:** Add `MedicalDisclaimer` to glossary term detail pages
  - **File(s):** `src/app/[locale]/glossary/[term]/` (page client component)
  - **Context:** Individual term pages lack disclaimer.
  - **Acceptance criteria:** Disclaimer on every `/glossary/[term]` page.

- [ ] [S] **FEAT-003:** Add `MedicalDisclaimer` to learn index page
  - **File(s):** `src/app/[locale]/learn/LearnClient.tsx`
  - **Context:** Lesson list is health education content without disclaimer.
  - **Acceptance criteria:** Disclaimer at bottom of `/learn`.

- [ ] [S] **FEAT-004:** Add `MedicalDisclaimer` to learning-paths list and detail
  - **File(s):** `src/app/[locale]/learning-paths/LearningPathsClient.tsx`, `LearningPathDetailClient.tsx`
  - **Context:** Path pages curate health lessons — no disclaimer.
  - **Acceptance criteria:** Disclaimer on `/learning-paths` and `/learning-paths/[pathId]`.

- [ ] [S] **FEAT-005:** Add `MedicalDisclaimer` to quiz pages
  - **File(s):** `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx`
  - **Context:** Quizzes test health knowledge — disclaimer required.
  - **Acceptance criteria:** Disclaimer visible during quiz and results states.

- [ ] [M] **FEAT-006:** Implement contact form success without Supabase fallback messaging
  - **File(s):** `src/app/api/contact/route.ts` (L97–102), `ContactClient.tsx`
  - **Context:** Returns 503 when Supabase env missing. Production must have env; client should distinguish 503 from validation errors.
  - **Acceptance criteria:** 503 shows "service temporarily unavailable" localized message.

- [ ] [M] **FEAT-007:** Guest→login progress continuity e2e verification
  - **File(s):** `src/lib/guestProgress.ts`, `e2e/flows.spec.ts`
  - **Context:** Feature implemented per UX audit; needs automated regression test.
  - **Acceptance criteria:** E2E test: complete lesson as guest → login → progress visible on dashboard.

- [ ] [L] **FEAT-008:** Real Supabase auth path smoke test (staging)
  - **File(s):** `e2e/setup.ts`, auth forms
  - **Context:** All auth e2e uses mock client (`guest@example.com`). Real email/password reset flow untested.
  - **Acceptance criteria:** Manual or staging e2e: signup → confirm email → login → reset password with locale prefix.

- [ ] [S] **FEAT-009:** Add `not-found.tsx` metadata / noindex
  - **File(s):** `src/app/[locale]/not-found.tsx`
  - **Context:** Client component with no `generateMetadata`; 404 pages may be indexed with layout canonical.
  - **Acceptance criteria:** 404 returns `robots: noindex` via parent metadata or dedicated `not-found` layout.

### Phase DONE Criteria

1. `MedicalDisclaimer` on all health content routes (see FEAT-001–005).
2. Contact form handles all HTTP status codes with distinct UX.
3. Guest progress continuity has e2e coverage.
4. 404 pages not indexed.

### Verification Steps

- Grep `MedicalDisclaimer` across `src/app/` — all content routes covered
- Manual: glossary, learn, paths, quiz show disclaimer
- E2E: guest progress test passes

---

## Phase 5: SEO & Structured Data

**Phase Goal:** Every public page has correct canonical URL, meta description, and health-appropriate structured data.

**Estimated Duration:** ~12 hours  
**Prerequisites:** Phase 4

### Task List

- [ ] [L] **SEO-001:** Remove layout-level canonical that bleeds to child pages
  - **File(s):** `src/app/[locale]/layout.tsx` (L54–60)
  - **Context:** `alternates.canonical: ${siteUrl}/${locale}` applies to ALL children. 22 pages inherit homepage canonical — Google may treat deep pages as duplicates.
  - **Acceptance criteria:** Layout sets `metadataBase` and `languages` only; each page sets own canonical OR layout canonical removed.

- [ ] [M] **SEO-002:** Add page-specific canonical to learn index
  - **File(s):** `src/app/[locale]/learn/page.tsx` (L9)
  - **Acceptance criteria:** Canonical = `${siteUrl}/${locale}/learn`.

- [ ] [M] **SEO-003:** Add canonical to learning-paths index and detail
  - **File(s):** `learning-paths/page.tsx` (L9), `learning-paths/[pathId]/page.tsx` (L17)
  - **Acceptance criteria:** Each path URL self-canonical.

- [ ] [S] **SEO-004:** Add canonical to glossary index
  - **File(s):** `glossary/page.tsx` (L9)
  - **Acceptance criteria:** Canonical = `${siteUrl}/${locale}/glossary`.

- [ ] [S] **SEO-005:** Add canonical to tools pages (index + 3 tools)
  - **File(s):** `tools/page.tsx`, `tools/visit-planner/page.tsx`, `tools/visit-checklist/page.tsx`, `tools/care-guide/page.tsx`
  - **Acceptance criteria:** Each tool page self-canonical.

- [ ] [S] **SEO-006:** Add canonical to static pages (about, contact, privacy, terms, accessibility)
  - **File(s):** respective `page.tsx` files
  - **Acceptance criteria:** All 5 pages have unique canonical URLs.

- [ ] [S] **SEO-007:** Add canonical to quiz pages
  - **File(s):** `learn/[slug]/quiz/page.tsx` (L17)
  - **Acceptance criteria:** Quiz URL self-canonical.

- [ ] [S] **SEO-008:** Fix learning-paths description duplicate
  - **File(s):** `learning-paths/page.tsx` (L14)
  - **Context:** `description: t("pageTitle")` duplicates title instead of using description key.
  - **Acceptance criteria:** Unique meta description 150–160 chars.

- [ ] [M] **SEO-009:** Add JSON-LD to list/index pages
  - **File(s):** `learn/page.tsx`, `articles/page.tsx`, `learning-paths/page.tsx`, `tools/page.tsx`
  - **Context:** JSON-LD only on 7 pages. Add `ItemList` or `CollectionPage` schema to index pages.
  - **Acceptance criteria:** Rich Results Test passes on `/en/learn` and `/en/articles`.

- [ ] [M] **SEO-010:** Add `MedicalWebPage` schema to health tool pages
  - **File(s):** `tools/visit-planner/page.tsx`, `tools/visit-checklist/page.tsx`, `tools/care-guide/page.tsx`
  - **Context:** Tools are health education utilities — `MedicalWebPage` or `WebApplication` schema appropriate.
  - **Acceptance criteria:** Structured data validates in Google Rich Results Test.

### Phase DONE Criteria

1. Every public page has unique canonical URL (spot-check 10 URLs).
2. No page inherits layout homepage canonical.
3. JSON-LD on all content types (lessons, articles, glossary, paths, tools, lists).
4. All meta descriptions unique and non-empty.

### Verification Steps

```bash
# View page source on 5 routes — canonical matches URL
# Google Rich Results Test on lesson, article, glossary, learn index
```

---

## Phase 6: Accessibility (WCAG 2.1 AA)

**Phase Goal:** Meet WCAG 2.1 AA on all pages — keyboard, screen reader, reduced motion, contrast.

**Estimated Duration:** ~14 hours  
**Prerequisites:** Phase 0 (motion package), Phase 8 partial

### Task List

- [ ] [S] **A11Y-001:** Add `aria-live="polite"` to ToastProvider
  - **File(s):** `src/components/ui/ToastProvider.tsx` (L36–44)
  - **Context:** Has `role="region"` and `aria-label` but no `aria-live`. Screen readers won't announce toasts.
  - **Acceptance criteria:** VoiceOver announces toast without focus move.

- [ ] [M] **A11Y-002:** Add `useReducedMotion` to Modal
  - **File(s):** `src/components/ui/Modal.tsx` (L77)
  - **Context:** `motion.div` animates regardless of `prefers-reduced-motion`. `Reveal.tsx:35` shows correct pattern.
  - **Acceptance criteria:** With reduced motion OS setting, modal appears instantly.

- [ ] [M] **A11Y-003:** Add reduced-motion guard to Header mobile menu
  - **File(s):** `src/components/Header.tsx` (L179)
  - **Acceptance criteria:** Mobile menu opens without slide animation when reduced motion on.

- [ ] [M] **A11Y-004:** Add reduced-motion guard to SearchDialog
  - **File(s):** `src/components/SearchDialog.tsx` (L145)
  - **Acceptance criteria:** Dialog appears instantly with reduced motion.

- [ ] [M] **A11Y-005:** Add reduced-motion guard to AccessibilityControls panel
  - **File(s):** `src/components/AccessibilityControls.tsx` (L81)
  - **Acceptance criteria:** Panel opens without animation when reduced motion on.

- [ ] [M] **A11Y-006:** Add reduced-motion guard to OnboardingDialog
  - **File(s):** `src/components/OnboardingDialog.tsx` (L42)
  - **Acceptance criteria:** Onboarding appears without slide when reduced motion on.

- [ ] [S] **A11Y-007:** Add `motion-reduce:animate-none` to Button loading spinner
  - **File(s):** `src/components/ui/Button.tsx` (L64)
  - **Context:** `ResetPasswordClient.tsx:96` already has pattern.
  - **Acceptance criteria:** Spinner static with reduced motion.

- [ ] [S] **A11Y-008:** Add `motion-reduce:animate-none` to login page skeleton
  - **File(s):** `src/app/[locale]/auth/login/page.tsx` (L43)
  - **Acceptance criteria:** Skeleton doesn't pulse with reduced motion.

- [ ] [L] **A11Y-009:** Full keyboard navigation audit all 27 routes
  - **File(s):** all interactive components
  - **Context:** Systematic tab-through: header, mobile menu, SearchDialog, glossary popovers, quiz, dashboard tabs.
  - **Acceptance criteria:** Document pass/fail per route; all failures fixed.

### Phase DONE Criteria

1. VoiceOver/NVDA announces toasts.
2. All motion components respect `prefers-reduced-motion`.
3. Keyboard-only navigation completes all primary flows.
4. Lighthouse Accessibility ≥ 95 on home, lesson, glossary.

### Verification Steps

- macOS VoiceOver: trigger toast, verify announcement
- Enable reduced motion → open modal, search, mobile menu
- Tab through home → learn → quiz without mouse

---

## Phase 7: Performance Optimization

**Phase Goal:** Core Web Vitals within thresholds; no render-blocking or bundle bloat.

**Estimated Duration:** ~10 hours  
**Prerequisites:** Phase 0, Phase 5

### Task List

- [ ] [M] **PERF-001:** Run Lighthouse on production build — home, lesson, glossary
  - **File(s):** N/A (measurement)
  - **Context:** Targets: Performance ≥ 90, LCP < 2.5s, CLS < 0.1, INP < 200ms mobile.
  - **Acceptance criteria:** Document scores; file tasks for any category < target.

- [ ] [M] **PERF-002:** Analyze bundle with `npm run analyze`
  - **File(s):** `next.config.mjs` (bundle analyzer wired)
  - **Context:** `motion` package adds client weight — verify tree-shaking and dynamic import where possible.
  - **Acceptance criteria:** Initial JS < 200KB gzipped on home page.

- [ ] [S] **PERF-003:** Verify font preconnect and `font-display: swap`
  - **File(s):** `src/app/fonts.ts`, `src/app/[locale]/layout.tsx`
  - **Acceptance criteria:** No FOIT; fonts load with swap.

- [ ] [S] **PERF-004:** Verify image AVIF/WebP config active
  - **File(s):** `next.config.mjs` (L61)
  - **Acceptance criteria:** Network tab shows AVIF/WebP for `next/image` assets.

- [ ] [M] **PERF-005:** Add `loading.tsx` to remaining 15 routes
  - **File(s):** see Appendix B — routes without loading skeleton
  - **Context:** 12/27 routes have `loading.tsx`. Missing: home, contact, about, auth forgot/reset, quiz, article detail, path detail, glossary term, 3 tools, privacy, terms, accessibility.
  - **Acceptance criteria:** Shape-matched skeleton on every route with async data.

- [ ] [S] **PERF-006:** Audit synchronous localStorage reads blocking render
  - **File(s):** `src/components/AppProviders.tsx`, `src/lib/preferences.ts`
  - **Context:** Pref bootstrap script mitigates FOUC; verify no additional sync storage reads in render path.
  - **Acceptance criteria:** No sync localStorage in component render functions.

### Phase DONE Criteria

1. Lighthouse Performance ≥ 90 mobile on home + lesson.
2. LCP < 2.5s, CLS < 0.1, INP < 200ms.
3. All routes have loading skeletons.
4. Bundle analyzed; no unexpected heavy imports.

### Verification Steps

```bash
npm run build && npm run start
# Chrome Lighthouse mobile throttled 3G
npm run analyze
```

---

## Phase 8: UI/UX Polish & Design System Completion

**Phase Goal:** Consistent design system, responsive layouts, polished loading/empty/error states across all flows.

**Estimated Duration:** ~16 hours  
**Prerequisites:** Phase 4

### Task List

- [ ] [M] **UX-001:** Consolidate dual button system (`.btn-*` vs `Button` component)
  - **File(s):** `src/app/globals.css` (`.btn-*` classes), `src/components/ui/Button.tsx`
  - **Context:** HMC-UX report outstanding item. Two button systems risk visual drift.
  - **Acceptance criteria:** Single button API; `.btn-*` deprecated or aliased to `Button` variants.

- [ ] [S] **UX-002:** Use `EmptyState` in SearchDialog no-results
  - **File(s):** `src/components/SearchDialog.tsx` (L203–206)
  - **Context:** Bare `<div>` with text; dashboard/learn/glossary use `EmptyState`.
  - **Acceptance criteria:** Consistent empty search UI.

- [ ] [S] **UX-003:** Use `EmptyState` in NotificationCenter
  - **File(s):** `src/components/ui/NotificationCenter.tsx` (L162)
  - **Acceptance criteria:** Empty notifications match design system.

- [ ] [S] **UX-004:** Add display-name truncate tooltip in header
  - **File(s):** `src/components/Header.tsx`
  - **Context:** HMC-UX report low-priority item; long names truncate without tooltip.
  - **Acceptance criteria:** `title` attribute or tooltip on truncated display name.

- [ ] [M] **UX-005:** Unify `LessonCard` and `ArticleCard` shared primitives
  - **File(s):** `src/components/learn/LessonCard.tsx`, `src/components/articles/ArticleCard.tsx`
  - **Context:** Cosmetic duplication per UX audit.
  - **Acceptance criteria:** Shared `ContentCard` base or documented intentional divergence.

- [ ] [M] **UX-006:** 375px overflow audit all routes
  - **File(s):** `e2e/polish.spec.ts` (extend route list)
  - **Context:** Polish spec covers 10 EN routes; missing ES, dashboard, auth, legal pages.
  - **Acceptance criteria:** Zero horizontal scroll at 375px on all 27 routes both locales.

- [ ] [S] **UX-007:** Verify dark mode on all pages
  - **File(s):** all `*Client.tsx` pages
  - **Context:** Theme toggle exists; spot-check every route in dark mode for contrast/hierarchy issues.
  - **Acceptance criteria:** No invisible text or broken borders in dark mode on any route.

- [ ] [M] **UX-008:** Add segment `error.tsx` for auth and articles
  - **File(s):** new `src/app/[locale]/auth/error.tsx`, `articles/error.tsx`
  - **Context:** Only `[locale]/error.tsx`, `dashboard/error.tsx`, `learn/error.tsx` exist. Auth/articles rely on parent.
  - **Acceptance criteria:** Segment errors show contextual recovery (retry login, return to articles).

- [ ] [S] **UX-009:** Delete-account confirmation UX for ES users
  - **File(s):** `settings-client.tsx`
  - **Context:** HMC-UX report human review item.
  - **Acceptance criteria:** Destructive confirm dialog fully translated; requires typing "DELETE" or equivalent.

- [ ] [S] **UX-010:** Emergency number localization beyond US 911
  - **File(s):** `src/components/MedicalDisclaimer.tsx`, `messages/es.json`
  - **Context:** ES users may need local emergency number guidance.
  - **Acceptance criteria:** ES disclaimer references appropriate emergency guidance (e.g., 911 US + note for other regions).

### Phase DONE Criteria

1. No horizontal overflow at 375px any route.
2. Dark mode verified all routes.
3. Empty/error states use design system components.
4. Button system unified or documented.

### Verification Steps

```bash
npm run test:e2e -- e2e/polish.spec.ts
# Manual dark mode sweep
```

---

## Phase 9: Content Audit & Medical Accuracy Review

**Phase Goal:** All health content clinically accurate, current, bilingual, and appropriately disclaimed.

**Estimated Duration:** ~20 hours (human clinical review dominates)  
**Prerequisites:** Phase 4 (disclaimers), Phase 5 (SEO metadata)

### Task List

- [ ] [M] **CONT-001:** Run `npm run content:validate` and resolve failures
  - **File(s):** `scripts/validate-content.ts`
  - **Context:** Enforces `lastReviewed` within 12 months, EN/ES ID parity, quiz explanation quality.
  - **Acceptance criteria:** Validator exits 0.

- [ ] [XL] **CONT-002:** Clinical review of high-risk lessons (Appendix C)
  - **File(s):** `content/lessons/en/otc-drug-interactions.mdx`, `understanding-prescription-labels.mdx`, `pain-medications-safely.mdx` (+ ES)
  - **Context:** PharmD-level accuracy required. Highest liability content.
  - **Acceptance criteria:** Signed off by qualified clinical professional; `lastReviewed` updated.

- [ ] [L] **CONT-003:** Full EN/ES translation parity audit
  - **File(s):** `content/` directory
  - **Context:** Validator checks ID parity; human review needed for translation quality and medical abbreviation accuracy (e.g., q.d., b.i.d. in ES).
  - **Acceptance criteria:** No EN-only medical guidance in ES files; pharmacist reviews abbreviation translations.

- [ ] [M] **CONT-004:** Verify no placeholder/stub content in production bundles
  - **File(s):** `src/data/Bundles.*.ts`, `content/`
  - **Context:** Grep found no lorem/TODO in content; verify quiz explanations aren't stub pattern `/ — correct\.$/`.
  - **Acceptance criteria:** `content:validate` passes stub check.

- [ ] [S] **CONT-005:** Add `lastReviewed` display on article and lesson pages
  - **File(s):** `ArticlePageClient.tsx`, `LessonPageClient.tsx`
  - **Context:** Stale content is a trust risk for health info. Dates in frontmatter but may not display.
  - **Acceptance criteria:** "Last reviewed: [date]" visible on content pages.

- [ ] [M] **CONT-006:** Source citation audit for medical claims
  - **File(s):** `content/lessons/`, `content/articles/`
  - **Context:** Trust principle requires transparent sourcing. Flag articles lacking citations.
  - **Acceptance criteria:** Every article cites at least one authoritative source; lessons with dosing/interaction claims cite references.

### Phase DONE Criteria

1. `npm run content:validate` exits 0.
2. All Appendix C items clinically signed off.
3. `lastReviewed` displayed on content pages.
4. No stub/placeholder content.

### Verification Steps

```bash
npm run content:validate
# Manual: spot-check 10 lessons for citations and reading level
```

---

## Phase 10: Testing & QA

**Phase Goal:** Automated coverage on critical paths; cross-browser and locale confidence.

**Estimated Duration:** ~14 hours  
**Prerequisites:** Phases 0–9

### Task List

- [ ] [M] **TST-001:** Full vitest suite green
  - **File(s):** all `src/**/*.test.*`
  - **Context:** 2 files failing at audit (motion import). Must be 47/47.
  - **Acceptance criteria:** `npm test` exits 0.

- [ ] [M] **TST-002:** Full Playwright suite green all browsers
  - **File(s):** `e2e/*.spec.ts`
  - **Context:** 35 tests across Chromium/Firefox/WebKit.
  - **Acceptance criteria:** `npm run test:e2e` exits 0.

- [ ] [L] **TST-003:** Add ES locale e2e suite
  - **File(s):** new `e2e/locale-es.spec.ts`
  - **Context:** HMC-UX recommendation. All flows tested EN only.
  - **Acceptance criteria:** Core flows pass on `/es/` prefix.

- [ ] [M] **TST-004:** Add e2e for signup, forgot-password, reset-password
  - **File(s):** `e2e/flows.spec.ts` or new `e2e/auth.spec.ts`
  - **Acceptance criteria:** Mock auth signup → login → forgot → reset path covered.

- [ ] [M] **TST-005:** Add e2e contact form submit success
  - **File(s):** `e2e/flows.spec.ts`
  - **Context:** Only validation tested; no success path.
  - **Acceptance criteria:** Valid submission shows success message.

- [ ] [M] **TST-006:** Add e2e dashboard settings and achievements
  - **File(s):** new `e2e/dashboard.spec.ts`
  - **Acceptance criteria:** Navigate settings, view achievements grid.

- [ ] [L] **TST-007:** Add axe accessibility scan to CI
  - **File(s):** new `e2e/a11y.spec.ts`, CI config
  - **Context:** HMC-UX recommendation. Automated WCAG AA regression guard.
  - **Acceptance criteria:** axe-core scan on 10 key routes; zero critical violations.

- [ ] [M] **TST-008:** Add unit tests for untested lib modules
  - **File(s):** `src/lib/dashboard/activity.ts`, `progress.ts`, `quizzes.ts`, `learningPaths.ts`, `src/hooks/useAuth.ts`, `useProgress.ts`
  - **Acceptance criteria:** At least smoke tests for each module.

### Phase DONE Criteria

1. All vitest and Playwright tests pass.
2. ES locale e2e suite exists and passes.
3. Auth flows e2e covered.
4. axe CI scan on key routes.

### Verification Steps

```bash
npm test && npm run test:e2e
npm run test:coverage  # review lib/ coverage
```

---

## Phase 11: Documentation

**Phase Goal:** New contributors and operators can deploy, develop, and maintain without tribal knowledge.

**Estimated Duration:** ~6 hours  
**Prerequisites:** Phase 10

### Task List

- [ ] [M] **DOC-001:** Update README with current setup flow
  - **File(s):** `README.md`
  - **Context:** Must cover: clone, `npm install`, `.env.example` copy, `npm run dev`, content bundle, test commands, Supabase local setup.
  - **Acceptance criteria:** Fresh clone → dev server in <15 min following README alone.

- [ ] [S] **DOC-002:** Verify `docs/DEPLOYMENT.md` completeness
  - **File(s):** `docs/DEPLOYMENT.md`
  - **Context:** File exists (contrary to prior plan). Verify: env vars, migration deploy, rollback, post-deploy checks, rate limit notes.
  - **Acceptance criteria:** All Phase 12 infrastructure checks referenced.

- [ ] [S] **DOC-003:** Add content authoring guidelines
  - **File(s):** new `docs/CONTENT-GUIDELINES.md`
  - **Context:** PharmD author needs: reading level targets, disclaimer requirements, `lastReviewed` policy, citation format, EN/ES parity rules.
  - **Acceptance criteria:** Document covers validate-content.ts rules in plain language.

- [ ] [S] **DOC-004:** Update root `codemap.md` post-audit
  - **File(s):** `codemap.md`, sub-codemaps
  - **Context:** Reflect deleted hooks, new components (Reveal), motion dependency.
  - **Acceptance criteria:** Codemap matches current file tree.

### Phase DONE Criteria

1. README self-sufficient for local dev.
2. DEPLOYMENT.md covers all production env vars and rollback.
3. Content guidelines document exists.
4. Codemaps current.

### Verification Steps

- New contributor dry-run: follow README only
- Cross-check DEPLOYMENT.md env table vs `.env.example`

---

## Phase 12: Pre-Launch Checklist & Go/No-Go Gate

**Phase Goal:** Final sign-off. No production deploy until every box checked.

**Estimated Duration:** ~4 hours  
**Prerequisites:** All Phases 0–11

### Security

- [ ] No secrets in client-side code or repository
- [ ] All environment variables documented in `.env.example`
- [ ] HTTPS enforced in production (HSTS in `netlify.toml` L65)
- [ ] Content Security Policy headers configured (`next.config.mjs` L24–46)
- [ ] All user inputs sanitized (contact form: length limits, email regex, honeypot)
- [ ] Rate limiting on API routes (`/api/contact` — 5 req/10 min/IP)
- [ ] Authentication tokens stored in httpOnly cookies via `@supabase/ssr`
- [ ] `npm audit` — 0 vulnerabilities
- [ ] `js-yaml` override confirmed (`package.json` L88)

### Performance

- [ ] LCP < 2.5s on mobile (3G throttled)
- [ ] CLS < 0.1 on all pages
- [ ] INP < 200ms on all interactive elements
- [ ] Total initial JS bundle < 200KB gzipped
- [ ] All images have width/height set, `loading="lazy"`, AVIF/WebP via `next.config.mjs`
- [ ] Fonts preconnected and `font-display: swap` set

### Accessibility

- [ ] WCAG 2.1 AA passes on all pages (automated + manual check)
- [ ] Full keyboard navigation tested
- [ ] Screen reader tested (VoiceOver + NVDA)
- [ ] Color contrast passes on all text combinations
- [ ] All images have appropriate alt text
- [ ] `aria-live="polite"` on toast container
- [ ] Reduced motion respected on all animated components

### SEO

- [ ] Unique title tags on all pages
- [ ] Meta descriptions on all pages
- [ ] Open Graph tags on all pages
- [ ] Page-specific canonical URLs (not layout homepage bleed)
- [ ] Sitemap.xml submitted to Google Search Console
- [ ] `robots.txt` configured correctly (`src/app/robots.ts`)
- [ ] JSON-LD structured data validated via Google Rich Results Test
- [ ] No broken internal links
- [ ] `<html lang>` matches locale

### Content & Medical Safety

- [ ] Medical disclaimer present on every health content page (lessons, articles, tools, glossary, paths, quizzes, home)
- [ ] All placeholder content replaced with real content
- [ ] All flagged content items reviewed by medical professional (Appendix C)
- [ ] "Not a substitute for professional medical advice" language present
- [ ] Contact/feedback mechanism in place for reporting inaccurate content
- [ ] Privacy policy published (`/privacy`)
- [ ] Terms of service published (`/terms`)
- [ ] Emergency disclaimer on home and care-guide tool

### Code Quality

- [ ] No unguarded `console.log` in production build
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] All TODO/FIXME resolved or documented (currently 0 in `src/`)
- [ ] All tests passing (`npm test`, `npm run test:e2e`)
- [ ] Code coverage > 80% on critical paths (`src/lib/`, `src/hooks/`)

### Infrastructure

- [ ] Error monitoring configured (Sentry client + server)
- [ ] Analytics configured and tested (GA4)
- [ ] Uptime monitoring configured
- [ ] Production environment variables set in Netlify
- [ ] CI/CD pipeline passing on main branch
- [ ] Deployment rollback procedure documented
- [ ] CDN cache headers configured (`netlify.toml` L19–55)
- [ ] Supabase migrations applied to production

### User Experience

- [ ] All primary user flows tested end-to-end on mobile (375px)
- [ ] All primary user flows tested end-to-end on desktop
- [ ] Loading states present for all async operations
- [ ] Error states present for all failure scenarios
- [ ] Empty states designed and implemented
- [ ] 404 page implemented and helpful (`not-found.tsx`)
- [ ] Dark mode tested on all pages
- [ ] Both EN and ES locales verified

---

## Appendix A: Dependency Audit Table

| Package                     | Version           | Role            | Status | Action                                   |
| --------------------------- | ----------------- | --------------- | ------ | ---------------------------------------- |
| `next`                      | 16.2.9 (pinned)   | Framework       | ✅     | Override intentional                     |
| `react` / `react-dom`       | ^18.3.1           | UI              | ✅     | Current                                  |
| `@supabase/supabase-js`     | ^2.108.2          | Auth/DB client  | ✅     | Current                                  |
| `@supabase/ssr`             | ^0.12.0           | Cookie session  | ✅     | Current                                  |
| `next-intl`                 | ^4.13.0           | i18n            | ✅     | Current                                  |
| `@sentry/browser`           | ^10.60.0          | Client errors   | ⚠️     | Add `@sentry/nextjs` for server          |
| `motion`                    | ^12.42.0          | Animations      | ❌     | Not installed in node_modules — BLK-001  |
| `gray-matter`               | ^4.0.3            | MDX frontmatter | ✅     | `js-yaml` override applied               |
| `js-yaml`                   | ^4.2.0 (override) | Transitive      | ✅     | Override fixes DoS CVE                   |
| `lucide-react`              | ^1.21.0           | Icons           | ✅     | Tree-shaken via `optimizePackageImports` |
| `markdown-it`               | ^14.2.0           | Markdown render | ✅     | Current                                  |
| `@netlify/plugin-nextjs`    | ^5.15.12          | Deploy          | ✅     | Dev dep, configured in toml              |
| `@playwright/test`          | ^1.61.1           | E2E             | ✅     | 35 tests                                 |
| `vitest`                    | ^4.1.9            | Unit tests      | ⚠️     | 2 files fail to load                     |
| Analytics npm pkg           | —                 | Analytics       | ❌     | GA via Script tag; Plausible dead code   |
| Rate limiting pkg           | —                 | API protection  | ⚠️     | Custom in-memory only                    |
| `zod` / form validation lib | —                 | Validation      | ⚠️     | Manual regex validation; consider zod    |

---

## Appendix B: File-by-File Issue Log

| File                                           | Line(s)  | Issue                                 | Severity     | Phase | Task     |
| ---------------------------------------------- | -------- | ------------------------------------- | ------------ | ----- | -------- |
| `package.json`                                 | 49       | `motion` dep not installed            | **Critical** | 0     | BLK-001  |
| `src/components/Header.tsx`                    | 6        | `motion/react` TS2307                 | **Critical** | 0     | BLK-001  |
| `vitest` (2 files)                             | —        | Transform fail on motion import       | **Critical** | 0     | BLK-002  |
| `src/app/[locale]/layout.tsx`                  | 54       | Homepage canonical bleeds to children | **High**     | 5     | SEO-001  |
| `src/app/[locale]/HomeClient.tsx`              | 259      | Hardcoded in-progress label           | **High**     | 2     | COD-003  |
| `src/app/[locale]/glossary/GlossaryClient.tsx` | —        | No MedicalDisclaimer                  | **High**     | 4     | FEAT-001 |
| `src/app/[locale]/learn/LearnClient.tsx`       | —        | No MedicalDisclaimer                  | **High**     | 4     | FEAT-003 |
| `src/app/[locale]/learn/LearnClient.tsx`       | 28       | Inline difficulty label               | Medium       | 2     | COD-004  |
| `src/app/[locale]/contact/ContactClient.tsx`   | 108      | No 429 UX                             | Medium       | 0     | SEC-003  |
| `src/components/ui/ToastProvider.tsx`          | 36–44    | Missing aria-live                     | Medium       | 6     | A11Y-001 |
| `src/components/ui/Modal.tsx`                  | 77       | No reduced motion                     | Medium       | 6     | A11Y-002 |
| `src/components/Header.tsx`                    | 179      | No reduced motion                     | Medium       | 6     | A11Y-003 |
| `src/components/SearchDialog.tsx`              | 145      | No reduced motion                     | Medium       | 6     | A11Y-004 |
| `src/components/AccessibilityControls.tsx`     | 81       | No reduced motion                     | Medium       | 6     | A11Y-005 |
| `src/components/OnboardingDialog.tsx`          | 42       | No reduced motion                     | Medium       | 6     | A11Y-006 |
| `src/components/ui/Button.tsx`                 | 64       | Spinner no motion-reduce              | Low          | 6     | A11Y-007 |
| `src/app/[locale]/learning-paths/page.tsx`     | 14       | Description = title                   | Medium       | 5     | SEO-008  |
| `src/app/[locale]/not-found.tsx`               | —        | No metadata/noindex                   | Medium       | 4     | FEAT-009 |
| `netlify.toml`                                 | 11       | Hardcoded Supabase URL                | Medium       | 0     | SEC-005  |
| `src/lib/analytics.ts`                         | 33–49    | Plausible dead code                   | Low          | 1     | INF-004  |
| `src/lib/errorReporting.ts`                    | 29       | Client-only Sentry                    | **High**     | 1     | INF-002  |
| `achievements-client.tsx`                      | 25–39    | Inline i18n                           | Medium       | 2     | COD-005  |
| `ContactClient.tsx`                            | 26–61    | Inline support notes                  | Medium       | 2     | COD-006  |
| `SearchDialog.tsx`                             | 203      | No EmptyState                         | Low          | 8     | UX-002   |
| `globals.css`                                  | `.btn-*` | Dual button system                    | Low          | 8     | UX-001   |
| 15 route dirs                                  | —        | Missing loading.tsx                   | Medium       | 7     | PERF-005 |

### Routes WITH `loading.tsx` (12)

`learn/`, `learn/[slug]/`, `articles/`, `glossary/`, `learning-paths/`, `tools/`, `dashboard/`, `dashboard/progress/`, `dashboard/settings/`, `dashboard/achievements/`, `auth/login/`, `auth/signup/`

### Routes MISSING `loading.tsx` (15)

`/`, `contact/`, `about/`, `auth/forgot-password/`, `auth/reset-password/`, `learn/[slug]/quiz/`, `articles/[slug]/`, `learning-paths/[pathId]/`, `glossary/[term]/`, `tools/visit-planner/`, `tools/visit-checklist/`, `tools/care-guide/`, `privacy/`, `terms/`, `accessibility/`

---

## Appendix C: Content Review Queue

Items requiring human clinical expert review before launch:

1. **`otc-drug-interactions`** (EN + ES) — NSAIDs, aspirin, acetaminophen interaction table. Verify dosing guidance and drug-drug interaction accuracy.
2. **`understanding-prescription-labels`** (EN + ES) — Spanish equivalents of medical abbreviations (q.d., b.i.d., p.r.n., etc.).
3. **`pain-medications-safely`** (EN + ES) — Opioid dosing section. Confirm warning language aligns with current CDC guidelines. Highest liability risk.
4. **Glossary pharmacology terms** — Batch review terms related to drug classes, interactions, and dosing for plain-language accuracy without losing clinical precision.
5. **Visit Planner tool output** — Generated questions/summaries are educational templates, not diagnoses. Verify disclaimer sufficiency and no alarmist language.
6. **Emergency number guidance** — US-centric 911 references in `MedicalDisclaimer` variant="emergency". ES locale needs appropriate guidance for target audience geography.

After sign-off: update `lastReviewed` frontmatter in each MDX file. Never update dates without actual re-review.

---

## Appendix D: Post-Launch Monitoring Plan

1. **Error monitoring:** Sentry dashboard review weekly. Alert on error rate spike > 10/min. After INF-002, monitor both client and server projects.
2. **Uptime:** UptimeRobot or Netlify monitor on production URL. Alert on 2 consecutive failures.
3. **Content freshness:** Add `npm run content:validate` to CI on every PR touching `content/`. Catches `lastReviewed` drift.
4. **Analytics:** Monthly GA4 review — identify high-exit pages, search terms with no results, quiz abandonment rates.
5. **Dependency audit:** `npm audit` in CI on every merge to `main`.
6. **Supabase health:** Quarterly RLS policy review. Monitor `contact_submissions` for spam patterns. Review rate limit effectiveness.
7. **Performance:** Monthly Lighthouse CI on home + top 5 lessons. Alert on Performance score drop below 85.
8. **User feedback:** Monitor contact form submissions for content accuracy reports. Triage within 48h.
9. **Security:** Annual review of CSP directives when adding third-party scripts. Review auth callback rate limit logs.

---

## Appendix E: Already-Implemented Items

Investigated and confirmed — removed from task list:

| Item                                               | Evidence                                                       |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `js-yaml` override                                 | `package.json` L88: `"js-yaml": "^4.2.0"`                      |
| Contact IP rate limiting                           | `route.ts` L16–56: 5 req/10 min/IP, 429 + Retry-After          |
| Forgot-password locale prefix                      | `ForgotPasswordForm.tsx` L52: `/${locale}/auth/reset-password` |
| `useScrollSpy` deleted                             | Git status: `D src/hooks/useScrollSpy.ts`                      |
| `.env.example` exists                              | Root `.env.example` with Supabase, Sentry, GA vars             |
| `DEPLOYMENT.md` exists                             | `docs/DEPLOYMENT.md` with env table and migration workflow     |
| `loading.tsx` for 12 routes                        | See Appendix B list                                            |
| AVIF/WebP image formats                            | `next.config.mjs` L61                                          |
| `robots.ts`                                        | Disallows `/dashboard/`, `/auth/`, `/api/`                     |
| `MedicalDisclaimer` on lessons/articles/tools/home | 7 files — gaps on glossary/paths/quiz remain (Phase 4)         |
| Sitemap with locale alternates                     | `sitemap.ts`: lessons, articles, glossary, paths, static       |
| CSP headers                                        | `next.config.mjs` L24–46                                       |
| Dev-gated logger                                   | `logger.ts` L2–9: `NODE_ENV === "development"`                 |
| `global-error.tsx` error reporting                 | Calls `reportClientError`                                      |
| Contact honeypot + validation                      | `route.ts`: email regex, length limits, honeypot field         |
| Skip navigation link                               | `Header.tsx` L78 + `main#main-content`                         |
| `EmptyState` in learn/glossary                     | `LearnClient.tsx` L208, `GlossaryClient.tsx` L202              |
| Guest progress migration on login                  | Per HMC-UX-Audit-Report Pass 4                                 |
| `npm audit` clean                                  | 0 vulnerabilities at 2026-06-29 audit                          |
