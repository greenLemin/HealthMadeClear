# Health Made Clear — UI/UX/Accessibility Remediation Plan

**Date:** 2026-06-20  
**Based on audit:** `AUDIT_REPORT.md`  
**Total issues:** 41 (5 Critical, 16 High, 12 Medium, 8 Low)

---

## TIER 1 — CRITICAL FIXES (Blocks Usability)

---

### LAYOUT-001 — Horizontal overflow on nav at desktop <1280px

**Severity:** Critical | **Category:** Layout

**Root Cause:** 8 nav items + right-side controls exceed 1100px container.

**Fix:**

```css
/* src/app/globals.css — add overflow containment */
html,
body {
  max-width: 100%;
  overflow-x: hidden;
}
```

```tsx
// src/components/Header.tsx — reduce nav items shown at lg breakpoint
// Collapse to hamburger at lg (1024px) instead of hiding some items
// Change: nav hidden lg:flex → nav hidden xl:flex (hide fewer items)
// Or: keep lg but show abbreviated nav

// Option A (recommended): Move to xl breakpoint for full desktop nav
// Change line 97:
<nav className="hidden items-center gap-1 xl:flex" aria-label={t("mainNavigation")}>

// Change line 160 hamburger:
className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-outline-variant p-2.5 text-primary xl:hidden"
```

**Files:** `src/app/globals.css:192-195`, `src/components/Header.tsx:97,160`

**Acceptance:** No horizontal scroll at 1024px-1920px. Verified in Chrome DevTools.

---

### LAYOUT-002 — Control duplication between 768px-1023px

**Severity:** Critical | **Category:** Layout/Mobile

**Root Cause:** Mobile menu shows controls (SearchDialog, LanguageToggle, ThemeToggle, AccessibilityControls) inside the panel at `md:hidden` but they're also shown in the header at `md:flex`.

**Fix:**

```tsx
// src/components/Header.tsx line 179 — Add md:hidden to mobile controls
<div className="mb-4 space-y-3 md:hidden">
  <SearchDialog />
  <LanguageToggle />
  <ThemeToggle />
  <AccessibilityControls />
</div>
```

**Files:** `src/components/Header.tsx:179`

**Acceptance:** At 768px+, no duplicate controls shown. At <768px, controls only in mobile menu.

---

### LAYOUT-003 — No overflow-x hidden on html/body

**Severity:** Critical | **Category:** Layout

**Root Cause:** Missing `overflow-x: hidden` on html/body allows content overflow to create horizontal scrollbars.

**Fix:**

```css
html,
body {
  max-width: 100%;
  overflow-x: hidden;
}
```

**Files:** `src/app/globals.css:192-195`

**Acceptance:** Any element exceeding 100vw does not create horizontal scrollbar.

---

### A11Y-001 — Skip link not discoverable for sighted keyboard users

**Severity:** Critical | **Category:** Accessibility

**Root Cause:** Skip link is `sr-only` until focused. Sighted keyboard users don't know it exists.

**Fix:**

```tsx
// src/components/Header.tsx — enhance skip link
<a
  href="#main-content"
  onClick={handleSkip}
  className="fixed -top-20 left-4 z-[60] rounded-lg bg-primary px-4 py-3 text-on-primary shadow-elevation-2 transition-all focus:top-4 focus:outline-none focus:ring-2 focus:ring-on-primary"
>
  {t("skipToContent")}
</a>
```

This keeps it hidden off-screen (-top-20) until focused, then slides in. Much more discoverable.

**Files:** `src/components/Header.tsx:76-82`

**Acceptance:** On first Tab press, skip link is visible at top of page. Screen readers can still access it.

---

### A11Y-002 — Heading level skip in glossary (flat h2 structure)

**Severity:** Critical | **Category:** Accessibility

**Root Cause:** 31+ `<h2>` elements at same level without hierarchical grouping.

**Fix:**

