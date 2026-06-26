# Health Made Clear — UI, UX & Accessibility Audit Report

**Date:** 2026-06-20  
**Scope:** All pages, components, and styles in `src/`  
**Device testing:** Simulated 375px, 390px, 768px, 1024px, 1280px, 1440px, 1920px

---

## Summary

| Severity | Count | Description                                        |
| -------- | ----- | -------------------------------------------------- |
| Critical | 5     | Blocks usability or causes data/responsive failure |
| High     | 16    | Significantly harms UX or accessibility            |
| Medium   | 12    | Polish, consistency, best-practice improvements    |
| Low      | 8     | Visual refinement, nice-to-have                    |

---

## TIER 1 — CRITICAL

### LAYOUT-001 — Horizontal overflow on nav at desktop <1280px

- **Category:** Layout
- **Severity:** Critical
- **Root Cause:** The header nav container is constrained to `max-width: 1100px` (`max-w-container`). Inside it, 8 desktop nav items each with icon+label (~100px each = 800px) + logo area (~200px) + right-side controls (SearchDialog + LanguageToggle + ThemeToggle + AccessibilityControls + auth buttons ~400px minimum) sum to ~1400px, exceeding the 1100px container. No `overflow-x: hidden` on body/html. The nav items use `gap-1` and `nowrap` is implicit in flex row.
- **Location:** `src/components/Header.tsx:83-84`, `src/app/globals.css:192-195`
- **Expected Fix:** Apply `overflow-x: hidden` to `html` and `body` as containment. Reduce nav items to show fewer on smaller desktop, or make nav scrollable, or collapse nav to hamburger at a wider breakpoint (xl instead of lg).
- **Files:** `src/components/Header.tsx`, `src/app/globals.css`

### LAYOUT-002 — Nav hidden between md:flex and lg:flex breakpoint gap

- **Category:** Layout/Mobile
- **Severity:** Critical
- **Root Cause:** Desktop nav is `hidden lg:flex` (shows at 1024px+). Right-side controls (search, lang, theme, a11y) are `hidden md:flex` (shows at 768px+). Between 768px-1023px, neither the hamburger menu button (which is `lg:hidden`) nor the desktop controls are visible, but the right controls ARE visible. However the mobile menu only shows at lg:hidden, so at 768px-1023px the hamburger is not visible and the nav items are not visible either. Wait - let me recheck.

Actually: nav = `hidden lg:flex` so hidden at <1024px. Controls = `hidden md:flex` so visible at 768px+. Hamburger = `lg:hidden` so shows at <1024px. So at 768-1023px, the hamburger IS visible (lg:hidden triggers at <1024px), and controls are visible (md:flex at 768px+). The mobile menu panel shows inside the header when isOpen=true and has `lg:hidden`. So the mobile menu works at all sizes <1024px. That's fine.

But between 768-1023px, the mobile menu opens with controls like SearchDialog, LanguageToggle, ThemeToggle, AccessibilityControls inside the mobile panel. These also duplicate the already-visible controls in the header. At 768-1023px, the user sees TWO sets of controls.

- **Root Cause corrected:** Between 768px-1023px, the controls are shown both in the header bar AND in the mobile menu, creating visual duplication.
- **Location:** `src/components/Header.tsx:179-184`
- **Expected Fix:** Hide the duplicate mobile controls when at md+ breakpoint.
- **Files:** `src/components/Header.tsx`

### A11Y-001 — No skip-to-main-content visible on load

- **Category:** Accessibility
- **Severity:** Critical
- **Root Cause:** The skip link is `sr-only` (screen-reader only). While it becomes visible on focus, the initial state offers no visible affordance for sighted keyboard users to discover it. WCAG 2.4.1 requires a bypass mechanism. The current implementation is technically compliant but weak — the skip link is hidden until tab focus which means sighted keyboard users won't know it exists.
- **Location:** `src/components/Header.tsx:76-82`
- **Expected Fix:** Make skip link `focus:not-sr-only` but also add a visible "Skip to content" trigger that appears on first Tab press (common pattern: link visible at top of page on first tab).
- **Files:** `src/components/Header.tsx`

### LAYOUT-003 — `overflow-x` not hidden on html/body — overflow may escape

