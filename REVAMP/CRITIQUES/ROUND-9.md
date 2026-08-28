# HealthMadeClear Launch Revamp — Panel Critique: Round 9

**Doc Under Review:** `REVAMP/PLAN.v9.md` (2026-08-27)
**Panel:** Staff Eng, Sec Eng, UX Lead, Clinical (PharmD), PM
**Objective:** Ninth-round adversarial evaluation of Implementation Plan v9. Each critic tries to break the plan. v9 already incorporated ROUND-8 + CF-48…CF-52. Do not re-litigate those unless the v9 **paste** is still wrong or the fix introduced a new hole.

**HEAD checks (2026-08-27):** `src/middleware.ts`, `src/lib/supabase/middleware.ts` `setAll` (always `NextResponse.next({ request })`, `getUser` ignores `result.error`, dashboard `!user` is a bare 307), `src/components/Header.tsx` (accordion **child** of `surface-card-glass overflow-hidden`), `src/app/[locale]/HomeClient.tsx` (video **above** `<Hero />`), `src/app/[locale]/learn/[slug]/quiz/QuizClient.tsx` (percent as `score`), `src/hooks/useProgress/mutations.ts` (`.insert()`), `src/data/quizBundles.en.ts` (52 quizzes: 51×5, 1×10), `public/ga-init.js` (`anonymize_ip: true`, `page_path` only), `src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx` (hash `code`, **no** `replaceState`), `src/components/mdx/InlineGlossaryTerm.tsx` (popover portaled to `document.body`; outside-click uses trigger `span` only), `content/lessons/en/understanding-prescription-labels.mdx` (86 lines; `##` 3 at line 43; `:::warning` at 52–54), `src/lib/preferences.ts` `STORAGE_KEYS`, `src/app/[locale]/layout.tsx` (`<main id="main-content">`).

---

## CRITIC 1 — Staff Engineer

_Focus: feasibility, hidden complexity, framework/DB behavior, wrong assumptions._

### 1. 🔴 Phase 6 (§9.1) `normalizeStoredScore` TypeScript contract is un-pasteable (`||` splits the markdown table)

- **Section:** Changelog from v8 (line 26) + Phase 6 §9.1 `src/lib/quizScore.ts` row (line ~1211). Same class as changelog line 24 (`/many different symptoms|jaw|…/` split into phantom columns). Phase 4 **list** paste at §7.2 lines 1081 / 1099 is intact — do not re-open CF-51 copy.
- **Problem:**
  v9’s new predicate is `score > maxScore || (score === maxScore && score > 10)`. Markdown treats each `|` as a column break. The How cell truncates at `score > maxScore`, then an empty cell, then the percent-in-both clause in a phantom column. An implementer who pastes the table implements only `score > maxScore` and **drops the 60/60 case v9 added**. Phase 9 display-name row already escaped `\|\|` (line 1427); this row did not. §4.3 B SQL is intact (not in a `||` table). Tests in the next row still say `60/60 → 36/60`, so TDD can save a careful agent — the **contract cell cannot**.
- **Suggested Fix:**
  Move the predicate out of the table into a fenced block (or write `OR` / `\|\|`). Canonical:

```ts
if (maxScore > 0 && (score > maxScore || (score === maxScore && score > 10))) {
  return { score: clamp(Math.round((score * maxScore) / 100), 0, maxScore), maxScore };
}
```

Landmine (not launch-blocking): HEAD catalog is 5 or 10 questions (`understanding-prescription-labels` is the 10). A future `12/12` perfect row would match `score === maxScore && score > 10` and become `ROUND(12*12/100)=1`. Comment that `> 10` is coupled to today’s catalog.

### 2. 🔴 Phase 9 (§12.1) CF-48 step 3 still does not name which `Headers` object — locale rewrite dies again

- **Section:** Changelog line 21; Phase 9 §12.1 `src/lib/supabase/middleware.ts` step **(3)** (“copy previous headers into `NextResponse.next({ request, headers })`”).
- **Problem:**
  Next.js 16 `NextResponse.next(init?: MiddlewareResponseInit)` has **two** header slots:
  - `init.headers` = `ResponseInit` → **middleware response**. This is where next-intl puts `x-middleware-rewrite`.
  - `init.request.headers` = downstream **request** override. Passing a non-`Headers` value there throws.
    `{ request, headers }` is object shorthand for an unbound `headers` identifier. HEAD `setAll` is `NextResponse.next({ request })` with **no** response-header copy (`src/lib/supabase/middleware.ts:68`). Copying `request.headers` into the top-level `headers` key puts `Cookie`/`Host` on the **response** and drops `x-middleware-rewrite` — **CF-43 again**. Tests in §12.2 would catch it only if written; the numbered paste itself is not implementable.
- **Suggested Fix:**
  Paste this, names and all:

```ts
supabaseResponse = NextResponse.next({
  request,
  headers: supabaseResponse.headers, // ResponseInit — keeps x-middleware-rewrite
});
// then copy previous response cookies, then cookiesToSet
```

Do **not** pass `request.headers` as `init.headers`. Keep step 1 (`request.cookies.set` always) so the `Cookie` request header is what `init.request.headers` forwards.

### 3. 🟡 Phase 1 (§4.3 A.2) Gate 1 `confdeltype` abort is not scoped to `public`

- **Section:** Changelog line 31; §4.3 A.2 abort SQL (lines 621–628).
- **Problem:**
  `WHERE confrelid IN ('auth.users'::regclass, 'public.profiles'::regclass)` is target-qualified, **not** source-schema-qualified. Live project `xdmbyadosmzixsxqullj` returns **15** FKs: 8 GoTrue (`auth.identities`, `sessions`, `mfa_factors`, …) + 7 `public.*`. All currently `confdeltype = 'c'` — Gate 1 would **pass today**. The plan still says abort if **any** row is not `'c'` and **do not rewrite FKs in 014**. One GoTrue `NO ACTION` / `RESTRICT` on a platform table the team cannot `ALTER` blocks `014` for the rest of the window.
- **Suggested Fix:**
  Abort only on `public` sources:

```sql
SELECT n.nspname, c.conname, conrelid::regclass, confrelid::regclass, confdeltype
FROM pg_constraint c
JOIN pg_class rel ON rel.oid = c.conrelid
JOIN pg_namespace n ON n.oid = rel.relnamespace
WHERE c.contype = 'f'
  AND n.nspname = 'public'
  AND c.confrelid IN ('auth.users'::regclass, 'public.profiles'::regclass);
```

Keep the unfiltered dump as informational. Abort only if a **`public`** row is not `'c'`.

### 4. 🟡 Phase 9 (§12.1) P9 cell distinguishes throw vs resolved `error` in prose; HEAD still cannot implement it

- **Section:** §12.1 after `getUser()`; HEAD `src/lib/supabase/middleware.ts:76–89`.
- **Problem:**
  Discriminant for **cookie expiry** is in the giant cell (resolve+`error` → expire on the returned response; throw → keep cookies; dashboard `!user` → copy cookies onto 307). Missing is a paste that **binds** `error`. HEAD:

```76:89:src/lib/supabase/middleware.ts
  let user: { id: string } | null = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // If Supabase is down, treat as unauthenticated — dashboard will redirect.
  }

  if (isDashboardRoute && !user) {
    return NextResponse.redirect(loginUrl);
  }
```

`result.error` is never read. Catch sets `user = null`. Dashboard + throw, dashboard + stale JWT, and dashboard + guest are the same `!user` 307. Cookie-copy-on-307 is specified; the `error` variable is not in scope if implementers keep this try/catch.

- **Suggested Fix:**
  Numbered `getUser` block next to `setAll`:

