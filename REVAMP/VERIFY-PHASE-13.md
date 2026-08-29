# VERIFY-PHASE-13

**Verdict: APPROVED** (follow-up 2026-08-28)

Original review was CHANGES REQUIRED for reduced-motion first-paint autoplay. Punch item is fixed:

- `useMotionSafe` is `useReducedMotion() ?? true` (unknown = skip motion)
- HomeClient pauses the video when the flag is set
- P13A e2e asserts no `autoplay` and `paused` under `reducedMotion: "reduce"`
- `text-title-md` is on the type scale; `useReadingProgress` samples on mount; `paths.stepXofY` exists

---

Reviewer is not the Phase 13 author. Spec read from `REVAMP/PLAN.v10.md` §16.1–16.4 and mini-specs §10.2 / §10.7, plus PHASE-13A / 13B-exclusive / 13B-pages completion reports. Fold, TOC shell, quiz CLS, path mobile, and reduced-motion autoplay match §16.3 after the punch fix.

---

## Method

- **Spec**: `REVAMP/PLAN.v10.md` §16.1–16.4, §10.2, §10.7.
- **Diff**: Hero, HomeClient, ArticlePageClient, LessonPageClient (`z-[60]` + preserve P15 footers), QuizFeedback, LessonCard, ResourceCard, LearningPathDetailClient, slugify.
- **Units**: Hero, HomeClient, QuizFeedback, QuizClient, path detail, slugify, ArticlePageClient, LessonPageClient — pass.
- **Playwright (Chromium)**: P13A 1440 Start learning `y+height = 516` (need `< 900`); P13B TOC gap **64px**, paragraph max **606px**, one `main#main-content`, article before aside.
- **UI**: live `/en` 1440 (CTAs in view, TrustBanner, video below fold); `/en/articles/understanding-your-eob` 1440 (Print + On This Page). `REVAMP/SCREENSHOTS/phase-13/` does not exist.

---

## Punch list (fixed 2026-08-28)

### 1. `useMotionSafe` + HomeClient autoplay — **fixed**

`useMotionSafe` is `useReducedMotion() ?? true`. Unknown preference skips autoplay. HomeClient pauses the video when the flag is set. P13A e2e asserts no `autoplay` and `paused` under `reducedMotion: "reduce"`. Hero H1 computed `font-size <= 56` at 1440. Stitch uses `object-top`.

---

## Acceptance criteria (re-checked)

| Criterion                                                                                                                       |  Result  | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------- | :------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero H1 ≤ 56px at 1440                                                                                                          | **PASS** | Clamp max 3.5rem = 56px. P13A e2e also reads computed `font-size` at 1440 (`P13A-2`, done).                                                                                                                                                                                                                                                                                                                                                                                                                              |
| All breakpoints: CTAs above video; 1440 `y+height < 900`; TrustBanner one line; reduced-motion no autoplay; `preload="none"`    | **PASS** | Hero then video `preload="none"`. Playwright fold `< 900`. Autoplay off under `reducedMotion: "reduce"`. H1 computed ≤ 56px at 1440 (`P13A-2`, done).                                                                                                                                                                                                                                                                                                                                                                    |
| Article ~65ch; TOC desktop; `scroll-mt-24`; article before aside; no nested main; TOC ≤ 80px of prose; mobile progress `z-[60]` | **PASS** | Shell `mx-auto max-w-5xl … lg:grid-cols-[minmax(0,1fr)_240px]` (`ArticlePageClient.tsx:151`) — not `max-w-container` on that grid. `<article id="article-body" className="max-w-prose leading-[1.75]">` then `<aside aria-label={t("onThisPage")}>` sticky `top-24 hidden lg:block`. Section ids + `scroll-mt-24` (`:157-164`). Progress `fixed … z-[60] h-1.5` `role="progressbar"` (`:88-96`). Lesson bar also `z-[60]` (`LessonPageClient.tsx:144-151`). Playwright gap 64, prose 606, one main. No scroll-spy added. |
| Quiz feedback slot reserved                                                                                                     | **PASS** | `QuizFeedback.tsx:17` wrapper always `min-h-[140px]`; alert only when `showResult && correct !== null`.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Lesson card titles clamp; P11 filters                                                                                           | **PASS** | `LessonCard` / `ResourceCard` `text-title-md line-clamp-2`. `title-md` is on the Tailwind scale (`P13B-2`, done).                                                                                                                                                                                                                                                                                                                                                                                                        |
| Path detail usable at 390                                                                                                       | **PASS** | `LearningPathDetailClient` `flex-col` + `sm:flex-row`; mobile badge uses `paths.stepXofY` (`P13B-1`, done).                                                                                                                                                                                                                                                                                                                                                                                                              |

---

## Notes (not punch-list)

- Article/lesson progress samples on mount and resize (`useReadingProgress`, `P13B-5`, done).
- P15 print footers remain **outside** `Reveal` on both article (`ArticlePageClient.tsx:247-253`) and lesson (`LessonPageClient.tsx:207-213`).
- QuizClient still persists `correctCount`, not percent (`QuizClient.tsx:122`). `score={percentScore}` is display-only.

---

## What is actually correct (do not redo)

1. 13A fold: Hero-first + `items-start` + capped stitch image. Do not restore `items-center` against a tall right column.
2. 13B reading shell is `max-w-5xl` + `minmax(0,1fr)_240px`, article DOM-first, no nested `main#main-content`.
3. `slugify.ts` duplicate titles → `-2`. Quiz CLS slot is always in the document.
4. TrustBanner from Phase 8 is kept; eyebrow not restored.
