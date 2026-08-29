# Health Made Clear — launch revamp changelog

**For:** app owner review before go-live  
**Contract:** `REVAMP/PLAN.v10.md`  
**Date:** 2026-08-29

This is what a visitor or account holder will notice, plus the production steps that still need a human. Engineer file lists live in each `REVAMP/VERIFY-PHASE-*.md`.

---

## What you should do before announcing launch

These are **not** code leftovers. The app in this repo is ready; production database and a few dashboards are not.

1. **Prove Gate 0:** Netlify production has a real `SUPABASE_SERVICE_ROLE_KEY` (not empty, not a placeholder). Without it, locking public contact-form inserts would make `/contact` fail.
2. **Prove Gate 1:** the Phase 9 build is **Ready** on Netlify (logout and account-delete wipe device data). Then apply migration **014** using `supabase/repair/history-match-001-013.sql` — park **015** so it does not ride along.
3. **After 014:** anonymous users must not be able to insert contact rows in the database; the website contact form should still succeed.
4. **After that deploy is Published:** apply **015** (quiz “keep best score”). Spot-check logs ~30 minutes for quiz-retake errors.
5. **Supabase Auth email templates:** confirmation must land on `/{locale}/auth/confirm`; password recovery on `/{locale}/auth/reset-password`.
6. **Netlify:** set server `SENTRY_DSN` (public `NEXT_PUBLIC_SENTRY_DSN` does not cover server errors).
7. Optional: leave the dummy remote migration `create_test_file` unless you want history tidied later.

Until 014/015 are applied, production still has a public contact insert policy and quiz rows are not unique per user.

---

## Phase 1 — Database safety (SQL ready, not applied)

Prepared a single launch migration (**014**) that:

- Locks the contact table so the public internet cannot insert rows (the website API with the service-role key remains the path)
- Adds a proper **delete my account** database function, callable only by a signed-in user
- Tightens profile creation (display name length and control characters)
- Adds missing indexes and “force RLS” so table owners cannot accidentally bypass row rules
- Does **not** change quiz uniqueness (that is Phase 6 / **015**)

**Owner takeaway:** code and SQL are reviewed. You still run the apply runbook after Gates 0 and 1.

---

## Phase 2 — Password reset and email confirmation

- Reset and confirm links work with the query `code` and with hash fallbacks; a retry does not consume the code twice
- Recovery always opens the reset-password page (not the dashboard)
- Spanish confirm/callback failures stay on `/es/auth/…`, not a bare `/auth/…`
- If the one-time token fails, the page shows a generic error instead of a crash screen

**Owner takeaway:** in-app recovery is ready. Confirm the Supabase **email templates** point at these URLs.

---

## Phase 3 — Privacy copy and contact form

- Privacy/terms no longer claim learning data “never leaves the device”
- Privacy now lists guest storage, accounts, contact messages, analytics (path only, no “IP anonymization is on”), crash reports, and leftover device data after someone else signs in
- Google Analytics sends **path only** (no query string or hash)
- Contact form: one submit at a time; bad/empty JSON → 400; oversized body → 413; honeypot and origin checks kept
- Netlify production builds fail closed if the service-role key is missing; GitHub CI still builds

**Owner takeaway:** copy matches behavior. Public database inserts stay open until **014**.

---

## Phase 4 — Care guide and emergencies

- Care guide is educational, not a “where should I go?” decision tree
- Chest pain copy leads with “many different symptoms,” including jaw/neck/back/sweats, and 911
- Sore throat names swallowing, drooling, breathing as emergencies
- 988 and Poison Help `1-800-222-1222` are in the right places; 911 first if collapsed / not breathing / seizing
- Infant fever: 100.4°F (38°C); hard-to-wake; no “rectal”; Spanish avoids `somnolencia extrema`
- Urgent-care text contrast meets WCAG AA; articles index shows the medical disclaimer
- Red emergency banner no longer repeats the question twice

---

## Phase 5 — Guest progress

- Guest lesson/quiz progress lives in the browser across tab close and can migrate into an account on login/signup
- Login and signup say that device progress will sync
- Sign-out and account delete clear health data on the device (theme and language stay)
- Broken stored rows are skipped instead of wiping the whole list
- After migrate, the dashboard refetches so completions show without a second click

**Owner takeaway:** do not put this live against production until **015** unique quiz rows exist, or signed-in quiz saves can error.

---

## Phase 6 — Quiz scores

- Quizzes save **counts** (for example 4 out of 5), not a percent stuffed into the score column (that had produced “1600%” averages)
- Dashboard average for 4/5 is **80**
- Retakes keep the best score; a network failure restores the previous best on screen
- Completed-lessons still finds both new ids and old `-quiz` ids
- **015** file: normalize old percent rows, drop duplicates, then unique `(user, quiz)`

**Owner takeaway:** apply **015** only after the upsert client is Published.

---

## Phase 7 — Achievements and streaks

- Streak, path-complete, all-beginner, and glossary-reader badges can actually fire
- Toasts and notifications follow English or Spanish
- Daily log runs before streak check (order: log → streak → achievements)

---

## Phase 8 — Sources and trust

- Lessons and articles show reviewer + sources near the title and a full list at the end
- Home trust line: education with listed sources, not medical advice — **no** doctor badge, no extra eyebrow
- Build fails if sources/reviewer are missing or placeholder
- Prescription-label lesson: Poison Help in the dosage warning, 911-first if collapse; before “Special Warnings”

---

## Phase 9 — Auth polish and shared-device wipe

