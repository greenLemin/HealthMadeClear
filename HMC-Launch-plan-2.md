# HealthMadeClear — Production Launch Plan v2

**Generated:** 2026-07-03  
**Codebase SHA:** `419e57b5eb24c04c8f1426192afba305e2de0026`  
**Based on:** PRODUCTION_AUDIT.md (2026-06-13) + fresh full audit (Phases A–J)  
**Production URL:** `https://healthmadeclear.netlify.app` (Netlify deploy; custom domain TBD)

**Verification gate results (2026-07-03):**

| Check                                 | Result                                |
| ------------------------------------- | ------------------------------------- |
| `npm run lint`                        | Pass (0 errors)                       |
| `npm run typecheck`                   | Pass                                  |
| `npm run build` (CI env placeholders) | Pass                                  |
| `npm test`                            | 281/281 pass (57 files)               |
| `npm run test:coverage`               | 76.13% lines (threshold 35%)          |
| `npm run test:e2e`                    | 49 pass, 2 skipped (visual)           |
| GitHub CI (main)                      | Pass — run `28680355554` (2026-07-03) |

---

## Executive Summary

HealthMadeClear is **near production-ready** for a public-interest health literacy launch on Netlify. The June 2026 production audit closed all six CRITICAL security findings (mock client gating, open redirects, dashboard middleware guard, `delete_user` migration, contact honeypot, duplicate `#main-content`). A fresh July audit confirms those fixes in code and adds 192 new unit tests (89 → 281) with line coverage rising from ~35% gate to **76%** on scoped `lib/` + `hooks/`.

Remaining launch work is **operational consistency and polish**, not fundamental architecture. Three items block a confident public launch: (1) canonical URL must be `https://healthmadeclear.netlify.app` everywhere — CI still uses `.org`, docs/JsonLd use `.com`; (2) accessibility violation A11Y-02 — `Reveal` `div onClick` wraps lesson `Link` cards; (3) production Supabase env vars and all 11 migrations must be verified applied on the linked project.

Content is complete: **157 MDX files per locale** with identical slugs (52 lessons, 7 paths, 52 quizzes, 15 articles, 31 glossary). i18n message catalogs have **739/739 key parity**. No paywall, guest progress works, RLS enabled on all eight tables.

**Estimated pre-launch effort:** 16–24 hours (1 developer) for Phase 1 blockers + checklist; Phase 2 polish adds 20–30 hours optional before launch. **Confidence:** High for soft launch on Netlify URL; Medium until custom domain, auth E2E against real Supabase, and clinical content review are complete.

---

## Launch Readiness Scorecard

| Category          | Current Grade | Target | Launch Blocker?                  |
| ----------------- | ------------- | ------ | -------------------------------- |
| Security          | A-            | A      | No                               |
| Authentication    | B+            | A      | No                               |
| Database / RLS    | A-            | A      | No (verify migrations applied)   |
| Error Handling    | B+            | B+     | No                               |
| Performance       | B             | B+     | No                               |
| Accessibility     | B+            | A      | **Yes** (A11Y-02)                |
| i18n Completeness | A-            | A      | No                               |
| Test Coverage     | B             | B      | No                               |
| SEO               | B             | A      | No (after DEPLOY-01)             |
| CI/CD Pipeline    | A-            | A      | No                               |
| Content Quality   | A             | A      | No (clinical review recommended) |
| UI/UX Design      | B+            | A      | No                               |
| Monitoring        | B-            | B      | No                               |
| Deployment Config | B             | A      | **Yes** (DEPLOY-01, ENV-01)      |

---

## Critical Blockers (Must Fix Before Launch)

### DEPLOY-01 Canonical URL inconsistency

- **Severity:** CRITICAL
- **File(s):** `.github/workflows/ci.yml:13`, `.env.example:9`, `src/app/[locale]/learn/[slug]/page.tsx:87`, `docs/DEPLOYMENT.md:17`, `src/messages/en.json:328`, `src/messages/es.json:328`
- **Issue:** Production deploys to `healthmadeclear.netlify.app` but CI sets `NEXT_PUBLIC_SITE_URL=https://healthmadeclear.org`, docs/JsonLd hardcode `.com`, and email addresses mix `.com`/`.org`. Sitemap, OG tags, canonical links, and structured data will disagree.
- **Evidence:** User confirmed Netlify URL. CI env at `.github/workflows/ci.yml:13`. JsonLd publisher at `learn/[slug]/page.tsx:87` hardcodes `https://healthmadeclear.com`. `getSiteUrl()` in `src/lib/site.ts:1-3` reads env correctly but is bypassed in JsonLd.
- **Fix:**
  1. Set `NEXT_PUBLIC_SITE_URL=https://healthmadeclear.netlify.app` in Netlify production env dashboard.
  2. Update CI to same URL (or use Netlify preview URL pattern for PR builds).
  3. Replace hardcoded `.com`/`.org` URLs with `getSiteUrl()` in JsonLd, metadata fallbacks, and docs.
  4. Update `.env.example` comment to reference Netlify URL.
  5. Rebuild and verify `sitemap.xml` and `robots.txt` use Netlify domain.
