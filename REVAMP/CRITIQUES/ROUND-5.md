# HealthMadeClear Launch Revamp — Panel Critique: Round 5

**Document Under Review:** `REVAMP/PLAN.v5.md` (2026-08-27)  
**Review Panel:** Staff Engineer, Security Engineer, UX Lead, Clinical Content Reviewer (PharmD), Ruthless Project Manager  
**Objective:** Fifth-round adversarial evaluation to break Implementation Plan v5, expose stream reader 500 edge cases in `/api/contact`, context isolation errors in `AuthProvider.test.tsx`, v1->v2 custom question loss in `useVisitPlanner`, Sentry isolate fetch timeouts, client auth cookie stale states post-deletion, pediatric temperature thresholds, and Day 2 execution deadlocks.

---

## CRITIC 1 — Staff Engineer

_Focus: Feasibility, hidden complexity, framework/DB behavior, invalid technical assumptions._

### 1. 🔴 Phase 3 (§6.1, §6.3) — Unhandled `TypeError` on Null `request.body` & Unhandled `SyntaxError` in `/api/contact` Stream Reader

- **Target Section:** Phase 3 — §6.1 Scope (`src/app/api/contact/route.ts`) & §6.3 / §6.4 Tests.
- **Problem:** Phase 3 (§6.1) specifies:

  > _"Add a stream byte cap (~10KB): if Content-Length is present and > 10240, return 413 without reading the body. Otherwise read request.body with a running byte count; if count exceeds 10240, 413 and abort. Then JSON.parse the buffered bytes. Never await request.json() on an unbounded body."_

  In Next.js 16 App Router (Web Standards `Request` API in Node/Edge runtime):
  1. `request.body` is `ReadableStream<Uint8Array> | null`. If a client sends a body-less request (e.g. empty POST), `request.body` is `null`. Calling `request.body.getReader()` without an explicit null check throws an unhandled `TypeError: Cannot read properties of null (reading 'getReader')`, returning a 500 Internal Server Error instead of a 400 Bad Request.
  2. When chunks are accumulated and decoded via `TextDecoder`, passing the raw string to `JSON.parse(bodyText)` without a `try/catch` will throw a `SyntaxError` on malformed JSON, producing an unhandled 500 error instead of 400 Bad Request.
  3. When aborting on stream overflow (>10240 bytes), if the stream reader is not explicitly cancelled (`await reader.cancel()`) or released (`reader.releaseLock()`), connection sockets can hang in serverless isolates.

- **Suggested Fix:**
  In `src/app/api/contact/route.ts`:
  ```ts
  if (!request.body) {
    return NextResponse.json({ error: "Missing request body" }, { status: 400 });
  }
  const reader = request.body.getReader();
  let totalBytes = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.length;
        if (totalBytes > 10240) {
          await reader.cancel();
          return NextResponse.json({ error: "Payload too large" }, { status: 413 });
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }
  let payload: unknown;
  try {
    const text = new TextDecoder().decode(concatUint8Arrays(chunks, totalBytes));
    payload = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }
  ```

---

### 2. 🔴 Phase 5 (§8.1) & Phase 9 (§12.1) — `AuthProvider` Consuming `useAppState` Breaks Isolated Unit Tests & Drops Local Wipe on Network Failure

- **Target Section:** Phase 5 — §8.1 Scope (`AuthProvider.tsx`, `AuthProvider.test.tsx`) & Phase 9 — §12.1 Scope.
- **Problem:**
  1. Phase 5 (§8.1) specifies: _"After `supabase.auth.signOut()` succeeds, call `useAppState().resetLocalProgress()`"_. In `src/app/[locale]/layout.tsx`, `<AppProviders>` wraps `<AuthProvider>`, so in production context is available. However, `src/components/providers/AuthProvider.test.tsx` renders `<AuthProvider>` directly in isolation without `<AppProviders>`. If `AuthProvider.tsx` calls `useAppState()`, `useAppState` throws `"useAppState must be used within AppProviders"`, failing all existing test cases in `AuthProvider.test.tsx`.
  2. If `supabase.auth.signOut()` fails (e.g. offline, expired refresh token, network timeout), calling `resetLocalProgress()` after `await supabase.auth.signOut()` without a `try...finally` block means `resetLocalProgress()` is skipped and the local health data remains on the device.
- **Suggested Fix:**
  1. In `AuthProvider.tsx`:
     ```ts
     const signOut = useCallback(async () => {
       try {
         await supabase.auth.signOut();
       } catch {
         // Ignore network/session errors on signout
       } finally {
         resetLocalProgress?.();
         router.push("/");
       }
     }, [supabase, router, resetLocalProgress]);
     ```
  2. In `AuthProvider.test.tsx`: Wrap test renders in `<AppProviders locale="en">` or mock `useAppState` returning a dummy `resetLocalProgress: vi.fn()`.

---

### 3. 🟡 Phase 12 (§15.1) — `useVisitPlanner` V1→V2 Migration Drops User-Defined Custom Questions

