# File-Anatomy Recon

## Method

Ran `find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -30` to enumerate files over 200 lines. Read root `codemap.md` and every `src/**/codemap.md` (40+ files) to map declared responsibilities. Read in full the top offenders: `src/app/[locale]/HomeClient.tsx`, `src/app/[locale]/dashboard/learn/[slug]/LessonPageClient.tsx`, `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx`, `src/app/[locale]/contact/ContactClient.tsx`, `src/app/[locale]/tools/visit-planner/VisitPlannerClient.tsx`, `src/app/[locale]/auth/signup/SignupForm.tsx`, `src/components/Header.tsx`, `src/components/SearchDialog.tsx`, `src/components/mdx/MarkdownRenderer.tsx`, `src/hooks/useProgress.ts`, `src/lib/supabase/mockClient.ts`, `src/app/[locale]/dashboard/progress/progress-client.tsx`, `src/app/[locale]/dashboard/settings/settings-client.tsx`, `src/app/[locale]/dashboard/DashboardClient.tsx`. Used `find` + `awk -F/` to compute directory depth per file. Used `grep` to confirm import graphs and naming-convention splits. Cross-referenced declared responsibility (codemap) vs. actual contents (Read).

## Findings

### FA-001: LessonPageClient is a god component — 4 responsibilities in 377 lines

- **Category:** god-component
- **Severity:** P1
- **Files:** src/app/[locale]/learn/[slug]/LessonPageClient.tsx (377)
- **Description:** Mixes (1) reading-scroll-progress state via scroll listener + window effect (`lines 89-100`), (2) sidebar-content selection logic in `useSidebarContent` (`lines 33-61`) with category-based branching, (3) prev/next lesson lookup in learning path via `getLessons(locale)` (lines `112-124`), and (4) full rendering of breadcrumbs, hero, sections (`.map` over `lesson.content.sections`), sidebar tips, related-lessons, etc. Imports `useAppState`, `useProgress`, `useTranslations` simultaneously. No sub-component extraction for the rendered sections.
- **Suggested remedy:** Extract `useReadingScrollProgress(contentRef)` hook (already exists for scroll progress). Extract `useSidebarContent` to its own file under `src/lib/lessons/sidebarContent.ts` (it depends only on `lesson` + `t`). Extract `LessonBreadcrumbs`, `LessonSidebar`, `LessonSectionNav` sub-components into `src/components/lesson/`. Keep `LessonPageClient` as composition root (<100 lines).

### FA-002: QuizClient is a god component — 5 responsibilities in 382 lines

- **Category:** god-component
- **Severity:** P1
- **Files:** src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx (382)
- **Description:** Mixes (1) quiz state-machine (`useState<QuizState>` line 88), (2) answer-selection + scoring logic (`useMemo` for `correctCount` line 99, `LETTER_TO_IDX`/`IDX_TO_LETTER` lookups lines 80-81), (3) confetti animation rendering (`function Confetti` lines 27-78 — inline sub-component for animation), (4) `beforeunload` exit-warning effect (`useEffect` line 158) + `saveQuizAttempt` effect (`useEffect` line 167), and (5) rendering of start/active/completed states with three return paths. Has duplicated `LETTER_TO_IDX` constant with `QuizResults.tsx`.
- **Suggested remedy:** Move `Confetti` to `src/components/ui/Confetti.tsx`. Extract `useQuizProgress(quiz, lessonId)` hook returning state machine + scoring. Extract `QuizStartScreen`, `QuizActiveScreen` sub-components. Share `LETTER_TO_IDX`/`IDX_TO_LETTER` via `src/lib/quizzes/quizLetters.ts`. Trim `QuizClient` to <120 lines.

### FA-003: ContactClient is a god component — 4 responsibilities in 254 lines

- **Category:** god-component
- **Severity:** P1
- **Files:** src/app/[locale]/contact/ContactClient.tsx (254)
- **Description:** Mixes (1) form state (8 `useState` lines 21-28), (2) field-change + validation logic (`validate()` lines 50-58, four `handle*Change` functions lines 30-48), (3) fetch submission with rate-limit (429) and unavailability (503) error handling (`handleSubmit` lines 60-100), and (4) rendering of submitted state + form fields + support notes. No `useForm` extraction; validation rules inline.
- **Suggested remedy:** Extract `useContactForm()` hook in `src/app/[locale]/contact/useContactForm.ts` returning `{ fields, errors, submitting, submitted, handlers, submit }`. Move validation to `src/lib/contact/validation.ts` (schema-style). Keep `ContactClient` as pure composition + JSX.

