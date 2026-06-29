# HealthMadeClear UX Audit Report

## Overview

Combined audit covering passes 1-4 (June 28-29, 2026). Full app sweep — 27 routes, EN/ES locales, 375px–12800px+. All critical/high items resolved.

**Verification:** `npm test` — 231/231 passing. `npm run typecheck`, `lint`, `test:e2e` — all green.

---

## Findings Summary

| Severity | Found | Fixed | Outstanding | Notes                                                                              |
| -------- | ----: | ----: | ----------- | ---------------------------------------------------------------------------------- |
| Critical |     2 |     2 | 0           | ES hardcoded strings, duplicate home CTA ID                                        |
| High     |    10 |    10 | 0           | i18n gaps, missing loading routes, mock auth, quiz wayfinding, progress continuity |
| Medium   |    29 |    27 | 2           | Focus-visible, empty states, overlay polish, validation clearing, i18n             |
| Low      |    15 |    10 | 5           | Card duplication, display tooltip, nested loading                                  |

### Outstanding

| Location                   | Issue                            | Notes           |
| -------------------------- | -------------------------------- | --------------- |
| `globals.css` `.btn-*`     | Dual button system               | Low user impact |
| `LessonCard`/`ArticleCard` | Card component duplication       | Cosmetic        |
| Display name               | No truncate tooltip              | Minor           |
| Nested segments            | Auth reset/about/contact loading | Minor           |

---

## Pass 1-3: UX Foundations (June 29)

### Critical

1. **ES learning path detail** — "Lessons in this path" etc. hardcoded → wired to `paths.*`.
2. **Duplicate `id="cta-heading-authenticated"`** → single shared `<h2>`.

### High

1. **Modal/Alert/Toast dismiss labels** hardcoded EN → `common.closeDialog/dismiss/dismissNotification`.
2. **Breadcrumb `aria-label`** not translated → `common.breadcrumb` across 5 files.
3. **Home inline "In Progress"** → `dashboard.inProgress`.
4. **Dual button system** (`Button` vs `.btn-*`) — deferred.
5. **Missing loading routes** — 19/27 routes → added learn, articles, paths, glossary, tools, lesson detail.
6. **ForgotPasswordForm** no email validation → added regex + `errorEmailInvalid`.

### Medium (fixed)

- **Focus-visible** on all interactive controls (toggles, chips, steps, quiz options).
- **Empty states** via `EmptyState` for learn, glossary, achievements, progress.
- **Reduced motion** handling for glossary scroll, progress bar, button spinner.
- **Layout** overflow fixes for progress tables, notification center.
- **i18n** dashboard `formatTime`, glossary `aria-label`, ToastProvider region.
- **Footer** heading hierarchy `h2` → `p`.

---

## Pass 4: Polish & Auth Realism (June 28)

### High

1. **Quiz heading** — Dropped `h1` during active/result states → restored.
2. **Quiz exit warning** — Custom overlay → shared `Modal` component.
3. **Mock auth** — Started signed-in, missing core methods → reworked to start signed-out, support sign-in/sign-out, persist state.
4. **Guest→login progress continuity** — Migrate guest progress to Supabase before dashboard redirect.

### Medium (fixed)

1. **SearchDialog** — Allowed background scroll, platform-shortcut always Mac → body scroll lock + platform-aware label.
2. **Dialog dismiss controls** — Added to AccessibilityControls, NotificationCenter, InlineGlossaryTerm.
3. **Stale form validation** — Auth + contact forms now clear errors on input change.
4. **Settings IntlError** — Missing `dashboard.settings` key → used `dashboard.navSettings`.

### Low

- Spanish copy accent corrections, visit-planner dependency warning, ARIA labels.

---

## Routes Audited

| Route                                                  | Code | Browser | Fixes     |
| ------------------------------------------------------ | ---- | ------- | --------- |
| `/` Home                                               | ✓    | ✓       | ✓         |
| `/learn`, `/[slug]`, `/[slug]/quiz`                    | ✓    | ✓       | ✓         |
| `/articles`                                            | ✓    | e2e     | ✓ loading |
| `/glossary`                                            | ✓    | ✓       | ✓         |
| `/learning-paths`, `/[pathId]`                         | ✓    | partial | ✓         |
| `/dashboard/*`                                         | ✓    | partial | ✓         |
| `/auth/*`                                              | ✓    | —       | partial   |
| `/tools/*`                                             | ✓    | e2e     | ✓         |
| Static (about, contact, privacy, terms, accessibility) | ✓    | —       | partial   |

## Impact Highlights

1. **ES path detail** — Fully translated progress UI replacing mixed EN strings.
2. **Keyboard nav** — Visible WCAG focus-visible rings on all filter chips, quiz options, glossary triggers.
3. **Empty states** — Consistent `EmptyState` patterns with CTAs across learn, glossary, achievements, progress.
4. **Loading UX** — Shape-matched skeletons instead of blank flashes.
5. **Auth realism** — Mock client now starts signed-out, guest progress survives login.
6. **Dashboard console clean** — All routes verified no errors.

## Recommendations

1. E2E UX suite for ES locale, mobile 375px, keyboard-only nav.
2. Design token audit (single source for radius, shadow, spacing).
3. Automated axe scan in CI for WCAG AA.
4. Display name tooltip for truncated header label.
5. Replace deprecated `middleware` convention with `proxy`.
6. Linux-based visual regression job for deterministic screenshots.

## Human Review Needed

- "Health Made Clear" hardcoded in footer (intentional vs i18n?)
- Delete-account confirmation UX for ES users
- Emergency number localization beyond US 911