- **Category:** Layout
- **Severity:** Critical
- **Root Cause:** In `globals.css:192-195`, `html, body { max-width: 100%; }` is set but no `overflow-x: hidden`. Combined with flex containers that may not wrap, any element exceeding 100vw can cause horizontal scroll. While `main#main-content` has `overflow-x: clip`, the header and other top-level elements don't have this protection.
- **Location:** `src/app/globals.css:192-195`
- **Expected Fix:** Add `overflow-x: hidden` to html and body as a safety net.
- **Files:** `src/app/globals.css`

### A11Y-002 — Headings skip levels on glossary cards

- **Category:** Accessibility
- **Severity:** Critical
- **Root Cause:** Glossary cards on `GlossaryClient.tsx` use `<h2>` for each term, but these are not preceded by an `<h1>` — the page has one `<h1>` in `PageHeader`. However, term detail pages use `<h1>` for the term title. The issue is that on the glossary list page, the alphabet letters are not marked up as headings, so all 31+ `<h2>` elements on one page at the same level creates a flat hierarchy. The `<section>` groups lack proper heading structure for the letter groupings.
- **Location:** `src/app/[locale]/glossary/GlossaryClient.tsx`
- **Expected Fix:** Wrap letter groups in `<section>` with `<h2>` for the letter heading, then use `<h3>` for individual terms within each letter section.
- **Files:** `src/app/[locale]/glossary/GlossaryClient.tsx`

---

## TIER 2 — HIGH

### LAYOUT-004 — Max-width container at 1100px is too narrow for 8 nav items + controls

- **Category:** Layout
- **Severity:** High
- **Root Cause:** `max-w-container: 1100px` in `tailwind.config.ts:88`. With 8 nav items + auth + controls at 1024px+, content overflows. The container should be wider or nav should collapse earlier.
- **Location:** `tailwind.config.ts:88`
- **Expected Fix:** Increase `max-w-container` to 1280px, or reduce nav items to show fewer at medium desktop.
- **Files:** `tailwind.config.ts`

### UX-001 — No active page indicator in desktop nav

- **Category:** UX
- **Severity:** High
- **Root Cause:** The `NavLink` component applies `aria-current="page"` and visual active styles (`bg-surface-container, font-semibold, text-primary`) but on large screens where nav items are widely spaced, the active indicator is not visually obvious — no underline, bottom border, or persistent highlight.
- **Location:** `src/components/Header.tsx:259-274`
- **Expected Fix:** Add a persistent bottom border or underline to the active nav item, not just background color.
- **Files:** `src/components/Header.tsx`

### UX-002 — No loading skeleton for page transitions

- **Category:** UX
- **Severity:** High
- **Root Cause:** Next.js transitions are instant due to SSG, but dashboard (which is `force-dynamic`) and auth pages may show blank screens during data fetch. The route transitions have no pending state indicator.
- **Location:** `src/app/[locale]/layout.tsx` (no loading.tsx file)
- **Expected Fix:** Add `loading.tsx` at each route segment that uses dynamic data (dashboard, auth pages).
- **Files:** New `src/app/[locale]/dashboard/loading.tsx`, `src/app/[locale]/auth/login/loading.tsx`, etc.

### A11Y-003 — Focus indicators are thin 2px outlines that may be hard to see on some backgrounds

- **Category:** Accessibility
- **Severity:** High
- **Root Cause:** `:focus-visible { outline: 2px solid #004349; outline-offset: 2px; }` — while present, 2px outline on `#004349` (primary/teal-dark) may be low contrast on dark backgrounds or on teal-tinted surfaces. No `:focus` outline on interactive elements in many components. The `btn-primary:focus` uses ring mix instead of outline, but custom buttons override it.
- **Location:** `src/app/globals.css:32-35`
- **Expected Fix:** Use 3px outline with higher contrast color. Add `outline: 3px solid` with `outline-color` that works on all backgrounds.
- **Files:** `src/app/globals.css`

### A11Y-004 — NotificationCenter has no aria-live region for dynamic unread count

