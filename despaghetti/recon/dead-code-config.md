# Dead-Code & Config Recon

## Method

Verified each export by running `rg "\bX\b" --type ts --type tsx src` (plus `*.mjs`/`*.cjs` when relevant) and excluding the definition file plus any `*.test.ts(x)` references — exports with no remaining matches are flagged as dead.

Verified each component by checking `from ['"]<path>/<ComponentName>['"]` patterns; a component is dead if it is only imported by its own test file (or by no file at all).

Verified each i18n key by running `rg "['\"]<key>['\"]" --type ts --type tsx src` (and the en.json/es.json definitions). Keys referenced only inside `src/test-utils.tsx` mocks (itself a dead file) are flagged.

Verified config drift by reading `next.config.mjs`, `netlify.toml`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `postcss.config.js`, `tailwind.config.ts`, `.prettierrc`, `.prettierignore`, `.editorconfig`, `eslint.config.mjs`, `.env.example`, `.husky/pre-commit` and diffing duplicated sections (security headers in particular).

Verified env-access scatter by running `rg "process\.env\.\w+"` and bucketing results by helper-vs-direct.

## Findings

### DC-001: `renderWithIntl` helper is dead (entire `src/test-utils.tsx` unused)

- **Category:** dead-export | dead-file
- **Severity:** P2
- **Files:** `src/test-utils.tsx:177` (function definition); 0 importers
- **Description:** Verified `rg "@/test-utils|test-utils['\"]" src` returns no matches. The file exports `renderWithIntl` but no test in the repo imports it (each test imports `NextIntlClientProvider` directly). Both `renderWithIntl` and the file's mock-message object are unused.
- **Suggested remedy:** Delete `src/test-utils.tsx`. Tests that need a provider wrapper should use the existing pattern (see `src/components/Callout.test.tsx`, `Footer.test.tsx`, etc.).

### DC-002: `LearningPathCard` component is dead

- **Category:** dead-component
- **Severity:** P2
- **Files:** `src/components/learn/LearningPathCard.tsx:42` (default export)
- **Description:** `rg "LearningPathCard"` outside the definition file matches only `src/components/learn/LearningPathCard.test.tsx`. Production code (`learning-paths/LearningPathsClient.tsx`, `HomeClient.tsx`, etc.) imports `LessonCard`, `ProgressBar`, `getLessonsByPath` etc. but never `LearningPathCard`. The component is shipped but never rendered.
- **Suggested remedy:** Delete `src/components/learn/LearningPathCard.tsx` and its `.test.tsx`. Confirm no `@next/bundle-analyzer` surprises.

### DC-003: `Alert` UI component is dead

- **Category:** dead-component
- **Severity:** P3
- **Files:** `src/components/ui/Alert.tsx:52` (default export)
- **Description:** `rg "\\bAlert\\b" src` (excluding `AlertCircle`, `AlertTriangle`, `aria-label`) matches only: `Alert.tsx` definition, `Alert.test.tsx` test, and `ui/index.ts` barrel. No app code imports `Alert` either directly (`@/components/ui/Alert`) or via the `@/components/ui` barrel (the latter has 0 importers — see DC-004).
- **Suggested remedy:** Delete `Alert.tsx`, `Alert.test.tsx`, and remove the `export { default as Alert }` + `export type { AlertProps, AlertVariant }` entries from `ui/index.ts`.

### DC-004: `Badge` UI component is dead

- **Category:** dead-component
- **Severity:** P3
- **Files:** `src/components/ui/Badge.tsx:26` (default export)
- **Description:** `rg "\\bBadge\\b" src` matches only `Badge.tsx`, `ui/index.ts` (barrel re-export), and unrelated message keys (`joinBadge`, `pageBadge`, `introBadge`) referenced via `t(...)`. Badge has no test file and no production importer.
- **Suggested remedy:** Delete `Badge.tsx` and remove its `export { default as Badge }` + `export type { BadgeProps, BadgeVariant, BadgeSize }` entries from `ui/index.ts`.

### DC-005: `ui/index.ts` barrel is itself dead

