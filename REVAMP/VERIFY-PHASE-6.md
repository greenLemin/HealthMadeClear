# VERIFY-PHASE-6

**Verdict: APPROVED** (follow-up 2026-08-29)

Client + migration file match §9.4. Process punch (mixed P5 branch) is obsolete. `015` **apply** remains post-Published (`P6-3`) — live unique still absent 2026-08-29.

---

## Historical write/review (2026-08-28)

Original verdict was **CHANGES REQUIRED** for git isolation. Product rows already passed. Do not re-open them.

Reviewer is not the Phase 6 author. Spec read from `REVAMP/PLAN.v10.md` §0.1, §9.1–§9.5. Completion report was not found as a standalone file on disk; author intent and findings were reconstructed from staged diffs plus `REVAMP/ISSUES-BACKLOG.md` P6-1…P6-3.

This is a **code/migration review** verdict. Production `015` application is post-Published on Netlify (Plan §9.2 step 0; logged in `ISSUES-BACKLOG.md` P6-3).

---

## Method

- Spec: `REVAMP/PLAN.v10.md` §0.1, §0.3, §9.1–§9.5.
- Diff: `git diff --staged` and working directory across Phase 6 scope files.
- Unit tests: `npx vitest run src/lib/quizScore.test.ts src/hooks/useProgress/mutations.test.ts src/lib/dashboard/progress.test.ts src/app/[locale]/learn/[slug]/quiz/QuizClient.test.tsx` (25/25 passed). Full suite: `npm test` (112 test files / 783 tests passed).
- Typecheck & Lint: `npm run typecheck` (pass, 0 errors); `npm run lint` (pass, 0 errors, 1 pre-existing warning in `GoogleAnalytics.test.tsx`).
- Live against `npm run dev`: Captured and visually inspected Chromium screenshots at desktop (1440px) and mobile (390px) for `/en/learn/understanding-prescription-labels/quiz`, `/es/learn/understanding-prescription-labels/quiz`, and `/en/dashboard/progress` (saved under `/tmp/hmc-phase6-screens/`).
- Database & Migration check: Audited `supabase/migrations/015_quiz_attempts_best_score.sql` and `supabase/rollback/015_emergency.sql` for ACL security, RLS on backup tables, UPDATE before DELETE ordering, deterministic tiebreaking, and `duplicate_object` error handling.
- Verified absence of `.insert()` on `quiz_attempts` across `src/` codebase.

---

## Punch list (must fix before APPROVED)

### 1. Git index & branch — 🟡 process: Phase 6 is mixed with Phase 5 on `revamp/p05-guest-progress`

Plan §0.1: "One phase = one PR. Do not mix phases."  
Plan §9.0: "Merge order: BEFORE Phase 5."  
Plan §2258: "Mega-merge Phase 5 + Phase 6 into one PR: Order P6 then P5 instead."

`git diff --staged --name-only` currently mixes Phase 6 files with Phase 5 implementation files on branch `revamp/p05-guest-progress`. Staged files include Phase 5 auth forms, guest migration hooks, provider updates, and messages:

- `src/app/[locale]/auth/login/LoginForm.tsx`
- `src/app/[locale]/auth/signup/SignupForm.tsx`
- `src/components/AppProviders.tsx`
- `src/components/AppProviders.test.tsx`
- `src/hooks/useProgress/guestMigration.ts`
- `src/hooks/useProgress/guestMigration.test.tsx`
- `src/hooks/useProgress/supabaseProgress.ts`
- `src/messages/en.json`
- `src/messages/es.json`
- Phase 5 `sessionStorage` migration and UI lesson union in `src/lib/guestProgress.ts` and `src/lib/guestProgress.test.ts`

**Fix:** Unstage Phase 5 changes and create a dedicated branch `revamp/p06-quiz-persist` containing strictly the Phase 6 file scope:

- `supabase/migrations/015_quiz_attempts_best_score.sql`
- `supabase/rollback/015_emergency.sql`
- `src/lib/quizScore.ts`
- `src/lib/quizScore.test.ts`
- `src/app/[locale]/dashboard/progress/components/clamp.ts`
- `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx`
- `src/app/[locale]/learn/[slug]/quiz/QuizClient.test.tsx`
- `src/hooks/useProgress.ts` (Phase 6 `supabaseQuizAttempts` argument passing)
- `src/hooks/useProgress.test.tsx` (upsert mock addition)
- `src/hooks/useProgress/mutations.ts`
- `src/hooks/useProgress/mutations.test.ts`
- `src/hooks/useProgress/queries.ts`
- `src/lib/dashboard/activity.ts`
- `src/lib/dashboard/progress.ts`
- `src/lib/dashboard/progress.test.ts`
- `src/lib/dashboard/quizzes.ts`
- `src/lib/guestProgress.ts` (Phase 6 `normalizeStoredScore` & `QUIZ_ATTEMPTS_ON_CONFLICT` on migrate only)
- `REVAMP/ISSUES-BACKLOG.md` (P6-1…P6-3 only)