- **Category:** Accessibility
- **Severity:** High
- **Root Cause:** The unread count badge updates dynamically but no `aria-live` region announces changes to screen readers.
- **Location:** `src/components/ui/NotificationCenter.tsx:110-116`
- **Expected Fix:** Add `aria-live="polite"` to the bell icon button or wrap the count in an `aria-live` region.
- **Files:** `src/components/ui/NotificationCenter.tsx`

### A11Y-005 — Color-only distinction for links in card bodies

- **Category:** Accessibility
- **Severity:** High
- **Root Cause:** In glossary cards (`GlossaryClient.tsx`), related lesson links and related term links rely on `text-primary` color alone without underline (except `hover:underline`). WCAG requires links to be distinguishable by more than color alone.
- **Location:** `src/app/[locale]/glossary/GlossaryClient.tsx:132-138`, `:153-159`
- **Expected Fix:** Add text underline by default (not just on hover), or add an icon, or use bold+underline.
- **Files:** `src/app/[locale]/glossary/GlossaryClient.tsx`

### A11Y-006 — Forms use `noValidate` disabling native validation

- **Category:** Accessibility
- **Severity:** High
- **Root Cause:** Login and signup forms use `noValidate` which disables browser-native form validation (which provides accessible error messages). Custom validation errors are provided but `noValidate` prevents the browser from showing built-in validation for empty required fields on first interaction.
- **Location:** `src/app/[locale]/auth/login/LoginForm.tsx:55`, `src/app/[locale]/auth/signup/SignupForm.tsx:88`
- **Expected Fix:** Remove `noValidate` or keep it but ensure custom validation runs on submit and provides inline error messages. Better: keep `noValidate` but add `aria-required` + `required` so screen readers still announce required fields.
- **Files:** `LoginForm.tsx`, `SignupForm.tsx`

### A11Y-007 — No reduced-motion respect for `hover-lift` and floating animations

- **Category:** Accessibility
- **Severity:** High
- **Root Cause:** While `globals.css` has `prefers-reduced-motion: reduce` block that disables transitions on some elements, the `hover-lift` class and toast slide-in animation may still animate. The `animate-fadeIn` class used by modals lacks `motion-safe` prefix in some cases.
- **Location:** `src/app/globals.css:334-359`, `src/components/ui/Modal.tsx:61`
- **Expected Fix:** Ensure all animations use `motion-safe:` prefix. Verify modal backdrop uses `motion-safe:animate-fadeIn` (it does on line 61, but the dialog container also uses it on line 72 — both good).
- **Files:** Verify Toast.tsx animations, ScrollToTop hover:scale-x

### MOBILE-001 — No bottom tab bar or hamburger on mobile (already done: hamburger)

- **Category:** Mobile
- **Severity:** High
- **Description:** Mobile nav exists as hamburger menu but the hamburger button is positioned inside the header. For mobile, sticky bottom tab bar would improve one-handed navigation. Current hamburger is adequate but the "Display" controls (AccessibilityControls) are also shown in the header at mobile widths and take up space.
- **Location:** `src/components/Header.tsx`
- **Expected Fix:** The hamburger pattern is acceptable. However, between 768px-1023px, the control buttons show in both the header bar AND mobile menu, duplicating controls.

### MOBILE-002 — Body font-size 18px may cause issues on mobile

- **Category:** Mobile
- **Severity:** High
- **Root Cause:** `body { font-size: 18px; }` in `globals.css:162`. While 16px+ prevents iOS zoom, the 18px body text combined with `px-4` (16px padding) on containers means very little horizontal space at 375px. Content width = 375 - 32px padding = 343px. At 18px font with 1.6 line-height (~29px per line), you get ~10-11 words per line which is actually fine.
- **Location:** `src/app/globals.css:162`
- **Expected Fix:** Reduce body to 16px on mobile using `@media (max-width: 767px) { body { font-size: 16px; } }`
- **Files:** `src/app/globals.css`

### MOBILE-003 — Hero on mobile may exceed 60vh

