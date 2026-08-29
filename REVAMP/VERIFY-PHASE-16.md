# VERIFY-PHASE-16

**Verdict: APPROVED** (follow-up 2026-08-28)

Original review was CHANGES REQUIRED for CI lint on 16B isolation tests. Punch items are fixed:

- Isolation tests count renders via `Profiler` `onRender` (no render-time mutation)
- `/dashboard/progress` uses `formatTimeSpentMinutes` — unused minutes show `—`
- `.env.example` and `docs/DEPLOYMENT.md` document server `SENTRY_DSN`
- `npm run lint` is clean (0 errors)

---

Reviewer is not the Phase 16 author. Spec read from `REVAMP/PLAN.v10.md` §19.1–19.5, plus PHASE-16A / 16B reports ([P16A hardening](4e73b53a-2f60-46ac-ada8-36eb4dfb25af), [P16B AppProviders](08e7bfa3-2afc-4170-806f-4eff2d24ab8b)). **16A security/CSP/Sentry/JsonLd/DashboardStats product work matches §19.4.** **16B isolation tests use `Profiler` `onRender` and lint is clean.**

---

## Method

- **Spec**: `REVAMP/PLAN.v10.md` §19.1–19.5.
- **Diff**: `scripts/check-security-headers.mjs` + test, `security-headers.json`, `next.config.mjs`, `netlify.toml`, `errorReporting.ts` + test, DashboardStats + test, JsonLd + test, `package.json` script, `ci.yml` step, AppProviders + test, `dashboard/progress.ts` + test.
- **Units**: 16A targeted files + AppProviders + progress — pass (in 956).
- **CSP**: `node scripts/check-security-headers.mjs` → `connect-src matches canonical list` exit 0.
- **Typecheck**: 0 errors.
- **Lint**: **0 errors** — isolation tests count via `Profiler` `onRender`. Also P12 files are clean (VERIFY-PHASE-12).
- **Playwright**: none required for 16.

Privacy `collectBodyErrors`: **check only** — present in `PrivacyClient.tsx` `COLLECT_KEYS` and both catalogs (`en.json:519`). Files not edited.

---

## Punch list (fixed 2026-08-28)

### 1. `AppProviders.test.tsx` immutability lint — **fixed**

Isolation tests count renders with React `Profiler` `onRender`, not render-time mutation of outer objects.

Progress page uses `formatTimeSpentMinutes` (`P16A-1`, done). `.env.example` / `docs/DEPLOYMENT.md` document server `SENTRY_DSN` (`P16A-2`, done).

---

## Acceptance criteria (re-checked)

| Criterion                                                                                                                                                          |        Result         | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI fails if netlify CSP `connect-src` diverges from next.config                                                                                                    |       **PASS**        | Checker compares next + netlify vs `security-headers.json` (`check-security-headers.mjs:39-78`). Rejects pinned `*.supabase.co` project-ref hosts (`:7-8, :54-64`). Requires `script-src 'unsafe-inline'` (`:80-89`). CI step `npm run check:security-headers` (`ci.yml:28`, `package.json` script). Repo run exit 0. Comments in next/netlify omit the substring `connect-src` so the parser does not ingest them.                                                                                                                                                                                                     |
| Sentry client: `sendDefaultPii: false`; no user IP/email; query **and** hash stripped; path slugs kept; `beforeBreadcrumb` drops `ui.input`                        |       **PASS**        | `errorReporting.ts:214-223`: `sendDefaultPii: false`; **no** `dataCollection: {}`. `beforeBreadcrumb` drops `console` and `ui.input` (`:215-218`). `beforeSend` → `scrubExceptionEvent`: extras/breadcrumbs, `user` blanked (`:149-151, :179`), `stripUrlQueryAndHash` on `?` and `#` (`:113-130`). Path slugs kept. Tests cover `lessonId` redaction via `SENTRY_EXTRA_WORDS` (`"lesson"`), `#access_token=`, `ui.input` + `data.value: "chest pain"` → null.                                                                                                                                                          |
| Privacy page includes `collectBodyErrors`                                                                                                                          | **PASS** (check-only) | `PrivacyClient.tsx` + `en.json:519` / `es.json:519`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Server reporter ingest when DSN set; 6th error in 10s does not `fetch`; `AbortSignal.timeout(2000)`; per-isolate throttle; `SENTRY_SERVER_SAMPLE_RATE` default `1` |       **PASS**        | `reportServerError` uses **`SENTRY_DSN` only** (`:312-314`) — Chosen path, not public DSN (`P16A-3`). `AbortSignal.timeout(2000)` (`:301`). Sliding window 5 / 10s (`:51-56, :259-266`). Sample default 1 (`:233-238`). Tests: 6th call → 5 fetches; sample `0` → no fetch; hung abort after 2s (polyfills `AbortSignal.timeout` under fake timers — production still calls the real API). Overflow still `console.error`s at the start of `reportServerError` then skips fetch. `.env.example` / `docs/DEPLOYMENT.md` document server vars (`P16A-2`, done). Ops still must set Netlify `SENTRY_DSN` (`P16A-3`, open). |
| Canonical `connect-src` uses `*.supabase.co` / `*.ingest.sentry.io` — not a pinned project-ref                                                                     |       **PASS**        | `security-headers.json` wildcards only. Checker flags `https://xdmbyadosmzixsxqullj.supabase.co`. No `pref-bootstrap.js` hash.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Dashboard does not claim minutes learned when column unused                                                                                                        |       **PASS**        | `DashboardStats` and `ProgressClient` use `formatTimeSpentMinutes` — unused minutes show `—` (`P16A-1`, done).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| JsonLd still escapes `<`                                                                                                                                           |       **PASS**        | `JsonLd.tsx:21-42`: plain-object check + `JSON.parse(JSON.stringify(data))`; `replace(/</g, "\\u003c")` (and `>` `/` U+2028/2029). Tests reject Date/class/circular; XSS case keeps unicode escapes.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Reduced-motion home video                                                                                                                                          |  **PASS** (Phase 13)  | Owned by Phase 13; autoplay fail-closed (`P13A-3`, done).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

---

## 16B (optional)

Split shipped: `PreferencesContext` vs `ProgressContext`, `useAppState` merge compat (`AppProviders.tsx:261-307`). `wipeGeneration` / `resetLocalProgress` stay on the progress provider. `getUserProgressSummary` already `Promise.all`s lesson + quiz + streak (`progress.ts:15-23`) — verified, not re-parallelized.

Isolation tests are the right idea and now lint-clean (punch #1, done).

---

## What is actually correct (do not redo)

1. CSP checker is check-only and compares three sources (next, netlify, JSON).
2. Client Sentry drops `ui.input` at **breadcrumb record time**, not only in `beforeSend`.
3. Hash fragments (`#access_token=`) are stripped; lesson slugs are not rewritten to `/learn/*`.
4. Server ingest is throttled per isolate with a 2s abort and `.catch(() => {})`.
5. Dashboard stats **and** progress page show an em dash when minutes are unused.