### FA-004: SignupForm is a god component — 4 responsibilities in 222 lines

- **Category:** god-component
- **Severity:** P1
- **Files:** src/app/[locale]/auth/signup/SignupForm.tsx (222)
- **Description:** Mixes (1) form state (6 `useState` lines 30-37), (2) inline `getPasswordStrength(password)` business logic (lines 11-24) with hardcoded thresholds (6/10/14), (3) Supabase `auth.signUp` call + error message mapping (`handleSubmit` lines 65-103), and (4) rendering of password-strength bar, success screen, error alert. Password-strength function not unit-testable. Compare to `ForgotPasswordForm.tsx` and `LoginForm.tsx` — same shape but login uses different name (see FA-018).
- **Suggested remedy:** Move `getPasswordStrength` to `src/lib/auth/passwordStrength.ts` with explicit `PASSWORD_THRESHOLDS` config. Extract `useSignupForm()` hook in `src/app/[locale]/auth/signup/useSignupForm.ts`. Same pattern for `LoginForm`, `ForgotPasswordForm`, `ResetPasswordClient` for consistency.

### FA-005: Header is a god component — 5 responsibilities in 348 lines

- **Category:** god-component
- **Severity:** P1
- **Files:** src/components/Header.tsx (348)
- **Description:** Mixes (1) nav-items construction (`getNavItems` lines 47-58 — pure helper, ok), (2) mobile menu state + focus trap (`useFocusTrap`, `useDismissibleOverlay`, `mobileMenuContent` JSX inline lines 95-163), (3) auth-aware user-area rendering (loading / user / guest — three branches lines 210-254), (4) sign-out handler (`handleSignOut` lines 89-91) with `useAuth`, and (5) full rendering of skip-link, header chrome, desktop nav, mobile trigger, mobile menu, search/language/theme/accessibility cluster. The `mobileMenuContent` JSX is inline in component body (68 lines).
- **Suggested remedy:** Extract `MobileMenuContent` to `src/components/layout/MobileMenu.tsx`. Extract `UserArea` to `src/components/layout/UserArea.tsx` (encapsulates loading/user/guest branches + sign-out). Extract `HeaderControls` (search/language/theme/accessibility cluster) to `src/components/layout/HeaderControls.tsx`. Goal: `Header.tsx` <120 lines.

### FA-006: SearchDialog is a god component — 5 responsibilities in 323 lines

- **Category:** god-component
- **Severity:** P1
- **Files:** src/components/SearchDialog.tsx (323)
- **Description:** Mixes (1) shortcut-key listener (`useEffect` for `Cmd+K` line 242), (2) search index dynamic loading via `import("@/data/searchIndex.${locale}.ts")` (line 204 — note locale interpolation in import path is brittle), (3) `useFocusTrap` + `useDismissibleOverlay` for dialog behavior, (4) results filtering + `highlightMatches` invocation (`useMemo` for `results` line 227), and (5) rendering of trigger button + dialog content + backdrop + results list. Inline sub-components `SearchTrigger`, `SearchDialogContent` defined in same file.
- **Suggested remedy:** Move `SearchTrigger` and `SearchDialogContent` to `src/components/search/SearchTrigger.tsx` and `SearchDialogContent.tsx`. Extract `useSearchDialog()` hook in `src/hooks/useSearchDialog.ts` for shortcut + open state + dynamic import. Replace locale-interpolated import with `await import("@/data/searchIndex") + mod[locale]` pattern.

### FA-007: progress-client.tsx is a god component — 4 responsibilities in 487 lines