```tsx
// src/app/[locale]/glossary/GlossaryClient.tsx — restructure with letter sections
// Before: flat <h2> for each term
// After: Group by letter, render <h2> for letter, <h3> for terms

// In the filteredTerms map, group by first letter first:
const groupedTerms = useMemo(() => {
  const groups: Record<string, typeof filteredTerms> = {};
  filteredTerms.forEach((term) => {
    const letter = activeLetter !== "All" ? activeLetter : term.normalized;
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(term);
  });
  return groups;
}, [filteredTerms, activeLetter]);

// Then render:
{
  Object.entries(groupedTerms).map(([letter, terms]) => (
    <section key={letter} aria-labelledby={`letter-${letter}`}>
      <h2 id={`letter-${letter}`} className="mb-4 text-headline-md text-primary">
        {letter}
      </h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {terms.map((term) => (
          <article key={term.id} id={term.id} className="card scroll-mt-24">
            <h3 className="mb-4 text-headline-md text-primary">
              <Link href={`/glossary/${term.id}`} className="hover:underline">
                {term.term}
              </Link>
            </h3>
            ...
          </article>
        ))}
      </div>
    </section>
  ));
}
```

**Files:** `src/app/[locale]/glossary/GlossaryClient.tsx`

**Acceptance:** Screen readers navigate glossary with proper heading hierarchy (h1 → h2 letter → h3 term).

---

## TIER 2 — HIGH PRIORITY (Functional UX/Accessibility)

---

### LAYOUT-004 — Container too narrow at 1100px

**Severity:** High | **Category:** Layout

**Fix:** Increase `max-container` to 1280px in tailwind config:

```ts
// tailwind.config.ts
maxWidth: {
  container: "1280px",
}
```

**Files:** `tailwind.config.ts:88`

---

### UX-001 — Weak active page indicator in desktop nav

**Severity:** High | **Category:** UX

**Fix:**

```tsx
// src/components/Header.tsx — NavLink component, add bottom border to active
className={
  active
    ? "flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-body-md font-semibold text-primary border-b-2 border-primary"
    : "flex items-center gap-2 rounded-lg px-4 py-2 text-body-md font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
}
```

**Files:** `src/components/Header.tsx:259-274`

---

### UX-002 — No loading states for dynamic route transitions

**Severity:** High | **Category:** UX

**Fix:** Add `loading.tsx` files for dynamic route segments:

```tsx
// src/app/[locale]/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="max-w-container mx-auto px-4 py-16 md:px-6">
      <div className="space-y-8 animate-pulse" aria-hidden="true">
        <div className="h-8 w-64 rounded bg-surface-container-high" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-surface-container-high" />
          ))}
        </div>
        <div className="h-40 rounded-2xl bg-surface-container-high" />
      </div>
    </div>
  );
}
```

**Files:** New: `src/app/[locale]/dashboard/loading.tsx`, `src/app/[locale]/auth/login/loading.tsx`, `src/app/[locale]/auth/signup/loading.tsx`

---

### A11Y-003 — Focus indicators too thin (2px)

**Severity:** High | **Category:** Accessibility

**Fix:**

```css
/* src/app/globals.css:32-35 */
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Ensure dark mode focus is visible */
:root[data-theme="dark"] :focus-visible {
  outline-color: var(--color-primary-fixed);
}
```

**Files:** `src/app/globals.css:32-35`

---

### A11Y-004 — NotificationCenter no aria-live for dynamic count

**Severity:** High | **Category:** Accessibility

**Fix:**

```tsx
// src/components/ui/NotificationCenter.tsx — add aria-live to bell button
<button
  ref={buttonRef}
  type="button"
  onClick={() => setIsOpen(!isOpen)}
  className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
  aria-label={t("ariaLabel", { count: unreadCount })}
>
  <span className="sr-only" aria-live="polite">
    {unreadCount > 0 ? `${unreadCount} unread notifications` : "No unread notifications"}
  </span>
  {unreadCount > 0 ? <BellDot size={20} /> : <Bell size={20} />}
  ...
</button>
```

**Files:** `src/components/ui/NotificationCenter.tsx:103-116`

---

### A11Y-005 — Links not distinguishable by color alone

**Severity:** High | **Category:** Accessibility

**Fix:**

```tsx
// src/app/[locale]/glossary/GlossaryClient.tsx:132-138
// Add default underline (not just hover)
<Link
  key={lessonId}
  href={`/learn/${lessonId}`}
  className="text-label-md font-semibold text-primary underline underline-offset-2 hover:underline"
>
  {lesson.title}
</Link>
```

