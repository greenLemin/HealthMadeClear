# CHANGE_REVIEW_LOG.md — Per-Change Adversarial Review

**Date:** 2026-08-20  
**Phase:** 4 — Per-change adversarial review  
**Approach:** 3 parallel review subagents (sharded by module). Each reads actual file contents + diff, verifies against plan intent, hunts regressions/edge cases, returns APPROVE/REJECT.

---

## Review Subagent A — Contact Route + Middleware

**Files:**

- `src/app/api/contact/route.ts`
- `src/lib/supabase/middleware.ts`

### `src/app/api/contact/route.ts` — REJECT (Iteration 1)

**Matched intent:**

- `isAllowedOrigin` hostname compare (`route.ts:33`) ✓
- Comment explains subdomain block (`route.ts:30-32`) ✓
- Honeypot `website` check (`route.ts:69-70`) ✓ (initial — flagged below)
- Trim-before-length (`route.ts:84-87`) ✓
- `createClient` with `{auth:{persistSession:false, autoRefreshToken:false}}` (`route.ts:117-119`) ✓

**Edge cases passed:**

- missing Origin → 403
- evil.example.com → 403
- localhost:3001 origin + request localhost:3000 → allowed (hostname match)

**REJECT reason** — `route.ts:69-70`:
Reviewer traced whitespace honeypot regression. Original code `if (website)` treated `" "` as truthy → bot (returns `success: true`). New code `website.trim() !== ""` made `" ".trim() === ""` → false → NOT bot → fall through to insert. Bot bypassed detection. Comment at line 68 ("any non-empty string") inconsistent with `.trim()` behavior (whitespace IS non-empty but trimmed empty).

### Fix Applied (Iteration 2)

Replaced trim check with explicit truthiness preservation:

```ts
if (typeof website === "string" ? website !== "" : Boolean(website)) {
  return NextResponse.json({ success: true });
}
```

- `" "` (whitespace) → truthy string, `!== ""` → true → bot ✓
- `""` (empty) → false → user intent clear ✓
- `"filled"` → bot ✓
- `undefined` → `Boolean(undefined)` → false → user ✓
- `0`/`null` → false → user ✓

### `src/lib/supabase/middleware.ts` — APPROVE

- try/catch around `auth.getUser()` (lines 29-34) ✓
- Supabase down + dashboard → redirect to login (line 39) ✓
- Supabase down + non-dashboard → `supabaseResponse` (i.e., `next()`) ✓
- Style consistent. `middleware.test.ts` lacks catch-path coverage — add later, not blocking.

---

## Review Subagent B — Types + Mocks + i18n + LearnClient

**Files:**

- `src/types/database.ts`
- `src/lib/supabase/mock/types.ts`, `defaults.ts`, `normalizers.ts`, `queryBuilder.ts`
- `src/lib/i18n.ts`
- `src/app/[locale]/learn/LearnClient.tsx`

### All Files — APPROVE

- `database.ts:101-122` — contact_submissions Row/Insert/Update correct. `subject` optional matches route's default "general".
- `types.ts:6` — `options?: any` → `Record<string, unknown>`. No `any` left.
- `types.ts:18` — `MockContactSubmissionRow` alias added.
- `types.ts:44` — `MockDb.contact_submissions: MockContactSubmissionRow[]` present.
- `defaults.ts:48` — `contact_submissions: []` initializes. Matches MockDb type.
- `normalizers.ts:274-276` — builds `contactSubmissions` array; minimal filter requires string email. Append-only table — no complex normalization justified.
- `queryBuilder.ts:10` — `createMockId` import added alongside `createTimestamp`.
- `queryBuilder.ts:109-110` — `getTableRows` maps contact_submissions.
- `queryBuilder.ts:435-455` — `applyMutation` handles insert/upsert only; update/delete fall to `{rows:[],changed:false}` — correct for append-only table.
- `i18n.ts:3` — imports `LESSON_CATEGORY_IDS`.
- `i18n.ts:27-29` — `isLessonCategoryId(value: string): value is LessonCategoryId` narrows correctly via `LESSON_CATEGORY_IDS` membership.
- `LearnClient.tsx:11` — imports `isLessonCategoryId` alongside `getCategoryLabel`.
- `LearnClient.tsx:180` — replaces `categoryId as any` with `isLessonCategoryId(categoryId) ? getCategoryLabel(categoryId, locale) : categoryId`. Guard true → `getCategoryLabel` accepts `LessonCategoryId`. Guard false → raw string, no crash. Edge case "unknown categoryId renders raw string" satisfied.

