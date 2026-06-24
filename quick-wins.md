# Quick Wins — Fixes Under 30 Minutes

Dev-ready task list. Each item is self-contained with exact location and code. Ordered roughly by impact. See `audit-report.md` for full context.

---

## 1. Return focus on ALL overlay close paths (ISSUE-007) — highest impact

`src/hooks/useDismissibleOverlay.ts` — refocus the trigger from the click-outside path too, not only Escape.

```ts
// add a shared close() that always restores focus, and call it from every branch
const restoreFocus = () => {
  const target = returnFocusRef?.current ?? triggerRef?.current;
  requestAnimationFrame(() => target?.focus());
};
// in the click-outside handler:
onClose();
restoreFocus();
// in the Escape handler: keep existing refocus (or call restoreFocus())
```

Verify: open Search → click backdrop → focus is back on the search button.

---

## 2. Unique auth page titles (ISSUE-042)

Add to each: `src/app/[locale]/auth/login/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`.

```ts
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("loginTitle") }; // "signupTitle" / "forgotTitle" respectively
}
```

(reset-password needs a small server wrapper — promote to next sprint, not a quick win.)

---

## 3. Add `<h1>` to Progress and Settings (ISSUE-021, 022)

`src/app/[locale]/dashboard/progress/progress-client.tsx:107` and `settings/settings-client.tsx:96` — wrap top content in the existing `PageHeader` or add:

```tsx
<h1 className="text-headline-lg">{t("progressTitle")}</h1>
```

Verify: each page has exactly one h1.

---

## 4. Progress table semantics (ISSUE-028)

`src/app/[locale]/dashboard/progress/progress-client.tsx:169-176, 269-275`

```tsx
<table>
  <caption className="sr-only">{t("progressTableCaption")}</caption>
  <thead>
    <tr>
      <th scope="col">…</th>…
    </tr>
  </thead>
</table>
```

---

## 5. Error toasts assertive (ISSUE-017)

`src/components/ui/Toast.tsx:49`

```tsx
role={variant === "error" ? "alert" : "status"}
aria-live={variant === "error" ? "assertive" : "polite"}
```

---

## 6. Remove duplicate toast live region (ISSUE-016)

`src/components/ui/ToastProvider.tsx:38` — drop `aria-live="polite"` from the container (keep `aria-label`); per-item `role="status"` stays.

---

## 7. `aria-pressed` / `aria-expanded` on toggles (ISSUE-001, 002)

`src/components/ui/ThemeToggle.tsx:14-21`

```tsx
<button aria-pressed={theme === "dark"} aria-label={...}>
```

`src/components/ui/NotificationCenter.tsx:101-104`

```tsx
<button aria-expanded={isOpen} aria-haspopup="dialog" aria-label={...}>
```

---

## 8. `aria-busy` on loading button (ISSUE-006)

`src/components/ui/Button.tsx:51`

```tsx
<button aria-busy={loading || undefined} disabled={disabled || loading} …>
```

---

## 9. `type="button"` on non-submit buttons (ISSUE-036)

Add `type="button"`:

- `src/components/ui/SearchDialog.tsx:109-120, 147-153`
- `src/components/OnboardingDialog.tsx:54-59, 97-99`
- `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx:334-337, 344-351`

---

## 10. Bump dialog close buttons to 44px (ISSUE-043)

- `src/components/ui/Toast.tsx:64` `h-8 w-8` → `min-h-11 min-w-11`
- `src/components/ui/Modal.tsx:96` `h-10 w-10` → `min-h-11 min-w-11`
- `src/components/ui/SearchDialog.tsx:149` `h-8 w-8` → `min-h-11 min-w-11`
- `src/components/OnboardingDialog.tsx:54-60` `h-8 w-8` → `min-h-11 min-w-11`

---

## 11. Bump small interactive controls to 44px (ISSUE-044)