- **Estimated effort:** 2 hours
- **Tests needed:** Update `site.test.ts`, `metadata.test.ts`; add assertion that JsonLd publisher uses `getSiteUrl()`

### A11Y-02 Nested interactive elements on lesson cards

- **Severity:** CRITICAL (accessibility)
- **File(s):** `src/app/[locale]/learn/LearnClient.tsx:157-159,180-186,195-201`, `src/components/ui/Reveal.tsx:37-41`, `src/components/ui/ResourceCard.tsx:17`
- **Issue:** `Reveal` renders a `div` with `onClick={() => markLessonViewed(lesson.id)}` wrapping `LessonCard` which contains a `<Link>`. Screen readers and keyboard users get nested/interrupted focus targets; violates WCAG 2.2 operable guidelines.
- **Evidence:**

```157:159:src/app/[locale]/learn/LearnClient.tsx
                <Reveal key={lesson.id} delay={index * 0.05} onClick={() => markLessonViewed(lesson.id)}>
                  <LessonCard lesson={lesson} isComplete={completedLessons.has(lesson.id)} />
                </Reveal>
```

```37:41:src/components/ui/Reveal.tsx
    return (
      <div className={className} id={id} style={style} onClick={onClick}>
        {children}
      </div>
```

- **Fix:**
  1. Remove `onClick` from `Reveal` wrappers on linked cards.
  2. Call `markLessonViewed` from `LessonCard`/`ResourceCard` via `Link` `onClick` or a `useEffect` on lesson page mount.
  3. Keep `Reveal` for animation only (no click handler when child is interactive).
  4. Run axe/WAVE on `/en/learn` — zero critical violations.
- **Estimated effort:** 3 hours
- **Tests needed:** E2E: lesson card keyboard navigation; optional unit test that LearnClient does not pass onClick to Reveal around links

### ENV-01 Production Supabase configuration

- **Severity:** CRITICAL (operational)
- **File(s):** `scripts/check-production-env.mjs`, Netlify dashboard, `supabase/migrations/001-011`
- **Issue:** Auth, progress sync, contact form, and account deletion require real Supabase project with env vars set in Netlify. Migrations must be applied remotely — not verifiable from repo alone.
- **Evidence:** `check-production-env.mjs:17-34` fails build without `NEXT_PUBLIC_SUPABASE_URL` + anon key on CI/Netlify. Settings delete calls `supabase.rpc("delete_user")` defined in `009_delete_user.sql`.
- **Fix:**
  1. Create/link Supabase project; set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Netlify.
  2. Run `supabase db push` or apply migrations 001–011 in order via dashboard.
  3. Verify RLS policies per table in Supabase dashboard.
  4. Smoke test: sign up → verify email → dashboard → delete account.
- **Estimated effort:** 4 hours
- **Tests needed:** Manual smoke; post-launch auth E2E with test project (T-02)

---

## Phase 1: Pre-Launch Critical Fixes

### Security & Auth

| ID        | File(s)                                               | Issue                                   | Fix                                                                                | Effort | Tests                |
| --------- | ----------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------- | ------ | -------------------- |
| DEPLOY-01 | See Critical Blockers                                 | URL split                               | Unify to Netlify URL via env                                                       | 2h     | site.test.ts         |
| ENV-01    | See Critical Blockers                                 | Supabase not verified                   | Apply migrations + env                                                             | 4h     | Manual smoke         |
| AUTH-01   | `AuthProvider.tsx:33`                                 | `getSession()` not `getUser()`          | Replace initial hydration with `getUser()`; keep `onAuthStateChange`               | 1h     | useAuth.test.tsx     |
| SEC-08    | `api/contact/route.ts`, `008_contact_submissions.sql` | Open anon INSERT; no rate limit on auth | Contact has IP rate limit; document auth brute-force as Supabase dashboard setting | 1h     | Existing route tests |

### Accessibility

| ID      | File(s)                         | Issue                                                 | Fix                                                                 | Effort | Tests             |
| ------- | ------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- | ------ | ----------------- |
| A11Y-02 | `LearnClient.tsx`, `Reveal.tsx` | div onClick wraps Link                                | See Critical Blockers                                               | 3h     | axe + E2E         |
| A11Y-03 | `Input.tsx:27-28`               | Default `"Show password"` / `"Hide password"` English | Require i18n props from auth forms or use `useTranslations` wrapper | 1h     | Input usage audit |

### SEO & Metadata

| ID      | File(s)                                                                                                                                       | Issue                                      | Fix                                                      | Effort | Tests             |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------- | ------ | ----------------- |
| SEO-04  | `learn/[slug]/page.tsx:87`                                                                                                                    | Hardcoded publisher `.com`                 | `url: getSiteUrl()`                                      | 0.5h   | JsonLd.test.ts    |
| SEO-02  | `learning-paths/page.tsx:16-20`                                                                                                               | Index page missing OG/Twitter              | Add `openGraph` + `twitter` matching detail page pattern | 1h     | Metadata snapshot |
| I18N-07 | `learn/[slug]/page.tsx`, `quiz/page.tsx:21`, `glossary/[term]/page.tsx:19`, `articles/[slug]/page.tsx:20`, `learning-paths/[pathId]/page.tsx` | English-only `"not found"` metadata titles | Add `errors.notFound*` keys to both locales              | 2h     | i18n parity       |