- Signup does not reveal whether an email is already registered
- Expired session while saving a lesson shows “session expired,” not a generic save error
- Logout and delete-account wipe health storage and expire auth + analytics cookies; theme survives
- Middleware copies cookies correctly on dashboard redirects and on session refresh

**Owner takeaway:** this is Gate 1. It must be **live** before **014** creates `delete_user`.

---

## Phase 10 — Header, 404, crashes, Display

- At 1440px, full nav is inline; 1024px still uses the hamburger (Spanish labels do not fit)
- Login stays a visible word at laptop width; signup may hide
- Mobile menu is a solid sheet under the bar, scrollable, 44px close control
- Branded 404 buttons; crash screen uses English/Spanish catalogs, not hardcoded English only

---

## Phase 11 — Touch targets and glossary

- Footer, terms TOC, breadcrumbs, related-lesson links, checklist rows, contact subject: 44–48px targets
- Glossary A–Z is a horizontal snap row on phones (not a 26-button wrap), with a fade cue
- Tapping a glossary definition card does not immediately close it

---

## Phase 12 — Search and visit planner

- Search shows loading instead of “no results”; announces result counts; groups by type
- Planner stores question **ids**, so switching English ↔ Spanish does not mix languages
- Visit type and Continue stay off until the page has loaded saved data
- Step changes move keyboard focus to the heading

---

## Phase 13 — Home fold and reading

- Hero and the two main buttons sit above the video on large screens (buttons in the first viewport)
- Reduced-motion: video does not autoplay
- Articles: readable line length, desktop contents list, no nested main landmark, mobile reading bar
- Quiz “correct/incorrect” slot no longer jumps the Next button
- Lesson cards clamp long titles; learning-path steps readable on a phone

---

## Phase 14 — Smaller Spanish/English bundles

- Opening an English lesson no longer downloads the Spanish lesson/path catalogs in the first client payload
- Both languages still generate as static pages
- Search still loads only the current language index

---

## Phase 15 — Print, share, recents, empty achievements

- Print on lessons, articles, and the care guide; paper footer is education-only (talk to your doctor or pharmacist) with the print date
- Care-guide fridge print includes 911/988; the red on-screen banner does not print
- Copy link and X share on lessons; native share sheet when the browser has it
- Opening a lesson updates “recent” without requiring a catalog click
- Zero achievements shows an empty state with a path into Learn

---

## Phase 16 — Headers, privacy, honest stats

- CI fails if Netlify and Next security headers drift
- Crash reports drop typed search text, strip `?` and `#` from URLs, keep lesson path slugs, do not send IP/email
- Dashboard does not show “0 min learned” when time-spent was never recorded (shows an em dash)
- Optional split of preferences vs progress state shipped; isolation tests pass lint

---

## Hardening pass (this review)

- Unit suite: 139 files, 971 tests passed (`npm test`)
- Lint: 0 errors, 0 warnings (Google Analytics test no longer trips the sync-script rule; glossary popover effect lists its ref)
- TypeScript strict: `npm run typecheck` passed (`strict` + `noUncheckedIndexedAccess`)
- Production `npm run build`: green (prebuild validate + bundle, 363 pages)
- Playwright local: **420 passed, 4 skipped** (Chromium + WebKit). Skipped tests are Linux-only visual baselines. **Firefox skipped on macOS 27** — command-line Firefox never finishes starting (plugin-container sandbox). OS/Firefox bug, not this app ([Playwright #42082](https://github.com/microsoft/playwright/issues/42082)). GitHub Actions still runs Chromium, Firefox, and WebKit on Ubuntu. Live Netlify crawl stays opt-in (`AUDIT_LIVE=1`)
- Safari/WebKit: search and Display overlays now render on `document.body` so the header glass cannot steal clicks. Contact subject dropdown uses `appearance: none` so the 48px touch target actually applies. Skip-to-content still focuses main
- Dashboard guest redirect expects `/en/dashboard` (locale prefix); e2e webServer pins placeholder Supabase env so mock login works (empty env let `.env.local` win)
- Glossary scroll-spy: unregister no longer schedules a re-render when the term was not active (stops a max-update-depth loop on lesson pages)
- Apply trap documented and unit-pinned: `supabase/repair/history-match-001-013.sql`

## VERIFY files vs every phase acceptance line

Every in-scope phase (1–16) has `REVAMP/VERIFY-PHASE-{N}.md` with **Verdict: APPROVED**. No VERIFY file is missing. No phase is still **CHANGES REQUIRED**.

These acceptance lines are **still not live** even though the VERIFY file is APPROVED. They are write/code approvals, not production apply:

| Phase | What is still open                                                        | Why VERIFY still says APPROVED                                                            |
| ----- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1     | Gate 0, Gate 1, apply `014`, live contact INSERT lock, live `delete_user` | Plan forbids apply until a human proves Netlify service-role and Phase 9 production Ready |
| 2     | Supabase Auth email templates                                             | Dashboard copy, not code (`P2-4`)                                                         |
| 3     | PostgREST anon INSERT on contact                                          | Same as Phase 1 `014` (`P3-2`)                                                            |
| 5 / 6 | Production unique `(user_id, quiz_id)`                                    | Apply `015` only after the upsert client is Published (`P6-3`)                            |
| 16    | Netlify server `SENTRY_DSN`                                               | Documented; ops must set the var (`P16A-3`)                                               |

Historical **FAIL** rows inside some VERIFY tables are the 2026-08-28 review snapshot. Follow-up headers (2026-08-29) closed the product punches. Do not treat those old FAIL cells as current code gaps.

---

## Out of scope / not changed

- No physician or clinic branding
- No HIPAA claim
- Phase 14 did not rewrite how pages are generated on the server
- Production SQL is not applied by this changelog
