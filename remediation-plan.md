# Health Made Clear — Remediation Plan

Companion to `audit-report.md` (65 issues, 0 Critical / 10 High / 27 Medium / 16 Low).
Standard: WCAG 2.2 AA. Effort is T-shirt sized per issue (S ≤30 min · M ≤2 h · L ≤1 day · XL >1 day).

---

## 3A. Executive Summary

### Totals by severity

| Severity  | Count  |
| --------- | ------ |
| Critical  | 0      |
| High      | 10     |
| Medium    | 27     |
| Low       | 16     |
| **Total** | **65** |

### Totals by category

| Category                 | Count |
| ------------------------ | ----- |
| Accessibility            | 34    |
| UX                       | 11    |
| UI                       | 5     |
| Health-Specific          | 3     |
| (Copy folded into above) | —     |

### Estimated WCAG 2.2 AA pass rate

**≈ 82–86%.** Strong foundation (focus traps, skip link, `:focus-visible`, reduced-motion, labeled inputs, dialog ARIA, single `h1` on most pages). Remaining gaps are concentrated and fixable in 1–2 sprints. No issue currently blocks deployment outright, but the High cluster (live regions, focus return, i18n, missing `h1`, tables) should ship first.

### Top 3 most impactful to fix immediately

1. **ISSUE-007 — Focus not returned on non-Escape overlay close** (affects every dialog/dropdown; one hook fix). Effort: S.
2. **ISSUE-041 — Hardcoded English on the Spanish locale** (breaks the entire ES experience + 3.1.2). Effort: M.
3. **ISSUE-011 / ISSUE-012 — No live-region announcements for auth success and quiz results** (silent success/scoring for screen-reader users). Effort: M.

### Effort rollup

- Quick wins (S, <30 min): ~22 issues → see `quick-wins.md`.
- Medium (M): ~30 issues.
- Large (L): ~10 issues (i18n sweep, table renderer, glossary popover, search combobox).
- XL: 0 — no architectural rewrites required.

---

## 3B. Critical Fixes (before any deployment)

**None.** No Critical-severity issues were found. Proceed to High priority; treat the "Top 3" above as the de facto pre-deploy must-fix list.

---

## 3C. High Priority Fixes (next sprint)

### Grouped: Overlay focus management

**ISSUE-007** — Return focus on every close path. Effort: S.

- Root cause: `useDismissibleOverlay` only refocuses the trigger in the Escape branch; click-outside/backdrop/X paths skip it.
- Fix — centralize restore in the hook so all close paths refocus:

```ts
// src/hooks/useDismissibleOverlay.ts — restore focus on ANY close, not just Escape
function close() {
  onClose();
  const target = returnFocusRef?.current ?? triggerRef?.current;
  // defer until after the overlay unmounts
  requestAnimationFrame(() => target?.focus());
}
// call close() from Escape handler AND the click-outside handler
```

- Verification: Open Search/Notifications/Accessibility/Onboarding, close via backdrop and via X — focus returns to the trigger each time. Test with keyboard + VoiceOver.

**ISSUE-008 / ISSUE-009** — Focus restore for trap + Onboarding. Effort: S each.

- `useFocusTrap`: capture `document.activeElement` on activate, restore on deactivate (or document that consumers must use `useDismissibleOverlay` for restore). Pass a `returnFocusRef`/trigger to `OnboardingDialog`.
- Verification: Tab-trap dialogs return focus to the opener on close.

**ISSUE-010 / ISSUE-063** — Fix inline glossary popover. Effort: M.

- Root cause: `role="dialog"` without modal semantics, no `aria-controls`, no focus move, no focus return.
- Fix: either (a) make it a true non-modal disclosure: keep `aria-expanded`/`aria-haspopup`, add `aria-controls={popoverId}`, move focus into the popover on open, return focus to the trigger on close/Escape, add `motion-reduce`; or (b) reuse the `Modal` primitive. Add `min-h-11` to the trigger.
- Verification: Keyboard open → focus enters popover → Escape → focus returns to term; screen reader announces expanded/collapsed.

### Grouped: Live regions / status announcements

**ISSUE-011** — Auth success announcements. Effort: M.