- **Target Section:** Phase 12 — §15.1 Scope (`useVisitPlanner.ts`) & §15.2 Scheme.
- **Problem:** Phase 12 specifies:

  > _"If value matches `/^(new-symptom|medication|followup):\d+$/` use as-is; else map old locale text -> id via provided questionCatalog; else drop. Custom questions unchanged."_

  In v1 storage (`hmc-visit-planner`), if custom questions were stored in the `selectedQuestions` array as freeform strings (or if a user entered custom questions during a previous session), the regex will fail and the catalog mapping will fail, causing custom questions to be dropped from `selectedQuestions`.

- **Suggested Fix:**
  Ensure the v1 parser explicitly checks if an item in `selectedQuestions` is not in the question catalog; if it is not in the catalog, preserve it in `customQuestions` with an ID prefix (`custom-${Date.now()}-${idx}`) rather than dropping it.

---

### 4. 🟡 Phase 16 (§19.1) — Serverless Sentry HTTP Ingest Lacks Abort Timeout

- **Target Section:** Phase 16 — §19.1 Must-do (`src/lib/errorReporting.ts` `reportServerError`).
- **Problem:** `reportServerError` sends HTTP POST requests to the Sentry envelope endpoint from Netlify serverless functions. If Sentry's API experiences latency or downtime, an unbounded `fetch()` call can stall serverless function execution until Netlify's 10-26 second timeout kills the invocation.
- **Suggested Fix:**
  In `src/lib/errorReporting.ts`, wrap the fetch with `signal: AbortSignal.timeout(2000)` and add a `.catch(() => {})` handler so server error logging can never block request completion.

---

## CRITIC 2 — Security Engineer

_Focus: RLS, auth, injection, privacy of health-adjacent data, rate limiting._

### 1. 🔴 Phase 9 (§12.1) & Phase 1 (§4.3 Step A.2) — Deleted User JWT Middleware Stale Session Rejection

- **Target Section:** Phase 9 — §12.1 Scope (`SettingsClient.tsx`) & Phase 1 — §4.3 Step A.2 (`delete_user`).
- **Problem:**
  When a user deletes their account via `rpc("delete_user")`, the corresponding record in `auth.users` is deleted immediately in Postgres. However, the client's browser cookies (`sb-<project-ref>-auth-token`) still contain a signed, unexpired Supabase JWT.
  If `supabase.auth.signOut({ scope: "local" })` fails or encounters an unhandled rejection, or if the user immediately navigates to a protected route (or background requests fire), `src/middleware.ts` will receive the stale JWT. If middleware calls `supabase.auth.getUser()`, Supabase returns `AuthSessionMissingError` or `User not found`.
  If `src/middleware.ts` does not explicitly catch `User not found` and clear cookies, it can enter a redirect loop or throw an unhandled error.
- **Suggested Fix:**
  1. In `src/middleware.ts`, ensure that if `supabase.auth.getUser()` returns an error or `user === null`, auth cookies are explicitly wiped from the response headers and the user is redirected to `/${locale}/auth/login?error=session_expired`.
  2. In `SettingsClient.tsx`, ensure `finally` block calls `clearLocalHealthData()` and explicitly expires local storage auth tokens before calling `router.push("/")`.

---

### 2. 🟡 Phase 16 (§19.1) — CSP `connect-src` Must Enumerate Supabase Realtime & Sentry Ingest Hosts

- **Target Section:** Phase 16 — §19.1 Must-do (`security-headers.json`, `netlify.toml`, `next.config.mjs`).
- **Problem:**
  Phase 16 syncs CSP headers between `netlify.toml` and `next.config.mjs`. If `security-headers.json` canonical `connect-src` lists only `'self'`, browser network calls to `https://xdmbyadosmzixsxqullj.supabase.co`, `wss://xdmbyadosmzixsxqullj.supabase.co`, and `https://*.ingest.sentry.io` will be blocked by the browser's Content Security Policy.
- **Suggested Fix:**
  Explicitly specify in `security-headers.json`:
  ```json
  "connect-src": [
    "'self'",
    "https://xdmbyadosmzixsxqullj.supabase.co",
    "wss://xdmbyadosmzixsxqullj.supabase.co",
    "https://*.ingest.sentry.io",
    "https://www.google-analytics.com",
    "https://analytics.google.com"
  ]
  ```

---

### 3. 🟡 Phase 1 (§4.3 Step A.3) — Sanitized `display_name` Escaping in Metadata and JSON-LD

- **Target Section:** Phase 1 — §4.3 Step A.3 (`014_launch_reconcile.sql`) & Phase 16 — §19.1 (`JsonLd.tsx`).
- **Problem:** `handle_new_user` strips control characters (`[[:cntrl:]]`) and truncates `display_name` to 100 characters. While React automatically escapes text rendered in JSX, dynamic metadata generators or JSON-LD script blocks that inject `profile.display_name` without escaping could allow character injections (e.g. `</script><script>`).
- **Suggested Fix:**
  Verify that `src/components/JsonLd.tsx` stringifies JSON safely (replacing `<` with `\u003c`) and that `metadata.ts` does not inject raw HTML entities.

