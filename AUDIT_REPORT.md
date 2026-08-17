# AUDIT_REPORT.md — Full Codebase Remediation

**Branch:** `audit/full-codebase-remediation`
**Date:** 2026-08-12
**Auditor:** Automated full-codebase audit

---

## Executive Summary

A comprehensive audit of the HealthMadeClear codebase verified all 22 prior findings (F-001 through F-022) as Fixed, found and fixed 1 new P2 bug (F-023: pagination return value), committed 1 batch of uncommitted a11y/perf improvements (F-026), and documented 2 deferred items (F-024: acceptable lint warnings; F-025: production 403s caused by Netlify edge bot detection, not code-level bugs).

The codebase is in excellent shape. All 16 audit dimensions (A–P) were examined with concrete evidence. The audit found no critical security vulnerabilities, no hardcoded secrets, no XSS vectors, and no unhandled promise rejections. The main findings were:

1. **Build broken** (P0, prior): `next build` failed due to an illegal route export and Turbopack font fetching issues. **Fixed.**
2. **64MB autoplay video** (P0, prior): The homepage video was 64MB, devastating LCP and bandwidth. **Fixed (98% reduction).**
3. **Missing `setRequestLocale`** (P1, prior): 19 page.tsx files were missing `setRequestLocale` calls, preventing static rendering optimization. **Fixed.**
4. **CSRF protection gap** (P1, prior): The contact endpoint lacked Origin header validation. **Fixed.**
5. **PII leakage risk** (P2, prior): GA `page_view` events sent full URLs including query params; Sentry events and server logs lacked PII scrubbing. **Fixed.**
6. **Pagination return value bug** (P2, new): `getCompletedLessonsPaginated` returned raw `page`/`pageSize` instead of clamped `safePage`/`safePageSize`, causing incorrect `totalPages` when negative values passed. **Fixed with regression test.**

All fixes preserve existing user-facing behavior, routes, and public APIs. No UI restyles, no feature changes, no dependency swaps.

---

## Findings by Dimension and Severity

### A. Correctness & Latent Bugs

| ID    | Severity | File:Line                               | Problem                                                                                                                                                                 | Fix                                                                                                 | Status |
| ----- | -------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------ |
| F-001 | P0       | `src/app/api/contact/route.ts:6`        | `next build` typecheck fails — `Property 'clearRateLimitStore' is incompatible with index signature`. Next.js 16 forbids non-route exports.                             | Removed export; updated test to import from `@/lib/rateLimit` directly.                             | Fixed  |
| F-002 | P1       | `src/app/fonts.ts:10`                   | Default `next build` (Turbopack) fails — font fetch returns 404 from gstatic.                                                                                           | Pinned build to webpack via `--webpack` flag in `build` script.                                     | Fixed  |
| F-003 | P1       | 19 page.tsx files                       | Missing `setRequestLocale(locale)` — prevents static rendering optimization.                                                                                            | Added `setRequestLocale` calls to all affected pages.                                               | Fixed  |
| F-016 | P1       | `src/lib/streaks.ts`                    | Streaks race condition (concurrent upserts both insert), timezone bug (server-local time), hardcoded return value.                                                      | Added `{ onConflict: "user_id" }` to both upserts. Used UTC dates. Returned actual `inserted` data. | Fixed  |
| F-023 | P2       | `src/lib/dashboard/progress.ts:135-140` | `getCompletedLessonsPaginated` returned raw `page`/`pageSize` instead of clamped `safePage`/`safePageSize`, causing incorrect `totalPages` when negative values passed. | Changed return value to use `safePage`/`safePageSize`. Added regression test.                       | Fixed  |

### B. Type Safety

| ID    | Severity | File:Line                      | Problem                                          | Fix                                          | Status |
| ----- | -------- | ------------------------------ | ------------------------------------------------ | -------------------------------------------- | ------ |
| F-013 | P2       | `src/hooks/useProgress.ts:126` | `quizScores` typed as `any[]` — could mask bugs. | Changed to `QuizScore[]` with proper import. | Fixed  |

### C. Security

