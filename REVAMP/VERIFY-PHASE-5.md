# VERIFY-PHASE-5

**Verdict: CHANGES REQUIRED**

Reviewer is not the Phase 5 author. Spec read from `REVAMP/PLAN.v10.md` §0.1–0.3, §8.1–8.5 (Phase 5 — Guest progress unification + login migration). No PHASE-5 COMPLETION REPORT exists on disk or in a dedicated implementer transcript. Author intent reconstructed from `git diff --staged` on `revamp/p05-guest-progress`, `REVAMP/ISSUES-BACKLOG.md` (P6-1…P6-3 only), and the Phase 6 implementer transcript which already noted Phase 5 files dirty on this same branch.

This is a **write/review** verdict. Do **not** merge. Production `quiz_attempts` still has no unique `(user_id, quiz_id)`. Plan forbids merging Phase 5 until that unique is live.

---

## Method

- Spec: `REVAMP/PLAN.v10.md` §8.1–8.5, merge-order rules in §0.1 / Day-2 calendar, C8 / C23, anti-pattern “Mega-merge Phase 5 + Phase 6”.
- Diff: `git diff --staged` (28 files). Branch `revamp/p05-guest-progress` at `13eb2c0f` + staged index. No unstaged/untracked leftovers.
- Unit: `npx vitest run` on Phase 5 (+ mixed P6) test files (7 files / 68 tests passed); full suite `npm test` (112 files / 783 tests passed); `npm run lint` (0 errors, 1 pre-existing warning in `GoogleAnalytics.test.tsx`); `npm run typecheck` (0 errors).
- E2E: `npx playwright test e2e/auth.spec.ts e2e/smoke.spec.ts e2e/dashboard.spec.ts --project=chromium` — auth + smoke 10/10 passed; dashboard 0/3 (mock login rejected; see Tests). Follow-up `e2e/flows.spec.ts` login-validation passed.
- Live `npm run dev` (`http://localhost:3000`): Chromium screenshots of `/en/auth/login`, `/en/auth/signup`, `/es/auth/login`, `/es/auth/signup` at desktop; `/es/auth/signup` at 390px; adjacent `/en/auth/forgot-password`. No `REVAMP/SCREENSHOTS/phase-5/`.
- Live project `xdmbyadosmzixsxqullj`: `pg_constraint` on `quiz_attempts`, `schema_migrations`, duplicate-pair count.
- Did **not** `db push`. Did **not** apply `015`.

---

## Punch list (must fix before APPROVED)

### 1. Git index — 🔴 process: Phase 5 + Phase 6 mega-merged on `revamp/p05-guest-progress`

Plan §0.1: **one phase = one PR. Do not combine 5+6.** Merge order: Phase 6 Published **and** `015` applied **before** Phase 5. Anti-pattern table: “Mega-merge Phase 5 + Phase 6 into one PR → Order P6 then P5 instead.”

`git diff --staged --name-only` on this branch mixes both phases (28 files, +1031/−310). Phase 6 files that do not belong in a P5 PR:

- `src/lib/quizScore.ts` / `src/lib/quizScore.test.ts`
- `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx` / `QuizClient.test.tsx`
- `src/hooks/useProgress/mutations.ts` / `mutations.test.ts`
- `src/hooks/useProgress/queries.ts`
- `src/lib/dashboard/progress.ts` / `progress.test.ts` / `quizzes.ts` / `activity.ts`
- `src/app/[locale]/dashboard/progress/components/clamp.ts`
- `supabase/migrations/015_quiz_attempts_best_score.sql` (renamed from pending)
- `supabase/rollback/015_emergency.sql`
- `REVAMP/ISSUES-BACKLOG.md` P6-1…P6-3

Phase 6 was implemented on this same branch (completion report there). Phase 5 then landed on top. Result: you cannot apply `015` after a P6-only Netlify Published SHA, because there is no P6-only SHA.