**Files:** `src/app/[locale]/glossary/GlossaryClient.tsx:132-138, 153-159`

---

### A11Y-006 — Forms use noValidate

**Severity:** High | **Category:** Accessibility

**Fix:** Keep `noValidate` but implement proper inline validation:

```tsx
// LoginForm.tsx — add client-side validation before submit
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");

  // Client-side validation
  if (!email.trim()) {
    setError(t("emailRequired"));
    return;
  }
  if (!password) {
    setError(t("passwordRequired"));
    return;
  }

  setLoading(true);
  // ... rest of auth logic
}
```

**Files:** `LoginForm.tsx:31-52`, `SignupForm.tsx:32-63`

---

### A11Y-007 — Reduced motion edge cases

**Severity:** High | **Category:** Accessibility

**Verify:**

```css
/* Toast.tsx animations */
.motion-safe:translate-x-0 /* ensure motion-safe prefix on all animations */

/* ScrollToTop hover:scale-110 should respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .scroll-to-top {
    transform: none !important;
  }
}
```

**Files:** `src/components/ui/Toast.tsx:54`, `src/components/ScrollToTop.tsx:25`

---

### MOBILE-001 — Control duplication on tablet (768-1023px)

**Severity:** High | **Category:** Mobile

**Fix:** Same as LAYOUT-002. Already covered.

---

### MOBILE-002 — Body font-size 18px too large on mobile

**Severity:** High | **Category:** Mobile

**Fix:**

```css
/* src/app/globals.css — add mobile font-size reduction */
body {
  font-size: 18px;
  line-height: 1.6;
}

@media (max-width: 767px) {
  body {
    font-size: 16px;
  }
}
```

**Files:** `src/app/globals.css:162-166`

---

### MOBILE-003 — Hero exceeds 60vh on mobile

**Severity:** High | **Category:** Mobile

**Fix:**

```tsx
// src/components/Hero.tsx — hide image panel on mobile, reduce padding
<section className="hero-gradient relative overflow-hidden py-8 md:py-24">
  ...
  <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
    <div className="max-w-3xl">
      ...
    </div>

    {/* Hide image panel on mobile */}
    <div className="hidden lg:block overflow-hidden rounded-lg border border-outline-variant bg-surface/85 shadow-elevation-2 backdrop-blur-sm">
      ...
    </div>
  </div>
```

**Files:** `src/components/Hero.tsx`

---

### MOBILE-004 — Tap targets <44px

**Severity:** High | **Category:** Mobile

**Fix:** Ensure all interactive elements are at least 44x44px:

```tsx
// LearnClient.tsx filter buttons — increase to min-h-11
// Change py-2 to py-3 for minimum 44px height
className={
  activeCategory === category.id
    ? "rounded-full bg-secondary-container px-4 py-3 text-label-md font-semibold text-primary min-h-11"
    : "rounded-full border border-outline-variant bg-surface px-4 py-3 text-label-md font-semibold text-on-surface-variant min-h-11"
}
```

```tsx
// GlossaryClient.tsx alphabet filter buttons — already h-10 (40px), change to h-11 (44px)
// Change h-10 min-w-10 to h-11 min-w-11
className={
  activeLetter === letter
    ? "flex h-11 min-w-11 items-center justify-center rounded-lg bg-primary px-3 text-label-md font-semibold text-on-primary"
    : ...
}
```

**Files:** `LearnClient.tsx:88-96`, `GlossaryClient.tsx:92-98`

---

### VISUAL-001 — Gradient cards on tools page

**Severity:** High | **Category:** Visual

**Fix:**