### Database

| ID    | File(s)                     | Issue                                                           | Fix                                                  | Effort | Tests         |
| ----- | --------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- | ------ | ------------- |
| DB-06 | `011_indexes.sql` (missing) | No index on `lesson_progress(user_id, completed, completed_at)` | Add migration `012_lesson_progress_activity_idx.sql` | 1h     | Query explain |
| DB-07 | `007_notifications.sql`     | No `(user_id, created_at DESC)` index                           | Add composite index for notification list            | 1h     | Query explain |

### Testing gaps (high-risk paths)

| ID   | File(s)                                           | Issue           | Fix                                          | Effort | Tests            |
| ---- | ------------------------------------------------- | --------------- | -------------------------------------------- | ------ | ---------------- |
| T-05 | `auth/callback/route.ts`, `auth/confirm/route.ts` | Zero unit tests | Add route handler tests with mocked Supabase | 3h     | New test files   |
| T-06 | `lib/dashboard/progress.ts`                       | 0% coverage     | Port test patterns from `activity.test.ts`   | 2h     | progress.test.ts |

---

## Phase 2: Pre-Launch High-Quality Polish

### Performance

| ID      | File(s)                                          | Issue                                  | Fix                                                                    | Effort |
| ------- | ------------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------- | ------ |
| PERF-02 | `dashboard/page.tsx:34-40`, `lib/dashboard/*.ts` | 4× parallel `lesson_progress` queries  | Shared `fetchLessonProgress(userId)` passed to helpers                 | 4h     |
| PERF-03 | `Header.tsx:22`                                  | `SearchDialog` static import           | `dynamic(() => import(...), { ssr: false })` like `NotificationCenter` | 1h     |
| PERF-04 | `layout.tsx`                                     | Redundant font preconnect              | Remove duplicate preconnect if `@next/font` handles it                 | 0.5h   |
| HYDR-01 | `SearchDialog.tsx:228`, E2E stderr               | Hydration mismatch on `<kbd>` shortcut | Render shortcut client-only or match SSR markup                        | 2h     |

### i18n & Copy

| ID      | File(s)                   | Issue                                             | Fix                                                                                      | Effort |
| ------- | ------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------ |
| I18N-08 | `es.json` tools section   | Formal _usted_ mixed with informal _tú_ elsewhere | Rewrite `tools.emergencyShort`, `tools.careOptionsHeading`, `tools.whenInDoubt*` to _tú_ | 2h     |
| I18N-09 | `contact.subjectGeneral`  | Identical EN=ES `"General"`                       | Translate to `"General"` / `"Asunto general"` in ES                                      | 0.25h  |
| I18N-10 | `OnboardingDialog.tsx:55` | Hardcoded `"Health Made Clear"` heading           | Use brand key or `t("welcomeTitle")`                                                     | 0.5h   |
| I18N-03 | `progress-client.tsx`     | Partially wired (audit)                           | **Verified fixed** — all UI uses `useTranslations("progress")`                           | 0h     |

### Design System Alignment

| ID    | File(s)                                              | Issue                                    | Fix                                                                      | Effort |
| ----- | ---------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------ | ------ |
| DS-01 | `globals.css:33,38`                                  | Primary `#0f5c63` vs DESIGN.md `#004349` | Align CSS vars to DESIGN.md or update DESIGN.md to match shipped palette | 3h     |
| DS-02 | `globals.css:170,178`                                | Body 16px/17px vs DESIGN.md 18px minimum | Set body to 18px at md+; audit mobile readability                        | 2h     |
| DS-03 | `tailwind.config.ts:89` vs `dashboard/layout.tsx:32` | Container 1280px vs hardcoded 1100px     | Use `max-w-container` token everywhere                                   | 1h     |
| DS-04 | `QuizClient.tsx:35`                                  | Hardcoded teal hex scale                 | Map to `--color-secondary` / Tailwind tokens                             | 1h     |
| DS-05 | `buttonStyles.ts:11`, `Header.tsx:224-229`           | Auth header buttons 44px not 56px        | Use `size="md"` or document exception for compact header                 | 1h     |

### Error UX

| ID     | File(s)                  | Issue                    | Fix                                                     | Effort |
| ------ | ------------------------ | ------------------------ | ------------------------------------------------------- | ------ |
| ERR-04 | `global-error.tsx:46-48` | Retry only; no home link | Add locale-aware `<a href="/">` or `ButtonLink` to home | 1h     |

### Monitoring

