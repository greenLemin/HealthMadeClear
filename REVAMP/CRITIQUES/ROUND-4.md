# HealthMadeClear Launch Revamp — Panel Critique: Round 4

**Document Under Review:** `REVAMP/PLAN.v4.md` (2026-08-27)  
**Review Panel:** Staff Engineer, Security Engineer, UX Lead, Clinical Content Reviewer (PharmD), Ruthless Project Manager  
**Objective:** Fourth-round adversarial evaluation to break Implementation Plan v4, expose hidden parameter omissions in mutation pipelines, static message catalog bundle leaks, shared-device storage retention on account deletion, accessible name drop at 1280px, pediatric clinical safety gaps, and deployment ordering deadlocks.

---

## CRITIC 1 — Staff Engineer

_Focus: Feasibility, hidden complexity, framework/DB behavior, invalid technical assumptions._

### 1. 🔴 Phase 7 (§10.1) & Phase 6 (§9.1) — `handleQuizAttemptSideEffects` Omits `locale` Parameter, Breaking Localized Achievement Toasts & Notifications

- **Target Section:** Phase 7 — §10.1 Scope (`sideEffects.ts`, `mutations.ts`) & Phase 6 — §9.1 Scope.
- **Problem:** In `src/hooks/useProgress/mutations.ts` (line 100):
  ```ts
  await handleQuizAttemptSideEffects(
    supabase,
    user.id,
    lessonId,
    score,
    maxScore,
    passed,
    allCompleted,
    showToast
  );
  ```
  `useProgressMutations` receives `locale: string` (line 26), but `locale` is forwarded **only** to `handleLessonCompletionSideEffects` (line 57). It is **not** passed to `handleQuizAttemptSideEffects`.
  In `src/hooks/useProgress/sideEffects.ts` (line 69), `handleQuizAttemptSideEffects`'s signature has no `locale` parameter:
  ```ts
  export async function handleQuizAttemptSideEffects(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    lessonId: string,
    score: number,
    maxScore: number,
    passed: boolean,
    completedIdsAfter: string[],
    showToast: Callback
  );
  ```
  Phase 7 (§10.1) specifies: _"Toast via `getLocalizedAchievement(id, locale)`"_. Without `locale` passed into `handleQuizAttemptSideEffects`, any achievement triggered by completing a quiz (such as `first-quiz-pass` or `perfect-quiz`) will have `locale === undefined`. Calling `getLocalizedAchievement(id, undefined as any)` fails type-checking or falls back to English, producing hardcoded English toasts and unlocalized notification records for Spanish users.
- **Suggested Fix:**
  1. In `src/hooks/useProgress/sideEffects.ts`, update `handleQuizAttemptSideEffects` signature to accept `locale: string`.
  2. In `src/hooks/useProgress/mutations.ts`, pass `locale` in the `handleQuizAttemptSideEffects` call at line 100.
  3. In `sideEffects.ts`, pass `locale` to `getLocalizedAchievement` for quiz-triggered achievements.

---

### 2. 🔴 Phase 7 (§10.1) vs Phase 14 (§17.1) — Client Bundle Bloat via Static `getMessages` in `achievements.ts`

- **Target Section:** Phase 7 — §10.1 Scope (`achievements.ts`, `sideEffects.ts`) vs Phase 14 — §17.1 Scope.
- **Problem:** In `src/lib/achievements.ts` (lines 70–78):
  ```ts
  export function getLocalizedAchievement(id: AchievementId, locale: Locale) {
    const items = getMessages(locale).achievements.items as Record<string, ...>;
    // ...
  }
  ```
  `getMessages` in `src/lib/i18n.ts` statically imports **both** `en.json` (43KB) and `es.json` (45KB):
  ```ts
  import en from "@/messages/en.json";
  import es from "@/messages/es.json";
  const messages: Record<Locale, Messages> = { en, es };
  ```
  When `sideEffects.ts` (invoked inside client-side `useProgressMutations`) imports `getLocalizedAchievement` from `@/lib/achievements`, `@/lib/i18n.ts` is pulled directly into the client component graph.
  This forces every client page loading `useProgress` to synchronously parse both full English and Spanish JSON catalogs, directly violating Phase 14's core objective of preventing cross-locale bundle leakage in the client graph.
- **Suggested Fix:**
  In `achievements.ts` and `sideEffects.ts`, do not call static `getMessages(locale)` from `@/lib/i18n`. Instead:
  - Pass the active locale translation function `t` from `useTranslations("achievements")` at the React hook layer (`useProgressMutations`) into `sideEffects.ts`, OR
  - Dynamically load the achievement messages per locale, keeping `@/lib/i18n` out of client utility imports.

---

### 3. 🟡 Phase 12 (§15.1, §15.2) — `useVisitPlanner` Dynamic Defaults vs Hydration Re-trigger Loop

- **Target Section:** Phase 12 — §15.1 Scope (`useVisitPlanner.ts`, `VisitPlannerClient.tsx`) & §15.2 Scheme.
- **Problem:** `useVisitPlanner.ts` takes `defaultQuestions: string[]` as an argument and serializes it to `defaultQuestionsStr` in a `useEffect` dependency array (line 118).
  If `VisitPlannerClient` passes `PLANNER_DEFAULTS_BY_TYPE[visitType]` dynamically as `defaultQuestions`, and `localStorage` contains a saved state with a different `visitType` (e.g. `"medication"`), the initial mount passes `"new-symptom"` defaults, then hydrates `"medication"`, updating `visitType`, which passes new `defaultQuestions`, re-triggering the mount effect.