```ts
let user = null;
let authError = null;
try {
  const result = await supabase.auth.getUser();
  user = result.data.user;
  authError = result.error; // resolved AuthError, including stale JWT
} catch {
  authError = null; // outage: do not expire
}
// expire iff authError != null
// dashboard !user: copy cookies onto 307; expire only if authError
```

Add the missing test: `getUser` **throws** + `/en/dashboard` + `sb-*` present → 307 **with cookies copied, not expired**.

### 5. 🟡 Phase 8 (§11.2) Poison Help: “first 3 `##` sections” vs “top third (≤ ~29)” cannot both be satisfied

- **Section:** Changelog line 34; Phase 8 §11.2 step 4 (lines 1368–1372) + acceptance.
- **Problem:**
  EN `understanding-prescription-labels.mdx` is 86 lines. Top third ≤ ~29. `##` headings at 24, 28, **43**, 56, 65, 79, 83. Section 3 (“Understanding Dosage Instructions”) **starts at 43**. HEAD `:::warning` is lines **52–54**. The plan says add a **new** `:::warning` there, “still in the top third.” That grep line is ~52, not ≤29. ES file is **76 lines**; top third ≤ ~25. Dual acceptance: (a) anywhere in the first three `##` sections, (b) `grep -n '222-1222'` in the top third. Only overlap is a callout **inside section 1** (EN lines 24–27). Following the HEAD warning pointer fails the grep gate.
- **Suggested Fix:**
  Pick one gate. Clinical home is the dosage `:::warning` (see Critic 4). Drop the raw “top third ≤ ~29” line-number cap. Assert `222-1222` appears **before** the “Special Warnings” heading.

### 6. 🟡 Phase 10 (§13.1) / appendix §13.1 — sibling accordion has no surface; `P3B ──► P6` is not a technical dep

- **Section:** Changelog line 23; Phase 10 §13.1 `Header.tsx`; appendix §13.1 graph (line 2134); P6 dependencies (line 1203). HEAD `src/components/Header.tsx:72–80, 107, 209–273`.
- **Problem:**
  1. Accordion markup is `border-t … pb-4` with **no background**. It inherits `surface-card-glass` today because it is a **child** of the glass card. CF-50 moves it to a **sibling below** glass and forbids `overflow-visible` on the blur. As written, the 1024 menu is unstyled text on the sticky header’s transparent padding. No `bg-*`, radius, or shadow is specified. (UX Lead escalates this to 🔴 — see Critic 3.)
  2. `P3B ──► P6` is **not** technically required. 015 / upsert / `QuizClient` counts do not read privacy copy, the contact body reader, or the rate-limit Map cap. P6 line 1203 still: “**3B must be merged before this PR**.” If legal copy bikesheds, unique+normalize waits.
- **Suggested Fix:**
  Accordion sibling: solid `bg-surface-container-lowest` (not a second blur), `rounded-b-[…]`, `shadow-elevation-1`, `border-x border-b`. Keep glass `overflow-hidden`. Draw P3B→P6 as a calendar dashed arrow; P6 merge gate stays **014 applied + upsert client**.

Netlify: v9 middleware paste uses `NextResponse` / `Headers` / `@supabase/ssr` only — no Node-only APIs in Edge middleware. No finding.

---

## CRITIC 2 — Security Engineer

_Focus: RLS, auth, injection, privacy of health-adjacent data, rate limiting._

**Closed / not reopened:** CF-38/39/44/47/49 as specified. Current `STORAGE_KEYS` / `hmc_guest_*` / `hmc_onboarded` match `/^hmc[-_]/`. No IndexedDB. `delete_user` `SET search_path = public` is not a confused-deputy. Quiz `answers` jsonb is row-gated (`003` `FOR ALL` + 014 FORCE RLS). 014 + Gate 0 fail-closed (no PostgREST INSERT dual-path). CSP `'unsafe-inline'` stays documented for this window. Header `{displayName}` is React text (escaped).

### 1. 🔴 Phase 3B (§6.2) privacy copy claims Sentry redaction that Phase 16A has not shipped

- **Section:** §6.2 `privacy.collectBodyErrors`; Changelog v8 (3A/3B split, Day 4 = 16A); §19.1 `errorReporting.ts`; HEAD `src/lib/errorReporting.ts`; `src/app/[locale]/auth/reset-password/ResetPasswordClient.tsx`; `src/app/[locale]/error.tsx` / `global-error.tsx`.
- **Problem:**
  3B (Day 2) pastes: crash reports do not include name/email/IP **and** “We strip URL query strings and hash fragments.” 16A (Day 4, never-drop) is the first paste that sets `sendDefaultPii: false`, clears `event.user`, and strips `?` / `#` in `beforeSend`. HEAD `beforeSend` only regex-scrubs email/phone/SSN/card in **messages**; it does **not** strip `event.request.url`. HEAD `ResetPasswordClient` reads `window.location.hash` (`code`) and **never `replaceState`s** (P2 Day 1 _will_ add `replaceState` on that page only). `error.tsx` / `global-error.tsx` call `reportClientError`. If `NEXT_PUBLIC_SENTRY_DSN` is set, a crash on a `?error=` / `#code=` URL sends the fragment/query to Sentry while the privacy page claims they are stripped. Same journalist-vs-network-tab class Phase 3 exists to kill — a **new** lie, live for the whole Day 2–4 window, and permanently if 16A slips.

  P2 `replaceState` is a **partial** mitigation for the recovery secret on `/auth/reset-password` after tokens are read. It does not make the privacy sentence true for every locale page.

- **Suggested Fix:**
  Until 16A lands, `collectBodyErrors` must not claim query/hash strip (path slugs + “we do not send name/email” can stay). **Or** add a **≤1h** `beforeSend` URL strip to 3B-code (not full 16A — see PM). After P2 reads the hash, `history.replaceState` to a fragment-free URL (already in §5.1 — keep it).

### 2. 🔴 Phase 3B (§6.2) `collectBodyAnalytics` cites a GA4 no-op and denies query strings that `ga-init.js` still sends

- **Section:** §6.2 `privacy.collectBodyAnalytics`; HEAD `public/ga-init.js`; `src/components/GoogleAnalytics.tsx`; `src/lib/analytics.ts`.
- **Problem:**
  Copy says “IP anonymization is on” **because** `ga-init.js` has `anonymize_ip: true`, and “We do not send the URL query string.” IDs are `G-` (GA4). `anonymize_ip` is a Universal Analytics field; GA4 ignores it (IP non-storage is a **platform default**, not this flag). `gtag('config')` sets `page_path` only. GA4 `page_location` defaults to `location.href` **including the query string** (fragment excluded). First page_view therefore sends `?error=`, `?redirect=`, UTMs. `trackPageView` later sends a cleaned `page_location`; that does not unsend the config hit. Layout mounts `GoogleAnalytics` on every locale page. Shipping this sentence is another privacy lie Phase 3 is supposed to replace `privacy.collectBody` with.
- **Suggested Fix:**
  In `ga-init.js` (same 3B PR as the copy, or it is another lie): set `page_location` to `origin + pathname` (no search, no hash), matching `analytics.ts`. Drop `anonymize_ip` **or** rewrite copy to Google’s GA4 line: IPs are not logged or stored by GA4; this app sends path only. Add a test that the init snippet contains `page_location` without `window.location.href`.

### 3. 🟡 Phase 5 (§8.1) localStorage guest store attaches prior kiosk progress to the next account

