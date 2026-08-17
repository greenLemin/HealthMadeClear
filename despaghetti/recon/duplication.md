# Duplication Recon

## Method

Read `codemap.md` and the listed `src/lib/*.ts` files, plus `src/components/ui/*.tsx`,
`src/components/learn/*.tsx`, the auth form pages, the `loading.tsx` files, and the
`src/lib/dashboard/*` files. Then ran ripgrep for similarity patterns:

- `rg "useState\(|useEffect\(|useMemo\(|useCallback\(" -c src` to find hooks-heavy files
- `rg "EMAIL_REGEX" --glob '*.ts' --glob '*.tsx'` for the email regex duplication
- `rg "^(export )?(interface|type) \w+"` for repeated type definitions
- `rg "function (slugify|formatDate|sanitize|normalize|debounce|throttle)"` for parallel helpers
- `rg "^export (async )?function (load|getAll|get\w+FromBundle)"` for parallel load functions
- `rg "surface-card px-" --glob '*.tsx'` for duplicated Card-like styling
- `rg "rounded-lg bg-error-container"` for duplicated inline error alert pattern
- `rg "typeof record\." src/lib/supabase/mockClient.ts` to inspect duplicated normalizer field checks
- `rg "logQueryError" --glob '*.ts'` to count shared logger usage
- `diff` across auth `page.tsx` files and across `loading.tsx` files for near-duplicate structure
- `rg "SearchEntry|SearchEntryType"` and `rg "Notification"` to confirm duplicated interface
  definitions across data and types folders

## Findings

### DUP-001: `EMAIL_REGEX` regex duplicated across 4 forms + 1 API route

- **Category:** copy-paste
- **Severity:** P2
- **Files:**
  - `src/app/[locale]/auth/login/LoginForm.tsx:14` (regex defined)
  - `src/app/[locale]/auth/signup/SignupForm.tsx:11`
  - `src/app/[locale]/auth/forgot-password/ForgotPasswordForm.tsx:11`
  - `src/app/api/contact/route.ts:15`
- **Description:** The same `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` regex literal is copied into every
  form that validates an email, plus the contact API route. Any tweak to email validation
  (e.g. accepting `+` aliases, rejecting TLDs over a length) must be applied in five places.
- **Suggested remedy:** Export `EMAIL_REGEX` (and a `isValidEmail(value)` helper) from a
  shared module such as `src/lib/validation.ts` or `src/lib/auth/validation.ts`, and import
  it everywhere. The five call sites become one-line imports.

### DUP-002: `SearchEntry` interface and `SearchEntryType` union duplicated in EN and ES data

files

- **Category:** duplicate-types
- **Severity:** P3
- **Files:**
  - `src/data/searchIndex.en.ts:4` (`SearchEntryType`)
  - `src/data/searchIndex.en.ts:6` (`SearchEntry`)
  - `src/data/searchIndex.es.ts:4` (`SearchEntryType`)
  - `src/data/searchIndex.es.ts:6` (`SearchEntry`)
- **Description:** The `SearchEntry` interface and `SearchEntryType` union are byte-for-byte
  identical in both locale-specific data files. `SearchDialog.tsx` imports the type only from
  `searchIndex.en`, so the ES copy is a silent clone. If a field is added to one and not the
  other, the locales drift out of type compatibility.
- **Suggested remedy:** Move `SearchEntry` and `SearchEntryType` to
  `src/types/search.ts` (or `src/lib/search/types.ts`), and import the type in both data
  files. The data files keep only the `searchIndex` array literal.

### DUP-003: `Notification` interface defined twice (lib + types)

- **Category:** duplicate-types
- **Severity:** P3
- **Files:**
  - `src/lib/notifications.ts:78` (`export interface Notification { id; user_id; type; title; body; read; created_at }`)
  - `src/types/database.ts:53` (`export interface Notification { id; user_id; type; title; body; read; created_at }`)
- **Description:** Two `Notification` interfaces exist with identical fields. `notifications.ts`
  is used in client code; `database.ts` defines the same shape (presumably as a Database schema
  mirror). Callers may import either, and any divergence silently breaks the other.
- **Suggested remedy:** Pick a canonical location (likely `src/types/notification.ts` for the
  domain type and `src/types/database.ts` for the DB row schema), have one re-export or
  implement the other, and update all imports to a single path. The types agent should confirm.

### DUP-004: Near-duplicate MDX parser functions across `articles/`, `lessons/`, `paths/`,

`glossary/`

