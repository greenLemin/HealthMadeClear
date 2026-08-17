# Convention-Drift Recon

## Method

- `find src -type d` for folder structure; `find src -name "*.ts" -o -name "*.tsx"` for file enumeration.
- `grep -rEn '^export default'` vs `^export (function|const|...|{)` to count default vs named exports per directory.
- `grep -L '"use client"'` over `src/components/*` and `src/app/[locale]/**/components/*` to find components missing the client directive.
- `grep -rEn 'catch \('` to enumerate catch blocks; manually inspected each to classify as `report*Error`/`logger.*`/silent/UI-only.
- `grep -rEn 'from ["'\'']@/'` vs `from ["'\'']\.\.?\//` to compare `@/` alias usage vs relative imports.
- `grep -rEn 'console\.(log|error|warn|info)'` excluding `logger.ts`/`errorReporting.ts` to find direct console usage bypassing the logger.
- `grep -rEn 'useTranslations'` per file to detect components that bypass i18n by hardcoding English strings.
- `find src -name "*.test.ts" -o -name "*.test.tsx"` vs `find src -type d -name "__tests__"` to compare test placement conventions.
- Cross-checked `error.tsx` / `loading.tsx` presence for every route with `page.tsx`.
- Cross-checked `role="progressbar"` + `.progress-fill` div usage against existing `<ProgressBar>` component.

## Inferred Dominant Conventions

- **Folder structure:** `src/{app,components,hooks,lib,types,data,messages,i18n}`. Route handlers under `src/app/[locale]/`. Shared UI primitives under `src/components/ui/`. Feature components co-located in `src/app/[locale]/<feature>/components/`. Lib subfolders per domain (`articles`, `auth`, `dashboard`, `glossary`, `lessons`, `paths`, `quizzes`, `search`, `supabase`).
- **File naming:** PascalCase for component files (`Header.tsx`, `DashboardClient.tsx`, `Step1ChooseVisitType.tsx`); kebab-case for Next.js route handlers (`page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`); camelCase for utilities (`logger.ts`, `errorReporting.ts`, `rateLimit.ts`). Client component files use `<Name>Client.tsx` PascalCase (e.g., `DashboardClient.tsx`, `ContactClient.tsx`, `VisitPlannerClient.tsx`).
- **Export style:** Named exports for utilities, hooks, types, and constants. `export default` for page/layout/loading/error routes (Next.js convention) and for React components imported by name elsewhere (e.g., `export default function Hero` imported as `import Hero from "@/components/Hero"`).
- **Error handling:** Two structured reporters exist: `reportClientError` (`src/lib/errorReporting.ts`) for client components, and `reportServerError` for API routes/server functions. A `logger` (`src/lib/logger.ts`) wraps `console.*` behind dev-only gates. Catch blocks should call `report*Error` and/or `logger.*` — never raw `console.*` and never silently swallow without at least a `logger.*` call.
- **Composition:** Every component using React hooks (`useState`, `useEffect`, `useTranslations`, `useRouter`, `usePathname`, etc.) is marked `"use client"` at the top of the file. Components in feature folders are imported by a parent client component (which provides the boundary), but the codebase consistently still adds `"use client"` to the leaf components.
- **Test placement:** Colocated `*.test.ts(x)` files next to the implementation. No `.spec.ts(x)` files exist. Tests use Vitest with `@testing-library/react` and `NextIntlClientProvider`.
- **Import conventions:** `@/*` path alias (defined in `tsconfig.json`) is dominant — ~650 `@/` imports vs ~13 `../` and ~99 `./` relative imports across non-test files. Most `../` relative imports are within feature folders importing from a colocated `types.ts` or re-exporting `error.tsx`.

## Findings

### CD-001: Dashboard subroutes use kebab-case client component filenames

- **Category:** naming
- **Severity:** P2
- **Files:**
  - `src/app/[locale]/dashboard/settings/settings-client.tsx:29` (`export default function SettingsClient`)
  - `src/app/[locale]/dashboard/progress/progress-client.tsx:95` (`export default function ProgressClient`)
  - `src/app/[locale]/dashboard/achievements/achievements-client.tsx:48` (`export default function AchievementsClient`)
