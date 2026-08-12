# Data-Flow Recon

## Method

Read: `AppProviders.tsx`, `AuthProvider.tsx`, `useProgress.ts`, `guestProgress.ts`,
`lib/supabase/{client,server,middleware,env,mockClient}.ts`, `SearchDialog.tsx`,
`app/[locale]/HomeClient.tsx`, plus `lib/content.ts`, `lib/preferences.ts`,
`lib/progressExport.ts`, dashboard layout/page.

Searches run (`rg --type-add 'tsx:*.tsx' --type-add 'ts:*.ts'`):

- `createContext` — enumerate React Contexts
- `localStorage` / `sessionStorage` — find storage usage
- `from\(['\"]` — Supabase queries
- `^(export )?async function (load|get|fetch)` — data loaders
- `from ['\"]@/data/"` — bundled-data imports
- `^['\"]use client['\"]` (`-l`) — client boundary files
- `server-only`, `cache(`, `unstable_cache`, `force-dynamic`
- `auth.getUser|getUser\(\)` — current-user fetch points
- `markLessonComplete|toggleLessonComplete` — save-progress paths
- `useAuth`/`useProgress`/`useAppState` consumers
- `import .* from ['\"]@/lib/supabase/(server|client)` — boundary check

Counts: 80 `use client` files / 353 total TS/TSX (incl. tests). 4 React Contexts.
0 `cache(`/`unstable_cache` usages. 36 non-test `supabase.from(...)` query sites.

## Findings

### DF-001: No consolidated progress context — `useProgress` rebuilds Supabase client every call