### 2. `src/hooks/useProgress/mutations.ts:36-39` — 🔵 architecture: `quizAttemptsRef` synchronization timing

In `useProgressMutations`:

```ts
const quizAttemptsRef = useRef(supabaseQuizAttempts);
useEffect(() => {
  quizAttemptsRef.current = supabaseQuizAttempts;
}, [supabaseQuizAttempts]);
```

`saveQuizAttempt` updates `quizAttemptsRef.current` synchronously and triggers `setSupabaseQuizAttempts(next)`. On network error, it reverts `quizAttemptsRef.current = prev; setSupabaseQuizAttempts(prev);`.

However, synchronizing external updates from `supabaseQuizAttempts` into `quizAttemptsRef` via `useEffect` runs asynchronously after render. While safe for standard quiz submit flows, prefer keeping state mutations functional or accessing current state directly without stale closure vulnerability.

---

## Acceptance criteria (re-checked)

| Criterion                                                                                                                                                 | Result                          | Evidence                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `015` applied: unique `(user_id, quiz_id)` exists; duplicate pairs = 0; no live rows with `score > max_score`. Applied after Netlify Published for P6 SHA | **PASS (code/migration ready)** | `015_quiz_attempts_best_score.sql` moved to `supabase/migrations/`; contains unit UPDATE before DELETE; `CREATE TABLE ... backup` immediately revokes privileges and enables RLS; unique added via idempotent block. Rollback `015_emergency.sql` in `supabase/rollback/`. Applying to prod is gated on Netlify Published (P6-3). |
| No `.insert()` on `quiz_attempts` in `src/` except tests/mocks                                                                                            | **PASS**                        | Grep verified 0 instances of `.insert()` on `quiz_attempts` across `src/`. `mutations.ts` and `guestProgress.ts` use `.upsert(..., { onConflict: QUIZ_ATTEMPTS_ON_CONFLICT })`.                                                                                                                                                   |
| `QuizClient` persists counts; UI still shows percent and uses `quiz.passScore`                                                                            | **PASS**                        | `QuizClient.tsx:58-63` computes `percentScore` and `passed = percentScore >= quiz.passScore` for display. `QuizClient.tsx:122` calls `saveQuizAttempt(quiz.id, lessonId, correctCount, total, answerArray)`. Tested in `QuizClient.test.tsx:79-116`.                                                                              |
| 1/5 is `passed: false` in DB; 4/5 is `passed: true`. UI and DB agree at 70%                                                                               | **PASS**                        | `isQuizPassed(score, maxScore)` in `src/lib/quizScore.ts` uses `PASS_RATIO = 0.7`. Tested: 4/5 is true (80%), 1/5 is false (20%). `015` SQL uses `score::numeric / max_score >= 0.7`.                                                                                                                                             |
| Dashboard average for one 4/5 quiz is **80**, not 1600. Assert on `summary.averageQuizScore` (raw). `clampPercent(1600) === 100` is a false green         | **PASS**                        | `getUserProgressSummary` in `src/lib/dashboard/progress.ts:51` uses `toPercent(totalScore, totalMaxScore)`. Tested in `progress.test.ts:177-198` asserting raw `summary.averageQuizScore === 80` and `!== 1600`.                                                                                                                  |
| Completed-lessons tab shows 80 for `quiz_id === lessonId` (and still for legacy `-quiz` if present)                                                       | **PASS**                        | `getCompletedLessonsPaginated` queries `quizIdsForLesson` (both live ID and `${id}-quiz`) and maps best score using `attempt.quiz_id.replace(/-quiz$/, "")`. Tested in `progress.test.ts:362-424`.                                                                                                                                |
| Retake with unique constraint does not toast save error when score updates or is lower                                                                    | **PASS**                        | `mutations.ts:92-104` checks `if (existing && score <= existing.score)`: skips DB write, invokes `handleQuizAttemptSideEffects`, does not show error toast. When higher, upserts with `ignoreDuplicates: false`. Tested in `mutations.test.ts:245-275`.                                                                           |
| Failed network restores previous best score in UI                                                                                                         | **PASS**                        | `mutations.ts:125-128` catches `{ error }`, restores `prev` snapshot to state and ref, and displays error toast. Tested in `mutations.test.ts:296-313`.                                                                                                                                                                           |
| Dashboard average/passed counts unique quizzes                                                                                                            | **PASS**                        | `getUserProgressSummary` in `src/lib/dashboard/progress.ts:38-48` builds `bestByQuizId` map and calculates totals from `uniqueQuizzes`. Tested in `progress.test.ts:150-175`.                                                                                                                                                     |
| `perfect-quiz` can fire (`score === maxScore` on a 5/5)                                                                                                   | **PASS**                        | `checkAndAwardAchievements` condition `context.quizScore === context.quizMaxScore` evaluates `5 === 5` (true). Phase 7 gamification pass will wire localized toasts.                                                                                                                                                              |