- **Description:** Three dashboard subroutes name their client component files in kebab-case (`settings-client.tsx`, `progress-client.tsx`, `achievements-client.tsx`), then export a PascalCase component (`SettingsClient`, `ProgressClient`, `AchievementsClient`). Every other client component file in the codebase uses PascalCase directly — `DashboardClient.tsx`, `HomeClient.tsx`, `ContactClient.tsx`, `LearnClient.tsx`, `LessonPageClient.tsx`, `QuizClient.tsx`, `VisitPlannerClient.tsx`, `CareGuideClient.tsx`, `VisitChecklistClient.tsx`, `ToolsClient.tsx`, `PrivacyClient.tsx`, `ResetPasswordClient.tsx`, `ArticlesClient.tsx`, `ArticlePageClient.tsx`, `TermsClient.tsx`, `AboutClient.tsx`, `GlossaryClient.tsx`, `GlossaryTermClient.tsx`, `AccessibilityClient.tsx`. Importers within the dashboard feature (`dashboard/page.tsx`, `dashboard/achievements/page.tsx`, `dashboard/progress/page.tsx`, `dashboard/settings/page.tsx`) import these via `import <Name>Client from "./<name>-client"` — a clear mismatch.
- **Suggested remedy:** Rename the three files to `SettingsClient.tsx`, `ProgressClient.tsx`, `AchievementsClient.tsx` and update the import paths in their corresponding `page.tsx` files. Apply ESLint rule `@next/next/no-page-custom-prop` or a custom filename rule to enforce.

### CD-002: Feature folders colocate `types.ts` alongside centralized `src/types/`

- **Category:** folder-structure
- **Severity:** P3
- **Files:**
  - `src/app/[locale]/dashboard/types.ts` (defines `Summary`, `LearningPathEntry`, `ActivityItem`, `RecommendedLesson`, `DashboardClientProps`, `AchievementItem`, `AchievementsProgressProps`, `CopyProps`)
  - `src/app/[locale]/tools/visit-planner/types.ts` (defines `VISIT_TYPE_KEYS`, `VisitTypeKey`, `StepValue`, `CustomQuestion`, `PlannerState`)
  - `src/types/` (centralized `article.ts`, `content.ts`, `database.ts`, `glossary.ts`, `learningPath.ts`, `lesson.ts`, `quiz.ts`)
- **Description:** Two feature folders ship their own `types.ts` for types that are only consumed within the feature (`PlannerState`, `StepValue`, `Summary`, etc.), while the codebase also maintains a centralized `src/types/` directory for shared cross-domain types. This produces two coexisting patterns: feature-local types (`from "../types"`) and centralized types (`from "@/types/..."`). The dashboard `types.ts` further defines `AchievementItem` (also exported by `src/components/dashboard/AchievementCard.tsx`) and `Summary` (a domain-level aggregate) — neither of which is reused outside the dashboard feature, so the colocated placement is defensible, but the divergence from `src/types/` is undocumented.
- **Suggested remedy:** Pick one rule and codify it. Either (a) "feature-only types live in feature `types.ts`, shared types live in `src/types/`" (current state — document in `codemap.md`), or (b) consolidate to `src/types/` only. Add a quick check to `codemap.md` under each feature folder.

### CD-003: `Callout` hardcodes English type labels instead of using `useTranslations`

- **Category:** i18n-convention
- **Severity:** P1
- **Files:** `src/components/Callout.tsx:14-17` (`defaultTypeLabels`), `:35` (`label = typeLabel ?? defaultTypeLabels[type]`)
- **Description:** `Callout.tsx` does not import or call `useTranslations`. The `defaultTypeLabels` map hardcodes English (`info: "Note"`, `success: "Tip"`, `warning: "Warning"`) and is used as the fallback when `typeLabel` is not provided. Every other user-facing component in `src/components/*` that renders text — `Hero.tsx`, `SearchDialog.tsx`, `SectionNav.tsx`, `LanguageToggle.tsx`, `MedicalDisclaimer.tsx`, `ScrollToTop.tsx`, `OnboardingDialog.tsx`, `Header.tsx`, `Footer.tsx`, `PageHeader.tsx`, `AccessibilityControls.tsx`, `AnalyticsPageViewTracker.tsx` (via `JsonLd`/`PageSection` companions) — calls `useTranslations` for any non-decorative string. Spanish users will see English `"Note"`/`"Tip"`/`"Warning"` labels.
- **Suggested remedy:** Add `useTranslations` call (suggested namespace: `"callout"`), define `note`/`tip`/`warning` keys in `src/messages/en.json` and `src/messages/es.json`, and replace `defaultTypeLabels` with a `t()` lookup. Keep `typeLabel` prop as an override.

### CD-004: `KeyTakeaway` hardcodes English default title

