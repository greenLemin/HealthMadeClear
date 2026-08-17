# Dependency-Topology Recon

## Method

Ran `npx madge --circular --extensions ts,tsx src` (no cycles), then `rg "^import .* from \"@/" src` plus targeted `rg` per directory to build the import graph. Inspected every `codemap.md` and the barrels at `src/components/ui/index.ts`, `src/lib/dashboard/index.ts`, and `src/app/[locale]/dashboard/types.ts`.

## Findings

### DT-001: Dead UI barrel — zero consumers

- **Category:** barrel-abuse
- **Severity:** P2
- **Files:** src/components/ui/index.ts:1 → (no consumers)
- **Description:** The barrel `src/components/ui/index.ts` re-exports 12 components plus 13 type groups (Alert, Badge, Button, Card, EmptyState, Input, KeyTakeaway, Modal, ProgressBar, Skeleton, ThemeToggle, ToastProvider/useToast). A repo-wide `rg "from \"@/components/ui\"$"` returns zero matches. Every consumer bypasses the barrel via `@/components/ui/<Component>` — 151 such deep imports across `src/`. The barrel is pure dead weight: it exists without purpose, and the project has implicitly standardized on direct imports.
- **Suggested remedy:** Either (a) delete `src/components/ui/index.ts` and codify "import directly from `@/components/ui/<Component>`" as the convention, or (b) flip the convention by replacing the 151 deep imports with `@/components/ui` barrel imports so the barrel actually pays for itself. Pick one; do not ship both.

### DT-002: `src/lib/dashboard/index.ts` re-exports too much

- **Category:** barrel-abuse
- **Severity:** P2
- **Files:** src/lib/dashboard/index.ts:1-9 → consumed by src/hooks/useProgress.ts:20, src/app/[locale]/dashboard/page.tsx:5-11, src/app/[locale]/dashboard/achievements/page.tsx:4, src/app/[locale]/dashboard/progress/page.tsx:5-11, src/app/[locale]/dashboard/settings/page.tsx:4, src/app/[locale]/dashboard/DashboardClient.tsx (transitively)
- **Description:** The barrel does `export * from "./progress"`, `./learningPaths`, `./activity`, `./achievements`, `./recommendations`, `./quizzes`, `./dailyLog`, `./profile`, `./utils` — nine `export *` lines re-exporting the full surface of nine internal modules. Consumers like `dashboard/page.tsx:5-11` pull 5 functions through one statement, and `useProgress.ts:20` pulls a single `updateDailyLog` through the same barrel. With `export *`, tree-shaking depends on the bundler recognizing side-effect-free modules; any module-level side effects (and `dailyLog.ts`/`progress.ts`/etc. each call `logQueryError`) propagate the namespace.
- **Suggested remedy:** Replace `export *` with explicit named exports keyed to the actual public API of the dashboard module (e.g., `export { getUserProgressSummary, getUserLearningPaths, getRecentActivity, getUserAchievements, getRecommendedNextLesson, getQuizPerformanceByCategory, getCompletedLessonsPaginated, getDailyLogForRange, updateDailyLog, getUserProfile } from ...`). Consumers stay one-line, the public surface is documented, and the bundler can prune more aggressively.

### DT-003: Client hook reaches into server data-access barrel

- **Category:** layer-violation
- **Severity:** P1
- **Files:** src/hooks/useProgress.ts:20 → src/lib/dashboard/index.ts → src/lib/dashboard/dailyLog.ts
- **Description:** `src/hooks/useProgress.ts:1` declares `"use client"`. On line 20 it imports `updateDailyLog` from `@/lib/dashboard` (the barrel from DT-002). The same `@/lib/dashboard` barrel is consumed by server components `src/app/[locale]/dashboard/page.tsx:5-11`, `progress/page.tsx:5-11`, `achievements/page.tsx:4`, `settings/page.tsx:4` — all of which pair the import with `createClient()` from `@/lib/supabase/server` and `requireAuth()` from `@/lib/auth/requireAuth`. The barrel mixes server-only data-access code (calling Supabase from a server client) with `dailyLog.ts`'s CRUD function. `dailyLog.ts` itself has no `"use server"` directive, so the import is not technically illegal, but the layer expectation is broken: a client hook pulls a function from the same namespace that wraps a server-only Supabase client.
- **Suggested remedy:** Hoist `updateDailyLog` (and any other client-reachable dashboard mutation) to a dedicated client-safe module (e.g., `src/lib/dashboard/client.ts`) that takes a `SupabaseClient` and is documented as client-callable. Server pages keep importing the rest via `@/lib/dashboard`. Alternatively, gate the entire dashboard barrel behind server components and have `useProgress` invoke the mutation through an API route or server action.

### DT-004: `src/lib/content.ts` mixes async server-loaders with pure client utilities