- **Category:** god-component
- **Severity:** P0
- **Files:** src/app/[locale]/dashboard/progress/progress-client.tsx (487)
- **Description:** Largest non-generated, non-test component in repo. Mixes (1) inline type definitions (`Summary`, `QuizPerfItem`, `CompletedLesson`, `PaginatedResult`, `CategoryProgress`, `ProgressClientProps` — types defined INSIDE the component file at lines 13-64 instead of `src/types/` or `../types.ts`), (2) inline `MetricCard` sub-component definition (lines 70-93 — defined in same file as page client), (3) inline `clampPercent` helper (line 66), and (4) full rendering of 6 sections (progress overview circle SVG line 152-187, metric cards, category progress, streak calendar SVG, quiz performance, completed lessons with pagination). All sections inline in one return.
- **Suggested remedy:** Move all types to `src/app/[locale]/dashboard/types.ts` (which already exists for `DashboardClient.tsx`). Extract `MetricCard` to `src/components/ui/MetricCard.tsx`. Extract `ProgressCircle`, `StreakCalendar`, `CategoryProgressList`, `CompletedLessonsList` sub-components. Keep `progress-client.tsx` as composition (<150 lines).

### FA-008: settings-client.tsx is a god component — 4 responsibilities in 299 lines

- **Category:** god-component
- **Severity:** P1
- **Files:** src/app/[locale]/dashboard/settings/settings-client.tsx (299)
- **Description:** Mixes (1) form state (7 `useState` lines 44-49), (2) three Supabase calls with different concerns (`profile.update` for displayName line 53, `auth.resetPasswordForEmail` line 64, `rpc("delete_user")` line 79) all in one client file, (3) theme + locale preference handlers (`useAppState().theme/setTheme`, locale toggle line 215), and (4) rendering of profile card, account section, preferences section (theme + language), privacy section, AND a delete-account modal inline (lines 252-296). The modal JSX is inline in the component return.
- **Suggested remedy:** Extract `useSettingsForm()` hook in `src/app/[locale]/dashboard/settings/useSettingsForm.ts` for profile save + password reset + delete account. Extract `DeleteAccountModal` to `src/app/[locale]/dashboard/settings/DeleteAccountModal.tsx`. Extract `PreferencesSection` (theme + language) and `PrivacySection` to sub-components. Goal: <120 lines.

### FA-009: MarkdownRenderer is a god file — 5 token-walker responsibilities in 386 lines

- **Category:** god-file
- **Severity:** P2
- **Files:** src/components/mdx/MarkdownRenderer.tsx (386)
- **Description:** Single-purpose (markdown -> React) but the renderer contains `isSafeHref` URL sanitizer (lines 21-38, ~18 lines, security-critical), `renderInlineChildren` (lines 52-156, ~104 lines, recursive), `renderTokens` (lines 158-312, ~154 lines, recursive with embedded `renderTable`), and `renderTable` (lines 314-376, ~62 lines). The recursive renderers handle paragraph, bullet list, ordered list, heading, link, blockquote, fence, table tokens — 9 token types in one function.
- **Suggested remedy:** Move `isSafeHref` to `src/lib/markdown/safeHref.ts` with explicit unit tests for control-char smuggling. Split token-type renderers into a registry: `src/components/mdx/renderers/{paragraph,list,heading,link,blockquote,table,fence}.tsx`. Keep `MarkdownRenderer.tsx` as dispatcher (<80 lines).

### FA-010: useProgress hook is a god hook — 5 responsibilities in 380 lines

- **Category:** god-file
- **Severity:** P2
- **Files:** src/hooks/useProgress.ts (380)
- **Description:** Hook file contains 5 sub-hooks (`useGuestMigration`, `useSupabaseProgress`, `useDerivedProgress`, `useProgressMutations`, `useProgressQueries`) + main `useProgress` aggregator (lines 324-380). The `useProgressMutations` hook alone (lines 148-289) contains both `markLessonComplete` (with optimistic update, upsert, daily log, achievement check, streak update, AND close-to-completion notification logic) and `saveQuizAttempt` (similar pattern). `useProgressMutations` body is 140 lines with multiple `await` chains and dynamic `import("@/lib/paths/loadPaths")` at module scope (line 46).
- **Suggested remedy:** Keep the sub-hook split — it is good. Move `useProgressMutations` body into smaller functions in `src/lib/progress/mutations.ts` (pure async functions taking `supabase`, `user`, payload). The hook then composes them. Remove the module-scope `loadPathsPromise` cache (line 46) — use a per-call dynamic import or a dedicated loader.

### FA-011: mockClient.ts is a god file — 1 responsibility but 1326 lines