- **Category:** i18n-convention
- **Severity:** P1
- **Files:** `src/components/ui/KeyTakeaway.tsx:10` (`export default function KeyTakeaway({ children, title = "Key Takeaway", className = "" }: KeyTakeawayProps)`)
- **Description:** The default value of the `title` prop is the literal English string `"Key Takeaway"`. The component does not import or call `useTranslations`. The `keyTakeaways` translation key exists in `src/messages/en.json` ("Key Takeaways") but is not surfaced to this component. Spanish users will see `"Key Takeaway"` as the section header.
- **Suggested remedy:** Either resolve the default title via `useTranslations("common").t("keyTakeaway")` (add the `keyTakeaway` translation key if missing), or require consumers to pass `title` and remove the English default.

### CD-005: `dashboard/utils.ts` calls `console.error` directly instead of using `logger` or `reportServerError`

- **Category:** error-handling
- **Severity:** P1
- **Files:** `src/lib/dashboard/utils.ts:5` (`console.error(\`Query error in ${context}:\`, error);`)
- **Description:** The codebase ships a `logger` module (`src/lib/logger.ts`) that gates `console.*` calls behind `process.env.NODE_ENV === "development"`, and structured reporters (`reportClientError`/`reportServerError` in `src/lib/errorReporting.ts`) that scrub PII and forward to Sentry in production. `src/lib/dashboard/utils.ts:5` bypasses both, calling `console.error` directly. Other lib modules consistently use the wrappers: `src/lib/guestProgress.ts:18,29` (`logger.warn`), `src/lib/errorReporting.ts:104,153` (`console.error` is _inside_ the reporter, so it is the canonical caller), `src/lib/analytics.ts:21,41` (`logger.log`). Production users will see unscrubbed error details in the browser console, and the call will not be reported to Sentry.
- **Suggested remedy:** Replace `console.error(...)` with `logger.error(...)` if dev-only logging is intended, or `reportServerError(error, { route: context })` if production reporting is intended. Update the unit test in `utils.test.ts` to mock the chosen path.

### CD-006: `articles/mdxParser.ts` silently swallows `access()` failure returning `undefined`

- **Category:** error-handling
- **Severity:** P2
- **Files:** `src/lib/articles/mdxParser.ts:75-77` (`} catch (err) { return undefined; }`)
- **Description:** `getArticleFromMdx` catches the `fsPromises.access` failure and returns `undefined` without logging or reporting. The companion function `getAllArticlesFromMdx` at `:60-65` handles the same failure by `throw new Error(\`Missing article MDX file: ${filePath}\`)`— so the two functions in the same file disagree on whether a missing MDX file is silent or fatal. Callers of`getArticleFromMdx` cannot distinguish "article does not exist" from "filesystem error", which masks operational issues.
- **Suggested remedy:** Either `logger.warn(\`Article MDX file not accessible: ${filePath}\`, err)`and return`undefined`, or `reportServerError(err, { route: "getArticleFromMdx", filePath })`. Apply the same policy to `getAllArticlesFromMdx` for consistency.

### CD-007: `glossary/highlighterCache.ts` silently swallows cache write failure

- **Category:** error-handling
- **Severity:** P3
- **Files:** `src/lib/glossary/highlighterCache.ts:37-39` (`} catch (e) { // Ignore if not an object }`)
- **Description:** The `WeakMap.set` call is wrapped in a try/catch that silently ignores all errors with a comment justifying it ("Ignore if not an object"). Other catch blocks in the same domain (`src/lib/guestProgress.ts:18,29`) log a `logger.warn` for storage failures. Even if the catch is intentional, the silent path hides unexpected exceptions (e.g., `glossaryCache.set` being called with a proxy or revoked WeakMap).
- **Suggested remedy:** Narrow the catch to only the expected condition (e.g., guard on `typeof glossaryTerms !== "object"`) and `logger.warn` any other thrown value. If keeping the catch-all, add a `logger.warn` so the path is observable.

### CD-008: `DashboardHeader` catch shows toast without reporting the underlying error

