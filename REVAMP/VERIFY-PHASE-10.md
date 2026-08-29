# VERIFY-PHASE-10

**Verdict: APPROVED**

Reviewer is not the Phase 10 author. Spec read from `REVAMP/PLAN.v10.md` §13.1–13.4 (Phase 10 — Header, 404, ErrorBoundary, Display control), §0.1–0.3, and the Wave 1 PHASE-10 COMPLETION REPORT in the implementer transcript ([P10 Header 404 Display](6c81a2fe-0d13-4b1b-8586-2de648b72bcf)). Author claims were re-checked against staged diffs, unit tests, Chromium Playwright, and live screenshots against `http://127.0.0.1:3000`.

All §13.3 acceptance criteria are met. Overflow at 1280/1440 EN+ES was a real Wave 2 fail; the prescribed NavLink tighten shipped and now passes. Follow-ups `P10-1` (`.theme-light`) and `P10-2` (ErrorBoundary catalog keys) are **done**.

---

## Method

- **Spec**: `REVAMP/PLAN.v10.md` §13.1–13.4, §0.1–0.3. Orchestration packet in `phases_10-16_parallel_bb5dd08b.plan.md`.
- **Diff**: `git diff --staged` on Header, NavLink, AccessibilityControls, both not-found files, ErrorBoundary, OnboardingDialog, `e2e/visual.spec.ts`.
- **Units**: `npx vitest run src/components/Header.test.tsx src/components/AccessibilityControls.test.tsx src/components/OnboardingDialog.test.tsx 'src/app/[locale]/not-found.test.tsx'` — covered in the 37-file / 271-test P10–16 targeted run (pass) and full `npm test` **136 files / 956 tests**.
- **Typecheck**: `npm run typecheck` — 0 errors.
- **Playwright (Chromium)**: `e2e/visual.spec.ts` P10 block — **all pass**, including 1280+1440 `/en`+`/es` `scrollWidth <= clientWidth`, 1440 inline nav / hamburger hidden, 1280 login word visible, 390+1024 accordion sibling sheet, 404 home button ≥ 44.
- **UI**: Live screenshots of `/en` 1440, `/es` 1280, `/en` 390 open menu, `/en/this-page-does-not-exist`. `REVAMP/SCREENSHOTS/phase-10/` does not exist.

`npm run lint` is clean for Phase 10 files. Tree-wide lint is 0 errors after P12/P16 punch fixes.

---

## Acceptance criteria (re-checked)

| Criterion                                                                                                                                                       |  Result  | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1440px: Learn/Articles/Tools/etc. inline; hamburger hidden                                                                                                      | **PASS** | `Header.tsx:201-203` nav `xl:flex` (not `lg:flex`). Hamburger `xl:hidden` (`:273`). Playwright 1440: 8 desktop links, hamburger hidden, no Tools dropdown. Live 1440 screenshot: 8 labeled nav items.                                                                                                                                                                                                                                                                                                                         |
| 1280 + 1440: header does not overflow on `/en` and `/es`; login visible text at `xl`; signup may hide; `2xl` icon-only OK                                       | **PASS** | NavLink `xl:text-label-sm xl:px-1.5 xl:gap-0.5` (`NavLink.tsx:26-27`) — the prescribed overflow fix after Wave 2 measured 1425/1512 > clientWidth. Login span `xl:inline 2xl:hidden` (`Header.tsx:254`) with `aria-label={authT("loginButton")}`. Signup `xl:hidden` (`:256`). Playwright 1280/1440 EN+ES overflow equal; 1280 login word visible. Live `/es` 1280: “Iniciar sesión” visible.                                                                                                                                 |
| 390px hamburger; close `min-h-11 min-w-11`; full-width accordion (not `max-w-md`); 1024–1279 hamburger by design; sibling of glass; `max-h` + `overflow-y-auto` | **PASS** | Glass `overflow-hidden` (`:185`); outer wrapper `overflow-visible` (`:184`); `AccordionSheet` is a **sibling** of the glass div (`:284-295`), not a child. Sheet class `ACCORDION_SHEET_CLASS` (`:49-50`): `max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain … bg-surface-container-lowest rounded-b-[1.5rem]`. Toggle `min-h-11 min-w-11` (`:273`). Playwright 390 + 1024. Live 390 menu: solid sheet under the bar with last auth controls in the menu.                                                         |
| Display button accessible name not duplicated                                                                                                                   | **PASS** | `AccessibilityControls.tsx:209-215`: `aria-label={t("display")}` + **one** inner `<span>{t("display")}</span>`. Old `hidden 2xl:inline` + `sr-only 2xl:hidden` pair is gone.                                                                                                                                                                                                                                                                                                                                                  |
| Root and locale 404 use padded buttons                                                                                                                          | **PASS** | Root `not-found.tsx:4,12,26-38`: imports `globals.css`, `theme-light`, `getButtonClasses` + `min-h-12 px-6`. Locale `not-found.tsx:19-24`: `ButtonLink size="lg"` + `min-h-12`, `/learn`, `errors.searchHint`. Playwright 404 home height ≥ 44. Note: `/en/this-page-does-not-exist` renders the **root** 404 (`<html class="theme-light">`) because that URL never calls `notFound()` inside `[locale]`. Spec’s own Playwright URL hits root; locale template is used when `notFound()` runs (unknown lesson/article slugs). |
| ErrorBoundary not English-only                                                                                                                                  | **PASS** | Function fallback `DefaultCrashFallback` uses `useTranslations("errors")`. Class stays without hooks.                                                                                                                                                                                                                                                                                                                                                                                                                         |

---

## Punch list

None that block APPROVED.

Logged follow-ups (now done; do not re-open as this-phase AC fails):

- `src/app/not-found.tsx:12` — `.theme-light` has `html.theme-light { color-scheme: light; }` (`P10-1`, done).
- `src/components/ErrorBoundary.tsx` — crash copy uses `errors.title` / `errors.crashBody` / `errors.tryAgain` (`P10-2`, done).

Process: work is staged on `main` mixed with Phases 1–9 and 11–16. Same tree-wide issue as prior VERIFY reports. Not unique to P10.

---

## What is actually correct (do not redo)

1. **Accordion DOM**: outer `overflow-visible` → glass `overflow-hidden` (gradient clip only) → `AnimatePresence` sibling sheet. Matches CF-50.
2. **Nav at `xl` not `lg`**: 8-item Spanish labels (`Rutas`, `Herramientas`, `Acerca de`) fit after NavLink tighten; no Tools dropdown; `getNavItems` unchanged.
3. **Login at `xl`**: visible word + accessible name; icon-only only at `2xl`.
4. **Onboarding**: `OnboardingDialog.tsx:82` uses `t("title")` (`onboarding.title`); `lockBodyScroll: true` (`:140`).
5. **Header.test.tsx** ButtonLink mock forwards `aria-label` / `className` / `href` (PLAN trap).
6. **MobileMenu** not edited (P10 contract). Accordion still mounts `<MobileMenu />` so search/theme/Display/auth exist in the 390 sheet.
