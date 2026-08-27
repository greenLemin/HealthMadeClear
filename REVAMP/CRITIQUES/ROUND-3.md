# HealthMadeClear Launch Revamp — Panel Critique: Round 3

**Document Under Review:** `REVAMP/PLAN.v3.md` (2026-08-27)  
**Review Panel:** Staff Engineer, Security Engineer, UX Lead, Clinical Content Reviewer (PharmD), Ruthless Project Manager  
**Objective:** Third-round adversarial evaluation to break Implementation Plan v3, expose hidden unit/arithmetic mismatches, strict-mode auth race conditions, viewport overflows in Spanish locale, clinical omissions, and schedule fragmentation.

---

## CRITIC 1 — Staff Engineer

_Focus: Feasibility, hidden complexity, framework/DB behavior, invalid technical assumptions._

### 1. 🔴 Phase 6 (§9.1) & Phase 5 (§8.1) — Quiz Score Unit Inversion Causes 1600% Dashboard Average & 100% Pass Rates

- **Target Section:** Phase 6 — §9.1 Scope (`mutations.ts`, `progress.ts`), Phase 5 — §8.1 Scope (`guestProgress.ts`), and `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx`.
- **Problem:** In `QuizClient.tsx` (line 61 & line 122), `score` is calculated as a percentage:
  ```ts
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0; // e.g. 80
  saveQuizAttempt(quiz.id, lessonId, score, total, answerArray); // passes score=80, maxScore=5
  ```
  `score` is 0..100 (percentage) while `maxScore` is the question count (e.g. 5).
  1. In `mutations.ts` (line 69) and `guestProgress.ts` (line 104), pass status is evaluated as:
     `const passed = score >= maxScore * 0.7;`
     When a user scores 1 out of 5 (20%), `score` is 20 and `maxScore` is 5. `20 >= 5 * 0.7` (`20 >= 3.5`) evaluates to `true`. Every user who answers at least one question correctly is falsely marked as `passed: true`.
  2. In `src/lib/dashboard/progress.ts` (line 46) and `quizzes.ts` (line 57), average score is calculated as:
     `const rawAverage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;`
     With `totalScore = 80` and `totalMaxScore = 5`, `(80 / 5) * 100` calculates to **`1600%`**. The dashboard displays an average quiz score of 1600%.
- **Suggested Fix:** Standardize the quiz score contract across all layers in Phase 6:
  - Option A (Recommended): `QuizClient.tsx` passes `score: correctCount, maxScore: total` (e.g. `4, 5`). `mutations.ts` calculates `passed = (score / maxScore) >= (quiz.passScore / 100)`. UI displays `Math.round((score / maxScore) * 100)`.
  - Option B: `QuizClient.tsx` passes `score: percentage, maxScore: 100`. `mutations.ts` evaluates `passed = score >= 70`. `dashboard/progress.ts` averages `totalScore / quizAttempts.length`.
    Explicitly update `QuizClient.tsx`, `mutations.ts`, `guestProgress.ts`, and `dashboard/progress.ts` in Phase 6 scope to enforce this unit consistency.

---

### 2. 🔴 Phase 6 (§9.1) — Dashboard Completed Lessons Tab Queries Hardcoded Suffix `${id}-quiz`, Returning Zero Quiz Scores

- **Target Section:** Phase 6 — §9.1 Scope & `src/lib/dashboard/progress.ts` (`getCompletedLessonsPaginated`).
- **Problem:** In `src/lib/dashboard/progress.ts` (lines 102 & 129):
  ```ts
  const pageQuizIds = pageLessonIds.map((id) => `${id}-quiz`);
  // ...
  const quizId = `${p.lesson_id}-quiz`;
  return { ... quizScore: bestQuizScores.get(quizId) ?? null };
  ```
  `quizBundles` and `QuizClient` save attempts where `quiz_id === lessonId` (e.g. `"understanding-prescription-labels"`, with **no** `-quiz` suffix).
  The database query `supabase.from("quiz_attempts").select(...).in("quiz_id", pageQuizIds)` returns 0 rows. As a result, `quizScore` on the completed lessons dashboard tab is always `null` (`—`), completely hiding quiz scores from users who passed quizzes.
- **Suggested Fix:** In Phase 6 §9.1, include `src/lib/dashboard/progress.ts` in scope. Replace `pageLessonIds.map((id) => `${id}-quiz`)` with `pageLessonIds` (and map both `id` and `${id}-quiz` for legacy records).