**Fix:** Unstage P6 files. Land `revamp/p06-quiz-persist` first. Wait for Netlify **Published**, then apply `015` (Gate in §9.2). Only then merge a P5-only `revamp/p05-guest-progress`. Do not ship 5+6 as one PR even though `guestProgress.ts` wants `normalizeStoredScore` — that helper must come from merged P6, not a bundled commit.

### 2. Production — 🔴 merge gate: unique `(user_id, quiz_id)` does not exist

§8.4: “Production has unique `(user_id, quiz_id)` **before** this PR merges (Phase 6 gate).” §8.0: `ON CONFLICT` without that unique is Postgres **`42P10`**. This phase makes localStorage survive tab close and **amplifies** 42P10 if merged first.

Live `quiz_attempts` constraints (project `xdmbyadosmzixsxqullj`):

- `quiz_attempts_pkey` = `PRIMARY KEY (id)` only
- No unique on `(user_id, quiz_id)`
- `schema_migrations` still `001`–`008` + dummy `create_test_file` — **no 014, no 015**
- Duplicate pairs currently 0 (lucky; constraint still missing)

`migrateGuestProgressToSupabase` still `.upsert(..., { onConflict: QUIZ_ATTEMPTS_ON_CONFLICT })` (`src/lib/guestProgress.ts:237-239`). LoginForm also awaits that migrate before redirect (`LoginForm.tsx:82-86`). Merging this client while unique is absent turns every guest-with-quizzes login into `42P10`, swallowed, dashboard empty.

**Fix:** Do not merge Phase 5 until punch 1’s P6 PR is Published and `015` is applied. Re-check: unique exists; `score > max_score` rows = 0; duplicate pairs = 0.

### 3. `src/components/providers/AuthProvider.tsx:44-47` — 🔴 privacy: `signOut` does not wipe guest or UI health keys

§8.4: “`signOut` clears guest prefix **and** UI health keys via `resetLocalProgress`. Login/signup shows `guestProgressWillSync`. Theme/locale survive.”

§8.1 AuthProvider: do not regress P9. If this PR merges before P9 (it would — `resetLocalProgress` / `expireClientAuthCookies` **do not exist anywhere in `src/`**), “create `resetLocalProgress` / `clearLocalHealthData` / `expireClientAuthCookies` here rather than a second util — still `finally`, never success-only.”

§12 (Phase 9 deps): “Wipe must also exist before Phase 5 makes guest localStorage canonical.”

Current `signOut`:

```ts
const signOut = useCallback(async () => {
  await supabase.auth.signOut();
  router.push("/");
}, [supabase, router]);
```

No `{ error }` handling, no throw path, no `finally`, no cookie expire, no `resetLocalProgress`. AuthProvider was **not in the staged diff**. `AuthProvider.test.tsx:131-153` still only asserts `signOut` + `router.push("/")` — it was not weakened, but it also does not cover the wipe Phase 5 now requires.

Phase 5 made `hmc_guest_*` survive tab close. Combined with `clearGuestProgress` only deleting the `hmc_guest_` prefix (`guestProgress.ts:176-182`) and leaving `STORAGE_KEYS.completedLessons` / `hmc-quiz-scores` in place, a shared-device logout leaves the next browser user with the previous person’s lesson completions.

**Fix:** Add `resetLocalProgress` (guest prefix + UI health keys; **not** theme/locale/simpleMode) and `expireClientAuthCookies`. Call both in `signOut` `finally` along with `setUser(null); setSession(null); router.push("/")`. Treat `{ error }` **and** throw; keep a local `signOut` fallback. Extend `AuthProvider.test.tsx` as specified in §8.3. Do not add a 2-hour migrate TTL.

### 4. `src/hooks/useProgress.ts:46-50` — 🟡 race: `onMigrated` is a no-op; `refetch` never called

