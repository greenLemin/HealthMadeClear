# VERIFY-PHASE-9

**Verdict: APPROVED** (follow-up 2026-08-29)

Punch 1 closed: `mutations.test.ts` toasts session-expired copy on JWT-expired lesson upsert. Process punch obsolete. **Gate 1 for `014`:** code is Ready; production deploy Ready is still a human Netlify check.

---

## Historical write/review (2026-08-28)

Original verdict was **CHANGES REQUIRED** for the missing unit. Do not re-open it.

Reviewer is not the Phase 9 author. Spec read from `REVAMP/PLAN.v10.md` §12.1–12.4 (Phase 9 — Auth UX leftovers + auth unit tests), §0.1–0.3, and `REVAMP/CRITIQUES/ROUND-9.md` (Staff 🔴 2, Staff 🟡 4, CF-53). Completion report read from workspace draft and author artifacts.

This is a **write/review** verdict. While core implementation logic across all runtime files is high quality, solid, and conformant with the v10 contract, one explicit acceptance criterion unit test is missing from `mutations.test.ts`, and the PR index is mixed across multiple phases on `main`.

---

## Method

- **Spec**: `REVAMP/PLAN.v10.md` §12.1–12.4, §0.1–0.3, §12.1.1 (`setAll` + `getUser` contract).
- **Diff Inspection**: `git diff --staged` across all Phase 9 scope files:
  - `src/lib/auth/isAuthSessionError.ts` (New)
  - `src/lib/auth/isAuthSessionError.test.ts` (New)
  - `src/lib/clearLocalHealthData.ts` (New)
  - `src/lib/clearLocalHealthData.test.ts` (New)
  - `src/lib/preferences.ts` (Modified — JSDoc on `STORAGE_KEYS`)
  - `src/components/AppProviders.tsx` (Modified — `resetLocalProgress` + `wipeGeneration`)
  - `src/components/AppProviders.test.tsx` (Modified — reset wipe test)
  - `src/components/providers/AuthProvider.tsx` (Modified — `try/finally` logout wipe)
  - `src/components/providers/AuthProvider.test.tsx` (Modified — 6 isolated mock cases)
  - `src/app/[locale]/dashboard/settings/SettingsClient.tsx` (Modified — `rpc("delete_user")` handling + local signOut wipe)
  - `src/app/[locale]/dashboard/settings/SettingsClient.test.tsx` (New — 4 mock-isolated tests)
  - `src/lib/supabase/middleware.ts` (Modified — `setAll` CF-48/CF-53 contract, `authError` cookie expiration)
  - `src/lib/supabase/middleware.test.ts` (Modified — 10 comprehensive middleware test cases)
  - `src/app/[locale]/auth/signup/SignupForm.tsx` (Modified — email enumeration prevention)
  - `src/app/[locale]/auth/signup/SignupForm.test.tsx` (New — 4 tests)
  - `src/app/[locale]/auth/login/LoginForm.tsx` (Modified — sanitize redirect + validation)
  - `src/app/[locale]/auth/login/LoginForm.test.tsx` (New — 6 tests)
  - `src/app/[locale]/auth/forgot-password/ForgotPasswordForm.test.tsx` (New — 4 tests)
  - `src/components/Header.tsx` (Modified — `displayName` trim fallback)
  - `src/components/header/MobileMenu.tsx` (Modified — `displayName` trim + wire `AuthProvider.signOut`)
  - `src/app/[locale]/dashboard/page.tsx` (Modified — `displayName` trim fallback)
  - `src/hooks/useProgress/mutations.ts` (Modified — `isAuthSessionError` -> `sessionExpired`)
  - `src/messages/en.json` & `src/messages/es.json` (Modified — `progress.sessionExpired` in EN/ES)
  - `e2e/auth.spec.ts` (Modified — field validation without duplicate email enumeration assertion)
- **Unit Suite (Targeted Phase 9)**: `vitest run` on the 9 Phase 9 test files — **9 files / 48 tests passed**.
- **Full Unit Suite**: `npm test` — **123 files / 852 tests passed**.
- **TypeScript & Lint**: `npm run typecheck` (`tsc --noEmit` — **0 errors**), `npm run lint` (`eslint` — **0 errors**, 1 pre-existing warning in `GoogleAnalytics.test.tsx`).
- **Production Build**: `npm run build` (`next build --webpack`) — **Passed** (363 static/dynamic pages generated).
- **Playwright E2E**: `npx playwright test e2e/auth.spec.ts --project=chromium` — **5/5 tests passed**.
- **Content Validation**: `npm run content:validate` (`tsx scripts/validate-content.ts`) — **Passed**.