---

### 3. 🔴 Phase 2 (§5.1, §5.2) — React 19 StrictMode Double-Mount Triggers `invalid_grant` on Single-Use PKCE `code` in `ResetPasswordClient`

- **Target Section:** Phase 2 — §5.1 Scope & §5.2 Step 4 (`ResetPasswordClient.tsx`).
- **Problem:** In Next.js 16 with React 19 StrictMode, `useEffect` runs twice on component mount. Supabase PKCE authorization codes are strictly single-use.
  When `ResetPasswordClient` mounts with `?code=abc`, the first `useEffect` call initiates `supabase.auth.exchangeCodeForSession("abc")`. The second mount fires immediately with the same `window.location.search`. The second exchange fails with Supabase error `invalid_grant: "Auth code already used"`, triggering `setError(t("errorGeneric"))` and wiping out the form for a user who clicked a valid reset link.
- **Suggested Fix:** In `ResetPasswordClient.tsx`, wrap the exchange in an `exchangedRef = useRef(false)` guard:
  ```ts
  if (exchangedRef.current) return;
  exchangedRef.current = true;
  ```
  Immediately after successful code detection, strip the code from the address bar via `window.history.replaceState({}, "", window.location.pathname)` to prevent re-execution across client navigation or state re-renders.

---

### 4. 🟡 Phase 14 (§17.1, §17.2) — Server-Side Sync Loaders in Next.js 16 Static Export

- **Target Section:** Phase 14 — §17.1 Scope & §17.2 Step 4 (`src/lib/lessons/loadLessons.ts`, `src/data/lessons.ts`).
- **Problem:** `generateStaticParams` in `src/app/[locale]/learn/[slug]/page.tsx` executes synchronously at build time. If `loadLessons.ts` attempts to dynamically switch modules without distinct static entrypoints per locale, Turbopack / Webpack may hoist the imports or bundle both locales anyway into the server chunk.
- **Suggested Fix:** Maintain distinct static server bundle exports (`loadLessons.en.ts` and `loadLessons.es.ts`) imported directly by server route handlers based on `params.locale`, ensuring zero dynamic import overhead during static site generation.

---

## CRITIC 2 — Security Engineer

_Focus: RLS, auth, injection, privacy of health-adjacent data, rate limiting._

### 1. 🔴 Phase 1 (§4.3) & Phase 9 (§12.1) — Account Deletion via `delete_user` RPC Leaves Active Stateless JWT Sessions Unrevoked

- **Target Section:** Phase 1 (§4.3 Step A.2) & Phase 9 (§12.1 Scope, `SettingsClient.tsx`).
- **Problem:** When `delete_user` deletes the row in `auth.users`, foreign key cascades delete all profile and progress rows. However, the client's current Supabase access token (JWT) remains cryptographically valid until its expiration (up to 1 hour).
  If `SettingsClient` executes `supabase.auth.signOut()` after the user row is deleted, the backend session revocation call in Supabase Auth may throw an error because the user record no longer exists in `auth.users`. If unhandled, local session cookies remain active in the browser, allowing continued access to cached routes.
- **Suggested Fix:** In `SettingsClient.tsx`, execute local auth clearing (`supabase.auth.signOut({ scope: 'local' })` or explicitly clear all Supabase auth cookies and storage keys) in a `finally` block following `rpc('delete_user')`. Catch and suppress user-not-found errors during the post-deletion sign-out cleanup.

---

### 2. 🟡 Phase 3 (§6.1, §6.2) — Contact Submissions PII Storage vs GDPR / CCPA Right to Erasure

- **Target Section:** Phase 3 — §6.2 Privacy copy spec (`privacy.collectBodyContact`).
- **Problem:** The proposed privacy copy states: _"Deleting your account does not delete contact messages you already sent."_ While contact messages are unlinked from learning accounts, they contain identifiable PII (`name`, `email`, `message`). Under GDPR Article 17 and CCPA, users retain the legal right to request erasure of their submitted contact records.
- **Suggested Fix:** Add explicit contact instruction to `privacy.collectBodyContact`: _"Contact submissions are retained separately for customer support. To request deletion of submitted messages, contact privacy@healthmadeclear.com."_

---

### 3. 🟡 Phase 16 (§19.1) — Sentry Server-Side Ingest Lacks Flood Throttle

