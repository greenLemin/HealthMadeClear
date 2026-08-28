# HealthMadeClear Launch Revamp — Panel Critique: Round 8

**Doc Under Review:** `REVAMP/PLAN.v8.md` (2026-08-27)
**Panel:** Staff Eng, Sec Eng, UX Lead, Clinical (PharmD), PM
**Objective:** Eighth-round adversarial evaluation of Implementation Plan v8 to break the plan, discover edge cases, and verify framework, security, UX, clinical, and schedule safety before launch execution.

---

## CRITIC 1 — Staff Engineer

_Focus: feasibility, hidden complexity, framework/DB behavior, wrong assumptions._

### 1. 🔴 Phase 9 (§12.1) `src/lib/supabase/middleware.ts` — `setAll` Preserves i18n 3xx Response but Silently Drops `request.cookies.set` on the Redirect Path

- **Section:** §12.1 `setAll` (CF-43), lines ~1076.
- **Problem:**
  Plan says: "if `supabaseResponse.status` is 3xx, **do not** `NextResponse.next` — set auth cookies on the existing redirect."
  `supabaseResponse.cookies.set(name, value, options)` works on redirect responses (Next.js allows cookie mutation on all response types). But the plan never says to call `request.cookies.set(name, value)` on the **3xx path**. The `@supabase/ssr` `setAll` contract requires two operations: (1) set cookies on the outgoing response, and (2) set cookies on the incoming `request` so downstream middleware / RSC reads the refreshed tokens. Plan describes the request cookie update only for the 2xx rebuild path: "cookiesToSet.forEach onto request.cookies." On a 3xx, request cookies go unset → server components in the redirect target read the stale pre-refresh JWT from the original request.

  Additionally: plan says "If incoming i18n response was 3xx and current is 200, return the 3xx with cookies copied." This implies **two** response objects coexist (`supabaseResponse` = 200, original i18n = 3xx). But `supabaseResponse` is initialized to the i18n response. If `setAll` is told "don't replace on 3xx," `supabaseResponse` remains the original 3xx throughout. The "if current is 200" branch can only trigger when `setAll` was **not called** (no token refresh needed). In that case no cookies need copying — the 3xx already carries the original cookies. This branch is dead code.

- **Suggested Fix:**
  1. On the 3xx path inside `setAll`, still execute `cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))` — same as the 2xx path. Auth cookies on the request propagate to the redirect target's server components.
  2. Remove or reclassify the dead "3xx-to-200" branch. If it's intended as a guard against a future code path, document that explicitly. Currently it misleads implementers into thinking it handles a real scenario.
  3. Add test: incoming 3xx locale redirect + `setAll` triggered by token refresh → verify `request.cookies` contain the refreshed auth token, not just the response `Set-Cookie` headers.

---

### 2. 🟡 Phase 6 (§9.1) `015_quiz_attempts_best_score.sql` — `WHERE score > max_score` Normalization Filter Misses Equal-Value Corruption

- **Section:** §9.1 `015` normalize step.
- **Problem:**
  Plan says 015 normalizes rows where `score > max_score` (HEAD stores percent in `score`, question count in `max_score`). Normalization: `score = ROUND(score / 100 * max_score)`. Filter `WHERE score > max_score` catches clear cases like `score=80, max_score=5` (80 > 5 → normalize to 4).

  **Edge case:** If HEAD stored `score = 60, max_score = 60` (e.g., a quiz where 60% was stored in both columns by a bug or manual intervention). `60 > 60` is false → row is skipped → stays `60/60`. Dashboard shows `60/60 = 100%`. Real score was `3/5 = 60%`.

  Another case: `score = 100, max_score = 100`. Skipped. Shows 100% which happens to be correct, but the absolute count (`5` not `100`) is wrong. Future features relying on absolute count will break.

- **Suggested Fix:**
  Add secondary normalization: `WHERE score > 10 AND max_score <= 10` catches all percent-in-score rows (no quiz has >10 questions). Or add a pre-flight count: `SELECT COUNT(*) FROM quiz_attempts WHERE score = max_score AND score > 10` — if any rows match, normalize those too. Log the count in migration output.

---

### 3. 🟡 Phase 12 (§15.1) `useVisitPlanner` — "Ignore `changeVisitType` Until Hydrate" is Ambiguous UX

- **Section:** §15.1 + §10.9, line ~30 v8 changelog.
- **Problem:**
  Plan says P12 "ignores `changeVisitType` / step advances until hydrate completes." But `changeVisitType` is a **user-facing select** element rendered immediately on mount. If the select visually changes but the handler is ignored, the user sees their selection revert on hydrate → UX confusion. Should the select be **disabled** until hydrated? Should the value be buffered and applied post-hydrate?

- **Suggested Fix:**
  Clarify in §15.1: `visitType` select element `disabled={!hydrated}` (prevents visual mismatch). Or: buffer `changeVisitType` calls in a ref and replay after hydrate completes. "Ignore" without specifying the UI behavior leads to inconsistent implementations.

---

### 4. 🟢 Phase 14 (§17.4) — Bundle Analysis Acceptance Criteria Assumes Deterministic Chunk Names

- **Section:** §17.4 acceptance criteria.
- **Problem:**
  Plan says: "Client graph for `/en/learn/[slug]` does not include `lessonBundles.es`." Next.js 16 uses hashed chunk names → `source-map-explorer` output shows hash filenames, not module names. Need `--json` output + grep module paths, or `@next/bundle-analyzer`. Plan says "analyzer evidence" but doesn't specify which tool or verification command.

- **Suggested Fix:**
  Specify: `ANALYZE=true npm run build` with `@next/bundle-analyzer`, or `npx source-map-explorer .next/static/chunks/*.js --json | grep lessonBundles.es` (exit code 1 = pass).

---

## CRITIC 2 — Security Engineer

_Focus: RLS, auth, injection, privacy of health-adjacent data, rate limiting._

### 1. 🔴 Phase 9 (§12.1) `clearLocalHealthData` — Prefix Regex `/^hmc[-_]/` Assumed but Not Verified Against Actual `STORAGE_KEYS` Constants

- **Section:** §12.1 `src/lib/clearLocalHealthData.ts`, line ~1071.
- **Problem:**
  Plan's prefix regex `/^hmc[-_]/` is designed to catch `hmc-completed-lessons`, `hmc_guest_progress`, etc. But there is no assertion in the plan or tests that **all** health-related `STORAGE_KEYS` values actually start with `hmc[-_]`. If `guestProgress.ts` defines keys like `guest_quiz_scores` (no `hmc` prefix), the regex misses them → health data persists after logout/delete on shared devices.

  Broader risk: any future developer who adds a storage key without the `hmc` prefix silently bypasses the wipe. There is no lint rule, no test, and no documentation enforcing the `hmc[-_]` prefix convention on `STORAGE_KEYS`.