- Wrap each success view in `role="status" aria-live="polite"` and move focus to the success `<h1>` on mount (`ref` + `useEffect(() => h1Ref.current?.focus(), [])`, with `tabIndex={-1}`).
- Files: `SignupForm.tsx:74-89`, `ForgotPasswordForm.tsx:38-52`, `reset-password/page.tsx` (add a success message before redirect, e.g. `?reset=success`).
- Verification: VoiceOver announces success text; focus lands on the new heading.

**ISSUE-012** — Quiz results announcement + correctness text. Effort: M (covers ISSUE-030).

- Add `role="status" aria-live="polite"` to the results container (`QuizResults.tsx:39`); add visible text "Your answer" / "Correct answer" to option rows (`:115-123`) and a text "Correct"/"Incorrect" alongside the icon (`:104-108`).
- Verification: On completion, score + pass/fail announced; each reviewed option states which was chosen and which was correct.

### Grouped: Forms — error association & password reveal

**ISSUE-018** — Tie submit errors to fields. Effort: M.

- Pass the validation message into `Input`'s existing `error` prop so it sets `aria-invalid` + `aria-describedby` automatically; keep the summary alert as well.
- Files: `LoginForm.tsx`, `SignupForm.tsx`, `ForgotPasswordForm.tsx`, `reset-password/page.tsx`.
- Verification: axe shows inputs `aria-invalid="true"` linked to error text after a failed submit.

**ISSUE-055** — Show/hide password toggle. Effort: M.

- Add a reveal button inside `Input` for `type="password"` (toggle `type` to `text`, `aria-pressed`, `aria-label` "Show/Hide password", `min-h-11`). All password fields inherit it.
- Verification: Toggle reveals text, announces state, is keyboard operable.

### Grouped: Structure

**ISSUE-021 / ISSUE-022** — Add `<h1>` to Progress + Settings. Effort: S each.

- Wrap each in `PageHeader` (already used elsewhere) or add a visually-appropriate `<h1>`.
- Verification: Each page has exactly one `h1`; outline has no skipped levels.

**ISSUE-028** — Progress tables `scope` + `caption`. Effort: S.

- Add `scope="col"`/`scope="row"` to `<th>` and a `<caption>` (can be `sr-only`).
- Verification: Screen reader reads header context per cell; axe table checks pass.

### Grouped: Internationalization

**ISSUE-041** — Remove hardcoded English. Effort: L.

- Move all literals to `next-intl` catalogs (en.json/es.json). Hot spots: auth validation strings, quiz feedback, dashboard, learning-path detail, AchievementCard, NetworkStatusBanner.
- Verification: Switch to `/es`, walk every flagged screen — no English remains; add a lint rule / test to catch raw strings in JSX.

**ISSUE-042** — Unique auth page titles. Effort: S.

- Add `generateMetadata` `title` per route (Login/Signup/Forgot); convert reset-password to a server `page.tsx` wrapper that sets metadata around the client form.
- Verification: Browser tab + screen reader announce distinct titles.

---

## 3D. Medium Priority Fixes (next two sprints)

### Theme: ARIA states on toggles (ISSUE-001, 002, 003, 004, 006)

- ThemeToggle → `aria-pressed`. NotificationCenter bell → `aria-expanded` + `aria-haspopup="dialog"`. Signup strength bar → `role="progressbar"` + `aria-valuenow/min/max` (or `aria-valuetext` Weak/Fair/…). Mark-complete → `aria-pressed`. Button loading → `aria-busy`.
- Effort: S each. Verify with screen reader state announcements.

### Theme: Heading/landmark structure (ISSUE-023, 024, 025, 026, 027)

- Callout: accept a `headingLevel` prop (default render as `<p>`/configurable, not always `h2`). Footer: wrap link groups in `<nav aria-label>`, promote column labels to headings. Glossary "Seen in" → heading. Callout/KeyTakeaway → `role="note"`/`<aside>` + type in accessible name. SectionNav `<section aria-labelledby>`.
- Effort: S–M. Verify outline + landmarks in accessibility tree.

### Theme: Tables & content renderer (ISSUE-029)

- Add `table_open`/`th`/`caption`, `blockquote`, and `code_block` handlers to `MarkdownRenderer` with proper semantics + scope.
- Effort: L. Verify any content table is screen-reader navigable.

### Theme: Color-independent information (ISSUE-031, 033)

