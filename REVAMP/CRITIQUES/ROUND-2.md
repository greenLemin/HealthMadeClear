# HealthMadeClear Launch Revamp — Panel Critique: Round 2

**Document Under Review:** `REVAMP/PLAN.v2.md` (2026-08-27)  
**Review Panel:** Staff Engineer, Security Engineer, UX Lead, Clinical Content Reviewer (PharmD), Ruthless Project Manager  
**Objective:** Second-round adversarial evaluation to break Implementation Plan v2, verify resolution of Round 1 findings, and uncover hidden failure modes, schema/client deadlocks, viewport regressions, and clinical liabilities.

---

## CRITIC 1 — Staff Engineer

_Focus: Feasibility, hidden complexity, framework/DB behavior, invalid technical assumptions._

### 1. 🔴 Phase 5 & 6 (§8.2, §9.1) — Postgres 42P10 Error on `migrateGuestProgressToSupabase` Prior to `015` Migration

- **Target Section:** Phase 5 — §8.2 Step 6 (`guestProgress.ts`) vs Phase 6 — §9.1 / §9.2 (`015_quiz_attempts_best_score.sql`).
- **Problem:** Phase 5 Step 6 mandates that guest progress migration execute:
  ```ts
  supabase.from("quiz_attempts").upsert(quizRows, {
    onConflict: "user_id,quiz_id",
  });
  ```
  However, in the 4-day calendar (§3), Phase 5 merges and deploys on the morning of Day 2, while migration `015_quiz_attempts_best_score.sql` (which adds the `UNIQUE (user_id, quiz_id)` constraint) is explicitly deferred to `supabase/pending/` until Phase 6 in the afternoon of Day 2.
  Postgres requires a unique constraint or unique index matching the target column list to execute `ON CONFLICT (user_id, quiz_id) DO UPDATE`. If a guest signs in or creates an account while Phase 5 code is live on production without `015` applied, PostgREST returns Postgres error `42P10` (_"there is no unique or exclusion constraint matching the ON CONFLICT specification"_), causing guest migration to throw an unhandled rejection, fail silently, and prevent newly registered users from recovering their progress.
- **Suggested Fix:** Couple the database constraint rollout with the migration code. Either:
  1. Advance the application of `015` to Day 1 (after deduplicating existing rows), OR
  2. In Phase 5, have `migrateGuestProgressToSupabase` check if the user already has rows or execute sequential `.select()` + `.insert()` / `.update()` until Phase 6 applies `015`, OR
  3. Merge Phase 5 and Phase 6 into a single atomic Day 2 PR where `015` is applied to Supabase in lockstep with the upsert client release.

---

### 2. 🔴 Phase 12 (§15.1, §15.2) — Visit Planner Default Question IDs Desynchronized from Initial Visit Type

- **Target Section:** Phase 12 — §15.1 Scope (`useVisitPlanner.ts`) & §15.2 Planner ID scheme.
- **Problem:** §15.2 states:

  > _"Default selected → `[\"medication:1\",\"followup:3\"]` (side effects to watch for; when to follow up). Not `new-symptom:0/1` (cause / which tests)."_

  In `src/app/[locale]/tools/visit-planner/useVisitPlanner.ts` (line 89), the initial state is hardcoded to:
  `const [visitType, setVisitType] = useState<VisitTypeKey>("new-symptom");`
  When a user opens the Visit Planner for the first time, `visitType` is `"new-symptom"`. Step 2 renders checkboxes for the questions corresponding to `"new-symptom"` (`new-symptom:0` through `new-symptom:3`). Because the default selected IDs in state are `medication:1` and `followup:3`, **none** of the visible checkboxes in Step 2 will be checked.
  If the user immediately clicks "Next" to Step 3 (Review), Step 3 resolves the selected IDs against the catalog and displays questions about medication side effects and follow-ups, even though the user selected the "New symptom" visit type and saw four unchecked boxes in Step 2.

- **Suggested Fix:** Align default questions with the default visit type. Either:
  1. Default `visitType` to `"medication"` when default questions are `["medication:1", "medication:3"]`, OR
  2. Keep `visitType` as `"new-symptom"` and set default questions to clinically relevant new-symptom IDs (e.g. `["new-symptom:2", "new-symptom:3"]` — treatment options & timeline), OR
  3. Implement visit-type scoped default selections in `useVisitPlanner.ts` so that selecting a visit type dynamically activates defaults matching that specific category.

---

### 3. 🟡 Phase 6 (§9.2) — Skipping Network Write on Lower/Equal Quiz Retake Drops Daily Log and Streak Updates

- **Target Section:** Phase 6 — §9.2 Step 1 (`mutations.ts`).
- **Problem:** Step 1 specifies:

  > _"If `existing && score < existing.score`, skip insert/upsert (optional toast none)."_

  In `mutations.ts`, `handleQuizAttemptSideEffects` (which calls `updateDailyLog` and `updateStreak`) is triggered conditionally upon completion of the quiz persistence call. If the client completely skips the network mutation when a user retakes a quiz and scores equal to or lower than their previous attempt (e.g. scoring 100% on Monday, then retaking on Tuesday and getting 100%), neither `daily_log` nor `streaks` will be updated for Tuesday's activity. The user's active streak will break despite completing daily health learning.