---

## CRITIC 3 — UX Lead

_Focus: Visual polish, mobile responsive behavior, typography, touch targets, state transitions._

### 1. 🔴 Phase 10 (§13.1) & Phase 13 (§16.1) — Header Responsive Gap at 1024px–1279px (`lg`) Viewports

- **Target Section:** Phase 10 — §13.1 Scope (`Header.tsx`) & Phase 10 Acceptance (§13.3).
- **Problem:**
  Phase 10 specifies: `< xl` (1280px) = mobile drawer hamburger; `xl+` (1280px+) = inline 8-item nav.
  On tablet/laptop viewports between 1024px and 1279px (`lg`), the mobile drawer is rendered when clicking the hamburger.
  In HEAD `Header.tsx`, the mobile drawer overlay currently lacks responsive width constraints for wide tablet viewports (e.g. 1024px iPad Pro), either stretching across 1024px or rendering misaligned controls.
  Furthermore, at exactly 1280px (`xl`), Spanish navigation labels (`Aprender`, `Rutas de aprendizaje`, `Artículos`, `Glosario`, `Herramientas`, `Acerca de`) are ~35% longer than English. With 8 items, 1280px has less than 12px of total horizontal margin before triggering horizontal scrollbar overflow if padding is not strictly clamped.
- **Suggested Fix:**
  1. In `Header.tsx`, clamp mobile drawer container to `max-w-md ml-auto` on `lg` screens with a semi-transparent backdrop.
  2. For `xl` desktop nav, enforce `xl:text-label-sm xl:px-1.5 xl:gap-0.5 2xl:text-label-md 2xl:px-3 2xl:gap-2` so Spanish labels never induce layout overflow at 1280px. Add explicit Playwright assertion testing `scrollWidth <= clientWidth` at 1280px on `/es`.

---

### 2. 🟡 Phase 11 (§14.1) — Mobile Glossary Mask Image iOS WebKit Prefix & Scroll End State

- **Target Section:** Phase 11 — §14.1 Scope (`GlossaryClient.tsx`).
- **Problem:**
  Phase 11 introduces a CSS right-edge fade mask (`mask-image: linear-gradient(...)`) on `< sm` viewports for the horizontal A-Z letter snap bar.
  1. Standard `mask-image` is not supported on iOS Safari WebKit without `-webkit-mask-image`. Without the vendor prefix, the fade effect is silently ignored.
  2. When the user scrolls all the way to 'Z', a static right-edge fade mask will continuously obscure the letter 'Z'.
- **Suggested Fix:**
  1. Supply both `-webkit-mask-image` and `mask-image` in Tailwind utility classes.
  2. Apply the mask to a wrapper container, or manage mask opacity based on horizontal scroll position (fade right when scrollLeft < maxScroll, fade left when scrollLeft > 0).

---

### 3. 🟡 Phase 13 (§16.1) — Article Desktop TOC DOM Hierarchy & Keyboard Navigation

- **Target Section:** Phase 13 — §16.1 Scope (`ArticlePageClient.tsx`).
- **Problem:**
  In Phase 13, the desktop TOC is introduced as a sticky column (`w-60 sticky top-24`). If the `<aside>` TOC element is placed before the `<main>` article content in DOM structure for layout purposes, screen readers and keyboard tab navigation will be forced to traverse every TOC link before reaching the article's opening paragraph.
- **Suggested Fix:**
  Place `<main id="main-content">` first in DOM order and `<aside aria-label={t("onThisPage")}>` second. Use CSS grid `lg:grid-cols-[1fr_240px]` or flex ordering to position the TOC visually while preserving natural tab sequence.

---

## CRITIC 4 — Clinical Content Reviewer (PharmD Persona)

_Focus: Inaccurate, misleading, or unsourced health information, clinical safety, disclaimers._

### 1. 🔴 Phase 4 (§7.2) — Pediatric Fever Threshold Clinical Specificity in `homeCarePediatricNote`

- **Target Section:** Phase 4 — §7.2 Care-guide copy spec (`homeCarePediatricNote`).
- **Problem:**
  The draft string for `homeCarePediatricNote` in §7.2 states:

  > _"Fever in infants under 3 months, or signs of dehydration in young children (no wet diapers for 8 hours, crying with no tears, sunken eyes, extreme sleepiness), are treated as emergencies in US emergency departments — not as home monitoring. In the United States, call 911."_

  In clinical practice (AAP / ACEP guidelines), infant fever in neonates/infants under 90 days is strictly defined as a rectal temperature $\ge 100.4^\circ\text{F}$ ($38.0^\circ\text{C}$). Parents frequently use forehead, axillary, or pacifier thermometers that underestimate body temperature. An infant with a $99.8^\circ\text{F}$ axillary temp may actually have a $100.5^\circ\text{F}$ core temp requiring a full sepsis workup.
  The copy must explicitly define fever as $100.4^\circ\text{F}$ ($38^\circ\text{C}$) or higher, or state "any fever or temperature of $100.4^\circ\text{F}$ ($38^\circ\text{C}$) or higher".

