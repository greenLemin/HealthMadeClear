# Audit Log — Full Codebase Remediation

Branch: `audit/full-codebase-remediation`
Started: 2026-08-11

## Reconnaissance Baseline

| Gate                                | Result                                                                                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                 | PASS (0 errors)                                                                                                                                                            |
| `npm run lint`                      | 2 warnings (GoogleAnalytics.test sync script, Logo.tsx img element)                                                                                                        |
| `npm test` (vitest)                 | PASS — 575 tests across 86 files                                                                                                                                           |
| `npm run build` (turbopack default) | FAIL — `@vercel/turbopack-next/internal/font/google/font` cannot resolve when Newsreader font fetch returns 404 from gstatic. Network-dependent font fetching is fragile.  |
| `npm run build --webpack`           | FAIL — type check fails on `.next/types/app/api/contact/route.ts` because `clearRateLimitStore` is exported from a route handler (Next.js 16 disallows non-route exports). |
| `npm audit`                         | 0 vulnerabilities (high). 1 warning: `NODE_TLS_REJECT_UNAUTHORIZED=0` set somewhere — investigate.                                                                         |

## Findings

### F-001 — P0 — Build broken: illegal export from route handler

- File: `src/app/api/contact/route.ts:6`
- Symptom: `next build` typecheck fails — `Property 'clearRateLimitStore' is incompatible with index signature`. Next.js 16 forbids non-route exports from `app/.../route.ts`.
- Fix: Remove `export { clearRateLimitStore }`; update test to import `clearRateLimitStore` from `@/lib/rateLimit` directly.
- Status: Fixed

### F-002 — P1 — Build broken: Turbopack next/font Google fetch 404

- File: `src/app/fonts.ts:10` (Newsreader)
- Symptom: Default `next build` (Turbopack) fails because Turbopack eagerly fetches Google Font woff2 files at build time and the local network returns 404. Webpack build works (with F-001 fixed). This is environment-dependent and will fail in CI.
- Fix: Adjust `next.config.mjs` build to use webpack (Next 16 default is Turbopack). Set `turbopack: false` equivalent by passing `--webpack` to `next build`, OR pin Turbopack but ensure font loader is robust. Decision: use webpack for now via `next build --webpack`; document that Turbopack default in Next 16 has issues with next/font in restricted network environments.
- Status: Fixed

### F-003 — P1 — Missing `setRequestLocale` in 19 page.tsx files

- Files: `src/app/[locale]/{contact,tools/visit-planner,tools/care-guide,tools/visit-checklist,tools,privacy,terms,about,accessibility,glossary,glossary/[term],learning-paths,learning-paths/[pathId],learn/[slug],learn/[slug]/quiz,dashboard,dashboard/settings,dashboard/progress,dashboard/achievements}/page.tsx`
- Symptom: Per `next-intl` App Router docs, every page must call `setRequestLocale(locale)` to enable static rendering. Without it, `getTranslations()` and `useTranslations()` fall back to dynamic rendering.
- Fix: Added `setRequestLocale(locale)` to the default export of each affected page, after destructuring `params`. For pages where the default export was previously a synchronous component without `params`, upgraded to `async function Page({ params }: Props)` with `await params` and the `setRequestLocale` call.
- Status: Fixed

### F-004 — P1 — Contact endpoint lacks CSRF protection