- **Section:** §8.1–8.2 (P5 after P6); §12.1 wipe on logout/delete only; HEAD `src/lib/guestProgress.ts` (sessionStorage today).
- **Problem:**
  Out-of-scope TTL/kiosk confirm is noted. The **new** hole is storage class: HEAD guest migrate keys die with the tab; P5 makes `hmc_guest_*` canonical **localStorage** (plus union with `STORAGE_KEYS.completedLessons`). P9 prefix wipe runs on **logout/delete**, not on guest walk-away. Next visitor who hits Login/Signup uploads the previous person’s lesson IDs and quiz scores (health-adjacent topics) into **their** `lesson_progress` / `quiz_attempts`. `guestProgressWillSync` is a disclosure, not a gate. Same-tab leftover already existed; overnight / new-tab leftover is P5.
- **Suggested Fix:**
  Keep no TTL if product requires browse-then-signup, but require a blocking confirm that lists counts (N lessons / N quizzes) before migrate on **login** (signup-from-empty-device can stay implicit), **or** migrate only on signup and ignore guest keys on login. Privacy `collectBodyGuest` should say leftover device progress can attach to whoever signs in next.

### 4. 🟡 Phase 9 (§12.1) Prefix wipe + CF-49 pin miss GA identity cookies

- **Section:** §12.1 `clearLocalHealthData` / `expireClientAuthCookies`; CF-49 pin.
- **Problem:**
  Verified: no IndexedDB. Every current health key matches `/^hmc[-_]/`. `BANNER_DISMISSED_KEY` is sessionStorage; P9 scans sessionStorage — not a leak. Cookies besides `sb-*` and locale/theme: `hmc-text-size`, `hmc-simple-mode` (preserve set, intentional), and **`_ga` / `_ga_*`**. Expire helper only matches `/^sb-.*-auth-token/`. After kiosk logout, Google’s client id remains and keeps receiving lesson/article **path slugs** (same class 3B discloses). CF-49 does not pin cookie names or `_ga`.
- **Suggested Fix:**
  If GA ships, expire `_ga` / `_gid` / `_ga_*` on logout/delete **or** disclose persistent analytics cookies on shared devices in `collectBodyAnalytics`. Keep preference cookies.

### 5. 🟡 Phase 9 (§12.1) `resetLocalProgress` empty-first does not own planner/checklist React state

- **Section:** §12.1 Settings delete / `AppProviders.resetLocalProgress`; HEAD `useVisitPlanner.ts` persist effect; `VisitChecklistClient.tsx` `writeStoredJson(STORAGE_KEYS.checklist)`.
- **Problem:**
  Empty React **then** prefix scan is the right fix for AppProviders’ lesson/quiz persist. Settings delete is on dashboard; planner/checklist are unmounted — prefix scan wins. Header/MobileMenu logout **can** run while `/tools/visit-planner` or `/visit-checklist` is mounted (`router.push` is async). Those hooks keep symptom **notes** / checklist ticks in `useState`; `resetLocalProgress` never clears them. Prefix scan deletes `hmc-visit-planner` / `hmc-checklist`. A later persist run rewrites health-adjacent notes from memory.
- **Suggested Fix:**
  Document wipe-generation or `storage` event that planner/checklist treat as “do not write.” Test: mount a persist-effect sibling, `resetLocalProgress()`, then `act()` a notes/checklist update — keys must stay empty. Do not treat SettingsClient mock tests as covering this.

---

## CRITIC 3 — UX Lead

_Focus: does the plan fix what AUDIT-VISUAL.md found? Will the result feel polished to a first-time user, or just “different”?_

### Ranked-item map (AUDIT-VISUAL.md §4)

| #   | Audit                          | Plan                                                      | Status                                                                 |
| --- | ------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | 🔴 Header `2xl`→`lg`           | P10 `xl:flex`; 1024–1279 hamburger by design + Playwright | Closed as CF-50 **if** open-menu chrome is finished (it is not — 🔴 1) |
| 2   | 🔴 Tap targets ≥44px           | P11 file list, verify-first                               | Mapped, not a sweep (🟡 4)                                             |
| 3   | 🔴 Full-row checklist          | P11 verify; HEAD already `<label>` rows `px-5 py-4`       | Closed pending verify                                                  |
| 4   | 🟡 Hero clamp / CTAs in fold   | P13                                                       | Spec fights itself (🔴 2)                                              |
| 5   | 🟡 Trust / reviewer            | P8 TrustBanner + ClinicalCitationBlock                    | Mapped; fold risk if P13 leftover (🟡 3)                               |
| 6   | 🟡 Glossary A–Z snap           | P11 `snap-x snap-proximity`; HEAD already `h-11 min-w-11` | Mapped                                                                 |
| 7   | 🟡 Article `max-w-prose` + TOC | P13 `max-w-5xl` + mobile progress                         | Mapped; clones a weak bar (🟡 5)                                       |
| 8   | 🟡 Quiz CLS                    | P13 `min-h-[140px]`                                       | Mapped                                                                 |
| 9   | 🟡 Search grouped              | P12 headings + counts                                     | Mapped; no accents (🟡 7)                                              |
| 10  | 🟢 404 app shell               | P10 `globals.css` on root                                 | Mapped                                                                 |

Also mapped: Display double-SR (P10), onboarding title (P10), planner summary contrast (P12), path stack (P13). `navigator.share` / AbortError already in v9 — not re-raised.

### 1. 🔴 Phase 10 (§13.1) 1024 hamburger-by-design ships a naked sibling panel

- **Section:** Phase 10 Header — accordion sibling of glass.
- **Ref:** AUDIT-VISUAL.md lines 41–43, 216–218, 261–263; PLAN.v9.md changelog CF-50 / §13.1 `Header.tsx`.
- **Problem:**
  1024–1279 hamburger is the **designed** experience (iPad landscape ~1194, nested windows), not a leftover. HEAD mounts the accordion **inside** `surface-card-glass overflow-hidden` — clipped, but one piece of chrome. v9 moves the panel to a **sibling** with `border-t` / `max-h` / `overflow-y-auto` and **no surface, radius, blur, or shadow**. First open at 1024 is a list dumped under a floating glass pill. That is worse than HEAD, not a compact desktop nav. Critic 1 marked the missing background 🟡. This is the designed open state. Unstyled sibling makes ranked #1 “fixed” only as a breakpoint, not as a product.
- **Suggested Fix:**
  Wrap the sibling in the same width as the bar: connected `rounded-b-[1.5rem]` sheet with `bg-surface-container-lowest` (solid, **not** a second `backdrop-blur`), `max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain`, `shadow-elevation-1`. Playwright 1024: open menu shares a card surface, not page canvas. Do not reopen `lg:flex` or a `max-w-md` overlay.

### 2. 🔴 Phase 13 (§16.1) 1440 video-above-hero fights CTA-in-fold Playwright

- **Section:** Phase 13 Home fold vs `HomeClient` video.
- **Ref:** AUDIT-VISUAL.md lines 44–46, 268–269; PLAN.v9.md §16.1 `HomeClient.tsx`, §16.2 Playwright 1440 CTA `y+height < 900`; HEAD `HomeClient.tsx:48–62`.
- **Problem:**
  Ranked #4 is CTA-above-fold. HEAD plays `/HMC_Video.mp4` **full-bleed above** `<Hero />`. At 1440, 16:9 of viewport width ≈ **810px**, plus sticky header ≈ **88px** (`pt-3` + `min-h-[76px]`). Hero — TrustBanner, 89px H1, CTAs — starts at ~898px. P13 only swaps order below `sm`. Table says `sm+` **may keep video above**. Acceptance still requires Start Learning inside 900px. Those cannot both be true. P8 adds a banner on Day 3; clamp/video live in leftover P13. A first-time 1440 user can ship Day 3 as “trust added” and still never see a CTA without scrolling a 1.3MB autoplay reel. That is different, not calmer.