| ID     | File(s)                    | Issue                             | Fix                                                                | Effort |
| ------ | -------------------------- | --------------------------------- | ------------------------------------------------------------------ | ------ |
| MON-01 | Netlify + Sentry dashboard | `NEXT_PUBLIC_SENTRY_DSN` optional | Create Sentry project; set DSN in Netlify prod                     | 1h     |
| MON-02 | `GoogleAnalytics.tsx`      | GA optional                       | Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` if analytics desired at launch | 1h     |
| MON-03 | External                   | No uptime monitoring              | Configure UptimeRobot/Better Stack on Netlify URL                  | 1h     |

---

## Phase 3: Launch Preparation Checklist

### 3.1 Environment & Infrastructure

- [ ] **`NEXT_PUBLIC_SITE_URL`** = `https://healthmadeclear.netlify.app` — Netlify → Site settings → Environment variables → Production
- [ ] **`NEXT_PUBLIC_SUPABASE_URL`** — Supabase project → Settings → API → Project URL
- [ ] **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — Supabase project → Settings → API → anon public key
- [ ] **`NEXT_PUBLIC_SENTRY_DSN`** (optional) — sentry.io → Project → Client Keys (DSN)
- [ ] **`NEXT_PUBLIC_GA_MEASUREMENT_ID`** (optional) — Google Analytics 4 → Admin → Data streams
- [ ] Update `.github/workflows/ci.yml` `NEXT_PUBLIC_SITE_URL` to match Netlify production URL
- [ ] Netlify: confirm `@netlify/plugin-nextjs` enabled (see `netlify.toml`)
- [ ] Netlify: Node 22 matches `netlify.toml` and `package.json` engines
- [ ] DNS/SSL: Netlify provides HTTPS on `*.netlify.app` automatically
- [ ] Custom domain (post-launch): add domain in Netlify → update `NEXT_PUBLIC_SITE_URL` → configure redirects

### 3.2 Database

- [ ] Apply migrations in order:
  1. `001_profiles.sql`
  2. `002_lesson_progress.sql`
  3. `003_quiz_attempts.sql`
  4. `004_achievements.sql`
  5. `005_streaks.sql`
  6. `006_daily_log.sql`
  7. `007_notifications.sql`
  8. `008_contact_submissions.sql`
  9. `009_delete_user.sql`
  10. `010_updated_at_triggers.sql`
  11. `011_indexes.sql`
- [ ] Verify RLS enabled on: `profiles`, `lesson_progress`, `quiz_attempts`, `achievements`, `streaks`, `daily_log`, `notifications`, `contact_submissions`
- [ ] Verify `delete_user()` RPC callable by authenticated users only
- [ ] Test auth flows against production Supabase project

### 3.3 Monitoring Setup

- [ ] Sentry project with `@sentry/browser` DSN in production env
- [ ] Uptime monitoring on `https://healthmadeclear.netlify.app/en`
- [ ] Error alert email/Slack from Sentry

### 3.4 Pre-Deploy Verification Gate

- [ ] `npm run build` passes with production env vars
- [ ] `npm run lint` — zero errors
- [ ] `npm run typecheck` — zero errors
- [ ] `npm test` — all 281 tests pass
- [ ] `npm run test:e2e` — 49+ pass (2 visual skipped in CI)
- [ ] Manual smoke: guest lesson flow (EN)
- [ ] Manual smoke: guest lesson flow (ES)
- [ ] Manual smoke: sign up → verify email → dashboard
- [ ] Manual smoke: complete lesson + quiz
- [ ] Manual smoke: settings → delete account
- [ ] Manual smoke: forgot password → reset → login
- [ ] WAVE/axe scan — zero critical accessibility errors
- [ ] Lighthouse run — document scores (Performance, A11y, SEO, Best Practices)

### 3.5 Content Review

- [ ] EN/ES content parity verified (157 MDX each locale)
- [ ] Medical accuracy review completed (human clinical reviewer)
- [ ] All disclaimers placed correctly (`MedicalDisclaimer` on lesson/learn pages)
- [ ] Footer links (Privacy, Terms, Accessibility) functional

---

## Phase 4: Post-Launch Roadmap (First 30 Days)

| ID       | Category    | Item                                                    | Effort |
| -------- | ----------- | ------------------------------------------------------- | ------ |
| T-02     | Testing     | Auth E2E against real Supabase test project             | 8h     |
| T-03     | Testing     | CI E2E against prod build (`PLAYWRIGHT_PROD=1`)         | 4h     |
| T-04     | Testing     | Raise coverage threshold to 50%+ lines                  | 2h     |
| PERF-02  | Performance | Dashboard query dedup (if not done pre-launch)          | 4h     |
| ANAL-01  | Analytics   | Custom GA events: lesson_complete, quiz_attempt, signup | 4h     |
| SEO-05   | SEO         | OG tags on glossary/tools/articles index pages          | 3h     |
| DS-01    | Design      | Full token alignment with DESIGN.md                     | 6h     |
| DOM-01   | Deployment  | Custom domain + www redirect strategy                   | 4h     |
| DB-06/07 | Database    | Performance indexes if dashboard load grows             | 2h     |

---

## Phase 5: Post-Launch Roadmap (30–90 Days)

- **Additional languages:** Framework ready (next-intl); content pipeline scripts exist for EN/ES expansion pattern
- **Community contributions:** MDX content-as-code workflow documented in `content/codemap.md`
- **Supabase features:** Realtime notifications, edge functions for contact email via Resend
- **Auth hardening:** MFA via Supabase; session refresh audit
- **Content expansion:** `scripts/generate-expansion-lessons*.ts` for new lesson batches
- **Achievement system:** Expand `achievements.items.*` catalog
- **Performance:** Bundle analysis (`ANALYZE=true npm run build`); image CDN for user uploads (future)

---

## Complete Issue Registry

