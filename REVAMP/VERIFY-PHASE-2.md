# VERIFY-PHASE-2

**Verdict: CHANGES REQUIRED**

Reviewer is not the Phase 2 author. Spec read from `cursor/plan-v10-0f7a:REVAMP/PLAN.v10.md` (file is **not** on `main` disk; workspace `REVAMP/` still has no `PLAN.v10.md`). Completion report was **not** found on disk or in local agent transcripts (Phase 1 report is in `4540cc07…`; Phase 2 cloud id `bc-a0339aed` has no local transcript). Author intent reconstructed from staged diffs plus `REVAMP/ISSUES-BACKLOG.md` P2-1…P2-5.

This is a **write/review** verdict. Do not treat staging on `main` as a Phase 2 PR.

---

## Method

- Spec: `git show cursor/plan-v10-0f7a:REVAMP/PLAN.v10.md` §0.1–0.3, matrix BUG-01/02/05 + ADV-11, §5.1–5.5.
- Diff: `git diff --staged` (Phase 2 files mixed with Phase 1; see punch 2).
- Unit: `npx vitest run` on the four Phase 2 test files, then `npm test`, `npm run lint`, `npm run typecheck`.
- E2E: `npx playwright test e2e/auth.spec.ts --project=chromium` (passed). Firefox/WebKit: binaries missing (confirms P2-3).
- Live against `npm run dev` (mock client): curl on confirm/callback; Chromium screenshots and flows at 1440 and 390.
- `REVAMP/SCREENSHOTS/phase-2/` does not exist. Plan §0.1 #7: that folder is the **before** state, not the target. Reviewer screenshots under `/tmp/hmc-phase2-screens/`.
- Did **not** change templates in the Supabase dashboard (P2-4, human).

---

## Punch list (must fix before APPROVED)

### 1. `src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx:43-51` — 🔴 bug: consume throw takes down the page

§5.2 step 4 / §5.4: on exchange/verify **error** with no session, show `errorGeneric` / invalid-link — not a route error boundary.

`replaceState` runs first, then:

```ts
const consume = code
  ? supabase.auth.exchangeCodeForSession(code)
  : isOtpType(type)
    ? supabase.auth.verifyOtp({ token_hash: tokenHash!, type })
    : Promise.resolve({ error: { message: "invalid_otp_type" } });

consume.then(({ error: consumeError }) => {
  if (consumeError) setConsumeFailed(true);
});
```

Two holes:

- **Sync throw** (missing method, programming error): never reaches `.then`. React ErrorBoundary. Live: `/en/auth/reset-password?token_hash=th&type=recovery` against the mock client → `TypeError: supabase.auth.verifyOtp is not a function` → `errors.title` (“Something went wrong”). Query already stripped, so retry has no token.
- **Rejected promise** (network): no `.catch`. `exchangedRef` stays true, `consumeFailed` stays false, effect returns at `:55` forever — form looks ready, no alert.

`confirm/route.ts:46-58` already `try/catch`es `verifyOtp` and falls through to `confirmation_failed`. Client does not match.

Author logged **P2-1** as “mock has no `verifyOtp`, out of file scope.” That is true for `src/lib/supabase/mock/auth.ts`. It does **not** cover this in-scope client gap. Unit tests mock `verifyOtp` as a function, so they cannot see the throw.

**Fix (this file only — do not wait on mock):** wrap consume in `try/catch` and `.catch(() => setConsumeFailed(true))` so a throw/reject with no session shows `errorGeneric`. Add a vitest case where `verifyOtp` throws. Mock `verifyOtp` can stay P2-1.

### 2. Git index — 🟡 process: Phase 2 is not one PR

Plan §0.1: one phase = one PR. §0.3: branch `revamp/p02-auth-recovery`.

`git diff --staged --name-only` still mixes Phase 1 SQL/constants with Phase 2 auth/i18n/e2e. Work is on `main`, uncommitted. Same open item as VERIFY-PHASE-1 punch 4.

**Fix:** unstage everything that is not Phase 2; open `revamp/p02-auth-recovery` with only:

- `src/lib/auth/parseAuthRedirect.ts`
- `src/lib/auth/parseAuthRedirect.test.ts`
- `src/app/[locale]/auth/confirm/route.ts`
- `src/app/[locale]/auth/confirm/route.test.ts`
- `src/app/[locale]/auth/callback/route.ts`
- `src/app/[locale]/auth/callback/route.test.ts`
- `src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx`
- `src/app/[locale]/auth/reset-password/ResetPasswordClient.test.tsx`
- `src/messages/en.json`
- `src/messages/es.json`
- `e2e/auth.spec.ts`
- `REVAMP/ISSUES-BACKLOG.md` **P2-1…P2-5 only** (leave P1-* on the Phase 1 PR)