- **Suggested Fix:**
  Update `homeCarePediatricNote` (both EN and ES):
  - **EN:** `"Any temperature of 100.4°F (38°C) or higher in infants under 3 months, or signs of dehydration in young children (no wet diapers for 8 hours, crying with no tears, sunken eyes, extreme sleepiness), are treated as medical emergencies in US emergency departments — not as home monitoring. In the United States, call 911."`
  - **ES:** `"Cualquier temperatura de 100.4°F (38°C) o más en bebés menores de 3 meses, o signos de deshidratación en niños pequeños (sin pañales mojados por 8 horas, llanto sin lágrimas, ojos hundidos, somnolencia extrema), se tratan como emergencias médicas en los Estados Unidos — no como observación en el hogar. En los Estados Unidos, llame al 911."`

---

### 2. 🟡 Phase 8 (§11.1) — MDX Citation Granularity for Pharmacotherapy & Drug Labels

- **Target Section:** Phase 8 — §11.1 Scope (`validate-content.ts`, `ClinicalCitationBlock.tsx`).
- **Problem:**
  `validate-content.ts` validates that `sources.length >= 1` and `reviewedBy.length >= 3`.
  For clinical lessons explaining prescription labels, dosage calculations, and drug interactions (e.g. `understanding-prescription-labels`, `managing-high-blood-pressure`), vague citations like `"FDA"` or `"CDC"` lack verifiable authority.
- **Suggested Fix:**
  In MDX content files for medication-related lessons, require guideline-specific citations (e.g. `"FDA - Understanding Over-the-Counter Medicine Labels"`, `"AHA/ACC 2017 Hypertension Guidelines"`).

---

### 3. 🟡 Phase 15 (§18.1) — Printed Care Guide Educational Disclaimer Footer

- **Target Section:** Phase 15 — §18.1 Scope (`CareGuideClient.tsx`, `PrintButton.tsx`).
- **Problem:**
  Phase 15 adds a print-only line for 911/988 at the top of the printed care guide. When patients print the care guide cards to hang in a home setting, third-party readers (e.g. babysitters, elderly relatives) might treat the printed cards as diagnostic criteria if the legal/clinical disclaimer is omitted from print media.
- **Suggested Fix:**
  In `CareGuideClient.tsx`, add a visible print-only footer (`hidden print:block text-xs text-neutral-600 mt-6 pt-4 border-t border-neutral-300`):
  _"Health Made Clear provides health education and is not a substitute for clinical diagnosis or individualized medical advice. For emergencies, call 911 (US)."_

---

## CRITIC 5 — Ruthless Project Manager

_Focus: Scope realism, 4-day calendar feasibility, execution sequencing, dependency deadlocks._

### 1. 🔴 Day 2 Critical Path Ordering: Phase 6 Must Precede Phase 4 to Prevent Migration Bottlenecks

- **Target Section:** Section 3 — Four-day calendar (Day 2) & Phase 6 (§9.1) / Phase 5 (§8.1).
- **Problem:**
  The Day 2 calendar lists: `Day 2: 4, 6 (015 + client, first), 5 (after unique live), 7`.
  While the theme text says `P6 before P5`, listing Phase 4 first in the sequence creates a process ambiguity. Phase 4 is pure frontend copy and CSS contrast adjustments. Phase 6 is the highest-risk database migration of the revamp (`015_quiz_attempts_best_score.sql` backup, percent-to-count normalization, deduplication, and unique constraint creation on live Supabase).
  Phase 5 (guest storage migration) and Phase 7 (achievements) are both hard-blocked by Phase 6.
  If an engineer tackles Phase 4 first on Day 2 morning, any delay in Phase 6 pushes the database migration into late Day 2 afternoon, compressing Phase 5 and Phase 7 into an impossible evening window.
- **Suggested Fix:**
  Restructure Day 2 calendar order explicitly:
  - **Day 2 Morning (08:00–12:00):** Phase 6 (Database `015` snapshot + apply + client upsert PR). Verify unique constraint live on Supabase `xdmbyadosmzixsxqullj`.
  - **Day 2 Midday (12:00–15:00):** Phase 5 (Guest progress localStorage PR; safe to merge now that unique constraint is live).
  - **Day 2 Afternoon (15:00–18:00):** Phase 4 (Clinical care-guide copy & contrast PR).
  - **Day 2 Evening (18:00–20:00):** Phase 7 (Achievements wiring & i18n gamification PR).

---

### 2. 🟡 Phase 14 (Day 4) Hard Stop Branch Discard Procedure

- **Target Section:** Section 3 — Four-day calendar (Day 4) & Phase 14 (§17.1, §17.4).
- **Problem:**
  Phase 14 has a 3-hour timebox on Day 4 (10:00–13:00). If the locale bundle code-splitting encounters unexpected webpack bundling issues or Next.js static generation errors, continuing to debug past 13:00 will cannibalize Phase 16 (§19.1 CSP/Sentry hardening) and Phase 15.