| ID             | Category      | Severity | Phase | File(s)                                       | Issue                                | Fix Summary                         | Effort |
| -------------- | ------------- | -------- | ----- | --------------------------------------------- | ------------------------------------ | ----------------------------------- | ------ |
| DEPLOY-01      | Deployment    | CRITICAL | 1     | `.github/workflows/ci.yml`, `site.ts`, JsonLd | URL split .netlify/.org/.com         | Set env + `getSiteUrl()` everywhere | 2h     |
| ENV-01         | Deployment    | CRITICAL | 1     | Netlify, `check-production-env.mjs`           | Supabase env + migrations unverified | Configure + apply 001–011           | 4h     |
| A11Y-02        | Accessibility | CRITICAL | 1     | `LearnClient.tsx:157`, `Reveal.tsx:37`        | div onClick wraps Link               | Move handler to Link/page           | 3h     |
| AUTH-01        | Auth          | HIGH     | 1     | `AuthProvider.tsx:33`                         | getSession vs getUser                | Use getUser on init                 | 1h     |
| SEO-04         | SEO           | HIGH     | 1     | `learn/[slug]/page.tsx:87`                    | Hardcoded publisher URL              | getSiteUrl()                        | 0.5h   |
| SEO-02         | SEO           | MEDIUM   | 1     | `learning-paths/page.tsx:16`                  | Missing OG on index                  | Add openGraph/twitter               | 1h     |
| I18N-07        | i18n          | MEDIUM   | 1     | Multiple page.tsx                             | English not-found titles             | Translation keys                    | 2h     |
| DB-06          | Database      | MEDIUM   | 1     | lesson_progress                               | Missing activity index               | New migration                       | 1h     |
| DB-07          | Database      | MEDIUM   | 1     | notifications                                 | Missing created_at index             | New migration                       | 1h     |
| T-05           | Testing       | HIGH     | 1     | auth callback/confirm routes                  | Untested                             | Route unit tests                    | 3h     |
| T-06           | Testing       | HIGH     | 1     | `progress.ts`                                 | 0% coverage                          | Add tests                           | 2h     |
| SEC-08         | Security      | MEDIUM   | 2     | contact API                                   | Rate limit auth N/A here             | Supabase auth settings              | 1h     |
| A11Y-03        | Accessibility | MEDIUM   | 2     | `Input.tsx:27`                                | English password toggle defaults     | i18n props                          | 1h     |
| PERF-02        | Performance   | MEDIUM   | 2     | `dashboard/page.tsx`                          | 4× lesson_progress                   | Shared fetch                        | 4h     |
| PERF-03        | Performance   | MEDIUM   | 2     | `Header.tsx:22`                               | SearchDialog static                  | dynamic import                      | 1h     |
| PERF-04        | Performance   | LOW      | 2     | `layout.tsx`                                  | Redundant preconnect                 | Remove duplicate                    | 0.5h   |
| HYDR-01        | Performance   | MEDIUM   | 2     | `SearchDialog.tsx:228`                        | Hydration mismatch kbd               | Client-only shortcut                | 2h     |
| I18N-08        | i18n          | MEDIUM   | 2     | `es.json` tools.*                             | usted/tú inconsistency               | Rewrite copy                        | 2h     |
| I18N-09        | i18n          | LOW      | 2     | `es.json` contact.subjectGeneral              | Untranslated                         | ES translation                      | 0.25h  |
| I18N-10        | i18n          | LOW      | 2     | `OnboardingDialog.tsx:55`                     | Hardcoded brand                      | i18n key                            | 0.5h   |
| DS-01          | Design        | MEDIUM   | 2     | `globals.css:33`                              | Primary color drift                  | Align tokens                        | 3h     |
| DS-02          | Design        | MEDIUM   | 2     | `globals.css:170`                             | Body 16px not 18px                   | Update base size                    | 2h     |
| DS-03          | Design        | LOW      | 2     | `dashboard/layout.tsx:32`                     | 1100px hardcoded                     | Use container token                 | 1h     |
| DS-04          | Design        | LOW      | 2     | `QuizClient.tsx:35`                           | Hardcoded hex                        | Token colors                        | 1h     |
| DS-05          | Design        | LOW      | 2     | `Header.tsx:224`                              | 44px buttons                         | 56px or document                    | 1h     |
| ERR-04         | Error         | LOW      | 2     | `global-error.tsx:46`                         | No home link                         | Add home CTA                        | 1h     |
| MON-01         | Monitoring    | MEDIUM   | 2     | Sentry                                        | DSN not set                          | Configure                           | 1h     |
| MON-02         | Monitoring    | LOW      | 2     | GA                                            | Optional analytics                   | Set measurement ID                  | 1h     |
| MON-03         | Monitoring    | MEDIUM   | 2     | External                                      | No uptime checks                     | UptimeRobot                         | 1h     |
| T-02           | Testing       | MEDIUM   | 4     | e2e/auth                                      | No real Supabase E2E                 | Test project                        | 8h     |
| T-03           | Testing       | MEDIUM   | 4     | playwright.config                             | Dev server only                      | PLAYWRIGHT_PROD CI                  | 4h     |
| T-04           | Testing       | LOW      | 4     | vitest.config                                 | 35% threshold low                    | Raise to 50%                        | 2h     |
| SEO-05         | SEO           | LOW      | 4     | index pages                                   | Missing OG on several                | Add metadata                        | 3h     |
| ANAL-01        | Analytics     | LOW      | 4     | `analytics.ts`                                | Basic pageviews only                 | Custom events                       | 4h     |
| DOM-01         | Deployment    | MEDIUM   | 4     | Netlify                                       | Custom domain TBD                    | DNS + redirect                      | 4h     |
| CI-04          | CI/CD         | HIGH     | 1     | ci.yml                                        | .org vs .netlify.app                 | Update CI env                       | 0.5h   |
| CONTENT-01     | Content       | MEDIUM   | 3     | All MDX                                       | Clinical accuracy                    | Human review                        | 8h+    |
| ENV-02         | Deployment    | LOW      | 2     | `.env.example`                                | Dead vars documented                 | Remove or implement Resend          | 1h     |
| DB-05          | Database      | LOW      | 4     | `useProgress.ts:202`                          | JSON.stringify jsonb                 | Verify runtime                      | 1h     |
| AUTH-02        | Auth          | —        | Fixed | `ForgotPasswordForm.tsx:52`                   | Locale in redirectTo                 | **Fixed**                           | —      |
| I18N-06        | i18n          | —        | Fixed | `LessonPageClient.tsx:207`                    | Quiz CTA hardcoded                   | **Fixed** — uses t()                | —      |
| SEC-01         | Security      | —        | Fixed | `supabase/env.ts:25`                          | Mock in prod                         | **Fixed** — dev only                | —      |
| SEC-03         | Security      | —        | Fixed | auth callback/confirm                         | Open redirect                        | **Fixed** — sanitizeRedirect        | —      |
| SEC-05         | Security      | —        | Fixed | middleware                                    | Dashboard guard                      | **Fixed**                           | —      |
| A11Y-01        | Accessibility | —        | Fixed | dashboard layout                              | Duplicate main id                    | **Fixed**                           | —      |
| I18N-01–05     | i18n          | —        | Fixed | settings, dashboard                           | Hardcoded English                    | **Fixed** per June audit            | —      |
| LAYOUT-001–003 | UX            | —        | Fixed | Header, globals.css                           | Overflow/duplication                 | **Fixed**                           | —      |
| SEO-01         | SEO           | —        | Fixed | sitemap.ts                                    | Paths missing                        | **Fixed**                           | —      |