### Cross-cutting checks

- `tsc --noEmit` clean.
- `vitest run` → 92 files / 629 tests pass. mockClient suite (17 tests) green.
- No `any` matches in any listed file.
- Edge cases verified: unknown categoryId raw render (LearnClient.tsx:180 else branch); insert with missing fields skipped (queryBuilder.ts:440 `continue`).

### Minor issues (non-blocking)

- `normalizers.ts:274-276` calls `asRecord(r)` twice (truthy check + email access). Cosmetic; perf trivial.
- `queryBuilder.ts:109` uses `row as unknown as Record<string, unknown>` cast more verbose than sibling cases using `{ ...row }` — harmless for unknown shape.

---

## Review Subagent C — Hooks + Errors + Misc

**Files:**

- `src/hooks/useProgress.ts`
- `src/lib/dashboard/utils.ts`
- `src/lib/dashboard/profile.test.ts` + `utils.test.ts`
- `src/lib/preferences.ts`
- `src/components/Logo.tsx`
- `src/components/dashboard/DashboardSidebar.tsx`
- 7 new `error.tsx` files
- `.nvmrc`

### All Files — APPROVE

#### `src/hooks/useProgress.ts`

- `useRef` imported; `completedIdsRef` synced via `useEffect` (lines 285-288)
- `markLessonComplete` reads ref, builds `next`, sets ref + state, passes `next` to side effects (lines 294-314)
- Rollback filters ref + state (lines 309-312)
- Deps arrays drop `supabaseCompletedLessonIds`; `setSupabaseCompletedLessonIds` retained (stable) — lines 321, 354
- `cancelled` flag + cleanup correct (lines 114, 142-145)
- `fetchUserId` guard prevents user-switch race — line 124
- `handleLessonCompletionSideEffects`/`handleQuizAttemptSideEffects` accept `completedIdsAfter` — lines 185, 208, 247, 254

**Caveat (non-blocking):** `fetchUserId !== user.id` (line 124) is effectively dead code — both captured at same instant in closure, always equal. `cancelled` flag actually prevents the race. Harmless.

#### `src/lib/dashboard/utils.ts`

- `logQueryError` → `reportServerError(error, { context })` (line 6)
- Emits `[hmc:server]` prefix + scrubs message + sanitizes context

#### Tests (`profile.test.ts`, `utils.test.ts`)

- Assertions updated for `[hmc:server]` prefix via destructuring `[0]` — lines 72-74, 152-154 (profile); 28-30 (utils)
- `toMatchObject({ context: "..." })` loose but valid

#### `src/lib/preferences.ts`

- `(prefers-color-scheme: dark)` spacing per CSS spec — line 126

#### `src/components/Logo.tsx`

- `<img>` kept; `eslint-disable-next-line @next/next/no-img-element` added — line 8
- `width={48} height={48}` matches `h-12 w-12` (12×4=48) — line 9
- `draggable={false}` retained

#### `src/components/dashboard/DashboardSidebar.tsx`

- `values?: any` → `values?: TranslationValues` — lines 37, 102
- `TranslationValues = Record<string, string | number | Date>` accepts Date for pluralization edge — line 23

#### 7 error.tsx files

- Each: `export { default } from "../error";`
- `../error` from each depth-1 folder resolves to `src/app/[locale]/error.tsx` ✓
- Each file has `"use client"` ✓

#### `.nvmrc`

- Bytes: `32 32 0a` = "22\n" ✓

---

## Summary