- **Target Section:** Phase 16 — §19.1 (`src/lib/errorReporting.ts` `reportServerError`).
- **Problem:** Direct HTTP POST ingestion to Sentry in serverless functions without an in-memory throttle allows a database outage to spawn thousands of outbound HTTP requests, causing serverless function timeout and Sentry quota exhaustion.
- **Suggested Fix:** Add a sliding-window rate limiter in `reportServerError` (e.g. max 5 Sentry reports per 10-second window per runtime container).

---

## CRITIC 3 — UX Lead

_Focus: Visual polish, responsive viewports, contrast, layout stability, first-time user perception._

### 1. 🔴 Phase 10 (§13.1) — Header Inline Navigation at `xl` (1280px) Overflows and Wraps on Spanish (`/es`)

- **Target Section:** Phase 10 — §13.1 Scope (`Header.tsx`).
- **Problem:** Phase 10 changes primary nav visibility from `2xl:flex` (1536px) to `xl:flex` (1280px) with 8 nav items.
  In Spanish (`/es`), translated labels are substantially wider:
  - "Learning Paths" -> "Rutas de aprendizaje"
  - "Visit Planner" -> "Planificador de visitas"
  - "Visit Checklist" -> "Lista de verificación"
  - "Care Guide" -> "Guía de atención"
    At 1280px viewport width, 8 Spanish navigation labels plus the logo, language toggle, theme toggle, and login button total ~1340px of intrinsic width. This causes horizontal overflow or ugly two-line wrapping in the header bar between 1280px and 1440px.
- **Suggested Fix:** In `Header.tsx`, between 1280px and 1440px (`xl`), collapse secondary tools ("Visit Planner", "Visit Checklist", "Care Guide") into a single "Herramientas" / "Tools" dropdown, OR keep 4 core items ("Learn", "Paths", "Tools", "Glossary") visible at `xl` and render the expanded 8-item list only at `2xl` (1536px+).

---

### 2. 🟡 Phase 13 (§16.1) — Article Desktop Sticky TOC Overlaps Heading Targets

- **Target Section:** Phase 13 — §16.1 Scope (`ArticlePageClient.tsx`).
- **Problem:** The plan sets `scroll-mt-24` (96px) on article section headings. With a fixed header height of 80px (`h-20`) plus top padding, clicking a TOC anchor scrolls the heading to within 16px of the header bar, clipping top borders and visual whitespace.
- **Suggested Fix:** Increase heading anchor scroll margin to `scroll-mt-32` (`128px`) on all article section targets.

---

### 3. 🟡 Phase 12 (§15.1) & Phase 15 (§18.1) — Visit Planner Print Styles Missing Forced Background Color Rendering

- **Target Section:** Phase 12 (§15.1, `Step3Review.tsx`) & Phase 15 (§18.1, `PrintButton.tsx`).
- **Problem:** Browsers default to `print-color-adjust: economy`, stripping light background colors and rendering borders faintly when users print the Visit Plan or Care Guide.
- **Suggested Fix:** Add `print:border-neutral-900 print:text-black print:[print-color-adjust:exact]` to printable review containers.

---

## CRITIC 4 — Clinical Content Reviewer (PharmD Persona)

_Focus: Medical accuracy, health literacy, disclaimers, triage liability, patient safety._

### 1. 🔴 Phase 4 (§7.2) — Care Guide "Chest Pain" Scenario Omits Atypical ACS Presentations and Self-Treatment Dangers

- **Target Section:** Phase 4 — §7.2 Care-guide copy spec (`scenarioChestPainBody`).
- **Problem:** The proposed text is: _"Sudden chest pressure, pain spreading to arm or jaw, or trouble breathing — call 911 immediately."_
  Clinically, acute coronary syndromes (ACS) frequently present atypically in women, elderly patients, and diabetics (e.g. unexplained shortness of breath, cold sweats, nausea, back/neck discomfort without crushing chest pain). Furthermore, patients frequently delay calling 911 while attempting self-treatment with antacids. Omitting atypical symptoms and failing to explicitly warn against waiting or self-medicating creates life-threatening triage risk.
- **Suggested Fix:** Update `scenarioChestPainBody` (EN + ES):
  - **EN:** _"Chest pressure, tightness, pain radiating to the jaw, neck, back, or arm, sudden shortness of breath, unexplained cold sweats, or dizziness are medical emergencies. Do not wait to see if symptoms improve and do not attempt self-treatment — in the United States, call 911 immediately."_
  - **ES:** _"Presión en el pecho, dolor que se extiende a la mandíbula, cuello, espalda o brazo, falta de aire repentina, sudores fríos o mareos son emergencias médicas. No espere a ver si los síntomas mejoran ni tome remedios caseros — en los Estados Unidos, llame al 911 de inmediato."_

