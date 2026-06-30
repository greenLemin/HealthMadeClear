# HealthMadeClear UX Audit Report

## Overview

Combined audit covering passes 1–7 (June 28–29, 2026). Full app sweep — 27 routes, EN/ES locales, 375px–1280px+. All audit items resolved.

**Verification (Pass 6):** `npm test` — 234/234 passing. `npm run typecheck`, `test:e2e` (49 non-visual specs) — all green.

**Verification (Pass 7):** Optional polish items resolved — display name tooltip, shared loading skeletons.

---

## Pass 7: Optional Polish (June 29)

### Display name truncate tooltip

- Added `TruncatedText` component — sets native `title` only when text is actually truncated (via `ResizeObserver`)
- Applied in `Header` (desktop user chip + mobile menu) and `DashboardSidebar` (display name + email)

### Shared loading skeletons

- Added `StaticPageLoading` for static content pages (about, contact, privacy, terms, accessibility)
- Added `AuthFormLoading` with `split` / `narrow` / `compact` variants for auth routes
- Replaced duplicated inline skeleton markup in 9 nested `loading.tsx` files

### Remaining optional polish

None — all audit items resolved.

---

## Findings Summary

| Severity | Found | Fixed | Outstanding | Notes                                                                  |
| -------- | ----: | ----: | ----------- | ---------------------------------------------------------------------- |
| Critical |     2 |     2 | 0           | ES hardcoded strings, duplicate home CTA ID                            |
| High     |    13 |    13 | 0           | i18n gaps, loading routes, mock auth, SaveProgressBanner, rate_limited |
| Medium   |    36 |    34 | 2           | Focus-visible, empty states, overlay polish, validation clearing       |
| Low      |    16 |    16 | 0           | Display name tooltip, shared loading skeletons                         |

---

## Pass 6: Deferred Item Resolution (June 29)

### Unified button system

- Added `buttonStyles.ts` with shared `getButtonClasses()` used by `Button` and `ButtonLink`
- Created `ButtonLink` for i18n-aware navigation buttons
- Migrated all 50+ `btn-primary` / `btn-secondary` class usages across 19 components to `Button`, `ButtonLink`, or `getButtonClasses()` (for `tel:` and root not-found edge cases)
- CSS `.btn-primary` / `.btn-secondary` retained as the single styling source in `globals.css`

### Card consolidation

- Extended `Card` component with generic `as` prop forwarding (supports `Card as={Link}`)
- Created shared `ResourceCard` used by `LessonCard` and `ArticleCard`
- Migrated legacy `.card` / `.card-hover` usages in glossary, quiz results, lesson related, and not-found pages
- Removed `.card` and `.card-hover` from `globals.css`

### Visit planner i18n

- Moved ~70 lines of inline EN/ES copy from `VisitPlannerClient.tsx` to `tools.visitPlanner` namespace in message files
- Uses ICU plurals for count strings (`selectedCount`, `suggestedCount`, `customCount`)

---

## Pass 5: Re-Audit & Polish (June 29)

Fresh codebase sweep identified remaining i18n, a11y, and dead-component gaps from passes 1–4.

### High (fixed)

1. **`rate_limited` login error silent** — Auth callback/confirm redirect with `?error=rate_limited` showed no message. Added `auth.errorRateLimited` and wired in `LoginForm.tsx`.
2. **`SaveProgressBanner` never mounted** — Component existed but was not rendered. Added to locale layout below `NetworkStatusBanner` so guests with progress see a save prompt.
3. **Hardcoded English duration on ES dashboard** — `formatTime()` used `"min"`, `"h"`, `"m"` literals. Extracted shared `formatDuration()` in `lib/i18n.ts`; used in `DashboardClient` and `progress-client`.

### Medium (fixed)

