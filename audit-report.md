# Health Made Clear — Production UI/UX/Accessibility Audit

**Date:** 2026-06-24
**Standard:** WCAG 2.2 AA (plus design-system, UX, and health-app heuristics)
**Scope:** All locale pages, shared components, UI primitives, hooks, styles, and content renderers under `src/`.
**Method:** Static source audit with file:line evidence. Contrast ratios computed from CSS custom-property token values in `src/app/globals.css`. Touch targets evaluated against the prompt's 44×44 px requirement (note: WCAG 2.2 SC 2.5.8 AA minimum is 24×24 px; 44×44 is SC 2.5.5 AAA / mobile best practice — severities reflect this).

> Note: A previous `AUDIT_REPORT.md` exists but is stale — its cited line numbers and several "issues" (overflow-x, focus outline, body font sizing, scroll-padding, reduced-motion, shadow vars) are already resolved in the current code. This report supersedes it.

---

## Issue Log

### Accessibility — Names, Roles, States (WCAG 4.1.2)

---

ISSUE-001
Severity: Medium
Category: Accessibility
WCAG Criterion: 4.1.2 Name, Role, Value
Location: UI primitives → ThemeToggle → toggle button
Description: Theme toggle button does not expose its pressed/toggle state programmatically.
Evidence: `src/components/ui/ThemeToggle.tsx:14-21` has dynamic `aria-label` but no `aria-pressed`; state lives only in the label string.
Impact: Screen-reader users cannot perceive the toggle's on/off state the way sighted users see the icon.

---

ISSUE-002
Severity: Medium
Category: Accessibility
WCAG Criterion: 4.1.2 Name, Role, Value
Location: Header → NotificationCenter → bell button
Description: The notifications trigger opens a dialog panel but lacks `aria-expanded`.
Evidence: `src/components/ui/NotificationCenter.tsx:101-104` — button has `aria-label` but no `aria-expanded`/`aria-haspopup`.
Impact: Screen-reader users are not told the control expands a panel or its current open state.

---

ISSUE-003
Severity: Medium
Category: Accessibility
WCAG Criterion: 4.1.2 Name, Role, Value
Location: Signup page → password strength meter
Description: Password-strength bar is a visual meter with no programmatic value.
Evidence: `src/app/[locale]/auth/signup/SignupForm.tsx:128-141` — strength bar `div` has no `role="progressbar"`/`aria-valuenow`; only a text label (Weak/Fair/Good/Strong) is exposed.
Impact: The graphical strength indication is invisible to assistive tech (text label partially compensates).

---

ISSUE-004
Severity: Medium
Category: Accessibility
WCAG Criterion: 4.1.2 Name, Role, Value
Location: Lesson → LessonActionsClient → mark-complete toggle
Description: Mark-complete toggle does not expose pressed state.
Evidence: `src/components/lesson/LessonActionsClient.tsx:20-31` — no `aria-pressed`, no `aria-live`. (Note: file appears unused; LessonPageClient owns the live mark-complete — see ISSUE-031.)
Impact: Toggle state not conveyed to screen readers.

---

ISSUE-005
Severity: Medium
Category: Accessibility
WCAG Criterion: 4.1.2 Name, Role, Value
Location: Header/Display controls → LanguageToggle
Description: Language switcher uses `<Link>` elements with `role="radio"`, mixing link and radio semantics, and lacks roving tabindex / arrow-key handling required by the radio pattern.
Evidence: `src/components/LanguageToggle.tsx:41-56` — `Link` + `role="radio"`; both options remain tab stops; no arrow-key navigation.
Impact: Conflicting semantics confuse screen readers; keyboard model does not match the announced radiogroup.

---

ISSUE-006
Severity: Low
Category: Accessibility
WCAG Criterion: 4.1.2 Name, Role, Value
Location: UI → Button → loading state
Description: Loading button does not set `aria-busy`.
Evidence: `src/components/ui/Button.tsx:51,61-66` — `disabled` is applied during load and `Loader2` is `aria-hidden`, but no `aria-busy="true"`.
Impact: Screen readers do not announce that the action is in progress.

---

### Accessibility — Focus Management (WCAG 2.4.3)

---

ISSUE-007
Severity: High
Category: Accessibility
WCAG Criterion: 2.4.3 Focus Order
Location: Overlays (Search, NotificationCenter, AccessibilityControls, Onboarding, quiz exit dialog) → close paths
Description: Focus is only returned to the trigger on Escape; closing via backdrop click, the X button, outside click, or selection leaves focus orphaned at the document body.
Evidence: `src/hooks/useDismissibleOverlay.ts:23-35` returns focus only in the Escape branch; click-outside branch has no refocus. Confirmed reliance in `src/components/ui/SearchDialog.tsx:53-58`, `src/components/ui/NotificationCenter.tsx:60`, `src/components/AccessibilityControls.tsx:39`.
Impact: Keyboard and screen-reader users lose their place after closing overlays, dropping focus to the top of the page.