---

### 2. 🟡 Phase 8 (§11.1) — Clinical Citation Block Omission of Annual Review Cadence

- **Target Section:** Phase 8 — §11.1 Scope (`ClinicalCitationBlock.tsx`).
- **Problem:** If a review date shows "August 2025" without context, users may perceive the education as outdated even though clinical guidelines (FDA/CDC) operate on annual review cycles.
- **Suggested Fix:** Add a standard metadata subtitle in `ClinicalCitationBlock`: _"Clinically reviewed on an ongoing annual schedule. Sources: [Agencies]."_

---

### 3. 🟡 Phase 4 (§7.2) — Care Guide Missing 988 Suicide & Crisis Lifeline

- **Target Section:** Phase 4 — §7.2 Care-guide copy spec (`emergencyBody`, `whenInDoubtBody`).
- **Problem:** Emergency definitions list physical emergencies but omit acute behavioral and mental health crises.
- **Suggested Fix:** Add to `emergencyBody` and `whenInDoubtBody`: _"For mental health crises or emotional distress, call or text 988 (Suicide & Crisis Lifeline) or visit the nearest emergency room."_

---

## CRITIC 5 — Ruthless Project Manager

_Focus: 4-day scope realism, dependency deadlocks, merge ordering, rollback feasibility._

### 1. 🔴 Phase 13 vs Phase 16 — Unnecessary Fragmentation of `HomeClient.tsx` Across Day 4

- **Target Section:** Phase 13 (§16.1 Scope) vs Phase 16 (§19.1 Scope).
- **Problem:** `src/app/[locale]/HomeClient.tsx` is edited in Phase 13 for mobile DOM order (`<Hero />` above video), and then reopened in Phase 16 for video `preload="none"` and `prefers-reduced-motion`. Touching the same component in two separate PRs on Day 4 creates merge conflict overhead and duplicates browser testing cycles.
- **Suggested Fix:** Consolidate all video behavior changes (`preload="none"`, `prefers-reduced-motion`, mobile DOM order) into Phase 13. Remove `HomeClient.tsx` from Phase 16 scope.

---

### 2. 🟡 Phase 12 (§15.1) — Visit Planner ID Migration Lacks Non-Destructive Storage Shim

- **Target Section:** Phase 12 — §15.1 Scope & §15.5 Rollback.
- **Problem:** Phase 12 updates `localStorage['hmc-visit-planner']` to store question IDs. If Phase 12 is rolled back, the previous client code cannot parse ID strings and renders raw ID tokens (`new-symptom:2`) directly to users.
- **Suggested Fix:** In Phase 12, store question IDs in a new versioned key (`hmc-visit-planner-v2`) while preserving read fallback for legacy strings.

---

### 3. 🟡 Day 3 Workload Concentration (Phases 8, 10, 11, 12)

- **Target Section:** §3 (Four-day calendar, Day 3).
- **Problem:** Day 3 spans 4 major phases (Citations MDX, Header/404, Tap targets/Glossary A-Z, Search/Planner). Any delay on Day 3 puts Day 4 under extreme pressure.
- **Suggested Fix:** Shift Phase 10 (Header/404) or Phase 11 (Tap targets) to Day 2 afternoon if Phase 6 and Phase 5 complete ahead of schedule.

---

## Panel Verdict Table

| Critic Persona        | Verdict   | Blocking Items (🔴)                                                                                                                                                                                                                                                    |
| --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Staff Engineer**    | **BLOCK** | 1. Quiz score unit inversion (Percentage vs Count -> 1600% avg score & false 100% pass rates).<br>2. Completed lessons tab queries hardcoded `${id}-quiz` instead of `lessonId`.<br>3. React 19 StrictMode double-mount `invalid_grant` on single-use PKCE reset code. |
| **Security Engineer** | **BLOCK** | 4. `delete_user` RPC leaves unrevoked client JWT/cookie without clean local sign-out handling.                                                                                                                                                                         |
| **UX Lead**           | **BLOCK** | 5. Header 8-item inline nav overflows and wraps at `xl` (1280px) in Spanish (`/es`).                                                                                                                                                                                   |
| **Clinical Reviewer** | **BLOCK** | 6. Care guide chest pain copy omits atypical ACS presentations and self-treatment warnings.                                                                                                                                                                            |
| **Ruthless PM**       | **BLOCK** | 7. Unnecessary fragmentation of `HomeClient.tsx` video logic split across Phase 13 and 16 on Day 4.                                                                                                                                                                    |