1. **Breadcrumb `aria-label` not i18n** — `PageHeader` and `LessonPageClient` used hardcoded `"Breadcrumb"`. `PageHeader` now uses `common.breadcrumb`; lesson page updated.
2. **`.toLowerCase()` on translated strings** — Broke Spanish capitalization in achievements and visit checklist. Removed; added `common.itemsCompletedCount` for checklist progress copy.
3. **Home featured path progress aria** — Hardcoded English `"progress"`. Uses `paths.progressForPath`.
4. **Home `exploreLabel` inline** — Replaced with `sectionNav.explore`.
5. **Progress page category labels** — Inline EN/ES object replaced with `progress.categoriesCount` and `progress.trackedAreasCount`.
6. **ProgressBar fallback aria** — English `"Progress: X%"` replaced with `common.progressPercent`.
7. **Notification date formatting** — `toLocaleDateString()` without locale. Now passes app locale.
8. **Contact honeypot label** — Hardcoded English. Added `contact.honeypotLabel` (EN/ES).
9. **SearchDialog keyboard hints** — Hardcoded `ESC`, `⌘K`, `Ctrl K`. Added `search.escapeKey`, `search.shortcutMac`, `search.shortcutWindows`.
10. **Dashboard default display name** — Server layout used hardcoded `"User"`. Uses `dashboard.defaultUser` via `getTranslations`.
11. **ScrollToTop vs dashboard mobile nav overlap** — Scroll button now uses `bottom-20` on dashboard routes (mobile bottom nav clearance).
12. **OnboardingDialog focus & overlap** — Added `useFocusTrap`; moved panel to bottom-left to avoid ScrollToTop collision.

### Low (fixed)

1. **Dead duplicate `layout/PageHeader.tsx`** — Removed unused file.

---

## Pass 1–4 Summary (prior work)

### Critical

1. ES learning path detail hardcoded strings → wired to `paths.*`.
2. Duplicate `id="cta-heading-authenticated"` → single shared `<h2>`.

### High

- Modal/Alert/Toast dismiss labels i18n
- Breadcrumb aria across pages
- Missing loading routes (19 added)
- ForgotPasswordForm email validation
- Quiz heading during active/result states
- Quiz exit warning → shared Modal
- Mock auth realism + guest progress continuity

### Medium

- Focus-visible on all interactive controls
- EmptyState patterns for learn, glossary, achievements, progress
- Reduced motion handling
- Layout overflow fixes
- Form validation clearing on input change
- SearchDialog scroll lock + platform-aware shortcut label

---

## Routes Audited

| Route                               | Code | Browser/e2e | Pass 5 fixes                                    |
| ----------------------------------- | ---- | ----------- | ----------------------------------------------- |
| `/` Home                            | ✓    | ✓           | explore label, path progress aria               |
| `/learn`, `/[slug]`, `/[slug]/quiz` | ✓    | ✓           | breadcrumb aria                                 |
| `/articles`, `/articles/[slug]`     | ✓    | ✓           | —                                               |
| `/glossary`, `/glossary/[term]`     | ✓    | ✓           | —                                               |
| `/learning-paths`, `/[pathId]`      | ✓    | ✓           | —                                               |
| `/dashboard/*`                      | ✓    | ✓           | formatDuration, layout defaultUser, ScrollToTop |
| `/auth/*`                           | ✓    | ✓           | rate_limited error, SaveProgressBanner context  |
| `/tools/*`                          | ✓    | ✓           | checklist completed copy                        |
| Static pages                        | ✓    | ✓           | contact honeypot                                |

---

## Impact Highlights

1. **Guest save prompt** — Users who complete lessons anonymously now see a dismissible banner prompting account creation.
2. **Auth rate-limit clarity** — Rate-limited sign-in attempts show a calm, actionable message instead of a blank form.
3. **ES dashboard polish** — Time spent and progress labels fully localized.
4. **Keyboard/a11y consistency** — Breadcrumb nav, progress bars, and search hints respect locale.
5. **Mobile dashboard** — Scroll-to-top no longer overlaps bottom navigation.

---

## Recommendations (future)

1. Migrate `VisitPlannerClient` inline copy to `tools` message namespace.
2. Consolidate `Button` component and `.btn-*` utilities into one system.
3. Unify `Card`, `surface-card`, and legacy `.card` styles.
4. Automated axe scan in CI for WCAG AA regression detection.
5. E2E suite for ES locale at 375px with keyboard-only navigation.
6. Display name tooltip for truncated header label.

---

## Human Review Needed

- "Health Made Clear" hardcoded in footer/onboarding (intentional brand vs i18n?)
- Delete-account confirmation UX for ES users
- Emergency number localization beyond US 911