- **Suggested Fix:**
  Treat 1440 Playwright as the contract. Hero (TrustBanner + clamp H1 + CTAs) first at **all** breakpoints. Put video below the hero or in the existing `lg` right column (`Hero` already has `/stitch/home.png`). Delete “sm+ may keep video above.” Split **13A** (clamp + video order + banner compact) as a named Day 4 block so TOC/quiz work cannot eat the fold. (PM: 13A then 16A, not full P13 then 16A.)

### 3. 🟡 Phase 8 TrustBanner vs Phase 13 leftover stacks two pills + old 89px H1

- **Section:** Phase 8 TrustBanner vs Phase 13 leftover.
- **Ref:** AUDIT-VISUAL.md lines 47–49, 270–271; PLAN.v9.md §11.1 / §10.2.
- **Problem:**
  Banner copy is close to the existing hero eyebrow. Plan says “below eyebrow **or** replace if duplicate” — no chosen state. Compact padding is `<sm` only (P8). Desktop 1440 can get **eyebrow + banner + old 89px H1** if 13A slips behind 16A/15A.
- **Suggested Fix:**
  P8: replace the eyebrow with TrustBanner (one line, `role="note"`). Do not stack two pills. 13A compact + clamp is named, not “if leftover.”

### 4. 🟡 Phase 11 (§14.1) tap-target work is an allowlist, not the ranked #2 sweep

- **Section:** Phase 11 tap-target sweep.
- **Ref:** AUDIT-VISUAL.md lines 22, 51–52, 79–81, 157–158, 264–265; PLAN.v9.md §14.1.
- **Problem:**
  Ranked #2 is site-wide 44px. P11 is an allowlist (footer, terms, Input, breadcrumbs, A–Z, inline expander, checklist verify). Remaining misses: glossary **related-lesson** links (`flex flex-col gap-1`, no `min-h-11`); contact **`<select className="input-field">`** (native iOS select ignores min-height — the likely 29px finding); `chip min-h-9` on some LessonCard / search / home path chips (36px).
- **Suggested Fix:**
  P11 Playwright 390: glossary related-lesson box ≥44; contact subject select `min-h-12 text-base`. One grep for `min-h-9` / raw `<select>` in `src/`. Do not invent a 400-element rewrite.

### 5. 🟡 Phase 13 (§16.1 / §10.7) article progress bar clones a weak lesson bar and would nest `<main>`

- **Section:** Phase 13 article/lesson progress bar clone.
- **Ref:** PLAN.v9.md §10.7 / §16.1; HEAD `LessonPageClient.tsx:134–135` vs `Header.tsx:98`; `src/app/[locale]/layout.tsx:131`.
- **Problem:**
  Both bars are `fixed top-0 left-0 z-50 h-1.5`. Header is `sticky top-0 z-50 pt-3`. Same z, later DOM paints a 6px strip in the header’s **transparent** 12px gap — not under the glass, not a readable cue. P13 copies that onto articles. Also §16.1 wants `<main id="main-content">` on the article column; locale layout **already** has `<main id="main-content">`. Nested landmark + duplicate id. Skip-to-content becomes ambiguous.
- **Suggested Fix:**
  One `ReadingProgressBar`: `top-0 z-[60]` in the `pt-3` gap **or** `top-[var(--header-offset)]` under the glass. Do not nest `<main>`. Prose column is `<article>`; layout keeps the landmark.

### 6. 🟡 Phase 10 (§13.1) compact-at-xl hides “Sign in” / “Crear cuenta” for first-time sighted users

- **Section:** Phase 10 compact-at-xl login.
- **Ref:** AUDIT-VISUAL.md lines 41–43; PLAN.v9.md §13.1; HEAD `Header.tsx:168–185`.
- **Problem:**
  At 1280, plan hides tagline, hides signup (`2xl:hidden` → `xl:hidden`), hamburger hidden, login **icon-only** with `aria-label`. Screen reader is fine. First-time sighted user gets a door icon and **no Create account** in the bar. Health-literacy chrome should say “Sign in,” not assume Lucide literacy.
- **Suggested Fix:**
  `xl`: keep **visible** login label; hide signup only. `2xl`: icon-only if still tight. Overflow: shrink `NavLink` tokens first (already written); do not hide the login word to win `scrollWidth`. Playwright `/es` 1280: login accessible **and** visible text.

### 7. 🟡 Phase 12 (§10.6 / §15.1) search grouping has headings, not the audit’s left-accent scan

- **Section:** Phase 12 search grouping.
- **Ref:** AUDIT-VISUAL.md lines 193–199, 278–279; PLAN.v9.md §10.6 / §15.1.
- **Problem:**
  Audit asked section headers **and** category-colored **left accent** borders. v9 specifies `<h3>` + counts + live region. No `border-l-*` tokens. Structure without scan. Better than a flat list; still “different.”
- **Suggested Fix:**
  Keep headings. Add `border-l-4` per `SearchEntry.type` using existing container tokens, not new hues.

### 8. 🟡 Phase 11 (§14.1) inline glossary expander does not fix the portaled tap trap

- **Section:** Inline glossary popover tap trap.
- **Ref:** AUDIT-VISUAL.md lines 23, 79–81; HEAD `InlineGlossaryTerm.tsx:142–144, 208–214`.
- **Problem:**
  P11 adds `after:-inset-*` hit area. Popover is **portaled to `document.body`**. Outside-click tests `containerRef` (the trigger `<span>`). First tap on the definition card is “outside” and closes. That is the tap trap. Expander does not fix it.
- **Suggested Fix:**
  Include `popoverRef` in the outside check, or `useDismissibleOverlay` on the portal node. Same PR as the expander.

### 9. 🟢 Phase 12 visit-planner summary contrast — spec is enough

- **Section:** §15.1 Step3Review.
- **Ref:** AUDIT-VISUAL.md lines 138–140.
- **Problem:** None remaining in spec (`border-2 border-primary/20 bg-surface-container-lowest p-6 shadow-elevation-2`).
- **Suggested Fix:** Implement as written.

---

## CRITIC 4 — Clinical Content Reviewer (PharmD)

_Focus: clinical accuracy, drug safety, emergency escalations, plain language, disclaimers._

**Closed / not re-litigated:** CF-51 chest-pain **positive lead** is in §7.2 lines 1081–1082 (EN/ES). Tests drop `/do not always cause crushing/`. Age bands <3y vs older children are in the pediatric paste. Print disclaimer keeps pharmacist-as-person. No “rectal.” No `somnolencia extrema` in the numbered paste (Finding 2 is the leftover instruction vs missing lethargy). Sore-throat emergency cluster is adequate. Unusual fatigue in women is optional. FDA/CDC sources + Poison Help number do not need a new footnote to ship.

### 1. 🔴 Phase 4 (§7.2) `homeCarePediatricNote` closing “call 911” scopes over older-child dark urine

- **Section:** §7.2 `homeCarePediatricNote` EN+ES (lines 1074–1075); table line 1060 “911-class”; §7.5 acceptance.
- **Problem:**
  Closing “These … call 911” / ES “En los Estados Unidos, llame al 911” applies ambulance dispatch to the **whole** list: infant fever **and** older-child dark urine / dry mouth / dizziness. That is not AAP/ACEP parent guidance.

  AAP/HealthyChildren: fever ≥100.4°F (38°C) in **<3 months** = **emergency evaluation now** (call pediatrician immediately; if unreachable, go to ED). Ambulance (911) is for the infant who is hard to wake, struggling to breathe, seizing, or cannot be moved safely — not every well-appearing febrile 10-week-old.

  Older-child dark urine / dry mouth / dizziness = **mild–moderate dehydration** → oral fluids + clinician/urgent care. 911 is for lethargy, not drinking, confusion, or shock. First sentence already gets the ED frame right (“treated as a medical emergency in US emergency departments — not as home monitoring”). Last sentence collapses ED-now into 911.

  Harm if shipped: (1) 911 for a school-age child with dark urine after sports; (2) cry-wolf — families later ignore 911 for real collapse/chest pain because “the site always says 911.” Table line 1060 (“infant temperature + pediatric dehydration are 911-class”) is the source of the semantic slide: “not home care” was implemented as “call an ambulance.”