| ID    | Severity | File:Line                          | Problem                                                                                                                  | Fix                                                                                                                                           | Status |
| ----- | -------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F-004 | P1       | `src/app/api/contact/route.ts`     | Contact endpoint lacks CSRF protection — accepts cross-origin POST with `Content-Type: text/plain`.                      | Added `isAllowedOrigin()` function checking `Origin` header against site origin. Returns 403 if missing/mismatched. Added 2 regression tests. | Fixed  |
| F-008 | P3       | `next.config.mjs:38-61`            | HSTS header missing from `next.config.mjs` (only in `netlify.toml`).                                                     | Added `Strict-Transport-Security` header to `securityHeaders` array.                                                                          | Fixed  |
| F-009 | P3       | `next.config.mjs:48-59`            | CSP missing `object-src 'none'` — relies on `default-src 'self'` fallback.                                               | Added `"object-src 'none'"` to CSP.                                                                                                           | Fixed  |
| F-018 | P2       | `src/lib/auth/sanitizeRedirect.ts` | `sanitizeRedirectPath` doesn't reject CRLF characters (`\r`, `\n`) or their encoded forms (`%0d`, `%0a`).                | Added CRLF rejection check.                                                                                                                   | Fixed  |
| F-022 | P2       | `src/lib/auth/requireAuth.ts`      | `requireAuth` passes `redirectTo` directly to `encodeURIComponent` without sanitizing it through `sanitizeRedirectPath`. | Added `sanitizeRedirectPath(redirectTo)` call before encoding.                                                                                | Fixed  |

### D. Privacy

| ID    | Severity | File:Line                    | Problem                                                                                                                                      | Fix                                                                                                                                                                             | Status |
| ----- | -------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F-010 | P2       | `src/lib/errorReporting.ts`  | Sentry `captureException` sends raw error messages/stacks (PII risk). `reportServerError` logs raw error messages to Netlify logs.           | Added `scrubPII()` function replacing email, phone, SSN, credit card patterns with placeholders. Applied to `reportServerError` and Sentry `beforeSend` hook.                   | Fixed  |
| F-011 | P2       | `src/lib/analytics.ts:24,28` | GA `page_view` sends `page_location: window.location.href` (full URL including query params) — PII leakage risk if query params contain PII. | Changed to send `page_location: window.location.origin + window.location.pathname` (no query params) and `page_path: window.location.pathname` (no query params). Updated test. | Fixed  |

### E. Performance

| ID    | Severity | File:Line                                                                                                                  | Problem                                                                                                                                             | Fix                                                                                                                                                                                                                | Status |
| ----- | -------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| F-005 | P0       | `public/HMC_Video.mp4` (64MB), `src/app/[locale]/HomeClient.tsx:57`                                                        | 64MB autoplay video on homepage — devastating LCP, bandwidth, mobile data costs. No `poster`, no `preload` (defaults to `auto` → fetches all 64MB). | Compressed video with ffmpeg (CRF 30, 1280px wide, faststart) from 64MB to 1.3MB (98% reduction). Added `poster="/hmc-video-poster.jpg"` (29KB), `preload="metadata"`, and `width={1280} height={720}` attributes. | Fixed  |
| F-006 | P1       | `public/logo.jpeg` (1.2MB), `src/components/Logo.tsx:6`, `src/app/[locale]/layout.tsx:84-85`, `public/manifest.json:11,17` | 1.2MB JPEG logo used as favicon and `<img>` in Logo.tsx. JPEG is wrong format for a logo (raster, no scaling).                                      | Replaced all references to `logo.jpeg` with `favicon.svg` (1.3KB SVG). Updated `manifest.json` to use SVG icon. Deleted 1.2MB `logo.jpeg`.                                                                         | Fixed  |
| F-012 | P2       | `src/app/[locale]/layout.tsx`                                                                                              | Missing `viewport` export — Next.js 14+ recommends separate `viewport` export for viewport meta tag and `themeColor`.                               | Added `export const viewport: Viewport = { themeColor: "#004349", width: "device-width", initialScale: 1 }` to layout.                                                                                             | Fixed  |

### F. Accessibility (WCAG 2.2 AA)

No new findings. The codebase has excellent accessibility:

- Skip link to `#main-content` with `tabIndex={-1}` on main
- Proper focus management with `useFocusTrap` hook
- `prefers-reduced-motion` support in globals.css and motion components
- Form labels, error announcements (`role="alert"`), and ARIA attributes throughout
- `:focus-visible` styles with 3px outline
- Touch target sizes meet WCAG 2.2 AA (24x24px minimum)

### G. SEO & Metadata

No findings. All routes have correct `metadata`/`generateMetadata` exports with canonical URLs, Open Graph/Twitter cards, and `robots` directives. `sitemap.xml` and `robots.txt` are correctly configured.

### H. i18n Completeness

No findings. EN and ES message catalogs have identical key structures. All user-facing strings are routed through the i18n system. Language switching preserves the current path.

### I. Error Handling & Resilience

No findings. `error.tsx`/`global-error.tsx`/`not-found.tsx` coverage is complete. Every async operation has loading, error, and empty states. Network failures are handled gracefully with offline banner and retry button.

### J. Testing

No findings. 578 tests pass across 86 files. Critical logic (validation, data transforms, auth-adjacent utilities) has good coverage. Added 1 regression test for F-023.

### K. Code Quality