- **Category:** layer-violation
- **Severity:** P2
- **Files:** src/lib/content.ts:12-160 — Part 1 (lines 12-65): `getAllLessons`, `getLessonById`, `getCategories`, `getQuizByLessonId`, `getQuizById`, `getAllLearningPaths`, `getLearningPathById`, `getLessonsForPath`; Part 2 (lines 85-160): `getLessonsByPath`, `getPathProgress`, `getStartedPathCount`, `getCompletedPathCount`
- **Description:** The codemap describes `content.ts` as a "content access facade," but the file actually does two jobs. Part 1 is async server-loaders that delegate to per-locale bundles (`lessonBundles[locale]`). Part 2 is pure synchronous client-utility functions (`getLessonsByPath`, `getPathProgress`, etc.) that operate on already-loaded data. Both server components (`src/app/[locale]/page.tsx:3-4` → `getAllLessons`/`getAllLearningPaths`) and client components (`src/app/[locale]/HomeClient.tsx` → `getPathProgress`; `src/components/learn/LearningPathCard.tsx:10` → `getLessonsByPath`; `src/app/[locale]/learning-paths/LearningPathsClient.tsx` → both) import from this single module. Server and client layers share one namespace and one file.
- **Suggested remedy:** Split into `src/lib/content/server.ts` (async loaders) and `src/lib/content/utils.ts` (pure functions). Update consumers. The current `from "@/lib/content"` becomes `from "@/lib/content/utils"` or `from "@/lib/content/server"` as appropriate, making the layer of each import explicit at the call site.

### DT-005: `src/lib/paths/mdxParser.ts` reaches into `src/lib/lessons/mdxParser.ts`

- **Category:** reach-around
- **Severity:** P2
- **Files:** src/lib/paths/mdxParser.ts:1 → src/lib/lessons/mdxParser.ts
- **Description:** `src/lib/paths/mdxParser.ts:1` imports `parseSections` from `@/lib/lessons/mdxParser`. The `paths/` and `lessons/` directories are sibling content-parser subpackages (each has its own `load*.ts` + `mdxParser.ts` + tests). One sibling reaches into the other's internals for a shared MDX parsing primitive. This couples the paths parser to the lessons parser's private API: any refactor of `lessons/mdxParser.ts` risks breaking the paths parser, and the dependency is invisible from `lessons/`'s codemap.
- **Suggested remedy:** Hoist `parseSections` (and `normalizeLineEndings` is already shared the same way) to a neutral `src/lib/mdx/` package, or to `src/lib/lessons/` exported as a public utility. Both `lessons/mdxParser.ts` and `paths/mdxParser.ts` then import from the neutral location, making the shared dependency explicit and symmetric.

### DT-006: `dashboard/progress/progress-client.tsx` duplicates `dashboard/types.ts`

- **Category:** reach-around
- **Severity:** P3
- **Files:** src/app/[locale]/dashboard/progress/progress-client.tsx:13-22 → src/app/[locale]/dashboard/types.ts:3-12
- **Description:** The dashboard feature defines a shared `Summary` type at `src/app/[locale]/dashboard/types.ts:3-12`, imported by sibling components `DashboardHeader.tsx:13`, `DashboardStats.tsx:5`, `RecentActivity.tsx:6` (and others) via `from "../types"`. But `dashboard/progress/progress-client.tsx` (in a sibling directory) does NOT import from `../types`. Instead it redefines its own `Summary` (line 13), `QuizPerfItem` (line 24), `CompletedLesson` (line 32), `CategoryProgress` (line 41), `PaginatedResult` — duplicating types that already exist in the dashboard namespace. The progress subroute has silently diverged from the dashboard's type contract.
- **Suggested remedy:** Replace the locally-defined types in `progress-client.tsx:13-22` (and the duplicated `QuizPerfItem`, `CompletedLesson`, `CategoryProgress`, `PaginatedResult`) with `import type { ... } from "../types"` (extending `dashboard/types.ts` with the progress-specific shapes if needed). One source of truth per feature namespace.

### DT-007: `Reveal.tsx` mixes React component with animation constants imported by non-Reveal consumers

- **Category:** barrel-abuse
- **Severity:** P3
- **Files:** src/components/ui/Reveal.tsx:16-22 → consumed by src/components/AccessibilityControls.tsx:11, src/components/Header.tsx:33, src/components/OnboardingDialog.tsx:10, src/components/SearchDialog.tsx:14, src/components/ui/Modal.tsx:8, plus 26 more
- **Description:** `src/components/ui/Reveal.tsx` exports three things: `default Reveal` (a "use client" motion/react component), `revealEase` (an easing-curve array constant), and `modalVariants` (an animation-variants object). 31 consumers import directly from `@/components/ui/Reveal`. Several — `AccessibilityControls.tsx:11`, `Header.tsx:33`, `OnboardingDialog.tsx:10`, `SearchDialog.tsx:14`, `Modal.tsx:8` — want only `revealEase` and `modalVariants`, not the React component. Importing the constants drags in `motion/react` and the "use client" boundary even for callers that never render `<Reveal>`.
- **Suggested remedy:** Split `Reveal.tsx` into `Reveal.tsx` (the component, importing constants from a sibling) and `animation.ts` (exporting `revealEase` and `modalVariants`). Constant-only consumers import `@/components/ui/animation`; component consumers import `@/components/ui/Reveal`. Pure constants can be tree-shaken independently of the motion/react boundary.

