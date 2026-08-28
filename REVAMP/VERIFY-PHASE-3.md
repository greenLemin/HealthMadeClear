# VERIFY-PHASE-3

**Verdict: CHANGES REQUIRED**

Reviewer is not the Phase 3 author. Spec read from `cursor/plan-v10-0f7a:REVAMP/PLAN.v10.md` (file is **not** on `main` disk; workspace `REVAMP/` still has no `PLAN.v10.md` — P2-5). Completion report read from agent transcript [`52867a63`](52867a63-5282-4eac-b4f1-17fa32cab170) (never committed).

This is a **write/review** verdict. Do not treat staging on `main` as a Phase 3 PR. Product acceptance for §6.5 is green except the expected PostgREST line (P3-2). Merge is blocked on git hygiene.

---

## Method

- Spec: `git show cursor/plan-v10-0f7a:REVAMP/PLAN.v10.md` §0.1–0.3, matrix ADV-08 / ADV-06 / SEC-01, §6.1–6.6.
- Diff: `git diff --staged` (Phase 3 files mixed with Phases 1, 2, and 4; see punch 1).
- Unit: `npx vitest run` on the six Phase 3 test files, then `npm test`, `npm run lint`, `npm run typecheck`.
- E2E: `npx playwright test e2e/smoke.spec.ts --project=chromium` (passed). Firefox/WebKit not re-run (P2-3).
- Live against `npm run dev`: curl on `/api/contact` and `/ga-init.js`; Chromium screenshots and flows at 1440 and 390; double-submit probe with a hung `**/api/contact` route.
- Live project `xdmbyadosmzixsxqullj`: `list_migrations` + `pg_policy` / grants on `contact_submissions`.
- `REVAMP/SCREENSHOTS/phase-3/` does not exist. Plan §0.1 #7: that folder is the **before** state, not the target. Reviewer screenshots under `/tmp/hmc-phase3-screens/`.
- Did **not** run `CI=true NETLIFY=true npm run build` (would fail here without a real service-role key; unit cases cover the gate). Did **not** `db push`.

---

## Punch list (must fix before APPROVED)

### 1. Git index — 🟡 process: Phase 3 is not one PR, and not the required three

Plan §0.1: one phase = one PR, and **Phase 3 ships as three PRs** (`revamp/p3a-env-gate`, `revamp/p3b-code-contact-analytics`, `revamp/p3b-copy-privacy`). §0.3: branch `revamp/pNN-short-slug`. Author logged this as deviation 1. Index is worse now: Phase 4 care-guide / disclaimer / `globals.css` landed on top of P1 SQL and P2 auth.

`git diff --staged --name-only` currently includes all of that. Work is on `main`, uncommitted. Same open item as VERIFY-PHASE-1 punch 4 / VERIFY-PHASE-2 punch 2.

**Fix:** unstage everything that is not Phase 3. Prefer the spec’s three branches; if the user keeps one Phase 3 PR, it still must not contain P1/P2/P4. Phase 3 set:

- `scripts/check-production-env.mjs`
- `scripts/check-production-env.test.ts`
- `scripts/ga-init.test.ts`
- `public/ga-init.js`
- `src/app/api/contact/route.ts`
- `src/app/api/contact/route.test.ts`
- `src/app/[locale]/contact/ContactClient.tsx`
- `src/app/[locale]/contact/ContactClient.test.tsx`
- `src/lib/rateLimit.ts`
- `src/lib/rateLimit.test.ts`
- `src/lib/errorReporting.ts`
- `src/lib/errorReporting.test.ts`
- `src/app/[locale]/privacy/PrivacyClient.tsx`
- `src/messages/en.json` / `es.json` — **privacy.\* / terms.\* hunks only** (Phase 4 rewrote `tools.*` in the same files)
- `e2e/smoke.spec.ts`
- `REVAMP/ISSUES-BACKLOG.md` **P3-1…P3-3 only** (leave P1-\* / P2-\* / P4-\* on their PRs)

No product-code punch. §6.5 checkboxes that can be proven without `014` all pass.

---

## Acceptance criteria (re-checked)