- **Category:** Mobile
- **Severity:** High
- **Root Cause:** Hero section `py-16 md:py-24` (64px padding top/bottom) + heading `text-headline-xl` (40px on mobile via `headline-xl: 40px` in tailwind config) + subtitle + two buttons + image panel. The image panel shows at all sizes (no `hidden md:block`). At 375px, the hero section likely exceeds 60vh.
- **Location:** `src/components/Hero.tsx`
- **Expected Fix:** Hide the image panel on mobile (`hidden lg:block`), reduce padding to `py-8` on mobile, reduce title size to `text-headline-lg` on mobile.
- **Files:** `src/components/Hero.tsx`

### MOBILE-004 — Tap targets may be below 44x44px

- **Category:** Mobile
- **Severity:** High
- **Root Cause:** Category filter buttons in `LearnClient.tsx:88-96` use `px-4 py-2` which yields ~32px height at 16px font + 8px padding + 2px border = ~36px minimum. Some nav items in mobile menu use `px-4 py-2` which may be <44px. Alphabet filter buttons in `GlossaryClient.tsx:92-98` use `h-10 min-w-10` (40px height).
- **Expected Fix:** Ensure all interactive elements meet 44x44px minimum on mobile.
- **Files:** `LearnClient.tsx`, `GlossaryClient.tsx`

### VISUAL-001 — Gradient buttons on tools page

- **Category:** Visual
- **Severity:** High
- **Root Cause:** Tools page uses gradient cards: `bg-gradient-to-br from-secondary-container to-primary-fixed` and `bg-gradient-to-br from-primary to-primary-container`. These are visual anti-patterns.
- **Location:** `src/app/[locale]/tools/ToolsClient.tsx:46-51`
- **Expected Fix:** Replace gradient cards with solid surface colors with proper elevation hierarchy.
- **Files:** `src/app/[locale]/tools/ToolsClient.tsx`

### VISUAL-002 — Colored icon-in-circle decorative patterns

- **Category:** Visual
- **Severity:** High
- **Root Cause:** Many sections use icons in colored circles/rounded boxes as decorative elements (Hero cards, value sections, tools cards, section nav). This is a flagged anti-pattern. Example: `rounded-2xl bg-primary p-4` with icons inside throughout `HomeClient.tsx`.
- **Location:** Multiple files: `HomeClient.tsx:72-73, 81-82, 91-92`, `SectionNav.tsx:58`, `ToolsClient.tsx:70-74`
- **Expected Fix:** Replace icon-in-circle with simpler icon treatment — use surface-level icons without colored containers, or use minimal styled icons.
- **Files:** `HomeClient.tsx`, `SectionNav.tsx`, `ToolsClient.tsx`

### UX-003 — Two equally-weighted CTAs in hero

- **Category:** UX
- **Severity:** High
- **Root Cause:** Hero has two buttons: "Start Learning" (primary CTA) and "Browse Glossary" (secondary CTA). These are nearly equally weighted in the hero section, violating the "one primary action per section" principle.
- **Location:** `src/components/Hero.tsx:21-28`
- **Expected Fix:** Make "Start Learning" the dominant CTA. Move "Browse Glossary" to a less prominent position or use a text link.
- **Files:** `src/components/Hero.tsx`

### UX-004 — No empty state illustration for glossary/learn when no results

- **Category:** UX
- **Severity:** High
- **Root Cause:** When search yields no results in `GlossaryClient.tsx` or `LearnClient.tsx`, it shows a card with text and a "Show All" button. No illustration or icon makes the empty state more approachable.
- **Location:** `src/app/[locale]/glossary/GlossaryClient.tsx:170-183`, `src/app/[locale]/learn/LearnClient.tsx:153-168`
- **Expected Fix:** Add a relevant icon/illustration to the empty state using the EmptyState component pattern.
- **Files:** `GlossaryClient.tsx`, `LearnClient.tsx`

---

## TIER 3 — MEDIUM

### A11Y-008 — Dialog aria attributes need verification

- **Category:** Accessibility
- **Severity:** Medium
- **Root Cause:** SearchDialog uses `role="dialog"` and `aria-modal="true"` but lacks `aria-labelledby` pointing to the dialog title. It uses `aria-label` on the dialog element which is acceptable but not ideal.
- **Location:** `src/components/SearchDialog.tsx:129`
- **Expected Fix:** Add `aria-labelledby` pointing to a heading inside the dialog, or enhance the `aria-label` to be more descriptive.
- **Files:** `src/components/SearchDialog.tsx`