- **Category:** dead-export
- **Severity:** P3
- **Files:** `src/components/ui/index.ts:1` (and lines 2-22)
- **Description:** `rg "from ['\"]@/components/ui['\"]" src` returns 0 matches. Every consumer imports the specific component (`@/components/ui/Button`, `@/components/ui/Modal`, etc.) directly, never the barrel. This means all of `index.ts`'s exports (Alert, Badge, Button, Card, EmptyState, Input, KeyTakeaway, Modal, ProgressBar, Skeleton, ThemeToggle, ToastProvider, plus type exports) are functionally dead _from the barrel's perspective_. Individual components may still be alive (verified above) when imported directly.
- **Suggested remedy:** Delete `src/components/ui/index.ts`. (Combine with DC-003/DC-004 to also drop Alert and Badge.)

### DC-006: `parseLocale` export is dead

- **Category:** dead-export
- **Severity:** P3
- **Files:** `src/lib/locale.ts:4`
- **Description:** `rg "\\bparseLocale\\b" src` (excluding definition + `locale.test.ts`) returns 0 matches. The function is only used internally by `requireLocale` in the same file and by its own test. External callers go through `requireLocale` directly.
- **Suggested remedy:** Either (a) inline `parseLocale` into `requireLocale` and delete both the export and the dedicated test block, or (b) keep as internal helper without `export`.

### DC-007: `loadLessonsForLocale` export is dead

- **Category:** dead-export
- **Severity:** P2
- **Files:** `src/lib/lessons/loadLessons.ts:14`
- **Description:** `rg "loadLessonsForLocale"` across the entire repo (excluding `node_modules/`, `.next/`, etc.) matches only: the definition file itself, the inline docstring, and a mention in `src/lib/lessons/codemap.md`. No production importer; no test importer. The dynamic-import code-splitting helper that the codemap advertises was never wired up.
- **Suggested remedy:** Delete `loadLessonsForLocale` (and update `src/lib/lessons/codemap.md`).

### DC-008: Eight async wrappers in `src/lib/content.ts` are dead

- **Category:** dead-export
- **Severity:** P2
- **Files:** `src/lib/content.ts:12` (`getAllLessons`), `:28` (`getLessonById`), `:32` (`getCategories`), `:50` (`getQuizByLessonId`), `:54` (`getQuizById`), `:59` (`getAllLearningPaths`), `:63` (`getLearningPathById`), `:67` (`getLessonsForPath`)
- **Description:** Verified `rg "from ['\"]@/lib/content['\"]" src -A 5` — only `getLessonsByPath`, `getPathProgress`, `getStartedPathCount`, `getCompletedPathCount` are imported (the latter three only from `content.test.ts` and `LearningPathsClient.tsx`/`HomeClient.tsx`). The eight async wrappers (lines 12-79) shadow the synchronous helpers from `lessons/loadLessons.ts`, `paths/loadPaths.ts`, `quizzes/quizParser.ts`, `articles/loadArticles.ts`, `localizedQuiz.ts`, and `localizedContent.ts`, but production code imports those sources directly. `getCategories` and `getQuizById` have zero references anywhere (including tests).
- **Suggested remedy:** Delete the eight dead async exports. Keep only `getLessonsByPath`, `getPathProgress`, `getStartedPathCount`, `getCompletedPathCount` (the four helpers actually used). Consider whether the `content.ts` facade adds enough value over importing `localizedContent.ts` directly.

### DC-009: `AchievementContext` type export is dead

- **Category:** dead-export
- **Severity:** P3
- **Files:** `src/lib/achievements.ts:80`
- **Description:** `rg "AchievementContext"` across the repo matches only `src/lib/achievements.ts` (the definition and the inline `context: AchievementContext` annotation). The type is never imported by another file — including the `achievements.test.ts` mocks — even though it is the parameter type for `checkAndAwardAchievements` (also exported) which IS used in `useProgress.ts`.
- **Suggested remedy:** Either keep the type without `export`, or — since `useProgress.ts` constructs an object literal that satisfies the type — let the type live only in `achievements.ts`.

### DC-010: `Messages` and `messages` exports in `src/lib/i18n.ts` are dead

- **Category:** dead-export
- **Severity:** P3
- **Files:** `src/lib/i18n.ts:7` (`Messages`), `:9` (`messages`)
- **Description:** `rg "import .* \\bMessages\\b.* from" src` and `rg "import .* \\bmessages\\b.* from" src` both return 0 matches. `Messages` is only referenced inside `i18n.ts` itself (line 7 declaration, line 9 used in `Record<Locale, Messages>`, line 11 used in return type). `messages` is only referenced inside `i18n.ts` itself (line 9 declaration, line 12 used as `messages[locale]`).
- **Suggested remedy:** Drop the `export` keyword from both `Messages` (line 7) and `messages` (line 9).