| Criterion                                                                                                                                                                                                                                                                        | Result                 | Evidence                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No remaining string “never transmitted to our servers” / “nunca se transmiten a nuestros servidores”                                                                                                                                                                             | **PASS**               | Repo grep on `*.json,*.tsx,*.ts,*.js`: no matches. Live EN/ES privacy `innerText`: `hasLie: false`. `/en/terms` unchanged, no device-only claim.                                                                                                                                                     |
| Privacy lists guest vs account vs contact vs analytics vs crash-report paths (`collectBodyErrors`). Analytics does **not** say “IP anonymization is on.” Errors copy claims query/hash strip only because 3B-code `beforeSend` shipped. Guest copy names leftover-device attach. | **PASS**               | EN/ES keys present (737/737, 0 missing). Live `/en/privacy`: leftover-device, `privacy@healthmadeclear.com`, strip sentence, no “IP anonymization is on.” `errorReporting.test.ts` keeps `/en/learn/understanding-prescription-labels`, strips `#access_token=` and `?`.                             |
| `public/ga-init.js` sets `page_location` to origin + pathname and does not set `anonymize_ip`                                                                                                                                                                                    | **PASS**               | `scripts/ga-init.test.ts` passed. Served `GET /ga-init.js`: `page_location: window.location.origin + window.location.pathname`. No `anonymize_ip` / `window.location.href`.                                                                                                                          |
| Account deletion limitation for contact PII, including `privacy@healthmadeclear.com`                                                                                                                                                                                             | **PASS**               | `collectBodyContact` + `privacyEmail`. Live EN and ES pages include the email. `PrivacyClient.tsx:55` interpolates `{privacyEmail}`.                                                                                                                                                                 |
| Netlify build without service role fails; GitHub CI build still passes                                                                                                                                                                                                           | **PASS (unit)**        | Vitest: NETLIFY+CI missing/placeholder → status 1, stderr `SUPABASE_SERVICE_ROLE_KEY must be set`. CI without NETLIFY + public vars → 0. Script matches §6.3 paste. Full `CI=true NETLIFY=true npm run build` not run.                                                                               |
| Contact form cannot fire two POSTs from double submit                                                                                                                                                                                                                            | **PASS**               | Unit: two `fireEvent.submit` → `fetch` ×1. Live: hung `**/api/contact` + two clicks → **1 POST**; button `disabled` + `aria-busy=true`. Then success chrome (“Thanks for reaching out!”).                                                                                                            |
| In-memory rate-limit store caps at 5_000 IPs per namespace (unit)                                                                                                                                                                                                                | **PASS**               | `rateLimit.test.ts`: 5001 unique IPs, `getRateLimitStoreSize("cap") <= 5000`, later IP `{ allowed: true }`. Evict uses strict `<` on `resetAt` (insertion-oldest on tie). Upstash path untouched.                                                                                                    |
| `/api/contact` still rejects bad Origin, filled `website` honeypot, oversize. Empty body and malformed JSON → **400** not 500. Oversize → **413**. Those client-error paths do **not** `reportServerError`. Origin / honeypot / rate-limit kept.                                 | **PASS**               | Vitest: existing 403 / honeypot / 429 still pass; new 400/413 assert `reportServerError` not called; stream overflow without CL cancels the reader. Live curl/chunked: see commands. Dev log: those POSTs returned 400/403/200/413 with **no** `[hmc:server]`. No `request.json()`. No `hp_company`. |
| After Phase 1: PostgREST anon INSERT fails; browser contact form still 200 with service role                                                                                                                                                                                     | **BLOCKED (expected)** | Live `schema_migrations` still 001–008 + dummy. Policy `"Anyone can insert contact submissions"` `cmd=INSERT` `with_check=true`. `anon` still has INSERT (and UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES). `014` not applied (Gate 0/1). Logged **P3-2**. Did not `db push`.                          |

---

## What is actually correct (do not redo)

- File scope matches §6.1 plus the specified tests, with the documented `PrivacyClient.tsx` render (P3-3). `page.tsx` already `getTranslations("privacy")` + `<PrivacyClient />`. Mock auth, SQL, quiz client, full 16A (`sendDefaultPii` / `beforeBreadcrumb` `ui.input` / ingest throttle / CSP) untouched.
- `terms.*`: no “never leaves the device” sentence. `disclaimerBody` left as-is.
- `analytics.ts`: `trackPageView` already pathname-only (`origin + pathname`, ignores the `_url` argument). `EVENTS.SEARCH_PERFORMED` is defined and **unused**. `SearchDialog` has no `trackEvent` / query text.
- Contact body reader matches §6.1.1: origin + rate-limit **before** bytes; CL > 10240 → 413 no read; null/missing body and `JSON.parse` fail → 400; stream cap + `reader.cancel()`; `concatUint8` local; extra non-object JSON → 400 (needed to avoid destructure 500; no Zod). Outer `catch` does not swallow those returns.
- `inFlight` ref set **before** `fetch`, cleared in `finally`. Submit button still `loading={submitting}` → native `disabled` + `aria-busy`.
- Env gate is NETLIFY-only after public Supabase checks. Test harness deletes `SUPABASE_SERVICE_ROLE_KEY` **and** `NETLIFY` between cases.
- `beforeSend` strip is string-slice at first `?` or `#` on `event.request.url` and `breadcrumb.data.url`. Path slugs kept. Copy’s strip sentence is therefore backed by 3B-code.
- `controlBody` export path is Dashboard (`DashboardHeader` `downloadProgressExport`), delete path is Dashboard → Settings. Consistent with current UI.
- Education copy no longer implies no health-related learning data is stored. No new HIPAA claim on privacy/terms.
- Specified Vitest cases exist and assert real behavior (no `expect(true)`). Extra stream-overflow case asserts `cancel()`.
- Adjacent `/en/terms` still educational disclaimer + acceptance cards. Contact form still `surface-card-glass` / `Input` / `Button` / `role="alert"` on form errors. 390px form fields visible; send button ~308×56.
- EN/ES catalogs 737/737 keys, `tsc` (`Messages = typeof en`) green.