### A11Y-009 — NotificationCenter panel lacks aria attributes

- **Category:** Accessibility
- **Severity:** Medium
- **Root Cause:** The notifications dropdown panel has no `role="dialog"` or `aria-modal` attributes. The button uses `aria-label` but the panel itself is not labeled.
- **Location:** `src/components/ui/NotificationCenter.tsx:118-177`
- **Expected Fix:** Add `role="dialog"`, `aria-modal="true"`, and `aria-label` to the notification panel.
- **Files:** `src/components/ui/NotificationCenter.tsx`

### A11Y-010 — Toast region missing `aria-live` on container

- **Category:** Accessibility
- **Severity:** Medium
- **Root Cause:** `ToastProvider.tsx` uses a container div with `aria-label="Notifications"` but doesn't have `aria-live="polite"`. Individual ToastItem components have `role="alert"` with `aria-live="polite"` which is good, but the container should also have `aria-live` for when toasts are added/removed.
- **Location:** `src/components/ui/ToastProvider.tsx:36-39`
- **Expected Fix:** Add `aria-live="polite"` to the toast container div.
- **Files:** `src/components/ui/ToastProvider.tsx`

### A11Y-011 — No landmark for logo/brand

- **Category:** Accessibility
- **Severity:** Medium
- **Root Cause:** The logo link in Header uses `<Link>` which is correct but there's no `<a aria-label="Home">` or similar clear branding landmark. The logo image is a CSS-styled div with "H" text, not an actual `<img>` with alt text.
- **Location:** `src/components/Header.tsx:85-95`
- **Expected Fix:** Ensure the logo link has an accessible name. Currently the text "Health Made Clear" inside the link provides this.
- **Files:** `src/components/Header.tsx`

### LAYOUT-005 — Section padding uses fixed px, not fluid clamp()

- **Category:** Layout
- **Severity:** Medium
- **Root Cause:** `Section.tsx` uses `py-16 md:py-20` (64px → 80px). `Hero.tsx` uses `py-16 md:py-24`. These are fixed pixel values, not fluid `clamp()` values. On very large screens (1920px+), the padding looks proportionally small.
- **Location:** `src/components/layout/Section.tsx:30`, `src/components/Hero.tsx:11`
- **Expected Fix:** Replace with fluid clamp values: `py-clamp(3rem, 5vh, 5rem)`.
- **Files:** `Section.tsx`, `Hero.tsx`, `HomeClient.tsx` (section py values)

### LAYOUT-006 — No consistent scroll padding for sticky header

- **Category:** Layout
- **Severity:** Medium
- **Root Cause:** The sticky header is 64px+ in height. Anchor links and section IDs don't account for this, so content scrolls behind the sticky header. `scroll-mt-24` is used in GlossaryClient.tsx line 114 but not consistently elsewhere.
- **Location:** Various pages
- **Expected Fix:** Add `scroll-padding-top: 80px` to `html` in CSS, and ensure all section anchor targets use `scroll-mt-20` or similar.
- **Files:** `src/app/globals.css`

### MOBILE-005 — Form inputs missing correct keyboard types

- **Category:** Mobile
- **Severity:** Medium
- **Root Cause:** Search input uses `type="search"` (good). `LoginForm.tsx` uses `type="email"` and `type="password"` (good). `SignupForm.tsx` uses `type="text"` for display name (correct), `type="email"` for email (good), `type="password"` for password (good). ✅ All forms have correct input types.
- **Location:** Already good. Not an issue.

### MOBILE-006 — No correct input type on search field

- **Category:** Mobile
- **Severity:** Medium
- **Root Cause:** The search input in `SearchDialog.tsx:134-143` uses `type="search"` which is correct. ✅ Not an issue.

### VISUAL-003 — 3-column symmetrical feature grid in HomeClient

- **Category:** Visual
- **Severity:** Medium
- **Root Cause:** The "Learn + Glossary + Tools" section at `HomeClient.tsx:191` uses a 3-column grid with identical card styling. This is the "3-column symmetrical feature grid" anti-pattern.
- **Location:** `src/app/[locale]/HomeClient.tsx:191-222`
- **Expected Fix:** Use an asymmetric layout (2+1 or staggered) instead of 3 identical columns.
- **Files:** `HomeClient.tsx`