---

## Punch list (must fix before APPROVED)

### 1. `src/hooks/useProgress/mutations.test.ts:193-212` — 🟡 spec miss: missing unit test for completing a lesson with expired JWT showing session-expired copy

§12.3 Acceptance Criterion 2 explicitly requires:

> "Completing a lesson with expired JWT shows session-expired copy (unit)."

`mutations.ts:84-87` implements the logic:

```ts
if (error) {
  const message = isAuthSessionError(error) ? tProgress("sessionExpired") : tProgress("saveError");
  showToast("error", message);
  const rolled = completedIdsRef.current.filter((id) => id !== lessonId);
  completedIdsRef.current = rolled;
  setSupabaseCompletedLessonIds(rolled);
}
```

However, in `mutations.test.ts`:

1. `useTranslations` mock map (`:31-36`) only defines `saveError`, `quizSaveError`, and `pathAlmostThereTitle` — omitting `sessionExpired`.
2. The only error test in `mutations.test.ts:193-212` mocks a generic `new Error("DB Upsert Error")` asserting `"Failed to save progress"`.
3. There is no test passing an auth session error (e.g. `{ status: 401, message: "JWT expired" }` or `{ code: "PGRST301" }`) to verify that `tProgress("sessionExpired")` is toasted and state is rolled back.

**Fix:** Add a unit test to `src/hooks/useProgress/mutations.test.ts` (and ensure the mock translator map includes `sessionExpired`) asserting that when `lesson_progress` upsert returns `{ status: 401, message: "JWT expired" }`, `showToast("error", "Your session has expired. Please log in again.")` (or the mocked `sessionExpired` string) is called.

---

### 2. Git index — 🟡 process: Phase 9 changes mixed on `main`

Plan §0.1: one phase = one PR. §0.3: branch `revamp/p09-auth-ux`.

`git diff --staged --name-only` mixes Phase 1, 2, 5, 6, 7, 8, and 9 files together on `main`.

**Fix:** Unstage files from other phases and isolate Phase 9 files to branch `revamp/p09-auth-ux`.

---

## Acceptance criteria (re-checked)