---

ISSUE-008
Severity: Medium
Category: Accessibility
WCAG Criterion: 2.4.3 Focus Order
Location: Hooks → useFocusTrap
Description: The focus-trap hook does not restore focus to the previously focused element on deactivate.
Evidence: `src/hooks/useFocusTrap.ts:6-38` — no capture/restore of `document.activeElement`. Modal compensates with its own effect (`Modal.tsx:31-39`), but other consumers do not.
Impact: Inconsistent focus restoration across dialogs; consumers without their own restore logic strand focus.

---

ISSUE-009
Severity: Medium
Category: Accessibility
WCAG Criterion: 2.4.3 Focus Order
Location: OnboardingDialog
Description: Onboarding dialog has no trigger/`returnFocusRef`, so dismissing it leaves no defined focus target.
Evidence: `src/components/OnboardingDialog.tsx:26-31` — no return-focus handling.
Impact: After onboarding closes, keyboard focus is lost.

---

ISSUE-010
Severity: High
Category: Accessibility
WCAG Criterion: 4.1.2 / 2.4.3
Location: Lesson body → InlineGlossaryTerm → definition popover
Description: Inline glossary popover declares `role="dialog"` but is not a proper modal/disclosure: no `aria-modal`, no `aria-controls` linking trigger to popover, focus does not move into the popover on open, and Escape closes without returning focus to the trigger.
Evidence: `src/components/mdx/InlineGlossaryTerm.tsx:58-68` (dialog attrs), `:117-144` (Escape, no refocus), `:164-165` (`aria-haspopup`/`aria-expanded` present but unlinked).
Impact: Screen-reader and keyboard users cannot reliably reach, read, or exit the definition.

---

### Accessibility — Status Messages / Live Regions (WCAG 4.1.3)

---

ISSUE-011
Severity: High
Category: Accessibility
WCAG Criterion: 4.1.3 Status Messages
Location: Auth → success states (Signup, Forgot password, Reset password)
Description: Post-submit success views swap in without an `aria-live`/`role="status"` announcement and without moving focus to the new heading.
Evidence: `SignupForm.tsx:74-89` (silent success view, focus not moved to `:80` h1), `ForgotPasswordForm.tsx:38-52`, `reset-password/page.tsx:65` (redirect, no message).
Impact: Screen-reader users get no confirmation that account creation / reset email succeeded.

---

ISSUE-012
Severity: High
Category: Accessibility
WCAG Criterion: 4.1.3 Status Messages
Location: Quiz → QuizResults / QuizClient completion
Description: Quiz results (score, pass/fail) render with no live region; completion transition is silent.
Evidence: `src/components/quiz/QuizResults.tsx:39-87` (no `aria-live`); `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx:234-251` (completed state, no announcement).
Impact: Screen-reader users are not informed of their score or pass status on completion.

---

ISSUE-013
Severity: Medium
Category: Accessibility
WCAG Criterion: 4.1.3 Status Messages
Location: Lesson → mark-complete (LessonPageClient)
Description: Marking a lesson complete is an async action with no loading indication, no disabled-during-save, and no live announcement of the result.
Evidence: `src/app/[locale]/learn/[slug]/LessonPageClient.tsx:175-188`.
Impact: Screen-reader users get no feedback that completion saved; double-clicks possible.

---

ISSUE-014
Severity: Medium
Category: Accessibility
WCAG Criterion: 4.1.3 Status Messages
Location: UI → Skeleton loaders
Description: Skeletons are `aria-hidden` but no enclosing `role="status"`/`aria-busy` announces that content is loading.
Evidence: `src/components/ui/Skeleton.tsx:30,47` — hidden from AT with no loading status anywhere.
Impact: Screen-reader users hear silence during async loads instead of a "loading" cue.

---

ISSUE-015
Severity: Medium
Category: Accessibility
WCAG Criterion: 4.1.3 Status Messages
Location: Auth password forms → form-level submit errors
Description: Reset-password loading spinner has no live region and no accessible label.
Evidence: `reset-password/page.tsx:68-76` — spinner `div`, no `role="status"`/`aria-live`, `:72` no `aria-label`.
Impact: Loading state not announced.

---

ISSUE-016
Severity: Low
Category: Accessibility
WCAG Criterion: 4.1.3 Status Messages
Location: UI → ToastProvider / Toast
Description: Nested live regions — the toast container has `aria-live="polite"` and each toast item also has `role="status" aria-live="polite"`, risking double announcement.
Evidence: `src/components/ui/ToastProvider.tsx:36-43` + `src/components/ui/Toast.tsx:49`.
Impact: Some screen readers announce each toast twice.

