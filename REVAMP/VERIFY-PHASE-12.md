# VERIFY-PHASE-12

**Verdict: APPROVED** (follow-up 2026-08-28)

Original review was CHANGES REQUIRED for CI lint. Punch items are fixed:

- `useVisitPlanner.ts` syncs `catalogRef` in an effect, not during render
- `SearchDialog.tsx` derives loading from locale mismatch (no `setState` at effect start)
- `search.groupOther` / `search.indexError` i18n; Step1 `disabled={!hydrated}` plus inert
- `npm run lint` is clean (0 errors)

---

Reviewer is not the Phase 12 author. Spec read from `REVAMP/PLAN.v10.md` §15.1–15.5 and mini-specs §10.6 / §10.9, plus the PHASE-12 COMPLETION REPORT ([P12 search planner](30eb5253-7ad7-4b6e-93e7-99a1a9cadc6c)). Product behavior matches the checkboxes (units + Chromium e2e). **CI lint is clean** after the punch fixes below.

---

## Method

- **Spec**: `REVAMP/PLAN.v10.md` §15.1–15.5, §10.6, §10.9.
- **Diff**: SearchDialog, SearchDialogContent + test, visitPlanner types, preferences, `useVisitPlanner` + test, VisitPlannerClient + test, Step2, Step3.
- **Units**: `SearchDialogContent.test.tsx`, `useVisitPlanner.test.ts`, `VisitPlannerClient.test.tsx` — pass (included in 956).
- **Playwright (Chromium)**: search `eob` live region `/\d+/`; planner Continue focuses `H2`.
- **Lint**: `npm run lint` — **0 errors**. Original punch (ref-during-render / setState-in-effect) is fixed.

---

## Punch list (fixed 2026-08-28)

### 1. `useVisitPlanner.ts` — catalog ref write during render — **fixed**

`catalogRef.current = questionCatalog` runs in `useEffect(..., [questionCatalog])`.

### 2. `SearchDialog.tsx` — `setState` in locale-index effect — **fixed**

Loading is derived (`indexState.locale !== locale`). Fetch sets ready/error only.

Also: `search.groupOther` / `search.indexError`; Step1 `disabled={!hydrated}` plus inert.

---

## Acceptance criteria (re-checked)

| Criterion                                                                                                     |     Result      | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------- | :-------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Search loading ≠ empty miss                                                                                   |    **PASS**     | `SearchDialogContent.tsx:179-187`: loading copy; empty query + loading does not mount EmptyState. Test: “does not show empty miss while the index is loading”.                                                                                                                                                                                                                                                                                               |
| Results grouped; SR count announced                                                                           |    **PASS**     | Group order `lesson, path, article, glossary, tool` then Other (`:11, :37-57`). Stable `#search-results-live` `role="status" aria-live="polite"` (`:136-141`); text set after 350ms, node not remounted (test advances fake timers, then rerender, same node). Dialog `aria-busy` while loading (`SearchDialog.tsx:145,156`). Panel `max-h-[calc(100svh-12rem)]` not `100dvh` (`SearchDialogContent.tsx:176`). `border-l-4` uses existing tokens (`:13-18`). |
| Switch locale after save: questions from ids, not mixed                                                       | **PASS** (unit) | Storage writes ids to `hmc-visit-planner-v2`. Step 2/3 resolve via current catalog. No EN↔ES Playwright remount (`P12-2`).                                                                                                                                                                                                                                                                                                                                   |
| v1 migrate or drop; customQuestions survive; unmapped not promoted; visit-type + Next disabled until hydrated |    **PASS**     | `migrateSelectedQuestions` (`useVisitPlanner.ts:50-68`): regex ids kept, catalog text mapped, else **dropped**. `customQuestions` copied as-is (`:152`). v1 key still read (`:73-75`); v1 not deleted. `changeVisitType` / `setStep` no-op until `hydrated` (`:179-185`). UI: inert + `aria-busy` on step card; Next `disabled={!hydrated}`.                                                                                                                 |
| Step change focuses heading                                                                                   |    **PASS**     | Playwright: Continue → `document.activeElement` tag `H2`.                                                                                                                                                                                                                                                                                                                                                                                                    |
| Step 3 summary visually separated                                                                             |    **PASS**     | `Step3Review.tsx` summary `border-2 border-primary/20 bg-surface-container-lowest p-6 shadow-elevation-2` + print classes.                                                                                                                                                                                                                                                                                                                                   |
| First load `new-symptom:2`+`:3`; medication → `medication:1`+`:3`                                             |    **PASS**     | `PLANNER_DEFAULTS_BY_TYPE` (`useVisitPlanner.ts:15-18`) matches §15.2 exactly, including `followup:0`+`:3`. Live planner UI: “2 questions saved”.                                                                                                                                                                                                                                                                                                            |

---

## Notes (not punch-list)

- Unknown search type header uses `search.groupOther` (`P12-1`, done).
- Step1 visit-type buttons use `disabled={!hydrated}` **and** `inert` (`P12-path`, done).
- Search live-region tests **do** assert 350ms + stable node identity — not an empty test.

---

## What is actually correct (do not redo)

1. `PLANNER_DEFAULTS_BY_TYPE` lives in the hook; `changeVisitType(next)` looks it up internally; parent does not pass a visitType-keyed defaults array into hydrate.
2. Persist skips `!hydrated`. A later `wipeGeneration` bump resets in-memory planner state (and checklist ticks) so same-tab logout does not keep stale UI. v1 remains for rollback.
3. Index lazy-load is still `import(\`@/data/searchIndex.${locale}.ts\`)` (`SearchDialog.tsx:43`).