### Overall Implementation Gate: **NO (BLOCKED)**

Implementation must not start until the 7 blocking items (🔴) are reconciled in the implementation plan contract.

---

## Cursor/Grok Second Opinion

**Reviewer:** Principal engineer (skeptical). Claims checked against current tree (`QuizClient.tsx`, `mutations.ts`, `guestProgress.ts`, `dashboard/progress.ts`, `quizBundles.en.ts`, `Header.tsx`, `ResetPasswordClient.tsx`, `SettingsClient.tsx`, `AuthProvider.tsx`, `HomeClient.tsx`, `next.config.mjs`, message catalogs), not screenshots.  
**Documents:** `REVAMP/PLAN.v3.md` + this panel log.  
**Date:** 2026-08-27  
**Disposition key:** **ACCEPT** = v4 must change. **REJECT** = critique wrong or overblown; v4 keeps v3 and says why. **PARTIAL** = real issue, wrong size/severity/fix.

v3 already closed Round 1–2 launch-killers (CF-1…CF-16). Round 3 still blocks — two 🔴s are real unit/identity bugs the plan never named, one 🔴 uses invented Spanish nav copy, one 🔴 blames StrictMode for a consume-once hole that is real for other reasons, and the dangerous ones are again the **intersections**.

---

### Wrong or overblown

**UX 🔴 1 — Spanish header overflow from “Rutas de aprendizaje / Planificador de visitas / Lista de verificación / Guía de atención” — WRONG LABELS.**  
`getNavItems` (`Header.tsx:49–59`) is eight **short** catalog links: home, learn, articles, paths, tools, dashboard, glossary, about. Spanish is `Inicio`, `Aprender`, `Artículos`, `Rutas`, `Herramientas`, `Panel`, `Glosario`, `Acerca de` (`src/messages/es.json` `nav.*`). Those four long tool strings are **not in the header**. Several ES labels are _shorter_ than EN (`Panel` vs `Dashboard`, `Rutas` vs `Paths`).  
v3 already: `xl:flex` + compact-at-xl (tagline `hidden 2xl:block`, login icon-only until `2xl`, `NavLink` `xl:px-2`) + Playwright `scrollWidth <= clientWidth` at 1280 and 1440.  
**Reject:** Tools dropdown / 4-item `xl` list. **Keep** compact-at-xl. **Cheap hole:** Playwright overflow is specified on `/en` only — add `/es` at 1280 and 1440 so `Herramientas` + `Acerca de` cannot false-green.

**Staff 🔴 3 — React 19 StrictMode double-mount `invalid_grant` in production — WRONG MECHANISM.**  
`next.config.mjs` sets `reactStrictMode: true`. StrictMode remount + double `useEffect` is **development only**. Production Next does not remount for that reason. Canonical recovery in v3 is `ResetPasswordClient` exchanging `?code=` (`§5.2`). Current HEAD only reads **hash** `#code=` (`ResetPasswordClient.tsx:24–36`) with deps `[supabase, t, setError]` and **no** consume-once guard.  
The production bug is **not** StrictMode. It is: (1) PKCE codes are single-use; (2) v3’s session-aware reset (CF-10) will update auth state after a successful exchange; (3) if `supabase` / `t` / a new `user` dep retriggers the effect while `?code=` is still in the URL, the **second** `exchangeCodeForSession` is `invalid_grant` in production too. Bookmarking the URL is the same hole.  
**Reject:** “StrictMode ships broken reset.” **Accept:** consume-once `exchangedRef` + `history.replaceState` strip of `code` / `token_hash` after a successful detect (dev StrictMode becomes the cheap test of the same contract).

