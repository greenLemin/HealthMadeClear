# AUDIT_INVENTORY.md — HealthMadeClear Total Codebase Inventory

**Generated:** 2026-08-20  
**Commit:** (see git log)  
**Scope:** Exhaustive — every file, dep, route, config, test, migration enumerated

---

## 1. File Count & LOC

- **440 src files** (total 52,597 LOC excl. node_modules/.next)
- **31 scripts/** files, **13 supabase/migrations**, **9 e2e specs**, **92 vitest files (629 tests)**
- **Content:** lessons 51 en + 51 es (53 incl. codemap), quizzes 51 en + 52 es, articles 15+15, glossary 31+31, paths 8+8 → total ~312 MDX
- **Data bundles:** 6 pairs (lesson/quiz/article/glossary/path/search) ~19,433 LOC generated
- **Languages:** TypeScript 95%, MDX 4%, JS/MJS 1%
- **Largest src files (>300 LOC):** `queryBuilder 572`, `useProgress 453`, `LessonPageClient 377`, `HomeClient 369`, `ProgressClient 363`, `MarkdownRenderer 356`, `QuizClient 330`

Full tree: see sub-reports §3-8.

## 2. Entry Points & Routing

- **Middleware:** `src/middleware.ts:1` — `next-intl` i18n handle + `updateSession` (Supabase refresh + dashboard guard). Matcher excludes api/_next/_vercel/static.
- **App shell:** `src/app/[locale]/layout.tsx:1` (145 LOC) — fonts, `PREFERENCE_BOOTSTRAP_SCRIPT`, `NextIntlClientProvider→AppProviders→AuthProvider→Banner/Header/main#main-content/Footer`. Root `src/app/layout.tsx:1` passthrough.
- **Static generation:** Every locale page pre-rendered via `generateStaticParams`; `sitemap.ts:1` (121 LOC) + `robots.ts:1` (14 LOC) with hreflang alternates.
- **Routes (all [locale]-prefixed, localePrefix always):**
  - `/` Home → HomeClient 369
  - `/learn` → LearnClient 233 + `/learn/[slug]` → LessonPageClient 377 + `/learn/[slug]/quiz` → QuizClient 330
  - `/learning-paths` → LearningPathsClient 245 + `/learning-paths/[pathId]` → Detail 216
  - `/articles` 92 + `/articles/[slug]` 150
  - `/glossary` 239 + `/glossary/[term]` 136
  - `/tools` 121 + `/tools/visit-planner` 220 (useVisitPlanner 157 + 3 steps) + `/tools/visit-checklist` 178 + `/tools/care-guide` 174
  - `/dashboard` (dynamic, auth-guarded via `requireAuth`) + `/dashboard/progress` 363 + `/dashboard/achievements` 192 + `/dashboard/settings` 299
  - `/about` 133, `/accessibility` 84, `/privacy`, `/terms` 86, `/contact` 254
  - `/auth/login` 143, `/auth/signup` 201, `/auth/forgot-password` 119, `/auth/reset-password` 173, `/auth/callback` route 100, `/auth/confirm` route 92
  - APIs: `src/app/api/contact/route.ts:1` 129 LOC, `src/app/api/og/route.tsx:1` 166 LOC
- **Navigation:** Header nav 8 items + Skip link → `#main-content`. Layout hierarchy: `[locale]/layout` + 3-line segment layouts (learn, learning-paths, glossary, dashboard, tools/*, about, privacy).
- **Error/404:** `global-error.tsx:1` 53 (bypass providers, cookie locale), `[locale]/error.tsx:1` 41, `not-found.tsx` 23 + root `not-found.tsx:1` 55. Per-segment error boundaries present only for learn/articles/dashboard/auth — gaps at tools/glossary/learning-paths/contact/about/privacy/terms noted.

## 3. src/app Detailed Map

| Path                                                                | Files                                                                                                                                                                                                                                                                                                | Notes                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `src/app/`                                                          | layout 5, fonts 15, globals.css 697, sitemap 121, robots 14, global-error 53, not-found 55, api/contact 129+136test, api/og 166                                                                                                                                                                      | globals defines 50+ CSS vars, CSP duplicate in netlify.toml |
| `src/app/[locale]/`                                                 | layout 145, page 59, HomeClient 369, loading 18, error 41, not-found 23                                                                                                                                                                                                                              | PREFERENCE_BOOTSTRAP_SCRIPT inline before hydration         |
| `about`, `accessibility`, `articles`, `contact`, `privacy`, `terms` | Each: page 23, Client 84-254, loading 5-12, layout 3                                                                                                                                                                                                                                                 | Mostly static                                               |
| `learn`                                                             | page 50, LearnClient 233, layout 3, error 3, loading 40; [slug] 101+377, not-found 23; [slug]/quiz 23+330                                                                                                                                                                                            | Filters via useMemo                                         |
| `learning-paths`                                                    | LearningPathsClient 245, layout 3; [pathId] 75+216                                                                                                                                                                                                                                                   |                                                             |
| `glossary`                                                          | GlossaryClient 239, layout 3; [term] 14+136                                                                                                                                                                                                                                                          |                                                             |
| `tools`                                                             | ToolsClient 121; visit-planner (220+157+216test+3 steps), visit-checklist 178, care-guide 174                                                                                                                                                                                                        | state via useVisitPlanner + localStorage                    |
| `dashboard`                                                         | page 57 dynamic, DashboardClient 39, layout 36, error 3, loading 66; components: DashboardHeader 108+92test, DashboardStats 91, RecentActivity 75, LearningPaths 89, EarnedAchievements, RecommendedNext 127; progress 114+363 + ProgressCircle/StreakCalendar 66; achievements 37+192; settings 299 | auth-guarded                                                |
| `auth`                                                              | callback route 100+test, confirm 92+test, login 143, signup 201, forgot 119, reset 173, error 3                                                                                                                                                                                                      | shared useAuthFormState hook                                |

## 4. src/components Map (8,339 LOC)

- **Top-level (2,807):** AppProviders 221 (Context locale/theme/textSize/simpleMode + progress Sets + hydrated sync), Header 278 (sticky glass, mobile dialog motionSafe, useFocusTrap/useDismissibleOverlay, dynamic NotificationCenter/SearchDialog), Footer 132, Hero 69, LanguageToggle 70, AccessibilityControls 260, SearchDialog 158, OnboardingDialog 155, LessonThumbnail 48, MedicalDisclaimer 38, JsonLd 26 (serialize-javascript safe), Callout 58, PageHeader 84, PageSection 19, SectionNav 80, ScrollToTop 43, AnalyticsPageViewTracker 23, GoogleAnalytics 29, Logo 7 (`<img>` warning)
- **ui (2,069):** Button 52, ButtonLink 31, Card 59, Input 114, Modal 171, Toast 94+ToastProvider 57, NotificationCenter 206, ProgressBar 65, Skeleton 79, EmptyState 71, ResourceCard 47, Reveal 49, MetricCard 28, ThemeToggle 24, NetworkStatusBanner 54, SaveProgressBanner 59, TruncatedText 41, KeyTakeaway 20 (hardcoded default), FormErrorAlert 12, animation 7, buttonStyles 44
- **learn/LessonCard 62**, **lesson/LessonRelatedClient 45**, **quiz:** QuizQuestion 75, QuizResults 224, Confetti 56, **articles/ArticleCard 29**, **dashboard:** AchievementCard 75, DashboardSidebar 160 (contains `values?: any` drift), **mdx:** MarkdownRenderer 356 (custom parse, keys `p-i` etc.), GlossaryHighlighter 40, InlineGlossaryTerm 217, ScrollSpyProvider 82, **header/NavLink 34, MobileMenu 81**, **search/SearchDialogContent 130, SearchTrigger 45**, **loading:** AuthFormLoading 49, PageHeaderSkeleton 26, StaticPageLoading 52, **providers/AuthProvider 52**

## 5. src/lib Map (47 prod files + 60 tests, 9,430 LOC)

- **Root:** site 3, normalizeLineEndings 4, validation 5 (EMAIL_REGEX), logger 17 (dev-gated), metadata 15, locale 14, i18n 75 (formatLevel/getCategoryLabel/formatRelativeDate etc.), content 79 (facade), localizedContent 45, localizedQuiz 11, lessonListItem 31, lessonVisuals 44, analytics 52 (gtag), achievements 174 (10 defs + checkAndAward + notifications), streaks 106, notifications 77, progressExport 105 (v1/v2 JSON), guestProgress 110 (sessionStorage), preferences 139 (STORAGE_KEYS/PREFERENCE_COOKIES/cookie+localStorage sync + PREFERENCE_BOOTSTRAP_SCRIPT 18 LOC), errorReporting 154 (Sentry wrapper, PII redaction scrubPII + sanitizeContext, beforeBreadcrumb), rateLimit 77 (in-memory token bucket, getClientIp netlify-aware, last IP from x-forwarded-for), safeHref 30 (SAFE_PROTOCOLS, control-char stripping, decodeURIComponent), codemap 44
- **articles:** loadArticles 26, mdxParser 54
- **auth:** passwordStrength 23, requireAuth 22, sanitizeRedirect 10 (strips //,\, external), useAuthFormState 57 (0% coverage)
- **dashboard:** index 9 barrel, utils 7 (logQueryError → console.error drift), achievements 32, activity 72, dailyLog 31, progress 133 (getUserProgressSummary + getPaginatedLessons), quizzes 61, learningPaths 61, profile 31, recommendations 104
- **glossary:** loadGlossary 20, mdxParser 59, highlighterCache 46
- **lessons:** loadLessons 11, mdxParser 64
- **mdx:** callouts 41
- **paths:** loadPaths 11, mdxParser 45
- **quizzes:** quizParser 171 (515 LOC test)
- **search:** highlightMatches 16
- **supabase:** client 10 (getMockSupabaseClient fallback), server 25 (createServerClient cookies getAll/setAll), middleware 44 (isSupabaseConfigured/shouldUseMockClient + dashboard redirect), env 28 (PLACEHOLDER_URL/KEY, CI_PLACEHOLDER_URL), mockClient 31, mock/types 72 (`options?: any` only prod any), mock/utils 78, mock/defaults 50, mock/normalizers 314, mock/store 76, mock/auth 202, mock/queryBuilder 572

## 6. src/hooks Map (5 prod + 5 tests, 1,146 LOC)

- useAuth 12 (throws outside provider), useProgress 453 (orchestrator: supabase vs localStorage, optimistic updates, streak/achievement/dailyLog side-effects, guest migration, pathsByLessonMapCache, loadPathsPromise), useFocusTrap 45, useDismissibleOverlay 70 (click-outside + Escape + ref-count scroll lock), useMotionSafe 8 (useReducedMotion ?? false)

## 7. src/types Map (447 LOC)

- content 146 (LESSON_IDS[53], PATH_IDS[7], GLOSSARY_IDS[31], ARTICLE_IDS[15], categories), database 103 (7 tables: profiles, lesson_progress w/ time_spent_seconds, quiz_attempts, achievements, streaks, daily_log, notifications), dashboard 58, lesson 51 (Lesson + LessonListItem), learningPath 25, article 22, glossary 17, quiz 17, search 12, visitPlanner 13

## 8. src/i18n + middleware

- routing 7 (`locales [en,es] default en localePrefix always`), request 13 (loads ../messages/${locale}.json), navigation 4 (createNavigation), messages en 863 lines 42KB / es 865 45KB — parity good
- middleware 15 (matches `/((?!api|_next|_vercel|.*\..*).*)`)

## 9. src/data + content + scripts

- **data:** Bundled arrays per locale (lessonBundles 3,715, quizBundles ~3,500, articleBundles ~670, glossaryBundles 268, pathBundles ~243, searchIndex ~1,260) + facades 3-9 LOC
- **content:** ~312 MDX across lessons/quizzes/glossary/articles/paths en+es
- **scripts (31 files):** bundle-_.ts (lessons, paths, glossary, quizzes, articles), build-search-index.ts, generate-_.ts (4 generators + 2 expansion), validate-content.ts + test, check-production-env.mjs + test, patch-*.js/ts (yaml-compatibility, quiz-explanations, path-es-bodies, clinical-review, lesson-depth)

## 10. Dependencies

- **prod (12):** next 16.3.1 pinned, react 19.2.8, react-dom 19.2.8, next-intl 4.13.6 (inst 4.13.7), @supabase/ssr 0.12.0, @supabase/supabase-js 2.112.3, gray-matter 4.0.3, lucide-react 1.31.0 (inst 1.33.0), markdown-it 15.0.0, motion 13.1.0 (inst 13.1.1), @sentry/browser 10.65.0 (inst 10.69.0)
- **dev (20):** typescript 5.5.3 (inst 5.9.3), eslint 9.39.4 (inst 9.39.5), eslint-config-next 16.3.1, @tailwindcss/postcss 4.3.2 (inst 4.3.3), tailwindcss 4.3.2 (inst 4.3.3), vitest 4.1.10, @vitest/coverage-v8 4.1.10, playwright 1.61.1 (inst 1.62.1), @testing-library/react 16.3.2 + dom 10.4.1 + jest-dom 7.0.0, jsdom 30.0.1, tsx 4.23.12, prettier 3.9.5, husky 9.1.7, lint-staged 17.0.8, netlify plugin 5.15.12 (inst 5.15.13) etc.
- **Vulns:** `npm audit` 0 total (706 deps). Lock drift: installed > wanted for 9 deps — `npm install` without `package.json` bump.
- **Duplicates:** only @eslint-community/eslint-utils 4.9.1 dupe. `sharp` override unused. `overrides` pins next/postcss/js-yaml/eslint/sharp — blocks major bumps.
- **Outdated (npm outdated):** @sentry 10.69→10.70, jest-dom 7.0.1, plugin-react 6.1.0, vitest 4.1.11, eslint 10.8.1 major, typescript 7.0.2 major.

## 11. State & Data Flow

- **AppProviders Context:** 10 values + 8 actions, hydrated from localStorage/cookies after mount (prevents hydration mismatch), writes back on hydrated+deps change (3 effects). No dedupe/debounce.
- **useProgress:** Decides user ? supabase fetch (lesson_progress+quiz_attempts via Promise.all, picks best quiz score) : AppProviders sets. Mutations: markLessonComplete (optimistic upsert onConflict user_id,lesson_id, side-effects: updateDailyLog, checkAndAwardAchievements, updateStreak, close-to-completion notifications via getPathsForLesson cache) ; saveQuizAttempt (insert, side-effects). Guest migration via useGuestMigration (sessionStorage → supabase on auth).
- **Auth:** Supabase `createBrowserClient` or mock fallback (dev placeholder || isCiPlaceholderSupabase). AuthProvider subscribes onAuthStateChange. `requireAuth` server guard + middleware dashboard redirect (locale-aware, uses sanitizeRedirectPath).
- **Backend touchpoints (7 tables queried):** lesson_progress, quiz_attempts, achievements, streaks, daily_log, notifications, profiles. All RLS `auth.uid()=user_id`. contact_submissions insert via service_role only (013 locked down). Indexes present per migrations 011/012 (user_id, quiz, completed_at, activity_date).

## 12. Configuration

- **tsconfig:** strict true but missing `noUncheckedIndexedAccess`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`, `noUnusedLocals/Params`, `exactOptionalPropertyTypes`. `allowJs true`, `skipLibCheck true`, `target ES2017`, `module esnext`, `bundler` resolution.
- **eslint (flat):** extends next, disables `no-require-imports` + `set-state-in-effect`, ignores e2e/coverage — no `no-console`, no `import-x`, no `jsx-a11y` strict beyond next. 2 warnings in lint (no-sync-scripts, no-img-element).
- **prettier:** semi true, singleQuote false, trailingComma es5, printWidth 110
- **tailwind v4:** darkMode `[data-theme="dark"]`, content `src/components/**/*, src/app/**/*` (misses lib), typography plugin
- **postcss:** `@tailwindcss/postcss` + autoprefixer — correct
- **next.config.mjs (96):** reactStrictMode, turbopack root, allowedDevOrigins 127.0.0.1, images avif/webp, optimizePackageImports lucide-react only, headers: HSTS preload, CSP `default-src 'self'`, script unsafe-inline+sentry+gtag, `unsafe-eval` dev only. Netlify env bridging (SUPABASE_URL/DATABASE_URL/ANON_KEY → public vars). Bundle analyzer gated.
- **netlify.toml:** build `npm run build` publish `.next`, skip_processing, Node 22, headers immutable for _next/static, backup security headers duplicate next.
- **vitest:** plugin react, jsdom, setup matchMedia mock, include `src/**/*.test.*, scripts/**/*.test.*`, coverage include `src/lib/**/*, src/hooks/**/*, src/components/ui/buttonStyles.ts` exclude tests/d.ts — thresholds lines 35% (low). Alias @→src.
- **playwright:** testDir e2e, chromium only, workers 1, retries 2, timeout 60s CI/30s, storageState {hmc_onboarded:true}, webServer dev vs build+start. Visual.spec excluded in CI (snapshot drift).
- **husky:** pre-commit → lint-staged (prettier only) — no eslint/typecheck
- **env:** `.env.example` lists NEXT_PUBLIC_SUPABASE_URL/ANON_KEY, SERVICE_ROLE, SITE_URL, SENTRY_DSN, GA, RESEND. `.env.local` placeholder safe. `.gitignore` ignores `.env*` keep `!.env.example`. `scripts/check-production-env.mjs` enforces SITE_URL not localhost + supabase configured in CI/Netlify (bridges legacy vars). App uses `NEXT_PUBLIC_` only; no zod schema.

## 13. Testing

- **vitest (unit):** 92 files, 629 tests, all pass, `coverage` scoped narrow → 84.43% stmts / 73.1% branch / 88.5% funcs / 87.47% lines (lib/hooks/buttonStyles only). Real app coverage unknown: 288 non-test src files vs 90 test files → ~198 src files without colocated test (all `src/app/**` clients, Header, most components).
- **Strong (>85%):** achievements 96%, dashboard/* 100% except utils, glossary/* ~93%, paths/_, lessons/_, quizzes/quizParser 87%, hooks 89%, buttonStyles 100%, supabase client/server/middleware/env, rateLimit 100% (8 tests), safeHref 100% (6), preferences 73% etc.
- **Weak/zero (risk-ordered):** `auth/useAuthFormState 0%` (57 LOC hook untested, used by login/signup/forgot), `articles/loadArticles 33%` (14-24 uncovered critical), `i18n 46%` (32-53), `localizedContent 44%`, `preferences 73%` (41-47,103 bootstrap), `progressExport 93%` (69-70,76-95), `errorReporting 74%` (123-137 Sentry beforeSend), `mockClient 25%`, `queryBuilder 68%`. Component tests excluded from coverage — 36 exist but narrow.
- **e2e (playwright):** 9 specs (smoke, auth, dashboard, locale-es, polish, flows 11k, audit, audit-local, visual) + setup. Not executed in recon; CI runs after build.
- **Coverage gaps ranked:** P1 auth forms (login/signup/reset), P1 LearnClient filters + LessonPageClient + QuizClient + DashboardClient progress flows, P2 preferences bootstrap, P2 MarkdownRenderer (has test), P2 i18n helpers.
- **Test quality:** good mocks for Supabase (mockClient modular 7 files), proper rtl queries, matchMedia mock. Flaky risk low (workers 1, retries 2). Missing: a11y axe e2e audit specs exist (audit.spec.ts).
- **Debt signals:** lint warns only 2, typecheck passes, npm audit 0, zero TODO/FIXME/HACK in src (grep clean).

## 14. Backend / Supabase

- **Migrations 13:** 001 profiles (handle_new_user trigger) + RLS own; 002 lesson_progress unique(user_id,lesson_id); 003 quiz_attempts; 004 achievements unique(user_id,achievement_id); 005 streaks PK user_id; 006 daily_log unique(user_id,activity_date); 007 notifications + idx user_id/read; 008 contact_submissions (permissive Anyone insert + no select); 009 delete_user() security definer revoke public grant authenticated; 010 updated_at triggers (profiles/lesson_progress/streaks); 011 indexes contact/quiz; 012 additional quiz_user, progress completed_at, daily_log activity_date; 013 DROP Anyone insert → locked to service_role (fixes over-permissive).
- **Queries:** lesson_progress `.select(lesson_id).eq(user_id).eq(completed true)` + paginated lessons via dashboard/progress:133; quiz_attempts `.select(quiz_id,score,max_score,passed).eq(user_id)` + best-score dedupe; achievements/streaks/daily_log/notifications/profiles per dashboard/* files; auth.getUser via server + middleware. No N+1 observed; over-selecting minimal (select only needed columns except progress).
- **Client:** browser via `@supabase/ssr` createBrowserClient or mock; server via createServerClient with cookies getAll/setAll; middleware refresh + guard.

## 15. Assets & i18n Strings

- **public:** favicon.svg 1.3K, og-default.png 499K (heavy), og-image.svg, manifest.json start_url `/en` theme #004349, video poster 29K + mp4 1.3M, stitch mocks
- **messages:** en 863 / es 865 lines parity; nav, accessibility, footer, disclaimer, common, hero, learn, articles, glossary, dashboard etc. No missing keys observed.
- **Hardcoded strings:** Only brand "Health Made Clear" (Header/Footer/Logo i18n-exempt), KeyTakeaway default "Key Takeaway", Input Show/Hide password fallbacks — otherwise via `t()`.

## 16. Git Hotspots

- Last 50: `c36ee760 fix main green (#451)`, dep bumps motion/jsdom/markdown-it/next/supabase/lucide. Churn: package.json 11, package-lock 11, quizParser.test 4, mockClient split 2f134169 etc. No large files in repo. No secrets in history (checked env placeholder only).

## 17. TODO/FIXME/HACK Inventory

- **0 hits in src/** — clean. Only docs/HMC-Launch-Build.md, AUDIT.md mention TODO outside src. `console.log` in src: only logger.ts 4,9,14 (dev-gated) + errorReporting 104/153 (dev/structured) — correct. One drift: `src/lib/dashboard/utils.ts:5` `console.error` direct vs logger/reportServerError.

## 18. `any` / Type Weakness Inventory

- Prod `any`: 1 file `mock/types.ts:6` `options?: any` + `src/app/[locale]/learn/LearnClient.tsx:180` `categoryId as any` + `src/components/dashboard/DashboardSidebar.tsx:35,100` `values?: any` (t overload). Test-only `any` 156 hits isolated. `as any` 90 in tests, 0 in prod scope except LearnClient. `as unknown` prod: mock/auth 4× `as unknown as Session`, mockClient 1× `as unknown as SupabaseClient`, progressExport 1× JSON parse. `@ts-expect-error` 2 in server.test mock mismatch intentional. `eslint-disable` 0 in src.

## 19. Security Notes (inventory only — full audit in Phase 1)

- `sanitizeRedirectPath` :contentReference[oaicite:1]{index=1} used 5 places (auth guards); `isSafeHref` 30 LOC blocks javascript:/control-char/percent-encoded; `errorReporting` scrubs email/phone/SSN/card + sanitizeContext sensitive words; JsonLd serialize-javascript escapes `</script>`; 0 `dangerouslySetInnerHTML`/`eval` in src; CSP strict + HSTS preload; Netlify legacy env bridging; rateLimit last-IP rule prevents spoofing; contact honeypot + RATE_LIMIT 5/10m + origin check hostname-only.

## 20. Known Gaps Flagged for Phase 1

- Type safety: DashboardSidebar any, LearnClient as any, tsconfig strict extras missing
- Tooling: pre-commit only prettier, no knip/dead-export check, coverage narrow, workers 1 chromium only, no .nvmrc
- Perf: images og-default 499K, optimizePackageImports single entry, no bundle budget
- Resilience: 198 src files untested, logQueryError console.error leak, error boundaries sparse, PREFERENCE_BOOTSTRAP_SCRIPT `prefers-color-scheme:dark` missing space (minor)
- UX/A11y: Logo `<img>` vs next/Image, Manual key `index` in 18 maps, Footer h2 landmark minor

---

_Inventory complete — every file enumerated. See Phase 1 Master Plan for prioritized fixes._