§8.1 / step 7: pass `onMigrated` **or** call `refreshProgress` when migration completes. “When `migrated` flips true, `refetch()`.” “Do not fetch progress until migration finished when guest data exists.”

`useSupabaseProgress` does expose `refetch` (`supabaseProgress.ts:86-88`). `useProgress` ignores it:

```ts
const onMigrated = useCallback(() => {
  // onMigrated callback handles refetching if migration completes
}, []);

const { isMigrationLoading } = useGuestMigration(user, supabase, authLoading, onMigrated);
```

`migrated` is not even destructured. Fetch is gated with `fetchWhen: !isMigrationLoading && !!user`, which **does** delay the first fetch until migrate finishes — that part matches the `enabled` option. But:

- `isLoading` is only `isMigrationLoading || authLoading` (`useProgress.ts:90`). Spec allowed adding `isFetchLoading`. After `finally` sets `isMigrationLoading` false, UI can paint empty `supabaseCompletedLessonIds` before the fetch effect runs. That is the original “empty dashboard after login” symptom, just after migrate instead of during it.
- Comment on `migrateGuestProgressToSupabase` (`guestProgress.ts:189`) claims “Order: migrate → caller refetches → clear.” Code still `clearGuestProgress()` inside the migrate function on `errors.length === 0` (`guestProgress.ts:247-250`), **before** any refetch. Caller cannot refetch-then-clear.
- `guestMigration.test.tsx:110-128` asserts `onMigrated` is called — true only if the caller passes a real callback. Production passes an empty one. Test does not prove dashboard IDs appear.

**Fix:** Destructure `refetch` from `useSupabaseProgress`. `onMigrated` must call `refetch()`. Prefer: upsert → refetch → `clearGuestProgress` only if refetch succeeded (or keep clear-on-upsert-ok but keep `isLoading` true until refetch settles). Add `useProgress.test.tsx` coverage that when guest data exists, lesson/quiz `select` is **not** called until migrate resolves, and that completed IDs appear from the post-migrate fetch without a second user mutation.

### 5. `src/lib/guestProgress.ts:34-36` / `:143-144` — 🟡 data loss: one bad quiz row drops the whole guest quiz list

§8.4: “Malformed JSON does not throw; **migrate skips bad entries**.”

```ts
function isGuestQuizAttemptArray(x: unknown): x is GuestQuizAttempt[] {
  return Array.isArray(x) && x.every(isGuestQuizAttempt);
}
// ...
const quizAttempts = isGuestQuizAttemptArray(rawQuizzes) ? rawQuizzes : [];
```

`[{ quizId: "a", score: 4, maxScore: 5 }, { foo: 1 }]` → `[]`. Same all-or-nothing for lessons via `isStringArray` (`guestProgress.ts:12-14`). Tests only cover an array that is _entirely_ `{foo:1}` or `lessonId`-only (`guestProgress.test.ts:145-156`).

**Fix:** `Array.isArray(x) ? x.filter(isGuestQuizAttempt) : []` (and filter strings for lessons). Add a mixed-array test that the good `quizId` row still migrates.

---

## Acceptance criteria (re-checked)