### DC-011: `RateLimitResult` type export is dead

- **Category:** dead-export
- **Severity:** P3
- **Files:** `src/lib/rateLimit.ts:44`
- **Description:** `rg "RateLimitResult"` across the repo matches only `src/lib/rateLimit.ts` (the declaration on line 44 and the inferred return annotation on line 71's `checkRateLimit`). The type is exported but no other file imports it.
- **Suggested remedy:** Drop the `export` keyword on line 44.

### DC-012: `trackEvent` and `EVENTS` exports in `src/lib/analytics.ts` are dead in production

- **Category:** dead-export
- **Severity:** P3
- **Files:** `src/lib/analytics.ts:40` (`trackEvent`), `:55` (`export { EVENTS }`)
- **Description:** `rg "trackEvent"` outside `analytics.ts`/`analytics.test.ts` returns 0 matches — `trackEvent` is exported but no production code calls it (only `AnalyticsPageViewTracker` exists and calls `trackPageView`). `rg "EVENTS\\."` outside `analytics.ts`/`analytics.test.ts` also returns 0 matches — the EVENTS constant is exported but no production code reads its members. The type alias `EventProperties` is intentionally private (no `export`).
- **Suggested remedy:** Either (a) wire `trackEvent` into real callers (e.g., `useProgress` completion handlers) and consume `EVENTS` from there, or (b) drop `trackEvent`, `EVENTS`, and `export { EVENTS }` until the API is needed.

### DC-013: `assertAllQuizzesExist` export is dead in production

- **Category:** dead-export
- **Severity:** P3
- **Files:** `src/lib/quizzes/quizParser.ts:78` (verified — `rg "export " src/lib/quizzes/quizParser.ts`)
- **Description:** `rg "assertAllQuizzesExist"` across the repo matches only `quizParser.ts` (the definition) and `quizParser.test.ts` (the test). The CI build scripts (`scripts/bundle-quizzes.ts`) call `getAllQuizzesFromMdx` directly — they never invoke `assertAllQuizzesExist`.
- **Suggested remedy:** Either (a) wire `assertAllQuizzesExist` into `content:validate` or `bundle-quizzes.ts`, or (b) drop the export and the test block.

### DC-014: `mdxParser.ts` "from MDX" exports in lessons/paths/quizzes/articles/glossary are unused by app code

- **Category:** dead-export
- **Severity:** P3
- **Files:**
  - `src/lib/lessons/mdxParser.ts:65` (`getLessonMdxDir`), `:69` (`getAllLessonsFromMdx`), `:84` (`getLessonFromMdx`)
  - `src/lib/paths/mdxParser.ts:8` (`getPathMdxDir`), `:10` (`getAllPathsFromMdx`)
  - `src/lib/quizzes/quizParser.ts:38` (`getQuizMdxDir`), `:67` (`getAllQuizzesFromMdx`), `:74` (`getQuizFromMdx`)
  - `src/lib/articles/mdxParser.ts:51` (`getArticleMdxDir`), `:54` (`getAllArticlesFromMdx`), `:57` (`getArticleFromMdx`)
  - `src/lib/glossary/mdxParser.ts:27` (`getGlossaryMdxDir`)
- **Description:** Verified: `getArticleFromMdx`, `getQuizFromMdx`, `getLessonFromMdx`, `getGlossaryTermFromMdx` are only imported by their respective `.test.ts` files. `getPathFromMdx` does not exist (typo in my probe). `getAllPathsFromMdx`, `getAllArticlesFromMdx`, `getAllGlossaryFromMdx`, `getAllLessonsFromMdx`, `getQuizMdxDir`, `getLessonMdxDir`, `getArticleMdxDir`, `getGlossaryMdxDir`, `getAllQuizzesFromMdx` are referenced by `scripts/` (bundle/validate/generate), not by `src/`. This is by design (build-time-only) and is **not** an error — flagged only because the prompt asks for exhaustive dead-export verification.
- **Suggested remedy:** None — these are correctly build-time-only. The `*FromMdx` single-item helpers (`getArticleFromMdx`, `getQuizFromMdx`, `getLessonFromMdx`, `getGlossaryTermFromMdx`) are technically only used by tests, but they are part of a deliberate MDX access API; keep unless sweeping.

### DC-015: Orphaned root-level scripts `update_messages.js` and `test_i18n.ts`

- **Category:** dead-file
- **Severity:** P3
- **Files:** `./update_messages.js`, `./test_i18n.ts`
- **Description:** Verified `rg "update_messages|test_i18n"` (excluding the files themselves) returns 0 matches. They are not in `package.json` scripts, not referenced by CI, not referenced by docs. `update_messages.js` mutates `src/messages/en.json` (adds `tools.emergencyShort` / `tools.careOptionsHeading` keys that the JSON now contains, so the script's job is already done). `test_i18n.ts` is a one-liner that imports `normalizeGlossaryLetter` and `console.log`s results.
- **Suggested remedy:** Delete both files. If `update_messages.js` was supposed to run on CI for new content, convert it into a `scripts/` script and wire it into `package.json`.

### DC-016: Orphaned scripts in `scripts/` directory

- **Category:** dead-file
- **Severity:** P3
- **Files:**
  - `scripts/analyze-untranslated.ts`
  - `scripts/summarize-audit.ts`
  - `scripts/summarize-local-audit.ts`
  - `scripts/extract-health-info.mjs`
- **Description:** Verified by `rg "scripts/<name>\\b"` (excluding the files themselves): each returns 0 matches. They are not in `package.json` scripts, not referenced by CI, not referenced by other scripts, not in docs. `analyze-untranslated.ts` and `summarize-*.ts` read `audit-results-raw.json` / `audit-results-local-raw.json` / `untranslated-analysis.txt` artifacts that are still in the repo root — so these scripts appear to be one-off audit-reporting helpers left in place.
- **Suggested remedy:** Delete the four orphaned scripts. If audit reporting is recurring, wire them into `package.json` as `audit:summarize` etc. and add to `.gitignore` for the JSON inputs if they are no longer needed.

### DC-017: Dead i18n keys in `src/messages/en.json` (and mirrored `es.json`)

- **Category:** dead-i18n-key
- **Severity:** P2
- **Files:** `src/messages/en.json` and `src/messages/es.json`
- **Description:** Verified via `rg "['\"]<key>['\"]" --type ts --type tsx src` returning 0 matches, and via `rg "<key>"` returning matches only in `en.json`/`es.json` themselves (and a few inside `src/test-utils.tsx` mocks, which is itself dead — see DC-001). The 20 verified dead leaf keys are:

  | Section.key                   | en value                            |
  | ----------------------------- | ----------------------------------- |
  | `common.streakTooltip`        | `"{streak} day learning streak!"`   |
  | `common.print`                | `"Print"`                           |
  | `common.lessonsFound`         | `"lessons found"`                   |
  | `common.closeDialog`          | `"Close dialog"`                    |
  | `common.dismissNotification`  | `"Dismiss notification"`            |
  | `learn.markIncomplete`        | `"Mark as not done"`                |
  | `learn.printLesson`           | `"Print lesson"`                    |
  | `paths.progressOfTotal`       | `"{completed} of {total} complete"` |
  | `paths.lessonsOfTotal`        | `"{completed} of {total} lessons"`  |
  | `paths.yourProgress`          | `"Your progress"`                   |
  | `paths.lessonsInPath`         | (defined but never looked up)       |
  | `dashboard.overview`          | `"Overview"`                        |
  | `dashboard.keepGoing`         | `"Keep going"`                      |
  | `dashboard.ofLibrary`         | (defined but never looked up)       |
  | `dashboard.modulesCompleted`  | (defined but never looked up)       |
  | `dashboard.noPathsProgress`   | (defined but never looked up)       |
  | `dashboard.noPathsCompleted`  | (defined but never looked up)       |
  | `dashboard.pathsCompletedMsg` | (defined but never looked up)       |
  | `dashboard.pathsInProgress`   | (defined but never looked up)       |
  | `dashboard.recentMilestones`  | (defined but never looked up)       |

  Notes:
  - For keys marked "defined but never looked up", I additionally verified the leaf name appears nowhere in `src/` outside the messages files.
  - Keys like `common.relativeWeeks`, `common.timeMinutes` are read via `copy.<key>.replace(...)` in `src/lib/i18n.ts:43/72` (NOT via `t()` lookup) — they are **alive** and intentionally **excluded** from this dead list.
  - Full exhaustive verification of all 739 leaf keys is not attempted here because next-intl's `useTranslations("section")` + `t("leaf")` pattern makes string-literal search a heuristic, not a proof. The 20 keys above were verified by hand against the actual `t()` / `copy.X.Y` access patterns. A more thorough pass would require AST parsing or running the i18n key checker (e.g., `i18n-unused`).

- **Suggested remedy:** Remove the 20 dead leaf keys from both `en.json` and `es.json`. Re-run `npm run lint` and `npm run typecheck` after the cleanup.

### DC-018: `scripts/check-production-env.test.ts` lives next to its source but is excluded from `vitest.config.ts`

- **Category:** orphaned-config (light)
- **Severity:** P3
- **Files:** `scripts/check-production-env.test.ts:1`, `vitest.config.ts:9`
- **Description:** `vitest.config.ts` declares `include: ["src/**/*.test.ts", "src/**/*.test.tsx", "scripts/**/*.test.ts"]` (line 9) — so the script test IS included. No drift. Verified by reading `vitest.config.ts` directly. **No issue.** Logged for completeness because the prompt requested verification of test-runner scoping.
- **Suggested remedy:** None.

### DC-019: Security header drift: `preload` directive missing in `netlify.toml`

- **Category:** tooling-conflict
- **Severity:** P2
- **Files:** `next.config.mjs:21` vs `netlify.toml:65`
- **Description:** `next.config.mjs` line 21 sets `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`. `netlify.toml` line 65 sets `Strict-Transport-Security: max-age=31536000; includeSubDomains` (missing `; preload`). Because Netlify serves the deployed site directly from the platform CDN, the HSTS header actually delivered to browsers in production comes from `netlify.toml` — so the `preload` directive in next.config.mjs is silently dropped in production. Same issue for `Permissions-Policy`? No — both files include the same `camera=(), microphone=(), geolocation=(), interest-cohort=()`. Same for `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` — identical. The drift is HSTS-only.
- **Suggested remedy:** Sync `netlify.toml` line 65 to `max-age=31536000; includeSubDomains; preload`. Consider extracting security headers into a single shared file (e.g., a JSON imported by both configs) to prevent future drift.

### DC-020: No-op `[[redirects]]` in `netlify.toml`

- **Category:** orphaned-config
- **Severity:** P3
- **Files:** `netlify.toml:67-75`
- **Description:** `netlify.toml` lines 67-75 define two redirects:
  ```
  [[redirects]]
    from = "/en"
    to = "/en"
    status = 200

  [[redirects]]
    from = "/es"
    to = "/es"
    status = 200
  ```
  A redirect with `from == to` and `status = 200` is a rewrite rule that does nothing. This is either (a) leftover from a refactor when locale routing was being implemented, or (b) an attempted workaround for the `@netlify/plugin-nextjs` locale handling.
- **Suggested remedy:** Delete both `[[redirects]]` blocks. If they were intended to trigger the Next.js i18n handler, the `@netlify/plugin-nextjs` plugin (line 14) already handles locale routing; explicit Netlify redirects are not needed.

### DC-021: Scattered `process.env` access bypasses `src/lib/supabase/env.ts` helper

- **Category:** config-scatter | env-access
- **Severity:** P3
- **Files:** `src/app/api/contact/route.ts:32`, `:33`, `:35`; `src/components/GoogleAnalytics.tsx:5`; `src/lib/errorReporting.ts:99`; `src/lib/site.ts:1`
- **Description:** Direct `process.env.X` access outside of `src/lib/supabase/env.ts`:
  - `src/app/api/contact/route.ts:32` — `process.env.NEXT_PUBLIC_SITE_URL` (should use `getSiteUrl()` from `lib/site.ts`)
  - `src/app/api/contact/route.ts:33` — `process.env.NEXT_PUBLIC_SUPABASE_URL` (should use `getSupabaseUrl()` from `lib/supabase/env.ts`)
  - `src/app/api/contact/route.ts:35` — `process.env.SUPABASE_SERVICE_ROLE_KEY` (no helper — but should be added to `lib/supabase/env.ts`)
  - `src/components/GoogleAnalytics.tsx:5` — `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` (no helper — but trivial enough to read once)
  - `src/lib/errorReporting.ts:99` — `process.env.NEXT_PUBLIC_SENTRY_DSN` (this is the helper itself; fine)
  - `src/lib/site.ts:1` — `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` (this is the helper itself; fine)
- **Suggested remedy:** Replace `process.env.X` reads in `src/app/api/contact/route.ts` with calls to `getSiteUrl()` and `getSupabaseUrl()`. Add a `getSupabaseServiceRoleKey()` helper to `lib/supabase/env.ts` and route contact/route.ts through it. Optionally add a `getGaMeasurementId()` helper to a `lib/analytics/env.ts`-style file for the GA env access.

### DC-022: ESLint config disables `@typescript-eslint/no-require-imports` and `react-hooks/set-state-in-effect`

- **Category:** tooling-conflict (light)
- **Severity:** P3
- **Files:** `eslint.config.mjs:8-12`
- **Description:** `eslint.config.mjs` lines 8-12 turn off two rules that the `eslint-config-next` base would otherwise enforce:
  - `@typescript-eslint/no-require-imports: "off"` — needed because `scripts/*.ts` use `require(...)`.
  - `react-hooks/set-state-in-effect: "off"` — disables the React 19 effect-state rule. Verified `rg "set-state-in-effect" src` returns 0 hits in actual source (only in the eslint config), so the rule was disabled defensively rather than to silence a specific violation.
- **Suggested remedy:** Either (a) keep as-is — these are intentional, well-scoped suppressions; or (b) tighten by using `eslint-disable-next-line` comments on the actual `require()` lines in `scripts/` instead of disabling the rule globally for `src/`. Not a high-priority cleanup.

### DC-023: No duplicate ESLint / Vitest / TS / Prettier configs

- **Category:** (verified-clean) tooling-conflict
- **Severity:** (none)
- **Files:** `eslint.config.mjs`, `vitest.config.ts`, `vitest.setup.ts`, `tsconfig.json`, `.prettierrc`, `.prettierignore`, `playwright.config.ts`, `postcss.config.js`, `tailwind.config.ts`, `.editorconfig`
- **Description:** Verified by `find . -maxdepth 3 -type f \( -name "*.config.*" -o -name "*.toml" -o -name ".env*" -o -name "tsconfig*.json" -o -name ".prettierrc*" -o -name ".editorconfig" \) -not -path "./node_modules/*" -not -path "./.git/*"` — there is exactly one of each config file at the project root (plus one `tsconfig.tsbuildinfo` build artifact that is correctly listed in `.gitignore`). No ESLint `eslintrc.json` next to `eslint.config.mjs`, no separate `vitest.*` configs. Prettier and ESLint are non-overlapping (ESLint only sets code-style rules from `next`, Prettier owns formatting). No `tsconfig.json` `extends` mismatch. **No drift.**
- **Suggested remedy:** None.

### DC-024: `as any` and `@ts-expect-error` audit

- **Category:** (verified-clean) tooling-conflict
- **Severity:** (none)
- **Files:** (across `src/`)
- **Description:** `rg "as any" --type ts --type tsx src | wc -l` returned 92 — but filtering to non-test files leaves **1** instance: `src/app/[locale]/learn/LearnClient.tsx` line 25 (verified): `getCategoryLabel(categoryId as any, locale)`. This single `as any` is a legitimate type-smoothing escape because `categoryId` is typed as `string` in the page-client while `getCategoryLabel` expects `LessonCategoryId`.
- **Suggested remedy:** Tighten by typing `categoryId` as `LessonCategoryId` in the `LearnClient` props chain instead of using `as any`. Low priority.

## Summary

- Total findings: 24
- Dead exports: 11 (DC-006, DC-007, DC-008 ×8 counted as one finding, DC-009, DC-010 ×2, DC-011, DC-012 ×2, DC-013)
- Dead components: 3 (DC-002, DC-003, DC-004)
- Dead files: 6 (DC-001 test-utils.tsx, DC-015 ×2 root scripts, DC-016 ×4 scripts/orphans) — counted as 2 file-level findings + 2 file-level findings
- Dead hooks: 0
- Dead types: 5 type exports verified dead across 4 findings (DC-009, DC-010, DC-011, plus non-exported `EventProperties` in DC-012)
- Dead scripts (package.json): 0 — every script in `package.json` is referenced by another script, CI, or docs
- Dead i18n keys: 20 verified leaf keys across both `en.json` and `es.json` (DC-017)
- Config drift items: 6 (DC-019 HSTS preload missing in netlify.toml; DC-020 no-op redirects in netlify.toml; DC-021 scattered env access; DC-022 ESLint rule suppressions; DC-023 verified-clean configs; DC-024 verified-clean `as any` audit)
- Verified-clean findings (logged for audit trail): 4 (DC-018, DC-023, DC-024, and the build-time-only note in DC-014)