---

## Acceptance criteria (re-checked)

| Criterion                                                                               | Result                              | Evidence                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Query `?code=` exchanges; hash fallback still works                                     | **PASS**                            | Unit: `ResetPasswordClient.test.tsx` `?code=abc` and `#code=xyz`. Live: `?code=mock-reset` and `#code=mock-reset` strip to `/en/auth/reset-password`, no alert, header “Guest Student”.                 |
| Two effect runs call `exchangeCodeForSession` **once**; URL has no `code` after success | **PASS**                            | StrictMode unit `toHaveBeenCalledTimes(1)` + `search` has no `code`. Live URL after PKCE is pathname-only.                                                                                              |
| Exchange error with an existing session still shows the form (not `errorGeneric`)       | **PASS**                            | Unit: user set + `{ error: "already used" }`. Live: signed-in via `mock-reset`, then `?code=already-used-junk` → form, empty alerts, still “Guest Student”.                                             |
| Confirm accepts `token_hash` + allowlisted `type`                                       | **PASS (unit) / mock-blocked live** | Unit: signup `verifyOtp` + redirect to `next`. Live mock: `verifyOtp` missing → `confirmation_failed` (server `try/catch`). Production client has the method.                                           |
| Confirm `type=recovery` always lands on `/{locale}/auth/reset-password`                 | **PASS**                            | Unit: `token_hash` + `next=/es/dashboard` → `http://localhost/es/auth/reset-password`. Live: `?code=mock-reset&type=recovery&next=/es/dashboard` → `Location: /es/auth/reset-password` (not dashboard). |
| Reset, **no URL tokens**, existing session → form, not invalid-link                     | **PASS**                            | Unit mocked `useAuth`. Live: after PKCE, revisit `/en/auth/reset-password` → form, no alert, “Guest Student”.                                                                                           |
| Reset, no tokens, auth loaded, no session → invalid-link                                | **PASS**                            | Unit + Chromium e2e. Live 1440/390 EN and ES: `errorInvalidResetLink` in the correct language.                                                                                                          |
| `/es/auth/confirm` failures → `/es/auth/login?error=...`                                | **PASS**                            | Unit + curl: no code and `type=not-a-type` → `http://localhost:3000/es/auth/login?error=confirmation_failed`.                                                                                           |
| Callback `auth_failed` and `rate_limited` keep locale                                   | **PASS**                            | Unit `/es` exact locations. Curl unique IPs: `/es/auth/callback` → `auth_failed`; 6th `/es/auth/callback?code=` from `203.0.113.50` → `rate_limited` on `/es/auth/login`.                               |
| No `as unknown as { nextUrl }` on the two routes                                        | **PASS**                            | Both routes use `request.nextUrl`. Grep on those files: no `as unknown as`.                                                                                                                             |
| EN/ES keys added                                                                        | **PASS**                            | `auth.errorInvalidResetLink` in both catalogs. Flattened key sets 728/728, no missing keys. `tsc` (`Messages = typeof en`) green.                                                                       |

Punch 1 does **not** fail the `?code=` rows. It fails the **token_hash client** path when `verifyOtp` throws, which §5.1 lists as required.

---

## What is actually correct (do not redo)

- File scope matches §5.1 plus the specified tests. Mock auth untouched (P2-1). Codemaps untouched (P2-2). No SQL, no `delete_user`, no extra features.
- Locale helper + `loginErrorUrl` + `recoveryRedirect` + `OTP_TYPES` match the spec list (`signup`, `email`, `invite`, `magiclink`, `recovery`, `email_change`). `isOtpType("foo")` rejected.
- `useAuth` / `authLoading` gate; `useAuthFormState().loading` not used. `exchangedRef` set **before** the async call. `code` not in effect deps.
- `replaceState` to `pathname` (query **and** hash stripped) before consume — stricter than “then replaceState”, and it is why StrictMode only exchanges once.
- Recovery ignores attacker `next` for both `code` and `token_hash` on confirm (`successPath` computed from `type === "recovery"` first). Other types still `sanitizeRedirectPath(..., \`/${locale}/dashboard\`)`.
- Callback still OAuth/`code` only. Rate-limit namespace `"auth-callback"` unchanged.
- Specified Vitest cases all exist and assert real behavior (no `expect(true)`). Extra live case: exchange-fail-with-session.
- Chromium e2e: new reset tests plus adjacent signup + forgot-password still pass.
- Adjacent login still maps `confirmation_failed` / `auth_failed` / `rate_limited`. Live ES login with `?error=confirmation_failed` shows the Spanish confirmation copy. Forgot-password / signup screens unchanged (same tokens, no new chrome).
- Reset UI still `surface-card-glass` / `font-display` / `FormErrorAlert` / `Input` / `Button`. No design-system drift. `role="alert"` on the invalid-link copy. 390px form usable.