- **Category:** error-handling
- **Severity:** P2
- **Files:** `src/app/[locale]/dashboard/components/DashboardHeader.tsx:38-40` (`} catch (err) { showToast("error", t("exportError")); }`)
- **Description:** The export failure catch only surfaces a translated toast to the user; it does not call `reportClientError(err, ...)` or `logger.error(err)`. Compare to `src/app/[locale]/error.tsx:9` (`reportClientError(error, { digest: error.digest })`), `src/app/[locale]/auth/confirm/route.ts:30` (`reportServerError(err, ...)`), `src/hooks/useProgress.ts:218` (`reportClientError(error, ...)`), and `src/lib/guestProgress.ts:83,100` (`logger.error(...)`) — all of which report the underlying error in addition to (or instead of) surfacing it. The export flow swallows the underlying error entirely, so production failures will not be reported to Sentry.
- **Suggested remedy:** Add `reportClientError(err, { phase: "export" })` (or `logger.error("Progress export failed:", err)`) alongside the toast call. Apply the same fix to the import path at `:53` (`showToast("error", t("importError"))` is silent on the parse error).

### CD-009: `supabase/mockClient.ts` JSON-parse fallback swallows without logging

- **Category:** error-handling
- **Severity:** P3
- **Files:** `src/lib/supabase/mockClient.ts:433-434` (`} catch (err) { let depth = 0; ... }`)
- **Description:** `parseFirstJsonObject` falls back to a manual character scan when `JSON.parse` throws. The thrown error is silently dropped — no `logger.warn`, no `reportServerError`. This is a dev-only mock, but the same silent pattern would be flagged if it appeared in production code. The fallback is intentional (the function name advertises it), but the swallowed error hides malformed input.
- **Suggested remedy:** Add `logger.warn(\`parseFirstJsonObject: JSON.parse failed, falling back to manual scan\`, err)`if running in development, so a malformed payload is observable. If`mockClient`is strictly dev-only and never logs, document the policy in`codemap.md`.

### CD-010: Feature-folder components omit `"use client"` despite using React hooks

- **Category:** composition
- **Severity:** P2
- **Files:**
  - `src/app/[locale]/dashboard/components/DashboardHeader.tsx:1` (uses `useRef`, `useTranslations`, `useAppState`, `useToast`)
  - `src/app/[locale]/dashboard/components/DashboardStats.tsx:2` (uses `useTranslations`)
  - `src/app/[locale]/dashboard/components/RecommendedNext.tsx:3` (uses `useTranslations`)
  - `src/app/[locale]/dashboard/components/LearningPaths.tsx:3` (uses `useTranslations`)
  - `src/app/[locale]/dashboard/components/RecentActivity.tsx:3` (uses `useTranslations`)
  - `src/app/[locale]/dashboard/components/EarnedAchievements.tsx:2` (uses `useTranslations`)
  - `src/app/[locale]/tools/visit-planner/components/Step1ChooseVisitType.tsx:1` (uses `useTranslations`, `useRouter`)
  - `src/app/[locale]/tools/visit-planner/components/Step2SelectQuestions.tsx:1` (uses `useTranslations`)
  - `src/app/[locale]/tools/visit-planner/components/Step3Review.tsx:1` (uses `useTranslations`)
- **Description:** All nine files use client-only React hooks (`useTranslations` from `next-intl` is a hook; `useRouter`, `usePathname`, `useRef`, `useToast`, `useAppState` likewise), but none of them start with `"use client"`. They work because they are imported only by parent client components (e.g., `DashboardClient.tsx` at line 1 has `"use client"` and imports `./components/DashboardHeader`; `VisitPlannerClient.tsx` has `"use client"` and imports `./components/Step1ChooseVisitType`, etc.). Every other client component file in the codebase — `src/components/Header.tsx`, `Footer.tsx`, `Hero.tsx`, `SearchDialog.tsx`, `Callout.tsx`, `AccessibilityControls.tsx`, `AppProviders.tsx`, `OnboardingDialog.tsx`, `MedicalDisclaimer.tsx`, `ScrollToTop.tsx`, `AnalyticsPageViewTracker.tsx`, `LanguageToggle.tsx`, `SectionNav.tsx`, all `src/components/ui/*.tsx` that use hooks — explicitly starts with `"use client"`. The nine feature-folder files break the rule "client components declare their boundary", relying on transitive import for correctness. A future refactor that moves these imports to a server component would silently break them at runtime.
- **Suggested remedy:** Add `"use client"` as the first line of each of the nine files. Codify the rule in `codemap.md`: "Every file using `useState`/`useEffect`/`useTranslations`/`useRouter`/`usePathname`/`useContext`/etc. must begin with `'use client'`."

### CD-011: Pages reimplement progress bars with `role="progressbar"` instead of using `<ProgressBar>`