- **Category:** god-file
- **Severity:** P2
- **Files:** src/lib/supabase/mockClient.ts (1326)
- **Description:** Single responsibility (mock Supabase client for dev/tests) but extremely large. Contains 48 helper functions, full query-builder mock (`QueryFilter`, `QueryOrder`, `QueryRange`, `QueryMutation` types), table-row normalizers for 7 tables, auth/session mock, cookie-store mock, and the public `getMockSupabaseClient` factory (line 1308). One file handles auth, db, cookies, error simulation.
- **Suggested remedy:** Split into `src/lib/supabase/mock/{auth.ts,db.ts,queryBuilder.ts,cookies.ts,normalize.ts,index.ts}`. Keep public API stable via `mockClient.ts` re-exporting `getMockSupabaseClient`. Goal: no single file >400 lines.

### FA-012: Types defined inside component files instead of src/types/

- **Category:** wrong-location
- **Severity:** P2
- **Files:** src/app/[locale]/dashboard/types.ts (58), src/app/[locale]/dashboard/progress/progress-client.tsx (487), src/app/[locale]/tools/visit-planner/types.ts (13)
- **Description:** `src/types/` is the declared home for TypeScript types (see `src/types/codemap.md` line 7: "TypeScript type definitions for all domain entities and database schema"). However, dashboard and visit-planner define types in colocated `types.ts` files. `progress-client.tsx` (lines 13-64) defines 6 types inline (`Summary`, `QuizPerfItem`, `CompletedLesson`, `PaginatedResult`, `CategoryProgress`, `ProgressClientProps`). `src/app/[locale]/dashboard/types.ts` exports `Summary`, `LearningPathEntry`, `ActivityItem`, `AchievementItem`, `RecommendedLesson`, `DashboardClientProps` — duplicates parts of `src/types/` and `src/lib/dashboard/`.
- **Suggested remedy:** Consolidate dashboard types into `src/types/dashboard.ts` or `src/app/[locale]/dashboard/types.ts` consistently — pick one location. Move inline types in `progress-client.tsx` to `src/app/[locale]/dashboard/types.ts` (or its successor). For visit-planner types, colocate is fine since they are tool-specific, but document the pattern in `src/types/codemap.md`.

### FA-013: src/test-utils.tsx at root of src/ — odd placement

- **Category:** wrong-location
- **Severity:** P3
- **Files:** src/test-utils.tsx (188)
- **Description:** Single file at `src/test-utils.tsx` (root of `src/`). Contains a `messages` mock (50 lines of i18n strings) and `renderWithIntl(ui, options)` helper. Not a hook, not a type, not a component tree. Lives alongside `src/middleware.ts`, `src/app/`, `src/lib/`, `src/hooks/`, etc. Not referenced in any `codemap.md`.
- **Suggested remedy:** Move to `src/test/utils.tsx` (or `src/test-utils/index.tsx`) to make it a first-class directory. Add an entry to root `codemap.md` and `src/codemap.md`. Alternatively, colocate per-package: `src/components/ui/test-utils.tsx` if only used for UI tests.

### FA-014: Test directory layout inconsistent — **tests**/ vs colocated .test.ts

- **Category:** wrong-location
- **Severity:** P3
- **Files:** src/lib/dashboard/**tests**/ (7 test files), all other tests colocated
- **Description:** Only `src/lib/dashboard/` uses an `__tests__/` subdirectory containing `achievements.test.ts`, `activity.test.ts`, `dailyLog.test.ts`, `learningPaths.test.ts`, `progress.test.ts`, `quizzes.test.ts`, `recommendations.test.ts`. All other tests in the repo are colocated `.test.ts`/`.test.tsx` next to the source file (e.g. `src/lib/achievements.test.ts`, `src/lib/streaks.test.ts`, `src/components/quiz/QuizQuestion.test.tsx`). Two conventions in one repo.
- **Suggested remedy:** Pick one convention. If colocated (Jest/Vitest default), move `src/lib/dashboard/__tests__/*.test.ts` to `src/lib/dashboard/*.test.ts`. If `__tests__/`, migrate the other tests. Codemap should document the choice.

### FA-015: Deep nesting — src/app/[locale]/learn/[slug]/quiz/ (4 levels deep)