### DT-008: `src/lib/supabase/middleware.ts` reaches across to `src/lib/auth/sanitizeRedirect`

- **Category:** reach-around
- **Severity:** P3
- **Files:** src/lib/supabase/middleware.ts:3 → src/lib/auth/sanitizeRedirect.ts
- **Description:** `src/lib/supabase/middleware.ts:3` imports `sanitizeRedirectPath` from `@/lib/auth/sanitizeRedirect`. The Supabase subpackage reaches across to the Auth subpackage for a pure function. `sanitizeRedirect.ts` itself has no auth-specific dependencies — it's a string validator for redirect paths (rejects protocol-relative URLs, backslashes, CRLF). The current edge `supabase/ → auth/` exists only because the utility happens to live under `auth/`. This conflates two concerns: redirect sanitization (a security utility) and auth (an authentication/authorization domain).
- **Suggested remedy:** Move `sanitizeRedirectPath` to a neutral location such as `src/lib/redirect/sanitize.ts` or `src/lib/sanitizeRedirect.ts`. Update the three consumers (`supabase/middleware.ts:3`, `auth/requireAuth.ts` not affected, `auth/login/LoginForm.tsx`, `auth/callback/route.ts`). The `supabase/ → auth/` dependency edge disappears, and the security utility is no longer hidden in an auth-specific subpackage.

### DT-009: `LessonRelatedClient` reaches across to `@/lib/localizedContent` for `getLessons`

- **Category:** reach-around
- **Severity:** P3
- **Files:** src/components/lesson/LessonRelatedClient.tsx:6 → src/lib/localizedContent.ts:14
- **Description:** `src/components/lesson/LessonRelatedClient.tsx` is a "use client" component in `src/components/lesson/`. On line 6 it imports `getLessons` from `@/lib/localizedContent`. `localizedContent.ts` is itself a thin facade re-exporting from `@/lib/lessons/loadLessons`, `@/lib/paths/loadPaths`, `@/lib/glossary/loadGlossary`, `@/lib/articles/loadArticles` — all of which read pre-bundled locale-specific arrays. The component reaches across the lesson-component feature boundary to pull data from a server-flavored content facade. The data is pure (no server runtime), but the architectural contract — that client components receive content via props from server components — is bypassed.
- **Suggested remedy:** Pass `getLessons`-derived data into `LessonRelatedClient` from its server-component parent (the parent already imports `getLessonById` from `@/lib/localizedContent` per the lessons codemap). Remove the `@/lib/localizedContent` import from the client component. If data dependencies grow, encapsulate via a hook such as `useRelatedLessons()` that consumes a prop, not the facade.

### DT-010: `src/components/ui/index.ts` re-exported types are unused

- **Category:** barrel-abuse
- **Severity:** P3
- **Files:** src/components/ui/index.ts:14-22 → (no consumers via barrel)
- **Description:** Lines 14-22 of the UI barrel re-export 13 type groups (`AlertProps`, `BadgeProps, BadgeVariant, BadgeSize`, `ButtonProps`, etc.). Combined with DT-001's finding that the barrel has zero importers, these type re-exports are also dead. They exist in the barrel but no file imports them via `@/components/ui`. Consumers either import types directly from the component file (`import { type ButtonProps } from "@/components/ui/Button"`) or via the component itself.
- **Suggested remedy:** Resolve alongside DT-001. If the barrel is removed, the type re-exports vanish with it. If the barrel is kept and standardized on, ensure consumers import types via the barrel rather than the deep path.

## Summary

- Total findings: 10
- P0: 0 | P1: 1 | P2: 4 | P3: 5
- Cycles found: 0 (madge processed 354 files; no circular dependency found)
- Layer violations: 2 (DT-003, DT-004)

Notes on categories with no findings:

- No circular dependency findings. `npx madge --circular --extensions ts,tsx src` exited clean after processing 354 files with one warning unrelated to cycles. Manual trace of the longest dependency chains (`@/lib/supabase/middleware` → `@/lib/auth/sanitizeRedirect`, `@/lib/paths/mdxParser` → `@/lib/lessons/mdxParser`, `useProgress` → `@/lib/dashboard` → `dashboard/dailyLog`) confirmed no cycles in either direction.