- **Category:** composition
- **Severity:** P3
- **Files:**
  - `src/app/[locale]/learn/[slug]/LessonPageClient.tsx:131-132` (`<div className="fixed top-0 left-0 z-50 h-1.5 will-change-[width] bg-primary ..." style={{ width: \`${scrollProgress}%\` }} role="progressbar" ...>`)
  - `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx:314,320` (`<div ... role="progressbar" ...><div className="progress-fill" style={{ width: \`${percent}%\` }} /></div>`)
  - `src/app/[locale]/HomeClient.tsx:188,194` (same pattern: `<div ... role="progressbar" ...><div className="progress-fill" style={{ width: \`${progress.percentage}%\` }} /></div>`)
  - `src/app/[locale]/auth/signup/SignupForm.tsx:181` (`style={{ width: strength.width }}` inside a `role="progressbar"` shell)
- **Description:** A shared `<ProgressBar>` component exists at `src/components/ui/ProgressBar.tsx:20` (`export default function ProgressBar`) and is already imported and used by `src/app/[locale]/tools/visit-planner/VisitPlannerClient.tsx:131`, `src/app/[locale]/tools/visit-checklist/VisitChecklistClient.tsx:155`, `src/app/[locale]/dashboard/progress/progress-client.tsx:200,274,383`, `src/app/[locale]/dashboard/achievements/achievements-client.tsx:131`, `src/app/[locale]/learn/LearnClient.tsx:6` (via parent), `src/components/learn/LearningPathCard.tsx:68`, `src/app/[locale]/dashboard/components/RecommendedNext.tsx:64`, `src/app/[locale]/dashboard/components/LearningPaths.tsx:50`, `src/app/[locale]/learning-paths/LearningPathsClient.tsx:111`, `src/app/[locale]/learning-paths/[pathId]/LearningPathDetailClient.tsx:78`. The four files listed above reimplement the same progress-bar markup by hand (`<div role="progressbar" ...><div className="progress-fill" style={{ width: ...% }} /></div>`), duplicating the accessibility attributes, the width animation, and the `.progress-fill` CSS class (defined in `src/app/globals.css:507,591`). The reimplementations are slightly inconsistent: `LessonPageClient.tsx` uses a fixed-position overlay, `QuizClient.tsx` and `HomeClient.tsx` use `.progress-fill` inside `role="progressbar"`, and `SignupForm.tsx` uses a different `strength.width` style.
- **Suggested remedy:** Replace each hand-rolled `<div role="progressbar">` block with `<ProgressBar value={percent} ... />`. The reading-progress overlay in `LessonPageClient.tsx` may warrant a separate `<ReadingProgress>` component if the fixed positioning cannot be folded into `ProgressBar`.

### CD-012: `useProgress` hardcodes English toast messages bypassing i18n

- **Category:** i18n-convention
- **Severity:** P1
- **Files:**
  - `src/hooks/useProgress.ts:176` (`showToast("error", "Failed to save progress");`)
  - `src/hooks/useProgress.ts:255` (`showToast("error", "Failed to save quiz result");`)
- **Description:** `useProgress` imports only `useLocale` from `next-intl` (`src/hooks/useProgress.ts:8`) — it never calls `useTranslations`. The two `showToast` calls pass hard-coded English strings as the user-facing message. Compare to `src/app/[locale]/dashboard/components/DashboardHeader.tsx:39` (`showToast("error", t("exportError"))`) which routes the same kind of error toast through `useTranslations`. Spanish users will see `"Failed to save progress"` and `"Failed to save quiz result"` in their toast notifications.
- **Suggested remedy:** Add `useTranslations` to `useProgress`, define `saveProgressFailed` and `saveQuizResultFailed` keys in `src/messages/en.json` and `src/messages/es.json`, and replace the literals with `t("saveProgressFailed")` / `t("saveQuizResultFailed")`. If adding a hook call inside a hook causes render-order issues, pass a `t` callback in from the calling component.

### CD-013: `LoginForm` imports router/search-params from `next/navigation` instead of `@/i18n/navigation`

