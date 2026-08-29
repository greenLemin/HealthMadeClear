# VERIFY-PHASE-4

**Verdict: APPROVED** (follow-up 2026-08-29)

Banner stutter closed: care-guide red alert renders `{t("emergencyShort")}` only. Emergency CTA still asserts 911/US in the DOM (`MedicalDisclaimer.test.tsx`). Process punch obsolete. `P4-1`–`P4-3` copy follow-ups are done.

---

## Historical write/review (2026-08-28)

Original verdict was **CHANGES REQUIRED**. Do not re-open the duplicate emergency banner from that snapshot.

Reviewer is not the Phase 4 author. Spec read from `cursor/plan-v10-0f7a:REVAMP/PLAN.v10.md` §7.1–7.6. Completion report was not found as a standalone file on disk; author intent and findings were reconstructed from staged diffs plus `REVAMP/ISSUES-BACKLOG.md` P4-1…P4-3.

This is a **write/review** verdict. Do not treat staging on `main` as a Phase 4 PR.

---

## Method

- Spec: `git show cursor/plan-v10-0f7a:REVAMP/PLAN.v10.md` §0.1–0.3, §7.1–7.6.
- Diff: `git diff --staged` and working directory across Phase 4 scope files.
- Unit: `npx vitest run src/app/[locale]/tools/care-guide/CareGuideClient.test.tsx src/components/MedicalDisclaimer.test.tsx` (15/15 passed); full suite `npm test` (110 files / 755 tests passed), `npm run lint`, `npm run typecheck`.
- E2E: `npx playwright test e2e/care-guide.spec.ts e2e/smoke.spec.ts e2e/auth.spec.ts --project=chromium` (13/13 passed).
- Live against `npm run dev`: Captured and visually inspected Chromium screenshots at desktop (1440px) and mobile (390px) for `/en/tools/care-guide`, `/es/tools/care-guide`, and `/en/articles` (saved under `/tmp/hmc-phase4-screens/`).
- Contrast verification: Calculated WCAG relative luminance and contrast ratios for light and dark tokens.
- Audited clinical phrasing, negation blindness, positive-lead ACS symptoms, infant fever thresholds, poison helpline riders, and 988 emergency lines.

---

## Punch list (must fix before APPROVED)

### 1. `src/app/[locale]/tools/care-guide/CareGuideClient.tsx:156` — 🟡 UI/copy bug: duplicate question in red alert banner

The top emergency banner renders:

```tsx
<div
  role="alert"
  className="no-print bg-error px-4 py-3 text-center text-label-md font-semibold text-on-error"
>
  {tDisclaimer("emergencyTitle")}: {t("emergencyShort")}
</div>
```

In `src/messages/en.json`:

- `disclaimer.emergencyTitle`: `"Experiencing a medical emergency?"`
- `tools.emergencyShort`: `"Experiencing a medical emergency? In the United States, call 911."`

In `src/messages/es.json`:

- `disclaimer.emergencyTitle`: `"¿Tienes una emergencia médica?"`
- `tools.emergencyShort`: `"¿Experimenta una emergencia médica? En los Estados Unidos, llame al 911."`

Result on live screen:

- **EN:** `"Experiencing a medical emergency?: Experiencing a medical emergency? In the United States, call 911."`
- **ES:** `"¿Tienes una emergencia médica?: ¿Experimenta una emergencia médica? En los Estados Unidos, llame al 911."`

**Fix:** In `CareGuideClient.tsx:156`, render `{t("emergencyShort")}` directly without prefixing `{tDisclaimer("emergencyTitle")}: `, or adjust the banner structure to eliminate the stutter.

### 2. Git index — 🟡 process: Phase 4 is not an isolated PR branch

Plan §0.1: one phase = one PR. §0.3: branch `revamp/p04-care-guide-liability`.

`git diff --staged --name-only` currently mixes Phase 1 SQL, Phase 2 auth routes/reset, Phase 3 contact/privacy/env gate, and Phase 4 care-guide/disclaimers together on uncommitted `main`.

**Fix:** Unstage non-Phase 4 changes and create dedicated branch `revamp/p04-care-guide-liability` containing only:

- `src/app/globals.css`
- `src/app/[locale]/tools/care-guide/CareGuideClient.tsx`
- `src/app/[locale]/tools/care-guide/CareGuideClient.test.tsx`
- `src/app/[locale]/articles/ArticlesClient.tsx`
- `src/components/MedicalDisclaimer.tsx`
- `src/components/MedicalDisclaimer.test.tsx`
- `src/messages/en.json` (Phase 4 keys)
- `src/messages/es.json` (Phase 4 keys)
- `e2e/care-guide.spec.ts`
- `REVAMP/ISSUES-BACKLOG.md` (P4-1…P4-3 only)

