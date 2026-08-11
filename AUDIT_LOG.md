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