- **Suggested Fix:**
  Enforce a strict branch boundary: Phase 14 must be worked on `revamp/p14-bundle-split`. If CI is not green by 13:00, run `git checkout main` and immediately begin Phase 16 (`revamp/p16-hardening`). No partial generator commits may touch `main`.

---

### 3. 🟢 Phase 1 Gate 0 Verification Fallback for Non-CLI Workflows

- **Target Section:** Phase 1 — §4.2 Preflight (Gate 0).
- **Problem:**
  Gate 0 requires `netlify env:get SUPABASE_SERVICE_ROLE_KEY`. If local CLI Netlify authentication is unavailable on the workstation, the engineer could be blocked on a tooling hurdle.
- **Suggested Fix:**
  Explicitly document that a screenshot of the Netlify Web UI Environment Variables dashboard attached to the Phase 1 PR satisfies Gate 0.

---

## Verdict Table — Can Implementation Start?

| Critic                                   |  Status   | Blocking Items (🔴)                                                                                                                                                                                           |
| ---------------------------------------- | :-------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CRITIC 1 — Staff Engineer**            | 🔴 **NO** | 1. `/api/contact` null body `TypeError` & `SyntaxError` 500 crashes on stream read.<br>2. `AuthProvider` calling `useAppState` without fallback breaks isolated unit tests and drops wipe on signout failure. |
| **CRITIC 2 — Security Engineer**         | 🔴 **NO** | 1. Middleware stale JWT error handling and cookie clearance following `delete_user` RPC.                                                                                                                      |
| **CRITIC 3 — UX Lead**                   | 🔴 **NO** | 1. Header drawer responsive width on 1024px–1279px and Spanish text overflow prevention at 1280px.                                                                                                            |
| **CRITIC 4 — Clinical Content Reviewer** | 🔴 **NO** | 1. `homeCarePediatricNote` must specify rectal temperature threshold ($\ge 100.4^\circ\text{F} / 38.0^\circ\text{C}$) for infant fever.                                                                       |
| **CRITIC 5 — Ruthless Project Manager**  | 🔴 **NO** | 1. Day 2 schedule ordering must place Phase 6 as first priority at 08:00 AM ahead of Phase 4.                                                                                                                 |

### Overall Verdict: **NO (v5 needs 6 targeted fixes before implementation starts)**

Implementation cannot start on `REVAMP/PLAN.v5.md` until the **6 blocking 🔴 items** are resolved in `PLAN.v6.md`:

1. **Contact stream reader:** Explicit null check for `request.body`, `try/catch` on `JSON.parse`, and `reader.cancel()` on 413.
2. **AuthProvider resilience:** `try...finally` in `signOut()` and `AppProviders` wrapper / mock in `AuthProvider.test.tsx`.
3. **Stale auth cookie clearance:** Middleware handling for deleted `auth.users` records.
4. **Header responsive clamping:** `max-w-md` drawer on `lg` and tight padding tokens at 1280px on `/es`.
5. **Pediatric fever precision:** $100.4^\circ\text{F} / 38.0^\circ\text{C}$ threshold in `homeCarePediatricNote`.
6. **Day 2 schedule sequencing:** Phase 6 explicitly scheduled first on Day 2 morning.

---

## Cursor/Grok Second Opinion

**Reviewer:** Principal engineer (skeptical). Claims checked against current tree (`contact/route.ts`, `AuthProvider.tsx`, `AuthProvider.test.tsx`, `AppProviders.tsx`, `[locale]/layout.tsx`, `SettingsClient.tsx`, `src/lib/supabase/middleware.ts`, `middleware.test.ts`, `LoginForm.tsx`, `Header.tsx`, `NavLink.tsx`, `es.json` `nav.*`, `useVisitPlanner.ts`, `visitPlanner.ts`, `errorReporting.ts`, `next.config.mjs`, `netlify.toml`, `JsonLd.tsx`, `CareGuideClient.tsx`, `en.json` `homeCareChecklist`), not screenshots.  
**Documents:** `REVAMP/PLAN.v5.md` + this panel log.  
**Date:** 2026-08-27  
**Disposition key:** **ACCEPT** = v6 must change. **REJECT** = critique wrong or overblown; v6 keeps v5 and says why. **PARTIAL** = real issue, wrong size/severity/fix.

v5 already closed Round 1–4 launch-killers (CF-1…CF-32). Round 5 still blocks — two 🔴s are real paste-spec holes (stream 400 taxonomy; pediatric 100.4°F), one 🔴 is a leftover of CF-25 (`signOut` “on success”), one 🔴 is a real cookie leftover with a dangerous suggested fix, and two 🔴s are Round-4 relitigation (invented Spanish labels + invented AM/PM clock). Dangerous ones are again the **intersections**.

---

### Wrong or overblown