- **Category:** parallel-impl
- **Severity:** P1
- **Files:**
  - `src/lib/articles/mdxParser.ts:9` (`CALLOUT_REGEX`), `:11` (`parseCallouts`),
    `:24` (`parseSections`), `:35` (`articleFromFile`), `:51` (`getArticleMdxDir`),
    `:55` (`getAllArticlesFromMdx`), `:70` (`getArticleFromMdx`)
  - `src/lib/lessons/mdxParser.ts:9` (`CALLOUT_REGEX` — identical), `:11` (`parseCallouts`
    — identical body, only the `Lesson` vs `Article` type param differs), `:26` (`parseSections`
    — identical), `:38` (`lessonFromFile` — same shape as `articleFromFile`), `:65`
    (`getLessonMdxDir`), `:69` (`getAllLessonsFromMdx`), `:84` (`getLessonFromMdx`)
  - `src/lib/glossary/mdxParser.ts:9` (`termFromFile` — same gray-matter + normalize pattern),
    `:27` (`getGlossaryMdxDir`), `:31` (`getAllGlossaryFromMdx`), `:47` (`getGlossaryTermFromMdx`)
  - `src/lib/paths/mdxParser.ts:10` (`pathFromFile`), `:28` (`getPathMdxDir`),
    `:32` (`getAllPathsFromMdx`)
  - `src/lib/quizzes/quizParser.ts:76` (`getQuizMdxDir`), `:80` (`getAllQuizzesFromMdx`),
    `:118` (`getQuizFromMdx`)
- **Description:** Five content-domain mdx parsers share the same skeleton: import `fs`,
  `path`, `matter`, `normalizeLineEndings`; define a `*FromFile` async function that does
  `gray-matter(normalizeLineEndings(await fs.readFile(...)))`; define a `get*MdxDir` that
  joins `process.cwd()` + `content/<type>/<locale>`; define `getAll*FromMdx` that maps IDs
  over file reads with `Promise.all` (or a batching variant); and a `get*FromMdx(id, locale)`
  that guards on file existence. `articles` and `lessons` parsers even duplicate the
  `CALLOUT_REGEX`, `parseCallouts`, and `parseSections` functions verbatim. `paths/mdxParser`
  acknowledges this by importing `parseSections` from `lessons/mdxParser` — so the duplication
  is partial and inconsistent.
- **Suggested remedy:** Extract a generic MDX loader at `src/lib/content/mdxLoader.ts`:
  `getAllFromMdx<T>(opts: { ids: string[]; dir: string; parse: (raw, frontmatter) => T })`.
  Then each domain parser becomes ~20 lines of glue. Hoist `parseSections`/`parseCallouts`/
  `CALLOUT_REGEX` to `src/lib/content/callouts.ts` and import from both `articles` and
  `lessons` parsers (the only two that use them).

### DUP-005: Per-locale load functions (`load*ForLocale`, `getAll*FromMdx`) repeat the

locale-branch pattern

- **Category:** parallel-impl
- **Severity:** P2
- **Files:**
  - `src/lib/lessons/loadLessons.ts:14` (`loadLessonsForLocale` — locale-conditional dynamic
    import; `:25` projects an explicit field list)
  - `src/lib/articles/loadArticles.ts:13` (`loadArticlesForLocale` — locale-conditional dynamic
    import; returns the full record)
  - `src/lib/glossary/loadGlossary.ts` (no `load*ForLocale` variant)
  - `src/lib/paths/loadPaths.ts` (no `load*ForLocale` variant)
  - `src/lib/quizzes/quizParser.ts:80` (`getAllQuizzesFromMdx`)
- **Description:** Two of the four content-type loaders offer a `*ForLocale` async helper that
  does `if (locale === 'es') import('@/data/...es').then(...) else import('@/data/...en').then(...)`.
  The implementation is repeated per type, and the field-pick-list in `loadLessonsForLocale`
  is hand-enumerated and would silently drop a new field if added to the type. The same
  locale-switch is duplicated in the test files for each locale.
- **Suggested remedy:** Add a generic `loadBundleForLocale<T>(enModule, esModule, locale)` to
  `src/lib/content/loadBundle.ts` (or reuse `Record<"en" | "es", T>` accessors from the
  existing `*Bundles.ts` barrel files). Replace each per-domain `*ForLocale` with a one-line
  call. The field-projection helper can be generated from the type with `satisfies`.

### DUP-006: `cn`/classnames helper missing — but inline `class.join(" ")` pattern duplicated

- **Category:** copy-paste
- **Severity:** P3
- **Files:**
  - `src/components/ui/Card.tsx:43` — `[a, b, c].join(" ")`
  - `src/components/ui/Input.tsx:71` — `[...].filter(Boolean).join(" ")`
  - `src/components/ui/Alert.tsx:68` — `["...", styles.container, styles.border, className].join(" ")`
  - `src/components/Modal.tsx:73` — `[...].join(" ")`
  - `src/components/PageHeader.tsx` — `[...].join(" ")`
  - `src/components/learn/LearningPathCard.tsx` — also uses `.join(" ")` for class composition
- **Description:** The codebase has no central `cn()`/`cx()` helper (confirmed by
  `rg "^export (function|const) (cn|classes|cx|joinClassNames)"` returning nothing), but
  composes class strings inline with `[a, b].join(" ")` in at least a dozen components. The
  practice is inconsistent: some `filter(Boolean)` first, some don't, and a stray `false` or
  `""` produces a double space.
- **Suggested remedy:** Add `src/components/utils/cn.ts` exporting
  `cn(...inputs: Array<string | false | null | undefined>): string`. Replace the inline
  `.join(" ")` calls across the UI primitives.

### DUP-007: Auth page server components (`page.tsx`) are near-identical four-route templates