- **Suggested Fix:**
  Split **ED-now** vs **911**. Keep 100.4°F / 38°C, <3 months, under-3 vs older, no “rectal,” no `somnolencia extrema`. Change line 1060 from “911-class” to “not home monitoring; 911 only if hard to wake, trouble breathing, or cannot get to care.”

  **EN:** `"A temperature of 100.4°F (38°C) or higher in an infant under 3 months is treated as an emergency in US emergency departments — not as home monitoring. Get emergency care now, or call the pediatrician immediately. Call 911 if the baby is hard to wake, is having trouble breathing, or you cannot get to emergency care. In babies and children under 3, watch for no tears when crying, a sunken soft spot on the head, fewer than 6 wet diapers in 24 hours if they still use diapers, or no urine for 8 hours. In older children, dark urine, dry mouth, or dizziness means call a clinician — not 911 by itself. At any age, if a child is hard to wake or not drinking, call 911 in the United States."`

  **ES:** `"Una temperatura de 100.4°F (38°C) o más en un bebé menor de 3 meses se trata como una emergencia en los servicios de urgencias de Estados Unidos — no como observación en el hogar. Busque atención de emergencia ahora, o llame de inmediato al pediatra. Llame al 911 si es muy difícil despertar al bebé, si tiene problemas para respirar, o si no puede llegar a un servicio de urgencias. En bebés y niños menores de 3 años, observe si no hay lágrimas al llorar, un punto blando hundido en la cabeza, menos de 6 pañales mojados en 24 horas si todavía usan pañales, o si no orinan en 8 horas. En niños mayores, la orina oscura, la boca seca o los mareos significan llamar a un clínico — no son motivo por sí solos para llamar al 911. A cualquier edad, si un niño está muy difícil de despertar o no está bebiendo, en los Estados Unidos llame al 911."`

### 2. 🔴 Phase 4 (§7.2) lethargy / “hard to wake” dropped from the canonical paste; tests will go green

- **Section:** §7.2 lines 1074–1077 vs v8 paste; §7.4 tests (dropped `/despertar/`).
- **Problem:**
  v8 EN had “extreme sleepiness”; v8 ES had `si es muy difícil despertarlos` (tests asserted `/despertar/`). v9 paste **drops** hard-to-wake / lethargy from both locales. Line 1077 still says that phrasing “is the paste” — it is not. Lethargy / “hard to wake” is the pediatric red flag that distinguishes oral-rehydration dehydration from **shock**. Without it, a parent matching only “dark urine, dry mouth, dizziness” can stay home with a child who will not wake. Acceptance §7.5 even forbids `somnolencia extrema` without requiring a replacement. Implementers will ship the numbered paste; tests will go green.
- **Suggested Fix:**
  Same paste as Finding 1 (restores “hard to wake” / `muy difícil despertar`, not `somnolencia extrema`). Re-assert `/hard to wake|despertar/i` in §7.4. Delete or rewrite line 1077 so it matches the paste.

### 3. 🟡 Phase 4 (§7.2) “children under 3 … 6 wet diapers” fails toilet-trained toddlers

- **Section:** §7.2 `homeCarePediatricNote` “babies and children under 3 … fewer than 6 wet diapers in 24 hours”.
- **Problem:**
  <6 wet diapers/24h is an **infant** metric. Many 2-year-olds are toilet-trained and have no diapers. Parents will skip the sign or under-count. v8’s “no wet diapers for 8 hours” worked for both diapered and toilet-trained kids. Not independently 🔴 if Finding 1 paste ships (it already adds “if they still use diapers” + “no urine for 8 hours”).
- **Suggested Fix:**
  Use Finding 1 paste. Do not keep a bare “children under 3 / 6 wet diapers” clause.

### 4. 🟡 Phase 4 / 8 Poison Help for “suspected poisoning” without 911-first on the **lesson** callout

- **Section:** §7.2 `whenInDoubtBody` (1084–1085); §11.2 Poison Help lesson callout (1370–1371).
- **Problem:**
  Poison Control / AAP: collapsed / not breathing / seizing → **911 first**, then Poison Help. Care-guide paste **does** lead with local emergency services / US 911, then frames Poison Help as “questions about…” — enough **on that page** if the reader starts at sentence 1. A panicked parent will scan for “poisoning” and can miss sentence 1. The **lesson** callout is worse: it is a standalone `:::warning` with **only** Poison Help, no 911-first rider. HEAD `pain-medications-safely` at least says Poison Control **or** seek emergency care immediately. P8’s new string does not.
- **Suggested Fix:**
  Care-guide: keep 911-first lead; add a rider on the poison sentence. Lesson callout must carry 911-first (that box is read in isolation).

  **EN `whenInDoubtBody` poison clause:** `"For questions about accidental double doses, medicine mix-ups, or suspected poisoning in the United States, call Poison Help at 1-800-222-1222 (free, confidential, 24/7). If the person collapsed, is not breathing, or is having a seizure, call 911 first."`

  **ES:** `"Para preguntas sobre dosis dobles accidentales, confusión de medicamentos o sospecha de intoxicación en los Estados Unidos, llame a Poison Help (Centro de Control de Intoxicaciones) al 1-800-222-1222 (gratuito, confidencial, 24/7). Si la persona se desmaya, no respira o tiene una convulsión, llame primero al 911."`

  **EN lesson §11.2:** `"If someone collapses, is not breathing, or is having a seizure, call 911 first. For questions about accidental double doses, medicine mix-ups, or suspected poisoning, call US Poison Help at 1-800-222-1222 (free, confidential, 24/7)."`

  **ES lesson §11.2:** `"Si la persona se desmaya, no respira o tiene una convulsión, llame primero al 911. Para preguntas sobre dosis dobles accidentales, confusión de medicamentos o sospecha de intoxicación, llame a Poison Help (Centro de Control de Intoxicaciones de EE. UU.) al 1-800-222-1222 (gratuito, confidencial, 24/7)."`

### 5. 🔴 Phase 8 (§11.2) dual placement gate stuffs Poison Help into the intro, not the dosage warning

- **Section:** §11.2 / §11.4 (“first 3 `##` sections” vs “top third ≤ ~29”).
- **Problem:**
  Agree with Critic 1 as **clinical placement**, not a line-count dispute. Correct home for a double-dose / poisoning warning is **§ Understanding Dosage Instructions** (HEAD `##` 3, with the existing “Never take more than the prescribed amount” `:::warning`). That is inside the first 3 `##` sections and **fails** the numeric top-third gate. Obeying `grep` ≤29 stuffs 1-800-222-1222 into “What is a Prescription Label?” — the section dose-readers skip. Dual acceptance tests make the implementer pick the test over the clinical moment.
- **Suggested Fix:**
  Keep “first 3 `##` sections.” Drop or rewrite the “top third ≤ ~29” gate. Require the number **in or immediately adjacent to** the dosage `:::warning` (EN+ES). Tests: `222-1222` appears before the “Special Warnings” heading, not a raw line-number cap.

### 6. 🟡 Phase 8 (§11.1 / §10.2) TrustBanner “Clinically reviewed” over-claims a stamped team name