---

## What is actually correct (do not redo)

- `src/lib/quizScore.ts` matches §9.1.1 fenced block exactly (`PASS_RATIO`, `isQuizPassed`, `toPercent`, `normalizeStoredScore`, `quizIdsForLesson`).
- `src/lib/quizScore.test.ts` thoroughly tests all edge cases (80/5 → 4/5, 4/5 unchanged, 8/10 unchanged, 80/100 unchanged, 60/60 → 36/60, pass threshold at 70%).
- `supabase/migrations/015_quiz_attempts_best_score.sql` correctly places `UPDATE` before `DELETE`, secures the temporary backup table against unauthorized PostgREST reads, and adds the unique constraint safely.
- `supabase/rollback/015_emergency.sql` drops the constraint only and documents the rollback ordering hazard vs upsert clients.
- `QuizClient.tsx` accurately separates UI percentages from persisted count units and resets recorded state on retake.
- `src/hooks/useProgress/mutations.ts` handles optimistic UI, error rollback, upsert conflict targets, and skips redundant writes on lower/equal retakes while continuing streak/daily_log side effects.
- `src/hooks/useProgress/queries.ts` converts count scores to percentages via `toPercent`.
- `src/lib/dashboard/progress.ts`, `quizzes.ts`, and `activity.ts` compute averages correctly without 1600% inflation and resolve both live quiz IDs and legacy `-quiz` suffixes.
- `src/app/[locale]/dashboard/progress/components/clamp.ts` is documented as display bounds only.

---

## Tests / commands (this review)

```bash
# Phase 6 unit tests
npx vitest run src/lib/quizScore.test.ts src/hooks/useProgress/mutations.test.ts src/lib/dashboard/progress.test.ts src/app/[locale]/learn/[slug]/quiz/QuizClient.test.tsx
# Output: Test Files 4 passed (4), Tests 25 passed (25)

# Full vitest suite
npx vitest run
# Output: Test Files 112 passed (112), Tests 783 passed (783)

# Typecheck & Lint
npm run typecheck # Output: pass (0 errors)
npm run lint      # Output: 0 errors, 1 pre-existing warning in GoogleAnalytics.test.tsx

# Playwright E2E
npx playwright test e2e/smoke.spec.ts e2e/auth.spec.ts e2e/care-guide.spec.ts --project=chromium
# Output: 13 passed (5.6s)
```

---

## Out of scope / logged backlog items

- **P6-1:** `supabase/codemap.md` still lists 015 as pending (docs follow-up).
- **P6-2:** `src/lib/codemap.md` omits `quizScore.ts` (docs follow-up).
- **P6-3:** Production `015` apply is post-Published on Netlify, not during client PR build.

---

## UI Inspection Notes

| Surface                                            | 1440px Viewport                                                                                                                                                   | 390px Viewport                                                                                  |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `/en/learn/understanding-prescription-labels/quiz` | Clean quiz start card; shows 10 questions and 70% passing threshold; "Start quiz" CTA styled properly; disclaimer visible below.                                  | Single column layout; badges, start button, and disclaimer well-spaced; no horizontal overflow. |
| `/es/learn/understanding-prescription-labels/quiz` | Spanish localized start card ("Cuestionario: Entendiendo las etiquetas de recetas", "Necesitas al menos 70% para aprobar"); typography and buttons scale cleanly. | Compact single column; responsive button widths; no text truncation.                            |
| `/en/dashboard/progress`                           | Dashboard overview renders stats cards; quiz performance metrics calculate cleanly without percent inflation; completed lessons tab maps scores.                  | Single column stacked metrics; category bars and badges aligned.                                |