- **Suggested Fix:**
  1. In `clearLocalHealthData.test.ts`, add an assertion: `Object.values(STORAGE_KEYS).every(k => /^hmc[-_]/.test(k) || PRESERVE_SET.has(k))` — fails CI if any new key breaks the prefix convention.
  2. If any current `STORAGE_KEYS` value lacks the `hmc` prefix, rename it in Phase 5 (guest storage) or Phase 9 (this phase). Document the convention in `STORAGE_KEYS` JSDoc.

---

### 2. 🟡 Phase 9 (§12.1) `expireClientAuthCookies` — Cookie Path Mismatch Scenario Untested

- **Section:** §12.1 `expireClientAuthCookies`, line ~1071.
- **Problem:**
  Plan specifies `Max-Age=0; path=/; SameSite=Lax` for expiring `sb-*-auth-token` cookies. If Supabase auth cookies were ever set with `path=/en` (locale-prefixed path) by a misconfigured middleware, setting `Max-Age=0` with `path=/` will **not** expire them — browsers treat cookies with different paths as distinct entries.

  `@supabase/ssr` `DEFAULT_COOKIE_OPTIONS` uses `path: "/"` — so this is unlikely in normal operation. But the plan should verify this assumption in tests rather than relying on it silently.

- **Suggested Fix:**
  Add test assertion: verify `@supabase/ssr` `DEFAULT_COOKIE_OPTIONS.path === "/"`. Or test: plant `sb-test-auth-token` with `path=/en`; call `expireClientAuthCookies()`; assert cookie still exists (documenting the limitation). Either approach closes the gap.

---

### 3. 🟡 Phase 16 (§19.1) `reportServerError` — In-Memory Rate Limiter Resets on Every Netlify Edge Cold Start

- **Section:** §19.1, line ~1694.
- **Problem:**
  Plan: "In-memory sliding window, max 5 ingest POSTs per 10 seconds per isolate." Netlify Functions v2 (edge) spin up fresh isolates frequently. Each cold start resets the counter → a broken deploy triggering errors could spawn 50 concurrent isolates, each sending 5 Sentry events → 250 events in 10 seconds. The per-isolate throttle protects individual isolates from stalling but provides no global flood protection.

- **Suggested Fix:**
  Document the limitation explicitly (per-isolate, not global). Recommend configuring Sentry project-level rate limiting (Dashboard → Settings → Rate Limiting) as the global backstop. If the Sentry project has a low event quota, this is acceptable. If not, add `SENTRY_SERVER_SAMPLE_RATE` env (e.g., 0.1) as a secondary control.

---

### 4. 🟢 Phase 1 (§4.2) Gate 1 Preflight — FK Cascade Snapshot Query Not Provided

- **Section:** §4.2 Gate 1 preflight + line ~33 v8 changelog.
- **Problem:**
  Plan says "snapshot FKs to `auth.users` / `profiles`; abort if cascade missing." No SQL query is provided. An implementer may write an incorrect `pg_constraint` join and miss a non-cascading FK.

- **Suggested Fix:**
  Paste the verification query into §4.2:
  ```sql
  SELECT conname, conrelid::regclass, confrelid::regclass, confdeltype
  FROM pg_constraint
  WHERE confrelid IN ('auth.users'::regclass, 'public.profiles'::regclass)
    AND contype = 'f';
  ```
  Assert all rows have `confdeltype = 'c'` (cascade). If any row shows `'a'` (no action) or `'r'` (restrict), abort.

---

## CRITIC 3 — UX Lead

_Focus: does the plan fix what AUDIT-VISUAL.md found? Will the result feel polished to a first-time user?_

### 1. 🔴 Phase 10 (§13.1) `Header.tsx` — AUDIT-VISUAL Finding #1 Targets `lg:flex` (1024px), Plan Chose `xl:flex` (1280px) — 1024–1279px Gap Untested