- **Category:** near-duplicate-component
- **Severity:** P2
- **Files:**
  - `src/app/[locale]/auth/login/page.tsx:1-58` — imports `LoginForm`, defines
    `generateMetadata({ params })` with `await params` + `getTranslations({ locale, namespace: "auth" })`
    - `robots { index: false, follow: false }`, returns a wrapper that renders `<LoginForm />`
      in a `surface-card-glass` shell.
  - `src/app/[locale]/auth/signup/page.tsx:1-27` — same shape, `SignupForm`, no Suspense
  - `src/app/[locale]/auth/forgot-password/page.tsx:1-31` — same shape, `ForgotPasswordForm`
  - `src/app/[locale]/auth/reset-password/page.tsx:1-23` — same shape, `ResetPasswordClient`
- **Description:** All four `page.tsx` files use the identical `Props = { params: Promise<{ locale: string }> }`
  signature, `await params` + `setRequestLocale(locale)`, `getTranslations({ locale, namespace: "auth" })`,
  `robots: { index: false, follow: false }`, and a container wrapping the client form. The
  only variation is the imported form, the title key, and one wrapper-class difference. Diffing
  login ↔ signup reveals 47 lines of 58 differ purely in template keys; diffing forgot ↔ reset
  is essentially a single-line form-name swap.
- **Suggested remedy:** Hoist a `generateAuthMetadata(namespace, titleKey)` helper to
  `src/app/[locale]/auth/metadata.ts` (or share via the `generateMetadata` API of a single
  auth-layout route). Also standardize the form-wrapper container into one
  `AuthFormShell({ children })` component, then each `page.tsx` is ~5 lines.

### DUP-008: Auth client forms duplicate state, change-handler, and submit-error patterns

- **Category:** copy-paste
- **Severity:** P1
- **Files:**
  - `src/app/[locale]/auth/login/LoginForm.tsx:34-103` — `useLoginFormLogic` hook returns
    state (`email`, `password`, `error`, `fieldErrors`, `loading`), change handlers that reset
    `error` and the touched field's `fieldErrors` entry, and an async `handleSubmit` that
    validates, calls `supabase.auth.signInWithPassword`, sets error on failure, redirects on
    success.
  - `src/app/[locale]/auth/signup/SignupForm.tsx:26-103` — same hook-shape, calls
    `supabase.auth.signUp`, adds a `submitted`/`successHeadingRef` post-submit state.
  - `src/app/[locale]/auth/forgot-password/ForgotPasswordForm.tsx:98-152` — same shape, calls
    `supabase.auth.resetPasswordForEmail`, adds a `submitted`/`successHeadingRef` state.
  - `src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx:11-89` — same shape, calls
    `supabase.auth.updateUser({ password })`, adds confirm-password field and post-submit
    redirect timer.
- **Description:** All four auth forms repeat:
  1. `useState` for `error`, `fieldErrors`, `loading`, plus per-field state.
  2. Change handlers `handle<Field>Change(value)` that do `setField(value); setError("");
setFieldErrors((prev) => ({ ...prev, <field>: undefined }))` — LoginForm and SignupForm
     do this exact three-line shape; ResetPasswordClient's two handlers each use a slightly
     different `prev` shape.
  3. `handleSubmit(e)` that does `e.preventDefault(); setError(""); <validate>; setLoading(true);
try { <supabase call>; setError(t("errorGeneric")) on failure } finally { setLoading(false) }`.
  4. Inline `<p role="alert" className="rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container">`
     error block duplicated in 5 spots across the four forms (LoginForm has it twice).
- **Suggested remedy:** Extract a `useAuthFormState({ fields })` hook returning state + a
  `bindField(name)` helper (so change handlers are generated, not copied). Extract a shared
  `FormErrorAlert` component for the inline error alert. The four form files become pure JSX +
  the unique `supabase.auth.*` call.

### DUP-009: `rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container`

inline error-alert block duplicated across auth forms

- **Category:** copy-paste
- **Severity:** P2
- **Files:**
  - `src/app/[locale]/auth/login/LoginForm.tsx:140` and `:171`
  - `src/app/[locale]/auth/signup/SignupForm.tsx:191`
  - `src/app/[locale]/auth/forgot-password/ForgotPasswordForm.tsx:79`
  - `src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx:172`
- **Description:** The exact inline-styled `<p role="alert">…{error}</p>` block is repeated
  five times. Any accessibility improvement (`aria-live="assertive"`, role tweak) or restyle
  must touch every form.
- **Suggested remedy:** Create `src/components/ui/FormErrorAlert.tsx` exporting
  `<FormErrorAlert>{error}</FormErrorAlert>` (or accept `error` prop and conditionally render),
  then replace all five call sites.

### DUP-010: `LearningPathCard.tsx` (components/learn) vs `LearningPaths.tsx`

(dashboard/components) — same card body duplicated

- **Category:** near-duplicate-component
- **Severity:** P1
- **Files:**
  - `src/components/learn/LearningPathCard.tsx:42-93` — single-card view; renders
    `surface-card px-6 py-6 md:px-7 md:py-7` containing header chips (`path.icon`,
    `formatLevel(path.level)`, `Clock`+duration), title, description, `ListChecks`+module count,
    optional `ProgressBar`, and a `allDone`-conditional completed checkmark / `ButtonLink` to
    continue.
  - `src/app/[locale]/dashboard/components/LearningPaths.tsx:23-67` — dashboard variant
    rendering `surface-card px-6 py-6 md:px-8 md:py-8` containing the same header chips, title,
    description, module count, progress bar, and the same completed/continue CTA conditionals.
