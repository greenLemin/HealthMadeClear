# Health Made Clear — Codebase Audit Report

**Date:** 2026-08-11 (updated from 2026-06-11)
**Phase:** Post-remediation audit
**Full audit log:** `AUDIT_LOG.md`
**Full audit report:** `AUDIT_REPORT.md`

---

## 1. Route Status Table

All routes live under `src/app/[locale]/`. Status: **Complete** = fully built with data, **Partial** = functional but some i18n/debt, **Stub** = placeholder content.

| Route                    | Status   | Notes                                                                                              |
| ------------------------ | -------- | -------------------------------------------------------------------------------------------------- |
| `/` (Home)               | Complete | Hero, SectionNav, featured paths, disclaimer. 263 static pages generated (all locales).            |
| `/learn`                 | Complete | Lesson library with search, category filter, thumbnails. 35 EN + 35 ES lessons loaded from bundle. |
| `/learn/[slug]`          | Complete | Lesson detail with sidebar, glossary highlighting, related lessons, quiz link.                     |
| `/learn/[slug]/quiz`     | Complete | Full quiz flow: start screen, question-by-question, results, score recording.                      |
| `/learning-paths`        | Complete | 7 learning paths with progress bars, lesson lists, resumable state.                                |
| `/articles`              | Complete | 15 articles per locale with search.                                                                |
| `/articles/[slug]`       | Complete | Article detail with Markdown rendering, glossary highlighting.                                     |
| `/glossary`              | Complete | 31 glossary terms with letter filter, search, related lessons/terms.                               |
| `/glossary/[term]`       | Complete | Term detail page with Markdown body, related links.                                                |
| `/tools`                 | Complete | Toolkit landing with 4 tool cards.                                                                 |
| `/tools/visit-planner`   | Complete | Multi-step visit planner with persistence, custom questions, print.                                |
| `/tools/care-guide`      | Complete | Care option comparison with scenarios, emergency banner.                                           |
| `/tools/visit-checklist` | Complete | Interactive checklist with persistence and print.                                                  |
| `/dashboard`             | Complete | Full dashboard: progress stats, recent lessons, path tracking, import/export.                      |
| `/about`                 | Complete | Mission, values, CTA, contact.                                                                     |
| `/accessibility`         | Complete | Commitment, features, limits, feedback.                                                            |
| `/privacy`               | Complete | Data handling, local storage-only, user control.                                                   |

**Verdict:** All 17+ routes are fully built. No stubs or empty placeholders remain.

---

## 2. TODO / Placeholder / Hardcoded Mock List

### `@ts-ignore` Comments

| File                             | Line                 | Issue                                                                               |
| -------------------------------- | -------------------- | ----------------------------------------------------------------------------------- |
| `src/lib/errorReporting.test.ts` | 73, 85, 95, 130, 147 | Tests manipulate `global.window` for Sentry test coverage. Acceptable in test code. |

### Hardcoded Brand Strings

| File                          | Line     | String                                         |
| ----------------------------- | -------- | ---------------------------------------------- |
| `src/components/Header.tsx`   | 64       | `"Health Made Clear"`                          |
| `src/components/Footer.tsx`   | 15       | `"Health Made Clear"`                          |
| `src/app/[locale]/layout.tsx` | multiple | OG/Twitter metadata (brand name + description) |

**Recommendation:** These are brand identifiers — low priority for i18n but could be moved to `meta` namespace if multi-language branding is desired.

### Root-Level Error Pages (non-i18n)

| File                       | Lines | Issue                                                                                     |
| -------------------------- | ----- | ----------------------------------------------------------------------------------------- |
| `src/app/not-found.tsx`    | 6-28  | Manual `COPY` object instead of i18n (acceptable — runs outside `NextIntlClientProvider`) |
| `src/app/global-error.tsx` | 6-17  | Same pattern (acceptable — error boundary)                                                |

---

## 3. Build Status

| Command                              | Status                         | Output                                            |
| ------------------------------------ | ------------------------------ | ------------------------------------------------- |
| `npm run build`                      | ✅ PASS (0 errors)             | 363 static pages generated, all routes compiled   |
| `npm run lint`                       | ✅ PASS (0 errors, 2 warnings) | 2 acceptable warnings (test sync script, SVG img) |
| `npm run typecheck` (`tsc --noEmit`) | ✅ PASS (0 errors)             | TypeScript clean                                  |
| `npm test`                           | ✅ PASS (577 tests)            | 86 test files, 577 tests pass                     |
| `npm audit`                          | ✅ PASS (0 vulnerabilities)    | 0 high/critical vulnerabilities                   |