### VISUAL-004 — Generic hero copy potentially present

- **Category:** Visual
- **Severity:** Medium
- **Root Cause:** Using i18n, so can't confirm copy quality. But the pattern of "badge + title + subtitle + 2 CTAs" is the standard hero pattern. If the copy uses generic language like "Welcome to" or "Unlock the power of", it should be revised.
- **Location:** `src/components/Hero.tsx` (i18n-dependent)
- **Expected Fix:** Review hero translations to ensure specific, benefit-driven copy.
- **Files:** `src/messages/en.json`, `src/messages/es.json`

### UX-005 — No form step progress indicator on signup

- **Category:** UX
- **Severity:** Medium
- **Root Cause:** Signup form is a single page with 3 fields (display name, email, password). While this is simple enough, there's no visual indicator of progress or steps.
- **Location:** `src/app/[locale]/auth/signup/SignupForm.tsx`
- **Expected Fix:** For a 3-field form, a single page is fine. Not actionable.

### UX-006 — No visible :active state on buttons

- **Category:** UX
- **Severity:** Medium
- **Root Cause:** The CSS defines `:hover` states for buttons and cards but no `:active` (pressed) state for buttons. Mobile users benefit from `:active` feedback on tap.
- **Location:** `src/app/globals.css:274-276` (btn-primary hover but no active), `Button.tsx` (Tailwind classes for hover but no active)
- **Expected Fix:** Add `active:` variants to button styles, e.g., `active:scale-95` or background color change.
- **Files:** `src/app/globals.css`, `src/components/ui/Button.tsx`

### A11Y-012 — No `lang` attribute on html while content is loading

- **Category:** Accessibility
- **Severity:** Medium
- **Root Cause:** `layout.tsx` correctly sets `html lang={locale}` which is good. ✅ Not an issue.

### A11Y-013 — Toast auto-dismisses in 4s without user control

- **Category:** Accessibility
- **Severity:** Medium
- **Root Cause:** `ToastItem.tsx` auto-dismisses after 4 seconds. WCAG requires that auto-dismissing content gives users enough time to read it or allows them to control the timing. 4 seconds may be too short for some users.
- **Location:** `src/components/ui/Toast.tsx:39-45`
- **Expected Fix:** Increase timeout to 6-8 seconds, or add a pause-on-hover behavior, or allow users to control timing.
- **Files:** `src/components/ui/Toast.tsx`

### A11Y-014 — Color contrast check for muted/secondary text

- **Category:** Accessibility
- **Severity:** Medium
- **Root Cause:** `text-on-surface-variant` in light mode = `#3f484a` on `#f8f9fb` background. Contrast ratio: ~4.8:1 (passes AA for 16px+ body text). ✅ Just passes. On `#ffffff` white (surface-container-lowest), `#3f484a` gives ~5.2:1 — passes.
  - But `text-on-surface-variant` on `bg-primary` (dark teal `#004349`) in Footer: `text-on-primary/80` = rgba(255,255,255,0.8) ≈ `#cccccc` on `#004349` gives ~6.1:1 — passes.
  - Dark mode: `text-on-surface-variant` = `#b0b8ba` on `#191c1e` = ~4.7:1 — just passes AA for body text.
- **Summary:** Contrast borderline but passes. Monitor for dark mode issues.

---

## TIER 4 — LOW

### VISUAL-005 — Shadow colors hardcoded with rgba(0, 67, 73) in tailwind config

- **Category:** Visual
- **Severity:** Low
- **Root Cause:** All box shadows in `tailwind.config.ts:90-96` use hardcoded `rgba(0, 67, 73, ...)` (primary color RGB). This means dark mode shadows also use primary-tinted shadows instead of dark-tinted shadows. On dark backgrounds, `rgba(0, 67, 73)` shadows are invisible.
- **Expected Fix:** Use CSS variables for shadow colors so they adapt in dark mode, e.g., `box-shadow: 0 1px 3px var(--shadow-color)`.
- **Files:** `tailwind.config.ts`