- `src/components/LanguageToggle.tsx:51-52` add `min-h-11`
- `src/components/dashboard/DashboardSidebar.tsx:90-91` mobile nav `py-2` → `py-3` / `min-h-11`
- `src/app/[locale]/glossary/GlossaryClient.tsx:175` & `glossary/[term]/GlossaryTermClient.tsx:65` chips → `min-h-11`
- `src/components/AccessibilityControls.tsx:102-103,123-124` radios → `min-h-11`

---

## 12. `focus-visible` instead of `focus` + add missing focus ring (ISSUE-039)

- `src/components/ui/ScrollToTop.tsx:25` `focus:ring-*` → `focus-visible:ring-*`
- `src/components/ui/SearchDialog.tsx:144` add a `focus-visible:` ring (remove bare `outline-none`)
- `src/components/ui/EmptyState.tsx:34-38` add `focus-visible:ring-2 focus-visible:ring-offset-2`

---

## 13. Decorative icons `aria-hidden` (ISSUE-040)

Add `aria-hidden="true"` (or `focusable="false"`):

- `src/components/SectionNav.tsx:14-37`
- `src/components/ui/NotificationCenter.tsx:161`
- `src/components/OnboardingDialog.tsx:69-88`
- `src/app/[locale]/dashboard/DashboardClient.tsx:203-241`
- `src/components/ui/Input.tsx:32-34`
- `src/components/learn/LessonCard.tsx:54-56`

---

## 14. Underline body links by default (ISSUE-032)

Add `underline` (drop hover-only):

- `src/app/[locale]/HomeClient.tsx:108-114, 167-173`
- `src/app/[locale]/glossary/[term]/GlossaryTermClient.tsx:45, 62`
- `src/app/[locale]/about/AboutClient.tsx:71-72`
- `src/app/[locale]/accessibility/AccessibilityClient.tsx:33-34`
- `src/components/Footer.tsx:23-65`

---

## 15. `aria-required` on required inputs (ISSUE-020)

`src/components/ui/Input.tsx:39`

```tsx
required={required} aria-required={required || undefined}
```

---

## 16. Lesson body max-width (ISSUE-061)

`src/app/[locale]/learn/[slug]/LessonPageClient.tsx:212-214` — wrap markdown in `className="max-w-[70ch]"` (or apply prose width), overriding `max-w-none`.

---

## 17. `elevation-3` shadow uses theme var (ISSUE-059)

`tailwind.config.ts:95`

```ts
"elevation-3": "0 12px 24px var(--shadow-color-heavy), 0 6px 12px var(--shadow-color)",
```

---

## 18. Remove redundant wrapper onClick (ISSUE-037)

`src/app/[locale]/learn/LearnClient.tsx:132-134` — delete the outer `div onClick`; the inner `Link` already handles navigation.

---

## 19. First breadcrumb label → "Home" (ISSUE-050)

`src/app/[locale]/learn/[slug]/LessonPageClient.tsx:134-135` — use `tNav("home")` instead of `tCommon("back")`.

---

## 20. Forgot-password empty guard (ISSUE-057)

`src/app/[locale]/auth/forgot-password/ForgotPasswordForm.tsx:19-22`

```ts
if (!email.trim()) {
  setError(t("emailRequired"));
  return;
}
setLoading(true);
```

---

## 21. NetworkStatusBanner i18n + dismiss (ISSUE-053, partial)

`src/components/ui/NetworkStatusBanner.tsx:37` — replace hardcoded string with `t("offline")`; add a dismiss `<button>` with `aria-label`.

---

## 22. `role="status"` for reset-password loading (ISSUE-015)

`src/app/[locale]/auth/reset-password/page.tsx:68-76` — wrap spinner in `<div role="status" aria-live="polite">` and add `aria-label` to the spinner.

---

### Not quick wins (need design/logic — see remediation-plan.md)

i18n sweep (ISSUE-041), Markdown table renderer (ISSUE-029), inline-glossary popover (ISSUE-010), search combobox (ISSUE-035), password reveal in Input (ISSUE-055), form-error-to-field wiring (ISSUE-018), live-region utility + auth/quiz announcements (ISSUE-011/012), streak/chart text equivalents (ISSUE-031/033).
