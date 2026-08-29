# VERIFY-PHASE-11

**Verdict: APPROVED**

Reviewer is not the Phase 11 author. Spec read from `REVAMP/PLAN.v10.md` §14.1–14.4 (Phase 11 — Touch targets, glossary A-Z, inline terms) and the PHASE-11 COMPLETION REPORT ([P11 touch glossary](c016baa1-abf2-41c5-9fdf-2cce7f580755)). Re-checked against staged diffs, units, Chromium Playwright 390, and a live `/en/glossary` 390 screenshot.

All §14.3 acceptance criteria are met. `Header.tsx` was not edited (P10 owns close-target). Learn chips and quiz options were verify-first and left alone; Playwright confirms learn pills ≥ 44.

---

## Method

- **Spec**: `REVAMP/PLAN.v10.md` §14.1–14.4.
- **Diff**: Footer, TermsClient, Input, ContactClient, PageHeader, GlossaryClient, InlineGlossaryTerm, VisitChecklistClient (+ tests).
- **Units**: included in P10–16 targeted Vitest (pass) and full `npm test` **136 / 956**.
- **Playwright (Chromium) @390**: footer About ≥ 44; glossary `overflow-x` + related-lesson ≥ 44; contact `<select>` min-height ≥ 48; learn “All topics” pill ≥ 44.
- **UI**: `/en/glossary` 390 — A–E letter chips in a single horizontal row, E clipped (not a 26-button wrap). `REVAMP/SCREENSHOTS/phase-11/` does not exist.

---

## Acceptance criteria (re-checked)

| Criterion                                                       |         Result          | Evidence                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------- | :---------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Footer links ≥ 44px tall                                        |        **PASS**         | `Footer.tsx:6` `NAV_LINK_CLASS` = `inline-flex min-h-11 items-center py-2.5`. Playwright About box ≥ 44.                                                                                                                                                                                                              |
| Terms TOC links ≥ 44px                                          |        **PASS**         | Jump links live in `TermsClient.tsx` (P11-path; `page.tsx` only mounts client). Classes `inline-flex min-h-11 … py-2.5`.                                                                                                                                                                                              |
| PageHeader breadcrumb links ≥ 44px                              |        **PASS**         | `PageHeader.tsx` breadcrumb `Link` has `inline-flex min-h-11 items-center py-2.5`. Unit mock forwards `className`; `min-h-11` is asserted (`P11-2`, done).                                                                                                                                                            |
| Inputs ≥ 48px / 16px font                                       |        **PASS**         | `Input.tsx:72` native `<input>` has `min-h-12` and `text-base`. Contact subject `<select className="input-field min-h-12 text-base">` (`ContactClient.tsx:197`) — on the **select**, not a wrapper. Playwright min-height ≥ 48.                                                                                       |
| Glossary A-Z does not wrap on 390; dual mask fade               |        **PASS**         | `GlossaryClient.tsx:115-117`: `flex-nowrap overflow-x-auto snap-x snap-proximity` (not `snap-mandatory`); both `[-webkit-mask-image:…]` and `[mask-image:…]`; letters `h-11 min-h-11 min-w-11 shrink-0 snap-center` (`:132`). Desktop `sm:flex-wrap`. Live 390 screenshot: A–E row, E clipped. Playwright overflow-x. |
| Inline terms expanded hit area; popover tap does not close      |        **PASS**         | Trigger `relative after:absolute after:-inset-y-1.5 after:-inset-x-1 after:content-['']` (`InlineGlossaryTerm.tsx:192`). Outside-click checks `popoverRef.current?.contains(target)` (`:148`). Tests cover expander class + mousedown on dialog.                                                                      |
| Glossary related-lesson links ≥ 44px; contact select `min-h-12` |        **PASS**         | Related-lesson `inline-flex min-h-11` (`GlossaryClient.tsx:189`). Contact select above. Playwright both.                                                                                                                                                                                                              |
| Checklist rows full-label tappable                              |        **PASS**         | Whole row is a `<label>`; `min-h-12`; checkbox `h-6 w-6` (`VisitChecklistClient.tsx:111-118`). Persist skips when `wipeGeneration` increased (`:34-36`).                                                                                                                                                              |
| Quiz options / learn chips / header toggle ≥ 44 or patched      | **PASS** (verify-first) | Learn `.chip` already `min-height: 44px`; Playwright pill ≥ 44. Quiz options not rewritten. Header close is P10 `min-h-11`. P11 did not edit `Header.tsx`.                                                                                                                                                            |

---

## Punch list

None that block APPROVED.

Logged follow-ups (now done except logout UX which is also done):

- `GlossaryClient.tsx` — `@utility scrollbar-none` exists (`P11-1`, done).
- `PageHeader` test Link mock forwards `className` (`P11-2`, done).
- Same-tab logout clears checklist ticks and planner UI (`P11-3`, done).
- `Input.tsx` / contact `<select>` `text-base` now scales with Display large/largest (`globals.css`).
- Mixed index still contains `Header.tsx` because P10 is staged on the same tree. P11’s ban is “do not own Header edits”; accordion/xl diffs are P10, not a P11 product miss.

---

## What is actually correct (do not redo)

1. Glossary mobile row is snap-proximity + dual mask, letters stay 44×44, desktop wrap restored at `sm`.
2. Portaled glossary popover is in the outside-click set; first tap on the definition card does not close.
3. Checklist persist is gated on `wipeGeneration` the same way planner is.
4. Contact iOS zoom fix is on the native `<select>`, not a wrapper.