---

ISSUE-017
Severity: Medium
Category: Accessibility
WCAG Criterion: 4.1.3 Status Messages
Location: UI → Toast (error variant)
Description: Error toasts use `role="status"` (polite) rather than `role="alert"` (assertive).
Evidence: `src/components/ui/Toast.tsx:49` — all variants use polite status.
Impact: Critical error feedback may be queued/delayed by screen readers instead of interrupting.

---

### Accessibility — Error Identification / Forms (WCAG 3.3.1, 3.3.2)

---

ISSUE-018
Severity: High
Category: Accessibility
WCAG Criterion: 3.3.1 Error Identification
Location: Auth forms (Login, Signup, Forgot, Reset) → form-level error
Description: Submit-time validation errors render as a standalone alert but are never tied to the offending input — the shared `Input` `error` prop is unused, so inputs stay `aria-invalid={false}` with no `aria-describedby` to the message.
Evidence: `LoginForm.tsx:97-103`, `SignupForm.tsx:145-151`, `ForgotPasswordForm.tsx:71-77`, `reset-password/page.tsx:106-112` — none pass `error` to `Input`.
Impact: Screen-reader users cannot associate the error with the field that caused it.

---

ISSUE-019
Severity: Medium
Category: Accessibility
WCAG Criterion: 3.3.1 Error Identification
Location: Contact page → message textarea and subject select
Description: The textarea and select do not set `aria-invalid`/`aria-describedby` when in error; the select has no error handling at all.
Evidence: `src/app/[locale]/contact/ContactClient.tsx:139-153` (textarea error shown via separate `<p role="alert">` but not linked), `:119-132` (select, no error wiring). Name/email use the `Input` component which is wired correctly.
Impact: Inconsistent error association for the two raw form controls.

---

ISSUE-020
Severity: Low
Category: Accessibility
WCAG Criterion: 3.3.2 Labels or Instructions
Location: UI → Input → required indicator
Description: The required asterisk is `aria-hidden` and the component does not set `aria-required`; it relies solely on the native `required` attribute (acceptable, but no explicit programmatic "required" beyond that).
Evidence: `src/components/ui/Input.tsx:24-28,39`.
Impact: Minor — most screen readers honor native `required`; explicit `aria-required` improves robustness.

---

### Accessibility — Page Structure / Headings (WCAG 1.3.1, 2.4.6)

---

ISSUE-021
Severity: High
Category: Accessibility
WCAG Criterion: 1.3.1 Info and Relationships
Location: Dashboard → Progress page
Description: The progress page has no `<h1>`; content begins at `<h2>`.
Evidence: `src/app/[locale]/dashboard/progress/progress-client.tsx:107` — first heading is `<h2>` "Overall Progress".
Impact: Missing top-level heading breaks document outline for screen-reader navigation.

---

ISSUE-022
Severity: High
Category: Accessibility
WCAG Criterion: 1.3.1 Info and Relationships
Location: Dashboard → Settings page
Description: The settings page has no `<h1>`; sections start at `<h2>`.
Evidence: `src/app/[locale]/dashboard/settings/settings-client.tsx:96`.
Impact: Same as ISSUE-021 — broken heading hierarchy.

---

ISSUE-023
Severity: Medium
Category: Accessibility
WCAG Criterion: 1.3.1 Info and Relationships
Location: Content → Callout component
Description: Callout always renders its title as `<h2>` regardless of nesting context, causing heading-level skips and duplicate-topic h2s when placed inside a section that already has an h2.
Evidence: `src/components/Callout.tsx:21`; observed nesting in `src/app/[locale]/about/AboutClient.tsx:24,30`.
Impact: Illogical outline; potential level skip (e.g., h2 → h2 with no intervening structure, or h3 context receiving an h2).

---

ISSUE-024
Severity: Medium
Category: Accessibility
WCAG Criterion: 1.3.1 Info and Relationships
Location: Footer
Description: Footer link groups are not marked up as navigation and column labels are paragraphs, not headings.
Evidence: `src/components/Footer.tsx:16` (site name `<p>`), `:20,45` (column labels `<p>`), `:21-66` (link lists in `<div>`, not `<nav aria-label>`).
Impact: Screen-reader users cannot navigate footer sections by landmark or heading.

---

ISSUE-025
Severity: Medium
Category: Accessibility
WCAG Criterion: 1.3.1 Info and Relationships
Location: Glossary term detail → "Seen in" related block
Description: The related-content label is a `<div>` rather than a heading.
Evidence: `src/app/[locale]/glossary/[term]/GlossaryTermClient.tsx:35-37`.
Impact: Related section is not reachable via heading navigation.

