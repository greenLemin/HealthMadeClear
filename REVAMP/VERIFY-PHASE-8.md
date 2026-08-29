# VERIFY-PHASE-8

**Verdict: APPROVED**

Reviewer is not the Phase 8 author. Spec read from `REVAMP/PLAN.v10.md` §11.1–11.5 (Phase 8 — Citations, trust chrome, content validation), §0.1–0.3, and `REVAMP/CRITIQUES/ROUND-8.md` (Clin 🟡 3). No standalone PHASE-8 COMPLETION REPORT was found on disk; author intent and findings were reconstructed from staged diffs, test files, and `REVAMP/ISSUES-BACKLOG.md` (P8-1).

All Phase 8 acceptance criteria are met. All automated checks, content validation, typechecking, linting, unit tests, and Playwright end-to-end tests pass.

---

## Method

- **Spec**: `REVAMP/PLAN.v10.md` §11.1–11.5, §0.1–0.3, `REVAMP/CRITIQUES/ROUND-8.md`.
- **Diff Inspection**: `git diff --staged` across all Phase 8 scope files:
  - `src/components/content/ClinicalCitationBlock.tsx` (New)
  - `src/components/content/ClinicalCitationBlock.test.tsx` (New)
  - `src/components/content/TrustBanner.tsx` (New)
  - `src/components/Hero.tsx` (Modified)
  - `src/components/Hero.test.tsx` (Modified)
  - `src/components/lesson/LessonHeader.tsx` (Modified)
  - `src/components/lesson/LessonHeader.test.tsx` (New)
  - `src/components/lesson/LessonNotes.tsx` (Modified)
  - `src/app/[locale]/articles/[slug]/ArticlePageClient.tsx` (Modified)
  - `src/app/[locale]/articles/[slug]/ArticlePageClient.test.tsx` (New)
  - `src/components/PageHeader.tsx` (Modified)
  - `src/app/[locale]/learn/LearnClient.tsx` (Modified)
  - `src/app/[locale]/articles/ArticlesClient.tsx` (Modified)
  - `src/app/[locale]/tools/ToolsClient.tsx` (Modified)
  - `src/messages/en.json` (Modified)
  - `src/messages/es.json` (Modified)
  - `scripts/validate-content.ts` (Modified)
  - `scripts/validate-content.test.ts` (Modified)
  - `content/lessons/en/understanding-prescription-labels.mdx` (Modified)
  - `content/lessons/es/understanding-prescription-labels.mdx` (Modified)
  - `e2e/flows.spec.ts` (Modified)
  - `REVAMP/ISSUES-BACKLOG.md` (Modified)
- **Unit Suite (Targeted Phase 8)**: `npx vitest run src/components/content/ClinicalCitationBlock.test.tsx src/components/Hero.test.tsx src/components/lesson/LessonHeader.test.tsx 'src/app/[locale]/articles/[slug]/ArticlePageClient.test.tsx' scripts/validate-content.test.ts` — **5 files / 16 tests passed**.
- **Full Unit Suite**: `npm test` — **115 files / 783 tests passed**.
- **Content Validation**: `npm run content:validate` (`tsx scripts/validate-content.ts`) — **Passed**.
- **Content Bundling**: `npm run content:bundle` — **Passed** (clean idempotent run, 52 EN / 52 ES lessons, 15 EN / 15 ES articles, 31 EN / 31 ES glossary terms, 7 EN / 7 ES paths, 52 EN / 52 ES quizzes).
- **TypeScript & Lint**: `npm run typecheck` (0 errors), `npm run lint` (0 errors, 1 pre-existing warning in `GoogleAnalytics.test.tsx`).
- **Production Build**: `npm run build` (`prebuild` + `next build --webpack`) — **Passed** (188/188 static pages generated).
- **Playwright E2E**: `npm run test:e2e` — **108 tests passed** across all browsers and responsive viewports, including `flows.spec.ts` testing `/en/articles/understanding-your-eob` (sources visible) and `/en/learn/reading-nutrition-labels` (header citations visible).
- **Accessibility & Design Tokens**: Verified `role="note"` on `TrustBanner`, semantic `<p>`, `<ul>`, `<li>` structure on citations, Tailwind token compliance (`text-label-sm`, `text-label-md`, `bg-surface-container`, `text-on-surface`, `text-on-surface-variant`), and no layout shifts or physician badges.

---

## Acceptance Criteria Verification