| ID    | Severity | File:Line                                                  | Problem                                                            | Fix                                                                  | Status |
| ----- | -------- | ---------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- | ------ |
| F-007 | P3       | `stitch_health_made_clear_ux_design/` directory (11 files) | Figma export screenshots committed to repo. Not needed at runtime. | `git rm -r stitch_health_made_clear_ux_design/` to remove from repo. | Fixed  |

### L. Architecture & Structure

No findings. App Router conventions are used correctly. Circular dependencies are not present. Middleware correctly handles i18n routing and Supabase session updates.

### M. Styling & Tailwind

No findings. Tailwind v4 is used with `@tailwindcss/typography` plugin. Custom theme tokens are defined in `tailwind.config.ts` and `globals.css`. Dark mode is supported via `data-theme="dark"` class.

### N. Dependencies & Build Config

No findings. `npm audit` reports 0 high/critical vulnerabilities. All packages are on recent versions. `next.config.mjs` is well-configured with security headers, CSP, and image optimization.

### O. CI/CD & Netlify

| ID    | Severity | File:Line                                  | Problem                                                                                                                            | Fix                         | Status   |
| ----- | -------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------- |
| F-024 | P3       | `GoogleAnalytics.test.tsx:9`, `Logo.tsx:6` | 2 pre-existing lint warnings: sync scripts in test mock, `<img>` in Logo. Both acceptable.                                         | None (acceptable)           | Deferred |
| F-025 | Deferred | `audit-summary.txt` (various lines)        | HTTP 403 responses on production during Playwright audit. Caused by Netlify edge bot detection/rate limiting, not code-level bugs. | None (infrastructure issue) | Deferred |

### P. Documentation & Developer Experience

No findings. README is accurate with setup steps, env vars, scripts, and architecture overview. `CONTRIBUTING.md` and `docs/DEPLOYMENT.md` are present and up-to-date.

---

## Tests Added

- `src/lib/dashboard/__tests__/progress.test.ts`: Added 1 regression test "clamps negative page and pageSize to valid ranges" for F-023.

## Dependency Changes

No dependency changes. No new runtime dependencies were added. All fixes use the existing stack.

## Remaining Risks

1. **In-memory rate limit resets on serverless cold start** — documented in `src/lib/rateLimit.ts:40`. The rate limit is in-memory and resets on serverless cold start. This is a known limitation of serverless architectures. A persistent rate limit store (e.g., Upstash Redis) would be more robust but adds infrastructure complexity.

2. **`'unsafe-inline'` in CSP `script-src`** — The CSP allows `'unsafe-inline'` for scripts, which defeats much of CSP's XSS mitigation. Inline scripts exist in `GoogleAnalytics.tsx`, `JsonLd.tsx`, and Next.js's own inline scripts. Removing `'unsafe-inline'` requires Next.js nonce generation (`headers()` + `nonce`), which is a significant refactor. This is deferred.

3. **Contact PII/PHI stored plaintext in Supabase** — The `contact_submissions` table stores name, email, and message as plaintext. Since this is a health education site, users may include health-related information in the `message` field, which would be stored as plaintext PHI. Encrypting PII at rest would be more secure but adds complexity. This is deferred.

4. **`markdown-it` loaded eagerly into client bundle** — The `src/components/mdx/MarkdownRenderer.tsx` imports `markdown-it` at the top level, which bundles ~150KB of markdown-it into the client. Moving markdown rendering to the server (pre-rendering markdown to HTML at build time) would eliminate this, but it's a significant refactor. This is deferred.

## Recommended Follow-ups (Out of Scope)

1. **Migrate from in-memory rate limit to Upstash Redis** — For persistent rate limiting across serverless cold starts.
2. **Implement CSP nonces** — To remove `'unsafe-inline'` from `script-src` and strengthen XSS mitigation.
3. **Encrypt contact PII at rest** — Use Supabase's column-level encryption or a client-side encryption library.
4. **Pre-render markdown at build time** — Move markdown-it to build-time only, eliminating it from the client bundle.
5. **Add `BreadcrumbList` JSON-LD to content pages** — For rich result eligibility in search engines.
6. **Pre-generate OG images at build time** — To improve crawler reliability and reduce edge function cold start latency.
7. **Configure Netlify edge rate limiting** — To allow known audit scripts while still blocking abusive traffic.

---

## Verification Gates

All verification gates pass:

- `tsc --noEmit` → 0 errors ✅
- `npm run lint` → 0 errors, 2 acceptable warnings ✅
- `npx vitest run` → 578 tests pass across 86 files ✅
- `npm run build` → succeeds, 363 static pages generated ✅
- `npm audit` → 0 high/critical vulnerabilities ✅
- `AUDIT_LOG.md` → every entry marked Fixed or Deferred (with reason) ✅
- Zero open P0/P1 findings ✅