**Totals:** 42 tracked issues — 3 CRITICAL open, 11 HIGH/MEDIUM pre-launch, 12 Phase 2 polish, 16 fixed/closed from prior audits.

---

## Appendix A: Full i18n Key Parity Report

**Summary:** 739 leaf keys in EN; 739 in ES. **0 missing. 0 extra.**

### Identical EN=ES values (11 keys — intentional or review)

| Key                          | Value                         | Recommendation                      |
| ---------------------------- | ----------------------------- | ----------------------------------- |
| `dashboard.timeMinutes`      | `{count} min`                 | OK — unit abbreviation              |
| `dashboard.timeHours`        | `{hours}h`                    | OK                                  |
| `dashboard.timeHoursMinutes` | `{hours}h {minutes}m`         | OK                                  |
| `settings.privacyEmail`      | `privacy@healthmadeclear.com` | Update when canonical email decided |
| `settings.english`           | `English`                     | OK — language name                  |
| `settings.spanish`           | `Español`                     | OK                                  |
| `achievements.earnedDate`    | `{date}`                      | OK — ICU placeholder                |
| `search.escapeKey`           | `ESC`                         | OK                                  |
| `search.shortcutMac`         | `⌘K`                          | OK                                  |
| `search.shortcutWindows`     | `Ctrl K`                      | OK                                  |
| `contact.subjectGeneral`     | `General`                     | **Translate** to ES                 |

### ES quality notes (not key gaps)

- `tools.emergencyShort`, `tools.careOptionsHeading`, `tools.scenarioSoreThroatBody`, `tools.whenInDoubtTitle`, `tools.whenInDoubtBody` use formal _usted_; rest of site uses _tú_
- Brand `"Health Made Clear"` retained in English in both catalogs (expected)

### Hardcoded English outside message catalogs

| Location                     | String                                |
| ---------------------------- | ------------------------------------- |
| `Footer.tsx:18,88`           | Brand name (acceptable)               |
| `Header.tsx:170`             | Brand name                            |
| `OnboardingDialog.tsx:55`    | Brand heading                         |
| `Input.tsx:27-28`            | Show/Hide password defaults           |
| `KeyTakeaway.tsx:10`         | Default title (overridden in lessons) |
| `layout.tsx:41,53-54`        | Metadata template, authors            |
| `learn/[slug]/page.tsx` etc. | `"Lesson not found"` metadata         |
| `api/contact/route.ts`       | English API error strings             |
| `ContactClient.tsx:87`       | `"Failed to submit"` throw            |

---

## Appendix B: Test Coverage Gap Report

**Scope:** `src/lib/**` + `src/hooks/**` (vitest coverage config)  
**Overall:** 76.13% lines | 72.71% statements | 61.48% branches | 76.42% functions

### Zero or critical low coverage (business logic)

