# HMC-Launch-Build.md

## HealthMadeClear — Production Launch Implementation Plan

Generated: 2026-06-27 | Revised: 2026-06-27 (post-audit corrections)
Estimated Total Duration: **~31 hours** (~1 week of engineering work)

> **Revision note**: Several tasks from the original plan were invalidated by direct file inspection (loading skeletons, image formats, medical disclaimers, sitemap, robots.txt already implemented). This version reflects verified ground truth only.

---

### Table of Contents

1. [Project Overview](#project-overview)
2. [Audit Summary](#audit-summary)
3. [Phase Structure Overview](#phase-structure-overview)
4. [Phase 0: Critical Blockers & Security](#phase-0-critical-blockers--security)
5. [Phase 1: Infrastructure & Configuration](#phase-1-infrastructure--configuration)
6. [Phase 2: Code Quality & TypeScript](#phase-2-code-quality--typescript)
7. [Phase 3: Backend & Data Layer](#phase-3-backend--data-layer)
8. [Phase 4: UI Polish & Feature Completion](#phase-4-ui-polish--feature-completion)
9. [Phase 5: Accessibility (WCAG 2.1 AA)](#phase-5-accessibility-wcag-21-aa)
10. [Phase 6: SEO Verification](#phase-6-seo-verification)
11. [Phase 7: Performance Verification](#phase-7-performance-verification)
12. [Phase 8: Content & Medical Accuracy](#phase-8-content--medical-accuracy)
13. [Phase 9: Testing & QA](#phase-9-testing--qa)
14. [Phase 10: Documentation](#phase-10-documentation)
15. [Phase 11: Pre-Launch Checklist & Go/No-Go Gate](#phase-11-pre-launch-checklist--gono-go-gate)
16. [Appendices](#appendices)

---

### Project Overview

HealthMadeClear (HMC) — bilingual (EN/ES) static health education portal on Next.js 16. Teaches health literacy via lessons, paths, quizzes, articles, glossary. Optional Supabase auth for cross-device progress sync; fully functional offline with localStorage.

**Architecture**: MDX content → bundle scripts → typed data arrays → SSG pages per locale. i18n via `next-intl`, edge routing via `src/middleware.ts`. Deployment target: Netlify with `@netlify/plugin-nextjs`.

---

### Audit Summary

Codebase in strong shape. All 17+ routes built, zero build/type errors, 231 unit tests passing, 20 E2E tests passing. Many items assumed incomplete were already done. Actual gaps are narrower than originally estimated.

**Confirmed issues (require code changes)**:

1. `js-yaml` transitive vulnerability — no override in `package.json`
2. `/api/contact` missing IP-based rate limiting (honeypot exists, but no request-frequency guard)
3. `ForgotPasswordForm.tsx` — `redirectTo` omits locale prefix → broken reset flow for `/es` users
4. `useScrollSpy.ts` + test file — confirmed dead code (zero production imports)
5. `src/hooks/codemap.md` — still documents `useScrollSpy` as active
6. `ToastProvider.tsx` — missing `aria-live` on notification container
7. Inline empty states in `LearnClient.tsx` and `GlossaryClient.tsx` — not using `EmptyState` component
8. `.env.example` — pre-launch checklist item but no file/task ensures it exists
9. `DEPLOYMENT.md` — referenced in pre-launch gate but does not exist

**Already implemented (removed from task list)**:

- `loading.tsx` skeletons — exist for both `/auth/login` and `/auth/signup`
- Image AVIF/WebP formats — configured in `next.config.mjs` L61
- `robots.ts` — properly disallows `/dashboard/`, `/auth/`, `/api/`
- `MedicalDisclaimer` — present on all health content pages (lessons, articles, tools, home)
- Sitemap — fully implemented with locale alternates for all content types
- CSP headers — configured in `next.config.mjs` with strict directives
- `console.log` in production — gated via `logger.ts` utility (dev-only)
- `global-error.tsx` — already calls `reportClientError`

---

### Phase Structure Overview

| Phase                                              | Name                           | Tasks  | Est. Hours |
| -------------------------------------------------- | ------------------------------ | :----: | :--------: |
| [0](#phase-0-critical-blockers--security)          | Critical Blockers & Security   |   2    |     4h     |
| [1](#phase-1-infrastructure--configuration)        | Infrastructure & Configuration |   2    |     2h     |
| [2](#phase-2-code-quality--typescript)             | Code Quality & TypeScript      |   5    |     4h     |
| [3](#phase-3-backend--data-layer)                  | Backend & Data Layer           |   2    |     2h     |
| [4](#phase-4-ui-polish--feature-completion)        | UI Polish & Feature Completion |   3    |     4h     |
| [5](#phase-5-accessibility-wcag-21-aa)             | Accessibility (WCAG 2.1 AA)    |   2    |     2h     |
| [6](#phase-6-seo-verification)                     | SEO Verification               |   2    |     1h     |
| [7](#phase-7-performance-verification)             | Performance Verification       |   1    |     2h     |
| [8](#phase-8-content--medical-accuracy)            | Content & Medical Accuracy     |   2    |     6h     |
| [9](#phase-9-testing--qa)                          | Testing & QA                   |   2    |     3h     |
| [10](#phase-10-documentation)                      | Documentation                  |   2    |     2h     |
| [11](#phase-11-pre-launch-checklist--gono-go-gate) | Pre-Launch Go/No-Go Gate       |   —    |     1h     |
|                                                    | **TOTAL**                      | **27** |  **~31h**  |

---

## Phase 0: Critical Blockers & Security

**Goal**: Resolve security vulnerabilities and protect the contact endpoint before any public exposure.
**Duration**: ~4 hours
**Prerequisites**: None — do first.

### Tasks

- [ ] **SEC-001** — Add `js-yaml` override to `package.json`
  - **File**: `package.json` — `overrides` block (L83–86)
  - **Context**: `gray-matter` pulls in `js-yaml <=4.1.1` which has a Quadratic Complexity DoS. The `overrides` block exists but does not yet pin `js-yaml`. The existing overrides for `next` and `postcss` are the pattern to follow.
  - **Fix**: Add `"js-yaml": ">=4.1.2"` inside `"overrides"`. Run `npm install` to regenerate lockfile.
  - **Acceptance**: `npm audit` returns 0 vulnerabilities.

- [ ] **SEC-002** — IP-based rate limiting on `/api/contact`
  - **File**: `src/app/api/contact/route.ts`
  - **Context**: Route has honeypot, field validation, and length limits (all good), but nothing prevents a single IP from sending hundreds of submissions per minute. Supabase RLS alone is not sufficient mitigation.
  - **Fix**: Add in-memory rate limiter (`Map<string, {count, resetAt}>`) keyed on `request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip")`. Limit: 5 submissions per 10-minute window per IP. Return `429` with `Retry-After` header on breach.
  - **Note**: In-memory store resets on cold start — acceptable for Netlify serverless. If persistence required later, use a Supabase `contact_rate_limits` table or Upstash Redis.
  - **Acceptance**: 6th request from same IP within window returns HTTP 429.

### Done Criteria

1. `npm audit` reports 0 vulnerabilities.
2. Stress test: 6 rapid POST requests to `/api/contact` from same IP → 6th returns 429.

---

## Phase 1: Infrastructure & Configuration

**Goal**: Confirm all third-party services are wired to production credentials and firing correctly.
**Duration**: ~2 hours
**Prerequisites**: Phase 0

### Tasks

- [ ] **INF-001** — Verify `NEXT_PUBLIC_SENTRY_DSN` in Netlify env vars
  - **File**: `src/lib/errorReporting.ts`
  - **Context**: Sentry is lazy-loaded on demand (L29) — no SDK bloat on page load, good pattern. But if `NEXT_PUBLIC_SENTRY_DSN` is absent from Netlify, all client errors are silently swallowed in production. `global-error.tsx` already calls `reportClientError` — just needs the DSN wired up.
  - **Fix**: Netlify dashboard → Site configuration → Environment variables → confirm `NEXT_PUBLIC_SENTRY_DSN` is set to the production DSN. No code change needed.
  - **Acceptance**: Throw a deliberate test error on the production build, verify receipt in Sentry dashboard.

- [ ] **INF-002** — Verify Google Analytics fires on route changes
  - **File**: `src/components/GoogleAnalytics.tsx`
  - **Context**: Confirm `NEXT_PUBLIC_GA_ID` is set in Netlify and pageview events fire on client-side navigation.
  - **Fix**: Env var verification in Netlify. Browser Network tab check on production.
  - **Acceptance**: GA receives pageview events when navigating between `/en/learn` and `/en/glossary`.

### Done Criteria

1. Sentry receives a test error from production.
2. GA dashboard shows live pageview traffic on production deploy.

---

## Phase 2: Code Quality & TypeScript

**Goal**: Remove dead code, fix broken routing logic, tighten types, create `.env.example`.
**Duration**: ~4 hours
**Prerequisites**: Phase 1

### Tasks

- [ ] **COD-001** — Delete `useScrollSpy.ts` and its test file
  - **Files**: `src/hooks/useScrollSpy.ts`, `src/hooks/useScrollSpy.test.tsx`
  - **Context**: Zero production imports confirmed by grep. Active scroll spy lives in `ScrollSpyProvider.tsx`. Hook and test are dead weight — test suite currently exercises code nothing uses.
  - **Fix**: Delete both files.
  - **Acceptance**: `npm test` and `npm run typecheck` pass. Test count drops by the number of tests in `useScrollSpy.test.tsx` (expected — they're removed, not broken).

- [ ] **COD-002** — Update `src/hooks/codemap.md` to remove `useScrollSpy` entry
  - **File**: `src/hooks/codemap.md` (L13)
  - **Context**: After deleting the hook, codemap still lists it as active. Stale docs mislead future contributors.
  - **Fix**: Remove `useScrollSpy` line; add note that scroll spy is now handled by `ScrollSpyProvider.tsx` in `src/components/mdx/`.

- [ ] **COD-003** — Fix locale-aware `redirectTo` in forgot-password form
  - **File**: `src/app/[locale]/auth/forgot-password/ForgotPasswordForm.tsx` — L38
  - **Context**: Bug confirmed. Current: `${window.location.origin}/auth/reset-password`. Supabase email link lands at `/auth/reset-password` with no `[locale]` prefix → middleware redirects to default locale regardless of user language.
  - **Fix**: Add `useLocale()` from `next-intl` and construct: `` `${window.location.origin}/${locale}/auth/reset-password` ``.
  - **Acceptance**: Spanish user (`/es/`) triggers forgot-password → email link lands on `/es/auth/reset-password`.

- [ ] **COD-004** — Tighten `any` types in `mockClient.ts`
  - **File**: `src/lib/supabase/mockClient.ts`
  - **Context**: Loose `any` types create type-drift risk between mock and real client interface over time.
  - **Fix**: Replace `any` with properly typed stubs matching `@supabase/supabase-js` interfaces. Use `as unknown as SupabaseClient` where full fidelity is impractical.
  - **Acceptance**: `npm run typecheck` passes under `strict: true`. No new `any` suppressions added.

- [ ] **COD-005** — Create `.env.example` at project root
  - **File**: `.env.example` (new)
  - **Context**: `check-production-env.mjs` validates `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` at CI build time. Sentry and GA also need vars. No reference file exists for contributors or Netlify setup.
  - **Fix**: Create `.env.example`:
    ```
    NEXT_PUBLIC_SITE_URL=https://your-domain.com
    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    NEXT_PUBLIC_SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
    NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
    # Legacy Netlify aliases (auto-bridged in next.config.mjs)
    # SUPABASE_URL=...
    # SUPABASE_ANON_KEY=...
    ```
  - **Acceptance**: File committed to repo. `.env.example` is NOT in `.gitignore`.

### Done Criteria

1. `npm run typecheck` exits 0.
2. `npm test` passes (count will be lower due to COD-001 deletion — expected).
3. `.env.example` committed.
4. Spanish reset-password link routes to `/es/auth/reset-password`.

---

## Phase 3: Backend & Data Layer

**Goal**: Synchronize Supabase schema to production and verify mock client cannot activate in prod.
**Duration**: ~2 hours
**Prerequisites**: Phase 2

### Tasks

- [ ] **DB-001** — Push all migrations to production Supabase project
  - **Dir**: `supabase/migrations/`
  - **Context**: Local migrations cover: profiles, lesson_progress, quiz_attempts, achievements, streaks, daily_log, notifications, contact_submissions. Production DB must match exactly.
  - **Fix**: Run `supabase db push --linked`. Confirm via `supabase migration list --linked` all migrations show `applied`.
  - **Acceptance**: `supabase migration list --linked` shows all migrations applied, no pending items.

- [ ] **DB-002** — Verify mock client cannot activate in production builds
  - **File**: `src/lib/supabase/env.ts`
  - **Context**: `check-production-env.mjs` blocks CI builds missing env vars — good. But if vars are absent at runtime in production, the app could silently fall back to mock, making auth and progress sync fail without any visible error.
  - **Fix**: Verify `env.ts` throws (does not return mock) when `NODE_ENV === "production"` and env vars are absent. If it doesn't, add the guard.
  - **Acceptance**: Removing `NEXT_PUBLIC_SUPABASE_URL` from a production-mode test build triggers a clear thrown error rather than silent mock fallback.

### Done Criteria

1. `supabase migration list --linked` shows all migrations applied.
2. Missing Supabase vars in production mode throws — not silently mocked.

---

## Phase 4: UI Polish & Feature Completion

**Goal**: Standardize empty state UI, verify responsiveness, audit focus outlines.
**Duration**: ~4 hours
**Prerequisites**: Phase 2 (clean codebase). Phase 3 not required as a blocker.

### Tasks

- [ ] **POL-001** — Replace inline empty states with `EmptyState` component
  - **Files**: `src/app/[locale]/learn/LearnClient.tsx` (L194–215), `src/app/[locale]/glossary/GlossaryClient.tsx` (L193–213)
  - **Context**: Both files contain bespoke inline empty state HTML (icon + heading + paragraph + reset button). `EmptyState` component exists at `src/components/ui/EmptyState.tsx` for exactly this purpose. Inline implementations will drift from the design system over time.
  - **Fix**: Import `EmptyState`, replace inline blocks, pass localized strings as props.
  - **Acceptance**: Search `"xyz123"` in both library and glossary → `EmptyState` component renders. Visually consistent with dashboard empty states.

- [ ] **POL-002** — Verify responsive layout at 375px viewport
  - **Files**: `src/app/globals.css`
  - **Context**: Audit all pages at 375px (iPhone SE — smallest common viewport). Look for horizontal overflow, truncated text, element overlap.
  - **Fix**: Fix any overflow. Prefer fluid `clamp()` for spacing that must scale. Minimal changes expected.
  - **Acceptance**: No horizontal scrollbar on any route at 375px viewport width.

- [ ] **POL-003** — Audit keyboard focus outlines across all interactive elements
  - **File**: `src/app/globals.css` (L35–43)
  - **Context**: Verify every interactive element (buttons, links, inputs, toggles, popover triggers) shows visible 3px focus ring on Tab. Overlaps with Phase 5 but is a visual polish concern too.
  - **Fix**: Identify elements without `:focus-visible` ring and add styles. No `:focus { outline: none }` without `:focus-visible` compensation.
  - **Acceptance**: Tab through every page — all interactive elements show focus ring.

### Done Criteria

1. `EmptyState` component used in `LearnClient` and `GlossaryClient` — no inline empty state divs.
2. No horizontal overflow at 375px on any route.
3. Focus rings visible on all interactive elements.

---

## Phase 5: Accessibility (WCAG 2.1 AA)

**Goal**: Fix confirmed accessibility gaps and validate full keyboard/screen reader flow.
**Duration**: ~2 hours
**Prerequisites**: Phase 4

### Tasks

- [ ] **A11Y-001** — Add `aria-live` to `ToastProvider` notification container
  - **File**: `src/components/ui/ToastProvider.tsx` (L36–44)
  - **Context**: Container has `role="region"` and `aria-label="Notifications"` — correct, but missing `aria-live`. Without it, screen readers won't auto-announce dynamically injected toasts. ARIA spec requires `aria-live` on the container.
  - **Fix**: Add `aria-live="polite"` and `aria-atomic="false"` to the container `<div>`. `aria-atomic="false"` ensures each toast is announced individually rather than the whole region re-read.
  - **Acceptance**: On macOS with VoiceOver active, triggering a toast (e.g., saving settings) causes VoiceOver to announce the message without focus moving.

- [ ] **A11Y-002** — Validate full keyboard navigation flow on all routes
  - **Context**: Systematic tab-through every page. Key targets: Header nav, mobile menu, `SearchDialog.tsx`, glossary popovers (`InlineGlossaryTerm.tsx`), quiz interactions, dashboard tabs.
  - **Fix**: Document failures. Fix any focus traps, broken skip links, or tab order issues found.
  - **Acceptance**: Every interactive element on every route reachable by keyboard alone. No unintentional focus traps.

### Done Criteria

1. VoiceOver announces toasts without moving focus.
2. Full keyboard navigation pass across all 17+ routes — zero keyboard-inaccessible interactions.

---

## Phase 6: SEO Verification

**Goal**: Verify all SEO infrastructure functions correctly. No new implementation required.
**Duration**: ~1 hour
**Prerequisites**: Phase 5

### Tasks

- [ ] **SEO-001** — Validate JSON-LD structured data
  - **File**: `src/components/JsonLd.tsx`
  - **Context**: Structured data already implemented. Run Google Rich Results Test to confirm no warnings on lesson and article pages.
  - **Acceptance**: Rich Results Test reports valid schema, no errors.

- [ ] **SEO-002** — Spot-check sitemap and meta tags
  - **Files**: `src/app/sitemap.ts`, `src/app/[locale]/layout.tsx`
  - **Context**: Sitemap already covers all content types with locale alternates. Spot-checks: (1) `/sitemap.xml` renders cleanly, (2) `<html lang>` matches locale, (3) OG tags render correctly via social card debugger.
  - **Acceptance**: Valid sitemap XML, correct `lang` attribute on both `/en` and `/es`, OG preview renders via Twitter/Facebook validators.

### Done Criteria

1. No Rich Results errors on structured data.
2. Sitemap returns valid XML with `/en` and `/es` paths for all content types.
3. OG previews render correctly on social validators.

---

## Phase 7: Performance Verification

**Goal**: Confirm Lighthouse scores meet targets. Fix any regressions found.
**Duration**: ~2 hours
**Prerequisites**: Phase 6

### Tasks

- [ ] **PERF-001** — Run Lighthouse against production build
  - **Context**: Targets — Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100 (mobile). Key Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms.
  - **Fix**: `npm run build && npm run start`, then Lighthouse in Chrome DevTools on home page, a lesson page, and a glossary page. Address any failures before proceeding.
  - **Acceptance**: All four Lighthouse categories meet targets on at least home and one lesson page.

### Done Criteria

1. Lighthouse Performance ≥ 90 on mobile.
2. Lighthouse Accessibility ≥ 95.
3. LCP, CLS, INP within Core Web Vitals thresholds.

---

## Phase 8: Content & Medical Accuracy

**Goal**: Ensure clinical review currency, translation parity, and content validation passes.
**Duration**: ~6 hours (human review time dominates)
**Prerequisites**: Phase 7

### Tasks

- [ ] **CONT-001** — Run `npm run content:validate` and resolve all failures
  - **File**: `scripts/validate-content.ts`
  - **Context**: Validator enforces: `lastReviewed` within 12 months, EN/ES ID parity, no stub quiz explanations (pattern: `/ — correct\.$/ `), minimum section counts. Any lesson/article with `lastReviewed` older than 2025-06-27 will throw.
  - **Fix**: Update stale `lastReviewed` dates **only after clinical review is completed**. Never update dates without actual re-review.
  - **Acceptance**: `npm run content:validate` exits 0 with "Content validation passed."

- [ ] **CONT-002** — Clinical spot-check of high-risk content (see Appendix C)
  - **Context**: Three lessons require PharmD-level verification before launch. Cannot be verified programmatically.
  - **Fix**: Route flagged MDX files to clinical reviewer. Update `lastReviewed` frontmatter post sign-off.
  - **Acceptance**: All three flagged lessons reviewed and signed off by qualified clinical professional.

### Done Criteria

1. `npm run content:validate` exits 0.
2. All flagged high-risk content reviewed by clinical professional.

---

## Phase 9: Testing & QA

**Goal**: Full automated test suite passes. Core user journey verified across browsers.
**Duration**: ~3 hours
**Prerequisites**: Phase 8

### Tasks

- [ ] **TST-001** — Full automated test suite pass
  - **Commands**: `npm test` (vitest), `npm run test:e2e` (Playwright)
  - **Acceptance**: All vitest tests pass. All 20 Playwright tests pass across Chromium, Firefox, WebKit.

- [ ] **TST-002** — Cross-browser smoke test on production deploy
  - **Context**: Playwright covers multi-browser automatically. Also manually test on iOS Safari (dominant health app browser demographic). Key flows: login, lesson progress save, quiz completion, language toggle, forgot-password email link.
  - **Acceptance**: No visual regressions or uncaught JS errors on Chrome, Firefox, Safari, iOS Safari for core user journey.

### Done Criteria

1. `npm test` exits 0.
2. `npm run test:e2e` exits 0 on all browsers.
3. Core user journey manually verified on iOS Safari.

---

## Phase 10: Documentation

**Goal**: `README.md` complete, `DEPLOYMENT.md` created.
**Duration**: ~2 hours
**Prerequisites**: Phase 9

### Tasks

- [ ] **DOC-001** — Audit and update `README.md`
  - **File**: `README.md`
  - **Context**: Verify README covers: local dev setup, env var setup (link to `.env.example`), content bundling commands, test commands, Supabase migration workflow.
  - **Acceptance**: A new contributor can clone and get dev server running using README alone.

- [ ] **DOC-002** — Create `DEPLOYMENT.md`
  - **File**: `DEPLOYMENT.md` (new at project root)
  - **Context**: Ops runbook. Must cover: Netlify env var checklist, Supabase migration deployment (`supabase db push --linked`), content rebuild workflow, rollback procedure, post-deploy verification steps.
  - **Acceptance**: File committed; covers all env vars from `.env.example`; references `check-production-env.mjs`; documents migration step.

### Done Criteria

1. README accurate and self-sufficient for new contributors.
2. `DEPLOYMENT.md` committed to repo.

---

## Phase 11: Pre-Launch Checklist & Go/No-Go Gate

**Goal**: Final sign-off review. No production deploy until all boxes checked.
**Duration**: ~1 hour
**Prerequisites**: All preceding phases complete.

### Security ✓

- [ ] `npm audit` — 0 vulnerabilities
- [ ] `js-yaml` override confirmed in `package.json`
- [ ] IP rate limiting on `/api/contact` — verified via stress test
- [ ] No secrets in client-side bundle (inspect `npm run build` output)
- [ ] `.env.example` committed; `.env.local` in `.gitignore`
- [ ] CSP headers active in production response headers (Network tab check)
- [ ] HTTPS enforced on production domain

### Code Quality ✓

- [ ] `npm run typecheck` — exit 0
- [ ] `npm run lint` — exit 0
- [ ] `npm run format:check` — exit 0
- [ ] `npm test` — all tests pass
- [ ] `npm run test:e2e` — all E2E tests pass
- [ ] `npm run content:validate` — exit 0
- [ ] Dead code (`useScrollSpy`) deleted

### Routing & i18n ✓

- [ ] All routes work under both `/en/` and `/es/` prefixes
- [ ] Forgot-password email link routes to locale-prefixed `/auth/reset-password`
- [ ] Language toggle preserves current route

### Performance ✓

- [ ] Lighthouse Performance ≥ 90 (mobile)
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] Images served as AVIF/WebP (confirmed in `next.config.mjs`)
- [ ] Font `display: swap` configured

### Accessibility ✓

- [ ] WCAG 2.1 AA — Lighthouse Accessibility ≥ 95
- [ ] `aria-live="polite"` on toast container
- [ ] Full keyboard navigation verified (all routes)
- [ ] VoiceOver / NVDA announces toasts
- [ ] Color contrast AA on all text
- [ ] All images have descriptive `alt` text

### SEO ✓

- [ ] Unique `<title>` and `<meta description>` on all pages
- [ ] OG and Twitter Card tags on all content pages
- [ ] `hreflang` alternates in sitemap for EN/ES
- [ ] `/sitemap.xml` returns valid XML
- [ ] `/robots.txt` disallows `/dashboard/`, `/auth/`, `/api/`
- [ ] Structured data validates in Google Rich Results Test

### Content & Medical Safety ✓

- [ ] `MedicalDisclaimer` present on all health content pages
- [ ] All content reviewed by clinical professional within 12 months
- [ ] `npm run content:validate` passes
- [ ] Terms of Service and Privacy Policy pages live
- [ ] Emergency disclaimer (911 call) present on home page and care-guide tool

### Infrastructure ✓

- [ ] All Netlify env vars configured (per `DEPLOYMENT.md`)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` active — test error received in Sentry
- [ ] `NEXT_PUBLIC_GA_ID` active — pageviews firing in GA
- [ ] All Supabase migrations applied (`supabase migration list --linked` clean)
- [ ] Mock client cannot activate in production build

### Documentation ✓

- [ ] `README.md` up to date
- [ ] `DEPLOYMENT.md` committed
- [ ] `.env.example` committed

---

## Appendices

### Appendix A: Dependency Audit

| Package                 | In `package.json`          | Status | Action                                                  |
| ----------------------- | -------------------------- | ------ | ------------------------------------------------------- |
| `next`                  | `16.2.9` (pinned)          | ✅     | Pinned via override — intentional                       |
| `@supabase/supabase-js` | `^2.108.2`                 | ✅     | Current                                                 |
| `@supabase/ssr`         | `^0.12.0`                  | ✅     | Current                                                 |
| `@sentry/browser`       | `^10.60.0`                 | ✅     | Lazy-loaded, no page-load cost                          |
| `next-intl`             | `^4.13.0`                  | ✅     | Current                                                 |
| `gray-matter`           | `^4.0.3`                   | ⚠️     | Pulls vulnerable `js-yaml` — fix via override (SEC-001) |
| `js-yaml`               | transitive via gray-matter | ❌     | Add `">=4.1.2"` to `overrides`                          |
| `lucide-react`          | `^1.21.0`                  | ✅     | Tree-shaken via `optimizePackageImports`                |

### Appendix B: Confirmed Issue Log

| File                                  | Line(s) | Issue                                  | Severity   | Phase | Task     |
| ------------------------------------- | ------- | -------------------------------------- | ---------- | ----- | -------- |
| `package.json`                        | 83–86   | `js-yaml` override missing             | **High**   | 0     | SEC-001  |
| `src/app/api/contact/route.ts`        | 15      | No IP rate limiting                    | **High**   | 0     | SEC-002  |
| `ForgotPasswordForm.tsx`              | 38      | `redirectTo` missing locale prefix     | **Medium** | 2     | COD-003  |
| `src/hooks/useScrollSpy.ts`           | all     | Dead code (zero prod imports)          | Low        | 2     | COD-001  |
| `src/hooks/useScrollSpy.test.tsx`     | all     | Test for dead hook                     | Low        | 2     | COD-001  |
| `src/hooks/codemap.md`                | 13      | Still documents deleted hook           | Low        | 2     | COD-002  |
| `src/lib/supabase/mockClient.ts`      | various | Loose `any` types                      | Low        | 2     | COD-004  |
| `.env.example`                        | —       | File does not exist                    | Medium     | 2     | COD-005  |
| `src/components/ui/ToastProvider.tsx` | 36–44   | Missing `aria-live="polite"`           | **Medium** | 5     | A11Y-001 |
| `LearnClient.tsx`                     | 194–215 | Inline empty state not using component | Low        | 4     | POL-001  |
| `GlossaryClient.tsx`                  | 193–213 | Inline empty state not using component | Low        | 4     | POL-001  |
| `DEPLOYMENT.md`                       | —       | File does not exist                    | Medium     | 10    | DOC-002  |

### Appendix C: Content Clinical Review Queue

These require manual review by a qualified clinical professional before launch:

1. **`otc-drug-interactions`** (EN + ES) — NSAIDs, aspirin, acetaminophen interaction table. Verify dosing guidance and drug-drug interaction accuracy.
2. **`understanding-prescription-labels`** (EN + ES) — Verify Spanish translation equivalents of medical abbreviations (q.d., b.i.d., p.r.n., etc.).
3. **`pain-medications-safely`** (EN + ES) — Opioid dosing section. Confirm warning language is current with DEA/CDC 2024 guidelines. Highest liability risk in the content library.

After clinical sign-off, update `lastReviewed` frontmatter in each MDX file.

### Appendix D: Already-Done Items (Reference)

Investigated and confirmed already implemented — not in task list:

| Item                                    | Evidence                                                              |
| --------------------------------------- | --------------------------------------------------------------------- |
| `loading.tsx` skeletons for auth routes | Exist at `/auth/login/loading.tsx` and `/auth/signup/loading.tsx`     |
| AVIF/WebP image formats                 | `next.config.mjs` L61: `formats: ["image/avif", "image/webp"]`        |
| `robots.ts` configured                  | Disallows `/dashboard/`, `/auth/`, `/api/`; points to sitemap         |
| `MedicalDisclaimer` on all health pages | Confirmed in 7 files: lessons, articles, tools (all variants)         |
| Sitemap with locale alternates          | `sitemap.ts` covers lessons, articles, glossary, paths, static routes |
| CSP headers                             | Configured in `next.config.mjs` L34–47 with strict directives         |
| No `console.log` in production          | Gated via `src/lib/logger.ts` (dev-only)                              |
| `global-error.tsx` error reporting      | Already calls `reportClientError` on mount                            |
| Contact form input sanitization         | Length limits, email regex, honeypot all implemented                  |

### Appendix E: Post-Launch Monitoring Plan

1. **Error monitoring**: Sentry captures uncaught exceptions via `reportClientError`. Review weekly.
2. **Uptime**: Configure UptimeRobot or Netlify-native monitoring on production URL.
3. **Content freshness**: Add `npm run content:validate` to CI pipeline to catch `lastReviewed` drift automatically.
4. **Analytics**: Monthly GA review — identify high-exit pages needing content or UX improvement.
5. **Dependency audit**: `npm audit` on every merge to `main` (add to CI).
6. **Supabase health**: Monitor RLS policy coverage quarterly. Review DB logs for unexpected anonymous insertions to `contact_submissions`.