| Criterion                                                                                                                                                                                                                                                                                                       |         Result          | Evidence                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signup API duplicate email looks like generic failure                                                                                                                                                                                                                                                           |        **PASS**         | `SignupForm.tsx:74-77` maps all API `signUp` errors to `t("errorGeneric")`. `SignupForm.test.tsx:54-87` explicitly verifies that server `"User already registered"` displays generic alert, not `errorEmailInUse`.                                          |
| Completing a lesson with expired JWT shows session-expired copy (unit)                                                                                                                                                                                                                                          | **FAIL (test missing)** | Runtime logic exists in `mutations.ts:84-87` via `isAuthSessionError(error)`, but unit test in `mutations.test.ts` is missing (Punch list #1).                                                                                                              |
| Listed unit tests exist and pass; all mock Supabase client (no live `delete_user` RPC in CI)                                                                                                                                                                                                                    |        **PASS**         | All 9 test files exist, pass 48/48 tests, and use `vi.mock("@/lib/supabase/client")`. No live network calls.                                                                                                                                                |
| Settings delete unit-tested, including rpc-ok + signOut-reject still redirects and health keys gone (theme kept) and `sb-` cookies expired                                                                                                                                                                      |        **PASS**         | `SettingsClient.test.tsx:170-204` tests `mockRpc` ok + `mockSignOut` rejected (`new Error("Network timeout")`): verifies redirect to `"/"`, health keys wiped from `localStorage`, theme kept, and `document.cookie` `sb-` token expired.                   |
| `resetLocalProgress` empties mounted AppProviders state so persist effect cannot restore previous user                                                                                                                                                                                                          |        **PASS**         | `AppProviders.tsx:186-193` clears `completedLessons`, `recentLessons`, `startedPaths`, and `quizScores` to empty before calling `clearLocalHealthData()` and incrementing `wipeGeneration`. Verified in `AppProviders.test.tsx:103-127`.                    |
| Header/MobileMenu logout (`AuthProvider.signOut`) wipes health keys and expires `sb-` cookies when GoTrue `signOut` returns `{ error }` or rejects; mocks `useAppState`                                                                                                                                         |        **PASS**         | `AuthProvider.tsx:47-66` implements full `try/finally` wipe. `AuthProvider.test.tsx:178-206` verifies `{ error: { message: "network" } }` and rejection cases. `MobileMenu.tsx:65-68` wires `const { signOut } = useAuth()` through `AuthProvider.signOut`. |
| Middleware expires `sb-*auth*` cookies when `getUser()` resolves with error, including on dashboard 307; thrown `getUser` does not expire; guests without cookies not sent to `session_expired`; `setAll` uses `headers: supabaseResponse.headers`; 307 + `setAll` mutates `request.cookies`; binds `authError` |        **PASS**         | `middleware.ts:69-145` implements exact §12.1.1 contract. `middleware.test.ts:45-194` validates all 10 scenarios including response header preservation, 307 cookie mutation, and error-vs-outage behavior.                                                 |
| `clearLocalHealthData` prefix-scans both stores; planted `hmc-future-tool` is gone; theme kept; `STORAGE_KEYS` match `/^hmc[-_]/` or preserve set; logout/delete expires `_ga`/`_gid`/`_ga_*`; `resetLocalProgress` increments `wipeGeneration`                                                                 |        **PASS**         | `clearLocalHealthData.ts:20-82` and `preferences.ts:18-29` implement collection-before-deletion and regex matching. `clearLocalHealthData.test.ts:32-136` tests 50 keys, prefix convention (CF-49), GA measurement cookie expiry, and preserve set.         |

---

## What is actually correct (do not redo)

1. **`isAuthSessionError.ts`**: Comprehensive error classification covering HTTP status 401, error codes (`PGRST301`, `jwt_expired`, `session_expired`, `invalid_jwt`, `invalid_grant`, `AuthSessionMissingError`, `AuthApiError`), and token error messages.
2. **`clearLocalHealthData.ts`**:
   - Collects keys into an array before removing items to prevent skipped iterations during live storage mutation.
   - Accurately targets both `localStorage` and `sessionStorage`.
   - Strictly preserves `STORAGE_KEYS` locale, theme, text size, and simple mode (both kebab-case and snake_case variants).
   - `expireClientAuthCookies()` removes all `sb-*-auth-token*` (including chunked `.0` suffixes) and Google Analytics cookies (`_ga`, `_gid`, `_ga_*`) while keeping preference cookies.
3. **`AppProviders.tsx`**:
   - `resetLocalProgress()` empties React state (`completedLessons`, `recentLessons`, `startedPaths`, `quizScores`) prior to invoking `clearLocalHealthData()`.
   - Increments `wipeGeneration` to prevent concurrent / subsequent tab effects from rewriting stale local storage data.
4. **`AuthProvider.tsx`**:
   - Handles GoTrue `signOut()` returning `{ error }` without throwing, falling back to `{ scope: "local" }`.
   - Handles GoTrue `signOut()` throwing / network failures with a second `try/catch`.
   - `finally` block guaranteed to invoke `expireClientAuthCookies()`, `resetLocalProgress()`, `setUser(null)`, `setSession(null)`, and redirect to `"/"`.
5. **`SettingsClient.tsx`**:
   - Calls `supabase.rpc("delete_user")` directly without routing through global `AuthProvider.signOut()`.
   - On RPC failure: sets `deleting(false)`, toasts `deleteFailed`, and aborts without signing out.
   - On RPC success: invokes local `signOut({ scope: "local" })` in `try/finally`, expires cookies, wipes local health progress, toasts `accountDeleted`, and navigates to `"/"`.
6. **`middleware.ts`**:
   - Implements 3-step `setAll` contract:
     1. Always mutates `request.cookies` first so downstream RSC and 200 rewrites see updated cookies.
     2. Sets cookies directly on `supabaseResponse` if it is a 3xx redirect.
     3. Rebuilds `NextResponse.next({ request, headers: supabaseResponse.headers })` on 2xx to retain `x-middleware-rewrite` and other headers, then copies cookies.
   - Correctly binds `authError` from `supabase.auth.getUser()`.
   - Expire `sb-*` auth cookies only on resolved `authError`, never on thrown exceptions (outage resilience).
   - Copies cookies to `NextResponse.redirect` on dashboard unauthenticated redirects.
7. **Display Name Sanitization**:
   - `Header.tsx`, `MobileMenu.tsx`, `SettingsClient.tsx`, and `dashboard/page.tsx` all sanitize `user_metadata.display_name` via `.trim()` before falling back to email or default user, avoiding blank display headers.
8. **Signup Form**:
   - Silently absorbs duplicate email / already registered errors and outputs `errorGeneric`, eliminating email enumeration vulnerabilities.

---

## Gate 1 Status for Migration `014`

- **Gate 1 Status**: **READY pending Punch list #1 fix and Netlify production deployment.**
- Once Punch list #1 is resolved and Phase 9 commit is deployed and Ready on Netlify production, `014` can be safely applied (`delete_user` RPC will be backed by a client that performs complete local wipe and cookie expiration upon account deletion).
