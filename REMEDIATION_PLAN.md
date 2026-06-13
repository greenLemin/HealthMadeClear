# HealthMadeClear — Remediation Plan

**Date:** 2026-06-13  
**Status:** Waves 0–2 implemented on `production-readiness` branch

## Executive Summary

| Severity | Total | Wave 0 | Wave 1 | Wave 2 | Deferred (Wave 3) |
| -------- | ----- | ------ | ------ | ------ | ----------------- |
| CRITICAL | 6     | 6      | 0      | 0      | 0                 |
| HIGH     | 18    | 5      | 8      | 3      | 2                 |
| MEDIUM   | 32    | 2      | 8      | 6      | 16                |
| LOW      | 24    | 0      | 2      | 3      | 19                |

**Top 5 blockers (all resolved):**

1. Mock Supabase client in production → fail-closed env gating
2. Missing `delete_user` RPC → migration 009
3. Open redirect in auth routes → `sanitizeRedirectPath`
4. Dashboard settings i18n missing → wired translations
5. Guest progress data loss on migration failure → conditional clear

---

## Wave 0 — Blockers ✅

| Task | Files                                                          | Change                           | Size | Status |
| ---- | -------------------------------------------------------------- | -------------------------------- | ---- | ------ |
| W0-1 | `src/lib/supabase/env.ts`, `client.ts`, `server.ts`            | Mock client dev-only             | M    | ✅     |
| W0-2 | `scripts/check-production-env.mjs`, `.github/workflows/ci.yml` | Validate Supabase env on CI      | S    | ✅     |
| W0-3 | `src/lib/auth/sanitizeRedirect.ts`, auth routes                | Fix open redirect                | S    | ✅     |
| W0-4 | `supabase/migrations/009_delete_user.sql`                      | Account deletion RPC             | S    | ✅     |
| W0-5 | `next.config.mjs`                                              | CSP Supabase domains             | S    | ✅     |
| W0-6 | `src/lib/supabase/middleware.ts`                               | Dashboard auth guard             | M    | ✅     |
| W0-7 | `dashboard/layout.tsx`                                         | Remove duplicate `#main-content` | S    | ✅     |

---

## Wave 1 — Core Quality ✅

| Task  | Files                                         | Change                             | Size | Status |
| ----- | --------------------------------------------- | ---------------------------------- | ---- | ------ |
| W1-1  | `src/lib/guestProgress.ts`, `useProgress.ts`  | Safe migration + result gating     | M    | ✅     |
| W1-2  | `src/lib/dashboard.ts`                        | Error logging on all queries       | M    | ✅     |
| W1-3  | `supabase/migrations/010_*.sql`, `011_*.sql`  | updated_at triggers + indexes      | S    | ✅     |
| W1-4  | `settings-client.tsx`                         | Full i18n + theme via AppProviders | M    | ✅     |
| W1-5  | `DashboardSidebar.tsx`, `DashboardClient.tsx` | Dashboard i18n                     | M    | ✅     |
| W1-6  | `achievements.ts`, `messages/*.json`          | Localized achievement labels       | M    | ✅     |
| W1-7  | `lib/i18n.ts`                                 | Locale-aware relative dates        | S    | ✅     |
| W1-8  | `api/contact/route.ts`                        | Honeypot + env validation          | S    | ✅     |
| W1-9  | `auth/callback`, `auth/confirm`               | try/catch on code exchange         | S    | ✅     |
| W1-10 | `getCompletedLessonsPaginated`                | Scoped quiz query                  | S    | ✅     |

**Tests added:**

- `src/lib/auth/sanitizeRedirect.test.ts`
- `src/lib/guestProgress.test.ts`
- `src/app/api/contact/route.test.ts`

---

## Wave 2 — Polish & SEO ✅ (partial)

| Task  | Files                                      | Change                             | Size | Status      |
| ----- | ------------------------------------------ | ---------------------------------- | ---- | ----------- |
| W2-1  | `src/app/sitemap.ts`                       | Learning path URLs                 | S    | ✅          |
| W2-2  | `progress/page.tsx`, `progress-client.tsx` | Pagination + i18n                  | M    | ✅          |
| W2-3  | `achievements-client.tsx`                  | i18n headers                       | S    | ✅          |
| W2-4  | `.github/workflows/ci.yml`                 | Blocking audit, Node 20            | S    | ✅          |
| W2-5  | `npm audit fix`                            | esbuild high vuln                  | S    | ✅          |
| W2-6  | Learning path OG metadata                  | `learning-paths/[pathId]/page.tsx` | M    | ⏳ Deferred |
| W2-7  | Auth signup/forgot noindex metadata        | auth page wrappers                 | S    | ⏳ Deferred |
| W2-8  | `LearnClient.tsx` hardcoded strings        | i18n keys                          | S    | ⏳ Deferred |
| W2-9  | `NotificationCenter.tsx` i18n              | notifications namespace            | M    | ⏳ Deferred |
| W2-10 | `SearchDialog` dynamic import              | Header bundle split                | S    | ⏳ Deferred |

---

## Wave 3 — Post-Launch (deferred)

| Task                                     | Complexity | Notes                       |
| ---------------------------------------- | ---------- | --------------------------- |
| Auth E2E with Supabase test project      | L          | Needs GitHub secrets        |
| E2E against production build             | M          | `PLAYWRIGHT_PROD=1` CI job  |
| Raise coverage threshold to 60%          | L          | Requires more unit tests    |
| Dashboard query deduplication            | M          | Single `getDashboardData()` |
| Contact form rate limiting               | M          | Edge function or Upstash    |
| Canonical URL unification (.com vs .org) | S          | Netlify env + JsonLd        |
| Visual regression in CI                  | M          | Linux snapshot baseline     |
| Mobile Playwright project                | S          | Responsive regression       |

---

## Deployment checklist

- [x] `npm run build` (with CI env vars)
- [x] `npm run lint` (0 errors)
- [x] `tsc --noEmit`
- [x] Vitest 89/89
- [x] Playwright 18/18
- [x] RLS on all Supabase tables
- [x] Medical disclaimer visible
- [x] Privacy + Terms pages linked
- [ ] Set real `NEXT_PUBLIC_SUPABASE_*` in Netlify dashboard
- [ ] Run `supabase db push` for migrations 009–011
- [ ] Confirm canonical domain in production
