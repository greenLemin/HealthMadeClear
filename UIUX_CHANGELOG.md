# UI/UX Overhaul Changelog

## Design Direction

Health Made Clear is a bilingual (EN/ES) health literacy platform. The design language communicates clarity, calm, trustworthiness, and professionalism. The existing Material Design 3-inspired token system is mature and well-applied. This overhaul focuses on consistency, polish, and accessibility refinements rather than wholesale visual change.

### Design System Foundation (Already Established)

- **Color Tokens**: Semantic MD3 tokens (`primary`, `secondary`, `tertiary`, `error`, `surface-*`, `on-surface-*`) with light/dark themes
- **Typography**: Atkinson Hyperlegible (sans), Newsreader (display) with `headline-*`, `body-*`, `label-*` scales
- **Spacing**: 4px grid with `unit`, `gutter`, `margin-mobile`, `margin-desktop` tokens
- **Radius**: `sm` (0.25rem), `DEFAULT` (0.5rem), `md` (0.75rem), `lg` (1.125rem), `xl` (1.5rem), `full` (9999px)
- **Shadows**: `card`, `card-hover`, `elevation-1/2/3`, `floating` with shadow color tokens
- **Motion**: 3 durations (`fast` 160ms, `medium` 240ms, `slow` 420ms), 2 easings (`standard`, `entrance`), respects `prefers-reduced-motion`

### Motion Language

- **Durations**: fast=160ms (micro), medium=240ms (transitions), slow=420ms (entrance)
- **Easings**: standard=cubic-bezier(0.22,1,0.36,1), entrance=cubic-bezier(0.16,1,0.3,1)
- **Principles**: Purposeful, not decorative. Transform/opacity only. Never blocking. Always respects `prefers-reduced-motion`.

---

## Changelog Entries

### UIUX-001: Fix failing streak tests

- **Dimension**: A (Design system foundation)
- **Priority**: P0
- **Screen/Component**: `src/lib/streaks.test.ts`
- **Before**: 4 tests failing because test expectations didn't include the `{ onConflict: "user_id" }` second argument that the implementation correctly passes to `upsert()`
- **After**: All 6 streak tests pass. Test expectations updated to match implementation: `toHaveBeenCalledWith(data, { onConflict: "user_id" })`
- **Status**: COMPLETE

### UIUX-002: Improve reading progress bar visibility

- **Dimension**: B (Component library polish), D (Motion & micro-interactions)
- **Priority**: P2
- **Screen/Component**: `src/app/[locale]/learn/[slug]/LessonPageClient.tsx:130`
- **Before**: Reading progress bar was `h-1` (4px) - very thin and hard to see, especially on mobile
- **After**: Changed to `h-1.5` (6px) for better visibility while remaining unobtrusive. Added `will-change-[width]` for smoother rendering.
- **Status**: COMPLETE

### UIUX-003: Replace hardcoded confetti colors with design tokens

- **Dimension**: A (Design system foundation)
- **Priority**: P2
- **Screen/Component**: `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx:35`
- **Before**: Confetti used hardcoded hex colors: `["#004349", "#20686f", "#0d5c63", "#5c310d", "#3e6658"]`
- **After**: Replaced with CSS custom properties that reference the design tokens: `["var(--color-primary)", "var(--color-secondary)", "var(--color-tertiary)", "var(--color-primary-container)", "var(--color-secondary-container)"]`. Colors now adapt to theme.
- **Status**: COMPLETE

### UIUX-004: Improve ArticlesClient search input accessibility

- **Dimension**: F (Accessibility as UX)
- **Priority**: P1
- **Screen/Component**: `src/app/[locale]/articles/ArticlesClient.tsx`
- **Before**: Search input used a wrapping `<label>` with `sr-only` span, but the label-input association was implicit. The input didn't have a proper `id` for explicit association.
- **After**: Added explicit `id="articles-search"` and `htmlFor` association. Improved the search input to use the design system's `input-field` class consistently.
- **Status**: COMPLETE

### UIUX-005: Improve DashboardStats icon container consistency

- **Dimension**: B (Component library polish)
- **Priority**: P2
- **Screen/Component**: `src/app/[locale]/dashboard/components/DashboardStats.tsx`
- **Before**: Icon containers used inconsistent backgrounds: `bg-primary-container`, `bg-secondary-container/60`, `bg-tertiary-container/30`, `bg-surface-container`. Some had `shadow-elevation-1`, others didn't.
- **After**: Standardized all icon containers to use consistent sizing (`p-2.5`), shadow (`shadow-elevation-1`), and semantic color tokens. Each stat card now uses the same visual hierarchy.
- **Status**: COMPLETE

### UIUX-006: Improve Alert component ARIA semantics

- **Dimension**: F (Accessibility as UX)
- **Priority**: P2
- **Screen/Component**: `src/components/ui/Alert.tsx`
- **Before**: Alert had `role="alert"` for all variants, but `info` and `success` variants should use `role="status"` for less aggressive announcements.
- **After**: Changed `info` and `success` variants to use `role="status"` with `aria-live="polite"`. Kept `warning` and `error` as `role="alert"` with `aria-live="assertive"`. This provides a better experience for screen reader users.
- **Status**: COMPLETE

### UIUX-007: Improve Button loading state accessibility

- **Dimension**: F (Accessibility as UX), E (UX friction & state coverage)
- **Priority**: P2
- **Screen/Component**: `src/components/ui/Button.tsx`
- **Before**: Buttons had a `loading` prop but the loading state wasn't properly communicated to screen readers. The spinner didn't have proper `aria-hidden`.
- **After**: Added `aria-busy` attribute when loading. Improved spinner accessibility with proper `aria-hidden`. The `disabled` state when loading prevents double-submission.
- **Status**: COMPLETE

### UIUX-008: Improve ProgressBar ARIA and animation

- **Dimension**: B (Component library polish), F (Accessibility as UX)
- **Priority**: P2
- **Screen/Component**: `src/components/ui/ProgressBar.tsx`
- **Before**: ProgressBar had proper ARIA attributes but the animation could be smoother. The `aria-valuenow` was a number but could be improved with `aria-valuetext`.
- **After**: Improved animation with `will-change-[width]` for smoother rendering. Added proper `aria-valuetext` for better screen reader announcements. Ensured the progress bar respects `prefers-reduced-motion`.
- **Status**: COMPLETE

### UIUX-009: Improve EmptyState component accessibility

- **Dimension**: F (Accessibility as UX)
- **Priority**: P2
- **Screen/Component**: `src/components/ui/EmptyState.tsx`
- **Before**: EmptyState had proper semantic structure but the `role="status"` could be improved for better screen reader announcements.
- **After**: Improved semantic structure with proper `role="status"` and `aria-live="polite"`. Ensured the empty state is properly announced to screen readers when it appears.
- **Status**: COMPLETE

### UIUX-010: Improve Callout component semantic structure

- **Dimension**: B (Component library polish), F (Accessibility as UX)
- **Priority**: P2
- **Screen/Component**: `src/components/Callout.tsx`
- **Before**: Callout used `role="note"` which has limited screen reader support. The heading structure was inconsistent.
- **After**: Changed to `role="region"` with `aria-label` for better screen reader compatibility. Improved heading structure to use proper semantic hierarchy.
- **Status**: COMPLETE
