# Health Made Clear — Codebase Audit Report

**Date:** 2026-06-11
**Phase:** Audit & Cleanup (pre-feature development)

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

### Hardcoded `defaultValue` Fallbacks in VisitPlannerClient

| File                                                          | Line | Issue                                               |
| ------------------------------------------------------------- | ---- | --------------------------------------------------- |
| `src/app/[locale]/tools/visit-planner/VisitPlannerClient.tsx` | 219  | `defaultValue: "Your Custom Questions"`             |
| `src/app/[locale]/tools/visit-planner/VisitPlannerClient.tsx` | 226  | `defaultValue: "Type your custom question here..."` |
| `src/app/[locale]/tools/visit-planner/VisitPlannerClient.tsx` | 242  | `defaultValue: "Add"`                               |
| `src/app/[locale]/tools/visit-planner/VisitPlannerClient.tsx` | 259  | `defaultValue: "Remove"`                            |
| `src/app/[locale]/tools/visit-planner/VisitPlannerClient.tsx` | 320  | `defaultValue: "No questions selected."`            |

**Recommendation:** Remove all `defaultValue` fallbacks — the keys already exist in both locale files.

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

### Unused Translation Keys (known dead keys)

See section 5 (Dead Code).

---

## 3. Build Status

| Command                              | Status                         | Output                                          |
| ------------------------------------ | ------------------------------ | ----------------------------------------------- |
| `npm run build`                      | ✅ PASS (0 errors)             | 263 static pages generated, all routes compiled |
| `npm run lint`                       | ✅ PASS (0 warnings, 0 errors) | ESLint clean                                    |
| `npm run typecheck` (`tsc --noEmit`) | ✅ PASS (0 errors)             | TypeScript clean                                |
| `npm run dev`                        | ✅ PASS                        | Starts clean in 1852ms, no console errors       |

**All three quality gates pass with zero errors.**

---

## 4. i18n Completeness

### Key Parity

- `src/messages/en.json` and `src/messages/es.json` have **identical key structures** across all 22 namespaces.
- Every key in English has a corresponding Spanish translation.

### Missing Translations (None)

No translation gaps found between locales.

### Hardcoded English Identified

- **`defaultValue` fallbacks** in `VisitPlannerClient.tsx` (5 locations — see section 2)
- **Root not-found/global-error** pages use manual `COPY` objects (acceptable)
- **Metadata strings** in `layout.tsx` (brand name — low priority)

### Recommendation

Remove the 5 `defaultValue` props from `VisitPlannerClient.tsx` — the keys exist in both locale files so the fallbacks never trigger and just serve as dead code / untranslated noise.

---

## 5. Dead Code

### Unused Imports / Exports

| File                             | Item                    | Line | Notes                                                           |
| -------------------------------- | ----------------------- | ---- | --------------------------------------------------------------- |
| `src/lib/progressExport.ts`      | `applyProgressImport`   | 85   | Defined but never imported anywhere                             |
| `src/hooks/useScrollSpy.ts`      | Entire hook             | 11   | Never imported; `ScrollSpyProvider` uses its own implementation |
| `src/components/PageSection.tsx` | Entire component        | 9    | Never imported by any file                                      |
| `src/lib/quizzes/quizParser.ts`  | `getAllQuizzesFromMdx`  | 99   | Legacy — superseded by bundle system                            |
| `src/lib/quizzes/quizParser.ts`  | `getQuizFromMdx`        | 118  | Legacy                                                          |
| `src/lib/quizzes/quizParser.ts`  | `assertAllQuizzesExist` | 133  | Legacy                                                          |
| `src/lib/localizedContent.ts`    | `getPathById`           | 23   | Wrapper function never called                                   |

### Unused Translation Keys (in both locale files)

| Key                     | Notes                       |
| ----------------------- | --------------------------- |
| `hero.whatYouFind`      | Not used by Hero.tsx        |
| `hero.guidedPaths`      | Not used by Hero.tsx        |
| `hero.printableTools`   | Not used by Hero.tsx        |
| `hero.glossaryDefs`     | Not used by Hero.tsx        |
| `hero.progressTracking` | Not used by Hero.tsx        |
| `sectionNav.learn`      | Not used by SectionNav.tsx  |
| `sectionNav.paths`      | Not used by SectionNav.tsx  |
| `sectionNav.tools`      | Not used by SectionNav.tsx  |
| `sectionNav.glossary`   | Not used by SectionNav.tsx  |
| `sectionNav.dashboard`  | Not used by SectionNav.tsx  |
| `about.warningTitle`    | Not used by AboutClient.tsx |
| `common.print`          | Not used by any component   |
| `common.start`          | Not used by any component   |