---

## Tests / commands (this review)

```
npx vitest run scripts/check-production-env.test.ts scripts/ga-init.test.ts \
  src/app/api/contact/route.test.ts \
  "src/app/[locale]/contact/ContactClient.test.tsx" \
  src/lib/rateLimit.test.ts src/lib/errorReporting.test.ts
  Test Files  6 passed (6)
  Tests       79 passed (79)

npm test
  Test Files  110 passed (110)
  Tests       755 passed (755)

npm run lint       → 0 errors (pre-existing warning: GoogleAnalytics.test.tsx)
npm run typecheck  → pass

npx playwright test e2e/smoke.spec.ts --project=chromium
  6 passed (home, locale, glossary, root redirect, EN privacy, ES privacy)
```

Completion report said 109 / 745. Delta is later Phase 4 tests in the same working tree, not a Phase 3 lie.

Live curl / chunked (dev):

```
POST /api/contact, Origin, no body                         → 400 {"error":"Invalid JSON"}
POST /api/contact, Origin, body `{`                        → 400 {"error":"Invalid JSON"}
POST /api/contact, no Origin                               → 403 {"error":"Forbidden"}
POST honeypot website: filled                              → 200 {"success":true}
POST Content-Length: 20000                                 → 413 {"error":"Payload too large"}
POST chunked ~11KB JSON, no Content-Length                 → 413 {"error":"Payload too large"}
GET  /ga-init.js                                           → page_location origin+pathname, no anonymize_ip
```

Playwright: required smoke assertions. Chromium run. Firefox/WebKit env-blocked (P2-3).

---

## Completion-report audit

Honest on apply: PostgREST line marked **BLOCKED**, not passed. 3-PR split listed as a deviation, not a pass. `PrivacyClient.tsx` vs `page.tsx` logged as P3-3. P3-1 contact sidebar copy is real.

Did not invent object names. Live curl table matches this review. Unit counts matched at completion; later Phase 4 tests shifted the full-suite total.

Did **not** hide punch 1 (process). This review still treats it as merge-blocking because §0.1 is a hard rule and the index now also contains Phase 4.

---

## Out of scope / logged, not re-opened as Phase 3 code fixes

- **P3-1** `contact.supportPrivacyBody` still “local storage” — confirmed live on `/en/contact`. `contact.*` keys were not in §6.1.
- **P3-2** PostgREST anon INSERT until `014` — confirmed live. Expected.
- **P3-3** renderer is `PrivacyClient.tsx` — correct; `page.tsx` only mounts it.
- **P2-5** `PLAN.v10.md` still missing on `main` disk.
- Glass footer on privacy (`PrivacyClient.tsx:61-66`) still repeats `collectBody` under a `controlTitle` eyebrow (pre-existing chrome). `collectDup === 2` in the DOM. Same tokens; not an acceptance miss.
- Header hamburger at 1440 — Phase 10.
- Honeypot textbox “Leave this empty” still appears in the a11y tree — pre-existing, not introduced here.
- `CI=true NETLIFY=true npm run build` — not a merge blocker; unit gate matches §6.3.
- Full 16A Sentry (`query_string` field, `beforeBreadcrumb` `ui.input`, ingest throttle) — explicitly out of 3B-code.

---

## UI notes (reviewer screenshots, not before-state)

| Surface                    | 1440                                                                                                          | 390                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `/en/privacy`              | Education / control 2-col; full-width collect with all six `<p>`; email + leftover-device + strip; no old lie | Same copy, stacked, usable           |
| `/es/privacy`              | Spanish headings + account-storage sentence Playwright asserts                                                | Same                                 |
| `/en/terms`                | Disclaimer intact; no device-only lie                                                                         | —                                    |
| `/en/contact`              | Form usable; sidebar still “local storage” (P3-1)                                                             | Notes then form; send button ~308×56 |
| Double-submit (hung fetch) | One POST; button busy/disabled; success state after fulfill                                                   | —                                    |

Tokens: `surface-card` / `surface-card-glass` / `font-display` / `text-headline-sm`. No new chrome, no HIPAA badge, no anonymize-IP claim.
