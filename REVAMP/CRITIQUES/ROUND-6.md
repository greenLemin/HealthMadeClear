# HealthMadeClear Launch Revamp — Panel Critique: Round 6

**Document Under Review:** `REVAMP/PLAN.v6.md` (2026-08-27)  
**Review Panel:** Staff Engineer, Security Engineer, UX Lead, Clinical Content Reviewer (PharmD), Ruthless Project Manager  
**Objective:** Sixth-round adversarial evaluation of Implementation Plan v6 to break the plan, find edge cases, and verify framework, security, UX, clinical, and schedule safety before launch execution.

---

## CRITIC 1 — Staff Engineer

_Focus: Feasibility, hidden complexity, framework/DB behavior, invalid technical assumptions._

### 1. 🔴 Phase 9 (§12.1) & `src/lib/supabase/middleware.ts` — Stale Cookie Clearance Headers Dropped by `NextResponse.redirect()`

- **Target Section:** Phase 9 — §12.1 Scope (`src/lib/supabase/middleware.ts`) & §12.3 Acceptance.
- **Problem:**
  Phase 9 specifies:

  > _"After `getUser()`: if the call resolves with `error`, expire cookies whose names match `/^sb-.*-auth-token/` (include chunked `sb-*-auth-token.0` suffixes) on `supabaseResponse` (`Max-Age=0; Path=/`)."_

  In `src/lib/supabase/middleware.ts` (lines 84–90):

  ```ts
  if (isDashboardRoute && !user) {
    const locale = pathname.split("/")[1] ?? "en";
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/auth/login`;
    loginUrl.searchParams.set("redirect", sanitizeRedirectPath(pathname));
    return NextResponse.redirect(loginUrl);
  }
  ```

  In Next.js App Router, `NextResponse.redirect()` constructs a **new** `NextResponse` instance. The cookie mutation headers (`Set-Cookie: ...; Max-Age=0`) previously attached to `supabaseResponse` are **not** automatically copied over to the redirect response!
  When an expired or deleted user accesses a dashboard route, `getUser()` resolves with an error, `supabaseResponse` marks the `sb-*` auth cookies as expired, but the middleware returns `NextResponse.redirect(loginUrl)`. The browser receives the 307 redirect with **no `Set-Cookie` expiration headers**, keeping the stale JWT intact in the browser.

- **Suggested Fix:**
  In `src/lib/supabase/middleware.ts`:
  ```ts
  if (isDashboardRoute && !user) {
    const locale = pathname.split("/")[1] ?? "en";
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/auth/login`;
    loginUrl.searchParams.set("redirect", sanitizeRedirectPath(pathname));
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Copy all cookie mutations from supabaseResponse to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }
  ```

---

### 2. 🟡 Phase 3 (§6.1.1) — Stream Chunk Concatenation on 0-Byte Payloads

- **Target Section:** Phase 3 — §6.1.1 Contact body reader (`route.ts`).
- **Problem:**
  The body reader specifies:
  ```ts
  const text = new TextDecoder().decode(chunks.length === 1 ? chunks[0] : concatUint8(chunks, totalBytes));
  ```
  If an empty request stream is received (`chunks.length === 0`, `totalBytes === 0`), `chunks.length === 1` evaluates to `false`, executing `concatUint8([], 0)`. While `new Uint8Array(0)` decodes to `""` and triggers a 400 in `JSON.parse`, `concatUint8` should explicitly guard against 0-length chunks to prevent array indexing overhead or edge-case undefined buffer allocations.
- **Suggested Fix:**
  In `concatUint8(chunks: Uint8Array[], totalBytes: number)`:
  ```ts
  function concatUint8(chunks: Uint8Array[], totalBytes: number): Uint8Array {
    if (chunks.length === 0 || totalBytes === 0) return new Uint8Array(0);
    const result = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return result;
  }
  ```

---

### 3. 🟡 Phase 14 (§17.1) — Static `switch` Import Bundling in Webpack/Turbopack

- **Target Section:** Phase 14 — §17.1 Scope (`src/lib/lessons/loadLessons.ts`).
- **Problem:**
  §17.1 suggests that server `getAllLessons(locale)` can use a `switch(locale)` without a shared `Record`. In Webpack, if both `lessonBundles.en` and `lessonBundles.es` are imported at the top level of `loadLessons.ts`, any module importing `loadLessons.ts` will statically include both bundles in that chunk.
- **Suggested Fix:**
  Use separate server files (`src/lib/lessons/loadLessons.en.ts` and `src/lib/lessons/loadLessons.es.ts`) or dynamic `import()` for client graph consumers, ensuring client components only import single-locale data.

---

## CRITIC 2 — Security Engineer

_Focus: RLS, auth, injection, privacy of health-adjacent data, rate limiting._

### 1. 🔴 Phase 9 (§12.1) & `clearLocalHealthData.ts` — Comprehensive Key Erasure on Shared Kiosk Devices

- **Target Section:** Phase 9 — §12.1 Scope (`src/lib/clearLocalHealthData.ts`).
- **Problem:**
  Phase 9 specifies clearing a hardcoded list of keys: `STORAGE_KEYS.completedLessons`, `quizScores`, `recentLessons`, `startedPaths`, `checklist`, `visitPlanner`, `hmc-glossary-lookups`, `hmc-visit-planner-v2`, and prefix `hmc_guest_*`.
  However, across project history and guest migrations, keys have used both hyphens and underscores (`hmc-completed-lessons`, `hmc_completed_lessons`, `hmc-quiz-scores`, `hmc_guest_quizAttempts`, `hmc_guest_completedLessons`).
  If a user on a public/shared device (e.g. community health kiosk or library computer) logs in and then deletes their account or logs out, any untracked or legacy health-adjacent key in `localStorage` or `sessionStorage` could leak sensitive condition/medication exploration history to the next person at that kiosk.
- **Suggested Fix:**
  In `src/lib/clearLocalHealthData.ts`, implement an allowlist-based wiper that deletes all `hmc*` storage items except non-sensitive user preferences:
  ```ts
  const PRESERVED_PREF_KEYS = new Set([
    "hmc-theme",
    "hmc-locale",
    "hmc-text-size",
    "hmc-simple-mode",
    "hmc_theme",
    "hmc_locale",
  ]);

  export function clearLocalHealthData(): void {
    const stores = [
      typeof window !== "undefined" ? window.localStorage : null,
      typeof window !== "undefined" ? window.sessionStorage : null,
    ];

    for (const store of stores) {
      if (!store) continue;
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < store.length; i++) {
          const key = store.key(i);
          if (key && (key.startsWith("hmc-") || key.startsWith("hmc_"))) {
            if (!PRESERVED_PREF_KEYS.has(key)) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach((k) => store.removeItem(k));
      } catch {
        // Storage access error handling
      }
    }
  }
  ```

---

### 2. 🟡 Phase 16 (§19.1) — Sentry Client Breadcrumb Scrubbing for Search Input Queries

- **Target Section:** Phase 16 — §19.1 Must-do (`src/lib/errorReporting.ts`).
- **Problem:**
  While Sentry user IP and URL query params are scrubbed, Sentry's default DOM breadcrumb listener captures input changes and click targets. If a user types health conditions or symptoms into the `<SearchDialog />` input field, Sentry breadcrumbs could record search terms in event payloads.
- **Suggested Fix:**
  In `src/lib/errorReporting.ts`, add a `beforeBreadcrumb` filter in `Sentry.init` that strips `data.value` from any `input` breadcrumbs or omits DOM interaction events on inputs matching `[type="search"]` or `[name="q"]`.

---

### 3. 🟡 Phase 1 (§4.3 Step A.3) — `display_name` Character vs Byte Length in Database Schema

- **Target Section:** Phase 1 — §4.3 Step A.3 (`014_launch_reconcile.sql`).
- **Problem:**
  Postgres `substring(... from 1 for 100)` slices 100 UTF-8 characters. If Spanish or international names use multi-byte characters, the string byte length can reach up to 400 bytes.
- **Suggested Fix:**
  Ensure client-side input validation and database TypeScript schemas in `src/types/database.ts` use string length (`val.length <= 100`) to remain consistent with Postgres character semantics.

---

## CRITIC 3 — UX Lead

_Focus: Visual polish, mobile responsive behavior, typography, touch targets, state transitions._

### 1. 🔴 Phase 13 (§16.1) & Mini-Spec §10.7 — Article Desktop TOC Layout Void on 1440px+ Monitors

- **Target Section:** Phase 13 — §16.1 Scope (`ArticlePageClient.tsx`) & Mini-Spec §10.7.
- **Problem:**
  Phase 13 specifies adding a desktop sticky Table of Contents (`w-60 sticky top-24`) alongside an article container constrained to `max-w-prose` (~65ch / ~650px).
  On standard desktop viewports (1440px and 1920px), if `<main className="max-w-prose">` and `<aside className="w-60 sticky">` are placed inside a standard 2-column grid (`grid-cols-[1fr_240px]` or `max-w-7xl`), the article text is pinned to the far left of the content area while the TOC is pinned to the far right. This creates an awkward **~350px empty dead zone** between the article prose and the TOC.
  To a desktop reader, the TOC feels visually disconnected from the article it is meant to navigate.
- **Suggested Fix:**
  In `ArticlePageClient.tsx`, constrain the parent grid container to a tight reading shell:
  ```tsx
  <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12 xl:gap-16">
    <main id="main-content" className="max-w-prose">
      {/* Article content */}
    </main>
    <aside aria-label={t("onThisPage")} className="hidden lg:block">
      <div className="sticky top-24 w-60">{/* TOC list */}</div>
    </aside>
  </div>
  ```
  This guarantees the TOC remains exactly 48px–64px to the right of the prose column regardless of screen width.

---

### 2. 🟡 Phase 12 (§15.1) — Search Dialog Height Clamping on Mobile Virtual Keyboards

- **Target Section:** Phase 12 — §15.1 Scope (`SearchDialog.tsx`).
- **Problem:**
  Phase 12 sets the search results container to `max-h-[calc(100dvh-14rem)]`. On mobile viewports (e.g. iPhone 390px), when the virtual keyboard appears, `100dvh` does not shrink on certain mobile browsers, causing the search dialog footer and lower result items to be occluded beneath the software keyboard.
- **Suggested Fix:**
  Use `max-h-[calc(100svh-12rem)]` with `overscroll-contain` so the search results scroll area dynamically fits within the visible viewport above the keyboard.

---

### 3. 🟡 Phase 10 (§13.1) — Root 404 Missing Bilingual Home Navigation

- **Target Section:** Phase 10 — §13.1 Scope (`src/app/not-found.tsx`).
- **Problem:**
  `src/app/not-found.tsx` is the root fallback outside `[locale]`. If a Spanish user hits a 404, clicking the home button redirects to `"/"` (defaulting to `/en`), losing their language preference.
- **Suggested Fix:**
  In `not-found.tsx`, provide bilingual button options ("Return Home / Volver al Inicio") or link to `/es` if `accept-language` indicates Spanish.

---

## CRITIC 4 — Clinical Content Reviewer (PharmD Persona)

_Focus: Clinical accuracy, drug safety, emergency escalations, plain language._

### 1. 🔴 Phase 4 (§7.2) & Phase 8 (§11.1) — Omission of National Poison Help Line (1-800-222-1222) in Medication Safety Contexts

- **Target Section:** Phase 4 — §7.2 Care-guide copy spec (`whenInDoubtBody`, `emergencyBody`) & Phase 8 — §11.1 (`understanding-prescription-labels`).
- **Problem:**
  The plan specifies 911 for medical emergencies and 988 for mental health crises. However, in health literacy education (specifically `understanding-prescription-labels`, `managing-multiple-medications`, and the Care Guide tool), unintentional medication errors (double dosing, confusing pediatric teaspoon/tablespoon liquid measures, accidental ingestion) are among the most common home health crises.
  Flooding an emergency department (911) for a non-toxic accidental ingestion is costly and traumatic; conversely, waiting to see if symptoms appear after taking the wrong medication can be fatal.
  The US **Poison Help Line (1-800-222-1222 / poisonhelp.org)** provides free, immediate, confidential, 24/7/365 expert toxicological guidance by medical professionals in English and Spanish.
- **Suggested Fix:**
  1. In MDX key takeaways for `understanding-prescription-labels` and `managing-high-blood-pressure`:
     - **EN:** `"For questions about accidental double doses, medicine mix-ups, or suspected poisoning, call US Poison Help at 1-800-222-1222 (free, confidential, 24/7)."`
     - **ES:** `"Para preguntas sobre dosis dobles accidentales, confusión de medicamentos o sospecha de intoxicación, llame al Centro de Control de Intoxicaciones de EE. UU. al 1-800-222-1222 (gratuito, confidencial, 24/7)."`
  2. In `whenInDoubtBody` (Care Guide): append: `"For medication errors or poisoning in the US, call 1-800-222-1222."`

---

### 2. 🟡 Phase 4 (§7.2) — Plain-Language Accessibility for Spanish Pediatric Dehydration Copy

- **Target Section:** Phase 4 — §7.2 (`homeCarePediatricNote` ES).
- **Problem:**
  The ES translation in §7.2 uses the term `"somnolencia extrema"`. In clinical communication with low-health-literacy caregivers, `"somnolencia"` is overly formal Latinate medical jargon.
- **Suggested Fix:**
  Update `homeCarePediatricNote` ES to use plain language:
  `"Cualquier temperatura de 100.4°F (38°C) o más en bebés menores de 3 meses, o signos de deshidratación en niños pequeños (sin pañales mojados por 8 horas, llanto sin lágrimas, ojos hundidos, o si es muy difícil despertarlos), se tratan como emergencias médicas en los Estados Unidos — no como observación en el hogar. En los Estados Unidos, llame al 911."`

---

### 3. 🟡 Phase 15 (§18.1) — Printed Care Guide Timestamp for Clinical Currency

- **Target Section:** Phase 15 — §18.1 Scope (`CareGuideClient.tsx`).
- **Problem:**
  Patients frequently print health tools to post in home environments (e.g. refrigerator). Over time, guidelines or emergency phone numbers can change.
- **Suggested Fix:**
  In the print-only footer of `CareGuideClient.tsx`, add a clear timestamp:
  `"Printed from Health Made Clear (healthmadeclear.com). Educational content reviewed August 2026."`

---

## CRITIC 5 — Ruthless Project Manager

_Focus: Scope realism, 4-day calendar feasibility, execution sequencing, dependency deadlocks._

### 1. 🔴 Day 1 Deployment Sequencing: Deploy Frontend Phase 9 Concurrently with Phase 1 `014` DB Apply

- **Target Section:** Section 3 — Four-day calendar (Day 1) & Phase 1 (§4.3 Step E) vs Phase 9 (§12.1).
- **Problem:**
  The Day 1 calendar lists: `1 (014 only, Gate 0 first), 2, 3, 9 (after P2)`.
  If Phase 1 `014_launch_reconcile.sql` is applied to production on Day 1 morning, the `delete_user` Postgres RPC becomes active.
  However, the production frontend `SettingsClient.tsx` is not updated until Phase 9 deploys. If a user triggers account deletion during the midday window before Phase 9 lands:
  1. The live client calls `rpc('delete_user')` without the `finally` local storage wipe.
  2. The user is deleted in Postgres, but the client retains all health data and stale JWT cookies without clean redirection.
- **Suggested Fix:**
  Explicitly mandate the Day 1 deployment order:
  - Branch and complete Phase 2 and Phase 9 PRs.
  - Deploy the frontend containing Phase 9 (`SettingsClient.tsx` `try...finally` + local health data wipe) **concurrently with or immediately prior to** applying `014_launch_reconcile.sql` to live production Supabase.

---

### 2. 🟡 Day 3 Delivery Throughput: Pipeline 4 Frontend PRs to Prevent CI Serial Blocking

- **Target Section:** Section 3 — Four-day calendar (Day 3).
- **Problem:**
  Day 3 schedules Phase 8, 10, 11, and 12. Running full Vitest, lint, typecheck, and Playwright suites across 4 separate PRs can consume over 60 minutes of CI wait time.
- **Suggested Fix:**
  Enforce continuous branch pipelining: While PR 10 is awaiting CI/review, immediately branch and begin PR 11 locally. Do not idle during automated testing runs.

---

### 3. 🟢 Day 4 Phase 14 Timebox Countdown Enforcement

- **Target Section:** Section 3 — Four-day calendar (Day 4) & Phase 14 (§17.1).
- **Problem:**
  Phase 14 has a 3-hour timebox (10:00–13:00). If webpack code-splitting incurs unexpected bundle graph issues, debugging past 13:00 threatens Phase 16 hardening (§19.1).
- **Suggested Fix:**
  If CI on `revamp/p14-*` is not 100% passing by 13:00 on Day 4, immediately commit/stash the branch without merging to `main`, and switch to `revamp/p16-hardening`.

---

## Verdict Table — Can Implementation Start?

| Critic                                   |  Status   | Blocking Items (🔴)                                                                                                                    |
| ---------------------------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------- |
| **CRITIC 1 — Staff Engineer**            | 🔴 **NO** | 1. Next.js App Router `NextResponse.redirect()` in middleware drops cookie clearance headers from `supabaseResponse`.                  |
| **CRITIC 2 — Security Engineer**         | 🔴 **NO** | 1. `clearLocalHealthData` must use regex-based pattern matching to guarantee complete erasure of all health data on shared kiosks.     |
| **CRITIC 3 — UX Lead**                   | 🔴 **NO** | 1. Article desktop layout grid must constrain max width to prevent a ~350px visual gap between prose and sticky TOC on 1440px screens. |
| **CRITIC 4 — Clinical Content Reviewer** | 🔴 **NO** | 1. Poison Help (1-800-222-1222) must be included in medication literacy lessons and Care Guide crisis resources.                       |
| **CRITIC 5 — Ruthless Project Manager**  | 🔴 **NO** | 1. Day 1 deployment order must pair Phase 9 frontend client deploy with Phase 1 `014` SQL application to prevent deletion gaps.        |

### Overall Verdict: **NO (Plan v6 needs 5 targeted fixes before implementation starts)**

Implementation cannot start on `REVAMP/PLAN.v6.md` until the **5 blocking 🔴 items** are resolved in `PLAN.v7.md`:

1. **Middleware redirect cookie retention:** Copy `supabaseResponse.cookies` to `NextResponse.redirect(loginUrl)`.
2. **Kiosk health data wipe:** Implement `/^hmc[-_]/` allowlist-based storage wiper in `clearLocalHealthData.ts`.
3. **Article TOC layout grouping:** Constrain parent container to `max-w-5xl` so TOC sits 48px from prose.
4. **Poison Help integration:** Add 1-800-222-1222 to medication lesson notes and Care Guide resources.
5. **Day 1 deployment alignment:** Ensure Phase 9 client safety lands before or concurrently with `014` SQL execution.

---

## Cursor/Grok Second Opinion

**Reviewer:** Principal engineer (skeptical). Claims checked against current tree (`src/lib/supabase/middleware.ts`, `middleware.test.ts`, `SettingsClient.tsx`, `AuthProvider` path via layout, `AppProviders.tsx`, `src/lib/preferences.ts`, `src/lib/guestProgress.ts`, `OnboardingDialog.tsx`, `SaveProgressBanner.tsx`, `ArticlePageClient.tsx`, `tailwind.config.ts` `maxWidth.container`, `src/app/not-found.tsx`, `src/lib/errorReporting.ts`, `src/lib/lessons/loadLessons.ts`, `content/lessons/en/{understanding-prescription-labels,pain-medications-safely,asking-about-medications,building-first-aid-kit,living-with-hypertension}.mdx`, `REVAMP/PLAN.v6.md` §§3, 4.3 C/E, 6.1.1, 7.2, 11.1, 12.1–12.3, 13.1, 16.1, 17.1, 18.1, 19.1, mini-spec §10.7), not screenshots.
**Documents:** `REVAMP/PLAN.v6.md` + this panel log.
**Date:** 2026-08-27
**Disposition key:** **ACCEPT** = v7 must change. **REJECT** = critique wrong or overblown; v7 keeps v6 and says why. **PARTIAL** = real issue, wrong size/severity/fix.

v6 already closed Round 1–5 launch-killers (CF-1…CF-37). Round 6 still blocks — four of five 🔴s are real, one 🔴 is the right wipe policy with a false “legacy underscore health keys” story, and every 🔴 is worse at an **intersection** the panel treated as a local paste miss. Dangerous ones are again the leftovers of last round: CF-35 expire-on-`supabaseResponse` never reaches the dashboard 307; C38 hardcoded wipe misses keys P7 will add; `lg:grid-cols-[1fr_240px]` inside HEAD `max-w-container` (1440px); 911/988 without Poison Help on the care-guide paste; `014` `delete_user` vs HEAD Settings that already calls the RPC.

---

### Wrong or overblown

**Staff 🟡 1 — `concatUint8([], 0)` on empty stream — COSMETIC.**
v6 §6.1.1 already: `chunks.length === 1 ? chunks[0] : concatUint8(...)` then `JSON.parse` in its own try → **400**. Empty body with a non-null stream: `chunks.length === 0`, `concatUint8([], 0)` if implemented as `new Uint8Array(totalBytes)` is `new Uint8Array(0)`, decode `""`, parse throws, 400. Panel’s “array indexing overhead / undefined buffer” does not happen. Null body is already 400 before `getReader()`.
**Reject** as a plan change. Helper may early-return `new Uint8Array(0)` if the implementer likes; not a test, not a 🟡.

**Staff 🟡 2 — static `switch` dual-packs lesson bundles — ALREADY THE P14 FALLBACK.**
HEAD `loadLessons.ts` imports combined `lessonBundles` (both locales). v6 §17.1 already: server `getAllLessons` via `switch` **without** a shared `Record`; “If a static switch still dual-packs in webpack, use **separate server files** `loadLessons.en.ts` / `loadLessons.es.ts`.” Client must not import `loadLessons` (C20 / C37). Restating the fallback as a new finding does not change the 3-hour timebox.
**Reject** as extra P14 scope.

**Sec 🟡 3 — `display_name` character vs byte length — WRONG POSTGRES.**
`substring(... from 1 for 100)` is **characters**, not bytes. `varchar(n)` is characters. UTF-8 storage of 100 characters can be 400 bytes on disk; that does not overflow a 100-character limit. Client `val.length` is UTF-16 code units (emoji still a mess). Profiles are JSX, not JsonLd (Round 5 already killed XSS). v6 SQL is the contract.
**Reject.** No TS schema rewrite.

**UX 🟡 3 — root 404 home dumps Spanish users on `/en` — FILE ALREADY BILINGUAL.**
HEAD `src/app/not-found.tsx:23–38`: two links, `href="/en"` “Go home” and `href="/es"` “Ir al inicio”. Comment in file: “offers both locales.” `accept-language` on this boundary is forbidden (same file: cookies/headers would force the app out of static). v6 P10 keeps that static constraint.
**Reject.** Do not sniff `Accept-Language`. Do not change the two-button contract.

**PM 🟡 2 — pipeline 4 Day-3 PRs so CI does not serialize — PROCESS FOLKLORE.**
v6 already: one phase = one PR; P8 may branch Day 2 and merge Day 3; “If P7 lands early, **branch** Phase 10.” Waiting on CI is not a spec hole. A sentence in Parallelism is enough; not a calendar rewrite.
**Reject** as blocking. **Accept cheap:** Parallelism already allows overlapping branches — say it once for Day 3 (8/10/11/12).

**Clin 🔴 1 as stated — `managing-multiple-medications` / `managing-high-blood-pressure` — INVENTED SLUGS.**
No such lesson ids. Hypertension is `living-with-hypertension`. Medication-safety lessons that exist: `understanding-prescription-labels` (no Poison Help), `asking-about-medications`, `pain-medications-safely` (**already** `1-800-222-1222` EN+ES), `building-first-aid-kit` (already lists Poison Control). The **gap** is real (care-guide paste + prescription-label lesson). The file list is not.
**Reject** invented slugs. **Accept** paste on real files (below).

**Sec 🔴 1 rationale — “legacy `hmc_completed_lessons` / hyphen-underscore health keys from project history” — C11 ALREADY SETTLED.**
`STORAGE_KEYS.completedLessons` = `hmc-completed-lessons` (hyphens). Guest keys are `hmc_guest_*` (underscore **after** `guest_`). v6 already prefix-wipes `hmc_guest_*` in both stores. There is no live `hmc_completed_lessons`. Panel reused the file-audit typo C11 killed.
**Reject** the ghost-key story. **Accept** prefix+preserve as the **implementation** (below) because the hardcoded list still drifts.

**PM 🔴 1 “concurrently with or immediately prior” — CONCURRENT STILL RACES.**
HEAD `SettingsClient.tsx:75–89` already calls `rpc("delete_user")` then `AuthProvider.signOut()` (success-only, no `finally` wipe). The moment `014` makes the RPC real, **today’s production client** deletes the auth row and leaves kiosk `localStorage`. A same-minute “concurrent” Netlify+SQL apply is a race, not a gate.
**Reject concurrent.** **Accept prior:** P9 must be **live on Netlify** before `014` `db push` (Gate 1). Do **not** split `delete_user` out of `014` (014 still supersets 009).

---

### Valid (keep as 🔴 or cheap 🟡)

| ID                                     | Verdict                            | Why                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff 🔴 1 redirect drops `Set-Cookie` | **ACCEPT**                         | `NextResponse.redirect()` is a new response. v6 expires cookies on `supabaseResponse`, then §12.1 “Dashboard `!user` redirect **unchanged**” returns the 307 **without** those headers. HEAD `middleware.ts:84–90` is exactly that return. `@supabase/ssr` `setAll` already rebuilds `supabaseResponse` as `NextResponse.next()` — same class of bug if you then redirect.                                             |
| Sec 🔴 1 prefix wipe                   | **PARTIAL**                        | Ghost-key rationale is wrong. Prefix `/^hmc[-_]/` + preserve locale/theme/textSize/simpleMode (both hyphen and underscore spellings) is still the right util: P7 mini-spec adds `hmc-glossary-lookups` **after** P9’s hardcoded list; `hmc_onboarded` / `hmc_save_progress_dismissed` sit on kiosk devices; C38 persist rewrite still requires empty React state **first**. Preserve-list, not a health-key allowlist. |
| UX 🔴 1 TOC dead zone                  | **ACCEPT**                         | v6 §16.1: `lg:grid-cols-[1fr_240px]` + `max-w-prose`. HEAD article shell is `max-w-container` = **1440px** (`tailwind.config.ts:89`). `1fr` eats the leftover; prose pins left; TOC pins right. Playwright only checks paragraph ≤720px and DOM order — **passes with the gap**. Panel ~350px is conservative at 1440.                                                                                                 |
| Clin 🔴 1 Poison Help                  | **ACCEPT** (real files)            | Care-guide `whenInDoubtBody` is 911+988 only. `understanding-prescription-labels` never names 1-800-222-1222. Same paste-example class as CF-5/14/22/27/36. Voice stays education-not-triage (resource, not “skip 911”).                                                                                                                                                                                               |
| PM 🔴 1 P9 before `014` apply          | **ACCEPT** (prior, not concurrent) | ADV-09 `delete_user` in `014` × HEAD Settings RPC × P9 wipe not live = kiosk leak the first time someone confirms delete. Gate 0 does not cover this.                                                                                                                                                                                                                                                                  |
| UX 🟡 2 `100dvh` vs keyboard           | **ACCEPT** (cheap)                 | iOS: `dvh` is the large viewport; software keyboard does not shrink it. `max-h-[calc(100svh-12rem)]` + `overscroll-contain` is the right token.                                                                                                                                                                                                                                                                        |
| Clin 🟡 2 `somnolencia extrema`        | **ACCEPT** (cheap)                 | v6 ES paste. Swap to panel’s `si es muy difícil despertarlos`. Keep 100.4°F / 38°C.                                                                                                                                                                                                                                                                                                                                    |
| Clin 🟡 3 print timestamp              | **PARTIAL**                        | Fridge print should show **when it was printed**, not a fake global “reviewed August 2026” (MDX `lastReviewed` is per-file). Add print-time date to the existing P15 educational footer.                                                                                                                                                                                                                               |
| Sec 🟡 2 Sentry search breadcrumbs     | **PARTIAL** (already in 19.1)      | v6 §19.1 already: “drop `ui.input` values.” HEAD `beforeBreadcrumb` only drops `console`. Tighten 19.1 to **`beforeBreadcrumb`** (strip `data.value` / drop `ui.input`), not only `beforeSend`. Privacy `collectBodyAnalytics` already promises search text is not sent.                                                                                                                                               |
| PM 🟢 P14 13:00                        | **ALREADY IN v6**                  | Unmerged branch; no `git checkout main` discard. No-op.                                                                                                                                                                                                                                                                                                                                                                |

---

### Combined flaws (v6 ∩ panel — these are the launch-killers this round)

**CF-38 — CF-35 expire-on-`error` ∪ dashboard `NextResponse.redirect()` ∪ tests that never hit the 307.**
v6 closed the leftover JWT by mutating `supabaseResponse`. The leftover-JWT **path** is a deleted user hitting `/[locale]/dashboard/**`. That path returns a **new** 307. `Set-Cookie: Max-Age=0` never reaches the browser. §12.2 tests “auth cookies + `getUser` error → expires” without saying **dashboard**. Implementer will green `/en/learn` (returns `supabaseResponse`) and ship the hole.
**v7:** Expire on the **outgoing** response. If dashboard `!user`: `redirectResponse = NextResponse.redirect(loginUrl)`; copy `supabaseResponse.cookies.getAll()` onto it; then expire `/^sb-.*-auth-token/` (chunked `.0` suffixes) on **that** redirect (`Max-Age=0; Path=/`). Non-dashboard + resolved error: expire on `supabaseResponse` as today. Thrown `getUser`: keep cookies. Guest, no auth cookies, no error: no-op. Tests: `/en/dashboard/settings` + cookies + `{ user: null, error }` → **307 and** `Set-Cookie` expires `sb-`; `/en/learn` + same → 200 + expire; throw + cookies → not expired.

**CF-39 — C38 `resetLocalProgress` empty-state-then-wipe ∪ P9 hardcoded key list ∪ P7 `hmc-glossary-lookups` (not in HEAD) ∪ kiosk extras `hmc_onboarded` / `hmc_save_progress_dismissed`.**
Hardcoded list + guest prefix covers **today’s** health keys. It does not cover keys this same four-day window adds, or hyphen/underscore extras that are not guest-prefixed. Empty React state first is still mandatory (persist effect rewrites `hmc-completed-lessons` if state is stale). Wiping `hmc-theme` would be a new bug — preserve prefs.
**v7:** Scan **both** stores; delete keys matching `/^hmc[-_]/` except a preserve set: `STORAGE_KEYS` locale/theme/textSize/simpleMode **and** underscore aliases `hmc_locale` / `hmc_theme` / `hmc_text_size` / `hmc_simple_mode`. Do **not** expire preference **cookies**. `resetLocalProgress`: empty completed/recent/paths/quizScores **first**, then the scanner. Tests plant `hmc-glossary-lookups`, `hmc_onboarded`, `hmc_guest_quizAttempts`, `hmc-future-tool`, `hmc-completed-lessons` — all gone; `hmc-theme` kept.

**CF-40 — §16.1 `lg:grid-cols-[1fr_240px]` ∪ HEAD `max-w-container` = 1440px ∪ Playwright that ignores TOC–prose gap ∪ DOM-order-only Round 5 fix.**
v6 fixed SR/keyboard order. Visual contract is still “stretch the grid to the site shell.” At 1440 the 1fr column is ~1100px; `max-w-prose` is ~65ch; TOC is `w-60` on the far right.
**v7:** Reading shell `mx-auto max-w-5xl px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12 xl:gap-16`. `<main className="max-w-prose">` first; sticky `<aside>` second. **Do not** place that grid inside `max-w-container` as the TOC parent. Playwright 1440: TOC visible; paragraph ≤720px; main before aside in DOM; **distance from main content box right to aside left ≤ 80px**.

**CF-41 — CF-36 911-class paste ∪ `whenInDoubtBody` 911+988 only ∪ prescription-label lesson with no Poison Help ∪ panel’s invented MDX slugs.**
988 was added so mental-health crisis is not “call 911 or nothing.” Accidental double-dose / mix-up / suspected poisoning is the same missing rung. Flooding ED vs waiting at home is the panel’s clinical point. Care-guide voice is education, not triage — a US number is a **resource**, like 988, not “do not call 911.”
**v7:** Append Poison Help `1-800-222-1222` to `whenInDoubtBody` EN+ES (keep 911 and 988). Phase 8: add the takeaway to `understanding-prescription-labels` EN+ES; **verify** `pain-medications-safely` already has the number (HEAD does). Do **not** invent `managing-multiple-medications` / `managing-high-blood-pressure`. Tests: `/222-1222/` in care-guide messages both locales + prescription MDX both locales.

**CF-42 — ADV-09 `delete_user` in `014` ∪ HEAD Settings already calls `rpc("delete_user")` ∪ P9 `finally` wipe not live ∪ calendar `1 (014 first), … 9 (after P2)` ∪ Gate 0 only covering the service-role key.**
Today the delete button toasts `deleteFailed` because the RPC is missing. `014` turns that button into a working delete **on the old client**: no local `signOut` `finally`, no `resetLocalProgress`, leftover JWT, leftover health keys. “Concurrent” P9+014 is a race. Splitting `delete_user` into a later migration reopens the 009-superset rule.
**v7:** **Gate 1 (blocking — before any `014` `db push`):** Phase 9 is **merged and live on Netlify production** (that commit’s deploy Ready). Then apply `014`. Write/repair/review of `014` may happen in parallel with P2. Gate 0 still required. ADV-10 contact INSERT stays open until that apply (same day, after P9) — do not split 014. Day 1 cell: write `014` + Gate 0 proof, P2, P3 env-gate, **P9 live**, **then** `db push` 014.

---

### 🔴 disposition (implementation cannot start on v6)

| Panel 🔴                                    | Disposition             | v7 action                                                                                                  |
| ------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| Middleware `redirect()` drops cookie expiry | **ACCEPT**              | Copy cookies onto the 307; expire on the **returned** response; dashboard test (CF-38)                     |
| `clearLocalHealthData` hardcoded list       | **PARTIAL**             | Prefix `/^hmc[-_]/` + preserve prefs; reject ghost `hmc_completed_lessons`; keep empty-state-first (CF-39) |
| Article TOC 1440 dead zone                  | **ACCEPT**              | `max-w-5xl` reading shell; Playwright gap ≤80px (CF-40)                                                    |
| Poison Help 1-800-222-1222                  | **ACCEPT** (real files) | Care-guide paste + `understanding-prescription-labels`; reject invented slugs (CF-41)                      |
| Day 1 `014` before P9                       | **ACCEPT** (prior)      | Gate 1: P9 live **before** `014` apply; reject concurrent (CF-42)                                          |

**Second-opinion verdict:** v6 **NO**. Do not implement from `REVAMP/PLAN.v6.md`. v7 must land CF-38…CF-42 plus accepted 🔴s.

**Rejected:** empty-chunk `concatUint8` guard; extra P14 server-file split; `display_name` byte math; root-404 `Accept-Language`; invented medication slugs; concurrent 014+P9; ghost underscore health keys as the wipe rationale.