| Criterion                                                                                                                                      | Result                            | Evidence                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest quiz JSON in localStorage contains `quizId`, never only `lessonId`                                                                       | **PASS** (write path)             | `saveQuizAttempt` writes `{ quizId, score, maxScore }` (`guestProgress.ts:160-169`). Guard rejects `lessonId`-only (`guestProgress.test.ts:150-156`). Read path all-or-nothing: punch 5.                                                                             |
| Complete a lesson as guest, close tab, reopen, signup/login migrates completions                                                               | **PARTIAL**                       | Store is `localStorage` (`getStorage` `guestProgress.ts:41-48`). Tab-close survival is real. Live migrate cannot succeed until unique exists (punch 2). Playwright live migrate skipped per spec.                                                                    |
| `sessionStorage`-only legacy data still migrates once                                                                                          | **PASS**                          | `migrateLegacySessionGuest` (`guestProgress.ts:79-117`). Test `guestProgress.test.ts:168-176`.                                                                                                                                                                       |
| Malformed JSON does not throw; migrate skips bad entries                                                                                       | **PARTIAL**                       | Parse `try/catch` returns `[]` (`guestProgress.ts:50-57`, test `:36-39`). Mixed-array skip is missing (punch 5).                                                                                                                                                     |
| After login with guest data, completed IDs appear without a second mutation                                                                    | **FAIL** (wiring)                 | `fetchWhen` delays fetch, but `onMigrated` is empty and `refetch` unused (punch 4). No `useProgress` test that IDs appear from post-migrate fetch. Production upsert will `42P10` (punch 2).                                                                         |
| Failed migrate does not clear storage; `isMigrationLoading` does not stick true                                                                | **PASS**                          | Clear only if `errors.length === 0` (`guestProgress.ts:247-250`, test `:72-85`). `.catch/.finally` (`guestMigration.ts:36-41`, tests `:74-108`).                                                                                                                     |
| Production unique `(user_id, quiz_id)` before this PR merges                                                                                   | **FAIL**                          | Punch 2.                                                                                                                                                                                                                                                             |
| `signOut` clears guest prefix **and** UI health keys via `resetLocalProgress`; login/signup show `guestProgressWillSync`; theme/locale survive | **FAIL** (wipe) / **PASS** (copy) | Wipe: punch 3. Copy: `LoginForm.tsx:126-128`, `SignupForm.tsx:177-179`; EN+ES keys present. Live Chromium: EN login/signup and ES login/signup all show the string near submit. Theme/locale keys are not under `hmc_guest_` (`clearGuestProgress` test `:199-204`). |

---

## What is actually correct (do not redo)

- Canonical guest store is `localStorage`; keys stay `hmc_guest_completedLessons` / `hmc_guest_quizAttempts`. Quiz attempts are **not** merged into `STORAGE_KEYS.quizScores`.
- Type guards + `JSON.parse` `try/catch` stop crashes from `{foo:1}` and raw malformed JSON (C8 mostly addressed). Residual `as T` inside `getItem` (`guestProgress.ts:53`) is mitigated by post-parse guards at call sites.
- `getGuestProgress` unions guest lessons with `STORAGE_KEYS.completedLessons` (`guestProgress.ts:135-140`, test `:189-195`). Code will upsert UI-only `hmc-completed-lessons` even though there is no migrate-payload test for that spec line.
- `normalizeStoredScore` on migrate: `{ quizId, score: 80, maxScore: 5 }` → upsert `4/5` `passed: true` (`guestProgress.test.ts:120-141`).
- `recordQuizScore` keep-best in `AppProviders.tsx:160-173`; test `AppProviders.test.tsx:67-85` (`100` then `60` stays `100`).
- Guest `saveQuizAttempt` writes guest keys only; mutations guest branch records UI percent via `toPercent` (`mutations.ts:144-147`).
- `useSupabaseProgress` `fetchWhen` / `refetch` API matches §8.1. Catch path on migration throw unblocks loading.
- `guestProgressWillSync` EN/ES parity; design-system tokens (`text-label-md text-on-surface-variant`); visible near submit; forgot-password correctly omits it.
- No 2-hour migrate TTL. No kiosk confirm dialog (out of scope).
- `AuthProvider.test.tsx` was not weakened (file untouched).

---

## Tests / commands (this review)