**UX 🔴 1 — `max-w-md` overlay drawer at `lg` + Spanish overflow from “Rutas de aprendizaje” — WRONG COMPONENT, WRONG LABELS, TESTS ALREADY EXIST.**  
HEAD `Header.tsx:209–250` is an **inline accordion** (`border-t` under the 76px bar, `2xl:hidden`). There is no fixed overlay, no backdrop, no side drawer. `max-w-md ml-auto` is a different component. After v5 compact-at-xl, hamburger is `< xl` (1024–1279 included). Full-width mobile nav on iPad is the current contract, not a bug.  
Spanish catalog (`es.json:3–10`): `Inicio`, `Aprender`, `Artículos`, **`Rutas`**, `Herramientas`, `Panel`, `Glosario`, `Acerca de`. Panel reused **“Rutas de aprendizaje”** — same invented string C33 / ROUND-4 already killed. `getNavItems` is 8 short keys.  
v5 §13.1 already: `xl:flex`, compact-at-xl, `xl:px-2 xl:gap-1`, Playwright `scrollWidth <= clientWidth` at 1280 **and** 1440 on **`/en` and `/es`**. Overflow is gated. Prescribing `xl:text-label-sm xl:px-1.5` without a failing measurement is speculative.  
**Reject:** overlay `max-w-md` drawer. **Reject:** invented labels as overflow proof. **Accept cheap ladder:** if 1280 `/es` Playwright fails, tighten NavLink tokens **before** dropping items or adding a Tools dropdown. Document the panel stays a full-width accordion.

**PM 🔴 1 — Day 2 08:00 P6 / afternoon P4 — INVENTED CLOCK, TEXT ALREADY THERE.**  
v5 calendar cell: `4, **6 (`015` + client, first)**, **5 (after unique live)**, 7`. Theme: **P6 before P5**. §0.1 rule 1: Phase 6 before Phase 5. Phase 4 **Dependencies: None**. Parallelism: “Phase 4 is independent of 1–3.” P4 (copy/CSS) cannot 42P10 or 23505. Two engineers → P4 morning is fine. One engineer → listed order starting with `4` is the only real trap. Same AM/PM folklore as ROUND-4 PM 🔴 1 (C41).  
**Reject:** 08:00–20:00 slots. **Accept cheap:** put **6 first in the cell**; mark 4 as **parallel / anytime Day 2**.

**Sec 🔴 1 — deleted-user JWT causes middleware redirect loop / “User not found” — LOOP IS FALSE; BLANKET `user===null` WIPE IS DANGEROUS; COOKIE LEFTOVER IS NARROW AND REAL.**  
`LoginForm.tsx` does **not** auto-redirect signed-in users to dashboard. Middleware (`src/lib/supabase/middleware.ts:84–90`) only redirects **dashboard** routes when `!user`. Guest `user===null` on `/learn` returns 200 (`middleware.test.ts:58–61`). `"User not found"` is **absent** repo-wide. `getUser()` on a deleted user typically **resolves** `{ data: { user: null }, error }` — it does not throw; the catch is for outages.  
Panel suggested fix 1: if `getUser()` error **or `user===null`**, wipe cookies **and** redirect to `login?error=session_expired`. Applied globally that logs out **guests** and, on a **throw** (Supabase down), expires cookies for everyone — worse than the bug.  
v5 P9 already: Settings `signOut({ scope: "local" })` in `finally` after `delete_user`. Happy path clears cookies in the browser. Hole is **signOut-local fail + leftover `sb-*-auth-token`**: client `onAuthStateChange` can still hydrate Header from the JWT; middleware treats the next dashboard hit as anonymous; public pages look signed-in. Not a loop. Shared-kiosk leftover.  
**Reject:** redirect loop. **Reject:** `user===null` ⇒ always expire + `session_expired`. **Accept:** expire `sb-*auth*` cookies only when `getUser()` **resolves with `error`**. Thrown (network): keep cookies (outage). Guest, no auth cookies, `user===null`, no error: no-op.

**Staff 🟡 1 — v1→v2 drops custom questions — WRONG FIELD.**  
HEAD stores custom items in `customQuestions: { id, text }[]` (`useVisitPlanner.ts:16–24`, `addCustomQuestion` writes `cq-${Date.now()}`). `selectedQuestions` is catalog strings only. v5 already: “Custom questions unchanged” + unmapped `selectedQuestions` **drop**. Promoting unmapped selected strings into `customQuestions` would turn **stale EN catalog lines** into fake custom questions after a copy change / locale mismatch — worse than drop.  
**Reject** as stated. **Accept explicit:** copy `customQuestions` as-is; do **not** promote unmapped `selectedQuestions`.

**Sec 🟡 2 — pin `xdmbyadosmzixsxqullj` + `*.ingest.sentry.io` in CSP — ALREADY THERE AS WILDCARDS; PIN IS WORSE.**  
`next.config.mjs:72` and `netlify.toml:69` already: `'self' https://*.supabase.co wss://*.supabase.co https://*.ingest.sentry.io` + GA/GTM. `security-headers.json` does not exist yet (P16). Pinning the project ref breaks preview projects and is not how HEAD works.  
**Reject** project-ref pin. Canonical JSON keeps the **existing wildcards**.