- **Category:** deep-nesting
- **Severity:** P3
- **Files:** src/app/[locale]/learn/[slug]/quiz/page.tsx, src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx, src/app/[locale]/learn/[slug]/quiz/QuizClientWrapper.tsx, src/app/[locale]/learn/[slug]/quiz/loading.tsx
- **Description:** Files in `src/app/[locale]/learn/[slug]/quiz/` are 4 directory levels deep from `src/` (src/app/[locale]/learn/[slug]/quiz/). Path is 6 segments including the filename. Other deep paths: `src/app/[locale]/articles/[slug]/`, `src/app/[locale]/learning-paths/[pathId]/`, `src/app/[locale]/dashboard/achievements/`, `src/app/[locale]/dashboard/progress/`, `src/app/[locale]/dashboard/settings/`. The `[locale]/[slug]/quiz/` combo is the deepest, driven by App Router's dynamic-segment requirement.
- **Suggested remedy:** Acceptable for App Router — depth is a side-effect of nested dynamic routes. If reducing, consider flattening `learn/[slug]/quiz` to a route group `(quiz)` or moving quiz to a tool page. Document the convention in `src/app/[locale]/codemap.md`.

### FA-016: Client-component file naming is inconsistent — *Client.tsx vs *-client.tsx

- **Category:** naming
- **Severity:** P1
- **Files:** PascalCase Client suffix: HomeClient.tsx, DashboardClient.tsx, LearnClient.tsx, ContactClient.tsx, AboutClient.tsx, AccessibilityClient.tsx, ArticlesClient.tsx, GlossaryClient.tsx, QuizClient.tsx, QuizClientWrapper.tsx, ResetPasswordClient.tsx, CareGuideClient.tsx, LessonPageClient.tsx, ArticlePageClient.tsx, ToolsClient.tsx, VisitPlannerClient.tsx, VisitChecklistClient.tsx, PrivacyClient.tsx, TermsClient.tsx, LearningPathsClient.tsx, LearningPathDetailClient.tsx, GlossaryTermClient.tsx
- vs kebab-case client suffix: progress-client.tsx (487), settings-client.tsx (299), achievements-client.tsx
- **Description:** Two conventions in same app. The vast majority (21+ files) use PascalCase `*Client.tsx`. Three files use kebab-case `*-client.tsx`. No consistent rule — the kebab-case ones are all under `dashboard/` subroutes (achievements, progress, settings). Eslint/PRs likely slipped through.
- **Suggested remedy:** Rename `progress-client.tsx` -> `ProgressClient.tsx`, `settings-client.tsx` -> `SettingsClient.tsx`, `achievements-client.tsx` -> `AchievementsClient.tsx`. Update imports in `dashboard/progress/page.tsx` (line 13: `import ProgressClient from "./progress-client"`), `dashboard/settings/page.tsx`, `dashboard/achievements/page.tsx`. Add eslint rule `react-typescript/filename-prefix` or similar to enforce PascalCase for component files.

### FA-017: Auth form file naming is inconsistent — *Form.tsx vs *Client.tsx

- **Category:** naming
- **Severity:** P2
- **Files:** LoginForm.tsx, SignupForm.tsx, ForgotPasswordForm.tsx vs ResetPasswordClient.tsx
- **Description:** Three auth forms use `*Form.tsx` suffix (LoginForm, SignupForm, ForgotPasswordForm). The fourth auth page (reset-password) uses `*Client.tsx` suffix (`ResetPasswordClient.tsx`). All four are functionally equivalent: client-side forms that call Supabase auth methods. The `Form` vs `Client` split is not semantically meaningful.
- **Suggested remedy:** Pick one. Either rename `ResetPasswordClient.tsx` -> `ResetPasswordForm.tsx` for consistency with login/signup/forgot, OR rename all to `*Client.tsx` for consistency with the wider app pattern. Add to AGENTS.md or component codemap.

### FA-018: Inline sub-components defined in same file as parent component