- **Category:** state | scattered-concern
- **Severity:** P1
- **Files:** src/hooks/useProgress.ts:334, src/components/providers/AuthProvider.tsx:22, src/components/ui/NotificationCenter.tsx:57, src/app/[locale]/auth/login/LoginForm.tsx:38, src/app/[locale]/auth/forgot-password/ForgotPasswordForm.tsx:101, src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx:14, src/app/[locale]/auth/signup/SignupForm.tsx:28, src/app/[locale]/dashboard/settings/settings-client.tsx:36
- **Description:** `useProgress` calls `useMemo(() => createClient(), [])` (line 334) to construct its own SupabaseClient. The same pattern is independently used in `AuthProvider`, `NotificationCenter`, `LoginForm`, `ForgotPasswordForm`, `ResetPasswordClient`, `SignupForm`, and `settings-client`. Each produces a distinct client instance with its own auth state, its own `auth.getUser()` roundtrip on mount, and its own subscription handle. No shared client / no progress context — `useProgress` is re-invoked in every consumer (`LessonPageClient`, `QuizClient`, `LearningPathDetailClient`) instead of being lifted to a provider.
- **Suggested remedy:** Introduce a `SupabaseContext` (or reuse `AuthProvider`'s `supabase`) so all client components share one `SupabaseClient`. Alternatively, ship a `ProgressProvider` that runs the `useProgress` logic once and exposes the value via context.

### DF-002: `AppProviders` is a god-object holding 10+ pieces of independent state

- **Category:** state | prop-drilling (via context surface)
- **Severity:** P1
- **Files:** src/components/AppProviders.tsx:53-61, 87-103
- **Description:** A single `AppProviders` component owns `locale`, `theme`, `textSize`, `simpleMode`, `completedLessons`, `recentLessons`, `startedPaths`, `quizScores`, `hydrated` — that is 9 `useState` calls plus 4 `useEffect`s that sync each one to `localStorage` (lines 87-103). Every consumer of `useAppState()` re-renders when any of these changes, even though the concerns are unrelated (UI prefs vs. progress vs. i18n).
- **Suggested remedy:** Split into `PreferencesProvider` (locale/theme/textSize/simpleMode), `ProgressProvider` (completedLessons/recentLessons/startedPaths/quizScores) and keep `useProgress` as a thin hook over the progress context.

### DF-003: localStorage writes scattered across three modules with overlapping responsibilities

- **Category:** scattered-concern | caching
- **Severity:** P2
- **Files:** src/components/AppProviders.tsx:87-103, src/lib/progressExport.ts:88-92, src/lib/preferences.ts:73-89, src/app/[locale]/tools/visit-checklist/VisitChecklistClient.tsx:28, src/app/[locale]/tools/visit-planner/useVisitPlanner.ts (readStoredJson/writeStoredJson)
- **Description:** Three modules write the same `STORAGE_KEYS.completedLessons` / `recentLessons` / `startedPaths` / `quizScores` keys:
  - `AppProviders` useEffects (source of truth)
  - `progressExport.applyProgressImport` (line 88) — rewrites same keys on import
  - `preferences.writeStoredJson` — generic helper used by visit-planner and visit-checklist with `STORAGE_KEYS.checklist` / `STORAGE_KEYS.visitPlanner` (separate keys, but the same generic JSON store)
    There is no single storage facade. `STORAGE_KEYS` is defined in `preferences.ts` and reused by `progressExport.ts`, blurring module boundaries.
- **Suggested remedy:** Introduce a `lib/storage/progressStorage.ts` facade exposing typed read/write/migrate for progress keys. Keep visit-planner/checklist keys under the same facade.

### DF-004: `useProgress` derives progress from two competing sources of truth

- **Category:** state | fetching
- **Severity:** P1
- **Files:** src/hooks/useProgress.ts:78-119, 122-146, 159-201
- **Description:** Progress state is assembled from:
  1. `useSupabaseProgress` (line 78) — fetches `lesson_progress` and `quiz_attempts` rows
  2. `useDerivedProgress` (line 122) — switches between `supabaseCompletedLessonIds` (logged in) or `Array.from(completedLessons)` from `AppProviders` (guest)
     When the user is authenticated, the AppContext-completed lessons are silently dropped. When guest, the supabase rows are ignored. The migration (`useGuestMigration`, line 49) runs once on login but uses neither source as canonical afterward — both stay live.
- **Suggested remedy:** Pick a single canonical source per auth state. Either (a) after migration, clear `AppContext.completedLessons` and treat Supabase as source of truth, or (b) persist Supabase rows back into AppContext and only use the union when needed.

### DF-005: "Get current user" is invoked from five independent locations

- **Category:** scattered-concern | fetching
- **Severity:** P2
- **Files:** src/components/providers/AuthProvider.tsx:33, src/lib/auth/requireAuth.ts:10, src/lib/dashboard/profile.ts:22, src/lib/supabase/middleware.ts:30, src/app/[locale]/dashboard/layout.tsx (via `requireAuth` then `supabase.from("profiles").eq("id", user.id)`)
- **Description:** `supabase.auth.getUser()` is called in:
  - client `AuthProvider` mount (line 33)
  - server `requireAuth` (line 10)
  - server `dashboard/profile.getUserProfile` (line 22)
  - middleware `updateSession` (line 30)
    Multiple `getUser()` calls happen per request: middleware → `requireAuth` → `getUserProfile`. Each is a network roundtrip. There is no caching of the user object across these layers.
- **Suggested remedy:** Cache the user on the request scope (e.g., a `getServerUser()` helper using React's `cache()` or a `headers()`-keyed memo). Pass the resolved user down rather than re-fetching in each helper.

### DF-006: Module-level manual caches exist in two places without lifecycle

- **Category:** caching
- **Severity:** P2
- **Files:** src/hooks/useProgress.ts:46 (`let loadPathsPromise = null`), src/lib/glossary/highlighterCache.ts:8-11 (`WeakMap` + `lastTermsFallback` + `lastCacheFallback`), src/app/api/og/route.tsx:7 (`let fontCache: Promise<ArrayBuffer> | null = null`)
- **Description:** Several modules keep mutable module-level state to memoize expensive work:
  - `useProgress.ts:46` caches a dynamic `import("@/lib/paths/loadPaths")` promise, reused in `markLessonComplete` (line 199) to compute path-completion notifications. State survives the hook's lifecycle and is shared across all hook instances on the same page.
  - `highlighterCache.ts:8` keeps a `WeakMap<GlossaryTerm[], GlossaryCacheEntry>` plus two module-level fallbacks. The fallbacks (`lastTermsFallback`, `lastCacheFallback`) are not keyed and are shared — they can leak between unrelated components that happen to render sequentially with different term arrays.
  - `api/og/route.tsx:7` caches a font ArrayBuffer at module scope.
- **Suggested remedy:** Replace ad-hoc module caches with explicit cache utilities (e.g., `cache()` from React for request-scoped, `unstable_cache` from Next for time-scoped, or a typed LRU for component-scoped). The `lastTermsFallback` fallback in particular should be removed or keyed per-term-array.

### DF-007: Zero Next.js fetch cache / `unstable_cache` / `revalidateTag` usage

- **Category:** caching | server-client-boundary
- **Severity:** P2
- **Files:** src/app/[locale]/dashboard/{page,layout,progress/page,achievements/page,settings/page}.tsx, src/app/[locale]/auth/{confirm,callback}/route.ts, src/lib/auth/requireAuth.ts, src/lib/dashboard/*.ts
- **Description:** `rg "cache\(|unstable_cache|revalidateTag|revalidatePath"` returns zero hits across `src`. Every server component and route handler that fetches from Supabase runs the full query on every request. The dashboard pages pin `export const dynamic = "force-dynamic"` (lines 14, 7, 7, 15) to disable static generation, but no per-request deduplication (`cache()`) or time-based caching (`unstable_cache`) is added — so a single dashboard render still issues 5 parallel queries (line 35-41 of `dashboard/page.tsx`) with no memo.
- **Suggested remedy:** Wrap the user-scoped helpers in `cache()` from `react` so the same `getUserProfile`, `getUserLearningPaths`, etc. dedupe within a single request. Consider `unstable_cache` keyed by `user_id` for non-realtime aggregations like achievements.

### DF-008: `SearchDialogContent` receives 8+ props including a passed-down `t` translator

- **Category:** prop-drilling
- **Severity:** P3
- **Files:** src/components/SearchDialog.tsx:58-67, 257-266
- **Description:** `SearchDialogContentProps` includes `t`, `close`, `inputRef`, `query`, `setQuery`, `results`, `noResultsTitle`, `noResultsDescription`. The `t` translator and the derived `noResultsTitle`/`noResultsDescription` strings are computed in the parent (lines 192-196) and threaded through a `contentProps` object (lines 257-266). The parent is also responsible for the `isOpen`, `query`, `entries` state (lines 183-185) — `SearchDialog` mixes controller logic with presentation.
- **Suggested remedy:** Have `SearchDialogContent` call `useTranslations("search")` itself (removes `t` prop). Derive `noResultsTitle`/`noResultsDescription` inside the dialog. Alternatively, extract a `useSearchDialog` hook that owns `isOpen`, `query`, `entries` and is consumed by both the trigger and the dialog.

### DF-009: Server/client boundary is clean — no `server-only` import and no client import of `lib/supabase/server`

- **Category:** server-client-boundary
- **Severity:** P3 (informational / good)
- **Files:** src/lib/supabase/server.ts:1-25, src/lib/supabase/client.ts:1-10
- **Description:** `rg "server-only"` returns nothing. `lib/supabase/server` is imported exclusively from server components and route handlers (`dashboard/page.tsx`, `dashboard/layout.tsx`, `auth/callback/route.ts`, `auth/confirm/route.ts`, `lib/auth/requireAuth.ts`). `lib/supabase/client` is imported only from `"use client"` files (`AuthProvider`, `useProgress`, `NotificationCenter`, the auth forms, `settings-client`). No leaks detected.
- **Suggested remedy:** None. Optionally, add `import "server-only"` to `lib/supabase/server.ts`, `lib/auth/requireAuth.ts`, and the dashboard `layout.tsx`/`page.tsx` to make the boundary explicit and prevent future regressions.

### DF-010: "Save progress" code paths are fragmented across at least four distinct flows

- **Category:** scattered-concern | fetching
- **Severity:** P1
- **Files:** src/hooks/useProgress.ts:161-235 (markLessonComplete), src/hooks/useProgress.ts:237-286 (saveQuizAttempt), src/components/AppProviders.tsx:99-103 (useEffect sync), src/lib/progressExport.ts:88-92 (import), src/lib/guestProgress.ts:63-110 (migration), src/lib/streaks.ts:18, src/lib/dashboard/dailyLog.ts:4
- **Description:** A lesson completion can flow through:
  1. `markLessonComplete` optimistic upsert to `lesson_progress` (useProgress:166) + side effects `updateDailyLog` (line 180), `checkAndAwardAchievements` (line 184), `updateStreak` (line 194), `createNotifications` (line 215).
  2. The `AppProviders` useEffect (lines 99-103) writes the same data to `localStorage`.
  3. On login, `migrateGuestProgressToSupabase` (guestProgress:63) re-upserts lesson rows and quiz attempts — different code path than (1) but writes the same tables.
  4. On import, `applyProgressImport` (progressExport:88) writes only to `localStorage` — Supabase is not updated.
     Plus `saveQuizAttempt` (useProgress:237) does its own optimistic insert + side-effect chain (lines 257-278).
     There is no single `saveProgress()` entry point; the same physical actions are spread across hooks, providers, and lib helpers.
- **Suggested remedy:** Consolidate progress writes behind one API surface (e.g., `progressService.markLessonComplete(user, lessonId)` and `progressService.saveQuizAttempt(...)`) that owns the optimistic update, Supabase write, daily log, achievement check, streak update, and notification creation. Both `useProgress` and `migrateGuestProgressToSupabase` should call it.

### DF-011: Lesson-by-slug lookups are duplicated under three names — `getLessonById`, `getLessonFromMdx`, `getLessonByIdFromBundle`

- **Category:** scattered-concern | fetching
- **Severity:** P2
- **Files:** src/lib/content.ts:28, src/lib/lessons/loadLessons.ts:9 (`getLessonByIdFromBundle`), src/lib/lessons/mdxParser.ts:84 (`getLessonFromMdx`), src/lib/localizedContent.ts:23 (`getLessonById` re-export)
- **Description:** Three functions resolve a lesson by id:
  - `lib/content.ts:28` `getLessonById(id, locale)` — async, wraps `getLessonByIdFromBundle`
  - `lib/lessons/loadLessons.ts:9` `getLessonByIdFromBundle(id, locale)` — sync, runs `.find` on `lessonBundles[locale]`
  - `lib/lessons/mdxParser.ts:84` `getLessonFromMdx(id, locale)` — async, parses MDX
    And `lib/localizedContent.ts:23` re-exports `getLessonById`. Consumers must know which one to call. `content.ts` exists purely as a forwarder. There is no single entry point that picks MDX-vs-bundle based on context.
- **Suggested remedy:** Collapse to one canonical `getLessonById(id, locale)` (probably in `lib/lessons/loadLessons.ts`) that internally chooses bundle lookup vs. MDX parse. Delete `lib/content.ts` or make it re-export only.

### DF-012: `localStorage` keys are defined in two locations with overlapping responsibility

- **Category:** caching | scattered-concern
- **Severity:** P3
- **Files:** src/lib/preferences.ts:13-24 (`STORAGE_KEYS` and `PREFERENCE_COOKIES`), src/lib/progressExport.ts:1 (imports `STORAGE_KEYS`)
- **Description:** `STORAGE_KEYS` lives in `preferences.ts` alongside cookie helpers, but it covers both preference keys (`locale`, `theme`, `textSize`, `simpleMode`) and progress keys (`completedLessons`, `recentLessons`, `startedPaths`, `quizScores`) plus tooling keys (`checklist`, `visitPlanner`). `progressExport.ts` imports `STORAGE_KEYS` to read/write progress data — a clean separation between "preferences" and "progress" modules is missing.
- **Suggested remedy:** Split `STORAGE_KEYS` into `PREFERENCE_STORAGE_KEYS` (kept in `preferences.ts`) and `PROGRESS_STORAGE_KEYS` (kept in a new `lib/storage/progress.ts`). Update `progressExport.ts` to import the latter.

### DF-013: Five dashboard queries fan out via `Promise.all` but each is a separate Supabase roundtrip with no batching

- **Category:** fetching
- **Severity:** P2
- **Files:** src/app/[locale]/dashboard/page.tsx:35-41, src/lib/dashboard/{profile,progress,learningPaths,recommendations,activity,achievements,quizzes,dailyLog}.ts
- **Description:** `dashboard/page.tsx` awaits `Promise.all([getUserProgressSummary, getUserLearningPaths, getRecentActivity, getUserAchievements, getRecommendedNextLesson])`. Internally each function (`lib/dashboard/*.ts`) issues its own `.from(...).select(...).eq("user_id", user.id)` — that is at least 5+1 queries (the dashboard `layout.tsx` separately queries `profiles` and `streaks`, plus `requireAuth` calls `auth.getUser()`). No RPC batching, no `Promise.all` reuse, no `cache()` deduplication across the layout + page.
- **Suggested remedy:** Introduce a single `getDashboardData(supabase, userId, locale)` RPC or aggregator function that fires all subqueries with shared `Promise.all`. Wrap user-scoped helpers in `cache()` so layout and page share results.

### DF-014: Visit-planner and visit-checklist tools bypass `AppProviders` and manage their own localStorage state

- **Category:** state | scattered-concern
- **Severity:** P3
- **Files:** src/app/[locale]/tools/visit-checklist/VisitChecklistClient.tsx:13-43 (`useChecklistState`), src/app/[locale]/tools/visit-planner/useVisitPlanner.ts:1-50 (`useVisitPlanner`)
- **Description:** The two tools implement their own read-from-`localStorage`/write-back effects (`readStoredStringArray`, `writeStoredJson`) and own `useState`/`useEffect` hydration. They bypass the AppContext/localStorage sync used by `AppProviders`. This pattern is independent and tests differently — `useVisitPlanner.test.ts` mocks `window.localStorage.setItem` directly. Two parallel persistence strategies in the same app.
- **Suggested remedy:** Either accept that tools are leaf features and ship them as standalone `useLocalStorageState(key)` hooks reused across the app, or fold the tool state into a `ToolStateProvider` and centralise the read/write helpers.

### DF-015: SearchDialog uses runtime template import `@/data/searchIndex.${locale}.ts`

- **Category:** fetching | server-client-boundary
- **Severity:** P3
- **Files:** src/components/SearchDialog.tsx:204
- **Description:** `import(\`@/data/searchIndex.${locale}.ts\`)`is a client-side dynamic import whose specifier is interpolated at runtime from`locale`(sourced from`useAppState()`). The pattern is intentional (avoids bundling the other locale's search index) but breaks static analysis: bundlers must produce separate chunks per locale and the import path cannot be checked at compile time. The `entries` are then stored in component state (line 185) and re-filtered on each keystroke (line 227).
- **Suggested remedy:** Document the constraint in the SearchDialog module (the import path must remain a single variable interpolation). If locale ever becomes runtime-mutable (which it does via `setLocale`), consider prefetching both locale indexes to avoid a runtime flash on toggle.

### DF-016: Four React Contexts in four different files — no central provider registry

- **Category:** state | prop-drilling
- **Severity:** P3
- **Files:** src/components/AppProviders.tsx:44 (`AppContext`), src/components/providers/AuthProvider.tsx:15 (`AuthContext`), src/components/ui/ToastProvider.tsx (ToastContext, line 18), src/components/mdx/ScrollSpyProvider.tsx:11 (`ScrollSpyContext`)
- **Description:** Four contexts, declared in four locations. The provider composition order is fixed in `app/[locale]/layout.tsx`: `AppProviders > AuthProvider > ToastProvider > ScrollSpyProvider` (the latter two via `AppProviders` and MDX renderers). New context additions risk being placed outside the dependency order (e.g., a context needing `useAuth` accidentally rendered above `AuthProvider`).
- **Suggested remedy:** Keep a single provider composition file (or extend `AppProviders` to also wrap `AuthProvider` and `ToastProvider`) so the order is enforced in one place. Add an ESLint `react-hooks/rules-of-hooks` + `react-refresh/only-export-components` rule to catch regressions.

### DF-017: AuthProvider duplicates auth-state logic that the server-side `requireAuth` already handles

- **Category:** fetching | scattered-concern
- **Severity:** P3
- **Files:** src/components/providers/AuthProvider.tsx:24-39, src/lib/auth/requireAuth.ts:7-22, src/lib/supabase/middleware.ts:6-43
- **Description:** Auth-state validation exists in three places:
  1. `AuthProvider` (client) — subscribes via `supabase.auth.onAuthStateChange` and calls `supabase.auth.getUser()` on mount (lines 27, 33).
  2. `requireAuth` (server) — calls `supabase.auth.getUser()` and `redirect`s if absent (lines 10-19).
  3. `lib/supabase/middleware.ts` `updateSession` — calls `supabase.auth.getUser()` on every request and redirects unauthenticated dashboard access (lines 30-41).
     All three re-implement the "is the user logged in?" check using the same `auth.getUser()` call. There is no shared helper.
- **Suggested remedy:** Provide a single `getCurrentUser()` helper on the server (returning `User | null`, wrapped in `cache()`), consumed by both `requireAuth` and the middleware. On the client, `AuthProvider` can stay as-is but should reuse the same `AuthContextValue` shape used elsewhere.

### DF-018: Fetching patterns are consistent in shape but inconsistent in placement

- **Category:** fetching
- **Severity:** P3
- **Files:** src/hooks/useProgress.ts:90-95, 166, 246; src/lib/dashboard/*.ts (all use `.from(...).select(...).eq(...)`); src/app/[locale]/dashboard/page.tsx:33-41
- **Description:** On the bright side, the _shape_ of Supabase queries is uniform: `.from(table).select(cols).eq("user_id", user.id)`. However, the _placement_ varies:
  - Client components invoke Supabase directly via `createClient()` from `lib/supabase/client` (`useProgress`, `AuthProvider`, `NotificationCenter`, auth forms).
  - Server components invoke Supabase directly via `createClient()` from `lib/supabase/server` (`dashboard/page.tsx`, `dashboard/layout.tsx`, route handlers).
  - There is no API layer. Both client and server code touch Supabase tables directly.
    This is fine for a small app but means schema changes ripple across many files.
- **Suggested remedy:** Optional. Consider a thin server-side data-access layer (one module per table: `lessonProgressRepository.ts`, `quizAttemptsRepository.ts`, etc.) and a thin client-side hook layer (`useLessonProgress`, `useQuizAttempts`). Already half-done with `lib/dashboard/*`; consolidate the rest.

### DF-019: `HomeClient` (and other large client components) receive server-fetched data as props — pure prop drilling from server boundary

- **Category:** prop-drilling | server-client-boundary
- **Severity:** P3
- **Files:** src/app/[locale]/page.tsx:34-56 (fetches `lessons` and `learningPaths` and passes to `HomeClient`), src/app/[locale]/HomeClient.tsx:25 (consumes `lessons` and `learningPaths` props), src/app/[locale]/learn/[slug]/page.tsx:62-99 (passes `lesson`, `glossaryTerms`, `learningPaths` to `LessonPageClient`)
- **Description:** Server components fetch bundled content (via `getAllLessons(locale)`, `getAllLearningPaths(locale)`) and pass arrays down to client components. For example, `HomeClient` receives the entire `lessons` and `learningPaths` arrays as props. `LessonPageClient` receives `lesson`, `glossaryTerms`, `learningPaths`. This is correct Next.js practice (RSC payload), but it means the client bundle has the full content array even when only a subset is rendered, and progress-related logic at the client must re-reconcile with AppContext state.
- **Suggested remedy:** Mostly fine. Consider `unstable_cache` around the `getAll*` calls to dedupe across requests in the same locale. If bundles are large, split the locale-specific data fetch into per-route sub-fetches (e.g., the lesson page only fetches its own lesson + related terms, not the entire `learningPaths` array).

## Summary

- Total findings: 19
- Fetching patterns: 6 (DF-001, DF-005, DF-010, DF-011, DF-013, DF-018)
- State management issues: 6 (DF-001, DF-002, DF-004, DF-014, DF-016, DF-017)
- Server/client boundary issues: 4 (DF-007, DF-009, DF-015, DF-019)
- Caching issues: 5 (DF-003, DF-006, DF-007, DF-012, DF-013)
- Prop drilling issues: 4 (DF-002, DF-008, DF-016, DF-019)
- Scattered concerns: 6 (DF-001, DF-005, DF-010, DF-011, DF-012, DF-017)

Severity totals: P0=0, P1=4 (DF-001, DF-002, DF-004, DF-010), P2=6 (DF-003, DF-005, DF-006, DF-007, DF-011, DF-013), P3=9 (DF-008, DF-009, DF-012, DF-014, DF-015, DF-016, DF-017, DF-018, DF-019).

Top three actions by leverage:

1. Introduce a shared `SupabaseContext` + `ProgressProvider` (resolves DF-001, DF-002, DF-004, DF-010 in one stroke).
2. Add a single `getCurrentUser()` server helper wrapped in `cache()` (resolves DF-005, DF-007, DF-017).
3. Consolidate `getLessonById` into one canonical entry and remove `lib/content.ts` forwarder (resolves DF-011).