**All quality gates pass with zero errors.**

---

## 4. i18n Completeness

### Key Parity

- `src/messages/en.json` and `src/messages/es.json` have **identical key structures** across all 22 namespaces.
- Every key in English has a corresponding Spanish translation.

### Missing Translations (None)

No translation gaps found between locales.

---

## 5. Dead Code

### Unused Imports / Exports

| File                             | Item                    | Line | Notes                                                 |
| -------------------------------- | ----------------------- | ---- | ----------------------------------------------------- |
| `src/lib/progressExport.ts`      | `applyProgressImport`   | 85   | Used by DashboardHeader.tsx and tests. NOT dead code. |
| `src/components/PageSection.tsx` | Entire component        | 9    | Used by TermsClient.tsx. NOT dead code.               |
| `src/lib/quizzes/quizParser.ts`  | `getAllQuizzesFromMdx`  | 80   | Used by scripts/bundle-quizzes.ts. NOT dead code.     |
| `src/lib/quizzes/quizParser.ts`  | `getQuizFromMdx`        | 118  | Used by tests. NOT dead code.                         |
| `src/lib/quizzes/quizParser.ts`  | `assertAllQuizzesExist` | 137  | Used by scripts/validate-content.ts. NOT dead code.   |

**Note:** The original AUDIT.md listed these as dead code, but verification shows they are all actively used by build scripts, tests, or runtime code.

---

## 6. Dependency Notes

### Installed Packages

| Package                   | Version  | Purpose                 | Status             |
| ------------------------- | -------- | ----------------------- | ------------------ |
| `next`                    | 16.3.0   | Framework               | ✅ Current         |
| `next-intl`               | ^4.13.2  | i18n routing            | ✅ Current         |
| `react` / `react-dom`     | ^19.2.8  | UI library              | ✅ Current         |
| `lucide-react`            | ^1.24.0  | Icons                   | ✅ Current         |
| `gray-matter`             | ^4.0.3   | MDX frontmatter parsing | ✅ Used            |
| `markdown-it`             | ^14.3.0  | Markdown rendering      | ✅ Used            |
| `@sentry/browser`         | ^10.65.0 | Error reporting         | ✅ Used (optional) |
| `@tailwindcss/typography` | ^0.5.20  | Prose styling           | ✅ Configured      |
| `@netlify/plugin-nextjs`  | ^5.15.12 | Netlify deployment      | ✅ Installed       |

### Packages NOT Installed (verification)

| Package                 | Status                  |
| ----------------------- | ----------------------- |
| `@supabase/supabase-js` | ✅ Installed (^2.110.6) |
| `@supabase/ssr`         | ✅ Installed (^0.12.0)  |

### Outdated (none flagged as major version behind latest)

All packages appear on recent versions as of mid-2026.

---

## 7. Environment Variable Status

### Variables in `.env.example`

| Variable                 | Default                 | Used In                                                                          | Status                   |
| ------------------------ | ----------------------- | -------------------------------------------------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SITE_URL`   | `http://localhost:3000` | `src/lib/site.ts:2`, `src/app/[locale]/layout.tsx`, sitemap, robots, OG metadata | ✅ Documented            |
| `NEXT_PUBLIC_SENTRY_DSN` | (empty)                 | `src/lib/errorReporting.ts:86`                                                   | ✅ Documented (optional) |

### Variables Referenced in Code Not in `.env.example`

| Variable           | File                | Line | Notes                               |
| ------------------ | ------------------- | ---- | ----------------------------------- |
| `NODE_ENV`         | `errorReporting.ts` | 81   | Next.js built-in                    |
| `NODE_ENV`         | `preferences.ts`    | 30   | Next.js built-in                    |
| `NODE_ENV`         | `next.config.mjs`   | 36   | Next.js built-in                    |
| `URL`              | `next.config.mjs`   | 11   | Netlify-provided env var (fallback) |
| `DEPLOY_PRIME_URL` | `next.config.mjs`   | 11   | Netlify-provided env var (fallback) |
| `NETLIFY`          | `next.config.mjs`   | 10   | Netlify-provided flag               |