- File: `src/app/api/contact/route.ts`
- Symptom: The POST handler accepts JSON via `request.json()`. An attacker could submit a cross-origin POST with `Content-Type: text/plain` (which doesn't trigger CORS preflight) and the server would parse it as JSON and insert into the database. The honeypot and rate limit are the only defenses, and both are bypassable.
- Fix: Added `isAllowedOrigin()` function that checks the `Origin` header against the site's origin (comparing hostname). Returns 403 if Origin is missing or doesn't match. Added 2 regression tests for missing/mismatched Origin.
- Status: Fixed

### F-005 — P0 — 64MB autoplay video on homepage (LCP/bandwidth)

- Files: `public/HMC_Video.mp4` (64MB), `src/app/[locale]/HomeClient.tsx:57`
- Symptom: 1920x1080 H.264 video at 13.3 Mbps, 40 seconds long, 64MB file size. Auto-played on homepage with no `poster`, no `preload` attribute (defaults to `auto` → fetches all 64MB). Devastates LCP, bandwidth, and mobile data costs.
- Fix: Compressed video with ffmpeg (CRF 30, 1280px wide, faststart) from 64MB to 1.3MB (98% reduction). Quality remains visually identical for a background video. Added `poster="/hmc-video-poster.jpg"` (29KB extracted first frame), `preload="metadata"` (defers loading until user interacts), and `width={1280} height={720}` attributes (prevents CLS by reserving space).
- Status: Fixed

### F-006 — P1 — 1.2MB JPEG logo replaced with 1.3KB SVG

- Files: `public/logo.jpeg` (1.2MB), `src/components/Logo.tsx:6`, `src/app/[locale]/layout.tsx:84-85`, `public/manifest.json:11,17`
- Symptom: `logo.jpeg` was 1.2MB, used as favicon icon (192x192 and 512x512) and as the `<img>` in `Logo.tsx`. JPEG is wrong format for a logo (raster, no scaling). The existing `favicon.svg` (1.3KB) is an infinitely scalable SVG with the same design.
- Fix: Replaced all references to `logo.jpeg` with `favicon.svg`. Updated `manifest.json` to use the SVG icon. Deleted the 1.2MB `logo.jpeg`.
- Status: Fixed

### F-007 — P3 — Stitch design artifacts in repo

- Files: `stitch_health_made_clear_ux_design/` directory (11 files)
- Symptom: Figma export screenshots committed to repo. Not needed at runtime. Already gitignored but still in repo history.
- Fix: `git rm -r stitch_health_made_clear_ux_design/` to remove from repo.
- Status: Fixed

### F-008 — P3 — HSTS header missing from next.config.mjs

- File: `next.config.mjs:38-61`
- Symptom: `Strict-Transport-Security` header was only in `netlify.toml`, not in `next.config.mjs` `securityHeaders` array. Defense-in-depth wants it in both.
- Fix: Added `{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }` to `securityHeaders`.
- Status: Fixed

### F-009 — P3 — CSP missing `object-src 'none'`

- File: `next.config.mjs:48-59`
- Symptom: CSP relies on `default-src 'self'` fallback for `object-src`, which permits plugins from same origin. Explicit `object-src 'none'` is more secure.
- Fix: Added `"object-src 'none'"` to CSP.
- Status: Fixed

### F-010 — P2 — PII scrubbing for Sentry and server logs

- File: `src/lib/errorReporting.ts`
- Symptom: `reportClientError` calls `Sentry.captureException` with raw error messages and stack traces. If a Supabase/Postgres error includes submitted PII (e.g., unique constraint violation echoing the duplicate email), that PII reaches Sentry. Similarly, `reportServerError` logs raw error messages to Netlify function logs.
- Fix: Added `scrubPII()` function that replaces email addresses, phone numbers, SSNs, and credit card numbers with `[email]`, `[phone]`, `[ssn]`, `[card]` placeholders. Applied scrubbing to:
  - `reportServerError`: scrubs `normalized.message` before `console.error`
  - `reportClientError`: added `beforeSend` hook to Sentry init that scrubs PII from `event.message`, `event.exception.values[].value`, and `event.exception.values[].stacktrace.frames[].filename/function`
- Status: Fixed

### F-011 — P2 — GA `page_view` sends full URL including query string

- Files: `src/lib/analytics.ts:24,28`, `src/components/AnalyticsPageViewTracker.tsx:14,18`
- Symptom: `trackPageView` sends `page_location: window.location.href` (full URL including query params) to Google Analytics. If any page puts PII in query params (e.g., `?email=user@example.com`), it would leak to GA. The `SEARCH_PERFORMED` event exists but is not currently called from any component — good.
- Fix: Changed `trackPageView` to send `page_location: window.location.origin + window.location.pathname` (no query params) and `page_path: window.location.pathname` (no query params). Updated test to match new implementation.
- Status: Fixed

### F-012 — P2 — Missing `viewport` export in layout

- File: `src/app/[locale]/layout.tsx`
- Symptom: Next.js 14+ recommends a separate `viewport` export for the viewport meta tag and `themeColor`. Without it, the default viewport is used, which may not be optimal for mobile. The `themeColor` was not set anywhere in metadata.
- Fix: Added `export const viewport: Viewport = { themeColor: "#004349", width: "device-width", initialScale: 1 }` to layout.
- Status: Fixed

### F-013 — P2 — `quizScores` typed as `any[]` in `useProgress.ts`

- File: `src/hooks/useProgress.ts:126`
- Symptom: `useDerivedProgress` function parameter `quizScores: any[]` — `any[]` allows any value, which could mask bugs. The actual `quizScores` from `useAppState()` is `QuizScore[]`.
- Fix: Changed parameter type from `any[]` to `QuizScore[]` and added import for `QuizScore` type from `@/lib/progressExport`.
- Status: Fixed

### F-014 — P2 — SignupForm missing email format validation

- File: `src/app/[locale]/auth/signup/SignupForm.tsx`
- Symptom: `SignupForm.handleSubmit` only checks if email is empty (`if (!email.trim()) nextFieldErrors.email = t("emailRequired")`). No email format validation, allowing invalid email addresses to be submitted to Supabase. `LoginForm` has `EMAIL_REGEX` check but `SignupForm` doesn't.
- Fix: Added `EMAIL_REGEX` constant and email format validation to `SignupForm.handleSubmit`, consistent with `LoginForm`.
- Status: Fixed

### F-015 — P1 — Auth forms stuck loading on network errors

- Files: `src/app/[locale]/auth/login/LoginForm.tsx`, `src/app/[locale]/auth/signup/SignupForm.tsx`, `src/app/[locale]/auth/forgot-password/ForgotPasswordForm.tsx`, `src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx`
- Symptom: All four auth form components had async Supabase calls (`signInWithPassword`, `signUp`, `resetPasswordForEmail`, `updateUser`) without try/catch. If the Supabase client throws (network error, timeout), the `loading`/`submitting` state stays `true` forever — the user sees a spinning button with no way to recover except refreshing the page.
- Fix: Wrapped each async Supabase call in `try { ... } catch { setError(t("errorGeneric")); } finally { setLoading(false); }`. The `finally` block guarantees the loading state is reset regardless of success or failure. Added null user check in LoginForm (`if (!data.user) { setError(...); return; }`).
- Status: Fixed

### F-016 — P1 — Streaks race condition and timezone bug

- File: `src/lib/streaks.ts`
- Symptom: Three issues:
  1. **Timezone bug**: `new Date().getFullYear()/getMonth()/getDate()` uses server-local time. If the server is in UTC but the user is in PST, the date could be off by a day, causing streaks to reset incorrectly.
  2. **Race condition**: Concurrent `updateStreak` calls both read the same `existing` state, both increment, and both upsert. The `if (!existing)` branch can double-insert if two concurrent calls both see `existing` as null (no `onConflict` specified).
  3. **Hardcoded return**: The function returns hardcoded `{currentStreak:1, longestStreak:1, isNewDay:true}` regardless of the actual DB result from `inserted`.
- Fix:
  1. Replaced `new Date().getFullYear()/getMonth()/getDate()` with `new Date().toISOString().slice(0, 10)` (UTC) for date strings.
  2. Added `{ onConflict: "user_id" }` to both upserts to prevent duplicate rows on race.
  3. Used actual `inserted` data for return value.
  4. Added `selectError` check to distinguish PGRST116 (no rows) from real errors.
  5. Added `upsertError`/`updateError` checks and throw on failure.
- Status: Fixed

### F-017 — P2 — Auth callback/confirm routes don't log returned errors

- Files: `src/app/[locale]/auth/callback/route.ts`, `src/app/[locale]/auth/confirm/route.ts`
- Symptom: Both routes call `supabase.auth.exchangeCodeForSession(code)` which returns `{ error }`. If `error` is non-null, the route falls through to the `auth_failed` redirect without logging the error. This makes it impossible to debug OAuth/code exchange failures from server logs.
- Fix: Added `reportServerError(error, { route: "auth/callback", phase: "exchange" })` (and same for confirm) when the returned `error` is non-null.
- Status: Fixed

### F-018 — P2 — sanitizeRedirectPath doesn't reject CRLF injection

- File: `src/lib/auth/sanitizeRedirect.ts`
- Symptom: `sanitizeRedirectPath` checks `startsWith("/")` and rejects `//` and `/\`, but doesn't check for CRLF characters (`\r`, `\n`) or their encoded forms (`%0d`, `%0a`). A path like `/\r\nSet-Cookie: evil=1` would pass validation and could be used for header injection if the redirect URL is used in a `Location` header.
- Fix: Added check: `if (/[\r\n]/.test(path) || /%0d|%0a/i.test(path)) return fallback;` to reject paths containing CRLF characters or their encoded forms.
- Status: Fixed

### F-019 — P2 — Dashboard progress page doesn't validate page/pageSize

- File: `src/lib/dashboard/progress.ts:80`
- Symptom: `getCompletedLessonsPaginated` computes `from = (page - 1) * pageSize` and passes it to `.range(from, to)`. If `page <= 0` or `pageSize <= 0`, `from` becomes negative, which causes a Supabase query error. The function doesn't clamp `page` or `pageSize` to valid ranges.
- Fix: Added clamping: `const safePage = Math.max(1, page); const safePageSize = Math.max(1, pageSize);` and used `safePage`/`safePageSize` in the calculation.
- Status: Fixed

### F-020 — P2 — Notifications insert errors not checked

- File: `src/lib/notifications.ts`
- Symptom: `createNotifications` and `createNotification` call `supabase.from("notifications").insert(records)` but don't destructure or check the `error` from the insert result. If the insert fails (RLS violation, constraint failure), the error is silently swallowed and the function returns as if successful.
- Fix: Destructured `error` from both insert results and added `if (error) throw error;` to propagate failures to callers.
- Status: Fixed

### F-021 — P2 — Guest progress storage failures silently swallowed

- File: `src/lib/guestProgress.ts`
- Symptom: `getItem` and `setItem` have `catch` blocks that silently swallow all errors (e.g., `QuotaExceededError`, `SecurityError` on sessionStorage access). If sessionStorage is full or blocked, guest progress writes silently fail with no signal to the user or developer.
- Fix: Added `logger.warn(...)` calls in both catch blocks to log storage failures for debugging.
- Status: Fixed

### F-022 — P2 — requireAuth doesn't sanitize redirectTo

- File: `src/lib/auth/requireAuth.ts`
- Symptom: `requireAuth` passes `redirectTo` directly to `encodeURIComponent` without sanitizing it through `sanitizeRedirectPath`. If a caller passes user input as `redirectTo`, it could be an open redirect vector. Today all callers pass hardcoded strings like `/dashboard`, but the API is fragile.
- Fix: Added `sanitizeRedirectPath(redirectTo)` call before encoding. Preserved original behavior of only adding `redirect` param when `redirectTo` is provided.
- Status: Fixed