- **Section:** Phase 8 TrustBanner; MDX `reviewedBy: "RN Health Education Team"`; articles `"Health Education Review Team"`.
- **Problem:**
  Not physician impersonation — the banner does not say MD, and an RN **is** a clinician. Still misleading for a **first-time home-page user**: they see “Clinically reviewed” with no name, license, or citation block. Compact `reviewedBy` only appears after opening a lesson (Phase 8). Articles catalog gets the same banner while frontmatter is a non-licensed “Health Education Review Team.” Same template string on ~every lesson looks stamped, not reviewed. AUDIT-VISUAL’s physician badge would make this **worse** (a fake MD). “Not medical advice” in the same sentence limits legal harm; it does not fix the trust-gradient over-claim.
- **Suggested Fix:**
  Do **not** add a physician badge. Either (a) banner: `"Health education with listed sources — plain language. Not medical advice."` and let `reviewedBy` carry the credential on the article/lesson, or (b) keep “clinically reviewed” **only** on surfaces where `reviewedBy` includes a real clinical credential (RN/MD/DO/PharmD) — then articles must change frontmatter or the articles catalog must use a weaker banner.

### 7. 🟡 Phase 4 (§7.2) “This site cannot triage you” / “un triaje” is jargon the spec otherwise bans

- **Section:** §7.2 `whenInDoubtBody` closing sentence.
- **Problem:**
  No “epigastric” in v9 pastes (good). “Triage” / `triaje` is clinic jargon; the rest of the spec bans triage-voice. Plain-language readers will not know the word. The idea (we cannot rank your symptoms) is right.
- **Suggested Fix:**
  **EN:** `"This site cannot tell you how serious your symptoms are or where you should go."`
  **ES:** `"Este sitio no puede decirle qué tan graves son sus síntomas ni a dónde debe ir."`

### 8. 🟡 Phase 4 (§7.2) inventory keys have notes, no paste — HEAD title still promises “choosing the right place”

- **Section:** §7.2 inventory (`careGuideTitle`, `careGuideDescription`, `emergencyBody`).
- **Problem:**
  HEAD title/description still triage-frame: “Where should I go for care?” Spec forbids that promise, then gives no replacement. HEAD `emergencyBody` has no 988; tests allow 988 in `whenInDoubtBody` **or** `emergencyBody`, so the emergency card can ship without 988 if someone only pastes `whenInDoubtBody`.
- **Suggested Fix:**
  Add pastes, e.g. title `"How care settings differ"` / description `"This page explains what home care, clinics, urgent care, and emergency departments often do. It cannot choose a place for you."` Put the 988 sentence in **both** `emergencyBody` and `whenInDoubtBody`.

### 9. 🟢 Phase 4 sore-throat / chest-pain pastes — adequate to ship

- **Section:** §7.2 `scenarioSoreThroatBody`, `scenarioChestPainBody` (CF-51 closed).
- **Problem:** None blocking. Stridor and “unusual fatigue” are optional.
- **Suggested Fix:** None required.

---

## CRITIC 5 — Ruthless Project Manager

_Focus: 4-day scope, ordering, deadlocks, independent merge, rollback._

**Closed as specified (do not re-raise):** CF-52 3A Day 1 / 3B Day 2 morning; Day 4 leftover 13 → 16A → 15A → P14 if time; 015 after Netlify **Published**; P3 bulk not on Day 1; P14 never ahead of 16A/15A. Day 3 JSON-at-end is an accepted ~20 min tax. Launch announce after 1, 2, 3A, 3B, 9 is **not** a Day 1 event.

### 1. 🔴 Day 1 still has no slip — same-day `014` is a hidden Day 2 deadlock

- **Section:** §3 Day 1 row; slip protocol; parallelism; P6 deps (“Phase 1 `014` applied”).
- **Problem:**
  CF-52 closed the orphan-3B misread. Day 1 is now write `014` + Gate 0 + P2 + 3A + P9 live + Gate 1 apply `014`. That is the 11–14h “heavy day” ROUND-8 already named. v9 admits “heavy” and still budgets “~10 hour days.” Slip protocol only fires if **Day 3** is unfinished at start of Day 4. It never says what happens if P9 is not **Published** on production before close of Day 1.

  Solo wall clock (no second pair of hands; “P2 while 014 is in review” is not parallel for one agent): write `014` + Gate 0 (3–4h) + P2 (3–4h) + 3A (0.5h) + P9 (4–6h) + CI + production Ready + `db push` (1–2h) = **11.5–16.5h**. Staff’s un-pasteable `setAll` table adds reconstruction time onto the fattest PR.

  P6 **cannot start** until `014` is applied. Day 2 morning is already reserved for 3B **before** P6. A 4h P9 overrun does not “slip politely” — it stacks two morning gates onto Day 2 and keeps ADV-10 public INSERT open past the “same day” window the calendar promised.

- **Suggested Fix:**
  Write a Day-1 slip in §3: if P9 is not production-Ready by a named cutoff, **do not apply `014`**. Day 2 becomes: finish P9 → Gate 1 → apply `014` → then P6 (3B **code** parallel, not ahead). Split P9 if it still does not fit: wipe+Settings+AuthProvider as Gate 1; middleware `setAll` as P9b that may land after `014` only if Settings wipe is already live (kiosk leak is Settings, not `setAll`).

### 2. 🔴 Appendix §13.1 `P3B ──► P6` is a fake edge that deadlocks the unique

- **Section:** §13.1 graph `P3B ──► P6`; §3 “3B morning then P6”; Phase 3 “**must** merge … **before P6**”; “Never cut 3B”; “Never cut 1–6.”
- **Problem:**
  P3B is privacy/terms copy + contact body reader + Map cap. P6 is `015` + `QuizClient` + mutations + dashboard. **No shared runtime files.** Staff already said 3B is not a real P6 dependency. The graph still makes journalist-accurate privacy copy a gate on quiz unique.

  Journalist copy is slow. Sec’s 🔴 is worse: 3B paste claims Sentry/GA query/hash redaction that 16A has not shipped. If copy waits for a true network tab, 3B bikesheds all morning. Never-cut-3B + 3B-before-P6 + never-cut-1–6 = **P6 unique cannot start**. P5 cannot merge. That is a deadlock the plan invented.

- **Suggested Fix:**
  Delete `P3B ──► P6` from §13.1. Split 3B: **3B-code** (reader + `reader.cancel` + Map cap + `ga-init.js` `page_location`) may merge morning of Day 2, **parallel with P6**; **3B-copy** must be true vs HEAD, may merge after P6, **must** merge before launch announce. Never-cut-3B stays; it must not block `015`. Do **not** pull full 16A onto Day 2 (CSP + ingest throttle + minutes copy). Honest copy without a live strip is a 15-minute edit; a ≤1h `beforeSend` URL strip inside 3B-code is the only extra that fits.

### 3. 🟡 Day 4 leftover P13 before 16A matches UX only if 13A is fold-only

- **Section:** §3 Day 4; Phase 13; “Never drop 19.1”; slip protocol silent on P13.
- **Problem:**
  v9 already puts leftover P13 before 16A. That is what UX asked for as **13A first**. It does not fight “never drop 19.1” unless leftover P13 is the **whole** phase. Full P13 is 4–6h. Plus 16A ~3h plus 15A ~2h is a full Day 4 with P14 gone — feasible **if Day 3 finished**. If Day 3 slips, slip protocol cuts 16B and P14 only. Implementer then does unfinished P8–P12 **and** full P13 **then** 16A. 15A and 19.1 lose. UX 🔴 (video-above-hero vs CTA-in-fold) is a real must-ship; article TOC `max-w-5xl` is not the same emergency.