```tsx
// src/app/[locale]/tools/ToolsClient.tsx — remove gradient variants
const cardClass = {
  gradient:
    "hover-lift rounded-[24px] border border-outline-variant bg-surface-container p-6 shadow-card hover:shadow-card-hover",
  standard:
    "group hover-lift rounded-[24px] border border-outline-variant bg-surface p-6 shadow-card hover:shadow-card-hover",
  muted:
    "group hover-lift rounded-[24px] border border-outline-variant bg-surface-container-low p-6 shadow-card hover:shadow-card-hover",
  dark:
    "group hover-lift rounded-[24px] border border-primary bg-primary p-6 text-on-primary shadow-card-hover hover:shadow-elevation-2",
};

// Also remove gradient class from first tool's variant
{
  title: t("askTitle"),
  description: t("askDescription"),
  href: "/tools/visit-planner",
  icon: MessagesSquare,
  variant: "standard" as const,  // Changed from "gradient"
},
```

**Files:** `src/app/[locale]/tools/ToolsClient.tsx:44-52, 19`

---

### VISUAL-002 — Icon-in-circle decorative patterns

**Severity:** High | **Category:** Visual

**Fix:** Replace colored icon containers with simpler approach:

```tsx
// HomeClient.tsx line 72 — remove colored container, use plain icon
// Before:
<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary">
  <Heart size={28} aria-hidden="true" />
</div>

// After:
<Heart size={28} className="text-primary mb-4" aria-hidden="true" />
```

**Files:** `HomeClient.tsx:72-73, 81-82, 91-92, 196, 206, 216`, `SectionNav.tsx:58`

---

### UX-003 — Two equally-weighted CTAs in hero

**Severity:** High | **Category:** UX

**Fix:**

```tsx
// src/components/Hero.tsx — make "Browse Glossary" a text link, not a button
<div className="flex flex-wrap items-center gap-4">
  <Link href="/learning-paths" className="btn-primary inline-flex items-center justify-center">
    {t("startLearning")}
  </Link>
  <Link
    href="/glossary"
    className="inline-flex items-center gap-1 text-label-md font-semibold text-primary underline-offset-2 hover:underline"
  >
    {t("browseGlossary")}
    <ArrowRight size={16} />
  </Link>
</div>
```

**Files:** `src/components/Hero.tsx:21-28`

---

### UX-004 — Empty state missing illustrations

**Severity:** High | **Category:** UX

**Fix:**

```tsx
// GlossaryClient.tsx line 170-183 — use EmptyState with icon
<EmptyState
  icon={<Search size={48} />}
  title={tCommon("noTermsFound")}
  description={tCommon("noResultsTryAnother")}
  action={{
    label: tCommon("showAllTerms"),
    onClick: () => {
      setQuery("");
      setActiveLetter("All");
    },
  }}
/>
```

**Files:** `GlossaryClient.tsx:170-183`, `LearnClient.tsx:153-168`

---

## TIER 3 — MEDIUM PRIORITY (Polish & Consistency)

---

### A11Y-008 — SearchDialog missing aria-labelledby

**Fix:** Add heading inside dialog with id, or enhance aria-label.

```tsx
aria-label={`${t("searchDialog")} — ${results.length} results`}
```

**Files:** `SearchDialog.tsx:129`

---

### A11Y-009 — NotificationCenter panel missing dialog role

**Fix:**

```tsx
<div
  ref={panelRef}
  role="dialog"
  aria-modal="true"
  aria-label={t("title")}
  className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border ..."
>
```

**Files:** `NotificationCenter.tsx:118-177`

---

### A11Y-010 — Toast container missing aria-live

**Fix:**

```tsx
<div
  className="fixed bottom-4 right-4 z-[120] flex w-full max-w-sm flex-col gap-3"
  aria-live="polite"
  aria-label="Notifications"
>
```

**Files:** `ToastProvider.tsx:36-39`

---

### A11Y-013 — Toast auto-dismiss too fast (4s)

**Fix:**

```tsx
// Toast.tsx — increase to 8 seconds
const timer = setTimeout(() => {
  setVisible(false);
  setTimeout(() => onDismiss(toast.id), 300);
}, 8000); // Increased from 4000
```

**Files:** `Toast.tsx:39-45`

---

### LAYOUT-005 — Fixed padding should use clamp()

**Fix:**

```css
/* Replace py-16 md:py-20 with clamp-based approach */
/* In tailwind config or as a utility class */
.py-section {
  padding-top: clamp(2rem, 4vw, 5rem);
  padding-bottom: clamp(2rem, 4vw, 5rem);
}
```