---

ISSUE-026
Severity: Medium
Category: Accessibility
WCAG Criterion: 1.3.1 Info and Relationships
Location: Content → Callout / KeyTakeaway semantics
Description: Callout and KeyTakeaway are generic `div`s with no `role="note"`/`aside`, and their type (info/warning/success) is conveyed by border/color only — not in text or an accessible name.
Evidence: `src/components/Callout.tsx:13-23`, `src/components/ui/KeyTakeaway.tsx:12-18`.
Impact: Admonition meaning (e.g., a warning) is not conveyed non-visually (also a 1.4.1 concern).

---

ISSUE-027
Severity: Medium
Category: Accessibility
WCAG Criterion: 1.3.1 Info and Relationships
Location: SectionNav (home)
Description: `<section>` is not associated with its heading via `aria-labelledby`.
Evidence: `src/components/SectionNav.tsx:42` (section), `:48` (unwired h2).
Impact: The landmark/region is unnamed for screen readers.

---

### Accessibility — Tables (WCAG 1.3.1)

---

ISSUE-028
Severity: High
Category: Accessibility
WCAG Criterion: 1.3.1 Info and Relationships
Location: Dashboard → Progress page → data tables
Description: Tables have `<th>` without `scope` and no `<caption>`.
Evidence: `src/app/[locale]/dashboard/progress/progress-client.tsx:169-176,269-275`.
Impact: Screen readers cannot associate data cells with headers, making tabular data unreadable.

---

ISSUE-029
Severity: Medium
Category: Accessibility
WCAG Criterion: 1.3.1 Info and Relationships
Location: Content renderer → Markdown tables
Description: `MarkdownRenderer` has no handler for table/blockquote/code-block tokens, so MDX tables render without `scope`/`caption` (or as raw output).
Evidence: `src/components/mdx/MarkdownRenderer.tsx:91-212` — no `table_open`/`blockquote`/`code_block` cases.
Impact: Any table authored in lesson/article content is inaccessible to screen readers.

---

### Accessibility — Use of Color / Non-text (WCAG 1.4.1, 1.4.11)

---

ISSUE-030
Severity: High
Category: Accessibility
WCAG Criterion: 1.4.1 Use of Color
Location: Quiz → results review → per-option correctness
Description: In the results review, correct vs. incorrect answers are distinguished by border/background color only, with no text label such as "Your answer" / "Correct answer".
Evidence: `src/components/quiz/QuizResults.tsx:115-123`; question-level correctness is icon-only at `:104-108`.
Impact: Color-blind and screen-reader users cannot tell which option they chose or which was correct.

---

ISSUE-031
Severity: Medium
Category: Accessibility
WCAG Criterion: 1.4.1 Use of Color
Location: Dashboard → Progress → streak heatmap
Description: Streak calendar conveys active/inactive days through color squares only; cells expose only a `title` attribute and are not keyboard focusable, so the information has no robust text/AT equivalent.
Evidence: `src/app/[locale]/dashboard/progress/progress-client.tsx:377-388`.
Impact: Streak data is unavailable to screen-reader and keyboard users.

---

ISSUE-032
Severity: Medium
Category: Accessibility
WCAG Criterion: 1.4.1 Use of Color
Location: Body content links (multiple pages)
Description: Inline links in body copy rely on color alone (no underline except some on hover).
Evidence: `src/app/[locale]/HomeClient.tsx:108-114,167-173`; `GlossaryTermClient.tsx:45,62`; `AboutClient.tsx:71-72` (mailto); `AccessibilityClient.tsx:33-34`; `Footer.tsx:23-65`.
Impact: Users who cannot perceive the color difference cannot identify links within text.

---

ISSUE-033
Severity: Medium
Category: Accessibility
WCAG Criterion: 1.1.1 / 1.4.1
Location: Dashboard / Progress → SVG charts (progress ring, quiz-average bar)
Description: Decorative SVG charts have no `role="img"`/`aria-label` text equivalent; meaning relies on adjacent text that may not be programmatically associated.
Evidence: `progress-client.tsx:112-133` (ring, no aria), `:245-250` (quiz avg bar, no `role="progressbar"`); `QuizResults.tsx:43-65` (score ring `aria-hidden`).
Impact: Chart values may be skipped by assistive tech.

---