**Sec 🟡 3 — `display_name` JSON-LD XSS — OVERBLOWN.**  
`JsonLd.tsx:11–12` already `JSON.stringify(data).replace(/</g, "\\u003c")`. Profile `display_name` is not injected into JsonLd (site schema). Header/dashboard are JSX. P16 already: keep escapes + round-trip test. No new work.

**Clin 🟡 2 — guideline-specific citation strings in the validator — SCOPE CREEP.**  
P8 contract is presence + denylist, 400-day `lastReviewed`. Requiring `"AHA/ACC 2017 Hypertension Guidelines"` as a validator rule is a content rewrite, not a schema check. **Reject** as launch must. MDX copy can improve when those files are open; not a P8 gate.

**PM 🟡 2 — `git checkout main` at 13:00 — DESTRUCTIVE PROCEDURE, RULE ALREADY EXISTS.**  
v5 already: stop P14 at 13:00 if not green; 19.1 then P15; never merge red generators onto `main`. `git checkout main` with dirty files drops the branch. **Reject** checkout-as-discard. **Accept:** leave `revamp/p14-*` unmerged; start P16 from `main`.

**PM 🟢 Gate 0 screenshot — ALREADY IN v5 §4.2.** No-op.

---

### Valid (keep as 🔴 or cheap 🟡)

| ID                                   | Verdict            | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff 🔴 1 contact stream 500        | **ACCEPT**         | v5 CF-30 named the cap, not the error taxonomy. §6.1: “read `request.body`” — `Request.body` is `ReadableStream \| null`. Empty POST → `getReader()` TypeError. `JSON.parse` without its own catch falls into the **outer** catch (`route.ts:153–156`) which is **500 + `reportServerError`**. HEAD `request.json()` already 500s on `{`. Paste-ready stream without 400s is a spec hole, not a HEAD regression. `reader.cancel()` on 413 is real isolate hygiene.                                                                                                    |
| Staff 🔴 2 AuthProvider wipe + tests | **PARTIAL**        | Wipe-on-failure is the leftover: P5 §8.1 says “After `signOut()` **succeeds**.” P9 Settings `finally` is correct; **Header / MobileMenu call `AuthProvider.signOut`**, not Settings. Offline logout skips `resetLocalProgress` — CF-25 kiosk leak still open on the global path. P9 **does not list `AuthProvider.tsx`**. Tests: `AuthProvider.test.tsx:74–78` renders bare `<AuthProvider>`; `useAppState` throws (`AppProviders.tsx:240`). P5 §8.3 already says **mock** `resetLocalProgress`. **Do not** wrap full `AppProviders` (persist effect). Mock the hook. |
| Sec 🔴 1 stale JWT cookies           | **PARTIAL**        | See overblown. Narrow expire-on-`error` is in. Blanket null-user is out.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Clin 🔴 1 100.4°F                    | **ACCEPT**         | Same class as CF-5/14/22/27: implementers paste §7.2. v5 string says “Fever in infants” with **no number**. AAP/ACEP neonatal fever is 100.4°F / 38°C. Do **not** put “rectal” in the user-facing line (axillary/forehead under-read; any 100.4 in <3 months is the 911-class exception). Threshold belongs in the paste string + tests `/100\.4\|38/`.                                                                                                                                                                                                               |
| PM 🔴 1 Day 2 order                  | **PARTIAL**        | Reorder the cell. No clock.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Staff 🟡 4 Sentry fetch timeout      | **ACCEPT**         | HEAD `reportServerError` is `console.error` only (`errorReporting.ts:149–153`). v5 P16 adds HTTP ingest with flood throttle, **no abort**. Combined with Staff 🔴 1: bot `POST /api/contact` with `{` → 500 → ingest `fetch()` until Netlify kills the isolate.                                                                                                                                                                                                                                                                                                       |
| UX 🟡 2 `-webkit-mask-image`         | **PARTIAL**        | Real iOS. Add the prefix. Scroll-linked dual fade is extra P11 surface — skip. Static right-edge fade may clip Z; accept for launch.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| UX 🟡 3 TOC DOM order                | **ACCEPT** (cheap) | `lg` sticky TOC before `<main>` traps keyboard/SR in the outline. Main first, aside second, grid for visual. Not scroll-spy (already rejected Round 4).                                                                                                                                                                                                                                                                                                                                                                                                               |
| Clin 🟡 3 print disclaimer           | **ACCEPT** (cheap) | P15 print-only 911/988 is numbers. Fridge print still lacks “not a diagnosis.” Footer `hidden print:block`.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

---

### Combined flaws (v5 ∩ panel — these are the launch-killers this round)

**CF-33 — CF-30 stream cap ∪ paste algorithm omits null body / `JSON.parse` 400 ∪ outer catch 500 + `reportServerError` ∪ P16 HTTP ingest with no abort.**  
v5 closed the chunked-body memory hole and left the **status code** as HEAD: any throw is 500 and is reported. After P16 that report is a network call. Public unauthenticated POST. Bots send empty bodies and `{`.  
**v6:** After origin + rate-limit: `Content-Length` > 10240 → 413, do not read. `request.body == null` → 400. Else stream with running count; on overflow `await reader.cancel()`, 413. `finally` `releaseLock()`. `JSON.parse` in its own try → 400. **Do not** `reportServerError` 400/413. Outer catch stays for unexpected only. `reportServerError` ingest: `signal: AbortSignal.timeout(2000)`, `.catch(() => {})`. Tests: empty body 400; `{` 400; stream without CL >10KB 413; 6th ingest in 10s no fetch **and** a hung fetch does not stall (abort).