**Staff 🔴 1 arithmetic — “1600% and 100% pass rates” — DIRECTION RIGHT, WORDING HIGH.**  
`QuizClient.tsx:61,122` really does `score = round(correctCount/total*100)` then `saveQuizAttempt(quiz.id, lessonId, score, total, …)`. `mutations.ts:69` and `guestProgress.ts:104` really do `passed = score >= maxScore * 0.7`. `getUserProgressSummary` really does `(totalScore/totalMaxScore)*100`. For a 5-question 80% attempt that is **1600%**.  
Not “every attempt passes”: 0-correct still fails (`0 >= 3.5` is false). On this corpus `passScore` is 70 and quizzes are typically ≤11 questions, so **any single correct answer** writes `passed: true` to Postgres while the UI uses `score >= quiz.passScore` (`QuizClient.tsx:62`) and can show **FAIL**. UI vs DB disagreement is the launch bug, not a literal 100% pass rate.  
v3 Phase 6 unique-by-`quiz_id` **does not mention units**. Dashboard tests (`progress.test.ts`) already assume count/count (`score: 6, max_score: 10`) — they will stay green while production writes 80/5.

**Staff 🟡 4 — force `loadLessons.en.ts` / `.es.ts` now — ALREADY v3 FALLBACK.**  
v3 §17.1: keep sync server loaders; if a static `switch` still dual-packs, use separate server files imported from `page.tsx`. Making that the unconditional first step is extra SSG churn inside a 3-hour Day-4 timebox. **Reject** as new 🟡 work. Keep the fallback.

**UX 🟡 2 — `scroll-mt-24` clips under `h-20` — OVERBLOWN.**  
Header inner bar is `min-h-[76px]` (`Header.tsx:110`), not a fixed `h-20`. `scroll-mt-24` = 96px → ~20px leftover. v3 already named `scroll-mt-24` for this. Bumping to `scroll-mt-32` is taste, not a clip bug. **Reject.**

**Clin 🟡 2 — “Clinically reviewed on an ongoing annual schedule” — OVERBLOWN / CONFLICTS WITH VALIDATOR.**  
Phase 8 already shows `lastReviewed` and **fails** content older than 400 days. A canned “annual schedule” line next to a 13-month date is a new lie. **Reject.**

**PM 🟡 3 — move Phase 10 or 11 onto Day 2 — FIGHTS CF-16.**  
Day 2 is already P4 + **P6 then P5** + P7. Stuffing Header/404 onto the quiz-unique day recreates the overload Round 2 just unpacked. Slip protocol already exists. **Reject** as a calendar move. Optional: if P7 lands early, **branch** P10 (merge still Day 3).

**Sec 🟡 2 / Clin 🟡 3** are real but not 🔴s — see Valid.

---

### Valid (keep as 🔴 or cheap 🟡)

| ID                                    | Verdict                            | Why                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff 🔴 1 quiz score units           | **ACCEPT** (trim the “100%” claim) | Percentage `score` + question-count `maxScore`. `passed` and dashboard average are both wrong. UI `passScore` (70) ≠ persist formula.                                                                                                                                                                                                                                                                                 |
| Staff 🔴 2 `${id}-quiz`               | **ACCEPT**                         | `quizBundles.en.ts` ids equal `lessonId` (`understanding-prescription-labels`). `QuizClient` saves `quiz.id`. `getCompletedLessonsPaginated` queries `${id}-quiz` (`progress.ts:102,129`) → 0 rows → `quizScore: null`. `quizzes.ts` / `activity.ts` `replace("-quiz")` is a no-op on live ids (those paths work). Tests encode the fictional suffix.                                                                 |
| Staff 🔴 3 PKCE consume-once          | **PARTIAL**                        | Real hole; StrictMode is the wrong villain. Guard + strip query.                                                                                                                                                                                                                                                                                                                                                      |
| Sec 🔴 1 `delete_user` then `signOut` | **ACCEPT**                         | `SettingsClient.tsx:79–89`: rpc then `await signOut()` with **no** try/finally. `AuthProvider.signOut` is global `supabase.auth.signOut()` + `router.push("/")`. After `DELETE FROM auth.users`, GoTrue logout can error; if that throw escapes, cookies stay, JWT still authenticates `auth.uid()` for ≤1h, and RLS inserts can recreate rows under the deleted UUID. Phase 1 throwaway gate tests SQL, not cookies. |
| Clin 🔴 1 chest-pain atypical ACS     | **ACCEPT**                         | v3 `scenarioChestPainBody` is only “Keep US 911.” Current copy is exactly the panel quote. Sore throat got a paste-ready red-flag string (CF-14). Chest pain did not. Implementers will ship the old one-liner.                                                                                                                                                                                                       |
| PM 🔴 1 `HomeClient` split            | **ACCEPT**                         | v3 CF-11 left `preload` / reduced-motion in Phase 16 on the same `<video>` Phase 13 reorders. Day 4 already has leftover P13 + P14 timebox + P15 + P16. Ten lines; move them into P13.                                                                                                                                                                                                                                |
| Sec 🟡 2 contact erasure instruction  | **ACCEPT**                         | v3 already says contact rows survive account delete. `privacy.privacyEmail` is `privacy@healthmadeclear.com`. One sentence. GDPR/CCPA erasure still exists for unlinked PII.                                                                                                                                                                                                                                          |
| Sec 🟡 3 Sentry server flood          | **ACCEPT**                         | `reportServerError` today is `console.error` only (`errorReporting.ts:149–154`). v3 adds raw HTTP ingest with **no** cap. Cheap in-memory window.                                                                                                                                                                                                                                                                     |
| UX 🟡 3 print backgrounds             | **ACCEPT**                         | No `print-color-adjust` in tree. Add on printable review + print CSS, not a new PDF lib.                                                                                                                                                                                                                                                                                                                              |
| Clin 🟡 3 988 on care guide           | **ACCEPT** (one sentence)          | 988 already lives in depression/anxiety/stress **lessons**. Care-guide `emergencyBody` / `whenInDoubtBody` are physical-only. Do not turn the care guide into a crisis directory. US-qualify.                                                                                                                                                                                                                         |
| PM 🟡 2 planner versioned key         | **ACCEPT**                         | v3 §15.5 already admits rollback shows raw IDs. Write `hmc-visit-planner-v2`; keep read-fallback on `hmc-visit-planner`.                                                                                                                                                                                                                                                                                              |