**Files:** `Section.tsx:30`, various section wrappers

---

### LAYOUT-006 — Missing scroll-padding-top for sticky header

**Fix:**

```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px; /* Account for sticky header height */
}
```

**Files:** `src/app/globals.css:11-13`

---

### VISUAL-003 — Symmetrical 3-column feature grid

**Fix:** Use asymmetric layout:

```tsx
<div className="grid gap-6 md:grid-cols-3 md:grid-rows-[auto_auto]">
  {/* First card spans 2 columns */}
  <Link href="/learn" className="md:col-span-2 md:row-span-1 ...">
    ...
  </Link>
  {/* Second card */}
  <Link href="/glossary" className="...">
    ...
  </Link>
  {/* Third card spans full width */}
  <Link href="/tools" className="md:col-span-3 ...">
    ...
  </Link>
</div>
```

**Files:** `HomeClient.tsx:191-222`

---

### UX-006 — Missing :active state on buttons

**Fix:**

```css
/* globals.css — add active states */
.btn-primary {
  background-color: var(--color-primary);
  /* ... */
}
.btn-primary:active {
  background-color: var(--color-primary-container);
  transform: scale(0.97);
}

.btn-secondary:active {
  background-color: var(--color-surface-container);
  transform: scale(0.97);
}
```

**Files:** `globals.css`, `Button.tsx`

---

### A11Y-015 — Mobile menu tab order (controls before nav)

**Fix:**

```tsx
// Reorder mobile menu: nav items first, then controls
{isOpen ? (
  <div id="mobile-menu" ...>
    <nav className="grid gap-2 mb-4">
      {navItems.map(...)}
      {/* Auth items */}
    </nav>
    <div className="space-y-3">
      <SearchDialog />
      <LanguageToggle />
      <ThemeToggle />
      <AccessibilityControls />
    </div>
  </div>
) : null}
```

**Files:** `Header.tsx:170-239`

---

## TIER 4 — LOW PRIORITY (Visual Refinement)

---

### VISUAL-005 — Shadow colors don't adapt to dark mode

**Fix:** Use CSS custom properties for shadow colors:

```css
:root {
  --shadow-color: rgba(0, 67, 73, 0.08);
}
:root[data-theme="dark"] {
  --shadow-color: rgba(0, 0, 0, 0.4);
}
```

Then in tailwind config:

```ts
boxShadow: {
  card: "0 1px 3px var(--shadow-color), 0 1px 2px var(--shadow-color)",
  ...
}
```

**Files:** `tailwind.config.ts`, `globals.css`

---

### VISUAL-006 — Dark mode shadows invisible

**Fix:** Same as VISUAL-005 — unified.

---

### LAYOUT-007 — Container gutter not fluid

**Fix:**

```tsx
// Container.tsx
<div className={["mx-auto px-clamp(1rem, 3vw, 4rem)", sizeStyles[size], className].join(" ")}>
```

Or use Tailwind arbitrary values: `px-[clamp(1rem,3vw,4rem)]`

**Files:** `Container.tsx:18`

---

### UX-007 — Print styles for content

**Fix:** Extend print styles for content pages. Ensure `.prose` content prints without background colors.

**Files:** `globals.css:202-261`

---

### MOBILE-007 — Full-screen overlays on mobile

**Fix:** Implement slide-up sheet pattern for mobile modals:

```tsx
// Modal.tsx — on mobile, use slide-up instead of centered
// Detect mobile with useMediaQuery or CSS
className={[
  "fixed bottom-0 left-0 right-0 z-10 w-full rounded-t-xl border ... md:relative md:rounded-xl",
  sizeStyles[size],
].join(" ")}
```

**Files:** `Modal.tsx`, `AccessibilityControls.tsx`

---

## Implementation Order Summary