| File                             | Lines  | Notes                                                      |
| -------------------------------- | ------ | ---------------------------------------------------------- |
| `src/hooks/useProgress.ts`       | **0%** | Core progress sync + Supabase migration — highest risk gap |
| `src/lib/dashboard/progress.ts`  | **0%** | Dashboard summary queries                                  |
| `src/lib/i18n.ts`                | 24%    | `formatRelativeDate` partially tested                      |
| `src/lib/lessons/loadLessons.ts` | 29%    | Runtime content loading                                    |

### Well-covered critical paths

| File                           | Lines            |
| ------------------------------ | ---------------- |
| `lib/guestProgress.ts`         | High             |
| `lib/auth/sanitizeRedirect.ts` | 100%             |
| `lib/supabase/middleware.ts`   | 100%             |
| `lib/dashboard/activity.ts`    | High             |
| `api/contact/route.ts`         | Tested (5 cases) |

### E2E coverage gaps

| Flow                       | E2E     | Notes              |
| -------------------------- | ------- | ------------------ |
| Guest lesson + quiz        | Yes     | `flows.spec.ts`    |
| Auth signup render         | Partial | `auth.spec.ts`     |
| Real Supabase auth         | **No**  | Mock login only    |
| `/dashboard/progress` page | **No**  | Export button only |
| Password reset complete    | **No**  |                    |
| Prod build under test      | **No**  | Dev server in CI   |

### Excluded from coverage (by config)

- `src/components/**`
- `src/app/**`
- `src/middleware.ts`

---

## Appendix C: Supabase Migration Status

| #   | File                          | Status in repo | Purpose                                                  |
| --- | ----------------------------- | -------------- | -------------------------------------------------------- |
| 001 | `001_profiles.sql`            | Present        | profiles + signup trigger + RLS                          |
| 002 | `002_lesson_progress.sql`     | Present        | lesson_progress + RLS                                    |
| 003 | `003_quiz_attempts.sql`       | Present        | quiz_attempts + RLS                                      |
| 004 | `004_achievements.sql`        | Present        | achievements + RLS                                       |
| 005 | `005_streaks.sql`             | Present        | streaks + RLS                                            |
| 006 | `006_daily_log.sql`           | Present        | daily_log + RLS                                          |
| 007 | `007_notifications.sql`       | Present        | notifications + indexes + RLS                            |
| 008 | `008_contact_submissions.sql` | Present        | contact form + anon INSERT RLS                           |
| 009 | `009_delete_user.sql`         | Present        | SECURITY DEFINER delete_user RPC                         |
| 010 | `010_updated_at_triggers.sql` | Present        | updated_at triggers (profiles, lesson_progress, streaks) |
| 011 | `011_indexes.sql`             | Present        | quiz_attempts + contact_submissions indexes              |

**Gaps:** No `supabase/config.toml` or `seed.sql` in repo. Remote apply state requires `supabase migration list --linked`. Recommended follow-up migration 012 for `lesson_progress` activity index.

**RLS summary:** All 8 tables RLS ON. User tables: `auth.uid() = user_id`. Contact: anon INSERT, SELECT blocked for anon/authenticated.

---

## Appendix D: Environment Variable Reference