- **Section:** §13.1 line ~1126.
- **Ref:** AUDIT-VISUAL.md line 43: "Change `2xl:flex` to `lg:flex` or `xl:flex`." Line 263 (ranked action #1): "Change `2xl:flex` to `lg:flex`."
- **Problem:**
  AUDIT-VISUAL's primary recommendation and ranked action #1 both specify `lg:flex` (1024px). Plan chose `xl:flex` (1280px) with sound justification: "8 nav items overflow at 1024 on `/es`." The `xl` choice correctly fixes the **core complaint** (1440px desktops see hamburger).

  **Gap:** The plan has Playwright tests at 390px, 1280px, 1440px, and 1024×768 for the accordion — but no explicit test at **1024px wide** verifying that the hamburger experience is acceptable (accordion opens, all items reachable, no visual regression). AUDIT-VISUAL specifically called out 1024px users (13" laptops, iPad Pro landscape). Without testing, the 1024–1279px range is an untested experience path.

- **Suggested Fix:**
  1. Accept `xl:flex` (plan's justification is sound for 8 Spanish nav items).
  2. Add Playwright at **1024×768 landscape**: verify hamburger opens, accordion scrolls, last auth control reachable. This is already partially specified ("1024×768") but not explicitly in the acceptance criteria for the **desktop hamburger UX** (only for the accordion scroll).
  3. Add a note to §13.1 acceptance: "1024px stays hamburger **by design** (8 nav items). Tested as working hamburger experience." This formally closes AUDIT-VISUAL finding #1.

---

### 2. 🟡 Phase 11 (§14.1) `GlossaryClient.tsx` — A-Z Buttons Changed to Horizontal Scroll but Size Spec Missing

- **Section:** §14.1 + line ~31 v8 changelog.
- **Ref:** AUDIT-VISUAL.md line 122–124: A-Z buttons are `28×28px`, need `min-w-[40px] min-h-[44px]`.
- **Problem:**
  Plan specifies `snap-proximity` + `-webkit-overflow-scrolling: touch` (motion behavior). But the plan does not specify the **button size** in the new horizontal scroll row. AUDIT-VISUAL says each letter button needs `min-w-[40px] min-h-[44px]`. If the implementer keeps the existing `28×28px` in the new scroll row, tap targets are still too small — they're just scrollable now.

- **Suggested Fix:**
  Add to §14.1 scope: each letter button `min-w-[44px] min-h-[44px] px-3 py-2 text-label-md`. Plan already has `snap-proximity`; pin the size to close the AUDIT-VISUAL finding completely.

---

### 3. 🟡 Phase 13 (§16.1) `ArticlePageClient.tsx` — Mobile Reading Progress Bar in Changelog but Missing from Scope Table and Acceptance

- **Section:** §16.1 + §10.7, line ~27 v8 changelog.
- **Ref:** AUDIT-VISUAL.md line 109–111: article prose width + TOC.
- **Problem:**
  The v8 changelog (line 27) says: "Article mobile: reading progress `h-1` bar (same idea as lesson) + heading `scroll-mt-24` (already P13)." But §16.1 scope table and §10.7 mini-spec both say "Mobile: no TOC (sections still have headings)" — neither mentions the progress bar. The `scroll-mt-24` is specified. The progress bar is orphaned in the changelog without implementation spec or acceptance criteria. An implementer following §16.1 and §10.7 will skip it.

- **Suggested Fix:**
  Add to §16.1 scope table (`ArticlePageClient.tsx`): "Mobile: `<div className='fixed top-0 left-0 h-1 bg-primary/80 z-40' style={{ width: scrollPercent + '%' }} />`" and to §10.7 acceptance: "Mobile article shows reading progress bar at top of viewport."

---

### 4. 🟡 Phase 10 (§13.1) `Header.tsx` — Accordion `overflow-visible` on Glass Shell Creates Blur Rendering Seam

- **Section:** §13.1 line ~1126: "use `overflow-visible` when open, or move clip to the decorative gradient only."
- **Problem:**
  Plan offers two options for preventing the glass shell from clipping the accordion: `overflow-visible` when open, or moving the clip to the decorative gradient. `overflow-visible` on the glass shell lets the `backdrop-blur` effect leak past the card edges when the menu is expanded. On 390px, the menu body extends past the glass boundary → visible rendering seam between the blurred area and the opaque menu content. "Move clip to the decorative gradient only" is vague — which DOM element holds the gradient vs. the blur?

- **Suggested Fix:**
  Specify the DOM architecture: keep `overflow-hidden` on the glass `backdrop-blur` element. Apply `overflow-visible` on the **outer wrapper** that contains both the glass bar and the accordion panel. The accordion panel renders as a **sibling** to the glass element (not a child), below it. This prevents blur leak while allowing the accordion to extend past the glass bar's bounds.

---

### 5. 🟢 Phase 15 (§18.1) — No `navigator.share()` on Mobile Despite Share UX Being the Feature

- **Section:** §18.1 + §10.4.
- **Problem:**
  Plan copies the article share pattern (clipboard + X intent link). Mobile browsers widely support `navigator.share()`, which provides the native OS share sheet (Messages, WhatsApp, etc.). The plan specifies "non-HTTPS clipboard failure → error toast" but never mentions `navigator.share`. Mobile users expect the native share sheet, not a "copy link" button.

- **Suggested Fix:**
  Add to §18.1 scope: `if (navigator.share) { await navigator.share({ url, title }) } else { clipboard fallback }`. This is a cheap enhancement (~5 lines) that significantly improves perceived polish on mobile.

---

## CRITIC 4 — Clinical Content Reviewer (PharmD Persona)

_Focus: clinical accuracy, drug safety, emergency escalations, plain language, disclaimers._

### 1. 🔴 Phase 4 (§7.2) `scenarioChestPainBody` — "Do Not Always Cause Crushing" is Negative Framing That Delays Recognition in Acute Distress

- **Section:** §7.2, line ~28 v8 changelog: "Heart attacks do not always cause crushing chest pain."
- **Problem:**
  Plan's two-sentence split (ROUND-7 Clin 🟡 1) opens with a **negative construction**: "Heart attacks do not always cause crushing chest pain." In low-health-literacy populations experiencing acute stress, negative framing triggers **negation blindness** — the reader's brain processes the affirmative clause ("heart attacks cause crushing chest pain") before processing the negation. AHA and CDC plain-language emergency guidelines recommend leading with **positive action statements** (what to look for, not what might not happen).

  Second sentence: "In women, older adults, and people with diabetes, warning signs often include…" This demographic qualifier implies atypical presentation is limited to these groups. Men under 50 can present atypically (inferior MI → epigastric pain, no crushing chest component), as can post-surgical patients and those on beta-blockers.

- **Suggested Fix:**
  Reframe with positive lead and broader scope:
  - **EN:** "A heart attack can cause many different symptoms — not just crushing chest pain. Warning signs include jaw, neck, back, or arm pain, sudden shortness of breath, unexplained cold sweats, nausea, or dizziness. These symptoms may be more common in women, older adults, and people with diabetes, but anyone can experience them. If you notice any of these symptoms, do not wait and do not self-treat. In the United States, call 911 immediately."
  - **ES:** "Un ataque al corazón puede causar muchos síntomas diferentes, no solo un dolor fuerte en el pecho. Las señales de alerta incluyen dolor en la mandíbula, cuello, espalda o brazos, falta de aire repentina, sudoración fría inexplicable, náuseas o mareos. Estos síntomas pueden ser más comunes en mujeres, adultos mayores y personas con diabetes, pero cualquier persona puede experimentarlos. Si nota cualquiera de estos síntomas, no espere y no se automedique. En los Estados Unidos, llame al 911 de inmediato."

---

### 2. 🟡 Phase 4 (§7.2) `homeCarePediatricNote` — No Age Qualifier for Dehydration Signs Beyond "Young Children"

- **Section:** §7.2 + line ~68 v8 changelog.
- **Problem:**
  Plan specifies 100.4°F (38°C) for infants <3 months (correct AAP threshold). For dehydration, plan references "young children" without defining the age range. Dehydration signs differ significantly by age:
  - **Infants (<12 months):** sunken fontanelle, no tears when crying, <6 wet diapers/24h
  - **Toddlers (1–3 years):** dry mouth, no tears, reduced urine output
  - **Older children (>3 years):** dark-colored urine, dizziness, dry mouth

  "Young children" is ambiguous. A parent of a 7-year-old may not consider their child "young." The plan doesn't specify which dehydration signs to include in the UI string.

- **Suggested Fix:**
  Add to §7.2 `homeCarePediatricNote` dehydration: "In babies and children under 3, watch for no tears when crying, fewer than 6 wet diapers in 24 hours, or a sunken soft spot on the head. In older children, watch for dark urine, dry mouth, or dizziness." Include both age groups with age-appropriate sign lists.

---

### 3. 🟡 Phase 8 (§11.2 Step 4) `understanding-prescription-labels.mdx` — Poison Help Number Placement Risk of Being Buried in Content

- **Section:** §11.2 step 4, line ~1020.
- **Problem:**
  Plan instructs adding Poison Help `1-800-222-1222` as a "warning callout / key takeaway" in `understanding-prescription-labels.mdx`. MDX warning callouts may be visually de-emphasized (colored box, smaller text) or placed at the bottom of the content. If placed after 1,500+ words of label-reading instructions, a parent dealing with a dosing emergency won't find it.

  Compare: `whenInDoubtBody` in the care-guide places Poison Help prominently near the top. The lesson should follow the same pattern.

- **Suggested Fix:**
  Specify: Poison Help callout must appear in the **first 3 content sections** of the MDX file, not at the end. Use `<Callout type="warning">` (not `<details>` or collapsible). Add verification: `grep -n '222-1222' content/lessons/en/understanding-prescription-labels.mdx` — line number should be in the top third of the file.

---

### 4. 🟢 Phase 15 (§18.1) `disclaimer.printMedicalWarning` — "Pharmaceutical Advice" is Not Plain Language

- **Section:** §18.1 line ~1649.
- **Problem:**
  Disclaimer text: "does not provide medical or pharmaceutical advice." The word "pharmaceutical" is above a 6th-grade reading level. Many low-health-literacy users do not know what "pharmaceutical" means. The app is health education — "medical advice" alone covers the legal scope (standard educational disclaimer language). Adding "pharmaceutical" without also adding "nutritional" / "diagnostic" / "therapeutic" is arbitrary.

  Minor issue — not a safety blocker. But the disclaimer should follow its own plain-language mandate.

- **Suggested Fix:**
  Simplify EN: "Health Made Clear is for educational purposes only and does not replace medical advice. Always talk to your doctor or pharmacist about your own health and prescriptions."
  This keeps the pharmacist mention (important for medication lessons) while removing the jargon word "pharmaceutical." ES equivalent adjustment.

---

## CRITIC 5 — Ruthless Project Manager

_Focus: scope realism for 4 days, phase ordering, dependency deadlocks, rollback._

### 1. 🔴 Day 1 (§3) — P1 + P2 + P3 + P9 + `014` Apply is 13–18 Hours in a 10-Hour Day

- **Section:** §3 Four-day calendar, line ~442.
- **Problem:**
  Day 1 scope breakdown:
  - **P1** (write 014 reconciliation SQL + Gate 0 proof): **3–4h** — complex idempotent migration covering 13 pending migrations' intent, rollback SQL, preflight checks.
  - **P2** (auth recovery PKCE rewrite + 6 test files): **3–4h** — `ResetPasswordClient` rewrite, `exchangedRef` consume-once, confirm route `type` guard, `callback` locale, 4 test files.
  - **P3** (privacy rewrite + contact body reader + rate-limit cap + env gate): **2–3h** — privacy copy both locales, streaming body reader with `reader.cancel()`, rate-limit Map cap, `check-production-env.mjs`.
  - **P9** (auth UX + 8 new test files + middleware `setAll` rewrite): **4–6h** — `clearLocalHealthData`, `expireClientAuthCookies`, `AuthProvider` rewrite (treat `{ error }` + throw), `MobileMenu` wire, middleware `setAll` preservation, `isAuthSessionError`, 8 new test files including `middleware.test.ts` with 6 distinct cases.
  - **Gate 1** (wait Netlify deploy + apply 014 + verify): **1h** — deploy wait, `db push`, spot-check contact + delete.

  **Total: 13–18h estimated.** Plan budget: "~10 hour days."

  P9 alone is the **largest single phase** in the entire plan (8 test files, middleware rewrite, 3 component rewrites, 2 new utility files). Scheduling it on Day 1 alongside P1 (high-risk DB) + P2 (medium auth rewrite) + P3 (medium privacy/contact) + a production DB migration is schedule suicide. Any P9 test failure blocks Gate 1, which blocks 014, which blocks Day 2.

- **Suggested Fix:**
  Move P3 **bulk** (privacy copy, contact body reader, rate-limit cap) to Day 2 morning before P6. Keep P3's env-gate file (`check-production-env.mjs`) on Day 1 as a standalone small PR — it's the Gate 0 prerequisite.

  Revised Day 1: P1 (write 014) → P2 → P9 → Gate 1 → apply 014. (~11–14h — still tight but feasible with parallelism between P1 review and P2 coding.)
  Revised Day 2: P3 (morning) → P6 → P5 → P4 (parallel with P6 or P3).

---

### 2. 🟡 Day 4 (§3) — Phase 14 "3h Timebox" Before Phase 16A Risks Blocking Must-Ship Security Work

- **Section:** §3 Day 4 row, line ~445.
- **Problem:**
  Day 4 order: P13 leftover → **P14 (3h timebox)** → **16A must-dos (CSP/Sentry)** → **15A print disclaimers** → 15 rest → 16B optional.

  P14 (bundle splitting) is timeboxed but scheduled **before** 16A (CSP sync + Sentry PII — non-negotiable security) and 15A (print clinical footers — non-negotiable clinical). If P14 runs long, takes unexpected debugging, or the developer gets absorbed, 16A and 15A start late. "Stop P14 at 13:00 if not green" helps — but a developer mid-refactor at 12:55 will push to 13:30.

  More importantly: P14 is explicitly "descoped" in the constraints (line 55: "Phase 14 descoped"). Yet it appears in the Day 4 calendar before must-ship phases. This ordering contradiction creates implementation risk.

- **Suggested Fix:**
  Reorder Day 4: **P13 leftover → 16A (CSP/Sentry) → 15A (print footers) → P14 (3h timebox, if time remains) → 15 rest → 16B optional.** This ensures the two non-negotiable items ship before the speculative work starts. P14 becomes truly "if Day 4 has leftover time" rather than a schedule blocker.

---

### 3. 🟡 Phase 6 (§9) — 015 Apply ↔ Client Deploy Coordination Window Has a Retake-Breaking Gap

- **Section:** §9.1, line ~57 + §3 parallelism notes line ~449.
- **Problem:**
  Plan says: "P6 must not apply `015` to production until the upsert client is in the same Netlify deploy (or already live)." The workflow is: merge PR (containing both the upsert `QuizClient` and 015 SQL moved to `migrations/`), wait for Netlify deploy, then manually `npx supabase db push`.

  Between 015 apply (adds `UNIQUE (user_id, quiz_id)`) and the client deploy going live (changes `.insert()` to `.upsert()`), there is a window where the **old** `.insert()` code is live with the new unique constraint → quiz retakes hit Postgres error `23505` (unique violation). Plan says "same deploy" but doesn't specify the exact order.

  If an engineer applies 015 while Netlify is still building (triggered by the merge), retakes break for ~10–15 minutes. If Netlify deploy fails, retakes are permanently broken until a rollback of 015.

- **Suggested Fix:**
  Add explicit coordination step to §9.1: "After Netlify shows 'Published' for the P6 commit, **then** run `npx supabase db push` to apply 015. Do not apply 015 before confirming the deploy is live. If the deploy fails, do not apply 015 — fix the build first." Add to §9.5 acceptance: "No quiz retake `23505` errors in production logs for 30 minutes after 015 apply."

---

### 4. 🟢 Day 3 (§3) — Four PRs (P8/P10/P11/P12) All Edit `src/messages/en.json` / `es.json` → Sequential Merge Conflicts

- **Section:** §3 Day 3, line ~444.
- **Problem:**
  P8 (citations + trust banner), P10 (header/404/ErrorBoundary), P11 (footer/glossary/drawer), P12 (search/planner) all add i18n keys to `src/messages/en.json` and `es.json`. Four concurrent PRs editing the same JSON files → `git` merge conflicts on rebase. `git` doesn't understand JSON structure — it sees line-level conflicts even when keys are distinct.

- **Suggested Fix:**
  Accept 5-minute rebase per PR as a schedule tax (~20 min total). Or: each PR adds keys to the **end** of its respective section in the JSON to minimize line-level conflicts. Not blocking — just a predictable friction point to account for in Day 3 estimates.

---

## Verdict Table — Can Implementation Start?

| Critic                           |  Status   | Blocking Items (🔴)                                                                                                        |
| -------------------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------- |
| **CRITIC 1 — Staff Engineer**    | 🔴 **NO** | 1. `setAll` 3xx path skips `request.cookies.set` → RSC in redirect target reads stale JWT.                                 |
| **CRITIC 2 — Security Engineer** | 🔴 **NO** | 1. `/^hmc[-_]/` prefix wipe unverified against actual `STORAGE_KEYS` — no lint/test enforcing the prefix convention.       |
| **CRITIC 3 — UX Lead**           | 🔴 **NO** | 1. 1024–1279px hamburger experience untested; no Playwright at 1024px wide to close AUDIT-VISUAL finding #1.               |
| **CRITIC 4 — Clinical (PharmD)** | 🔴 **NO** | 1. Chest-pain "do not always cause" negative framing → negation blindness risk in acute distress; demographics too narrow. |
| **CRITIC 5 — PM**                | 🔴 **NO** | 1. Day 1 packs 13–18h into 10h budget; P9 (largest phase) + P1 + P2 + P3 + 014 apply is schedule overload.                 |

### Overall Verdict: **NO — Plan v8 needs 5 targeted fixes before implementation starts.**

v8 correctly resolved all 5 ROUND-7 🔴 items (CF-43 through CF-47). The fixes introduced **new gaps** in the fix implementations plus a schedule overload:

1. **`setAll` 3xx `request.cookies.set` propagation:** Plan tells implementer to preserve the 3xx response but omits `request.cookies.set` on that code path → stale JWT in redirect target's server components. Add request cookie update on the 3xx branch + test.
2. **`STORAGE_KEYS` prefix enforcement:** Plan's wipe regex assumes all health keys match `/^hmc[-_]/` but provides no test asserting `STORAGE_KEYS` values conform. Add CI assertion.
3. **1024px Playwright coverage:** Plan chose `xl:flex` (justified), but must close AUDIT-VISUAL finding #1 with a 1024px hamburger test + explicit design-decision note.
4. **Chest-pain clinical copy positive reframe:** Leading with "do not always cause" violates plain-language emergency guidelines (negation blindness). Reframe to "many different symptoms — not just crushing chest pain" + broader demographics.
5. **Day 1 schedule overload:** Move P3 bulk (privacy copy + contact reader + rate-limit) to Day 2 morning. Keep env-gate file on Day 1. Reorder Day 4 to put 16A + 15A before P14 timebox.

---

## Cursor/Grok Second Opinion

**Reviewer:** Principal engineer (skeptical). Claims checked against current tree (`src/middleware.ts`, `src/lib/supabase/middleware.ts` `setAll`, `@supabase/ssr` `DEFAULT_COOKIE_OPTIONS`, `src/lib/preferences.ts` `STORAGE_KEYS`, `src/lib/guestProgress.ts` `STORAGE_PREFIX`, `OnboardingDialog.tsx` `ONBOARDING_KEY`, `SaveProgressBanner.tsx` `BANNER_DISMISSED_KEY`, `Header.tsx` glass `overflow-hidden` + accordion child, `AUDIT-VISUAL.md` finding #1 / ranked action #1, `GlossaryClient.tsx` `h-11 min-w-11 px-3`, `LessonPageClient.tsx` reading bar, `ArticlePageClient.tsx` clipboard/X share, `useVisitPlanner.ts` `hydrated` write-gate, `VisitPlannerClient.tsx` visit-type buttons, `quizBundles.en.ts` question counts 5 or 10, `content/lessons/en/understanding-prescription-labels.mdx` 86 lines / no `222-1222`, `package.json` `analyze` + `@next/bundle-analyzer`, `REVAMP/PLAN.v8.md` §§3, 4.2, 4.3 B, 6.1, 7.2, 9.1–9.2, 11.2, 12.1–12.3, 13.1–13.3, 14.1, 15.1, 16.1, 17.2–17.4, 18.1, 19.1, mini-spec §10.7 / §10.9, C53/CF-43), not screenshots.
**Documents:** `REVAMP/PLAN.v8.md` + this panel log.
**Date:** 2026-08-27
**Disposition key:** **ACCEPT** = v9 must change. **REJECT** = critique wrong or overblown; v9 keeps v8 and says why. **PARTIAL** = real issue, wrong size/severity/fix.

v8 closed Round 7 launch-killers (CF-43…CF-47). Round 8 still blocks — three of five 🔴s are real pins on v8 paste, two 🔴s are misreads of v8 text that still need an implementer-proof rewrite, and every 🔴 is worse at an **intersection** the panel treated as a local miss. Dangerous leftovers of last round: CF-43 `setAll` “don’t replace 3xx” written as one 200-word cell; CF-39 prefix wipe with no CI pin on the key registry; compact-at-xl + AUDIT-VISUAL `lg:flex` ranked #1 never formally closed; Clin 🟡 1 two-sentence split locked in as `/do not always cause crushing/` test regex; Day 1 cell `3 (env-gate)` vs “announce after 1–3” with P3 bulk **absent** from Day 2.

---

### Wrong or overblown

**Staff 🔴 1 as stated — 3xx `setAll` omits `request.cookies.set`; redirect-target RSC reads stale JWT — WRONG MECHANISM, PARTIAL PASTE.**
v8 §12.1 already opens the `setAll` cell with “`cookiesToSet.forEach` onto `request.cookies`” **before** the 3xx branch. HEAD `middleware.ts:61–67` already sets request cookies, then replaces the response (the CF-43 bug). A true HTTP 3xx from middleware does **not** render the redirect target in the same request — the browser follows `Location` and sends a **new** request carrying `Set-Cookie` from the 3xx. Stale JWT in “redirect-target RSC” is not how 307 works. next-intl locale **rewrites** are 200 + `x-middleware-rewrite`; those **do** need `request.cookies.set` (already specified for the 2xx rebuild).
**Reject** “plan never says `request.cookies.set` on 3xx” as a literal read of the cell opener, and reject stale-JWT-in-3xx-RSC as the failure mode. **Accept:** the 200-word cell lets an implementer put `request.cookies.set` only on the rebuild; paste numbered steps; test `request.cookies` after 307+`setAll`. The “incoming 3xx and current is 200” return is a **regression guard** if step 2 holds — not dead in the sense of delete-it, dead in the sense of should-not-fire. Label it.

**Sec 🔴 1 as stated — `/^hmc[-_]/` unverified; example `guest_quiz_scores` — INVENTED KEY, REAL GAP IS CI PIN.**
`STORAGE_KEYS` today: all ten values are `hmc-*`. Guest keys are `hmc_guest_` (`guestProgress.ts:4`). `ONBOARDING_KEY` = `hmc_onboarded`. `BANNER_DISMISSED_KEY` = `hmc_save_progress_dismissed`. Planned P7/P12 keys (`hmc-glossary-lookups`, `hmc-visit-planner-v2`) already match. There is **no** `guest_quiz_scores`. Prefix scan already deletes keys **not** in `STORAGE_KEYS` (that was CF-39). A `STORAGE_KEYS`-only assertion misses constants that sit **outside** the object.
**Reject** “current health keys lack the prefix” and the `guest_quiz_scores` example. **Accept cheap:** CI assertion on `STORAGE_KEYS` **plus** `ONBOARDING_KEY` / `BANNER_DISMISSED_KEY` / `STORAGE_PREFIX` / `visitPlannerV2`; JSDoc convention. Do not rename current keys.

**UX 🔴 1 as stated — 1024–1279 hamburger untested — OVERSTATED.**
v8 §13.2 already: Playwright **1024×768**, open hamburger, last auth control reachable by scrolling the **menu**. §13.3 acceptance already names 1024×768. `xl:flex` is the compact-at-xl contract (C52 / CF-45); AUDIT-VISUAL line 43 allowed `lg` **or** `xl`; ranked action #1 said `lg`; 8 Spanish nav items overflow at 1024 — v8’s `xl` choice is correct.
**Reject** “no 1024 test.” **Accept cheap:** one acceptance sentence: 1024–1279 stays hamburger **by design**; Playwright also asserts hamburger **visible** and **opens** (not only “scroll works”). That formally closes AUDIT-VISUAL finding #1.

**UX 🟡 2 A-Z button size missing — ALREADY 44px.**
HEAD `GlossaryClient.tsx:126` is `chip flex h-11 min-w-11 … px-3`. v8 §14.1 already `min-h-11 min-w-11 shrink-0`. AUDIT-VISUAL asked `min-w-[40px] min-h-[44px]`. `min-w-11` **is** 44px.
**Reject** as new size work. **Accept:** keep `h-11 min-w-11 px-3 py-2 text-label-md` explicit so a restyle cannot shrink the snap row.

**UX 🟡 3 article progress bar orphaned from §16.1 — STALE READ.**
v8 §16.1 `ArticlePageClient` cell already: “Add a thin reading progress bar (`h-1 bg-primary/80 fixed top-0 left-0 z-40`, same idea as `LessonPageClient`)”. §16.3 acceptance already: “Mobile article has a reading progress bar.” Changelog line 27 is **not** the only spec. §10.7 mini-spec still says only “Mobile: no TOC” — that is the real lag.
**Reject** “implementer following §16.1 will skip it.” **Accept cheap:** copy the bar into §10.7; pin `role="progressbar"` like HEAD `LessonPageClient` (`h-1.5`, not a mute unmarked div).

**PM 🔴 1 as stated — Day 1 is 13–18h because P3 bulk sits on Day 1 — MISREAD; REAL BUG IS ORPHAN.**
v8 Day 1 cell is already “3 **(env-gate)**”, not privacy+contact+rate-limit. Panel’s hour table **re-adds** P3 bulk to Day 1, then “fixes” it by moving P3 bulk to Day 2. Day 2 cell lists `6, 5, 7, 4` — **P3 bulk is on neither day.** “Do not announce launch until 1–3 are on production” still requires 3B. P1 write + P2 + P9 + Gate 1 is still the heavy day (~11–14h with parallelism), not 13–18h.
**Reject** “v8 scheduled P3 bulk on Day 1.” **Accept:** name **3A** (env-gate, Day 1) and **3B** (privacy + contact reader + rate-limit, Day 2 **morning**, before P6). Not a scope cut. Reorder Day 4: 16A + 15A **before** P14 timebox (PM 🟡 2 is the real calendar 🔴).

**Sec 🟡 1 `path=/en` cookie — UNLIKELY IN HEAD.**
`@supabase/ssr` `DEFAULT_COOKIE_OPTIONS.path === "/"`. v8 expire uses `path=/`.
**Reject** as a production bug. **Accept cheap:** assert `DEFAULT_COOKIE_OPTIONS.path === "/"` in the expire test; document that `path=/` cannot expire a hypothetically mis-pathed cookie.

**Clin 🟢 4 “pharmaceutical” jargon — NOT A SAFETY BLOCKER.**
Accept the plain-language rewrite in P15A (cheap). Do not treat as 🔴.

**UX 🟢 5 `navigator.share` — POLISH, NOT AUDIT-VISUAL #1.**
Accept cheap in `shareCurrentPage.ts` (already a P15 extract). Fallback clipboard + X unchanged.

---

### Valid (keep as 🔴 or cheap 🟡)

| ID                                      | Verdict                            | Why                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Staff 🔴 1 `setAll` 3xx request cookies | **PARTIAL** (paste + test)         | Cell opener is easy to miss. Numbered steps: **always** `request.cookies.set` first; 3xx sets cookies on the existing redirect; 2xx rebuilds. Guard-label the 3xx-to-200 return. Test `request.cookies` after 307+`setAll`. Reject stale-JWT-in-3xx-RSC.                                                                 |
| Sec 🔴 1 prefix convention              | **PARTIAL** (CI pin)               | Current keys already match. Future `STORAGE_KEYS.foo = "quiz_scores"` silently bypasses wipe. Assert prefix on `STORAGE_KEYS` **and** the out-of-object constants. JSDoc.                                                                                                                                                |
| UX 🔴 1 1024 hamburger                  | **PARTIAL** (close the audit)      | `xl:flex` stays. 1024×768 test already exists. Add “hamburger by design” + hamburger-visible/opens in acceptance.                                                                                                                                                                                                        |
| Clin 🔴 1 chest-pain negation           | **ACCEPT**                         | v8 paste **and** §7.4 regex `/do not always cause crushing/` lock the 🟡-1 split the PharmD now rejects. Positive lead + “anyone can experience them.” ES paste. Drop that regex.                                                                                                                                        |
| PM 🔴 1 Day 1 hours                     | **PARTIAL** (orphan, not overload) | Schedule 3B on Day 2 morning. Day 1 stays 014-write + Gate 0 + P2 + 3A + P9 + Gate 1. Day 4: 16A → 15A → P14.                                                                                                                                                                                                            |
| Staff 🟡 1 015 `score = max_score`      | **ACCEPT** (cheap SQL+TS)          | Live HEAD shape is 80/5 (`score > max_score`). Catalog max is **10** questions (`quizBundles.en.ts`). Equal-value percent (60/60) is a manual/bug row: `WHERE score = max_score AND score > 10`. Same predicate in `normalizeStoredScore`. Preflight `COUNT(*)` in apply note. 4/5 and 8/10 unchanged. 80/100 unchanged. |
| Staff 🟡 2 planner “ignore” UX          | **ACCEPT** (disable, don’t buffer) | Visit types are **buttons**, not a `<select>` (panel slip). `disabled={!hydrated}` on type controls + Next. Do not buffer-and-replay (that is the revert).                                                                                                                                                               |
| Staff 🟡 3 analyzer command             | **ACCEPT**                         | `package.json` already has `"analyze": "ANALYZE=true next build --webpack"` + `@next/bundle-analyzer`. Pin that. Do not invent `source-map-explorer` as required.                                                                                                                                                        |
| Sec 🟡 2 Sentry isolate flood           | **ACCEPT** (document + env)        | Per-isolate window cannot be global on Netlify. Document it. Optional `SENTRY_SERVER_SAMPLE_RATE` (default `1`). Project-level Sentry limit is the global backstop — not a new vendor.                                                                                                                                   |
| Sec 🟢 4 FK `confdeltype`               | **ACCEPT** (paste)                 | §4.2 already has `pg_get_constraintdef`. Add the panel’s `confdeltype = 'c'` query as the abort check.                                                                                                                                                                                                                   |
| UX 🟡 4 accordion blur seam             | **ACCEPT**                         | HEAD accordion is a **child** of `surface-card-glass overflow-hidden` (`Header.tsx:107–273`). `overflow-visible` on the glass leaks blur. Spec: outer wrapper `overflow-visible`; glass keeps `overflow-hidden` (gradient clip); accordion is a **sibling** below the glass, `max-h` + `overflow-y-auto`.                |
| Clin 🟡 2 pediatric age bands           | **ACCEPT**                         | Replace “young children” with <3y vs older-child sign lists. Keep 100.4°F / 38°C / no “rectal” / no `somnolencia extrema`.                                                                                                                                                                                               |
| Clin 🟡 3 Poison Help placement         | **ACCEPT**                         | File is 86 lines, no `222-1222` today. First **3** `##` sections; `<Callout type="warning">` (not `<details>`). `grep -n` line in the top third.                                                                                                                                                                         |
| Clin 🟢 4 print disclaimer jargon       | **ACCEPT** (cheap)                 | Drop “pharmaceutical”; keep pharmacist.                                                                                                                                                                                                                                                                                  |
| PM 🟡 2 Day 4 P14-before-16A            | **ACCEPT** (part of CF-52)         | Contradicts “never drop 19.1” and “P14 descoped.”                                                                                                                                                                                                                                                                        |
| PM 🟡 3 015 vs Netlify Published        | **ACCEPT**                         | “Same window” is not an order. Published **then** `db push`. No 015 if the deploy failed. 30 min no-`23505` check.                                                                                                                                                                                                       |
| PM 🟢 4 JSON rebase                     | **ACCEPT** (note)                  | Day 3 PRs add keys at the **end** of their JSON section. 5-min rebase tax. Not a calendar rewrite.                                                                                                                                                                                                                       |
| UX 🟢 5 `navigator.share`               | **ACCEPT** (cheap, P15)            | `shareCurrentPage.ts`: `navigator.share` if present, else clipboard; X intent stays.                                                                                                                                                                                                                                     |

---

### Combined flaws (v8 ∩ panel — these are the launch-killers this round)

**CF-48 — CF-43 “don’t replace 3xx” ∪ a single 200-word `setAll` cell ∪ Staff reading `request.cookies.set` as 2xx-only ∪ 3xx-to-200 return copied from CF-43 as if `setAll` still replaces 3xx ∪ tests that assert 307 + `Set-Cookie` but never `request.cookies`.**
v8 did tell implementers to `forEach` onto `request.cookies`. It did **not** make that a numbered step that survives a 3xx early-return. If the implementer writes `if (3xx) { response.cookies.set; return }` **without** the request mutation, next-intl **200 rewrites** that later get converted, or a future `NextResponse.next({ request })`, lose the refresh. The 3xx-to-200 branch is a guard, not a live path, and currently reads like a third response algebra.
**v9:** `setAll` numbered steps: (1) **always** `request.cookies.set`; (2) if status 3xx, `cookies.set` on **that** response, do not replace; (3) else rebuild `NextResponse.next({ request, headers })`, copy prev cookies, apply `cookiesToSet`. Return-path “incoming 3xx + current 200 → return 3xx with cookies” labeled **regression guard** (must not fire if step 2 holds). Tests: incoming 307 + `setAll` → still 307 + `Set-Cookie` **and** `request.cookies` has the new token; rewrite headers survive 2xx `setAll`; dashboard 307 still expires `sb-*` (CF-38). Do **not** skip `getUser()` on i18n 3xx.

**CF-49 — CF-39 prefix scanner ∪ `STORAGE_KEYS` is not the only registry ∪ P7 `hmc-glossary-lookups` / P12 `hmc-visit-planner-v2` added after P9 ∪ no test that new keys keep `/^hmc[-_]/`.**
Wipe regex is correct **today**. The kiosk hole is a future key `quiz_scores` (no prefix) in `STORAGE_KEYS` **or** a new `const FOO = "lookups"` outside it. Panel’s `guest_quiz_scores` is not in the tree.
**v9:** JSDoc on `STORAGE_KEYS`: every value must match `/^hmc[-_]/`. `clearLocalHealthData.test.ts` asserts `Object.values(STORAGE_KEYS)` plus `ONBOARDING_KEY`, `BANNER_DISMISSED_KEY`, `STORAGE_PREFIX`, and `STORAGE_KEYS.visitPlannerV2` (once P12 adds it) all match `/^hmc[-_]/` or the preserve set. Do not rename current keys. Do not expire preference cookies. Preserve list unchanged.

**CF-50 — compact-at-xl (`xl:flex`) ∪ AUDIT-VISUAL ranked #1 `lg:flex` ∪ 1024×768 accordion-scroll test that never says “1024 is hamburger on purpose” ∪ glass `overflow-hidden` parent still clips (CF-45) ∪ `overflow-visible` blur seam (UX 🟡 4).**
v8 picked the right breakpoint and already tests short accordion at 1024×768. It never **closes** the audit finding, so a later agent can “fix” it back to `lg:flex` and overflow `/es`. Parent clip + blur leak is the remaining visual hole.
**v9:** Keep `xl:flex`. Acceptance: **1024–1279 hamburger by design** (8 nav items; audit allowed `lg` or `xl`). Playwright 1024×768: hamburger **visible**, opens, last control reachable inside the menu (body stays `overflow: hidden`). DOM: outer wrapper `overflow-visible`; glass shell keeps `overflow-hidden` (gradient only); accordion **sibling** below glass with `max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain`. Do not add Accessibility/Contact as primary nav.

**CF-51 — Clin 🟡 1 two-sentence split ∪ §7.4 `/do not always cause crushing/` ∪ negation blindness ∪ demographic list read as exclusive ∪ `homeCarePediatricNote` “young children” with no age band.**
v8 **fixed** atypical ACS by locking the negative lead the new 🔴 rejects. Tests will fail a positive rewrite. Pediatric dehydration signs differ <3y vs older; “young children” is undefined.
**v9:** Replace `scenarioChestPainBody` with the panel’s **positive-lead** EN/ES paste (“many different symptoms — not just crushing chest pain” + “anyone can experience them” + 911). Tests match `/many different symptoms|jaw|neck|back|sweat|911/` **not** `/do not always cause crushing/`. Pediatric note: infants <3 months 100.4°F (38°C); dehydration signs for babies/children under 3 **and** older children. No “rectal.” No `somnolencia extrema`.

**CF-52 — Day 1 cell `3 (env-gate)` ∪ “announce after 1–3” ∪ Day 2 omits P3 bulk ∪ panel counting P3 bulk inside a 13–18h Day 1 ∪ Day 4 P14-before-16A vs “P14 descoped” / “never drop 19.1” ∪ P6 “same deploy” without Netlify **Published** then `015`.**
P3 bulk is **orphaned**, not stacked on Day 1. Day 4 still runs descoped P14 ahead of must-ship 16A/15A. 015-before-Published is a retake `23505` window.
**v9:** **3A** = `check-production-env.mjs` (Day 1, Gate 0 helper). **3B** = privacy copy + contact reader + rate-limit cap (Day 2 morning, **before P6**). Not cut. Day 1 = write `014` + Gate 0 + P2 + 3A + P9 + Gate 1 apply `014`. Day 4 = P13 leftover → **16A** → **15A** → P14 3h timebox if time remains → P15 rest → 16B. P6: wait Netlify **Published**, **then** `npx supabase db push` `015`. If the deploy failed, do not apply 015. Accept 30 min no-`23505` in logs.

---

### 🔴 disposition (implementation cannot start on v8)

| Panel 🔴                                  | Disposition | v9 action                                                                                                                                         |
| ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setAll` 3xx skips `request.cookies.set`  | **PARTIAL** | Numbered `setAll` steps; always mutate request cookies; guard-label 3xx-to-200; test `request.cookies` (CF-48). Reject stale-JWT-in-3xx-RSC.      |
| `/^hmc[-_]/` unverified vs `STORAGE_KEYS` | **PARTIAL** | CI assertion + JSDoc + out-of-object constants (CF-49). Reject invented `guest_quiz_scores`; do not rename current keys.                          |
| 1024–1279 hamburger untested              | **PARTIAL** | Close AUDIT-VISUAL #1: hamburger **by design**; Playwright hamburger visible+opens at 1024 (CF-50). Accordion sibling DOM. Reject “no 1024 test.” |
| Chest-pain “do not always cause”          | **ACCEPT**  | Positive-lead paste; drop the crushing-negation regex (CF-51). Pediatric age bands.                                                               |
| Day 1 13–18h overload                     | **PARTIAL** | 3A Day 1 / 3B Day 2 morning; Day 4 16A+15A before P14; 015 after Published (CF-52). Reject “P3 bulk is on Day 1.”                                 |

**Second-opinion verdict:** v8 **NO**. Do not implement from `REVAMP/PLAN.v8.md`. v9 must land CF-48…CF-52 plus accepted 🔴s.

**Rejected:** stale JWT in 3xx-target RSC as the `setAll` failure mode; current `STORAGE_KEYS` / guest keys lacking `hmc` prefix; `guest_quiz_scores`; “no Playwright at 1024”; A-Z size missing (`min-w-11` already 44px); article progress bar missing from §16.1; P3 bulk scheduled on Day 1; `path=/en` as a HEAD cookie bug; `014` FK rewrite (still snapshot-only).