---

### Combined flaws (v3 ∩ panel — these are the launch-killers this round)

**CF-17 — Percentage write ∪ count/count persist math ∪ 015 “keep highest score” ∪ P6 unique row ∪ P7 `perfect-quiz`.**  
Panel timed the 1600% average to dashboard aggregation. v3 P6 “unique by `quiz_id` keeping max score” **freezes whatever integer is in `score`**. Live writes are `80` with `max_score = 5`. Dedupe `a.score < b.score` then unique → one row of 80/5 **forever**. Later Option-A writes of `4/5` lose (`Math.max(80,4) = 80`; skip-lower from CF-13 never updates). `perfect-quiz` is `quizScore === quizMaxScore` (`achievements.ts:112–116`) → 80 === 5 is false, so Phase 7 “wires” a badge that cannot fire. Dashboard tests stay green on fictional 6/10 fixtures.  
**v4:** Canonical contract **Option A**: `score` = correct count, `max_score` = question count, `passed = max_score > 0 && score/max_score >= 0.7` (matches MDX `passScore: 70`). `QuizClient` keeps a **local** percent for UI (`score >= quiz.passScore`) and passes `correctCount, total` into `saveQuizAttempt`. `recordQuizScore` still stores **percent** for guest `QuizScore` (v3: do not merge into guest attempts). **015 before dedupe:** `UPDATE quiz_attempts SET score = LEAST(max_score, GREATEST(0, ROUND(score * max_score / 100.0)::int)) WHERE max_score > 0 AND score > max_score;` then recalc `passed`. Guest migrate uses the same normalize. Shared helper `src/lib/quizScore.ts`. Tests: production-shaped `(score=4, max_score=5)` **and** a percent-poison fixture that normalize repairs. **Do not** assert `ProgressClient`’s clamped string — `clampPercent(1600) === 100` hides the inversion. `getQuizBestScore` must use `toPercent` after the unit fix.

**CF-18 — `${lessonId}-quiz` query ∪ live `quiz.id === lessonId` ∪ P6 summary-only dashboard work ∪ tests that encode the suffix.**  
Phase 6 already opens `dashboard/progress.ts` for unique-best aggregation. It never mentions `getCompletedLessonsPaginated`. Summary can look “fixed” (still 1600% until CF-17) while the completed-lessons tab stays `—`. `activity.ts` / `quizzes.ts` strip `-quiz` and therefore **work** on live ids — do not “fix” them by requiring the suffix.  
**v4:** Query `in (lessonId, lessonId + "-quiz")`. Display percent via `score/max_score`. Do **not** rewrite stored `quiz_id` values. Update fixtures to include a production id (`understanding-prescription-labels`) plus a legacy `-quiz` row.