- **Suggested Fix:**
  Split **13A** = `HomeClient` video-below-hero at **all** breakpoints + Hero clamp + 1440 CTA `y+height < 900` Playwright. Calendar: 13A first on Day 4, then 16A, then 15A. **13B** (TOC shell, quiz CLS, cards, paths) slips with PrintButton. Name 13A in the Day-4 row so “leftover P13” cannot swallow 19.1.

### 4. 🔴 Gate 1 has no coupled rollback — P9 revert after `014` re-opens the kiosk leak

- **Section:** Gate 1; §12.4 P9 “Revert PR.”; §4.6 `014_emergency.sql`; ADV-10 “same day.”
- **Problem:**
  Gate 1 exists because HEAD Settings already calls `rpc("delete_user")`. Apply `014` first → delete succeeds on the old client → kiosk leak. If `014` **did** apply and P9 must revert, §12.4 says “Revert PR” and does **not** say drop `delete_user` first. That is the race Gate 1 was written to prevent, inverted. 015 pairing is explicit (23505 vs 42P10). 014/P9 pairing is missing.
- **Suggested Fix:**
  Add a boxed couple like §9.5: **If `014` is live, do not revert P9 until `014_emergency.sql` has dropped `delete_user` (and EXECUTE).** If P9 is not production-Ready, do not apply `014`. Retry CI is allowed; same-day apply is **not** a requirement if Ready is red — ADV-10 stays open, kiosk stays closed.

### 5. 🔴 `014_emergency.sql` is not executable — 015 rollback is

- **Section:** §4.6 vs §9.5.
- **Problem:**
  015 is specified: unique live + `.insert()` = `23505`; unique dropped + upsert = `42P10`; revert P5 then P6 client then drop unique; do not reverse the unit `UPDATE`. That is enough.

  014 is: “drop `delete_user` only if you must; restore contact INSERT only if the site is down **and** service_role is missing.” No paste. Missing: `DROP FUNCTION` / revoke EXECUTE; exact `CREATE POLICY "Anyone can insert contact submissions"` (roles, `WITH CHECK`); `GRANT INSERT` to `anon`; whether FORCE RLS, `daily_log` UPDATE, `handle_new_user`, and indexes stay; **P9 couple from finding 4**. Under incident the implementer invents SQL that can re-open ADV-10 or leave `delete_user` callable on a reverted client.

- **Suggested Fix:**
  Paste `014_emergency.sql` in §4.6 as two labeled recipes: **(A) kiosk** = drop `delete_user` only (contact lock stays); **(B) contact outage** = restore INSERT policy + `GRANT INSERT` to `anon` **only** if `/api/contact` 503s and the env var cannot be set in minutes. Default is (A). Never (B) if service role is present. Tie (A) to P9 revert.

### 6. 🟡 Several phases cannot independently merge — §13.1 overstates “independent”

- **Section:** “One phase = one PR”; §13.1 “P10–P13 independent”; Phase 11 “Dependencies: Phase 10”; Phase 6/7 `mutations.ts`; Phase 8/13 `Hero.tsx` + `ArticlePageClient.tsx`; Phase 4/15 `CareGuideClient.tsx`.
- **Problem:**
  P6 then P7 share `mutations.ts` / `sideEffects.ts` — cannot overlap. P10 vs P11 both touch `Header.tsx` (P10 owns accordion; P11 “verify close size”). P8 vs P13 share `Hero.tsx` / `ArticlePageClient.tsx`. P4 vs P15A share `CareGuideClient.tsx`. Day 3 JSON-at-end is adequate for `en.json`/`es.json`. It does **not** make P11 and P10 independently mergeable. P11 must wait for P10 or P10 must own the 44px close verify so P11 does not touch `Header.tsx`.
- **Suggested Fix:**
  Rewrite §13.1: `P6 ──► P7`; `P10 ──► P11` (Header); `P8 ──► P13` (Hero/article); `P4 ──► P15A` (CareGuide). P11 Header line becomes “verify-only; bump in P10 if short — P11 does not edit `Header.tsx`.” Day 3 merge order: **8 → 10 → 11 → 12**, overlapping CI allowed, overlapping Header/PageHeader/Hero **not** allowed.

### 7. 🟡 P6 deploy fail blocks P5 — Day 2 has no slip, so Day 3 dies

- **Section:** P5 “must not merge until unique exists”; P6 Published-then-`015`; slip protocol (Day 3→Day 4 only); “Never cut 1–6.”
- **Problem:**
  This pairing is correct (42P10 / 23505). The calendar around it is not. If P6 build is red, 015 stays off, P5 is blocked, P7 still wants `mutations.ts` after P6. Never-cut-1–6 then **requires** Day 3 to finish P6/P5/P7. Day 3 is P8/P10/P11/P12. Those slide to Day 4 and compete with 16A/15A, which may not slip.
- **Suggested Fix:**
  Day-2 slip: **never merge P5 without unique** (keep). If P6 is not Published by a named cutoff, do not apply 015, do not start P5, **cut P7 from Day 2** (it is not 1–6). P4 may continue (no DB). Day 3 starts with leftover P6/P5 **then** P8.

### 8. 🟡 Throwaway `delete_user` is a verify, not a merge blocker — Gate 0 has no named operator

- **Section:** §4.2 “Preflight (human + agent)”; §4.3 E; §4.5 throwaway RPC.
- **Problem:**
  Plan correctly forbids Playwright `rpc("delete_user")`. Then it makes a human throwaway an **acceptance checkbox** for Phase 1. A cloud agent cannot sign in as a new Auth user and call `SECURITY DEFINER` `delete_user` as `auth.uid()`. Treating that checkbox as “014 is not done” blocks Day 2 P6 for a staffing reason. Gate 0 `netlify env:get` / screenshot and production `db push` also require a human. Writing `014` can finish. **Apply cannot** in an agent-only window.
- **Suggested Fix:**
  Split acceptance: **merge/apply gate** = function exists, grants, `confdeltype` (public only), anon INSERT gone. **Post-apply verify** = human throwaway within 24h, not same-day, not a cloud-agent blocker. RACI one line in §4.2: **Human** = Gate 0 screenshot/`env:get`, production `db push`, throwaway RPC. **Agent** = write `014`/`014_emergency.sql`, repair instructions, P2/P9/3A PRs.

### 9. 🟢 Announce after 1, 2, 3A, 3B, 9 — not a Day 1 event

- **Section:** §3 Day 2 theme.
- **Problem:** None. Announcing on Day 1 would ship privacy copy that still lies. Launch announce after 3B is on production is correct.
- **Suggested Fix:** None.

---

## Verdict Table — Can Implementation Start?

| Critic                           |  Status   | Blocking items (🔴)                                                                                                                                                                                                |
| -------------------------------- | :-------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CRITIC 1 — Staff Engineer**    | 🔴 **NO** | 1. §9.1 `\|\|` splits `normalizeStoredScore` — 60/60 clause un-pasteable. 2. `NextResponse.next({ request, headers })` does not name which `Headers` — CF-43 rewrite loss again.                                   |
| **CRITIC 2 — Security Engineer** | 🔴 **NO** | 1. 3B `collectBodyErrors` claims query/hash strip that 16A has not shipped. 2. `collectBodyAnalytics` cites GA4-noop `anonymize_ip` and denies query strings `ga-init.js` still sends.                             |
| **CRITIC 3 — UX Lead**           | 🔴 **NO** | 1. 1024 hamburger-by-design sibling accordion has no surface — ranked #1 closed as a breakpoint, not a product. 2. §16.1 `sm+` may keep video above vs Playwright 1440 CTA `y+height < 900` — cannot both be true. |
| **CRITIC 4 — Clinical (PharmD)** | 🔴 **NO** | 1. Pediatric “These … call 911” scopes ambulance over older-child dark urine. 2. Lethargy / hard-to-wake dropped from the paste tests will not catch. 3. Poison Help “top third ≤29” vs dosage-section home.       |
| **CRITIC 5 — PM**                | 🔴 **NO** | 1. Day 1 no slip — same-day 014 is a hidden Day 2 deadlock. 2. Fake `P3B ──► P6` deadlocks unique on copy review. 3. 014/P9 revert unpaired (kiosk leak inverted). 4. `014_emergency.sql` un-pasteable.            |