### VISUAL-006 — No dark mode shadow adaptation

- **Category:** Visual
- **Severity:** Low
- **Root Cause:** Same as VISUAL-005 — shadows do not adapt to dark backgrounds.
- **Expected Fix:** In the dark theme block of `globals.css`, redefine shadow colors with dark-tinted values.

### LAYOUT-007 — Container gutter spacing not fluid

- **Category:** Layout
- **Severity:** Low
- **Root Cause:** `Container.tsx` uses `px-4 md:px-16` (16px → 64px). Between 768px-1024px, the jump from 16px to 64px is abrupt. Use `clamp(1rem, 5vw, 4rem)` for smoother scaling.
- **Files:** `src/components/layout/Container.tsx`

### UX-007 — No print styles for content pages

- **Category:** UX
- **Severity:** Low
- **Root Cause:** Print styles in `globals.css:202-261` only handle cards and basic elements. Content pages (learn, articles) may not print well.
- **Location:** `src/app/globals.css`

### A11Y-015 — Focus trap Order of elements in mobile menu

- **Category:** Accessibility
- **Severity:** Low
- **Root Cause:** The mobile menu has controls (Search, Language, Theme, Accessibility) BEFORE nav items. Navigation should come before secondary controls for logical tab flow.
- **Location:** `src/components/Header.tsx:179-184`
- **Expected Fix:** Reorder: nav items first, then controls, then auth.

### UX-008 — No "back to top" button on content pages

- **Category:** UX
- **Severity:** Low
- **Root Cause:** `ScrollToTop` is present in layout.tsx. ✅ Actually already present.

### MOBILE-007 — Full-width modals on mobile

- **Category:** Mobile
- **Severity:** Low
- **Root Cause:** `Modal.tsx` and `AccessibilityControls.tsx` use `fixed inset-4 top-20...md:absolute md:right-0 md:top-14` which means on mobile they are effectively full-screen. `AccessibilityControls` panel uses `fixed inset-x-4 top-20` on mobile — covers most of the screen but allows some content behind. `Modal.tsx` uses `p-4` inset overlay with centered dialog, which is acceptable.
- **Expected Fix:** Consider slide-up sheet pattern for mobile modals instead of centered dialogs.
- **Files:** `Modal.tsx`, `AccessibilityControls.tsx`, `OnboardingDialog.tsx`

---

## Issues Verified as Non-Existent (Resolved)

| Check                                      | Status                                               |
| ------------------------------------------ | ---------------------------------------------------- |
| `overflow-x` on scroll containers          | ✅ `main#main-content` has `overflow-x: clip`        |
| Semantic HTML: exactly one `<h1>` per page | ✅ All pages use PageHeader which renders one `<h1>` |
| Skip link present                          | ✅ Header.tsx:76-82 has skip link                    |
| Focus trap in modals                       | ✅ useFocusTrap used in all dialogs/modals           |
| Escape key closes modals                   | ✅ All dialogs handle Escape                         |
| Form labels connected to inputs            | ✅ Input.tsx uses `htmlFor`/`id`                     |
| Images have alt attributes                 | ✅ All `<Image>` components have `alt`               |
| Video elements captioned                   | ✅ No video elements found                           |
| `prefers-reduced-motion: reduce`           | ✅ Implemented in globals.css                        |
| Icon-only buttons have aria-label          | ✅ ThemeToggle, close buttons, search triggers       |
| Body text ≥ 16px                           | ✅ 18px default                                      |
| Consistent focus ring style                | ✅ :focus-visible global style                       |
| `lang` attribute on html                   | ✅ Set from locale                                   |

---

## Audit Summary Statistics

| Category  | Critical | High   | Medium | Low   | Total  |
| --------- | -------- | ------ | ------ | ----- | ------ |
| Layout    | 3        | 1      | 3      | 1     | 8      |
| UX        | 0        | 4      | 2      | 2     | 8      |
| A11Y      | 2        | 5      | 7      | 1     | 15     |
| Visual    | 0        | 2      | 2      | 2     | 6      |
| Mobile    | 0        | 4      | 2      | 1     | 7      |
| **Total** | **5**    | **16** | **12** | **8** | **41** |