| Acceptance Criterion                                                                                                                                                                 |  Status  | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Article reader shows `sources` and `reviewedBy`, not only `lastReviewed`                                                                                                             | **PASS** | `ArticlePageClient.tsx:75-80` renders compact citation under title chips; `:127-135` renders full `ClinicalCitationBlock` with source list after article body. Verified by `ArticlePageClient.test.tsx` and Playwright `flows.spec.ts`.                                                                                                                                                                                                    |
| Lesson header shows compact review/source line                                                                                                                                       | **PASS** | `LessonHeader.tsx:71-76` renders `<ClinicalCitationBlock compact sources={...} reviewedBy={...} lastReviewed={...} />` directly under H1. Verified by `LessonHeader.test.tsx` and Playwright `flows.spec.ts`.                                                                                                                                                                                                                              |
| Home shows trust banner (compact on mobile)                                                                                                                                          | **PASS** | `Hero.tsx:19-21` mounts `<TrustBanner />` above H1. `TrustBanner.tsx:11` applies `text-label-sm py-1 px-3` across all breakpoints. Eyebrow badge is replaced, not stacked. Tested in `Hero.test.tsx`.                                                                                                                                                                                                                                      |
| `content:validate` fails if sources/reviewedBy missing or placeholder-denylisted; existing 400-day `lastReviewed` fail still on                                                      | **PASS** | `scripts/validate-content.ts:51-71` checks `sources.length ≥ 1`, trimmed length ≥ 3, `reviewedBy` trimmed length ≥ 3, and denylists 11 terms (`Web`, `TBD`, `TODO`, `lorem`, `placeholder`, `Medical Team`, `Internet`, `Google`, `N/A`, `None`, `Unknown`). `assertFreshReview` (400-day fail / 365-day warn) intact. Tested in `validate-content.test.ts:69-79`.                                                                         |
| `"Health Education Review Team"` still passes                                                                                                                                        | **PASS** | `validate-content.ts` uses exact whole-string denylist check. Tested in `scripts/validate-content.test.ts:86-87` for `"Health Education Review Team"` and `"RN Health Education Team"`. False-fail strings (`Search`, `Online`, `Various`) are explicitly permitted.                                                                                                                                                                       |
| `understanding-prescription-labels` EN+ES names `1-800-222-1222` in first 3 `##` sections, in/adjacent to dosage `:::warning`, before "Special Warnings"; leads with 911-if-collapse | **PASS** | Added to `content/lessons/en/understanding-prescription-labels.mdx:55` and `content/lessons/es/understanding-prescription-labels.mdx:54` inside `## Understanding Dosage Instructions` (section 3) dosage `:::warning`. Verified before `## Special Warnings` (section 4). Exact 911 lead text matched. `pain-medications-safely.mdx` verified in EN+ES. No invented lessons created. Tested in `scripts/validate-content.test.ts:95-115`. |
| TrustBanner copy is the weaker paste; hero eyebrow is replaced (not stacked); no physician badge                                                                                     | **PASS** | `en.json:885` and `es.json:887` define exact trust copy. `Hero.tsx` replaces eyebrow without stacking. `Hero.test.tsx:40-45` asserts no physician/MD badge.                                                                                                                                                                                                                                                                                |
| EN/ES locale parity                                                                                                                                                                  | **PASS** | Catalogs `en.json` and `es.json` updated with identical key parity (`learn.reviewedBy`, `articles.sources`, `articles.reviewedBy`, `trust.banner`).                                                                                                                                                                                                                                                                                        |

---

## Detailed Code Review Findings

### 1. `src/components/content/ClinicalCitationBlock.tsx` & `ClinicalCitationBlock.test.tsx`

- **Implementation**: Clean component handling both `compact` and full display variants. If `reviewer`, `date`, and `sources` are all empty/whitespace, it gracefully renders `null`.
- **Formatting**:
  - Compact: `[Reviewed by {name}] · [{date}] · [Sources: {s1} / {s2}]` in `text-label-md text-on-surface-variant`.
  - Full: Shows reviewer paragraph, last reviewed date paragraph, and an unordered list with `list-disc pl-5 text-label-md` under a bold primary heading.
- **Translations**: Uses `useTranslations("learn")` which defines `reviewedBy`, `lastReviewed`, and `sources` in both English and Spanish.
- **Tests**: 4 unit tests covering empty render, compact formatting, partial compact rendering, and full list output with negative assertion against any "ongoing annual schedule" copy.

### 2. `src/components/content/TrustBanner.tsx`

- **A11y**: Uses `role="note"` rather than `role="alert"`.
- **Styling**: `rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface`. Responsive and compact on all screen widths.
- **Copy**: Accurately pulls from `trust.banner`.

### 3. `src/components/PageHeader.tsx` & Catalog Pages

- **Slots**: `PageHeader.tsx` added `trust?: boolean` prop (default `false`). When `true`, it centers/aligns `<TrustBanner />` cleanly above the title.
- **Catalog Integration**:
  - `src/app/[locale]/learn/LearnClient.tsx`: Passes `trust` to `PageHeader`.
  - `src/app/[locale]/articles/ArticlesClient.tsx`: Passes `trust` to `PageHeader`.
  - `src/app/[locale]/tools/ToolsClient.tsx`: Passes `trust` to `PageHeader`.

### 4. `src/components/lesson/LessonHeader.tsx` & `LessonNotes.tsx`

- **Header**: Added `<ClinicalCitationBlock compact sources={lesson.sources} reviewedBy={lesson.reviewedBy} lastReviewed={reviewedDate} />` directly below the H1 heading.
- **Notes**: Preserved Key Takeaways sidebar tips while delegating full clinical source rendering to `<ClinicalCitationBlock>` with full reviewer, date, and bulleted source list.

### 5. `src/app/[locale]/articles/[slug]/ArticlePageClient.tsx`

- **Header & Body**: Compact citation line renders below the reading time and last reviewed chips; full citation block renders after the main article body before the share card.
- **Testing**: `ArticlePageClient.test.tsx` verifies that sources ("CDC", "NIH MedlinePlus") and reviewer appear on the rendered page.

### 6. `scripts/validate-content.ts` & `scripts/validate-content.test.ts`

- **Denylist Precision**: Exact lowercase set comparison prevents false positives while rejecting placeholders.
- **Parity & Freshness**: Runs across all 104 lesson files and 30 article files during `prebuild`.
- **Emergency Callouts**: Validates that US Poison Help `1-800-222-1222` is placed before "Special Warnings" in prescription label lessons and that non-existent lesson files (`managing-multiple-medications`, `managing-high-blood-pressure`) were not created.

---

## Non-Blocking Notes & Follow-Ups

1. **P8-1 (closed 2026-08-29):** ES dosage `:::warning` now uses _usted_ throughout (`Nunca tome…` / `pregunte a su farmacéutico`). 911-first and `1-800-222-1222` unchanged.
2. **Git staging isolation:** Historical. P7 and P8 already shipped on `main`.

---

## Punch List

_None. All Phase 8 requirements and acceptance criteria are satisfied._