| File                                            | Verdict                         | Iterations |
| ----------------------------------------------- | ------------------------------- | ---------- |
| `src/app/api/contact/route.ts`                  | APPROVE (after Iteration 2 fix) | 2          |
| `src/lib/supabase/middleware.ts`                | APPROVE                         | 1          |
| `src/types/database.ts`                         | APPROVE                         | 1          |
| `src/lib/supabase/mock/types.ts`                | APPROVE                         | 1          |
| `src/lib/supabase/mock/defaults.ts`             | APPROVE                         | 1          |
| `src/lib/supabase/mock/normalizers.ts`          | APPROVE                         | 1          |
| `src/lib/supabase/mock/queryBuilder.ts`         | APPROVE                         | 1          |
| `src/lib/i18n.ts`                               | APPROVE                         | 1          |
| `src/app/[locale]/learn/LearnClient.tsx`        | APPROVE                         | 1          |
| `src/hooks/useProgress.ts`                      | APPROVE                         | 1          |
| `src/lib/dashboard/utils.ts`                    | APPROVE                         | 1          |
| `src/lib/dashboard/profile.test.ts`             | APPROVE                         | 1          |
| `src/lib/dashboard/utils.test.ts`               | APPROVE                         | 1          |
| `src/lib/preferences.ts`                        | APPROVE                         | 1          |
| `src/components/Logo.tsx`                       | APPROVE                         | 1          |
| `src/components/dashboard/DashboardSidebar.tsx` | APPROVE                         | 1          |
| 7 error.tsx files                               | APPROVE                         | 1          |
| `.nvmrc`                                        | APPROVE                         | 1          |

**Total files reviewed:** 18 + 7 new = 25  
**Approvals:** 25/25  
**REJECTS fixed:** 1 (contact route whitespace honeypot regression)  
**Verification gauntlet:** `typecheck` ✓, `lint` ✓ (0 errors, 1 acknowledged warning), `test` ✓ (629/629), `build` ✓.

---

## Non-blocking Notes (tracked for future)

1. `useProgress.ts:124` — `fetchUserId !== user.id` dead code. `cancelled` flag is the actual race guard. Cleanup later.
2. `normalizers.ts:274-276` — `asRecord(r)` called twice. Cosmetic.
3. `middleware.test.ts` — no catch-path coverage. Add `mockSupabase.auth.getUser.mockRejectedValue(new Error("network"))` test.
4. `queryBuilder.ts:109` — verbose cast for contact_submissions row. Acceptable.
5. `profile.test.ts` — assertions `toMatchObject({ context })` loose. Could tighten to full `toHaveBeenCalledWith` check.

All non-blocking. Phase 4 complete. Proceeding to Phase 5.

---

## Addendum — Deferred-Item Implementation Round (2026-08-20, second session)

Per user request ("Implement ALL deferred now"), all Tier 1-3 deferred items were executed. This addendum records the review outcome of each.

### Executed (verified via full gauntlet: tsc 0 errors, lint 0 errors, 653 tests pass, build 363/363, format clean, content:validate pass)