- **Category:** import-convention
- **Severity:** P1
- **Files:** `src/app/[locale]/auth/login/LoginForm.tsx:5` (`import { useRouter, useSearchParams } from "next/navigation";`), `:36-37` (`const router = useRouter(); const searchParams = useSearchParams();`)
- **Description:** The dominant routing pattern across the codebase imports `Link`, `useRouter`, `usePathname`, `redirect` from `@/i18n/navigation` — i.e., the locale-aware wrappers created by `createNavigation(routing)` in `src/i18n/navigation.ts`. Confirmed users include `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx:17`, `src/app/[locale]/dashboard/settings/settings-client.tsx:5`, `src/app/[locale]/dashboard/progress/progress-client.tsx:3` (`useRouter`), `src/app/[locale]/learn/[slug]/LessonPageClient.tsx:8` (`Link`), `src/app/[locale]/dashboard/progress/progress-client.tsx:3` (`Link`), `src/components/LanguageToggle.tsx:4`, `src/components/SearchDialog.tsx:12`, `src/components/AnalyticsPageViewTracker.tsx:4`, `src/components/OnboardingDialog.tsx:7`, `src/app/[locale]/HomeClient.tsx:2`, `src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx:5`, etc. `LoginForm` is the only client component that pulls `useRouter`/`useSearchParams` from `next/navigation` directly — meaning `router.push(...)` and `router.replace(...)` will skip locale prefixing and route the user to the un-prefixed URL, breaking i18n for login flows.
- **Suggested remedy:** Change `import { useRouter, useSearchParams } from "next/navigation";` to `import { useRouter, useSearchParams } from "@/i18n/navigation";` (export `useSearchParams` from `src/i18n/navigation.ts` if not already present — current exports are `Link, redirect, usePathname, useRouter, getPathname`). Verify `searchParams.get("redirect")` semantics still work after the swap.

### CD-014: `__tests__/` folder diverges from colocated `*.test.ts(x)` convention

- **Category:** test-convention
- **Severity:** P2
- **Files:**
  - `src/lib/dashboard/__tests__/achievements.test.ts`
  - `src/lib/dashboard/__tests__/activity.test.ts`
  - `src/lib/dashboard/__tests__/dailyLog.test.ts`
  - `src/lib/dashboard/__tests__/learningPaths.test.ts`
  - `src/lib/dashboard/__tests__/progress.test.ts`
  - `src/lib/dashboard/__tests__/quizzes.test.ts`
  - `src/lib/dashboard/__tests__/recommendations.test.ts`
- **Description:** The dominant test convention is colocated `*.test.ts(x)` files next to the implementation — verified across `src/lib/` (`analytics.test.ts`, `errorReporting.test.ts`, `guestProgress.test.ts`, `i18n.test.ts`, `logger.test.ts`, `metadata.test.ts`, `notifications.test.ts`, `preferences.test.ts`, `rateLimit.test.ts`, `site.test.ts`, `streaks.test.ts`, `lessonListItem.test.ts`, `lessonVisuals.test.ts`, `localizedContent.test.ts`, `localizedQuiz.test.ts`, `normalizeLineEndings.test.ts`, `progressExport.test.ts`, `content.test.ts`, `locale.test.ts`), `src/lib/articles/`, `src/lib/auth/`, `src/lib/glossary/`, `src/lib/lessons/`, `src/lib/paths/`, `src/lib/quizzes/`, `src/lib/search/`, `src/lib/supabase/` (all colocated), and `src/components/**` and `src/hooks/**` (all colocated). The single exception is `src/lib/dashboard/__tests__/`, which collects seven test files into a Jest-style `__tests__/` directory. `vitest.config.ts:9` includes `src/**/*.test.ts` and `src/**/*.test.tsx` — the `__tests__` files only match because they end in `.test.ts` themselves, so the directory layout is incidental to test discovery. `src/lib/dashboard/profile.test.ts` and `src/lib/dashboard/utils.test.ts` are colocated (not in `__tests__/`), confirming the inconsistency within the same feature folder.
- **Suggested remedy:** Move all seven files out of `__tests__/` to be colocated with their implementation (e.g., `src/lib/dashboard/achievements.test.ts`). Delete the empty `__tests__/` directory. Document the colocated convention in `codemap.md`.

## Summary

- Total findings: 14
- Naming inconsistencies: 1 (CD-001)
- Folder structure drift: 1 (CD-002)
- Import convention drift: 1 (CD-013)
- Error handling drift: 5 (CD-005, CD-006, CD-007, CD-008, CD-009)
- Composition drift: 2 (CD-010, CD-011)
- i18n-convention drift: 3 (CD-003, CD-004, CD-012)
- Test convention drift: 1 (CD-014)

No findings were filed for **export style** (named vs default) or **CSS/Tailwind convention**: the project uses default exports for component entry points and named exports for utilities/types consistently, and the few inline `style={}` usages all carry dynamic values (`width: \`${percent}%\``) that cannot be replaced by static Tailwind classes.