| Variable                        | Required          | Documented in `.env.example` | Used in code                  | How to obtain                         |
| ------------------------------- | ----------------- | ---------------------------- | ----------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | **Yes** (prod)    | Yes                          | supabase clients, contact API | Supabase → Settings → API             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** (prod)    | Yes                          | supabase clients, contact API | Supabase → Settings → API             |
| `NEXT_PUBLIC_SITE_URL`          | **Yes** (prod/CI) | Yes                          | sitemap, metadata, JsonLd     | `https://healthmadeclear.netlify.app` |
| `NEXT_PUBLIC_SENTRY_DSN`        | Optional          | Yes                          | `errorReporting.ts`           | sentry.io project DSN                 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional          | Commented                    | `GoogleAnalytics.tsx`         | GA4 admin                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | No                | Yes                          | **Not used in src/**          | Supabase (admin only)                 |
| `RESEND_API_KEY`                | No                | Commented                    | **Not used**                  | resend.com                            |
| `CONTACT_EMAIL`                 | No                | Commented                    | **Not used**                  | N/A                                   |
| `NODE_ENV`                      | Auto              | No                           | logger, analytics, mock gate  | Set by runtime                        |
| `CI`                            | Auto              | No                           | build checks, Playwright      | GitHub Actions                        |
| `NETLIFY`                       | Auto              | No                           | site URL bootstrap            | Netlify build                         |
| `URL` / `DEPLOY_PRIME_URL`      | Auto              | No                           | Netlify URL fallback          | Netlify                               |
| `SUPABASE_URL`                  | Legacy            | No                           | Bridged to NEXT_PUBLIC_*      | next.config.mjs                       |
| `SUPABASE_ANON_KEY`             | Legacy            | No                           | Bridged to NEXT_PUBLIC_*      | next.config.mjs                       |
| `ANALYZE`                       | Optional          | No                           | Bundle analyzer               | Local dev                             |
| `PLAYWRIGHT_PROD`               | Optional          | No                           | Prod-build E2E                | Local/CI opt-in                       |

---

## Appendix E: Component Design Token Compliance Report

**Reference:** DESIGN.md — Primary `#004349`, Secondary `#3e6658`, body 18px/1.6, container 1100px, buttons 56px, radius 8px default.

### Global token drift (affects all components)

| Token         | DESIGN.md | Shipped (`globals.css`)       | Status                          |
| ------------- | --------- | ----------------------------- | ------------------------------- |
| Primary       | `#004349` | `#0f5c63`                     | Non-compliant                   |
| Secondary     | `#3e6658` | `#4f7567`                     | Non-compliant                   |
| Body size     | 18px      | 16px (17px md+)               | Non-compliant                   |
| Container     | 1100px    | 1280px (`tailwind.config.ts`) | Intentional drift (REMEDIATION) |
| Button radius | 8px       | 9999px (pill)                 | Style evolution                 |
| Button height | 56px      | 56px default md               | Compliant                       |

### Per-component summary (68 components)

| Component                   | Colors           | Typography | Spacing | Radius | Notes                     |
| --------------------------- | ---------------- | ---------- | ------- | ------ | ------------------------- |
| `Header.tsx`                | OK tokens        | OK         | OK      | OK     | Auth buttons 44px (DS-05) |
| `Footer.tsx`                | OK               | OK         | OK      | OK     | Brand text hardcoded      |
| `Hero.tsx`                  | OK               | OK         | OK      | OK     | Compliant                 |
| `Button.tsx`                | OK               | OK         | OK      | pill   | sm=44px variant           |
| `Input.tsx`                 | OK               | OK         | OK      | 16px   | rgba hardcode DS issue    |
| `Modal.tsx`                 | OK               | OK         | OK      | OK     | Focus trap present        |
| `SearchDialog.tsx`          | OK               | OK         | OK      | OK     | Hydration issue HYDR-01   |
| `LessonCard.tsx`            | OK               | OK         | OK      | OK     | Via ResourceCard          |
| `LearningPathCard.tsx`      | OK               | OK         | OK      | OK     | Compliant                 |
| `DashboardSidebar.tsx`      | OK               | OK         | OK      | 1.5rem | Compliant                 |
| `QuizClient.tsx`            | **Hex hardcode** | OK         | OK      | OK     | DS-04                     |
| `Skeleton.tsx`              | rgba literals    | N/A        | OK      | OK     | Minor                     |
| `Reveal.tsx`                | OK               | OK         | OK      | OK     | A11Y-02 when onClick set  |
| `MedicalDisclaimer.tsx`     | OK               | OK         | OK      | OK     | Compliant                 |
| `PageHeader.tsx`            | OK               | OK         | OK      | OK     | Compliant                 |
| `EmptyState.tsx`            | OK               | OK         | OK      | OK     | Compliant                 |
| `ProgressBar.tsx`           | OK               | OK         | OK      | OK     | Compliant                 |
| `Toast.tsx`                 | OK               | OK         | OK      | OK     | Compliant                 |
| `Container.tsx`             | OK               | OK         | 1280px  | OK     | Uses max-w-container      |
| `Section.tsx`               | OK               | OK         | OK      | OK     | Compliant                 |
| `LanguageToggle.tsx`        | OK               | OK         | OK      | OK     | Compliant                 |
| `ThemeToggle.tsx`           | OK               | OK         | OK      | OK     | Compliant                 |
| `AccessibilityControls.tsx` | OK               | OK         | OK      | OK     | Compliant                 |
| `OnboardingDialog.tsx`      | OK               | OK         | OK      | OK     | i18n gap I18N-10          |
| `GoogleAnalytics.tsx`       | N/A              | N/A        | N/A     | N/A    | Conditional render        |
| `JsonLd.tsx`                | N/A              | N/A        | N/A     | N/A    | Schema only               |
| `MarkdownRenderer.tsx`      | OK               | OK         | OK      | OK     | prose tokens              |
| `QuizQuestion.tsx`          | OK               | OK         | OK      | OK     | Compliant                 |
| `QuizResults.tsx`           | OK               | OK         | OK      | OK     | Compliant                 |
| `AchievementCard.tsx`       | OK               | OK         | OK      | OK     | Compliant                 |
| `ArticleCard.tsx`           | OK               | OK         | OK      | OK     | Compliant                 |
| `Callout.tsx`               | OK               | OK         | OK      | OK     | Compliant                 |
| `KeyTakeaway.tsx`           | OK               | OK         | OK      | OK     | Default EN title          |
| All skeletons (4)           | OK               | N/A        | OK      | OK     | Compliant                 |
| All loading (2)             | OK               | OK         | OK      | OK     | Compliant                 |
| `AppProviders.tsx`          | OK               | OK         | OK      | OK     | Compliant                 |
| `AuthProvider.tsx`          | N/A              | N/A        | N/A     | N/A    | Logic only                |
| Remaining ui/* (15)         | OK               | OK         | OK      | OK     | Token-based classes       |

**Summary:** Components consistently use Tailwind semantic tokens (`text-primary`, `bg-surface`, `shadow-elevation-*`). Main gaps are **global CSS variable values** diverging from DESIGN.md, not per-component ad-hoc styling. Exceptions: `QuizClient.tsx` hex colors, compact header auth buttons, pill button radius vs 8px spec.

---

_End of HealthMadeClear Production Launch Plan v2_