ISSUE-034
Severity: Low
Category: Accessibility
WCAG Criterion: 1.4.11 Non-text Contrast
Location: Global → card borders
Description: Card border color `--color-outline-variant` (#bfc8c9) on white surface yields ≈1.4:1, below the 3:1 non-text contrast threshold for component boundaries.
Evidence: `src/app/globals.css:63,361`; computed contrast #bfc8c9 vs #ffffff ≈ 1.4:1.
Impact: Card edges are hard to perceive for low-vision users (mitigated where shadow elevation is present).

---

### Accessibility — Keyboard / Interactive Semantics (WCAG 2.1.1)

---

ISSUE-035
Severity: Medium
Category: Accessibility
WCAG Criterion: 2.1.1 Keyboard
Location: SearchDialog → results list
Description: Search results have no roving tabindex or `aria-activedescendant`; the combobox/listbox keyboard pattern (arrow to navigate results) is not implemented.
Evidence: `src/components/ui/SearchDialog.tsx:160-188`.
Impact: Keyboard users must Tab through every result instead of using arrow keys; not a standard combobox experience.

---

ISSUE-036
Severity: Medium
Category: UX
WCAG Criterion: —
Location: Multiple → buttons missing explicit `type`
Description: Several `<button>`s omit `type="button"`, risking implicit form submission when nested in forms.
Evidence: `SearchDialog.tsx:109-120,147-153`; `OnboardingDialog.tsx:54-59,97-99`; `QuizClient.tsx:334-337,344-351`.
Impact: Potential accidental submits/navigations.

---

ISSUE-037
Severity: Low
Category: Accessibility
WCAG Criterion: 2.1.1 Keyboard
Location: LearnClient → lesson card wrapper
Description: A wrapper `div` carries an `onClick` around an inner `Link`, duplicating the click target with no keyboard equivalent on the div.
Evidence: `src/app/[locale]/learn/LearnClient.tsx:132-134`.
Impact: Redundant pointer-only handler; harmless but a code-smell that can mislead.

---

ISSUE-038
Severity: Low
Category: UI
WCAG Criterion: —
Location: UI → Card `clickable` variant
Description: `clickable` adds `cursor-pointer` and hover shadow but no `onClick`, `tabIndex`, `role`, or focus style — it is purely cosmetic and relies on a wrapping link.
Evidence: `src/components/ui/Card.tsx:9,23,31` — no interactive handlers.
Impact: Misleading affordance; cursor implies interactivity the element itself does not provide.

---

### Accessibility — Focus Visible (WCAG 2.4.7)

---

ISSUE-039
Severity: Medium
Category: Accessibility
WCAG Criterion: 2.4.7 Focus Visible
Location: ScrollToTop, SearchDialog input, Input, EmptyState link
Description: Several controls use `focus:outline-none` with a `focus:` (not `focus-visible:`) ring, so the ring appears on mouse click too, and `EmptyState` action link has hover-only styling with no focus ring.
Evidence: `src/components/ui/ScrollToTop.tsx:25`; `SearchDialog.tsx:144`; `Input.tsx:50`; `EmptyState.tsx:34-38`.
Impact: Inconsistent focus presentation; one control lacks a visible focus indicator. (Global `:focus-visible` at `globals.css:35-39` covers most cases.)

---

### Accessibility — Text Alternatives / Decorative Icons (WCAG 1.1.1)

---

ISSUE-040
Severity: Low
Category: Accessibility
WCAG Criterion: 1.1.1 Non-text Content
Location: Multiple → decorative Lucide icons missing `aria-hidden`
Description: Numerous decorative icons are not hidden from assistive tech, adding noise.
Evidence: `SectionNav.tsx:14-37`; `NotificationCenter.tsx:161`; `OnboardingDialog.tsx:69-88`; `DashboardClient.tsx:203-241`; `Input.tsx:32-34`; `LessonCard.tsx:54-56`.
Impact: Screen readers may announce stray icon names or empty graphics.

---

### Accessibility — Language (WCAG 3.1.2) / Internationalization

---

ISSUE-041
Severity: High
Category: Accessibility
WCAG Criterion: 3.1.2 Language of Parts
Location: Multiple → hardcoded English strings on the Spanish locale
Description: Numerous user-facing strings are hardcoded in English instead of routed through `next-intl`, so Spanish users receive English text without a `lang` attribute marking the change.
Evidence: `LoginForm.tsx:35-41` & `SignupForm.tsx:37-42` (validation errors); `QuizClient.tsx:328-329` (quiz feedback); `LearningPathDetailClient.tsx:119,172,182,196`; `DashboardClient.tsx:253-335`; `AchievementCard.tsx:46`; `NetworkStatusBanner.tsx:37`.
Impact: Spanish-speaking users encounter untranslated, unmarked English content — a comprehension and pronunciation (screen-reader) failure.

---

### Accessibility — Page Titles (WCAG 2.4.2)

---

ISSUE-042
Severity: High
Category: Accessibility
WCAG Criterion: 2.4.2 Page Titled
Location: Auth routes (Login, Signup, Forgot, Reset)
Description: No auth route sets a unique `<title>`; all inherit the default site title.
Evidence: `login/page.tsx:9-15`, `signup/page.tsx:7-13`, `forgot-password/page.tsx:7-13` set robots only; `reset-password/page.tsx` is entirely client (`"use client"`) with no `generateMetadata`.
Impact: All auth pages share one title — users with multiple tabs and screen-reader users cannot distinguish them.

---

### Accessibility — Touch Targets (WCAG 2.5.8 AA / 2.5.5 AAA)

---

ISSUE-043
Severity: Medium
Category: Accessibility
WCAG Criterion: 2.5.5 Target Size (Enhanced) / 2.5.8 Target Size (Minimum)
Location: Dialog close buttons (Toast, Modal, SearchDialog, OnboardingDialog)
Description: Close/dismiss buttons render below the 44×44 px target (several at 32×32 or 40×40).
Evidence: `Toast.tsx:64` (h-8 w-8 = 32px); `Modal.tsx:96` (h-10 w-10 = 40px); `SearchDialog.tsx:149` (32px); `OnboardingDialog.tsx:54-60` (32px).
Impact: Hard to tap accurately on touch devices (passes 24px AA minimum but fails the 44px target the product requires).

---

ISSUE-044
Severity: Medium
Category: Accessibility
WCAG Criterion: 2.5.5 / 2.5.8 Target Size
Location: LanguageToggle pills, mobile dashboard nav, glossary related chips, accessibility radios
Description: Multiple interactive elements fall under 44 px in height.
Evidence: `LanguageToggle.tsx:51-52` (≈32px); `DashboardSidebar.tsx:90-91` mobile bottom nav (`py-2`, ≈40px); `GlossaryClient.tsx:175` & `GlossaryTermClient.tsx:65` related chips (`py-1`, ≈28-32px); `AccessibilityControls.tsx:102-103,123-124` (`py-3`, ≈40px); `InlineGlossaryTerm.tsx:152-168` inline term (no min height).
Impact: Difficult tap accuracy on mobile, especially for motor-impaired users.

---

ISSUE-045
Severity: Low
Category: Accessibility
WCAG Criterion: 2.5.5 / 2.5.8 Target Size
Location: Auth helper links / share buttons
Description: Standalone text links and icon actions are short.
Evidence: `LoginForm.tsx:111-112` (forgot-password link); `ArticlePageClient.tsx:83,92` (share buttons `py-2`, ≈36px); `NotificationCenter.tsx:130-137` (mark-all-read); `VisitPlannerClient.tsx:274` (remove button, no min height).
Impact: Minor tap-accuracy issues on touch.

---

### Accessibility — Reduced Motion (WCAG 2.3.3 / pref)

---

ISSUE-046
Severity: Low
Category: Accessibility
WCAG Criterion: 2.3.3 Animation from Interactions
Location: Button active scale, OnboardingDialog, InlineGlossaryTerm, ScrollToTop smooth scroll
Description: A few animations/transitions are not guarded for `prefers-reduced-motion`.
Evidence: `Button.tsx:53` (`active:scale-[0.97]` no motion guard); `OnboardingDialog.tsx:45-52` (no motion classes); `InlineGlossaryTerm.tsx:67` (opacity transition); `ScrollToTop.tsx:24` (`behavior:"smooth"` ignores preference). Global reduced-motion block at `globals.css:201-215` catches most CSS transitions.
Impact: Users with vestibular sensitivities may still see small motion. (Largely mitigated globally.)

---

### Accessibility — Hooks / Infrastructure

---

ISSUE-047
Severity: Medium
Category: Accessibility
WCAG Criterion: 2.4.3 / 1.4.13
Location: Hooks → useDismissibleOverlay → body scroll lock
Description: On cleanup the hook hard-resets `document.body.style.overflow = ""` instead of restoring the prior value, so nested/stacked overlays unlock scrolling prematurely.
Evidence: `src/hooks/useDismissibleOverlay.ts:39,44`.
Impact: With two overlays open, closing the inner one re-enables background scroll while the outer is still open.

---

### UX — Navigation & Wayfinding

---

ISSUE-048
Severity: Medium
Category: UX
WCAG Criterion: 2.4.8 Location
Location: Glossary term detail, Article detail
Description: Pages three levels deep have no breadcrumb navigation.
Evidence: `GlossaryTermClient.tsx:20-26` (no breadcrumbs); `ArticlePageClient.tsx:45-51` (no breadcrumbs). Lesson and learning-path detail have breadcrumbs but not as semantic `<ol><li>` (`LessonPageClient.tsx:130-143`, `LearningPathDetailClient.tsx:43-56`).
Impact: Users lose sense of location and an easy path back up the hierarchy.

---

ISSUE-049
Severity: Medium
Category: UX
WCAG Criterion: 2.4.4 Link Purpose (In Context)
Location: Tools page, SectionNav, Dashboard
Description: Repeated, non-unique link text undermines out-of-context link lists used by screen-reader rotors.
Evidence: `ToolsClient.tsx:66-88` (four identical "Use tool" links); `SectionNav.tsx:62-64` ("Explore" ×4); `DashboardClient.tsx:439` ("View").
Impact: A screen-reader links list shows several identical entries with no distinguishing destination.

---

ISSUE-050
Severity: Low
Category: UX
WCAG Criterion: 2.4.8 Location
Location: LessonPageClient → first breadcrumb label
Description: First breadcrumb uses a generic "back" label rather than "Home".
Evidence: `LessonPageClient.tsx:134-135` (`tCommon("back")`).
Impact: Weak wayfinding signal.

---

### UX — Empty States & Feedback

---

ISSUE-051
Severity: Medium
Category: UX
WCAG Criterion: —
Location: Articles list, Dashboard progress (completed lessons), LearnClient
Description: Bare text empty states instead of the designed `EmptyState` pattern; LearnClient also announces "no lessons" twice.
Evidence: `ArticlesClient.tsx:71` (bare `<p>`); `progress-client.tsx:352-356` (bare `<p>`); `LearnClient.tsx:122-125` vs `:153-174` (duplicate empty messaging).
Impact: Inconsistent, unhelpful empty experiences; duplicate announcements for AT.

---

ISSUE-052
Severity: Medium
Category: UX
WCAG Criterion: 2.2.1 Timing Adjustable
Location: UI → Toast
Description: Toasts auto-dismiss after 8 s with no pause-on-hover/focus and no way to extend.
Evidence: `src/components/ui/Toast.tsx:39-44`.
Impact: Users who read slowly, or are interrupted, may miss the message; hovering does not pause it.

---

ISSUE-053
Severity: Medium
Category: UX
WCAG Criterion: —
Location: UI → NetworkStatusBanner
Description: Offline banner cannot be dismissed and its message is hardcoded English.
Evidence: `src/components/ui/NetworkStatusBanner.tsx:29-38` (no dismiss), `:37` (hardcoded string).
Impact: Persistent, untranslatable banner; intrudes until reconnect.

---

ISSUE-054
Severity: Medium
Category: UX
WCAG Criterion: —
Location: Auth → success feedback
Description: Login success silently redirects with no confirmation toast/message.
Evidence: `LoginForm.tsx:57-61`.
Impact: Abrupt transition; user (and AT) gets no success confirmation. (See ISSUE-011 for the AT-specific aspect.)

---

### UX — Forms

---

ISSUE-055
Severity: High
Category: UX
WCAG Criterion: 3.3.2 Labels or Instructions
Location: Auth password fields (Login, Signup, Reset)
Description: No show/hide password toggle on any password field.
Evidence: `LoginForm.tsx:86-94`; `SignupForm.tsx:118-127`; `reset-password/page.tsx:86-104`; underlying `Input.tsx:6-12` has no reveal affordance.
Impact: Users cannot verify what they typed, increasing entry errors — especially on mobile.

---

ISSUE-056
Severity: Low
Category: UX
WCAG Criterion: —
Location: Auth password pairs → reset-password
Description: New + confirm password fields are not grouped in a `<fieldset>`/`<legend>`.
Evidence: `reset-password/page.tsx:96-104`.
Impact: Minor grouping/semantic gap.

---

ISSUE-057
Severity: Low
Category: UX
WCAG Criterion: —
Location: Forgot-password form → empty-submit guard
Description: No client-side empty/invalid email check before the API call; submitting blank still sets loading and hits the backend.
Evidence: `ForgotPasswordForm.tsx:19-22`.
Impact: Wasted request and slower error feedback on empty submit.

---

### UI — Design System / Visual

---

ISSUE-058
Severity: Medium
Category: UI
WCAG Criterion: —
Location: Multiple → icon-in-colored-circle/box decorative pattern
Description: The "icon inside a tinted rounded container" decoration recurs widely, a flagged design anti-pattern that adds visual weight and competing color.
Evidence: `Hero.tsx:50-63`; `SectionNav.tsx:58`; `ToolsClient.tsx:67-72`; `DashboardClient.tsx:203-241`; `LessonPageClient.tsx:207-208` (step circles); `AboutClient.tsx:40-41`; `LearningPathDetailClient.tsx:136-145`.
Impact: Inconsistent, decoration-heavy visual language; dilutes accent-color restraint.

---

ISSUE-059
Severity: Low
Category: UI
WCAG Criterion: —
Location: Global → shadow tokens
Description: Shadow tokens use CSS variables (good) but `elevation-3` hardcodes `rgba(0,0,0,…)` instead of `--shadow-color`, breaking the tone-matching/dark-mode adaptation the other levels have.
Evidence: `tailwind.config.ts:95`.
Impact: Inconsistent elevation tone; `elevation-3` shadow not theme-adaptive.

---

ISSUE-060
Severity: Low
Category: UI
WCAG Criterion: 1.4.3 Contrast (Minimum)
Location: Components using `secondary-container` fills with `on-secondary-container` text (badges, progress fill)
Description: `on-secondary-container` (#446c5e) on `secondary-container` (#c0ecda) computes to ≈4.58:1 — it passes AA for normal text but only barely, leaving no margin for sub-pixel rendering or large-text exceptions misuse.
Evidence: `globals.css:72-73`; `Badge.tsx:16` (success variant), `globals.css:449` (progress-fill bg).
Impact: Borderline contrast; monitor and prefer a slightly darker text token.

---

ISSUE-061
Severity: Low
Category: UI
WCAG Criterion: —
Location: Lesson/path content → line length
Description: Lesson markdown body has no max-width constraint, producing overly long measure on wide screens.
Evidence: `src/components/mdx/MarkdownRenderer.tsx:243` (`max-w-none`); consumed without a parent cap in `LessonPageClient.tsx:212-214`.
Impact: Long line length (≈700-900px) reduces reading comprehension.

---

ISSUE-062
Severity: Low
Category: UI
WCAG Criterion: —
Location: Decorative gradients / emoji placeholders
Description: Hero and logo use gradients; lesson thumbnails fall back to gradient + emoji placeholder.
Evidence: `Hero.tsx:12`; `globals.css:98` (logo); `LessonThumbnail.tsx:41`. Simple-mode strips gradients (`globals.css:518-521`), mitigating impact.
Impact: Minor visual-consistency concern; well-mitigated by simple mode.

---

### Health-App Specific

---

ISSUE-063
Severity: Medium
Category: Health-Specific
WCAG Criterion: —
Location: Glossary tooltip / inline term definitions
Description: The inline glossary mechanism (which is the app's primary plain-language support for clinical terms) is not robustly accessible (see ISSUE-010), so the very feature meant to aid comprehension fails for AT/keyboard users.
Evidence: `src/components/mdx/InlineGlossaryTerm.tsx:58-168`.
Impact: Users who most need term explanations (cognitive/low-vision) may be unable to access them.

---

ISSUE-064
Severity: Medium
Category: Health-Specific
WCAG Criterion: 1.4.1 Use of Color
Location: Care Guide / Learning-path status → urgency & progress signaling
Description: Some urgency/status cues (next-lesson highlight, path status) lean on color with text present but not always programmatically linked; the Care Guide emergency banner is correctly `role="alert"` (good), but ensure all urgency tiers carry text/icon, not color alone.
Evidence: `LearningPathDetailClient.tsx:128-134` (next-lesson color highlight + "Start" text — OK), `LearningPathsClient.tsx:127-129` (done/ready color + text — OK); Care Guide `role="alert"` at `CareGuideClient.tsx:84-88` (good).
Impact: Low residual risk; mainly verify no future urgency tier becomes color-only.

---

ISSUE-065
Severity: Low
Category: Health-Specific
WCAG Criterion: —
Location: Global → privacy masking of personal data
Description: Display name / email appear in the header and dashboard unmasked. For a health-literacy app this is acceptable (no PHI/lab data stored client-side), but any future health-data fields should be masked by default.
Evidence: `Header.tsx:124` (display name), dashboard profile.
Impact: No current violation; forward-looking guidance.

---

## Summary Statistics

| Category        | Critical | High   | Medium | Low    | Total  |
| --------------- | -------- | ------ | ------ | ------ | ------ |
| Accessibility   | 0        | 9      | 17     | 8      | 34     |
| UX              | 0        | 1      | 7      | 3      | 11     |
| UI              | 0        | 0      | 1      | 4      | 5      |
| Health-Specific | 0        | 0      | 2      | 1      | 3      |
| **Total**       | **0**    | **10** | **27** | **16** | **65** |

(Copy issues are folded into UX/Accessibility entries — see ISSUE-041, 049, 050, 053.)

**No Critical issues found** — the app has a solid accessibility foundation (focus traps, skip link, `:focus-visible`, reduced-motion, labeled inputs, single-`h1` on most pages, ARIA on most dialogs). The defects cluster in: live-region announcements, focus-return on non-Escape close, i18n gaps, missing `h1` on two dashboard pages, table semantics, and the inline-glossary popover.