```bash
npx vitest run src/lib/guestProgress.test.ts \
  src/hooks/useProgress/guestMigration.test.tsx \
  src/hooks/useProgress.test.tsx \
  src/components/AppProviders.test.tsx \
  src/components/providers/AuthProvider.test.tsx \
  src/lib/quizScore.test.ts \
  src/hooks/useProgress/mutations.test.ts
# Test Files 7 passed (7), Tests 68 passed (68)

npm test
# Test Files 112 passed (112), Tests 783 passed (783)

npm run typecheck   # 0 errors
npm run lint        # 0 errors, 1 pre-existing warning GoogleAnalytics.test.tsx

npx playwright test e2e/auth.spec.ts e2e/smoke.spec.ts e2e/dashboard.spec.ts --project=chromium
# auth+smoke: 10 passed
# dashboard: 3 failed — signInMockUser stays on /en/auth/login with alert
#   "Invalid email or password." (guest@example.com / password123).
#   Form submit works; this is mock-vs-live auth env, not the new copy.
#   Spec §8.3: skip live migrate e2e.

npx playwright test e2e/flows.spec.ts --project=chromium -g "login validation"
# 1 passed
```

Unit tests that **assert nothing useful for production wiring:**

- `guestMigration.test.tsx:110-128` — `onMigrated` called, but `useProgress.ts` passes an empty callback.
- `guestProgress.test.ts:87-100` — “clears after successful migration” only writes the guest key, so it cannot catch STORAGE_KEYS leftovers.
- `useProgress.test.tsx:115-152` — authenticated fetch with **empty** guest (default mock). Does not assert fetch-after-migrate ordering when guest data exists (§8.3: “if it asserts parallel fetch, update”).
- Spec-required “data only in `hmc-completed-lessons` still migrates” is only covered at `getGuestProgress` union, not at upsert payload.

---

## UI inspection notes

| Surface                    | 1440px                                                                                                     | 390px                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `/en/auth/login`           | `guestProgressWillSync` under password, above Sign in. Tokens match surrounding form. No layout break.     | (desktop captured; ES signup checked at 390)                          |
| `/en/auth/signup`          | Same string above Create account. Password strength + terms row unchanged.                                 | —                                                                     |
| `/es/auth/login`           | “Tu progreso de aprendizaje en este dispositivo se guardará en tu cuenta.” Visible. Header/footer Spanish. | —                                                                     |
| `/es/auth/signup`          | Same ES string above Crear cuenta.                                                                         | Hamburger header; form stacks; copy readable; no horizontal overflow. |
| `/en/auth/forgot-password` | No guest-sync sentence (correct). Reset form intact.                                                       | —                                                                     |

No design-system drift on the new line (existing `text-label-md text-on-surface-variant`). No a11y backslide observed: it is a visible `<p>`, not an aria-only substitute. Adjacent auth pages not polluted.

ES string omits “browser” / _navegador_ vs the English spec phrase. Real translation; not a punch. Optional backlog if copy wants EN/ES semantic parity.

---

## Out of scope / log for backlog (do not fix in the P5 follow-up unless already in punch list)

- **P5-1 (suggested):** `auth.guestProgressWillSync` ES uses informal _tú_ and drops “browser.” Align with care-guide _usted_ if a later copy pass unifies voice (same class as P4-3).
- **P5-2 (suggested):** `guestProgress.markLessonComplete` does not also merge into `STORAGE_KEYS.completedLessons` (`guestProgress.ts:149-157`). Mutations dual-call `guestMarkLessonComplete` + `appStateMarkLessonComplete` (`mutations.ts:67-70`) and `getGuestProgress` unions UI keys, so the product path works. Spec §8.1 still asked for the merge inside `guestProgress`.
- **P6-\*:** already in `ISSUES-BACKLOG.md`. Do not expand them in the P5 PR.
- Dashboard Playwright mock-login `Invalid email or password` — env (live GoTrue vs mock). Not introduced by the new `<p>`. Do not invent an auth stack to green it (spec §8.3).

---

## Production SQL evidence (this review)

```
quiz_attempts constraints: PRIMARY KEY (id) only
schema_migrations versions: 20260612202742 … 20260612202824, 20260825133455
014 / 015: not present
duplicate (user_id, quiz_id) pairs: 0
```