- Streak heatmap: render an `sr-only` list of active dates and/or make cells `aria-label`ed; add a text legend. Charts: add `role="img"` + `aria-label` summarizing the value, or an `sr-only` text equivalent.
- Effort: M each.

### Theme: Keyboard patterns (ISSUE-035, 036)

- SearchDialog: implement combobox/listbox with arrow-key navigation + `aria-activedescendant`. Add `type="button"` to all non-submit buttons.
- Effort: M (search), S (button types).

### Theme: Feedback & timing (ISSUE-013, 017, 052, 053, 054)

- Mark-complete: disable during save + `aria-live` result. Error toasts → `role="alert"`. Toast: pause auto-dismiss on hover/focus (clear/restart timer); consider 6–10 s. NetworkStatusBanner: add dismiss + i18n. Login: success toast.
- Effort: S–M each.

### Theme: Navigation (ISSUE-048, 049)

- Add semantic `<ol><li>` breadcrumbs to glossary-term and article detail; convert existing lesson/path breadcrumbs to `<ol>`. Make tools/section/dashboard link text unique (append the tool/section name or use `aria-label`).
- Effort: M.

### Theme: Forms & empty states (ISSUE-019, 051)

- Contact: wire textarea/select `aria-invalid`/`aria-describedby`. Replace bare empty states (articles, progress completed-lessons) with `EmptyState`; dedupe LearnClient empty messaging.
- Effort: S–M.

### Theme: Touch targets (ISSUE-043, 044)

- Bump dialog close buttons and the listed controls to `min-h-11 min-w-11`.
- Effort: S (mostly class changes).

### Theme: Hooks (ISSUE-047)

- Save/restore prior `body.overflow` (ref count for nested overlays) instead of resetting to `""`.
- Effort: S.

### Health-specific (ISSUE-064)

- Audit any future urgency tier to ensure text/icon accompanies color. Currently low residual risk.
- Effort: S.

---

## 3E. Low Priority / Polish (before v1.0 public launch)

- **ISSUE-005** LanguageToggle radio/link semantics → use `<button role="radio">` with roving tabindex, or plain links without radio role. (M)
- **ISSUE-016** Remove `aria-live` from the toast container (keep per-item) to stop double announce. (S)
- **ISSUE-020** Add `aria-required` to required inputs. (S)
- **ISSUE-032** Underline body links by default. (S, systemic — see 3F)
- **ISSUE-034** Strengthen card border to meet 3:1, or rely on elevation. (S)
- **ISSUE-037** Remove redundant wrapper `onClick` in LearnClient. (S)
- **ISSUE-038** Make Card `clickable` actually interactive (keyboard) or rename to `hoverable`. (S)
- **ISSUE-039** Switch `focus:` rings to `focus-visible:`, add focus ring to EmptyState link. (S)
- **ISSUE-040** Add `aria-hidden` to decorative icons. (S, systemic)
- **ISSUE-045** Increase short link/share/remove target sizes. (S)
- **ISSUE-046** Add `motion-reduce` guards to remaining animations; gate ScrollToTop smooth scroll. (S)
- **ISSUE-050** Use "Home" for first breadcrumb crumb. (S)
- **ISSUE-056** Wrap reset-password fields in `<fieldset><legend>`. (S)
- **ISSUE-057** Client-side empty check before forgot-password submit. (S)
- **ISSUE-058** Reduce icon-in-colored-circle usage to a lighter treatment. (M, systemic)
- **ISSUE-059** Use `--shadow-color` in `elevation-3`. (S)
- **ISSUE-060** Darken `on-secondary-container` slightly for margin. (S)
- **ISSUE-061** Add `max-w-[70ch]` (or prose width) to lesson body. (S)
- **ISSUE-062** Acceptable given simple-mode; no action required pre-launch. (—)
- **ISSUE-065** Forward-looking: mask future health-data fields by default. (—)
- **ISSUE-014 / ISSUE-015** Add `role="status"` loading context for skeletons / reset spinner. (S)

---

## 3F. Systemic Recommendations

1. **Centralize overlay focus return.** One fix in `useDismissibleOverlay` (ISSUE-007) plus making every dialog consume it removes a whole class of 2.4.3 failures (Search, Notifications, Accessibility, Onboarding, quiz exit). Don't patch per-component.