- **Suggested Fix:** When `score <= existing.score`, skip the database write to `quiz_attempts`, but **always** execute `handleQuizAttemptSideEffects(supabase, user.id, lessonId, score, maxScore, passed, allCompleted, showToast)` so that daily activity logging and streak tracking remain accurate.

---

### 4. 🟡 Phase 2 (§5.1, §5.2) — Auth Loading State Resolution in `ResetPasswordClient`

- **Target Section:** Phase 2 — §5.1 Scope & §5.2 Step 4 (`ResetPasswordClient.tsx`).
- **Problem:** The plan states: _"Wait until auth loading finishes; if getUser() / useAuth() has a session, show the form."_
  `ResetPasswordClient.tsx` currently imports `useAuthFormState`, which has an internal `loading` boolean representing form submission progress (`useState(false)`), not Supabase session initialization. If an engineer reads `const { loading } = useAuthFormState()`, checking `if (!loading)` will evaluate to `true` on the initial render before Supabase's `onAuthStateChange` or `getUser()` has resolved the cookie-based session.
- **Suggested Fix:** Explicitly mandate consuming `useAuth()` from `@/hooks/useAuth` (which provides `loading: boolean` tied to `AuthProvider`'s session resolution) or calling `const { data: { session } } = await supabase.auth.getSession()` inside a `useEffect` before toggling `isCheckingSession` to false.

---

### 5. 🟡 Phase 7 (§10.1) & Phase 14 (§17.1) — Hand-Coded `BEGINNER_LESSON_IDS` Subject to Drift

- **Target Section:** Phase 7 — §10.1 (`src/data/lessonMeta.ts`) vs Phase 14 — §17.1 (`scripts/bundle-lessons.ts`).
- **Problem:** Phase 7 introduces `src/data/lessonMeta.ts` containing a hand-written array `BEGINNER_LESSON_IDS`. If Phase 8 updates lesson frontmatter or adds/removes lessons, or if Phase 14 modifies bundle generators without hooking `lessonMeta.ts` into `scripts/bundle-lessons.ts`, the hardcoded array will silently fall out of sync with actual `level: "beginner"` lessons, breaking the `all-beginner` achievement.
- **Suggested Fix:** Add the generation of `src/data/lessonMeta.ts` to `scripts/bundle-lessons.ts` in Phase 7/8 so that `npm run content:bundle` automatically emits both the bundle files and the lightweight metadata file.

---

## CRITIC 2 — Security Engineer

_Focus: RLS, auth, injection, privacy of health-adjacent data, rate limiting._

### 1. 🔴 Phase 16 (§19.1) — Sentry Client SDK Captures Sensitive Health Topic URLs and Client IPs

- **Target Section:** Phase 16 — §19.1 Scope (`src/lib/errorReporting.ts`).
- **Problem:** While Phase 16 properly specifies stripping query parameters and scrubbing `lessonId` from Sentry `extra` and breadcrumbs, it does not disable default PII collection in the Sentry browser client initialization. By default, `@sentry/browser` captures client IP addresses and full request URLs (`location.pathname`, such as `/learn/managing-high-blood-pressure` or `/articles/std-prevention-guide`).
  In a health education application, associating an IP address with health-seeking route URLs constitutes health-adjacent PII under FTC health privacy guidance.
- **Suggested Fix:** In `src/lib/errorReporting.ts`:
  1. Add `sendDefaultPii: false` to `Sentry.init()`.
  2. In `beforeSend(event)`, sanitize `event.request.url` to mask slug identifiers on sensitive routes (e.g. replace `/learn/[slug]` with `/learn/*` unless explicitly unmasked), or strip IP addresses by setting `event.user = { id: undefined, ip_address: undefined }`.

---

### 2. 🟡 Phase 1 (§4.3) — `handle_new_user` Display Name Sanitization Missing Control Character Stripping

- **Target Section:** Phase 1 — §4.3 Step A.3 (`014_launch_reconcile.sql`).
- **Problem:** The proposed trigger function is:
  ```sql
  insert into public.profiles (id, display_name)
  values (
    new.id,
    substring(trim(coalesce(new.raw_user_meta_data->>'display_name', '')) from 1 for 100)
  );
  ```
  `raw_user_meta_data` is untrusted client-supplied JSON from the signup request. While truncating to 100 characters prevents storage abuse, it does not strip Unicode control characters, null bytes (`\u0000`), or multiline control sequences (`\r\n`). If rendered in plain text headers, notifications, or exported logs, unescaped control characters can cause log injection or layout disruption.
- **Suggested Fix:** Sanitize the display name in SQL:
  ```sql
  regexp_replace(substring(trim(coalesce(new.raw_user_meta_data->>'display_name', '')) from 1 for 100), '[\x00-\x1F\x7F]', '', 'g')
  ```

---

### 3. 🟡 Phase 5 (§8.2) — Automatic Guest Data Migration on Shared/Kiosk Devices

- **Target Section:** Phase 5 — §8.2 (`src/hooks/useProgress/guestMigration.ts`).
- **Problem:** `useGuestMigration` automatically migrates any `localStorage` guest progress to the authenticated user on login. In public health clinics or libraries where multiple users share a terminal, if User A browses sensitive health lessons as a guest without logging in, and User B subsequently logs into their account on the same browser, User A's health-learning history is permanently written into User B's Supabase account.
- **Suggested Fix:** While silent migration is standard for UX, add a timestamp check (e.g. only migrate guest data generated within the last 2 hours of the current browser session), or clear guest storage on explicit user sign-out (`AuthProvider.signOut()`) to minimize cross-user data pollution on shared devices.

---

### 4. 🟢 Phase 16 (§19.1) — CSP Synchronization for Inline Scripts

- **Target Section:** Phase 16 — §19.1 (`scripts/check-security-headers.mjs`).
- **Problem:** `next.config.mjs` and `netlify.toml` both enforce Content Security Policy. Next.js 16 injects inline bootstrap scripts (such as `pref-bootstrap.js` for theme initialization). If CSP `script-src` does not use strict hash verification or `'unsafe-inline'` with appropriate scoping, browsers will block theme hydration.
- **Suggested Fix:** Ensure `security-headers.json` includes the exact SHA-256 hashes of inline bootstrap scripts (`pref-bootstrap.js`) rather than blanket `'unsafe-inline'`.

---

## CRITIC 3 — UX Lead

_Focus: Visual fidelity, layout stability, breakpoint responsiveness, audit resolution._

### 1. 🔴 Phase 10 (§13.1) — Header Nav Breakpoint Shift to `lg:flex` Causes Severe Overflow on 1024px–1366px Laptops

- **Target Section:** Phase 10 — §13.1 Scope (`src/components/Header.tsx`).
- **Problem:** The plan states:

  > _"Replace nav `2xl:flex` with `lg:flex`... Rule: `< lg` (1024) = drawer; `lg+` = inline nav."_

  Let's calculate the total width of elements rendered at `lg` (1024px viewport) inside `Header.tsx`:
  1. Logo + "Health Made Clear" text + subtitle: ~240px
  2. Inline navigation bar (6 nav links with padding and icons): ~440px
  3. Auth container (Login button + Sign Up button): ~180px
  4. Utility container (Search + Language Toggle + Theme Toggle + Accessibility Controls): ~180px
  5. Container padding, flex gaps, and margins: ~90px
     **Total required width:** ~1,130px.

  At 1024px (`lg`), the header content exceeds the viewport width by over 100px. This will force the header to wrap into two rows, break the flex alignment, or cause horizontal scroll on standard 13" laptops (1024px, 1280px).
  The original codebase used `2xl:flex` (1536px) precisely because the full text logo, full 6-item nav, full text auth buttons, and 4 utility buttons cannot fit simultaneously on smaller desktop screens without collapsing buttons to icon-only modes.

- **Suggested Fix:**
  1. Set the inline nav breakpoint to `xl:flex` (1280px), OR
  2. At `lg` (1024px–1279px):
     - Hide the logo tagline (`sm:block` -> `xl:block`).
     - Collapse the "Log In" and "Sign Up" text buttons to icon-only buttons (`px-2.5` with icons only).
     - Reduce navigation item horizontal padding from `px-3.5` to `px-2`.

---

### 2. 🔴 Phase 13 (§16.1) — Plan Targets `<video>` in `Hero.tsx`, but Video is Rendered in `HomeClient.tsx`

- **Target Section:** Phase 13 — §16.1 Scope (`Hero.tsx`) & Changelog §13.
- **Problem:** §16.1 states:

  > _"Hero.tsx: <sm: primary CTAs immediately under subtitle; autoplay video below those buttons in DOM."_

  In the codebase, `src/components/Hero.tsx` does **not** contain any `<video>` element. The video is rendered directly inside `src/app/[locale]/HomeClient.tsx` (lines 48–61) **above** `<Hero />`:

  ```tsx
  <div className="w-full overflow-hidden">
    <video src="/HMC_Video.mp4" ... />
  </div>
  <Hero />
  ```

  An engineer following Phase 13 will look for `<video>` in `Hero.tsx`, find nothing, and either fail to move the video on mobile or perform an invalid refactor of `Hero.tsx`.

- **Suggested Fix:** Update the file scope in Phase 13 (§16.1) from `src/components/Hero.tsx` to `src/app/[locale]/HomeClient.tsx`. On mobile (`< sm`), render `<Hero />` first and move the video container below the Hero section (or inside a responsive wrapper in `HomeClient.tsx`).

---

### 3. 🟡 Phase 13 (§16.1) — Sticky Article TOC Lacks Scroll-Margin on Target Headings

- **Target Section:** Phase 13 — §16.1 (`src/app/[locale]/articles/[slug]/ArticlePageClient.tsx`).
- **Problem:** When adding the desktop sticky TOC with anchor links (`#section-slug`), clicking a TOC link scrolls the target `<section>` to the very top of the viewport. Because `Header.tsx` is fixed/sticky at the top with a height of ~76px, the section heading will be hidden directly underneath the header banner.
- **Suggested Fix:** Add `scroll-mt-24` (or `scroll-pt-24`) to all `<section>` elements or `<h2>` headings inside `ArticlePageClient.tsx`.

---

### 4. 🟡 Phase 12 (§15.1) — Search Debounce on `aria-live` Region Needs Polite Buffer

- **Target Section:** Phase 12 — §15.1 Scope (`src/components/search/SearchDialogContent.tsx`).
- **Problem:** The plan calls for a 350ms debounce on the `role="status" aria-live="polite"` result count announcement. If a user types continuously, 350ms is appropriate, but if the search index is still filtering synchronously, rapid announcements can queue up in screen reader speech synthesizers (e.g. VoiceOver).
- **Suggested Fix:** Ensure the `aria-live` element is present in the DOM on initial dialog mount (empty), and only update its inner text after the 350ms debounce timer clears, avoiding tearing down and recreating the live region DOM node.

---

## CRITIC 4 — Clinical Content Reviewer (PharmD Persona)

_Focus: Clinical safety, medical accuracy, red-flag symptoms, plain language, disclaimers._

### 1. 🔴 Phase 4 (§7.2) — Sore Throat Scenario Lacks Airway/Abscess Emergency Red Flags

- **Target Section:** Phase 4 — §7.2 Care-guide copy spec (`scenarioSoreThroatBody`).
- **Problem:** The plan suggests:

  > _"Sore throat: 'People often start by contacting their usual clinic or nurse line. This page cannot tell you what you have.'"_

  While de-escalating triage directives is essential for liability, sore throat presentations have critical emergency red flags that must never be framed as routine primary care:
  - Inability to swallow saliva / drooling (sign of epiglottitis or peritonsillar abscess).
  - Inability to fully open the mouth (trismus).
  - Stridor or shortness of breath.
  - Asymmetrical swelling of the soft palate.

  If a patient with a developing peritonsillar abscess or epiglottitis reads a generalized statement advising them to call a routine clinic in the morning, critical airway intervention can be delayed.

- **Suggested Fix:** In `src/messages/en.json` and `es.json`, ensure `scenarioSoreThroatBody` explicitly lists emergency airway warning signs:
  > _"Most mild sore throats are evaluated by a primary care clinic or nurse line. However, severe trouble swallowing, drooling, inability to open the mouth, or trouble breathing are emergencies requiring immediate medical care."_

---

### 2. 🟡 Phase 4 (§7.2) — Home Care / OTC Copy Lacks High-Risk Population Precautions

- **Target Section:** Phase 4 — §7.2 (`homeCareBody`).
- **Problem:** The proposed text is:

  > _"Home care often means rest and fluids while mild symptoms improve. A clinician or pharmacist can advise whether an over-the-counter option is appropriate for you."_

  Over-the-counter medications carry significant clinical risks in vulnerable populations (e.g. Aspirin in children under 19 due to Reye's syndrome; NSAIDs in renal impairment, ulcers, or pregnancy; Acetaminophen dosing in hepatic disease; decongestants in hypertension).

- **Suggested Fix:** Enhance the clinical disclaimer in `homeCareBody`:
  > _"Home care often means rest and fluids while mild symptoms improve. Always speak with a doctor or pharmacist before taking over-the-counter medications, especially for children, pregnant individuals, or those with chronic conditions."_

---

### 3. 🟡 Phase 8 (§11.1) — Trust Banner Mobile Layout Push

- **Target Section:** Phase 8 — §11.1 Scope (`TrustBanner.tsx`) & Phase 13 (§16.1).
- **Problem:** Adding a prominent `TrustBanner` directly above the `Hero` H1 on mobile viewports (390px) pushes the title and key educational CTAs further down the screen.
- **Suggested Fix:** On mobile screens (`< sm`), format the `TrustBanner` as a clean, compact single-line trust badge with an inline shield icon (`text-label-sm py-1 px-3`), ensuring the Hero H1 remains above the fold.

---

## CRITIC 5 — Ruthless Project Manager

_Focus: Scope realism, 4-day timeline, dependency deadlocks, mergeability, rollbacks._

### 1. 🔴 Day 2 Scheduling Deadlock — Phase 5 Cannot Safely Deploy to Production Before Phase 6

- **Target Section:** §3 (Four-day calendar) & §13.1 (Phase dependency graph).
- **Problem:** The calendar schedules Phase 5 on Day 2 morning and Phase 6 on Day 2 afternoon. As identified by the Staff Engineer (Critic 1, Item 1), Phase 5's `migrateGuestProgressToSupabase` code depends on the `(user_id, quiz_id)` unique constraint applied in Phase 6's `015` migration.
  If each phase is strictly "one PR = one deploy" (Rule 0.1), merging Phase 5 to `main` and deploying to Netlify will break guest registration on production during the multi-hour window before Phase 6 is implemented, reviewed, and merged.
- **Suggested Fix:** Restructure Day 2 phase boundaries:
  - **Option A (Recommended):** Combine Phase 5 and Phase 6 into a single cohesive PR: _"Phase 5/6: Progress Persistence & Guest Migration Integrity"_. This allows applying migration `015` and releasing the unified upsert/migration client in one atomic production release.
  - **Option B:** Keep them separate, but modify Phase 5 to use a non-upsert fallback or keep `015` in `supabase/migrations/` and apply it at the start of Day 2 before any client code merges.

---

### 2. 🔴 Day 2 Scope Overload — 5 High-Complexity PRs in 10 Hours Guarantees Day 3/4 Slip

- **Target Section:** §3 (Four-day calendar).
- **Problem:** Day 2 currently contains:
  1. Phase 4: Care Guide copy rewrite (EN+ES), contrast tokens, 911 qualifier, Articles catalog disclaimer.
  2. Phase 5: Guest progress storage unification, session-to-local migration, unhandled rejection fixes.
  3. Phase 6: Production DB backup, `015` migration push, `mutations.ts` rewrite, rollback handling, dashboard summary aggregation.
  4. Phase 7: Gamification order, localized toasts, `lessonMeta.ts`, glossary lookup counter.
  5. Phase 8: Clinical citation block, TrustBanner, LessonHeader, LessonNotes, Article reader sources, `validate-content.ts` updates, and manual frontmatter fixes across 40+ MDX files.

  At an average CI build and review cycle of 20 minutes per PR, executing 5 distinct PRs in one day leaves fewer than 90 minutes of engineering time per phase. Phase 8 alone (modifying and validating 40+ MDX files across two locales) will take at least 2.5 hours. Day 2 will slip into Day 3, pushing visual and accessibility fixes into Day 4 and forcing the complete abandonment of Phase 14 (bundle optimization) and Phase 16 (hardening).

- **Suggested Fix:** Rebalance the calendar:
  - Move **Phase 8 (Citations & MDX validation)** to **Day 3 morning**.
  - Combine **Phase 5 & Phase 6** into one unified PR on Day 2.
  - Day 2 becomes: Phase 4 (Clinical copy), Phase 5/6 (Data integrity & guest migration), Phase 7 (Achievements/side effects). This creates a realistic, achievable Day 2.

---

### 3. 🟡 Phase 14 (§17.1) — Hard Time-Box Needed for Bundle Generator Refactoring

- **Target Section:** Phase 14 — §17.1 Scope & §3 Slip protocol.
- **Problem:** Refactoring `scripts/bundle-*.ts` and splitting client bundle imports in Next.js 16 App Router carries subtle Webpack/Turbopack chunking edge cases. If engineers get bogged down debugging chunk analyzers on Day 4, Phase 15 (Print & Small Features) and Phase 16 (Security Headers & Sentry) will be compromised.
- **Suggested Fix:** Establish a hard timebox of **3 hours** for Phase 14 on Day 4. If single-locale dynamic loading is not fully green in CI by 1:00 PM on Day 4, drop Phase 14 and immediately proceed to Phase 15 and Phase 16.

---

## VERDICT TABLE — Launch Readiness

| Critic       | Persona           | Can Implementation Start? | Blocking Items (🔴)                                                                                                                                  |
| ------------ | ----------------- | :-----------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CRITIC 1** | Staff Engineer    |          **NO**           | 1. Postgres 42P10 on guest migration prior to `015` constraint (§8.2/§9.1)<br>2. Visit planner default IDs mismatch default visit type (§15.2)       |
| **CRITIC 2** | Security Engineer |          **NO**           | 1. Sentry client SDK capturing health-seeking route URLs & client IPs (§19.1)                                                                        |
| **CRITIC 3** | UX Lead           |          **NO**           | 1. Header nav `lg:flex` viewport overflow at 1024px–1366px (§13.1)<br>2. Moving `<video>` targeted in `Hero.tsx` instead of `HomeClient.tsx` (§16.1) |
| **CRITIC 4** | Clinical Reviewer |          **NO**           | 1. Sore throat scenario missing emergency airway/abscess red flags (§7.2)                                                                            |
| **CRITIC 5** | Ruthless PM       |          **NO**           | 1. Day 2 Phase 5/6 deployment sequence deadlock (§3)<br>2. Day 2 five-PR workload overload guaranteeing schedule collapse (§3)                       |

---

### Overall Verdict: 🛑 NO (6 Blocking Structural Flaws Must Be Patched in Plan v2)

#### Mandatory Plan Fixes Required Before Implementation Begins:

1. **Unify Phase 5 and Phase 6** into a single atomic Day 2 PR so migration `015` and the upsert client deploy together, preventing `42P10` runtime errors on guest login.
2. **Synchronize Visit Planner defaults** so initial selected question IDs match the initial `new-symptom` visit type.
3. **Configure Sentry PII rules** in Phase 16 to set `sendDefaultPii: false` and strip client IP addresses.
4. **Fix Header responsive layout** at `lg` (1024px) by moving inline nav to `xl:flex` (1280px) or collapsing auth/logo elements to prevent header overflow.
5. **Correct Video container target** from `Hero.tsx` to `HomeClient.tsx` in Phase 13.
6. **Include acute airway red flags** in the care-guide sore throat scenario copy.
7. **Move Phase 8 (MDX citations)** to Day 3 morning to prevent Day 2 timeline collapse.

---

## Cursor/Grok Second Opinion

**Reviewer:** Principal engineer (skeptical). Claims checked against current tree + Sentry JS SDK v10 docs, not screenshots.  
**Documents:** `REVAMP/PLAN.v2.md` + this panel log.  
**Date:** 2026-08-27  
**Disposition key:** **ACCEPT** = v3 must change. **REJECT** = critique wrong or overblown; v3 keeps v2 and says why. **PARTIAL** = real issue, wrong size/severity/fix.

v2 already closed Round 1's launch-killers (CF-1…CF-7). Round 2 still blocks — some 🔴s are real, some rest on false SDK/SQL/DOM facts, and the dangerous ones are again the **intersections** neither side wrote cleanly.

---

### Wrong or overblown

**Staff 🔴 1 / PM 🔴 1 — “Phase 5 introduces `onConflict` and will 42P10 until Phase 6” — HALF-TRUE, WRONG MECHANISM.**  
`src/lib/guestProgress.ts:107–108` **already** `upsert`s `quiz_attempts` with `onConflict: "user_id,quiz_id"`. Live unique is missing (ADV-01). That is **today's** 42P10 for any guest with quiz rows — not a new Phase 5 line. `lesson_progress` unique from `002` **is** live, so lesson migrate already works.  
v2's actual bug is the comment in §8 Dependencies: _“no-op until Phase 6 unique exists; still correct.”_ Postgres `ON CONFLICT` without a matching unique/exclusion is **`42P10`, not a no-op.**  
Mega-merging Phase 5 (guest storage + AppProviders + fetch-order) with Phase 6 (dedupe SQL + `mutations.ts` + dashboard aggregation) is the wrong fix: one unreviewable PR.  
**Keep:** unique and upsert client in one **production window** (already v2 for `mutations.ts`). **Change:** Phase **6 before Phase 5** (or same deploy). **Reject:** one combined Phase 5/6 PR.

**Staff 🟡 3 — equal 100% retake breaks streak — WRONG EXAMPLE.**  
v2 §9.2 skips the write only when `score < existing.score`. `100 < 100` is false → upsert still runs → `handleQuizAttemptSideEffects` still runs. Tuesday 100% after Monday 100% is fine.  
**Real bug (keep 🟡):** a **lower** retake skips the network write **and** therefore skips daily_log/streak. Product: practice-today should still count. Skip write on `score <= existing`; **always** call side effects.

**Security 🔴 1 — Sentry “by default captures client IPs” — FALSE for this SDK.**  
App pins `@sentry/browser ^10.65`. JS SDK v10: `sendDefaultPii` **defaults to `false`**; without `dataCollection`, **IP is not inferred**. Panel described v7-era / `sendDefaultPii: true` behavior.  
v2 already strips query strings and `ui.input` values. Path slugs (`/learn/managing-high-blood-pressure`) **are** in `event.request.url`. That is the same class of data Phase 3 **already discloses** for GA (`privacy.collectBodyAnalytics`: page path includes lesson/article slugs). Masking every slug to `/learn/*` as a launch 🔴 destroys the only routing signal in crash reports while GA still gets the slug.  
**Keep (cheap, belt):** explicit `sendDefaultPii: false`; clear `event.user.ip_address` / email. **Reject:** slug→`*` as 🔴. **Add:** `privacy.collectBodyErrors` (crash reports may include page path, not name/IP). Do **not** pass a `dataCollection: {}` object — v10 docs: any `dataCollection` object flips categories to **permissive** defaults (including IP unless `userInfo: false`).

**Security 🟢 4 — hash `pref-bootstrap.js` instead of `'unsafe-inline'` — WRONG FILE.**  
`pref-bootstrap.js` is an **external** script (`/pref-bootstrap.js`). `netlify.toml` already says so. `'unsafe-inline'` is there because **Next App Router emits inline bootstrap**. Hashing the external file does not authorize Next's inline scripts and would not let you drop `'unsafe-inline'`. Strict hashes = post-launch Next CSP project. Phase 16 keeps the dual-file CSP check.

**Security 🟡 3 — 2-hour guest-migrate TTL — OVERBLOWN / ANTI-FEATURE.**  
Canonical guest story is browse-then-signup later the same day (or next). A 2h window deletes that. Shared-kiosk User-A-guest → User-B-login is real and **not fully solvable** without a confirm dialog (out of this window).  
**Keep:** `clearGuestProgress()` on `AuthProvider.signOut` (today sign-out does not). Login/signup copy that browser progress will attach to the account. **Reject:** TTL.

**UX 🔴 1 width math — DIRECTION RIGHT, ARITHMETIC LOW.**  
`getNavItems` is **8** links (home, learn, articles, paths, tools, dashboard, glossary, about), not 6. Auth+utilities already `lg:flex` (Header.tsx:142) while nav is `2xl:flex`. v2's `lg:flex` on nav **adds** the 8-item pill row into a row that already has logo+auth+utils at 1024. Visual audit itself allowed `lg:flex` **or** `xl:flex`. 1440 (the audit viewport) is `xl`, not `lg`.  
**Reject:** `lg:flex` as the nav breakpoint. **Accept:** `xl:flex` + compact-at-xl (tagline, auth text, nav padding).

**Clinical 🟡 3 TrustBanner mobile — STALE.**  
v2 Phase 8 already: `<sm` `text-label-sm py-1 px-3` single line. No new work.

**PM 🔴 2 “5 PRs in 10 hours guarantees collapse” — OVERBLOWN AS 🔴.**  
CI ~15 min ≠ 90 min engineering per phase. P4 (copy) and P8 (MDX) already parallel in v2. Moving P8 to Day 3 is still **worth doing** to unclog Day 2 **after** P6-before-P5 — as a 🟡 schedule reshape, not because five sequential PRs are physically impossible. Do not cut Phase 8.

**Staff 🟡 4 ResetPassword `loading` — not 🔴, but it re-breaks Round 1 CF-2 if ignored.**  
`useAuthFormState().loading` is submit-in-flight (`useState(false)`), starts **false**. `useAuth().loading` is session resolution, starts **true**. v2 says “wait until auth loading finishes” without naming the hook. An implementer who destructures the form hook will skip the wait and flash invalid-link. Treat as **must-name** in v3 (same severity as a 🔴 for that step).

---

### Valid (keep as 🔴 or cheap 🟡)

| ID                                          | Verdict                                | Why                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff 🔴 2 planner defaults vs `visitType`  | **ACCEPT**                             | v2 §15.2 hardcodes `["medication:1","followup:3"]`. Hook default `visitType` is `"new-symptom"` (`useVisitPlanner.ts:89`). `changeVisitType` already resets to the **new** type's first two questions. Cross-type defaults + Step 2 of `new-symptom` = empty checkboxes + Step 3 showing med/follow-up copy.                      |
| UX 🔴 2 video in `Hero.tsx`                 | **ACCEPT**                             | `Hero.tsx` has **no** `<video>`. Video is `HomeClient.tsx:48–61` **above** `<Hero />`. Hero's media is `next/image` `/stitch/home.png`. Following v2 §16.1 literally cannot move the autoplay file.                                                                                                                               |
| Clin 🔴 1 sore-throat airway flags          | **ACCEPT**                             | v2 §7.2 **rule** already says each scenario includes emergency warning signs. v2 **example** is: _“People often start by contacting their usual clinic or nurse line.”_ Implementers copy examples. Epiglottitis / PTA red flags (drooling, trismus, stridor, can't swallow saliva) must be **in the spec string**, both locales. |
| UX 🔴 1 header overflow (as `xl` + compact) | **ACCEPT** (fix ≠ panel's only option) | `lg:flex` at 1024 with 8 labeled nav items will overflow. `xl:flex` hits the 1440 audit target. Compact at `xl` is required; 1280 is still tight.                                                                                                                                                                                 |
| Staff 🟡 3 skip-lower drops streaks         | **ACCEPT** (example was wrong)         | Lower retake must still `handleQuizAttemptSideEffects`.                                                                                                                                                                                                                                                                           |
| Staff 🟡 4 auth vs form `loading`           | **ACCEPT**                             | Mandate `useAuth()`.                                                                                                                                                                                                                                                                                                              |
| Staff 🟡 5 `BEGINNER_LESSON_IDS` drift      | **ACCEPT**                             | v2 allows hand-written. `scripts/bundle-lessons.ts` already parses MDX. Emit `lessonMeta.ts` (`id` + `level` only) there; P14 must not drop the emit.                                                                                                                                                                             |
| Sec 🟡 2 control chars in `display_name`    | **ACCEPT**                             | Truncate-100 is in v2. Add `regexp_replace(..., '[[:cntrl:]]', '', 'g')` (POSIX class; panel's `[\\x00-\\x1F]` is not reliable in Postgres POSIX).                                                                                                                                                                                |
| UX 🟡 3 article TOC under sticky header     | **ACCEPT**                             | Header ~76px + `px-3 pt-3`. `scroll-mt-24` on section/h2 targets.                                                                                                                                                                                                                                                                 |
| UX 🟡 4 live-region node stability          | **ACCEPT**                             | v2 already 350ms debounce. Add: mount empty `aria-live` node; mutate **text**, do not remount.                                                                                                                                                                                                                                    |
| Clin 🟡 2 OTC high-risk groups              | **ACCEPT**                             | Still education, not “take this.” One sentence: ask a clinician/pharmacist before OTC, especially children, pregnancy, chronic conditions.                                                                                                                                                                                        |
| PM 🟡 3 P14 3h timebox                      | **ACCEPT**                             | Fits existing Day-4 slip; make the clock explicit.                                                                                                                                                                                                                                                                                |
| PM 🔴 2 move P8 → Day 3                     | **PARTIAL / ACCEPT as schedule**       | Not a structural 🔴. Do it so Day 2 is P4 + **P6 then P5** + P7. P8 scope **not** cut.                                                                                                                                                                                                                                            |

---

### Combined flaws (v2 ∩ panel — these are the launch-killers this round)

**CF-8 — “ON CONFLICT is a no-op” ∪ guest quiz upsert already live ∪ P5 making localStorage survive.**  
Panel timed 42P10 to a Phase 5 **deploy**. Tree: upsert is **HEAD**. v2 P5 then **amplifies** it (tab-close no longer wipes guest quizzes → more 42P10 on signup). v2 also calendars P5 **before** P6. Together: Day-2 morning makes the existing fail **more frequent**, then afternoon unique would have fixed it.  
**v3:** Delete the no-op sentence. **Phase 6 (015 + `mutations.ts` upsert) merges before Phase 5.** P5 acceptance: unique `(user_id, quiz_id)` **exists** in production. Two PRs, ordered; not one blob.

**CF-9 — Clinical safety defaults ∪ type-scoped Step 2 ∪ `changeVisitType` reset.**  
Round 1 told v2 to drop curiosity `new-symptom:0/1`. v2 picked **other types'** safety IDs and left `visitType = "new-symptom"`. `changeVisitType` already replaces selection with that type's first two questions — so the hardcoded cross-type list only poisons **first load**.  
**v3:** Per-type default map. Initial type stays `new-symptom`. Defaults: `new-symptom:2` + `new-symptom:3` (options + timeline), `medication:1` + `medication:3` (side effects + interactions), `followup:0` + `followup:3` (is it working + when to follow up). `changeVisitType` applies **that** map, not `slice(0,2)` of raw strings.

**CF-10 — Session-aware reset (CF-2) ∪ unnamed `loading`.**  
v2 correctly waits for auth before invalid-link. `ResetPasswordClient` today only imports `useAuthFormState`. Form `loading` is `false` on first paint.  
**v3:** `const { user, loading: authLoading } = useAuth()`. Gate on `authLoading`. Tests mock `AuthProvider`, not form loading.

**CF-11 — Compact TrustBanner in `Hero` ∪ video **above** Hero in `HomeClient` ∪ v2 “move video in Hero.tsx”.**  
Phase 8 compact banner cannot un-bury CTAs while 16:9 autoplay sits **above** the whole Hero. Phase 13 file list will send the agent into the wrong component (`Hero` image card, not `/HMC_Video.mp4`).  
**v3:** Phase 13 owns `HomeClient.tsx` order: `<sm` Hero (CTAs) **then** video. `Hero.tsx` = clamp + TrustBanner slot only. Phase 16 still does `preload` / reduced-motion on the same `<video>`.

**CF-12 — Visual audit `lg|xl` ∪ v2 picked `lg` ∪ 8 nav items ∪ auth already `lg:flex`.**  
Audit wanted 1440 to show nav. v2's `lg:flex` “so 1024–1536 is desktop nav, not icon-only chaos” fights the compactness the row **needs** at 1280. Panel 6-item math understates overflow.  
**v3:** Nav `xl:flex` / hamburger `xl:hidden`. At `xl`–`2xl`: hide tagline (`hidden 2xl:block`), login icon-only until `2xl`, `NavLink` `xl:px-2`. Playwright: 1440 nav visible; 1280 **and** 1440 `header` `scrollWidth <= clientWidth`.

**CF-13 — P6 skip-lower-score ∪ P7 daily_log/streak.**  
Side effects run only after a successful quiz persist. Skip persist on lower score → silent streak break. Panel's 100=100 example was wrong; the `<` path is enough to ship a lying calendar.  
**v3:** `score <= existing.score` → skip `quiz_attempts` write; **always** `handleQuizAttemptSideEffects`.

**CF-14 — §7.2 “include warning signs” ∪ example copy without them.**  
Same class as Round 1 CF-5 (bodies vs checklists): the rule is right, the copy-paste spec is what ships.  
**v3:** Sore-throat **example is** the airway paragraph. Chest-pain 911 example stays. Tests: EN+ES strings contain swallow/drool/breathing (or ES equivalents), not only “clinic or nurse line.”

**CF-15 — P7 hand-written `lessonMeta` ∪ P8 MDX ∪ P14 generator.**  
v2 forbade client `loadLessons` (CF-4) then allowed a hand array. P8/P14 change lessons; `all-beginner` silently dies.  
**v3:** `scripts/bundle-lessons.ts` emits `src/data/lessonMeta.ts` (`id` + `level` only). Unit test: set equals EN lessons with `level === "beginner"`. P14 must keep the emit.

**CF-16 — Rule 0.1 “one phase = one PR” ∪ atomic 015.**  
Panel's mega-PR fights 0.1. v2's “P5 independent” fights 42P10.  
**v3:** Keep one-phase-one-PR. **Order exception:** Phase 6 before Phase 5. Never apply 015 without the Phase 6 client (unchanged). Never ship Phase 5 migrate-onConflict without unique live.

---

### 🔴 disposition (implementation cannot start on v2)

| Panel 🔴                             | Disposition                                                       | v3 action                                                                              |
| ------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| P5 upsert before 015 / 42P10         | **PARTIAL** (real error, wrong “P5 introduces it”, wrong mega-PR) | P6 before P5; kill “no-op” claim; two PRs                                              |
| Planner default IDs vs `new-symptom` | **ACCEPT**                                                        | Per-type default map                                                                   |
| Sentry IP + health URLs              | **PARTIAL**                                                       | `sendDefaultPii: false` + clear user IP; **reject** slug `*`; disclose path in privacy |
| Header `lg:flex` overflow            | **ACCEPT**                                                        | `xl:flex` + compact-at-xl; 8 items not 6                                               |
| Video targeted in `Hero.tsx`         | **ACCEPT**                                                        | `HomeClient.tsx` DOM order                                                             |
| Sore throat missing airway flags     | **ACCEPT**                                                        | Spec strings include red flags                                                         |
| Day 2 P5/P6 deadlock                 | **PARTIAL**                                                       | Same as row 1 — sequence, don't merge                                                  |
| Day 2 five-PR overload               | **PARTIAL**                                                       | Move P8 to Day 3; do not cut scope                                                     |

**Second-opinion verdict:** v2 **NO**. Do not implement from `PLAN.v2.md`. v3 must land CF-8…CF-16 plus accepted 🔴s.

**Rejected panel “mandatory” item 1 as stated (mega-PR) and item 3 as stated (slug mask + “default IP”).** Substitutes in `REVAMP/PLAN.v3.md`.