---

## Tests / commands (this review)

```
npx vitest run src/lib/auth/parseAuthRedirect.test.ts \
  src/app/[locale]/auth/confirm/route.test.ts \
  src/app/[locale]/auth/callback/route.test.ts \
  src/app/[locale]/auth/reset-password/ResetPasswordClient.test.tsx
  Test Files  4 passed (4)
  Tests       30 passed (30)

npm test
  Test Files  107 passed (107)
  Tests       731 passed (731)

npm run lint       → 0 errors (pre-existing warning: GoogleAnalytics.test.tsx)
npm run typecheck  → pass

npx playwright test e2e/auth.spec.ts --project=chromium
  4 passed (signup, reset invalid-link, ES heading, forgot-password)

npx playwright test e2e/auth.spec.ts --project=firefox --project=webkit
  fail: Executable doesn't exist (firefox-1538 / webkit) — P2-3, not a product bug
```

Live curl (dev, mock):

```
GET /es/auth/confirm                         → 307 /es/auth/login?error=confirmation_failed
GET /es/auth/confirm?token_hash=h&type=not-a-type → same
GET /es/auth/confirm?code=mock-confirm&next=/es/dashboard → 307 /es/dashboard
GET /es/auth/confirm?code=mock-reset&type=recovery&next=/es/dashboard → 307 /es/auth/reset-password
GET /es/auth/callback (fresh IP)             → 307 /es/auth/login?error=auth_failed
```

Playwright: not required beyond §5.3 additions. Chromium run. Firefox/WebKit env-blocked.

---

## Completion-report audit

No PHASE-2 COMPLETION REPORT file or local transcript. Backlog P2-1…P2-5 is consistent with what this review found:

- **P2-1** mock `verifyOtp` — confirmed. Incomplete: did not call out the in-scope client throw (punch 1).
- **P2-2** codemaps — confirmed (`parseAuthRedirect.ts` absent; auth app map still says `callback/page.tsx` / `confirm/page.tsx`).
- **P2-3** Playwright Firefox/WebKit binaries — confirmed.
- **P2-4** dashboard templates — still a human check. Canonical recovery is PKCE `code` on `/{locale}/auth/reset-password`; confirm `type=recovery` is the fallback. Code cannot change templates.
- **P2-5** plan file missing on `main` — confirmed.

If the missing report claimed token_hash “done” from unit tests alone, that overclaimed the mock/dev path (punch 1).

---

## Out of scope / logged, not re-opened as Phase 2 code fixes

- **P2-1** add `verifyOtp` to `src/lib/supabase/mock/auth.ts` — still a later mock phase. Punch 1 is the client catch, not the mock method.
- **P2-2** docs-only maps.
- **P2-3** install Firefox/WebKit on this machine / CI image.
- **P2-4** Supabase Auth email templates (human).
- **P2-5** copy `REVAMP/PLAN.v10.md` onto the implementation branch.
- Confirm and callback sharing rate-limit key `"auth-callback"` — spec said unchanged. Five confirm curls from one IP will 307 `rate_limited` on the next callback; not new.
- Submit still enabled while invalid-link is showing — spec asks for the alert, not a disabled form.
- Header hamburger at 1440 on auth pages — Phase 10.
- `next-env.d.ts` unstaged — unrelated, ignore.

---

## UI notes (reviewer screenshots, not before-state)

| Surface                                       | 1440                                            | 390                   |
| --------------------------------------------- | ----------------------------------------------- | --------------------- |
| `/en/auth/reset-password` (logged out)        | Invalid-link alert, form intact                 | Same, stacked, usable |
| `/es/auth/reset-password` (logged out)        | Spanish heading + Spanish invalid-link          | Same                  |
| `/en/auth/reset-password?code=mock-reset`     | Form, no alert, signed-in chrome                | —                     |
| Same session, revisit with no tokens          | Form, no alert                                  | —                     |
| `/en/auth/login?error=auth_failed`            | English auth-failed alert                       | —                     |
| `/es/auth/login?error=confirmation_failed`    | Spanish confirmation-failed alert               | —                     |
| `/en/auth/forgot-password`, `/en/auth/signup` | Unchanged adjacent                              | —                     |
| `?token_hash=th&type=recovery` (mock)         | Error boundary “Something went wrong” (punch 1) | —                     |