- **Suggested Fix:**
  Define `PLANNER_DEFAULTS_BY_TYPE` directly inside `useVisitPlanner.ts`.
  Let `useVisitPlanner()` initialize defaults internally from `visitType`. Make `changeVisitType(nextType)` look up `PLANNER_DEFAULTS_BY_TYPE[nextType]` inside the hook without requiring the parent component to pass dynamic default question arrays.

---

### 4. 🟡 Phase 1 (§4.3 Step A.3) — `handle_new_user` POSIX Regex Control Character Stripping vs Nullable Profile Fields

- **Target Section:** Phase 1 — §4.3 Step A.3 (`014_launch_reconcile.sql`).
- **Problem:** In Postgres, `regexp_replace(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '[[:cntrl:]]', '', 'g')` returns `''` for strings containing only control characters or spaces. `nullif('', '')` produces `NULL`.
  If a user signs up with a display name consisting only of whitespace/newlines, `profiles.display_name` is set to `NULL`.
- **Suggested Fix:** Confirm in `profiles` UI consumers that `profile.display_name ?? user.email?.split('@')[0] ?? t("guestUser")` handles `display_name === null` gracefully across all dashboard and header components.

---

## CRITIC 2 — Security Engineer

_Focus: RLS, auth, injection, privacy of health-adjacent data, rate limiting._

### 1. 🔴 Phase 9 (§12.1) & Phase 5 (§8.1) — Account Deletion Leaves Unwiped Health Progress & Glossary Lookups in `localStorage`

- **Target Section:** Phase 9 — §12.1 Scope (`SettingsClient.tsx`) & Phase 5 — §8.1 Scope (`guestProgress.ts`).
- **Problem:** In Phase 9 §12.1, when account deletion succeeds via `rpc("delete_user")`, `SettingsClient.tsx` runs:

  ```ts
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    /* ignore */
  } finally {
    clearGuestProgress();
    router.push("/");
    toast(accountDeleted);
  }
  ```

  `clearGuestProgress()` (in `src/lib/guestProgress.ts`) ONLY removes the keys `hmc_guest_completedLessons` and `hmc_guest_quizAttempts`.
  It **does not remove**:
  - `STORAGE_KEYS.completedLessons` (`hmc-completed-lessons`)
  - `STORAGE_KEYS.quizScores` (`hmc-quiz-scores`)
  - `STORAGE_KEYS.recentLessons` (`hmc-recent-lessons`)
  - `hmc-glossary-lookups`
  - `STORAGE_KEYS.visitPlanner` / `hmc-visit-planner-v2`

  When a user deletes their account on a shared computer (e.g. library, clinic tablet, kiosk), all their completed sensitive health topics (e.g., HIV, depression, prescription labels, contraception), quiz scores, and saved doctor visit questions remain stored in browser `localStorage`. Any subsequent user on that device immediately sees the deleted user's health education history in the UI.

- **Suggested Fix:**
  In `SettingsClient.tsx` (and in a dedicated `clearAllLocalHealthData()` utility), wipe all health-adjacent `localStorage` keys upon account deletion:
  ```ts
  localStorage.removeItem("hmc-completed-lessons");
  localStorage.removeItem("hmc-quiz-scores");
  localStorage.removeItem("hmc-recent-lessons");
  localStorage.removeItem("hmc-glossary-lookups");
  localStorage.removeItem("hmc-visit-planner-v2");
  localStorage.removeItem("hmc-visit-planner");
  clearGuestProgress();
  ```

---

### 2. 🟡 Phase 3 (§6.1) — `/api/contact` Payload Size Validation Vulnerable to Streamed Body Bypass Before `request.json()`

- **Target Section:** Phase 3 — §6.1 Scope (`src/app/api/contact/route.ts`).
- **Problem:** The plan states: _"reject body over ~10KB before `request.json()` (read `Content-Length` if present; if absent, cap parsed JSON `JSON.stringify(body).length` after parse and 413)."_
  If an attacker sends a chunked transfer request (`Transfer-Encoding: chunked`) without a `Content-Length` header containing a 50MB payload, `await request.json()` will read and parse the entire 50MB string into Node.js/Edge isolate memory before `JSON.stringify(body).length` is evaluated.
- **Suggested Fix:**
  In `route.ts`, enforce a strict byte limit on the incoming `request.body` stream using a reader or slice before executing `request.json()`, rejecting immediately if read bytes exceed 10KB.

---

### 3. 🟡 Phase 16 (§19.1) — Sentry Breadcrumbs & URL Scrubbing Misses Hash Fragments (`#`) Containing Tokens or Anchors

- **Target Section:** Phase 16 — §19.1 Scope (`src/lib/errorReporting.ts`).
- **Problem:** Phase 16 strips query strings (`?…`) from `event.request.url` and breadcrumb URLs. In client-side SPA routing, sensitive fragments (such as `#access_token=...`, `#code=...`, or specific private anchor names) appear after `#`.
- **Suggested Fix:**
  In `errorReporting.ts` `beforeSend`, sanitize URLs by removing both search query parameters (`?`) and hash fragments (`#`).

---

## CRITIC 3 — UX Lead

_Focus: Visual polish, responsive viewports, contrast, layout stability, first-time user perception._