| #         | Item                                                                                                                                                                                                                                       | Verification                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| T1-Tst    | `useAuthFormState.test.tsx` (8 cases), `Header.test.tsx` (4), `loadArticles.test.ts` (+4), `useProgress.test.tsx` (rapid `Promise.all` regr. guard)                                                                                        | All new tests pass                                                           |
| T1-Typ    | eslint `react-hooks/set-state-in-effect` re-enabled; 10 intentional sites documented `eslint-disable-next-line -- reason`                                                                                                                  | 0 lint errors                                                                |
| T1-Split  | `useProgress.ts` 462→~100 LOC orchestrator + `useProgress/{guestMigration,supabaseProgress,mutations,queries,sideEffects,pathsCache}`                                                                                                      | typecheck + 15 hook tests                                                    |
| T1-Split  | `queryBuilder.ts` 608→~190 LOC class + `queryBuilder/{filters,transform,inputs,mutations}`                                                                                                                                                 | typecheck + 17 mock tests                                                    |
| T1-Strict | tsconfig `noUncheckedIndexedAccess`, `forceConsistentCasingInFileNames`, `noFallthroughCasesInSwitch` + ~225 mechanical `!` fixes (47 files, 5 parallel builders)                                                                          | tsc 0 errors                                                                 |
| T1-Cov    | vitest `include` → `src/**/*.{ts,tsx}` excl. data/messages; thresholds raised 35→50/49/45/45                                                                                                                                               | 51.8% lines                                                                  |
| T2        | `og-default.png` 499K → `og-default.jpg` 90K (JPEG q85), 4 metadata refs updated, PNG removed                                                                                                                                              | build + curl                                                                 |
| T2        | lint-staged adds `eslint --fix` for js/ts files                                                                                                                                                                                            | config valid                                                                 |
| T2        | Removed `js-yaml` override + `patch-yaml-compatibility.js` postinstall; gray-matter now resolves its own js-yaml@3.15.1 (native safeLoad)                                                                                                  | content:bundle identical output, content:validate pass                       |
| T2        | PWA icons `icon-192.png`/`icon-512.png` generated; `manifest.json` + `scope:"/"` + `id:"/"`; `sharp` override KEPT (defensive pin for next's transitive sharp)                                                                             | served via curl                                                              |
| T2        | `normalizers.ts` double `asRecord` → single with guard                                                                                                                                                                                     | 17 mock tests                                                                |
| T3        | tsconfig `target` ES2017 → ES2022 (safe: `noEmit`, Next/SWC controls output)                                                                                                                                                               | tsc + build                                                                  |
| T3.15     | `rateLimitDistributed.ts`: env-driven Upstash (pipeline INCR+EXPIRE+PTTL) with fail-open in-memory fallback; 3 route call sites await it; 7 new tests                                                                                      | 37 route/rate tests pass                                                     |
| T3.17     | playwright projects + firefox + webkit; CI installs all 3 browsers                                                                                                                                                                         | config parse                                                                 |
| T3.14     | 4 god-components decomposed: `HomeClient` 369→87 (`src/components/home/*`), `LessonPageClient` 377→188 (`src/components/lesson/*`), `QuizClient` 330→275 (`src/components/quiz/*`), `ProgressClient` 363→219 (`.../progress/components/*`) | build + curl: section headings, lesson Key Takeaways/Sources/PrevNext render |

### Evaluated and REJECTED (with evidence)

| #     | Item                                         | Why rejected                                                                                                                                                                                                                                                                                                                          |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T3.13 | `optimizePackageImports` += motion/next-intl | Empirical: `.next/static/chunks` 4.0M → 4.0M (zero benefit). `motion` is subpath-imported (`motion/react`), config wouldn't apply; next-intl already tree-shaken under SSG. Reverted to `["lucide-react"]`.                                                                                                                           |
| T3.16 | CSP nonce                                    | Next 16 docs: nonce CSP **requires dynamic rendering** — would disable SSG (363 static pages), CDN caching, ISR/PPR on Netlify. App is public static health education w/ optional auth, no PHI → fails docs' own "when to use nonces" criteria. Current `next.config` static CSP is the officially recommended "without nonces" path. |
| T3.18 | lessonBundle code splitting                  | Already optimal: only client component importing data (`SearchDialog.tsx:40`) already uses per-locale **dynamic import**; all other bundles imported server-side for SSG (not client JS); `useProgress` lazy-imports loadPaths. No change needed.                                                                                     |
| T3.19 | `quiz_attempts UNIQUE(user_id, quiz_id)`     | Would **break intended multi-attempt history**: `dashboard/activity.ts` merges quiz attempts into history feed, retries must record new rows. Adding the constraint makes re-takes fail. Original "retry idempotency" framing was a dedup/history conflation.                                                                         |

### New findings surfaced this round (remaining opportunities, not regressions)

- **Next 16 `middleware` → `proxy` deprecation**: build warns. Codemod exists (`npx @next/codemod@canary middleware-to-proxy`). Deferred — auth-guard + i18n routing migration is high-risk, warns are non-blocking.
- **Edge Runtime deprecation** on `api/og/route.tsx`: build warns. Could switch to `nodejs` runtime. Deferred (non-blocking).

### Final state

- typecheck: 0 errors · lint: 0 errors (1 pre-existing GA warning) · test: 653/653 (95 files) · coverage 51.8% lines ≥ 50 · build: 363/363 static · format: clean · content:validate: pass · audit: 0 vulns.