### 3. `src/components/MedicalDisclaimer.test.tsx:37-38` — 🔵 test quality: raw JSON import assertions

`MedicalDisclaimer.test.tsx` lines 37-38:

```ts
expect(en.disclaimer.emergencyCall).toMatch(/911/);
expect(en.disclaimer.emergencyCall).toMatch(/US/);
```

These assertions test the imported JSON object rather than querying the rendered DOM element. While line 36 does assert `screen.getByRole("link", { name: /911/ })`, lines 37-38 do not verify DOM rendering of `emergencyRegionNote`.

**Fix:** Assert against DOM elements rendered by the component (e.g., `expect(screen.getByText(en.disclaimer.emergencyRegionNote)).toBeInTheDocument()`).

---

## Acceptance criteria (re-checked)

| Criterion                                                                                                                                                                                                                                                                                                          | Result   | Evidence                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No copy tells user to take OTC medicine as instruction                                                                                                                                                                                                                                                             | **PASS** | `homeCareBody` in EN+ES includes clinician/pharmacist caveat ("Speak with a clinician or pharmacist before taking an over-the-counter medicine..."). Tested in `CareGuideClient.test.tsx:36-45`.                                            |
| All §7.2 keys rewritten in EN and ES; checklists not a stay-home/go-now tree                                                                                                                                                                                                                                       | **PASS** | All 24 keys in §7.2 reviewed and verified. Checklists describe settings and common presentations, not directives.                                                                                                                           |
| `scenarioSoreThroatBody` (EN+ES) names swallowing / drooling / mouth-opening / breathing emergencies (not clinic-only)                                                                                                                                                                                             | **PASS** | Exact paste in `en.json` and `es.json`. Unit tests assert `/drool\|swallow\|breath/i` (EN) and `tragar`, `babeo`, `abrir la boca`, `respirar`, `911`, `emergencias` (ES).                                                                   |
| `scenarioChestPainBody` (EN+ES) names jaw / neck / back / shortness of breath / cold sweats, US 911, don't-wait / don't self-treat; EN positive-lead                                                                                                                                                               | **PASS** | Positive-lead "A heart attack can cause many different symptoms — not just crushing chest pain." EN includes "anyone can experience them". No "do not always cause crushing" negation. ES equivalent verified.                              |
| `emergencyBody` **and** `whenInDoubtBody` name 988 (US) in EN+ES                                                                                                                                                                                                                                                   | **PASS** | Both keys in both catalogs contain 988 Suicide & Crisis Lifeline copy. Tested in `CareGuideClient.test.tsx:77-82`.                                                                                                                          |
| `whenInDoubtBody` names US Poison Help `1-800-222-1222` with 911-first rider; no "triage" / `triaje`                                                                                                                                                                                                               | **PASS** | `whenInDoubtBody` in EN+ES contains `1-800-222-1222`, 911-first rider on collapse/breathing/seizure, and drops triage terms. Tested in `CareGuideClient.test.tsx:84-91`.                                                                    |
| `careGuideTitle` / `careGuideDescription` use exact paste (no "choosing the right place")                                                                                                                                                                                                                          | **PASS** | "How care settings differ" / "Cómo se diferencian los lugares de atención". Tested in `CareGuideClient.test.tsx:93-101`.                                                                                                                    |
| `homeCarePediatricNote` (EN+ES) is PharmD paste: infant fever <3mo at 100.4°F (38°C)+ is ED-now; 911 if hard to wake / trouble breathing; under-3 diaper/urine; older dark urine -> clinician not 911; hard to wake / `despertar`; rendered under card; no bare "Low fever"; no "rectal"; no `somnolencia extrema` | **PASS** | Exact paste rendered in `CareGuideClient.tsx:92-96` under home-care card. No bare "Low fever" in checklists. No "rectal" in UI copy. Uses `muy difícil despertar`, not `somnolencia extrema`. Tested in `CareGuideClient.test.tsx:103-142`. |
| Urgent-care body contrast ≥ 4.5:1                                                                                                                                                                                                                                                                                  | **PASS** | Light: `--color-on-secondary-container: #2a5245` on `#c0ecda` = **6.80:1** (AA & AAA). Dark: `#dcf0e7` on `#1b3d33` = **10.02:1** (AAA). `CareGuideClient.tsx:51` removed `/90` opacity modifier.                                           |
| Visible emergency CTA includes US 911                                                                                                                                                                                                                                                                              | **PASS** | `MedicalDisclaimer.tsx` emergency button uses `emergencyCall` ("Call 911 (US)" / "Llamar al 911 (EE. UU.)") and displays `emergencyRegionNote`.                                                                                             |
| Articles index includes `MedicalDisclaimer`                                                                                                                                                                                                                                                                        | **PASS** | `ArticlesClient.tsx:91` mounts `<MedicalDisclaimer />`. Verified in Chromium e2e (`e2e/care-guide.spec.ts:11-17`) and live screenshot.                                                                                                      |
| EN/ES parity                                                                                                                                                                                                                                                                                                       | **PASS** | All keys present in both `en.json` and `es.json`. `npm run typecheck` (`Messages = typeof en`) passes with 0 errors.                                                                                                                        |

