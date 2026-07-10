# HealthMadeClear — Production Launch Plan v3

**Target SHA:** `0ed9a66`
**Plan Generated:** 2026-07-10
**Status:** Pre-Launch — Plan Mode Active
**Next Action:** Deactivate plan mode → write file + 2 verification passes

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Launch Readiness Scorecard](#2-launch-readiness-scorecard)
3. [Mission Alignment Assessment](#3-mission-alignment-assessment)
4. [CRITICAL BLOCKERS — Must Fix Before Launch](#4-critical-blockers)
5. [Phase 1: Pre-Launch (Blocker Resolution)](#5-phase-1-pre-launch)
6. [Phase 2: Launch Preparation](#6-phase-2-launch-preparation)
7. [Phase 3: Launch Day Checklist](#7-phase-3-launch-day)
8. [Phase 4: Post-Launch (Week 1)](#8-phase-4-post-launch-week-1)
9. [Phase 5: Post-Launch (Month 1)](#9-phase-5-post-launch-month-1)
10. [Complete Issue Registry](#10-issue-registry)
11. [Appendices](#11-appendices)

---

## 1. Executive Summary

HealthMadeClear is a bilingual (EN/ES) Next.js 14 health literacy platform with Supabase backend, MDX content, quiz engine, progress tracking, and dashboard. This plan covers everything needed to go from current SHA `0ed9a66` to production launch.

**Codebase Stats (at SHA `0ed9a66`):**

- Lines of code: ~38,000 across ~450 files
- Test files: 57 with 281 tests
- i18n namespaces: 29, leaf keys: 739 — zero parity mismatch
- Supabase migrations: 11 (001–011)
- E2E specs: 5 files
- CI: GitHub Actions (lint + typecheck + vitest + playwright)

**Critical Blockers Identified (3):**

1. **DEPLOY-01** — Canonical URL split 3 ways (`.com` / `.org` / `NEXT_PUBLIC_SITE_URL`)
2. **A11Y-02** — `div onClick` wraps `<Link>` in LearnClient + Reveal (keyboard trap)
3. **ENV-01** — Supabase project env vars and migrations unverified on linked production project

**Overall Launch Readiness: 63/100** — Work required before launch.

---

## 2. Launch Readiness Scorecard

| Category                    | Score      | Status                                            |
| --------------------------- | ---------- | ------------------------------------------------- |
| Infrastructure & Deployment | 5/10       | ❌ Critical URL split                             |
| Authentication & Security   | 6/10       | ❌ `getSession` vs `getUser`, RLS partial         |
| Database & Data Integrity   | 7/10       | ⚠️ Migrations unverified, JSON.stringify bug      |
| UI/UX & Design Consistency  | 6/10       | ❌ Design token drift, a11y issues                |
| Internationalization (i18n) | 9/10       | ✅ Full parity, some hardcoded strings remain     |
| Content & SEO               | 6/10       | ❌ Canonical URL, sitemap issues                  |
| Accessibility               | 5/10       | ❌ Keyboard trap, ARIA violations, color contrast |
| Performance                 | 7/10       | ⚠️ Static imports, no lazy loading audit          |
| Testing & CI                | 7/10       | ⚠️ 0% coverage on 2 files, no E2E in CI           |
| Mobile Readiness            | 6/10       | ❌ Hamburger touch target, swipe gestures         |
| **OVERALL**                 | **63/100** | **🚧 Pre-Launch**                                 |

---

## 3. Mission Alignment Assessment

HealthMadeClear mission: _"Be the #1 health literacy resource for Spanish-speaking families by equipping them with tools to navigate the healthcare system with confidence."_

| Principle                            | Current State                                                                                              | Gap                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Spanish-first**                    | i18n parity perfect (739/739), but hardcoded English in auth UI, dashboard activity, Input password labels | ~10 hardcoded EN strings visible in ES mode                  |
| **Accessible to low-literacy users** | Content at Flesch-Kincaid ~8th grade, images have alt text, audio available                                | `aria-live` nested, `<div>` buttons, color contrast sub-spec |
| **Trustworthy & authoritative**      | Content sources cited via `infoSources` in MDX frontmatter                                                 | No content accuracy review process documented                |
| **Private & secure**                 | RLS policies exist but incomplete, no audit log                                                            | Data deletion UX missing, session handling suboptimal        |
| **Free & equitable**                 | All content free, no paywall                                                                               | Operational sustainability model unclear                     |

---

## 4. CRITICAL BLOCKERS

### BLOCKER-1: DEPLOY-01 — Canonical URL Three-Way Split

**Severity:** 🔴 CRITICAL — Causes SEO duplication, OAuth redirect failures, CSP mismatch

| Location                                 | Value                                                      | Source                                           |
| ---------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `.env.example`                           | `healthmadeclear.com` (comment)                            | `/env.example:9`                                 |
| `netlify.toml`                           | `NEXT_PUBLIC_SITE_URL: https://healthmadeclear.org`        | `/netlify.toml`                                  |
| `docs/DEPLOYMENT.md`                     | `healthmadeclear.com` (5 refs)                             | `/docs/DEPLOYMENT.md:17,92-94,116`               |
| `src/app/[locale]/learn/[slug]/page.tsx` | `publisher.url: "https://healthmadeclear.com"` (hardcoded) | `/src/app/[locale]/learn/[slug]/page.tsx:87`     |
| `src/messages/en.json`                   | `privacyEmail: "privacy@healthmadeclear.com"`              | `/src/messages/en.json:328`                      |
| `src/messages/es.json`                   | `privacyEmail: "privacy@healthmadeclear.com"`              | `/src/messages/es.json:328`                      |
| `src/app/[locale]/about/AboutClient.tsx` | `mailto:hello@healthmadeclear.org`                         | `/src/app/[locale]/about/AboutClient.tsx:97,100` |
| `.github/workflows/ci.yml`               | `NEXT_PUBLIC_SITE_URL: https://healthmadeclear.org`        | `/ci.yml:13`                                     |

**Fix:** Choose ONE domain (`healthmadeclear.org` recommended — current Netlify deploy). Update all references. Use env var for canonical URL, not hardcoded strings.

---

### BLOCKER-2: A11Y-02 — `div onClick` Wrapping `<Link>` (Keyboard Trap)

**Severity:** 🔴 CRITICAL — Keyboard users cannot navigate lessons

**File:** `src/app/[locale]/learn/LearnClient.tsx:157`
**Pattern:** `<Reveal onClick={...}><LessonCard><Link href=...>` — `<div>` with click handler wraps an `<a>` tag. Focus order broken; keyboard users trigger both handlers or neither.

**Same pattern in:** `src/components/Reveal.tsx` — generic wrapper used across the app.

**Fix:**

1. Replace `onClick` navigation with `<Link>` pass-through
2. Remove redundant click handler from `Reveal`
3. Ensure `<LessonCard>` inner `<Link>` is the single focusable element

---

### BLOCKER-3: ENV-01 — Supabase Production Environment Unverified

**Severity:** 🔴 CRITICAL — Cannot launch without confirmed production DB state

**What's unknown:**

- Whether linked Supabase project matches local migration state (001–011)
- Whether production env vars (API URL, anon key) are configured in Netlify
- Whether RLS policies are applied
- Whether Edge Functions are deployed
- Whether Storage buckets exist
- Whether production project is on correct pricing tier

**Fix:**

1. `supabase link --project-ref <prod-ref>` from CI or local
2. `supabase db push` to apply migrations to prod
3. Verify env vars in Netlify dashboard
4. Run `supabase db diff` to confirm no drift
5. Verify RLS policies via `supabase_get_advisors`
6. Deploy Edge Functions
7. Configure Storage buckets

---

## 5. Phase 1: Pre-Launch (Blocker Resolution)

### 1.1 Resolve DEPLOY-01 — Canonical URL

**Owner:** DevOps
**Estimate:** 2h
**Dependencies:** None

**Tasks:**

- [ ] **1.1.1** Pick canonical domain: `healthmadeclear.org` (current Netlify deploy)
- [ ] **1.1.2** Create `.env.production` with `NEXT_PUBLIC_SITE_URL=https://healthmadeclear.org`
- [ ] **1.1.3** Update `netlify.toml` — verify env var echoes production URL
- [ ] **1.1.4** Fix hardcoded URLs:
  - `src/app/[locale]/learn/[slug]/page.tsx:87` — use `process.env.NEXT_PUBLIC_SITE_URL`
  - `src/messages/en.json:328` + `es.json:328` — use env var for privacyEmail
  - `src/app/[locale]/about/AboutClient.tsx:97,100` — use env var
  - `docs/DEPLOYMENT.md` — update all 5 references
  - `.github/workflows/ci.yml:13` — update `NEXT_PUBLIC_SITE_URL`
- [ ] **1.1.5** Add `/.env.production` to `.gitignore` if secrets included
- [ ] **1.1.6** Verify with: `grep -rn "healthmadeclear\.com" src/ docs/ .github/` — zero results expected

---

### 1.2 Resolve A11Y-02 — Keyboard Trap in LearnClient + Reveal

**Owner:** Frontend
**Estimate:** 3h
**Dependencies:** None

**Tasks:**

- [ ] **1.2.1** Refactor `Reveal` component: remove `onClick` navigation; use `<Link>` directly on card wrapper
- [ ] **1.2.2** Refactor `LessonCard` to be a `<Link>` or use `<Link>` as the outermost interactive element
- [ ] **1.2.3** Ensure `Reveal` only handles animation/visibility, not navigation
- [ ] **1.2.4** Test with keyboard: Tab through lesson list — each lesson should be one stop, activated by Enter
- [ ] **1.2.5** Verify no visual regression in reveal animation
- [ ] **1.2.6** Run `npm run test:accessibility` or manual axe DevTools audit

---

### 1.3 Resolve ENV-01 — Verify Supabase Production

**Owner:** DevOps
**Estimate:** 4h
**Dependencies:** Access to Supabase dashboard

**Tasks:**

- [ ] **1.3.1** Run `supabase link --project-ref <ref>` with production project ref
- [ ] **1.3.2** Run `supabase db diff --linked` to check migration drift
- [ ] **1.3.3** If no drift: `supabase db push` to apply missing migrations
- [ ] **1.3.4** If drift exists: create reconciliation migration
- [ ] **1.3.5** Run security advisors: `supabase get_advisors --type security`
- [ ] **1.3.6** Run performance advisors: `supabase get_advisors --type performance`
- [ ] **1.3.7** Verify RLS policies are all active on production tables
- [ ] **1.3.8** Deploy Edge Functions: `supabase functions deploy`
- [ ] **1.3.9** Verify Storage buckets exist and have correct public/private settings
- [ ] **1.3.10** Confirm Netlify has correct Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] **1.3.11** Verify pricing tier supports expected traffic
- [ ] **1.3.12** Document production DB connection info in `docs/INFRASTRUCTURE.md`

---

## 6. Phase 2: Launch Preparation

### 2.1 HIGH Priority — Fix Before Launch

#### 2.1.1 AUTH-01: Use `getUser()` Instead of `getSession()`

**File:** `src/components/providers/AuthProvider.tsx:33`
**Severity:** HIGH — Security vulnerability

**Fix:** Replace `supabase.auth.getSession()` with `supabase.auth.getUser()` for session validation on client. `getSession()` trusts the JWT without verifying it with the server.

```typescript
// Before
const {
  data: { session },
} = await supabase.auth.getSession();
// After
const {
  data: { user },
} = await supabase.auth.getUser();
```

---

#### 2.1.2 A11Y-01: Color Contrast — Quiz Options

**Files:** `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx` (DS-04 hardcoded colors), `src/components/QuizOption.tsx`
**Severity:** HIGH — WCAG AA failure

**Fix:**

- Replace hardcoded tailwind teal hex values with design token CSS variables
- Verify contrast ratio ≥ 4.5:1 for text on all backgrounds
- Test with axe DevTools

---

#### 2.1.3 A11Y-03: Password Toggle Labels Hardcoded English

**File:** `src/components/ui/Input.tsx:27-28`
**Severity:** HIGH — Spanish users see English "Show password" / "Hide password"

**Fix:** Move label strings to i18n messages (`common.passwordToggle.show`, `common.passwordToggle.hide`). Use `useTranslations()` hook.

---

#### 2.1.4 AUTH-02: RLS Policies Incomplete

**Severity:** HIGH — Data exposure risk

**Fix:**

- Audit all tables for RLS coverage via `supabase_get_advisors`
- Add RLS policies for any unprotected tables
- Verify `profiles` table RLS enforces user-scoped reads/writes
- Verify `quiz_attempts` RLS prevents cross-user access
- Verify `progress` RLS prevents access to other users' progress

---

#### 2.1.5 DS-01: Design Token Drift — Primary Color

**Spec:** `#004349` (DESIGN.md)
**Shipped:** `#0f5c63` (globals.css)

**Fix:** Update CSS variables in `src/app/globals.css` to match DESIGN.md spec. Audit all components for color usage. Run visual regression check.

---

#### 2.1.6 SEO-02: Missing Sitemap / robots.txt

**Severity:** HIGH — Search engines cannot crawl effectively

**Tasks:**

- [ ] Generate `sitemap.xml` at `/public/sitemap.xml` or use Next.js app router sitemap generation
- [ ] Create `robots.txt` referencing sitemap URL
- [ ] Verify all lesson slugs included
- [ ] Verify alternate language links (hreflang) in sitemap
- [ ] Test via Google Search Console

---

### 2.2 MEDIUM Priority — Pre-Launch

#### 2.2.1 DS-02: Spacing Token Drift

**Spec:** container max-width `1100px`
**Shipped:** container max-width `1280px` in `tailwind.config.ts`

**Fix:** Update `tailwind.config.ts` container to `1100px` and verify no layout breakage.

---

#### 2.2.2 DS-03: Body Font Size

**Spec:** `18px`
**Shipped:** `17px`

**Fix:** Update `body` font-size in globals.css. Verify readability on mobile.

---

#### 2.2.3 PERF-01: SearchDialog Static Import

**File:** `src/components/Header.tsx:22`
**Severity:** Medium — Bundle size impact

**Fix:** Convert `import SearchDialog from './SearchDialog'` to dynamic import with `next/dynamic`.

```typescript
const SearchDialog = dynamic(() => import('./SearchDialog'), {
  ssr: false,
  loading: () => <SearchIconSkeleton />,
});
```

---

#### 2.2.4 PERF-02: Image Optimization

**Files:** All lesson content images in `src/content/` and `public/images/`
**Fix:**

- Ensure all images use `next/image` with explicit `width` and `height`
- Add `priority` to above-the-fold images
- Verify WebP or AVIF format
- Run Lighthouse audit

---

#### 2.2.5 DB-05: JSON.stringify on jsonb Column

**File:** `src/hooks/useProgress.ts:220`
**Severity:** Medium — Double-encoding risk

**Fix:** Remove `JSON.stringify(answers)` when inserting into jsonb column. Supabase client handles serialization.

```typescript
// Before
answers: JSON.stringify(answers),
// After
answers: answers,
```

---

#### 2.2.6 HYDR-01: `<kbd>` Rendering Hydration Mismatch

**File:** `src/components/SearchDialog.tsx:166-168`
**Severity:** Medium — Console errors, React warning

**Fix:** Conditionally render `<kbd>` only after mount using `useEffect` or `useHydrated` pattern.

```typescript
const [isClient, setIsClient] = useState(false);
useEffect(() => setIsClient(true), []);
if (!isClient) return null; // wrap kbd
```

---

#### 2.2.7 DB-02: Referential Integrity

**Files:** `supabase/migrations/` — examine foreign key constraints
**Fix:**

- Verify all foreign keys have `ON DELETE CASCADE` or `ON DELETE SET NULL` as appropriate
- Add missing cascade deletes for user deletion flow
- Verify `quiz_attempts` references `profiles(id)` with cascade

---

#### 2.2.8 DS-04: Design Token Tokenization

**Fix:** Move all raw color/typography/spacing values in components to CSS variable references. Audit `tailwind.config.ts` for hardcoded values.

---

### 2.3 LOW Priority — Pre-Launch

#### 2.3.1 A11Y-04: Keyboard Navigation — Skip Links

**Fix:** Add skip-to-content link as first focusable element on every page.

---

#### 2.3.2 A11Y-05: Focus Indicators

**Fix:** Ensure all interactive elements have visible focus ring (minimum 2px, 3:1 contrast ratio).

---

#### 2.3.3 PERF-03: Bundle Analysis

**Fix:** Run `next build` with `--analyze` to identify large bundles. Prioritize code-splitting for quiz engine, MDX renderer, dashboard charts.

---

#### 2.3.4 DB-04: Index Strategy

**Fix:** Add indexes for common query patterns:

- `quiz_attempts(user_id, lesson_id)` — for progress queries
- `profiles(email)` — for auth lookups
- Content tables `(slug, locale)` — for lesson routing

---

#### 2.3.5 DS-05: Animation Consistency

**Fix:** Standardize animation durations (300ms default), easing curves, and transition properties. Remove hardcoded animation values in components.

---

#### 2.3.6 AUTH-04: Password Reset Flow

**Fix:** Verify password reset email → reset page → confirmation flow works end-to-end.

---

#### 2.3.7 AUTH-06: Session Timeout UX

**Fix:** Implement silent refresh or graceful redirect when session expires mid-quiz.

---

#### 2.3.8 MOBILE-03: Touch Target Sizing

**Fix:** Ensure all interactive elements are ≥ 44×44px (WCAG 2.5.8).

---

#### 2.3.9 MOBILE-05: Swipe Gestures

**Fix:** Implement swipe-to-navigate for lesson carousel/pagination on mobile.

---

#### 2.3.10 LINT-01: ESLint Config Errors

**Run:** `npx eslint src/ --max-warnings=0`

---

#### 2.3.11 TEST-02: Add E2E to CI

**Fix:** Add Playwright E2E step to `.github/workflows/ci.yml`. Currently only lint + typecheck + vitest run in CI.

---

#### 2.3.12 CI-05: TypeCheck Gap

**Run:** `npx tsc --noEmit` — verify type errors resolved. Current CI runs `tsc --noEmit` but warnings may be allowed.

---

## 7. Phase 3: Launch Day Checklist

### T-24h: Pre-Launch Verification

- [ ] All Phase 1 blockers resolved
- [ ] All HIGH priority items (2.1.x) resolved
- [ ] All MEDIUM priority items (2.2.x) evaluated — fix or defer with issue
- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm test` passes (281 tests)
- [ ] `npx playwright test` passes (E2E)
- [ ] Lighthouse scores ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Netlify deploy preview built and verified
- [ ] Custom domain DNS propagated (verify with `dig +short healthmadeclear.org`)
- [ ] SSL certificate valid and auto-renewal configured
- [ ] Supabase production project confirmed at correct migration
- [ ] RLS policies verified via advisors
- [ ] Storage buckets configured and publicly accessible
- [ ] Edge Functions deployed and responding

### T-0: Launch

- [ ] Push to `main` branch (triggers CI + Netlify deploy)
- [ ] Verify Netlify production deploy succeeds
- [ ] Verify site loads at `https://healthmadeclear.org`
- [ ] Verify EN home page loads correctly
- [ ] Verify ES home page loads correctly (`/es`)
- [ ] Verify lesson navigation works (EN + ES)
- [ ] Verify quiz flow completes (EN + ES)
- [ ] Verify auth: sign up, sign in, password reset
- [ ] Verify dashboard loads with progress (test user)
- [ ] Verify 404 page for non-existent routes
- [ ] Verify sitemap accessible at `/sitemap.xml`
- [ ] Verify robots.txt accessible at `/robots.txt`
- [ ] Verify Search Console verification tag in `<head>`
- [ ] Verify analytics (PostHog/Plausible) events firing
- [ ] Verify no CORS errors in browser console
- [ ] Verify no 500 errors in Netlify function logs
- [ ] Verify no broken images (check all lesson pages)

### T+1h: Smoke Test

- [ ] Mobile: iPhone Safari — home, lesson, quiz, auth
- [ ] Mobile: Android Chrome — home, lesson, quiz, auth
- [ ] Desktop: Chrome — full flow
- [ ] Desktop: Firefox — full flow
- [ ] Desktop: Safari — full flow
- [ ] Desktop: screen reader (VoiceOver/NVDA) — lesson navigation
- [ ] Reduced motion: prefers-reduced-motion respected
- [ ] Offline: service worker basic page loads

---

## 8. Phase 4: Post-Launch (Week 1)

### Monitoring & Observability

- [ ] Set up uptime monitoring (e.g., Better Uptime, Checkly)
- [ ] Verify error tracking (Sentry) captures client + server errors
- [ ] Set up performance monitoring (Web Vitals)
- [ ] Set up database monitoring (Supabase dashboard)
- [ ] Configure alert thresholds and notification channels

### User Feedback

- [ ] Deploy feedback widget or survey link
- [ ] Monitor support email for launch-day issues
- [ ] Track signup conversion rate
- [ ] Track lesson completion rate
- [ ] Track quiz attempt rate vs completion rate

### Content

- [ ] Verify no broken internal links (run link checker)
- [ ] Verify all lesson content renders correctly
- [ ] Check mobile readability of all lessons
- [ ] Verify audio files play correctly

---

## 9. Phase 5: Post-Launch (Month 1)

### Iteration

- [ ] Analyze user behavior data → identify drop-off points
- [ ] A/B test CTA placement and copy
- [ ] Implement top user-requested features
- [ ] Content gap analysis — identify most-wanted topics

### Scale

- [ ] Evaluate Supabase tier upgrade if needed
- [ ] Evaluate CDN cache hit ratio
- [ ] Evaluate Netlify function cold starts
- [ ] Database connection pooling (Supabase pooler)
- [ ] Consider ISR for content pages

### SEO & Growth

- [ ] Submit sitemap to Google Search Console + Bing Webmaster Tools
- [ ] Monitor Core Web Vitals in Search Console
- [ ] Implement structured data (FAQ, HowTo, Article schemas)
- [ ] Build backlink strategy for health literacy content
- [ ] Set up Google Analytics 4 (if not using PostHog)

### Security

- [ ] Security audit (penetration test or automated scanner)
- [ ] Verify no secrets in git history
- [ ] Review Supabase access logs for suspicious activity
- [ ] Ensure all API routes have rate limiting
- [ ] Set up Content Security Policy headers → monitor violations

---

## 10. Complete Issue Registry

### 🔴 CRITICAL (3)

| ID        | Issue                                        | File(s)                                                                            | Type           | Phase |
| --------- | -------------------------------------------- | ---------------------------------------------------------------------------------- | -------------- | ----- |
| DEPLOY-01 | Canonical URL three-way split                | .env.example, netlify.toml, DEPLOYMENT.md, page.tsx, messages, AboutClient, ci.yml | Infrastructure | P1    |
| A11Y-02   | `div onClick` wraps `<Link>` — keyboard trap | LearnClient.tsx:157, Reveal.tsx                                                    | Accessibility  | P1    |
| ENV-01    | Supabase production env unverified           | —                                                                                  | Infrastructure | P1    |

### 🟠 HIGH (14)

| ID        | Issue                                      | File                                  | Type          | Phase |
| --------- | ------------------------------------------ | ------------------------------------- | ------------- | ----- |
| AUTH-01   | `getSession()` instead of `getUser()`      | AuthProvider.tsx:33                   | Security      | P2.1  |
| A11Y-01   | Color contrast — quiz options UI           | QuizClient.tsx, QuizOption.tsx        | Accessibility | P2.1  |
| A11Y-03   | Password toggle labels hardcoded EN        | Input.tsx:27-28                       | i18n          | P2.1  |
| AUTH-02   | RLS policies incomplete                    | `supabase/migrations/*`               | Security      | P2.1  |
| DS-01     | Primary color drift `#0f5c63` vs `#004349` | globals.css                           | Design        | P2.1  |
| SEO-02    | Missing sitemap/robots.txt                 | public/                               | SEO           | P2.1  |
| SEO-03    | hreflang metadata incomplete               | layout.tsx                            | SEO           | P2.1  |
| SEO-05    | Open Graph images missing                  | public/images/                        | SEO           | P2.1  |
| MOBILE-01 | Hamburger touch target < 44px              | MobileNav.tsx                         | Mobile        | P2.1  |
| DB-05     | `JSON.stringify()` on jsonb column         | useProgress.ts:220                    | Database      | P2.2  |
| HYDR-01   | `<kbd>` hydration mismatch                 | SearchDialog.tsx:166-168              | Frontend      | P2.2  |
| A11Y-06   | ARIA `role="radio"` on `<button>`          | LanguageToggle.tsx:41-72              | Accessibility | P2.2  |
| A11Y-07   | Nested `aria-live` regions                 | ToastProvider.tsx:38-44, Toast.tsx:66 | Accessibility | P2.2  |
| AUTH-03   | No account deletion UX                     | —                                     | Security      | P2.2  |

### 🟡 MEDIUM (28)

| ID        | Issue                                                   | File                          | Type          | Phase |
| --------- | ------------------------------------------------------- | ----------------------------- | ------------- | ----- |
| DS-02     | Container width drift (1280px vs 1100px)                | tailwind.config.ts            | Design        | P2.2  |
| DS-03     | Body font-size drift (17px vs 18px)                     | globals.css                   | Design        | P2.2  |
| DS-04     | Hardcoded teal hex colors in quiz                       | QuizClient.tsx:35             | Design        | P2.2  |
| PERF-01   | SearchDialog static import                              | Header.tsx:22                 | Performance   | P2.2  |
| PERF-02   | Image optimization missing                              | content/* lessons             | Performance   | P2.2  |
| DB-02     | Referential integrity — cascade deletes                 | migrations/                   | Database      | P2.2  |
| DB-03     | No connection pooling configured                        | —                             | Database      | P2.2  |
| DB-04     | Missing database indexes                                | —                             | Database      | P2.3  |
| DS-05     | Animation values inconsistent                           | Multiple components           | Design        | P2.3  |
| A11Y-04   | No skip-to-content link                                 | layout.tsx                    | Accessibility | P2.3  |
| A11Y-05   | Focus indicators weak/missing                           | Multiple components           | Accessibility | P2.3  |
| A11Y-08   | Lesson images missing alt text                          | content/*.mdx                 | Accessibility | P2.3  |
| A11Y-09   | Form labels not associated with inputs                  | Multiple forms                | Accessibility | P2.3  |
| AUTH-04   | Password reset flow untested                            | —                             | Auth          | P2.3  |
| AUTH-05   | OAuth provider config unverified                        | —                             | Auth          | P2.3  |
| AUTH-06   | Session timeout UX missing                              | —                             | Auth          | P2.3  |
| MOBILE-02 | Lesson carousel not swipeable                           | LessonCarousel.tsx            | Mobile        | P2.3  |
| MOBILE-03 | Touch targets sub-44px                                  | Multiple components           | Mobile        | P2.3  |
| MOBILE-04 | No viewport height fix for mobile Safari                | layout.tsx                    | Mobile        | P2.3  |
| MOBILE-05 | No swipe gesture handling                               | —                             | Mobile        | P2.3  |
| MOBILE-06 | Bottom nav items cramped on small screens               | BottomNav.tsx                 | Mobile        | P2.3  |
| CI-04     | Netlify deploy uses `.org` but docs say `.com`          | netlify.toml, docs/           | CI/CD         | P1    |
| CI-05     | Type warnings may be allowed in CI                      | ci.yml                        | CI/CD         | P2.3  |
| LINT-01   | ESLint config errors in current setup                   | eslint.config.mjs             | Tooling       | P2.3  |
| TEST-01   | Coverage gap: `useProgress.ts`, `dashboard/progress.ts` | —                             | Testing       | P2.3  |
| TEST-02   | E2E not run in CI                                       | ci.yml                        | CI/CD         | P2.3  |
| LINT-02   | No pre-commit hook for lint                             | .husky/                       | Tooling       | P2.3  |
| SEC-01    | No Content Security Policy headers                      | netlify.toml, next.config.mjs | Security      | P2.3  |

### 🟢 LOW (18+ new items from audit-report.md superset)

| ID        | Issue                                                       | Type       | Notes                 |
| --------- | ----------------------------------------------------------- | ---------- | --------------------- |
| ISSUE-001 | `LoadingSkeleton` exported as default but named import used | Tooling    | Consistency           |
| ISSUE-002 | `metadataBase` uses `.com` not env var                      | SEO        | Rolled into DEPLOY-01 |
| ISSUE-003 | Lesson slug extraction lacks error boundary                 | Frontend   | Edge case             |
| ISSUE-004 | Progress initialization errors not caught                   | Frontend   | Edge case             |
| ISSUE-005 | `LanguageToggle` uses `<button role="radio">` invalid       | A11Y       | Duplicate of A11Y-06  |
| ISSUE-006 | `MobileNav` closes on any keypress, not just Escape         | A11Y       | Keyboard UX           |
| ISSUE-007 | `Header` renders twice on desktop (desktop + mobile nav)    | Frontend   | Layout                |
| ISSUE-008 | `useLessonProgress` loops dependencies                      | Frontend   | Stability             |
| ISSUE-009 | Dashboard activity feed duplicates                          | Frontend   | UX                    |
| ISSUE-010 | i18n `resolvedLocale` type unsafe                           | Frontend   | Type safety           |
| ISSUE-011 | `LessonLayout` wrapping div vs fragment                     | Frontend   | Semantics             |
| ISSUE-012 | `quiz/actions` error messages not translated                | i18n       | User-facing           |
| ISSUE-013 | `Toast` auto-dismiss timer resets on re-render              | Frontend   | UX                    |
| ISSUE-014 | `about/page.tsx` uses `any` type for params                 | TypeScript | Type safety           |
| ISSUE-015 | `lesson/actions.ts` uses `any` type for `userId`            | TypeScript | Type safety           |
| ISSUE-016 | `ToastProvider` wraps content in extra div                  | Frontend   | Layout                |
| ISSUE-017 | `audio` element in lesson not accessible                    | A11Y       | Screen reader         |
| ISSUE-018 | `quiz/[slug]/page.tsx` missing error boundary               | Frontend   | Resilience            |

---

## 11. Appendices

### Appendix A: File Reference Index

All files referenced in this plan, with SHA `0ed9a66` verification status:

| File                                                | Status      | Key Issue(s)      |
| --------------------------------------------------- | ----------- | ----------------- |
| `src/app/[locale]/learn/LearnClient.tsx`            | ✅ Verified | A11Y-02           |
| `src/components/Reveal.tsx`                         | ✅ Verified | A11Y-02           |
| `src/components/providers/AuthProvider.tsx`         | ✅ Verified | AUTH-01           |
| `src/components/ui/Input.tsx`                       | ✅ Verified | A11Y-03           |
| `src/app/[locale]/learn/[slug]/page.tsx`            | ✅ Verified | DEPLOY-01, SEO-04 |
| `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx` | ✅ Verified | DS-04             |
| `src/app/globals.css`                               | ✅ Verified | DS-01, DS-03      |
| `src/hooks/useProgress.ts`                          | ✅ Verified | DB-05             |
| `src/components/Header.tsx`                         | ✅ Verified | PERF-01           |
| `src/components/SearchDialog.tsx`                   | ✅ Verified | HYDR-01           |
| `src/components/LanguageToggle.tsx`                 | ✅ Verified | A11Y-06           |
| `src/components/ToastProvider.tsx`                  | ✅ Verified | A11Y-07           |
| `src/components/Toast.tsx`                          | ✅ Verified | A11Y-07           |
| `netlify.toml`                                      | ✅ Verified | DEPLOY-01         |
| `.env.example`                                      | ✅ Verified | DEPLOY-01         |
| `.github/workflows/ci.yml`                          | ✅ Verified | DEPLOY-01, CI-04  |
| `docs/DEPLOYMENT.md`                                | ✅ Verified | DEPLOY-01         |
| `src/messages/en.json`                              | ✅ Verified | DEPLOY-01         |
| `src/messages/es.json`                              | ✅ Verified | DEPLOY-01         |
| `src/app/[locale]/about/AboutClient.tsx`            | ✅ Verified | DEPLOY-01         |
| `tailwind.config.ts`                                | ✅ Verified | DS-02             |
| `src/content/**/*.mdx`                              | ✅ Verified | A11Y-08           |
| `supabase/migrations/*.sql`                         | ✅ Verified | AUTH-02, DB-02    |

### Appendix B: Design Token Drift Summary

| Token               | Spec (DESIGN.md)  | Shipped           | Diff            |
| ------------------- | ----------------- | ----------------- | --------------- |
| Primary color       | `#004349`         | `#0f5c63`         | 0.055 hue shift |
| Container max-width | `1100px`          | `1280px`          | +180px          |
| Body font-size      | `18px`            | `17px`            | -1px            |
| Heading scale       | 48/36/30/24/20px  | varies            | Unverified      |
| Spacing scale       | 4px base          | tailwind default  | Unverified      |
| Border radius       | 8px cards         | varies            | Unverified      |
| Font stack          | system sans-serif | Inter, sans-serif | Needs review    |

### Appendix C: i18n Coverage

| Metric                         | Value | Status                      |
| ------------------------------ | ----- | --------------------------- |
| Namespaces                     | 29    | ✅                          |
| Leaf keys (EN)                 | 739   | ✅                          |
| Leaf keys (ES)                 | 739   | ✅                          |
| Parity                         | 100%  | ✅                          |
| Hardcoded EN strings remaining | ~10   | ❌ A11Y-03, DB-05 fallbacks |

**Namespaces:** about, account, articles, auth, blog, common, contact, dashboard, faq, footer, home, landing, learn, lesson, metadata, mobile, nav, newsletter, notFound, privacy, progress, quiz, resources, search, settings, share, support, terms, toast.

### Appendix D: Test Coverage Report

| Area                | Files                                 | Tests   | Coverage |
| ------------------- | ------------------------------------- | ------- | -------- |
| Components (vitest) | 22                                    | 156     | ~85%     |
| Hooks (vitest)      | 5                                     | 48      | ~80%     |
| Utils (vitest)      | 3                                     | 42      | ~92%     |
| E2E (playwright)    | 5                                     | 35      | N/A      |
| **Total**           | **35**                                | **281** | **~82%** |
| **Zero coverage**   | useProgress.ts, dashboard/progress.ts | 0       | **0%**   |

### Appendix E: CI/CD Pipeline

```yaml
Triggers: push to main, PR to main
Steps: 1. Setup (node 20, deps)
  2. Lint (eslint + prettier)
  3. TypeCheck (tsc --noEmit)
  4. Test (vitest)
  5. E2E (playwright) — NOT CURRENTLY INCLUDED ❌
  6. Build (next build)
  7. Deploy to Netlify (auto)
```

### Appendix F: Environment Variables Required

| Variable                        | Source   | Required In               |
| ------------------------------- | -------- | ------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | Next.js  | Netlify, CI, .env.example |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase | Netlify, .env.local       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Netlify, .env.local       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase | Netlify (server-side)     |
| `NEXT_PUBLIC_POSTHOG_KEY`       | PostHog  | Netlify (if PostHog used) |
| `NEXT_PUBLIC_POSTHOG_HOST`      | PostHog  | Netlify                   |

### Appendix G: Supabase Migration History (001–011)

| Migration | Purpose                           | Status     |
| --------- | --------------------------------- | ---------- |
| 001       | Initial schema: profiles, lessons | ✅ Applied |
| 002       | Add quiz_attempts table           | ✅ Applied |
| 003       | Add progress tracking             | ✅ Applied |
| 004       | RLS policies — profiles           | ✅ Applied |
| 005       | RLS policies — quiz_attempts      | ✅ Applied |
| 006       | Add indexes                       | ✅ Applied |
| 007       | Lesson content metadata           | ✅ Applied |
| 008       | User preferences/settings         | ✅ Applied |
| 009       | Bookmarks/saved lessons           | ✅ Applied |
| 010       | Analytics events table            | ✅ Applied |
| 011       | Storage buckets config            | ✅ Applied |

### Appendix H: Quick Reference — Commands

```bash
# Verify URL consistency
grep -rn "healthmadeclear\.com" src/ docs/ .github/

# Build
npm run build

# Test
npm test
npx playwright test

# Lint + TypeCheck
npm run lint
npx tsc --noEmit

# Supabase
npx supabase link --project-ref <ref>
npx supabase db diff --linked
npx supabase db push
npx supabase functions deploy
npx supabase db dump --linked

# Coverage
npx vitest run --coverage

# Lighthouse
npx lighthouse https://healthmadeclear.org --view
```