```
TIER 1 (5 issues — fix first)
├── LAYOUT-001: Nav horizontal overflow → globals.css + Header.tsx
├── LAYOUT-002: Control duplication 768-1023px → Header.tsx
├── LAYOUT-003: Missing overflow-x hidden → globals.css
├── A11Y-001: Skip link discoverability → Header.tsx
└── A11Y-002: Glossary heading hierarchy → GlossaryClient.tsx

TIER 2 (16 issues — fix second)
├── LAYOUT-004: Container too narrow → tailwind.config.ts
├── UX-001: Weak active nav indicator → Header.tsx
├── UX-002: Missing loading states → New loading.tsx files
├── UX-003: Two equally-weighted CTAs → Hero.tsx
├── UX-004: Empty state illustrations → GlossaryClient, LearnClient
├── UX-006: Missing :active states → globals.css, Button.tsx
├── A11Y-003: Focus indicator too thin → globals.css
├── A11Y-004: NotificationCenter aria-live → NotificationCenter.tsx
├── A11Y-005: Color-only links → GlossaryClient.tsx
├── A11Y-006: noValidate forms → LoginForm, SignupForm
├── A11Y-007: Reduced motion edge cases → Toast, ScrollToTop
├── MOBILE-001: Body font too large → globals.css
├── MOBILE-002: Hero exceeds 60vh → Hero.tsx
├── MOBILE-003: Tap targets <44px → LearnClient, GlossaryClient
├── VISUAL-001: Gradient cards → ToolsClient.tsx
└── VISUAL-002: Icon-in-circle → HomeClient, SectionNav, ToolsClient

TIER 3 (12 issues — third)
├── A11Y-008: SearchDialog aria-labelledby
├── A11Y-009: NotificationCenter dialog role
├── A11Y-010: Toast container aria-live
├── A11Y-013: Toast auto-dismiss timing
├── A11Y-015: Mobile menu tab order
├── LAYOUT-005: clamp() padding
├── LAYOUT-006: scroll-padding-top
├── VISUAL-003: Asymmetric feature grid
└── (3 more minor fixes)

TIER 4 (8 issues — final polish)
├── VISUAL-005/006: Shadow dark mode
├── LAYOUT-007: Fluid gutters
├── UX-007: Print styles
├── MOBILE-007: Slide-up sheets
└── (3 more polish items)
```

---

## Files Modified Summary

| File                                           | Changes                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/app/globals.css`                          | overflow hidden, focus size, mobile body font, scroll-padding, active states, dark shadows |
| `src/components/Header.tsx`                    | Nav breakpoint xl, skip link redesign, control duplication fix, mobile tab order           |
| `src/app/[locale]/glossary/GlossaryClient.tsx` | Heading hierarchy, link underline, empty state                                             |
| `src/app/[locale]/learn/LearnClient.tsx`       | Tap target size, empty state                                                               |
| `src/components/Hero.tsx`                      | Hide image on mobile, CTA hierarchy                                                        |
| `src/components/ui/Button.tsx`                 | Active states                                                                              |
| `src/components/ui/Toast.tsx`                  | Auto-dismiss timing, reduced motion                                                        |
| `src/components/ui/ToastProvider.tsx`          | aria-live on container                                                                     |
| `src/components/ui/NotificationCenter.tsx`     | aria-live, dialog role                                                                     |
| `src/components/ui/Modal.tsx`                  | Mobile slide-up sheet option                                                               |
| `src/components/SearchDialog.tsx`              | aria-labelledby                                                                            |
| `src/components/layout/Container.tsx`          | Fluid gutters                                                                              |
| `src/components/layout/Section.tsx`            | clamp() padding                                                                            |
| `src/app/[locale]/HomeClient.tsx`              | Icon-in-circle removal, asymmetric grid                                                    |
| `src/app/[locale]/tools/ToolsClient.tsx`       | Gradient removal                                                                           |
| `src/components/SectionNav.tsx`                | Icon-in-circle removal                                                                     |
| `src/app/[locale]/auth/login/LoginForm.tsx`    | Client-side validation                                                                     |
| `src/app/[locale]/auth/signup/SignupForm.tsx`  | Client-side validation                                                                     |
| `src/components/ScrollToTop.tsx`               | Reduced motion                                                                             |
| `tailwind.config.ts`                           | max-container 1280px, shadow variables                                                     |
| NEW: loading.tsx files                         | 3-4 new files for dashboard/auth routes                                                    |

**Total:** ~20 modified files + 4 new files