**CF-34 — CF-25 `resetLocalProgress` ∪ P5 “after `signOut` succeeds” ∪ P9 Settings `finally` ∪ Header uses `AuthProvider.signOut` ∪ P9 file list omits `AuthProvider.tsx` ∪ isolated tests.**  
Delete path is specified. **Logout** path (kiosk, Header, MobileMenu) is not. Util ships Day 1; wiring for the function every user actually clicks ships Day 2 **and** only on success.  
**v6:** Phase **9** owns `AuthProvider.signOut`: `try { await supabase.auth.signOut() } catch { /* ignore */ } finally { resetLocalProgress(); router.push("/") }`. Hook `useAppState` at component top (layout already wraps AppProviders → AuthProvider). Tests: `vi.mock` `useAppState` → `resetLocalProgress`; **do not** wrap `AppProviders`. Case: `signOut` reject still wipes + push. Settings still **must not** call `AuthProvider.signOut` (independent local scope + finally). P5: do not regress; delete the “after succeeds” sentence.

**CF-35 — C32 JWT ≤1h ∪ P9 local `signOut` `finally` ∪ middleware ignores `result.error` ∪ `onAuthStateChange` hydrates leftover cookies ∪ panel’s blanket `user===null` wipe.**  
Not a login↔dashboard loop (`LoginForm` has no auto-redirect; guard is dashboard-only). Real leftover: rpc deleted `auth.users`, local signOut failed, `sb-*` cookies remain, `getUser()` returns error + `user: null`, middleware does not expire cookies, Header can still look signed-in.  
**v6:** In `updateSession`, if `getUser()` **resolves** with `error`, expire cookies whose names match `/^sb-.*-auth-token/` (and chunked `-auth-token.` suffixes) on `supabaseResponse` (`Max-Age=0; Path=/`). Thrown → keep cookies, existing dashboard-unauthenticated behavior. No cookies + `user===null` + no error → guest, no-op. Do **not** add `?error=session_expired` on anonymous dashboard hits (that is just login). Tests: auth cookies + resolved error → `Set-Cookie` expires them; no cookies + `/en/learn` → 200; throw + cookies present → cookies **not** expired.

**CF-36 — CF-27 paste `homeCarePediatricNote` ∪ “Fever in infants” with no temperature.**  
Implementers ship the example. “Fever” is how a 99.8°F axillary reading stays home.  
**v6:** Replace the EN+ES paste strings with a 100.4°F / 38°C threshold (panel wording, **no** “rectal” in the UI string). Tests: existing infant/dehydrat **plus** `/100\.4|38/`. Voice stays education-not-triage; this remains the 911-class exception.

**CF-37 — Day 2 cell lists `4` first ∪ parenthetical “6 first” ∪ “P6 is larger this round” ∪ never-cut 1–6.**  
Not a schema deadlock. A solo agent doing P4 all morning delays 015.  
**v6:** Cell reads **6 first**, then 5, 7; **4 parallel**. No AM/PM.

---

### 🔴 disposition (implementation cannot start on v5)

| Panel 🔴                                               | Disposition          | v6 action                                                                                  |
| ------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------ |
| Contact stream `TypeError` / `SyntaxError` 500         | **ACCEPT**           | Null body + parse → 400; cancel on 413; no Sentry on those; ingest timeout (CF-33)         |
| `AuthProvider` `useAppState` + wipe skipped on failure | **PARTIAL**          | `try/finally` on Day 1 in P9; mock hook, do not wrap `AppProviders`; kill “after succeeds” |
| Middleware stale JWT redirect loop                     | **PARTIAL**          | Expire cookies on **resolved** `getUser` error only; reject blanket null-user / loop story |
| Header `max-w-md` + `/es` overflow tokens              | **REJECT as stated** | Accordion stays full-width; overflow already Playwright-gated; tighten-if-fail ladder only |
| Pediatric 100.4°F                                      | **ACCEPT**           | Paste strings + tests; no “rectal” in the UI copy                                          |
| Day 2 08:00 P6 vs P4                                   | **PARTIAL**          | Reorder the cell; reject the clock                                                         |

**Second-opinion verdict:** v5 **NO**. Do not implement from `REVAMP/PLAN.v5.md`. v6 must land CF-33…CF-37 plus accepted 🔴s.

**Rejected panel “mandatory” item 4 as stated (overlay drawer / invented Spanish labels).** Substitute: overflow tests + tighten-if-fail. **Rejected redirect loop / `user===null` ⇒ `session_expired`.** Substitute: expire `sb-*` cookies on resolved auth error, keep cookies on throw. **Rejected Day 2 AM/PM.** Substitute: list 6 first, P4 parallel.