### Overall Verdict: **NO — Plan v9 needs targeted paste + calendar fixes before implementation starts.**

v9 correctly resolved ROUND-8 / CF-48…CF-52 as **intent** (numbered `setAll`, prefix CI pin, 1024 hamburger-by-design, chest-pain positive lead, 3A/3B split, Day 4 16A before P14, 015 after Published). The new holes are **paste that cannot be followed** and **fixes that re-open harm**:

1. **Un-pasteable contracts:** §9.1 `||` table-split; `setAll` step 3 unnamed `Headers`; `014_emergency.sql` prose-only.
2. **Privacy copy vs code:** 3B ships journalist-checkable claims (Sentry strip, GA query/IP) that 16A / `ga-init.js` do not implement yet.
3. **By-design UX still unfinished:** 1024 open nav as a naked sibling; 1440 home video vs CTA-in-fold self-contradiction.
4. **Clinical paste:** 911 over-scoped; lethargy dropped; Poison Help dual gate.
5. **Calendar graph:** `P3B ──► P6` is fake; Day 1/2 have no slip; 014/P9 rollback unpaired.

---

## Combined flaws (v9 ∩ panel — launch-killers this round)

**CF-53 — CF-48 numbered `setAll` ∪ “copy previous headers into `NextResponse.next({ request, headers })`” ∪ unbound `headers` identifier ∪ HEAD `NextResponse.next({ request })` with no response-header copy.**
v9 told implementers to copy headers. It did not name `supabaseResponse.headers` as `ResponseInit`. Copying `request.headers` onto the response drops `x-middleware-rewrite`.
**v10:** Fenced `setAll` paste: (1) always `request.cookies.set`; (2) 3xx → `cookies.set` on that response; (3) 2xx → `NextResponse.next({ request, headers: supabaseResponse.headers })`, copy cookies, apply `cookiesToSet`. Bind `authError` from `getUser()`. Test rewrite header **and** `request.cookies` after 307+`setAll`.

**CF-54 — 3B privacy paste ∪ GA4 `anonymize_ip` no-op ∪ `gtag config` default `page_location=href` ∪ 16A URL-strip on Day 4 ∪ P3B──►P6.**
Phase 3 exists to stop journalist-vs-network-tab lies. v9 replaces one lie (`never transmitted`) with two new ones (hash/query stripped; IP anonymization “on”). Graph makes that copy a gate on `015`.
**v10:** 3B-code (contact reader + Map cap + `ga-init.js` `page_location = origin+pathname`) parallel with P6. 3B-copy honest vs HEAD; do not claim Sentry `?`/`#` strip until 16A (or a ≤1h `beforeSend` in 3B-code). Delete `P3B ──► P6`.

**CF-55 — CF-50 sibling accordion ∪ no surface spec ∪ `sm+` may keep video above ∪ Playwright 1440 CTA in 900px.**
Breakpoint math is right (`xl:flex`). The designed 1024 open state and the 1440 first impression are unspecified / self-contradictory.
**v10:** Accordion sibling gets a solid connected sheet (not a second blur). 13A = video **below** hero at all breakpoints + clamp H1; delete “sm+ may keep video above.” Day 4: 13A → 16A → 15A → 13B/P14 if time.

**CF-56 — CF-51 pediatric age bands ∪ closing “call 911” ∪ dropped lethargy ∪ Poison Help “top third ≤29” vs dosage `:::warning`.**
v9 locked ROUND-8’s <3y vs older-child lists, then attached ambulance to dark urine and deleted the hard-to-wake red flag. Dual grep gates stuff 1-800-222-1222 into the intro.
**v10:** PharmD Finding 1 paste (ED-now vs 911; hard-to-wake restored; diapers qualified). Drop top-third line-number cap; put Poison Help on the dosage warning with 911-first rider. Tests: `/hard to wake|despertar/`; `222-1222` before “Special Warnings.”

**CF-57 — CF-52 Day-1 heavy ∪ no Day-1/Day-2 slip ∪ 014/P9 revert unbound ∪ `014_emergency.sql` un-pasteable.**
3A/3B split was the right calendar move. Same-day 014 with no slip, a fake copy→unique edge, and “Revert P9” after `delete_user` is live re-open the kiosk race Gate 1 exists to prevent.
**v10:** Day-1 slip: no 014 if P9 not Ready. 014/P9 couple like §9.5 (drop `delete_user` before reverting P9). Paste 014 rollback recipes (A kiosk / B contact outage). Day-2 slip: cut P7, not P6 unique. P11 does not edit `Header.tsx`.

---

### 🔴 disposition (implementation cannot start on v9)

| Panel 🔴                                  | Disposition | v10 action                                                              |
| ----------------------------------------- | ----------- | ----------------------------------------------------------------------- |
| `normalizeStoredScore` `\|\|` table-split | **ACCEPT**  | Fenced TS predicate (CF-53 adjacent).                                   |
| `setAll` unnamed `Headers`                | **ACCEPT**  | Named `supabaseResponse.headers` paste + test (CF-53).                  |
| 3B Sentry strip claim                     | **ACCEPT**  | Honest copy and/or ≤1h strip in 3B-code; not full 16A on Day 2 (CF-54). |
| 3B GA query/IP claim                      | **ACCEPT**  | `ga-init.js` `page_location`; drop or rewrite `anonymize_ip` (CF-54).   |
| 1024 naked accordion                      | **ACCEPT**  | Solid sibling sheet spec (CF-55).                                       |
| 1440 video vs CTA fold                    | **ACCEPT**  | 13A video-below-hero all breakpoints (CF-55).                           |
| Pediatric 911 over-scope                  | **ACCEPT**  | PharmD paste (CF-56).                                                   |
| Lethargy dropped                          | **ACCEPT**  | Same paste + `/despertar/` test (CF-56).                                |
| Poison Help dual gate                     | **ACCEPT**  | Dosage `:::warning`; drop ≤29 cap (CF-56).                              |
| Day 1 no slip                             | **ACCEPT**  | Named cutoff; 014 waits (CF-57).                                        |
| `P3B ──► P6`                              | **ACCEPT**  | Delete edge; 3B-code ∥ P6 (CF-54/57).                                   |
| 014/P9 revert unpaired                    | **ACCEPT**  | Couple like §9.5 (CF-57).                                               |
| `014_emergency.sql` prose                 | **ACCEPT**  | Two labeled recipes (CF-57).                                            |

**Rejected / not launch-blocking as stated:** catalog max is 9 questions (HEAD is 5 or **10**); current `STORAGE_KEYS` lacking `hmc` prefix; `lg:flex` for 8-item nav; article progress bar missing from §16.1; P3 bulk on Day 1; stale JWT in 3xx-target RSC; pulling **full** 16A onto Day 2 as the Sec fix (≤1h strip or honest copy only).

**Second-opinion note:** v9 **NO**. Do not implement from `REVAMP/PLAN.v9.md`. v10 must land CF-53…CF-57 plus accepted 🔴s. Plan file itself was not modified this round.