### 1. 🔴 Phase 10 (§13.1) — Header Login Button Text Hidden at `xl` (1280px) Leaves Unlabeled Icon-Only Button

- **Target Section:** Phase 10 — §13.1 Scope (`Header.tsx`).
- **Problem:** Phase 10 specifies:
  _"login `ButtonLink` icon-only at `xl` (text `2xl:inline` / `xl:hidden` on the label)..."_
  Between 1280px and 1535px (`xl` breakpoint, covering standard 13" MacBook Pro displays), the login `ButtonLink` hides its text label and displays only the Lucide user icon.
  If the `ButtonLink` lacks an explicit `aria-label={t("nav.login")}`, the accessible name calculation for the link becomes empty `""`, causing an immediate WCAG 2.1 AA violation (4.1.2 Name, Role, Value).
  Furthermore, first-time desktop visitors at 1280–1440px will see 8 text navigation links followed by a bare, cryptic icon without text explanation.
- **Suggested Fix:**
  1. Ensure `ButtonLink` in `Header.tsx` includes `aria-label={t("nav.login")}` when label text is hidden.
  2. For visual clarity on desktop `xl` (1280px–1535px), retain compact text (e.g. `text-label-sm px-2.5`) or a clear tooltip rather than an unlabelled bare icon.

---

### 2. 🟡 Phase 13 (§16.1) — Article Desktop Sticky TOC Missing Active Scroll-Spy Highlighting

- **Target Section:** Phase 13 — §16.1 Scope (`ArticlePageClient.tsx`, Mini-spec §10.7).
- **Problem:** Phase 13 adds a desktop sticky TOC (`position: sticky top-24`) that renders anchor links to `#section-slug`.
  However, the specification does not include active section tracking (scroll-spy). On long articles (1,500+ words), a static sticky TOC gives the reader no visual feedback as to which section they are currently reading.
- **Suggested Fix:**
  Add a lightweight `IntersectionObserver` to `ArticlePageClient.tsx` that observes `<section>` / `<h2>` headings and applies `text-primary font-bold border-l-2 border-primary` to the currently active TOC link.

---

### 3. 🟡 Phase 11 (§14.1) — Mobile Glossary A-Z Snap Carousel Lacks Overflow Affordance Indicator

- **Target Section:** Phase 11 — §14.1 Scope (`GlossaryClient.tsx`).
- **Problem:** Phase 11 changes mobile Glossary A-Z to `flex flex-nowrap overflow-x-auto snap-x snap-mandatory scrollbar-none`.
  On a 390px viewport, letters A through G fill the screen width. If letter G aligns near the right screen boundary, users have no visual indication that letters H through Z are scrollable off-screen.
- **Suggested Fix:**
  Add a subtle right-edge CSS fade mask (`mask-image: linear-gradient(to right, black 85%, transparent 100%)`) or scroll indicator gradient on the mobile A-Z letter container.

---

## CRITIC 4 — Clinical Content Reviewer (PharmD Persona)

_Focus: Medical accuracy, health literacy, disclaimers, triage liability, patient safety._

### 1. 🔴 Phase 4 (§7.2) — Care Guide "Home Care" Checklist Lacks Explicit Pediatric Dehydration & Infant Fever Disclaimers

- **Target Section:** Phase 4 — §7.2 Care-guide copy spec (`homeCareChecklist`, `homeCareBody`).
- **Problem:** Phase 4 rewrites `homeCareBody` for adult OTC safety and general symptom rest. However, `homeCareChecklist` provides examples of mild symptoms appropriate for home monitoring.
  In pediatric patients, fever in infants under 3 months (rectal temperature ≥100.4°F / 38°C) or acute signs of dehydration in young children (no wet diapers for 8+ hours, no tears when crying, sunken eyes/fontanelle, extreme lethargy) are medical emergencies requiring immediate clinical evaluation, not home care observation.
  Failing to explicitly exclude infant fever and pediatric dehydration from the "Home Care" checklist creates critical clinical triage liability.
- **Suggested Fix:**
  In Phase 4 §7.2, add an explicit pediatric warning string to `homeCareChecklist` / `homeCareBody` (EN + ES):
  - **EN:** _"Important for children: Fever in infants under 3 months, or signs of dehydration (no wet diapers for 8 hours, crying without tears, extreme sleepiness), require immediate medical care, not home monitoring."_
  - **ES:** _"Importante para niños: La fiebre en bebés menores de 3 meses o los signos de deshidratación (sin pañales mojados por 8 horas, llanto sin lágrimas, somnolencia extrema) requieren atención médica inmediata, no observación en el hogar."_

---

### 2. 🟡 Phase 8 (§11.1) — Validator Denylist Lacks Generic Online Sourcing Strings (`Internet`, `Google`, `Search`)

- **Target Section:** Phase 8 — §11.1 Scope (`scripts/validate-content.ts`).
- **Problem:** `validate-content.ts` denylist currently checks: `Web`, `TBD`, `TODO`, `lorem`, `placeholder`, `Medical Team`.
  Authors can inadvertently pass validation with unverified entries such as `"Internet"`, `"Google"`, `"Online Search"`, `"None"`, or `"N/A"`.
- **Suggested Fix:**
  Expand the denylist in `validate-content.ts` to include: `Internet`, `Google`, `Search`, `Online Search`, `Online`, `None`, `N/A`, `Unknown`, `Various`.

---

### 3. 🟡 Phase 4 (§7.1) & Phase 15 (§18.1) — Care Guide Print Styles Strip Critical Emergency 911 / 988 Guidance

- **Target Section:** Phase 15 — §18.1 Scope & Mini-spec §10.3 (`CareGuideClient.tsx`).
- **Problem:** Mini-spec §10.3 states: _"Care-guide emergency banner: `no-print` already on the top alert — printed page should still include educational cards + disclaimer."_
  When a patient or caregiver prints the Care Guide to hang on a household refrigerator, stripping the emergency banner removes the 911 emergency signs and 988 Suicide & Crisis Lifeline numbers from the printed physical artifact.
- **Suggested Fix:**
  In `CareGuideClient.tsx`, keep the red background styling suppressed in print, but render a clean black-and-white print-only header:
  `print:block text-black border-b border-neutral-900 pb-2 mb-4: "For medical emergencies, call 911. For mental health crises, call or text 988 (US)."`

---

## CRITIC 5 — Ruthless Project Manager

_Focus: 4-day scope realism, dependency deadlocks, merge ordering, rollback feasibility._

### 1. 🔴 Phase 1 (§4.2, §4.3) vs Phase 3 (§6.1, §6.3) — Service Role Key Deployment Timing Deadlock Causes Contact Form 500 Outage

- **Target Section:** §3 (Four-day calendar, Day 1), Phase 1 (§4.2 Preflight, §4.3 Step A.1) vs Phase 3 (§6.1 Scope, §6.3 Env gate).
- **Problem:** In Phase 1 §4.3 Step A.1, `014_launch_reconcile.sql` revokes public `INSERT` on `contact_submissions`.
  Once `014` is applied to production Postgres on Day 1 morning, the **only** path that can insert contact submissions is `/api/contact` via `SUPABASE_SERVICE_ROLE_KEY`.
  However, Phase 3 (§6.1, §6.3) is scheduled for Day 1 afternoon, which introduces `check-production-env.mjs` to enforce `SUPABASE_SERVICE_ROLE_KEY` in Netlify.
  If `014` is applied in Phase 1 before a developer has manually confirmed `SUPABASE_SERVICE_ROLE_KEY` in Netlify's production environment settings, all live user contact submissions between Phase 1 and Phase 3 will immediately fail with 500/503 errors.
- **Suggested Fix:**
  Elevate the Netlify `SUPABASE_SERVICE_ROLE_KEY` verification from Phase 3 to an explicit **Prerequisite Gate 0** in Phase 1 §4.2. Phase 1 §4.2 must forbid running `npx supabase db push` until `SUPABASE_SERVICE_ROLE_KEY` is confirmed active in Netlify production environment variables.

---

### 2. 🔴 Phase 6 (§9.5) vs Phase 5 (§8.5) — Uncoupled Rollback Plan Causes 42P10 Schema Lock

- **Target Section:** Phase 6 — §9.5 Rollback & Phase 5 — §8.5 Rollback.
- **Problem:** Phase 5 guest progress migration (`guestProgress.ts` / `mutations.ts`) depends strictly on Phase 6's unique constraint `(user_id, quiz_id)`.
  Phase 6 deploys on Day 2 morning; Phase 5 deploys on Day 2 afternoon.
  If an issue is discovered with Phase 6 _after_ Phase 5 has merged and deployed, and an engineer executes `supabase/rollback/015_emergency.sql` (which drops the unique constraint), Phase 5's live client code will execute `upsert(..., { onConflict: "user_id,quiz_id" })` against a table lacking the unique index, immediately crashing all guest sign-ins and quiz saves with Postgres error `42P10`.
- **Suggested Fix:**
  In Phase 6 §9.5 and Phase 5 §8.5, explicitly document the coupled rollback rule:
  _If Phase 6 must be rolled back after Phase 5 has merged, Phase 5 MUST be rolled back in git and deployed to Netlify before executing `015_emergency.sql`._

---

### 3. 🟡 Day 4 Scheduling Priority — Phase 16 Security Hardening Must Precede Phase 15 Polish Features

- **Target Section:** §3 (Four-day calendar, Day 4) & Phase 16 (§19.1).
- **Problem:** Day 4 schedules Phase 14 (Code-splitting, 3h timebox), followed by Phase 15 (Print buttons, share links), and finally Phase 16 (Hardening: CSP sync script, Sentry PII sanitization).
  If Phase 14 or Phase 15 encounters delays, Phase 16's security requirements (CSP header verification and Sentry PII privacy enforcement) are placed at risk of being compressed or dropped.
- **Suggested Fix:**
  On Day 4, schedule Phase 16 must-dos (CSP sync script + Sentry PII sanitization) immediately after Phase 14 timebox closes (or parallelized), ensuring security hardening deploys before Phase 15 optional polish features (lesson share/print buttons).

---

## Panel Verdict Table

| Critic Persona        | Verdict   | Blocking Items (🔴)                                                                                                                                                                                                              |
| --------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Staff Engineer**    | **BLOCK** | 1. `handleQuizAttemptSideEffects` omits `locale` parameter, breaking localized achievement toasts/notifications in Spanish.<br>2. Client bundle bloat caused by static `getMessages` import in `achievements.ts`.                |
| **Security Engineer** | **BLOCK** | 3. Account deletion fails to wipe sensitive health lesson/quiz/planner data from `localStorage` on shared devices.                                                                                                               |
| **UX Lead**           | **BLOCK** | 4. Header login button text hidden at `xl` (1280px) lacks accessible name (`aria-label`) and leaves bare cryptic icon.                                                                                                           |
| **Clinical Reviewer** | **BLOCK** | 5. Care Guide "Home Care" checklist omits critical pediatric dehydration and infant fever red-flag disclaimers.                                                                                                                  |
| **Ruthless PM**       | **BLOCK** | 6. Phase 1 contact lock vs Phase 3 Netlify service role key timing deadlock risks live 500 outage.<br>7. Phase 6 / Phase 5 rollback asymmetry risks `42P10` schema crash if 015 is dropped without simultaneous client rollback. |

### Overall Implementation Gate: **NO (BLOCKED)**

Implementation must not start until the 7 blocking items (🔴) are reconciled in the implementation plan contract.

---

## Cursor/Grok Second Opinion

**Reviewer:** Principal engineer (skeptical). Claims checked against current tree (`mutations.ts`, `sideEffects.ts`, `achievements.ts`, `i18n.ts`, `guestProgress.ts`, `preferences.ts`, `SettingsClient.tsx`, `AuthProvider.tsx`, `AppProviders.tsx`, `Header.tsx`, `ButtonLink.tsx`, `CareGuideClient.tsx`, `useVisitPlanner.ts`, `VisitPlannerClient.tsx`, `errorReporting.ts`, `contact/route.ts`, `dashboard/index.ts`, message catalogs), not screenshots.  
**Documents:** `REVAMP/PLAN.v4.md` + this panel log.  
**Date:** 2026-08-27  
**Disposition key:** **ACCEPT** = v5 must change. **REJECT** = critique wrong or overblown; v5 keeps v4 and says why. **PARTIAL** = real issue, wrong size/severity/fix.

v4 already closed Round 1–3 launch-killers (CF-1…CF-23). Round 4 still blocks — two 🔴s are real holes the plan never named (quiz `locale` arg; shared-device health keys), two 🔴s rest on false novelty or invented schedule, one 🔴 is a11y-true / labels-wrong, and the dangerous ones are again the **intersections**.

---

### Wrong or overblown

**Staff 🔴 2 — Phase 7 `getMessages` newly violates Phase 14 — WRONG CATEGORY + FALSE NOVELTY.**  
`src/lib/i18n.ts` does statically import both catalogs (`en.json` 43632 B, `es.json` 46442 B). `getLocalizedAchievement` does call `getMessages`. That is real. It is **not** a Phase 7 regression and it is **not** Phase 14’s contract.  
Fifteen `'use client'` modules already value-import `@/lib/i18n` (`formatLevel`, `getCategoryLabel`, `formatReviewDate`, …). `sideEffects.ts` already imports `ACHIEVEMENTS` / `checkAndAwardAchievements` from `achievements.ts`. Phase 14 §17.1 is **content barrels** (lesson/path/quiz/glossary), analyzer string is a distinctive ES **lesson title**, not a message-catalog key. Wiring `getLocalizedAchievement` into toasts does not newly “force every `useProgress` page to parse both catalogs.” Dual JSON is already in the client graph.  
**Reject:** treat catalog dual-import as a P14 🔴 or as new Phase 7 bloat. **Accept cheap P7 constraint:** do **not** call `getMessages` / `getLocalizedAchievement` from client `sideEffects`. Pass copy from `useTranslations` at the hook (`mutations.ts` already has `useTranslations("progress")`). Import `updateDailyLog` from `@/lib/dashboard/dailyLog`, not the `export *` barrel (that barrel re-exports server `getLocalizedAchievement`). Splitting `@/lib/i18n` formatters from catalogs is **out of the P14 3h timebox** — drop-if-slip, not a launch gate.

**UX 🔴 1 — unlabeled login at `xl` / `t("nav.login")` / Lucide User — WRONG HEAD, WRONG KEY, REAL PLAN SILENCE.**  
HEAD `Header.tsx:168–177`: login `ButtonLink` has `aria-label={authT("loginButton")}`; label text is `2xl:hidden` (visible at 1280–1535); icon is `LogIn`, hidden until `2xl`. At the panel’s 1280px MacBook width, HEAD is a **labeled text button**, not an icon. `nav.login` does not exist; catalog key is `auth.loginButton`. `ButtonLink` forwards `aria-label` via `...props`.  
v4 §13.1 **does** mandate icon-only at `xl` (CF-21 compact-at-xl). It **never** says keep `aria-label`. `Header.test.tsx` mocks `ButtonLink` dropping `aria-label` / `className`, so the test cannot catch an empty accessible name.  
**Reject:** restore compact text at `xl` (fights CF-21 `/es` overflow). **Reject:** `t("nav.login")`. **Accept:** PLAN must require `aria-label={authT("loginButton")}` on the icon-only `xl` control; test `getByRole('link', { name })`; stop mocking away the label.

**PM 🔴 1 — Day 1 morning `014` vs afternoon env gate 500 outage — INVENTED CLOCK, TEXT ALREADY THERE.**  
v4 §4.2 step 4 already: confirm `SUPABASE_SERVICE_ROLE_KEY` in Netlify **before** contact revoke. C2 already: policy drop without the env gate 503s the form. `/api/contact` **today** 503s if the key is missing (`route.ts:127–133`) — 014 does not create that 503. Calendar has no AM/PM split.  
The real hole is **skippable human preflight vs automated gate in a later PR**. Matrix says env gate **before** 014; Day 1 lists Phase 1 then Phase 3. An agent that `db push`es after snapshot and skips step 4 still locks PostgREST while Netlify may lack the key.  
**Reject:** “plan forgot the key.” **Accept:** Gate 0 is **blocking** (`netlify env:get` / dashboard proof in the PR; **forbid** `db push` until it is). Env-gate script may merge before 014 apply. Contact revoke stays last in 014.

**PM 🔴 2 — P5 introduces upsert; rollback 015 after P5 → 42P10 — CF-8 RELITIGATION, WRONG DIRECTION IN §9.5.**  
HEAD `guestProgress.ts:107–108` already `.upsert({ onConflict: "user_id,quiz_id" })`. Live unique is absent → **42P10 today** for guest quiz migrate. C23 / CF-8 already moved Phase 6 before Phase 5 for that reason. P5 only **amplifies** (localStorage survives tab close). `mutations.ts` is still `.insert()` until P6.  
v4 §9.5 documents the **opposite** pairing: unique live + `.insert()` client = **23505**. It never says: drop unique while any upsert client is live = **42P10**. §8.5 is silent.  
**Reject:** “P5 is the upsert.” **Accept:** rollback docs must name both directions. Drop `015` only after reverting the P6 upsert client (and P5 if merged). HEAD guest upsert stays 42P10 if unique is dropped even with P5 reverted.

**Staff 🟡 2 — `display_name` NULL crashes UI — OVERBLOWN.**  
POSIX strip + `nullif` → NULL for whitespace-only names is intended. Every **profiles** consumer already fallbacks (`display_name ?? email local-part ?? t("guestUser"|"defaultUser")`). Holes are **metadata**: `dashboard/page.tsx` `??` keeps `""`; Header `||` still shows `"   "`. Cheap trim/fallback, not a 🔴 and not a schema change.

**UX 🟡 1 — article TOC scroll-spy — NOT LAUNCH.**  
Sticky TOC without spy is a polish miss, not a WCAG blocker. IntersectionObserver on long articles is extra P13 surface on a packed Day 4. **Reject** as must-do. Out of window unless leftover.

**Clin 🟡 1 — denylist `Search` / `Online` — TOO BROAD.**  
Plan list is exact/whole-string. `Search` / `Online` as tokens will false-fail real citations. **Accept** `Internet`, `Google`, `N/A`, `None`, `Unknown`. **Reject** `Search`, `Online`, `Online Search`, `Various`.

**Clin 🟡 3 — print `no-print` strips all 911/988 — HALF.**  
Red banner is `no-print` by spec (print CSS kills the red alert chrome). After P4, `emergencyBody` / `whenInDoubtBody` (printable cards) already carry US 911 + 988. `MedicalDisclaimer` is not `no-print`. Fridge print is not blank. A dedicated print-only 911/988 line is still worth adding so the artifact leads with the numbers if someone prints only the top of the page.

---

### Valid (keep as 🔴 or cheap 🟡)

| ID                                        | Verdict                        | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff 🔴 1 quiz sideEffects omit `locale` | **ACCEPT**                     | `handleLessonCompletionSideEffects` takes `locale` (`mutations.ts:57`). `handleQuizAttemptSideEffects` does not (`:100–109`, sig `sideEffects.ts:69–78`). v4 §10.1 says toast via `getLocalizedAchievement(id, locale)` and never names the quiz arg. `first-quiz-pass` / `perfect-quiz` stay English. Current toasts are hardcoded `"Achievement unlocked:"` in **both** fns — the locale arg is what P7 will fail to pass. `saveQuizAttempt` deps omit `locale`. Tests assert the 8-arg quiz call.                                                                                                                                                                                                                   |
| Sec 🔴 1 delete leaves UI health keys     | **ACCEPT** (bigger than panel) | v4 P9 `finally` is `clearGuestProgress()` only. That fn prefix-wipes `hmc_guest_*` in **sessionStorage** (HEAD). It does not touch `hmc-completed-lessons`, `hmc-quiz-scores`, `hmc-recent-lessons`, `hmc-started-paths`, `hmc-checklist`, `hmc-visit-planner` / v2, `hmc-glossary-lookups`. After P5 those guest keys move to **localStorage** and AppProviders still dual-writes UI keys for signed-in users. Layout does **not** unmount `AppProviders` on `router.push("/")`. Persist effect (`AppProviders.tsx:107–124`) **rewrites** UI keys from React state after a `removeItem`. Wipe-without-reset is a no-op. Logout (`AuthProvider.signOut`) has the same leak — library kiosk, not only account deletion. |
| UX 🔴 1 login `aria-label` at `xl`        | **PARTIAL**                    | Icon-only at `xl` is v4 contract. Accessible name must be specified. HEAD already has it; tests cannot see it. Do not restore text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Clin 🔴 1 pediatric home-care             | **ACCEPT**                     | Same class as CF-5 / CF-14 / CF-22: the paste spec is what ships. `homeCareBody` mentions children **only** for OTC. `homeCareChecklist` still examples “Low fever” as home care. Infant <3 mo fever and pediatric dehydration are 911-class, zero times in §7.2. Do not shove the warning into the pipe-separated checklist. New `homeCarePediatricNote` under the list + qualify/remove unqualified “Low fever.”                                                                                                                                                                                                                                                                                                     |
| PM 🔴 1 service-role timing               | **PARTIAL**                    | Elevate Gate 0; do not invent AM/PM. Form already 503s without the key.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| PM 🔴 2 015 rollback 42P10                | **PARTIAL**                    | Document drop-unique → upsert 42P10. Unique-live → insert 23505 already in §9.5. Pair both. HEAD guest upsert is in the pairing even if P5 reverts.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Staff 🟡 1 planner defaultQuestions loop  | **ACCEPT**                     | HEAD passes a **static** new-symptom slice — no loop. v4 §15.1 “Pass `PLANNER_DEFAULTS_BY_TYPE[visitType]` into `useVisitPlanner`” **creates** the loop with `defaultQuestionsStr` in the hydrate effect. Put the map **inside** the hook (CF-9 stays).                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Sec 🟡 1 contact stream cap               | **ACCEPT**                     | v4’s own sentence is the bypass: “before `json()`” then “if no Content-Length, cap **after parse**.” Chunked 50 MB still lands in isolate memory. Stream-read with a byte counter; 413; then parse. Do not trust `Content-Length` alone.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Sec 🟡 2 Sentry hash                      | **ACCEPT**                     | v4 strips `?` only. HEAD strips neither. `ResetPasswordClient` still reads `window.location.hash` (`#access_token=` / implicit recovery). `beforeSend` must strip `#` as well. Privacy `collectBodyErrors` must match.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| UX 🟡 3 glossary fade                     | **ACCEPT** (cheap)             | `scrollbar-none` + snap with A–G filling 390px has no overflow affordance. CSS mask, not a new control.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Clin 🟡 3 print 911/988 header            | **ACCEPT** (narrow)            | Keep `no-print` on the red banner. Add a print-only 911/988 line. Do not claim the printable cards are empty after P4.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| PM 🟡 3 P16 before P15                    | **ACCEPT**                     | Day 4 lists 14 → 15 → 16. Slip protocol already drops P16 **AppProviders/N+1**, not 19.1 (CSP + Sentry PII). P14 3h can still squeeze 19.1 if P15 runs first. After P14 timebox: **19.1 must-dos, then P15**. Never drop 19.1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Sec 🟡 / Clin 🟡 denylist extras          | **PARTIAL**                    | See overblown. Add the exact tokens that cannot appear in a real source line.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

---

### Combined flaws (v4 ∩ panel — these are the launch-killers this round)

**CF-24 — P7 “toast via `getLocalizedAchievement(id, locale)`” ∪ quiz sideEffects has no `locale` param ∪ `checkAndAwardAchievements` writes English notifications ∪ `saveQuizAttempt` deps omit `locale`.**  
Lesson path already forwards `locale` (today: paths loader only). Quiz path cannot. P7 implementers will type `getLocalizedAchievement(id, locale)` inside `handleQuizAttemptSideEffects` and either fail typecheck or pass nothing. Notifications are a second EN pipe: `achievements.ts:154–162` still `` `Achievement Unlocked: ${achievement.title}` `` even if toasts get `t()`. Catalog already has `achievements.unlocked` (`"Logro desbloqueado: {title}"`) and `achievements.items.*` — do **not** add a duplicate `progress.achievementUnlocked` and then forget the quiz call.  
**v5:** `handleQuizAttemptSideEffects` takes `locale` (and the same localize callback as the lesson fn). `mutations.ts` passes it on **both** skip-lower and upsert-success paths; hook deps include `locale`. `checkAndAwardAchievements` returns ids only — **stop** inserting EN notification rows inside it. Hook builds toast + `createNotifications` copy via `useTranslations("achievements")` (reuse `unlocked` + `items.{id}`). Client `sideEffects` must **not** import `getMessages` / `getLocalizedAchievement`. `updateDailyLog` from `@/lib/dashboard/dailyLog`. Tests: quiz call includes locale; ES toast; notification title not `"Achievement Unlocked:"`.

**CF-25 — CF-20 `clearGuestProgress` ∪ P5 canonical localStorage ∪ AppProviders UI keys that survive login ∪ persist-effect rewrite ∪ layout stays mounted ∪ P7 glossary ∪ P12 planner v2 ∪ checklist.**  
Panel named the leftover keys. v4 CF-20 only guest keys + cookies. After P5, guest keys are localStorage **and** AppProviders still persists `hmc-completed-lessons` / `hmc-quiz-scores` / recents / started paths for signed-in users (`mutations.ts` calls `appStateMarkLessonComplete` / `recordQuizScore` on both branches). `AppProviders` lives in `[locale]/layout.tsx` **around** `AuthProvider`. `router.push("/")` does not unmount it. Sequence `removeItem` → persist `useEffect` → keys come back from React state. Shared-device **logout** (not only delete) leaves HIV/depression/contraception history on the next guest session.  
**v5:** `clearLocalHealthData()` wipes health keys in **localStorage and sessionStorage** (guest prefix + UI progress + checklist + planner v1/v2 + glossary lookups). Does **not** wipe locale/theme/textSize/simpleMode. `AppProviders.resetLocalProgress()` **empties React state first**, then calls the wipe (so the persist effect writes empty, not the previous user). Settings delete `finally` and `AuthProvider.signOut` both call `resetLocalProgress`. Util ships in **Phase 9** (delete 🔴, Day 1 after P2 — P9 is no longer “if time”). Phase 5 signOut uses the same fn. Tests: wipe keeps `hmc-theme`; persist effect does not restore completed-lesson ids; rpc-ok + signOut-reject still wipes.

**CF-26 — CF-21 compact-at-xl icon-only login ∪ PLAN silent `aria-label` ∪ `Header.test` mock drops the label.**  
Overflow math was already rejected (wrong Spanish labels). The leftover is an icon-only control with no **contract** for an accessible name, plus a test that cannot fail.  
**v5:** Keep icon-only + signup `xl:hidden`. Require `aria-label={authT("loginButton")}`. Playwright/unit: named link at 1280. No Tools dropdown. No `nav.login`.

**CF-27 — CF-5 checklists as stay-home tree ∪ CF-14/22 paste-the-example ∪ `homeCareChecklist` “Low fever” ∪ children only in the OTC sentence.**  
Infant fever <3 months and pediatric dehydration are the same 911-class exception already used for airway / atypical ACS. Implementers will ship “Low fever” as a home-care example because that is the current string and §7.2 never replaces it.  
**v5:** Paste-ready `homeCarePediatricNote` EN+ES rendered **under** the home-care card, not as a checklist row. Qualify or remove unqualified “Low fever.” Tests: `/infant|3 month|dehydrat/i` (EN) + ES equivalents. Voice stays education-not-triage; this is the 911-class exception, US-qualified.

**CF-28 — C2 “policy drop without env gate 503s the form” ∪ calendar P1 then P3 ∪ Gate 0 is a skippable bullet.**  
**v5:** Gate 0 hard-stops `db push`. PR shows `netlify env:get SUPABASE_SERVICE_ROLE_KEY` (or dashboard) non-empty. Phase 3 env-gate **file** may merge first. 014 contact revoke remains last. No AM/PM mythology.

**CF-29 — CF-9 per-type default map ∪ §15.1 parent passes `PLANNER_DEFAULTS_BY_TYPE[visitType]` ∪ hydrate effect deps `defaultQuestionsStr`.**  
The map is right. Passing it as a **visitType-keyed prop** into an effect that also restores `visitType` from storage is a loop: mount with new-symptom defaults → hydrate medication → parent passes medication defaults → effect re-runs.  
**v5:** `PLANNER_DEFAULTS_BY_TYPE` lives in `useVisitPlanner.ts`. `changeVisitType(next)` looks up the map internally. Parent does **not** pass a defaults array that changes with `visitType`.

**CF-30 — “reject before `request.json()`” ∪ “if no Content-Length, cap after parse.”**  
The second clause undoes the first.  
**v5:** Read the body stream with a running byte count; 413 if > ~10KB; then `JSON.parse`. If `Content-Length` is present and > 10KB, 413 without reading. Never `await request.json()` on an unbounded body.

**CF-31 — ADV-16 strip `?` ∪ recovery/hash tokens still live in `#` ∪ `ResetPasswordClient` reads `location.hash`.**  
**v5:** `beforeSend` / breadcrumbs strip both search and hash. Keep path slugs. Privacy `collectBodyErrors` says query **and** fragment. Test: `#access_token=` gone; `/learn/managing-high-blood-pressure` stays.

**CF-32 — Day 4 P15 before P16 19.1 ∪ P14 3h timebox ∪ slip protocol drops N+1 not CSP/Sentry.**  
**v5:** After P14 timebox closes (or 13:00 slip): Phase 16 **must-dos** (CSP sync + Sentry PII), **then** Phase 15 polish. 19.1 is never dropped. P15 print/share can slip. Scope not cut.

---

### 🔴 disposition (implementation cannot start on v4)

| Panel 🔴                            | Disposition          | v5 action                                                                                                                            |
| ----------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Quiz sideEffects omit `locale`      | **ACCEPT**           | Locale + `t` callback on **both** side-effect fns; quiz mutations pass them; notifications not EN inside `checkAndAwardAchievements` |
| `getMessages` dual-catalog vs P14   | **REJECT as stated** | P7 uses `useTranslations`; no `getMessages` from client sideEffects; P14 stays content barrels                                       |
| Delete leaves health `localStorage` | **ACCEPT**           | `resetLocalProgress` + `clearLocalHealthData`; delete **and** logout; persist-effect safe                                            |
| Login unlabeled at `xl`             | **PARTIAL**          | Keep icon-only; require `aria-label={authT("loginButton")}`; fix tests                                                               |
| Pediatric home-care                 | **ACCEPT**           | `homeCarePediatricNote` spec strings; qualify “Low fever”                                                                            |
| P1/P3 service-role deadlock         | **PARTIAL**          | Hard Gate 0; env script may merge first; no AM/PM                                                                                    |
| P5/P6 rollback 42P10                | **PARTIAL**          | Document drop-unique → 42P10; revert upsert client before `015_emergency.sql`                                                        |

**Second-opinion verdict:** v4 **NO**. Do not implement from `REVAMP/PLAN.v4.md`. v5 must land CF-24…CF-32 plus accepted 🔴s.

**Rejected panel “mandatory” item 2 as stated (P14 catalog split / new dual-JSON leak).** Substitute: hook-layer `t`, no `getMessages` in client sideEffects. **Rejected restoring login text at `xl`.** Substitute: named `aria-label`. **Rejected AM/PM outage as missing text.** Substitute: non-skippable Gate 0. **Rejected “P5 introduces upsert.”** Substitute: both rollback directions, HEAD guest included.