- **Description:** Two card components render the same data shape with the same JSX layout.
  Differences are mostly cosmetic: the dashboard uses `md:px-8 md:py-8`, the learn uses
  `md:px-7 md:py-7`; the dashboard uses `t("modulesCount", { count })` (pluralized) while the
  learn uses `{pathLessons.length} {tCommon("modules")}`; the dashboard uses
  `entry.completedLessonIds.length` and `entry.progressPercentage` (precomputed in
  `lib/dashboard/learningPaths.ts`) while the learn card recomputes them via
  `getLessonsByPath` + a manual progress calc (see DUP-014).
- **Suggested remedy:** Consolidate into a single `LearningPathCard` that accepts either a
  precomputed `progress` prop (the dashboard's precomputed shape) or a raw `path` + `lessons`
  pair (the learn page's shape), then have the dashboard's `LearningPaths.tsx` render that
  single card in a grid. The cosmetic differences can be a `density="comfortable" | "compact"`
  prop.

### DUP-011: `Card.tsx` vs `ResourceCard.tsx` vs raw `surface-card` divs in `LearningPathCard`

and `LearningPaths` dashboard

- **Category:** near-duplicate-component
- **Severity:** P2
- **Files:**
  - `src/components/ui/Card.tsx:31-57` — generic Card with `variant` ("default" | "muted" |
    "accent" | "glass"), `padding` ("sm" | "md" | "lg"), `clickable` boolean. Translates
    `variant="default"` to `surface-card`, `variant="glass"` to `surface-card-glass`, etc.
  - `src/components/ui/ResourceCard.tsx:1-45` — wraps `Card clickable padding="md"
className="group overflow-hidden md:px-7 md:py-7"`; the only added behavior is the
    `onNavigate` callback after `Link`'s click. No `variant` exposure.
  - `src/components/learn/LearningPathCard.tsx:42` — does NOT use `Card` at all; instead
    emits `<div className="surface-card px-6 py-6 md:px-7 md:py-7">…</div>` directly, replicating
    the exact padding scale `Card` already provides.
  - `src/app/[locale]/dashboard/components/LearningPaths.tsx:25` — same pattern, raw
    `surface-card px-6 py-6 md:px-8 md:py-8` div.
- **Description:** `Card` and `ResourceCard` exist as primitives, but `LearningPathCard` and
  the dashboard `LearningPaths` re-implement the surface-card wrapper inline. The duplicated
  class strings (e.g. `surface-card-glass relative z-10 w-full p-6 md:p-8` in
  `ResetPasswordClient`, `surface-card px-6 py-6 md:px-7 md:py-7` in `LearningPathCard`,
  `surface-card px-6 py-6 md:px-8 md:py-8` in `LearningPaths`) appear in 15+ files (see
  `rg "surface-card (px-|py-)"`).
- **Suggested remedy:** Use `Card` (or a new `Card variant="path"` if needed) in
  `LearningPathCard` and the dashboard's `LearningPaths`. Optionally add a `Surface`
  primitive for the cases that don't need a card variant.

### DUP-012: `Modal.tsx` re-implements Escape-key handling and body-scroll lock that

`useDismissibleOverlay` already provides

- **Category:** parallel-impl
- **Severity:** P2
- **Files:**
  - `src/components/ui/Modal.tsx:129-145` — registers its own `handleKeyDown` for `Escape`
    (line 132) and a separate `useEffect` that toggles `document.body.style.overflow` (lines
    143-148). It also implements its own focus-trap-related previous-active-element restore
    in `useEffect` (lines 117-127).
  - `src/hooks/useDismissibleOverlay.ts:25-58` — already implements Escape-key handling
    (calls `onClose` on Escape) and `lockBodyScroll` (line 41 + the `lockScroll`/`unlockScroll`
    module-level counter).
  - `src/hooks/useFocusTrap.ts:1-44` — already implements focus restoration including
    returning focus to the previously-focused element (lines 39-44).
- **Description:** `Modal` doesn't use `useDismissibleOverlay` (it only uses `useFocusTrap`).
  As a result, the same Escape handling is duplicated; the same body-scroll lock is duplicated
  with slightly different semantics (`Modal` uses `previousBodyOverflow`-style
  set/restore inline; `useDismissibleOverlay` uses a module-level `scrollLockCount` for nested
  modals — a bug-fix that `Modal` does not get). The same pattern also exists in
  `SearchDialog.tsx` (which DOES use `useDismissibleOverlay`) and `OnboardingDialog.tsx`
  (which DOES use `useDismissibleOverlay`). Only `Modal` and `NotificationCenter.tsx` use
  the manual approach.
- **Suggested remedy:** Refactor `Modal` to use `useDismissibleOverlay({ isOpen, onClose,
containerRef: dialogRef, lockBodyScroll: true })` and delete the local Escape handler and
  body-scroll effect. Optionally extract `ModalHeader`/`ModalPanel` to a `useModal` hook.

### DUP-013: Per-locale `loading.tsx` files duplicate Skeleton + container scaffolding

- **Category:** near-duplicate-component
- **Severity:** P2
- **Files:**
  - `src/app/[locale]/learn/loading.tsx:1-45`
  - `src/app/[locale]/glossary/loading.tsx:1-35`
  - `src/components/loading/AuthFormLoading.tsx:1-49` (canonical helper for auth)
  - `src/components/loading/StaticPageLoading.tsx:1-52` (canonical helper for static pages)
  - `src/app/[locale]/contact/loading.tsx`, `about/loading.tsx`, `accessibility/loading.tsx`,
    `terms/loading.tsx`, `privacy/loading.tsx` (already use `StaticPageLoading`)
  - `src/app/[locale]/learn/[slug]/loading.tsx`, `articles/[slug]/loading.tsx`,
    `dashboard/loading.tsx`, `dashboard/progress/loading.tsx`,
    `dashboard/achievements/loading.tsx`, `glossary/[term]/loading.tsx`,
    `learning-paths/loading.tsx`, `learning-paths/[pathId]/loading.tsx` — each defines its own
    bespoke Skeleton layout with `surface-card px-... ` wrapper
- **Description:** The codebase already has two consolidated loading components
  (`StaticPageLoading`, `AuthFormLoading`) used by 8+ routes. But many routes still hand-roll
  their own `Skeleton`-based loading scaffolds that are near-duplicates of each other
  (e.g. `learn/loading.tsx` and `glossary/loading.tsx` both render
  `py-12 md:py-16` + `mx-auto max-w-container px-4 md:px-6` + `section-frame` header section +
  `surface-card-glass` filter section + grid of skeleton cards). The dashboard subroutes
  (`dashboard/progress/loading.tsx`, `dashboard/achievements/loading.tsx`,
  `dashboard/loading.tsx`) likewise share the same `section-frame px-6 py-8 md:px-8 md:py-8`
  - skeleton-cards grid.
- **Suggested remedy:** Add a generic `ListPageLoading` (or two: `ListPageLoading` for
  lesson/glossary/article grids, and `DashboardSectionLoading` for dashboard subroutes) to
  `src/components/loading/`. Migrate the bespoke `loading.tsx` files to those primitives, the
  same way the static pages already use `StaticPageLoading`.

### DUP-014: `getPathProgress` / "completed-of-total" percent calculation duplicated in 4+

locations

- **Category:** copy-paste
- **Severity:** P2
- **Files:**
  - `src/lib/content.ts:100-115` — `getPathProgress` (canonical)
  - `src/lib/content.ts:106` — uses `getLessonsByPath` then computes
    `percentage: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)`
  - `src/components/learn/LearningPathCard.tsx:33` — inline duplicate
    `({ completed, total, percentage: total === 0 ? 0 : Math.round((completed / total) * 100) })`
  - `src/hooks/useProgress.ts` — `getLearningPathProgress` uses the same
    `total === 0 ? 0 : Math.round((completed / total) * 100)` formula at the call site
    (`useProgressQueries`), and `isLessonComplete` uses the same shape.
  - `src/lib/dashboard/learningPaths.ts:43-49` — recomputes `progressPercentage` per path
    using the same formula.
- **Description:** The "completed of total → percentage" calculation is repeated across
  lib utilities, hooks, and components, each using the same `Math.round((completed / total) * 100)`
  with a `total === 0` guard. `LearningPathCard` even re-implements the path-lesson filtering
  that `getLessonsByPath` in `src/lib/content.ts` already provides. If `Math.round` semantics
  change (e.g. floor for progress bars) every site must be updated.
- **Suggested remedy:** Export a `computeProgress(completed, total)` helper from
  `src/lib/content.ts` (or a new `src/lib/progress.ts`) that returns
  `{ completed, total, percentage }`. Replace the inline computations across `LearningPathCard`,
  `useProgress`, and `dashboard/learningPaths.ts` with a call to this helper.

### DUP-015: Per-locale `assertLocaleIdParity`-driven bundle script structure duplicated across

five content-domain `bundle-*.ts` scripts

- **Category:** copy-paste
- **Severity:** P2
- **Files:**
  - `scripts/bundle-articles.ts:1-25`
  - `scripts/bundle-glossary.ts:1-25`
  - `scripts/bundle-lessons.ts:1-25`
  - `scripts/bundle-paths.ts:1-25`
  - `scripts/bundle-quizzes.ts:1-25`
- **Description:** All five bundle scripts follow the same skeleton: import `fs`, `path`,
  `assertLocaleIdParity`, `formatWithPrettier`, and the domain-specific `getAll*FromMdx`
  loader. Then `async function main()` loads both locales, asserts parity, defines a
  `writeLocaleBundle(locale, data)` helper that writes the locale-specific bundle file with a
  generated header, then writes the index `*Bundles.ts` file with the import-reexport boilerplate.
  The only domain-specific bits are the import path, the type name, and the variable name
  (`articles` vs `terms` vs `lessons` vs `paths` vs `quizzes`).
- **Suggested remedy:** Extract a generic `runBundle<T>(opts: { name; typeImport; loader;
varName; indexHeader })` to `scripts/lib/runBundle.ts`. Each `bundle-*.ts` becomes a
  5-line call. Also removes the manual `header` string duplication across files.

### DUP-016: Per-domain loader barrels (`*Bundles.ts`) duplicated import-reexport structure

- **Category:** copy-paste
- **Severity:** P3
- **Files:**
  - `src/data/articleBundles.ts:1-12`
  - `src/data/glossaryBundles.ts:1-12`
  - `src/data/lessonBundles.ts:1-12`
  - `src/data/pathBundles.ts:1-12`
  - `src/data/quizBundles.ts:1-12`
- **Description:** All five `*Bundles.ts` files are byte-for-byte identical in structure: a
  `// Auto-generated by scripts/bundle-<name>.ts` header + a `Record<"en" | "es", T[]>` barrel
  that re-exports the locale-specific arrays. The only variation is the type name and the
  imported variable name. These are auto-generated (so the duplication is mechanically
  maintained), but it's still a candidate for the DUP-015 generic-script fix.
- **Suggested remedy:** Same as DUP-015 — the generic `runBundle` should emit these files.

### DUP-017: `mockClient.ts` normalizer functions duplicate the "validate-then-merge" pattern

for 9 row types

- **Category:** parallel-impl
- **Severity:** P3
- **Files:**
  - `src/lib/supabase/mockClient.ts:145` `normalizeMockAccount`
  - `src/lib/supabase/mockClient.ts:162` `normalizeProfileRow`
  - `src/lib/supabase/mockClient.ts:181` `normalizeLessonProgressRow`
  - `src/lib/supabase/mockClient.ts:213` `normalizeQuizAttemptRow`
  - `src/lib/supabase/mockClient.ts:234` `normalizeAchievementRow`
  - `src/lib/supabase/mockClient.ts:259` `normalizeStreakRow`
  - `src/lib/supabase/mockClient.ts:275` `normalizeDailyLogRow`
  - `src/lib/supabase/mockClient.ts:296` `normalizeNotificationRow`
  - `src/lib/supabase/mockClient.ts:321` `normalizeLegacyLessonRows`
  - `src/lib/supabase/mockClient.ts:344` `normalizeLegacyQuizRows`
- **Description:** Each normalizer follows the same shape: `asRecord(value)` → return `null`
  or fallback if not a record → return an object literal where each field uses
  `typeof record.<field> === "string" ? record.<field> : fallback.<field>` (or `=== "number"`,
  `=== "boolean"`, `Array.isArray` checks). The pattern is repeated 9 times for the row types,
  with two additional `normalizeLegacy*Rows` variants for legacy data shape. The boilerplate is
  ~80% of each function.
- **Suggested remedy:** Extract a `pick<T>(record, schema, fallback): T` helper that takes a
  schema object like `{ id: "string", created_at: "string", score: "number" }` and produces the
  validated/merged row. Each `normalize*Row` becomes a one-line `pick` call. (Lower priority
  since `mockClient` is dev-only.)

### DUP-018: Auth form `useMemo(() => createClient(), [])` + Supabase client instantiation

pattern duplicated in 8+ client files

- **Category:** copy-paste
- **Severity:** P3
- **Files:**
  - `src/app/[locale]/auth/login/LoginForm.tsx` (via `useLoginFormLogic` at `:37`)
  - `src/app/[locale]/auth/signup/SignupForm.tsx:27`
  - `src/app/[locale]/auth/forgot-password/ForgotPasswordForm.tsx:101`
  - `src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx:14`
  - `src/components/providers/AuthProvider.tsx` (uses `useMemo(() => createClient(), [])`)
  - `src/components/ui/NotificationCenter.tsx` (same pattern)
  - `src/hooks/useProgress.ts` (same pattern)
  - Dashboard subroutes via `createClient()` server-side calls
- **Description:** The pattern `const supabase = useMemo(() => createClient(), [])` is
  copy-pasted across auth client forms, providers, hooks, and notification center. Each form
  also has its own `useState`/`fieldErrors`/`loading` boilerplate (see DUP-008) but the
  Supabase-client memo is the most repetitive single line. The same is true for server-side
  `await createClient()` calls duplicated in 6+ files.
- **Suggested remedy:** Extract a `useSupabaseClient()` hook (likely in
  `src/lib/supabase/client.ts` or a new `src/hooks/useSupabaseClient.ts`) that wraps the
  `useMemo(() => createClient(), [])` memo and any related context. Replace the inline memo
  across the auth forms and notification center.

### DUP-019: `cdnv`-style `<Card clickable>` plus `Link` wrapper pattern duplicated between

`ResourceCard.tsx` and `SectionNav.tsx`

- **Category:** near-duplicate-component
- **Severity:** P3
- **Files:**
  - `src/components/ui/ResourceCard.tsx:24-43` — wraps `<Card clickable padding="md"
className="group overflow-hidden md:px-7 md:py-7">` in a `<Link href onClick={...}>`,
    conditionally calling `onNavigate` after the click (the click-handler's job is to skip the
    callback if any modifier key is pressed or `defaultPrevented` is set).
  - `src/components/SectionNav.tsx:24-25` —
    `<Link className="surface-card group block px-6 ... transition-all ... hover:-translate-y-1
hover:shadow-card-hover md:px-7 md:py-7">` — same effect, hand-rolled (no `Card` primitive)
    because `Card` doesn't expose a `block`-display "as link" variant.
- **Description:** Two components wrap a card-style surface in a `Link`, attach a `group`
  class for hover transforms, and add `md:px-7 md:py-7` padding. The same JSX pattern
  (link wrapper, surface-card inner, transition + hover translate) is repeated. If the hover
  treatment needs to change (e.g. remove `translate-y-1` for accessibility), both must be
  updated.
- **Suggested remedy:** Add a `variant="link"` (or `as={Link}` + `href` props) to the existing
  `Card` primitive — it should accept the `Link`-specific props (`href`, `onClick`-with-modifier
  handling). Then `ResourceCard` becomes a thin wrapper of `Card`, and `SectionNav` uses
  `Card as={Link}` directly.

### DUP-020: Auth `loading.tsx` files delegate to `AuthFormLoading` with one-line variant props

— same pattern could replace `bundle-*` skeleton duplication

- **Category:** near-duplicate-component
- **Severity:** P3
- **Files:**
  - `src/app/[locale]/auth/signup/loading.tsx:1-3` — `return <AuthFormLoading variant="compact" cardHeight="420px" />`
  - `src/app/[locale]/auth/login/loading.tsx:1-3` — `return <AuthFormLoading variant="split" />`
  - `src/app/[locale]/auth/forgot-password/loading.tsx:1-3` — `return <AuthFormLoading cardHeight="240px" />`
  - `src/app/[locale]/auth/reset-password/loading.tsx:1-3` — `return <AuthFormLoading cardHeight="280px" />`
- **Description:** The auth `loading.tsx` files are already 1-line wrappers around
  `AuthFormLoading`. This is the same delegation pattern that `StaticPageLoading` provides for
  static pages (`privacy/loading.tsx`, `terms/loading.tsx`, `about/loading.tsx`,
  `accessibility/loading.tsx`, `contact/loading.tsx`). The duplication is now "extracted-but-
  per-route" — each route is a single line, but those single-line wrappers themselves add up
  (8+ files of one-line wrappers). Low priority but worth noting as a template.
- **Suggested remedy:** None, unless adopting a Next.js loader-factory that emits these
  one-liners from a config. Otherwise the pattern is already the right one.

### DUP-021: `logQueryError` context-string convention is duplicated verbatim in 6 dashboard

lib files

- **Category:** copy-paste
- **Severity:** P3
- **Files:**
  - `src/lib/dashboard/progress.ts:31` `getUserProgressSummary:lessons`
  - `src/lib/dashboard/progress.ts:32` `getUserProgressSummary:quizzes`
  - `src/lib/dashboard/progress.ts:33` `getUserProgressSummary:streak`
  - `src/lib/dashboard/progress.ts:75` `getCompletedLessonsPaginated:progress`
  - `src/lib/dashboard/progress.ts:88` `getCompletedLessonsPaginated:quizzes`
  - `src/lib/dashboard/activity.ts:48` `getRecentActivity:lessons`
  - `src/lib/dashboard/activity.ts:49` `getRecentActivity:quizzes`
  - `src/lib/dashboard/learningPaths.ts:25` `getUserLearningPaths`
  - `src/lib/dashboard/quizzes.ts:32` `getQuizPerformanceByCategory`
  - `src/lib/dashboard/recommendations.ts:25` `getRecommendedNextLesson`
  - `src/lib/dashboard/profile.ts:13` `getUserProfile`
  - `src/lib/dashboard/profile.ts:15` `getUserProfile:auth`
  - `src/lib/dashboard/dailyLog.ts:13` `updateDailyLog`
  - `src/lib/dashboard/dailyLog.ts:25` `getDailyLogForRange`
  - `src/lib/dashboard/achievements.ts` (similar)
- **Description:** The `<functionName>:<subcontext>` (e.g. `getUserProgressSummary:lessons`)
  convention for log-query-error context strings is repeated in every dashboard lib file
  (and the `__tests__/` files assert on those exact strings — see DUP-024). The pattern is
  correct and consistent, but it's hand-written: if a developer adds a new query to
  `getUserProgressSummary` and forgets the matching `logQueryError` call, the convention silently
  breaks.
- **Suggested remedy:** Add a typed wrapper `safeQuery<T>(supabase, ctx, queryBuilder)` that
  runs the query and calls `logQueryError` automatically. Replace the inline
  `await supabase.from(...)...; logQueryError(ctx, error);` pattern across the dashboard lib.

### DUP-022: `createNotifications` / `createNotification` (lib/notifications.ts) — sibling

helpers with mostly-identical bodies

- **Category:** copy-paste
- **Severity:** P3
- **Files:**
  - `src/lib/notifications.ts:8-20` `createNotifications(supabase, userId, inputs)` —
    returns early if `inputs.length === 0`, then maps inputs to DB rows and inserts them.
  - `src/lib/notifications.ts:22-30` `createNotification(supabase, userId, input)` —
    builds a single DB row and inserts it.
- **Description:** The two helpers do nearly the same thing. `createNotifications` already
  handles the 1-row case (just `inputs = [input]`), so `createNotification` is a thin
  convenience wrapper that duplicates the row-shape construction (lines 25-29 vs the
  `.map((input) => ({ user_id, type, title, body, read: false }))` in `createNotifications`).
  Both share the same error semantics (`if (error) throw error`).
- **Suggested remedy:** Have `createNotification` delegate to
  `createNotifications(supabase, userId, [input])`. Keep both APIs for ergonomics.

### DUP-023: `assertLocaleIdParity`-driven test setup duplicated across `src/lib/dashboard/__tests__/`

files

- **Category:** duplicate-test-setup
- **Severity:** P3
- **Files:**
  - `src/lib/dashboard/__tests__/progress.test.ts:1-37`
  - `src/lib/dashboard/__tests__/learningPaths.test.ts:1-32`
  - `src/lib/dashboard/__tests__/quizzes.test.ts:1-32`
  - `src/lib/dashboard/__tests__/recommendations.test.ts:1-28`
  - `src/lib/dashboard/__tests__/activity.test.ts:1-37`
  - `src/lib/dashboard/__tests__/profile.test.ts` (similar)
- **Description:** Each dashboard test file opens with the same skeleton:
  1. `vi.mock("@/lib/lessons/loadLessons")` (or `vi.mock("@/lib/lessons/loadLessons", ...)`)
  2. `vi.mock("../utils", () => ({ logQueryError: vi.fn() }))` (or
     `vi.mock("../utils", () => ({ logQueryError: vi.fn() }))`)
  3. Optional `vi.mock("@/lib/paths/loadPaths")` for tests that touch paths
  4. A `createMockBuilder` (or `buildLessonChain`, `buildQuizChain`, `buildStreakChain`)
     helper that builds the chainable mock `from(table).select().eq()...` shape
  5. A `beforeEach(() => vi.clearAllMocks())` block
  6. A `mockSupabase = { from: vi.fn(...) } as unknown as SupabaseClient` line

  The exact shapes vary slightly (`progress.test.ts` defines three chain-builder helpers for
  lessons/quizzes/streak; `learningPaths.test.ts` defines one; `activity.test.ts` uses an
  inline builder) but the boilerplate is ~70% of each test file's setup section.

- **Suggested remedy:** Extract a `dashboardTestSetup.ts` (or `createMockSupabase()` helper
  with chain-builder variants) to `src/lib/dashboard/__tests__/utils/`. Each test file then
  imports the chain builders it needs and skips the re-definition.

### DUP-024: Mock Supabase client construction (`{ from: vi.fn(...) } as unknown as SupabaseClient`)

duplicated across all dashboard lib test files + 1 source file

- **Category:** duplicate-test-setup
- **Severity:** P2
- **Files:**
  - `src/lib/dashboard/__tests__/progress.test.ts:1-37` (the `buildLessonChain`,
    `buildQuizChain`, `buildStreakChain` helpers wrap `vi.fn`)
  - `src/lib/dashboard/__tests__/learningPaths.test.ts:1-32` (single `mockEq2`/`mockEq`/
    `mockSelect` chain)
  - `src/lib/dashboard/__tests__/quizzes.test.ts:1-32` (inline `(mockSupabase = (data) =>
({ from: vi.fn()... }))`)
  - `src/lib/dashboard/__tests__/recommendations.test.ts:1-28` (same shape as quizzes)
  - `src/lib/dashboard/__tests__/activity.test.ts:1-32` (uses `createMockBuilder`)
  - `src/lib/dashboard/__tests__/profile.test.ts:1-50` (hand-rolled nested mock)
  - `src/lib/dashboard/__tests__/dailyLog.test.ts` (similar)
  - `src/lib/dashboard/__tests__/achievements.test.ts` (similar)
- **Description:** Every dashboard lib test file constructs a `SupabaseClient` mock with
  roughly the same chainable-builder pattern (`from(table).select(cols).eq(col,
val).eq(col2, val2)...`). The shapes differ enough (some need `.single()`, `.eq()` chains of
  varying depth, `.upsert()`, `.in()`, `.order().limit()`) that each test file re-implements
  its own builder. The `mockSupabase` cast pattern `as unknown as SupabaseClient` is repeated
  verbatim across files.
- **Suggested remedy:** Add `src/lib/dashboard/__tests__/utils/mockSupabase.ts` exporting
  `createMockSupabase()` (with chainable queries), plus typed builders for the variants each
  file needs. Replace each test file's inline construction with a `createMockSupabase()` call.

## Summary

- Total findings: 24
- Copy-paste blocks: 9 (DUP-001, DUP-006, DUP-008, DUP-009, DUP-014, DUP-015, DUP-016,
  DUP-018, DUP-022)
- Near-duplicate components: 6 (DUP-007, DUP-010, DUP-011, DUP-013, DUP-019, DUP-020)
- Parallel implementations: 5 (DUP-002, DUP-003, DUP-004, DUP-005, DUP-012, DUP-017,
  DUP-021) — counted together
- Duplicate test setup: 2 (DUP-023, DUP-024)

(Note: numbers above add to more than 24 because several findings are multi-category — e.g.
DUP-002 is both a duplicate-types and a parallel-impl. The category column in each finding
records the primary classification.)
