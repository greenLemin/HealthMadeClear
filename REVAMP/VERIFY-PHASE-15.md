# VERIFY-PHASE-15

**Verdict: APPROVED**

Reviewer is not the Phase 15 author. Spec read from `REVAMP/PLAN.v10.md` §18.1–18.4 and mini-specs §10.3–10.5, plus PHASE-15 exclusive and 15A page reports ([P15 print share](aaf62bb6-04eb-4de7-a14f-a453b788e767), [P15A footers](64df6122-09be-4bf7-b027-af0ace9edfa7)). Re-checked against staged diffs, units, Chromium Playwright, and live lesson / care-guide / article screenshots.

All §18.3 acceptance criteria are met. PrintButton did not slip. Print footer dates refresh on `beforeprint` (`P15-4`, done).

---

## Method

- **Spec**: `REVAMP/PLAN.v10.md` §18.1–18.4, §10.3–10.5.
- **Diff**: PrintButton + test, `shareCurrentPage` + test, `globals.css` print block, LessonHeader, ArticlePageClient, LessonPageClient, CareGuideClient, EarnedAchievements.
- **Units**: PrintButton, shareCurrentPage, LessonHeader, CareGuide, EarnedAchievements, article/lesson page tests — pass (in 956).
- **Playwright**: lesson Print control visible; print-only disclaimer attached and **hidden** on screen (`does not replace medical advice`).
- **UI**: `/en/learn/understanding-prescription-labels` — Print, Copy link, Share on X in header. `/en/tools/care-guide` — Print in header; red 911 banner on screen. `/en/articles/understanding-your-eob` — Print in share row. `REVAMP/SCREENSHOTS/phase-15/` does not exist.

---

## Acceptance criteria (re-checked)

| Criterion                                                                                                                   |  Result  | Evidence                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------- | :------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lesson, article, care-guide have Print; print-only 911/988 + educational footer with print-time date; red banner `no-print` | **PASS** | `usePrintDate` refreshes on `beforeprint` for care-guide, article, and lesson (`P15-4`, done).                                                                                                                                                                                                                              |
| Lesson **and** article print-only footers outside `Reveal`, `disclaimer.printMedicalWarning` + timestamp, both locales      | **PASS** | Article `ArticlePageClient.tsx:247-253` `hidden print:block` **after** the Reveal blocks. Lesson `LessonPageClient.tsx:207-213` same, after the grid, not inside Reveal. Exact EN/ES pharmacist-as-person paste (`en.json:66-67`, `es.json:66-67`). No “pharmaceutical advice.” Playwright: node attached + `toBeHidden()`. |
| Lesson copy link + X share; `navigator.share` when present else clipboard                                                   | **PASS** | LessonHeader uses `shareCurrentPage` + separate X intent. `shareCurrentPage.ts:19-34`: `typeof navigator.share === "function"` → share; `AbortError` silent; else clipboard; non-HTTPS clipboard failure → `onError`. Article keeps existing copy/X plus Print in share row (`:124-146`, `:220-239`).                       |
| Opening a lesson updates recents without catalog click                                                                      | **PASS** | `LessonPageClient.tsx:89-91` `useEffect` → `markLessonViewed(lesson.id)` once. Existing unshift-unique. High-liability slugs still get the same footer.                                                                                                                                                                     |
| Zero achievements shows empty state                                                                                         | **PASS** | `EarnedAchievements.tsx:17-31`: `EmptyState` + CTA `href="/learn"` (i18n `ButtonLink` via EmptyState). Does **not** `return null`. Dead `onClick: () => {}` is unused when `href` is set (`EmptyState.tsx:60-62`).                                                                                                          |

---

## Punch list

None that block APPROVED.

Logged follow-up: `usePrintDate` refreshes on `beforeprint` (`P15-4`, done).

GA is not wired on Print (spec: do not).

---

## What is actually correct (do not redo)

1. Clinical footers are outside `Reveal` so paper is not `opacity: 0`.
2. Care-guide fridge print has 911/988 **and** the educational footer; red chrome stays `no-print`.
3. Share helper treats user-cancel `AbortError` as success-path silence.
4. Recents update from the lesson route itself.