2. **Enforce a single dialog primitive.** `Modal` already does focus trap + return + Escape + labelledby correctly. Refactor SearchDialog, NotificationCenter panel, AccessibilityControls, OnboardingDialog, and the glossary popover to build on it (or a shared `useDialog`) so ARIA + focus behavior is consistent by construction.

3. **Funnel all form errors through `Input`'s `error` prop.** The component already wires `aria-invalid`/`aria-describedby`/`role="alert"`; the bug is that forms render a separate summary and never feed `Input`. Adopt a `FormField`/standard submit handler that always sets per-field errors (fixes ISSUE-018, 019 at once).

4. **Eliminate hardcoded UI strings.** Add an ESLint rule (e.g. `i18next/no-literal-string` or a custom JSX-text lint) and a CI check. Sweep the catalog (ISSUE-041). This also closes 3.1.2 on the ES locale.

5. **Live-region utility.** Add one `useAnnounce()` / `<LiveRegion>` helper and use it for success, results, save, and loading states (ISSUE-011, 012, 013, 014, 015). Standardize polite vs assertive (errors = assertive).

6. **Touch-target token.** Add a shared `tap-target` utility class (`min-h-11 min-w-11 inline-flex items-center justify-center`) and apply to all icon-only/close/pill controls (ISSUE-043, 044, 045). Prevents regressions.

7. **Decorative-icon convention.** Establish that all Lucide icons used decoratively get `aria-hidden="true"` (wrap in an `Icon` helper that defaults to hidden unless `label` is passed). Fixes ISSUE-040 and prevents recurrence.

8. **Link styling default.** Make body/content links underlined by default in the prose/global styles (ISSUE-032), so individual pages can't opt out into color-only.

9. **Heading-level discipline.** Give Callout/PageHeader/section components explicit `as`/`headingLevel` props so nesting can't force level skips (ISSUE-023, 026, 027). Add a "one h1 per page" test.

10. **Remove dead code.** `LessonActionsClient`, `LessonCallout`, `useScrollSpy`/`ScrollSpyProvider` (for section nav), unused `layout/PageHeader|Section|Container`, and `LessonCard` `progress` prop are unused — delete to reduce audit surface and confusion.

---

## 3G. Testing Checklist

### Automated

- [ ] axe DevTools — zero Critical and Serious violations on: Home, Learn, Lesson, Quiz, Glossary, Glossary term, Articles, Article, Tools (+3 subtools), Learning paths (+detail), Dashboard (+progress/settings/achievements), all Auth routes, About/Contact/Accessibility/Privacy/Terms.
- [ ] Lighthouse Accessibility ≥ 90 on every route above.
- [ ] Lighthouse Performance — LCP < 2.5 s, INP < 200 ms, CLS < 0.1.
- [ ] WAVE — zero Errors (watch contrast + missing form labels).
- [ ] Contrast analyzer on: body, on-surface-variant, primary/on-primary, secondary-container/on-secondary-container (ISSUE-060), error states, badges, outline borders (ISSUE-034) — light AND dark mode.
- [ ] Run the repo test suite (`useFocusTrap.test`, `useDismissibleOverlay.test`, `MarkdownRenderer.test`) after hook changes.

### Manual

- [ ] Tab through every page — all controls reachable, no traps, focus returns to trigger after closing every overlay (ISSUE-007).
- [ ] Full keyboard-only pass of a complete flow: signup → lesson → quiz → dashboard.
- [ ] VoiceOver (macOS/iOS): confirm announcements for auth success, quiz results, mark-complete, toasts, loading (ISSUE-011/012/013/014).
- [ ] Browser zoom 200% — no clipping/overlap; reflow at 320px width, no horizontal scroll.
- [ ] `prefers-reduced-motion: reduce` — confetti, toasts, hover-lift, onboarding, glossary popover all static (ISSUE-046).
- [ ] Dark mode — every surface/text/accent holds contrast; shadows visible (ISSUE-059).
- [ ] 375px viewport — all tap targets ≥44px (ISSUE-043/044/045), CTAs reachable.
- [ ] Spanish locale (`/es`) — zero English leakage (ISSUE-041).
- [ ] All forms: submit empty, invalid, valid — errors tied to fields (ISSUE-018/019), success announced (ISSUE-011).
- [ ] Empty states: trigger no-results on articles, learn, glossary, progress (ISSUE-051).
- [ ] Tables: screen-reader read progress tables + any content table (ISSUE-028/029).
