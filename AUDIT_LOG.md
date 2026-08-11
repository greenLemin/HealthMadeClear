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