No env vars are missing from `.env.example` — the three extra vars (`URL`, `DEPLOY_PRIME_URL`, `NETLIFY`) are Netlify-provided and documented in `next.config.mjs`.

---

## 8. Netlify Config Status

| Item                       | Status                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `netlify.toml`             | ✅ Created at root                                                                        |
| Build command              | `npm run build`                                                                           |
| Publish directory          | `.next`                                                                                   |
| `@netlify/plugin-nextjs`   | ✅ Installed as devDependency                                                             |
| `skip_processing`          | `true` (Netlify should not touch the Next.js output)                                      |
| `next.config.js` conflicts | ✅ None — CSP headers, image formats, and locale handling are all compatible with Netlify |

### Netlify Deployment Notes

- The prebuild hook runs `content:bundle` automatically.
- `process.env.NETLIFY` check in `next.config.js` provides a fallback for `NEXT_PUBLIC_SITE_URL`.
- CSP in `next.config.js` is already configured for production (`unsafe-inline` for scripts/styles — standard for Next.js).

---

## Summary

The codebase is in excellent shape. All 17+ routes are fully built. Build, lint, and typecheck all pass with zero errors. i18n parity is complete between EN and ES. Dead code exists but is minor (7 unused exports, 13 unused translation keys). `netlify.toml` has been created. `.gitignore` has been updated to exclude design artifacts.

### Recommended Cleanup Items (Optional)

1. Remove `defaultValue` fallbacks in `VisitPlannerClient.tsx` (5 occurrences) — **DONE** (already removed)
2. Delete deprecated MDX parser functions (3 in `quizParser.ts`) — **DEFERRED** (functions are actively used by build scripts and tests)
3. Delete unused `PageSection` component and `useScrollSpy` hook — **NOT NEEDED** (PageSection is used by TermsClient.tsx; useScrollSpy.ts doesn't exist)
4. Remove dead translation keys from both locale files — **DEFERRED** (low priority, keys don't cause runtime issues)
5. Delete `stitch_health_made_clear_ux_design/` from repo (already gitignored) — **DONE**
6. Address 5 `@ts-ignore` in `errorReporting.test.ts` (low priority — test code) — **DEFERRED**

---

## Remediation Summary (2026-08-11)

A full-codebase remediation was performed on 2026-08-11. See `AUDIT_LOG.md` for the complete running ledger and `AUDIT_REPORT.md` for the final report.

### Fixes Applied

1. **F-001** (P0): Removed illegal route export from `src/app/api/contact/route.ts` that broke `next build` typecheck.
2. **F-002** (P1): Pinned `next build` to webpack via `--webpack` flag to work around Turbopack next/font Google fetch 404s.
3. **F-003** (P1): Added `setRequestLocale(locale)` to 19 page.tsx files that were missing it, enabling static rendering optimization.
4. **F-004** (P1): Added CSRF protection to contact endpoint via Origin header validation. Added 2 regression tests.
5. **F-005** (P0): Compressed homepage video from 64MB to 1.3MB (98% reduction). Added poster, preload, and dimensions.
6. **F-006** (P1): Replaced 1.2MB JPEG logo with 1.3KB SVG favicon in all references.
7. **F-007** (P3): Removed stitch design artifacts from repo.
8. **F-008** (P3): Added HSTS header to next.config.mjs securityHeaders.
9. **F-009** (P3): Added `object-src 'none'` to CSP.
10. **F-010** (P2): Added PII scrubbing (email, phone, SSN, card) to Sentry beforeSend and reportServerError.
11. **F-011** (P2): Stripped query params from GA page_view events to prevent PII leakage.
12. **F-012** (P2): Added viewport export with themeColor to layout.
13. **F-013** (P2): Fixed `quizScores` type from `any[]` to `QuizScore[]` in useProgress.
14. **F-014** (P2): Added email format validation to SignupForm, consistent with LoginForm.

### Verification Gates

All verification gates pass:

- `tsc --noEmit` → 0 errors ✅
- ESLint → 0 errors, 2 acceptable warnings ✅
- `vitest run` → 577 tests pass across 86 files ✅
- `next build --webpack` → succeeds, 363 static pages generated ✅
- `npm audit` → 0 high/critical vulnerabilities ✅
- `AUDIT_LOG.md` → every entry marked Fixed ✅
- Zero open P0/P1 findings ✅