---

## What is actually correct (do not redo)

- Phrasing of all clinical liability warnings, positive ACS symptom lists, pediatric fever thresholds, 988 lifeline riders, and Poison Help instructions matches the spec.
- Contrast tokens: `--color-on-secondary-container: #2a5245` on `#c0ecda` in `:root` and `#dcf0e7` on `#1b3d33` in `.dark` are robust (6.80:1 and 10.02:1).
- `CareGuideClient.tsx` renders `homeCarePediatricNote` properly below the checklist.
- Scenarios section includes persistent non-advice disclaimer `tools.scenarioNotAdvice`.
- `ArticlesClient.tsx` includes `MedicalDisclaimer` at the bottom of the article listing.
- `CareGuideClient.test.tsx` and `MedicalDisclaimer.test.tsx` are thorough and cover clinical edge cases.
- `e2e/care-guide.spec.ts` verifies care-guide and articles disclaimer rendering in both EN and ES.

---

## Tests / commands (this review)

```bash
# Phase 4 unit tests
npx vitest run src/app/[locale]/tools/care-guide/CareGuideClient.test.tsx src/components/MedicalDisclaimer.test.tsx
# Output: Test Files 2 passed (2), Tests 15 passed (15)

# Full vitest suite
npx vitest run
# Output: Test Files 110 passed (110), Tests 755 passed (755)

# Typecheck & Lint
npm run typecheck # Output: pass (0 errors)
npm run lint      # Output: 0 errors, 1 pre-existing warning in GoogleAnalytics.test.tsx

# Playwright E2E
npx playwright test e2e/care-guide.spec.ts e2e/smoke.spec.ts e2e/auth.spec.ts --project=chromium
# Output: 13 passed (5.6s)
```

---

## Contrast Calculation Audit

- **Light Mode Urgent Care Card:**
  - Background: `--color-secondary-container` = `#c0ecda` (rel. lum. 0.771)
  - Text: `--color-on-secondary-container` = `#2a5245` (rel. lum. 0.070)
  - Contrast Ratio: **6.80:1** (Threshold: ≥ 4.5:1 for AA normal text, ≥ 3.0:1 for large text). **PASSED**.
- **Dark Mode Urgent Care Card:**
  - Background: `--color-secondary-container` = `#1b3d33` (rel. lum. 0.038)
  - Text: `--color-on-secondary-container` = `#dcf0e7` (rel. lum. 0.835)
  - Contrast Ratio: **10.02:1** (Threshold: ≥ 4.5:1). **PASSED**.

---

## Out of scope / logged backlog items

- **P4-1:** Tools index (`/en/tools`) card title `tools.careTitle` ("Where should I go?") still promises triage framing. To be addressed in tools index copy follow-up.
- **P4-2:** Articles catalog lists "When to Call Your Doctor vs Urgent Care vs 911" as "A simple decision guide for non-emergency symptoms." Out of Phase 4 file scope (addressed in Phase 8).
- **P4-3:** `disclaimer.emergencyTitle` / `emergencyBody` in `es.json` use informal _tú_ while care-guide copy uses _usted_. To be unified in copy alignment pass.

---

## UI Inspection Notes

| Surface                | 1440px Viewport                                                                                                                                                                                                 | 390px Viewport                                                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/en/tools/care-guide` | Clean 4-column layout; distinct visual tones; pediatric note well-spaced under home care card; scenarios 2-col; emergency disclaimer bottom CTA visible. Top red banner exhibits stutter duplication (Punch 1). | Single column stack; all cards and checklists readable; no horizontal scroll; emergency banner and disclaimer CTAs accessible. Top red banner exhibits stutter duplication (Punch 1). |
| `/es/tools/care-guide` | Spanish copy renders cleanly with proper accentuation and punctuation; consistent terminology (_usted_, _medicamentos de venta libre_). Red banner exhibits stutter duplication (Punch 1).                      | Single column stack; typography and buttons scale without overflow. Red banner exhibits stutter duplication (Punch 1).                                                                |
| `/en/articles`         | Article cards grid with `<MedicalDisclaimer />` footer rendered cleanly below listing.                                                                                                                          | Single column list with disclaimer footer rendered cleanly.                                                                                                                           |