**CF-19 — Session-aware reset (CF-10 / CF-2) ∪ client PKCE exchange ∪ effect deps ∪ code left in the URL.**  
v3 tells the agent to `exchangeCodeForSession(code)` when `?code=` is present, then separately wait on `useAuth()`. Successful exchange updates the session → `AuthProvider` re-renders → `supabase` / `t` in the effect deps can fire again → `invalid_grant` → `setError(t("errorGeneric"))` **wipes a form that already had a session**. StrictMode is how engineers will see it on Day 1; production users see it on locale change, Fast Refresh, or a second paint with the same URL.  
**v4:** `exchangedRef`. After detecting `code` or `token_hash`, `replaceState` to the pathname (keep locale). Tests: two effect runs → one exchange; success path has no `code` in `location.search`.

**CF-20 — Phase 1 `delete_user` gate ∪ Phase 9 “signOut after success (already)” ∪ AuthProvider global logout ∪ Phase 5 `clearGuestProgress` on signOut.**  
Throwaway RPC in P1 proves Postgres. Settings is the product path. If `signOut()` throws, P5’s guest-clear never runs and cookies remain — “deleted” account still in Dashboard, guest keys still on a shared machine.  
**v4:** After rpc success, `supabase.auth.signOut({ scope: "local" })` in `try/finally`. Ignore logout errors. Always clear guest keys + cookies + redirect. **Do not** use `AuthProvider.signOut` for this path (it is global + navigates + can throw before cleanup). Unit test: rpc ok + `signOut` rejects → still redirected, session mock empty.

**CF-21 — Compact-at-xl ∪ Playwright overflow on `/en` only ∪ real (short) Spanish labels ∪ signup still labeled at `xl`.**  
Panel math used labels that are not in the nav. Remaining holes: test locale, and signup `ButtonLink` is `2xl:hidden` so “Crear cuenta” still shows at 1280 once nav goes `xl:flex`.  
**v4:** Same compact-at-xl. Signup `xl:hidden`. Add `/es` overflow assertions at 1280 and 1440. No dropdown.

**CF-22 — §7.2 “keep US 911” ∪ no chest-pain spec string ∪ CF-14 paste-the-example rule.**  
Sore throat: implementers paste airway flags. Chest pain: implementers paste nothing new. Atypical ACS (women / older adults / diabetes: sudden SOB, cold sweats, nausea, jaw/neck/back pain without crushing pressure) + “do not wait / do not self-treat with antacids” stay out. Voice stays education-not-triage: this is the same 911-class exception already used for drooling/stridor.  
**v4:** Paste-ready EN+ES `scenarioChestPainBody`. Tests: `/jaw|neck|back|sweat|911/i` (EN) + ES equivalents; not only `arm`.

**CF-23 — P13 DOM order of `/HMC_Video.mp4` ∪ P16 `preload` / `prefers-reduced-motion` ∪ Day 4 leftover P13.**  
v3 documented the split. Panel is right that two PRs on one file on the packed day is unpaid merge tax. Scope is not cut — the attributes move.  
**v4:** Phase 13 owns order + `preload="none"` + reduced-motion (no autoplay, show poster). Phase 16 drops `HomeClient.tsx`.

---

### 🔴 disposition (implementation cannot start on v3)

| Panel 🔴                         | Disposition                  | v4 action                                                     |
| -------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| Quiz score unit inversion        | **ACCEPT** (wording trimmed) | Option A + 015 normalize + `QuizClient` in P6 + shared helper |
| Completed tab `${id}-quiz`       | **ACCEPT**                   | Query both ids; fix tests                                     |
| StrictMode PKCE `invalid_grant`  | **PARTIAL**                  | Consume-once + strip URL; not a StrictMode production story   |
| `delete_user` leaves JWT/cookies | **ACCEPT**                   | Local `signOut` in `finally`; don’t use AuthProvider path     |
| Header ES overflow at `xl`       | **REJECT as stated**         | Keep compact-at-xl; add `/es` Playwright; no Tools dropdown   |
| Chest-pain atypical ACS          | **ACCEPT**                   | Spec strings EN+ES; tests                                     |
| `HomeClient` P13 vs P16          | **ACCEPT**                   | Move video attrs into P13                                     |

**Second-opinion verdict:** v3 **NO**. Do not implement from `REVAMP/PLAN.v3.md`. v4 must land CF-17…CF-23 plus accepted 🔴s.

**Rejected panel “mandatory” item 5 as stated (Tools dropdown / invented labels).** Substitute: `/es` overflow test. **Rejected StrictMode-as-production** framing; substitute consume-once.