- **Category:** god-file
- **Severity:** P2
- **Files:** src/components/quiz/QuizResults.tsx (224, defines `QuizSummary`, `QuizOptionReview`, `QuizQuestionReview` inline), src/app/[locale]/dashboard/progress/progress-client.tsx (487, defines `MetricCard` inline lines 70-93), src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx (382, defines `Confetti` inline lines 27-78), src/components/SearchDialog.tsx (323, defines `SearchTrigger`, `SearchDialogContent` inline), src/app/[locale]/dashboard/DashboardClient.tsx (39, defines nothing inline — good), src/app/[locale]/HomeClient.tsx (369, defines nothing inline — good)
- **Description:** Multiple files define sub-components inline in the same file as the exported component. Some files (`DashboardClient.tsx`, `HomeClient.tsx`) explicitly extract sub-components to separate files (`dashboard/components/DashboardHeader.tsx` etc.). The pattern is inconsistent — sometimes inline sub-components are fine, sometimes the file becomes a god file.
- **Suggested remedy:** Establish rule: sub-component >50 lines OR used only by parent -> inline OK. Sub-component reused OR >50 lines -> extract to own file. Apply uniformly. Extract `Confetti` (52 lines, animation-only) to `src/components/ui/Confetti.tsx`. Extract `MetricCard` (24 lines, reusable) to `src/components/ui/MetricCard.tsx`.

### FA-019: Duplicated layout.tsx + loading.tsx + page.tsx convention — App Router standard, not duplication

- **Category:** duplicated-structure
- **Severity:** P3
- **Files:** 36+ `layout.tsx` + `loading.tsx` + `page.tsx` triplets across `src/app/[locale]/**`
- **Description:** Across every route directory, the same three files exist: `layout.tsx` (page chrome), `loading.tsx` (skeleton during SSG/streaming), `page.tsx` (route content). Some also have `error.tsx`, `not-found.tsx`. This is Next.js App Router convention, NOT duplication. Each `page.tsx` calls distinct dashboard/learn/library loaders. Each `loading.tsx` returns different skeleton variants. Codemap confirms: "Locale-aware pages — home, learn, articles...".
- **Suggested remedy:** No action needed. Document in `src/app/[locale]/codemap.md` that the layout/loading/page triplet is the standard route-shape and not a code-smell.

### FA-020: Duplicated quiz-letter lookup constants

- **Category:** god-file
- **Severity:** P3
- **Files:** src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx (lines 80-81: `LETTER_TO_IDX`, `IDX_TO_LETTER`), src/components/quiz/QuizResults.tsx (line 19: `LETTER_TO_IDX`)
- **Description:** Two files declare `LETTER_TO_IDX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }`. `QuizClient.tsx` also has `IDX_TO_LETTER = ["A", "B", "C", "D"]`. The constant is duplicated, and the inverse is recomputed in `QuizResults.tsx` via `q.correctAnswer ? LETTER_TO_IDX[q.correctAnswer] : (q.correctIndex ?? -1)`.
- **Suggested remedy:** Extract to `src/lib/quizzes/quizLetters.ts`: `export const LETTER_TO_IDX = {...} as const; export const IDX_TO_LETTER = [...] as const; export function getCorrectIndex(q: QuizQuestion): number {...}`. Import in both files.

### FA-021: GlossaryClient duplicates filter+search+group pattern from LearnClient

- **Category:** god-component
- **Severity:** P2
- **Files:** src/app/[locale]/glossary/GlossaryClient.tsx (239), src/app/[locale]/learn/LearnClient.tsx (233)
- **Description:** `GlossaryClient` (lines 40-83) and `LearnClient` (lines 48-83) both implement `useMemo` chains for `searchableTerms`/`filteredTerms`/`groupedTerms` with the same shape: lowercase query, filter by category/letter, group by bucket, render filtered grid with `Reveal` + `EmptyState` fallback. Same hook usage (`useState`, `useMemo`). Pattern not extracted into shared logic.
- **Suggested remedy:** Extract `useFilteredCollection<T>(items, { query, groupBy, filterFn })` hook in `src/hooks/useFilteredCollection.ts`. Both clients consume the hook; only render JSX differs.

## Summary

- Total findings: 21
- Files over 200 lines: ~22 (excluding generated data bundles and tests)
- God components: 8 (FA-001 through FA-008, excluding DashboardClient which is well-factored)
- Wrong location files: 3 (FA-012 types, FA-013 test-utils, FA-014 **tests**/)
- Deep nesting cases: 1 distinct case (FA-015 — all under src/app/[locale]/)
- P0: 1 (FA-007 progress-client.tsx — largest component with multiple responsibilities)
- P1: 7 (FA-001, FA-002, FA-003, FA-004, FA-005, FA-006, FA-008, FA-016)
- P2: 6 (FA-009, FA-010, FA-011, FA-012, FA-017, FA-018, FA-021)
- P3: 4 (FA-013, FA-014, FA-015, FA-019, FA-020)