### Design Artifacts

`stitch_health_made_clear_ux_design/` contains Figma exports (Framer-style design screenshots). **Not needed at runtime.** Added to `.gitignore`. Recommend deleting the directory from the repo.

---

## 6. Dependency Notes

### Installed Packages

| Package                   | Version  | Purpose                 | Status             |
| ------------------------- | -------- | ----------------------- | ------------------ |
| `next`                    | 14.2.35  | Framework               | ✅ Current         |
| `next-intl`               | ^4.13.0  | i18n routing            | ✅ Current         |
| `react` / `react-dom`     | ^18.3.1  | UI library              | ✅ Current         |
| `lucide-react`            | ^0.400.0 | Icons                   | ✅ Current         |
| `gray-matter`             | ^4.0.3   | MDX frontmatter parsing | ✅ Used            |
| `markdown-it`             | ^14.2.0  | Markdown rendering      | ✅ Used            |
| `@sentry/browser`         | ^9.15.0  | Error reporting         | ✅ Used (optional) |
| `@tailwindcss/typography` | ^0.5.19  | Prose styling           | ✅ Configured      |
| `@netlify/plugin-nextjs`  | latest   | Netlify deployment      | ✅ Just installed  |

### Packages NOT Installed (verification)

| Package                 | Status                               |
| ----------------------- | ------------------------------------ |
| `@supabase/supabase-js` | ❌ Not installed (correct — Phase 2) |
| `@supabase/ssr`         | ❌ Not installed (correct — Phase 2) |

### Potentially Unused Packages

- `@swc/helpers` (0.5.23) — installed by Next.js as a transitive dep, explicitly listed in devDependencies. Keep.
- `@vitejs/plugin-react` (^4.4.1) — used by Vitest for JSX transform. Keep.
- `jsdom` (^26.1.0) — used by vitest environment. Keep.

### Outdated (none flagged as major version behind latest)

All packages appear on recent versions as of mid-2026.

---

## 7. Environment Variable Status

### Variables in `.env.example`

| Variable                 | Default                 | Used In                                                                          | Status                   |
| ------------------------ | ----------------------- | -------------------------------------------------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SITE_URL`   | `http://localhost:3000` | `src/lib/site.ts:2`, `src/app/[locale]/layout.tsx`, sitemap, robots, OG metadata | ✅ Documented            |
| `NEXT_PUBLIC_SENTRY_DSN` | (empty)                 | `src/lib/errorReporting.ts:26`                                                   | ✅ Documented (optional) |

### Variables Referenced in Code Not in `.env.example`

| Variable           | File                | Line   | Notes                               |
| ------------------ | ------------------- | ------ | ----------------------------------- |
| `NODE_ENV`         | `errorReporting.ts` | 21, 34 | Next.js built-in                    |
| `NODE_ENV`         | `preferences.ts`    | 30     | Next.js built-in                    |
| `NODE_ENV`         | `next.config.js`    | 9      | Next.js built-in                    |
| `URL`              | `next.config.js`    | 6      | Netlify-provided env var (fallback) |
| `DEPLOY_PRIME_URL` | `next.config.js`    | 6      | Netlify-provided env var (fallback) |
| `NETLIFY`          | `next.config.js`    | 5      | Netlify-provided flag               |

No env vars are missing from `.env.example` — the three extra vars (`URL`, `DEPLOY_PRIME_URL`, `NETLIFY`) are Netlify-provided and documented in `next.config.js`.

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

1. Remove `defaultValue` fallbacks in `VisitPlannerClient.tsx` (5 occurrences)
2. Delete deprecated MDX parser functions (3 in `quizParser.ts`)
3. Delete unused `PageSection` component and `useScrollSpy` hook
4. Remove dead translation keys from both locale files
5. Delete `stitch_health_made_clear_ux_design/` from repo (already gitignored)
6. Address 5 `@ts-ignore` in `errorReporting.test.ts` (low priority — test code)
