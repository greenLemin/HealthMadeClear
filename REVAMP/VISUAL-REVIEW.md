# HealthMadeClear — visual review pack (final)

**Date:** 2026-08-29  
**Build:** current local `next dev` at `http://127.0.0.1:3000` (placeholder Supabase → mock auth for dashboard)  
**Viewports:** desktop 1440×900 @ 2× DPR; mobile 390×844 @ 2× DPR; `prefers-reduced-motion: reduce`  
**After archive:** [`SCREENSHOTS/final/`](SCREENSHOTS/final/) (77 PNGs)  
**Before archive:** Prompt 2 files were supposed to live at [`SCREENSHOTS/`](SCREENSHOTS/) (`desktop-01-home.png`, etc.). **Those PNGs are not on disk and were never committed.** Pairing below uses `REVAMP/AUDIT-VISUAL.md` (27 Aug 2026) as the before record, plus after images from this capture.

No product code was changed for this pack.

---

## How to read this file

Each changed surface has:

- **Before** — what the 27 Aug visual audit measured (and the Prompt 2 filename that is missing)
- **After** — current capture under `SCREENSHOTS/final/`
- **2–3 bullets** — what actually improved

Full inventory is at the end.

---

## First-time visitor scores

Walked as a new guest: welcome dialog → home hero → learning paths → EOB article → unknown URL. Desktop nav was also measured at 1440 in Playwright (this Cursor tab was a phone-width window).

| Dimension   |      Score | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------- | ---------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Clarity** | **8 / 10** | In five seconds the site says what it is: free plain-language health education, with two obvious next steps (Start Learning, Browse Glossary). Paths, lessons, tools, and glossary are named in everyday words. Onboarding card explains learn / paths / search before the page. Deduct for an 8-link header, Learn and Articles sharing the same book icon, and mobile search living only inside the hamburger.                                                                                                                                                 |
| **Trust**   | **8 / 10** | Trust line sits _above_ the H1: “Health education with listed sources — plain language. Not medical advice.” Lessons/articles show reviewer + CDC/MedlinePlus-style sources near the title. Care guide leads with US 911 and names 988. Footer emergency control says 911 in the US. Deduct because the hero still uses a Stitch mock (`/stitch/home.png`) that looks like a different product (fake “Profile” chrome), and a dead URL drops you out of the app shell. No named clinician on the banner — that is the locked product decision, not a regression. |
| **Polish**  | **7 / 10** | Type scale, cards, 44px targets, grouped search, quiz feedback slot, and Spanish header at 1440 all look like a real product. Deduct for the items in **Still embarrassing** below. This is a strong B; it is not yet “invisible craft.”                                                                                                                                                                                                                                                                                                                         |

**Would I send this to a parent before a visit?** Yes, with the trust banner and 911 copy. **Would I screenshot the 404 or the hero mock for a homepage tweet?** No.

---

## Still embarrassing

These are the leftovers a stranger will notice. None of them require inventing new product scope; they are holes in work the revamp already claimed.

1. **Dead URLs have no app chrome.** `/en/this-page-does-not-exist` and `/en/learn/this-lesson-does-not-exist` render the _root_ `app/not-found.tsx`: no header, no footer, empty `<title>`, bilingual “Go home / Ir al inicio” on a lone card. Buttons _are_ padded (`min-h-12`). The branded locale 404 in `src/app/[locale]/not-found.tsx` never runs for unknown paths. Before: unstyled 18px links. After: padded buttons, still a stub. See `desktop-26-not-found.png`, `mobile-26-not-found.png`.
2. **`next dev` paints a red “1 Issue” badge on Home.** Overlay points at `HomeClient.tsx` line 61 (`<video autoPlay={!prefersReducedMotion}>`). `useMotionSafe()` is fail-closed on the server (`true`) and becomes `false` for users who do _not_ prefer reduced motion → hydration mismatch. Production hides the badge; the mismatch can still flash. Playwright captures used reduced-motion, so after screenshots do **not** show the badge.
3. **Hero “product shot” is a lie.** Right column is `public/stitch/home.png`, not a live frame. It shows nav/chrome the site does not have. First-time visitors compare the mock to the real header and feel the gap.
4. **Mobile search is one extra tap.** At 390px, Search is not in the top bar; it is inside the accordion (`lg:flex` cluster). Fine once you know. Easy to miss on first visit.
5. **Learn vs Articles icons are identical** (open book) in the hamburger. Eight destinations, two with the same glyph.

Not embarrassing (called out so they are not re-litigated): no doctor badge (plan forbade it); 1024px hamburger-by-design; guest “Great work, create an account” banner only after real local progress.

---

## Before / after by page

Prompt 2 filenames are listed even though the files are missing, so this pack can be re-linked if the archive is restored.

### Home — `/en` (and `/es`)

**Before:** `desktop-01-home.png`, `mobile-01-home.png`  
Audit: 1440px header used `2xl` so a standard laptop got a hamburger; H1 **89.6px** shoved Start Learning below the 900px fold; no clinical/education signal above the headline.

**After:** [desktop-01-home.png](SCREENSHOTS/final/desktop-01-home.png) · [mobile-01-home.png](SCREENSHOTS/final/mobile-01-home.png) · [desktop-01b-home-es.png](SCREENSHOTS/final/desktop-01b-home-es.png) · [desktop-00-onboarding.png](SCREENSHOTS/final/desktop-00-onboarding.png) · [mobile-00b-onboarding.png](SCREENSHOTS/final/mobile-00b-onboarding.png)

![After home (desktop, full page)](SCREENSHOTS/final/desktop-01-home.png)

- Desktop nav is inline at 1440 (`xl`): Home, Learn, Articles, Paths, Tools, Dashboard, Glossary, About + visible “Sign in”. Spanish labels fit without overflow (`desktop-01b-home-es.png`).
- H1 is **56px** / 1.1 leading (clamp). Trust pill at y≈174. “Start Learning” occupies y≈486–542 (inside the 900px fold). Video starts at y≈765, below the CTAs.
- First visit gets a welcome card (learn / paths / search) instead of a blank first paint. After dismiss, the same trust line and two CTAs remain.

### Header / mobile menu

**Before:** `mobile-00-nav-drawer-open.png` — overlay drawer, 36×36 close.

**After:** [mobile-00-nav-drawer-open.png](SCREENSHOTS/final/mobile-00-nav-drawer-open.png)

![After mobile menu](SCREENSHOTS/final/mobile-00-nav-drawer-open.png)

- Full-width solid accordion under the bar, not a `max-w-md` overlay. Close control is 44px.
- Sign in + Create account are full-width 44px+ rows. EN/ES, Display, and Search sit in the sheet (Search is _only_ here on 390px).

### Learn catalog — `/en/learn`

**Before:** `desktop-02-learn-catalog.png`, `mobile-02-learn-catalog.png` — weak inactive pills; titles wrapping hard.

**After:** [desktop-02-learn-catalog.png](SCREENSHOTS/final/desktop-02-learn-catalog.png) · [mobile-02-learn-catalog.png](SCREENSHOTS/final/mobile-02-learn-catalog.png)

- Category chips are 44px-tall and easier to hit on 390px.
- Card titles clamp; time/difficulty badges still readable.

### Lesson runner — nutrition + prescription labels

**Before:** `desktop-03-…`, `desktop-04-…`, `mobile-03-…` — glossary underlines ~38×26px; sources only at the bottom.

**After:** [desktop-03-lesson-reading-nutrition-labels.png](SCREENSHOTS/final/desktop-03-lesson-reading-nutrition-labels.png) · [desktop-04-lesson-understanding-prescription-labels.png](SCREENSHOTS/final/desktop-04-lesson-understanding-prescription-labels.png) · [mobile-03-lesson-reading-nutrition-labels.png](SCREENSHOTS/final/mobile-03-lesson-reading-nutrition-labels.png) · [mobile-04-lesson-understanding-prescription-labels.png](SCREENSHOTS/final/mobile-04-lesson-understanding-prescription-labels.png) · [desktop-30-lesson-glossary-popover.png](SCREENSHOTS/final/desktop-30-lesson-glossary-popover.png)

- Reviewer + sources sit under the title, not only in the footer.
- Print / Copy link / Share are in the lesson header.
- Inline terms open a portaled dialog (`desktop-30`); hit area uses the expanded `after:` box. Popover closes on scroll (do not full-page-screenshot it).

### Quiz

**Before:** `desktop-31-lesson-quiz-question.png`, `desktop-32-lesson-quiz-feedback.png` — feedback shoved “Next” down (CLS).

**After:** [desktop-31-lesson-quiz-question.png](SCREENSHOTS/final/desktop-31-lesson-quiz-question.png) · [desktop-32-lesson-quiz-feedback.png](SCREENSHOTS/final/desktop-32-lesson-quiz-feedback.png) · [mobile-31-lesson-quiz-question.png](SCREENSHOTS/final/mobile-31-lesson-quiz-question.png)

- Feedback lives in a reserved `min-h-[140px]` slot. Correct/incorrect (“Correct!” / “Not quite.”) does not jump the action bar.
- Full-row radio labels; letter chips stay 40px.

### Learning paths

**Before:** `desktop-05-…`, `desktop-06-…`, `mobile-05-…`, `mobile-06-…` — mobile milestone nodes crushed titles.

**After:** [desktop-05-learning-paths-catalog.png](SCREENSHOTS/final/desktop-05-learning-paths-catalog.png) · [desktop-06-learning-path-doctor-visit-prep.png](SCREENSHOTS/final/desktop-06-learning-path-doctor-visit-prep.png) · [mobile-05-learning-paths-catalog.png](SCREENSHOTS/final/mobile-05-learning-paths-catalog.png) · [mobile-06-learning-path-doctor-visit-prep.png](SCREENSHOTS/final/mobile-06-learning-path-doctor-visit-prep.png)

- Catalog still reads as a curriculum list (time, ready/done, start path).
- Path detail on 390px is a stacked list, not a squeezed timeline. 988 warning on Mental Wellness is visible in the catalog.

### Articles catalog + EOB reader

**Before:** `desktop-07-…`, `desktop-08-…`, `mobile-07-…`, `mobile-08-…` — long line length, no TOC, sources missing on reader (audit mixed this with the catalog).

**After:** [desktop-07-articles-catalog.png](SCREENSHOTS/final/desktop-07-articles-catalog.png) · [desktop-08-article-understanding-your-eob.png](SCREENSHOTS/final/desktop-08-article-understanding-your-eob.png) · [mobile-07-articles-catalog.png](SCREENSHOTS/final/mobile-07-articles-catalog.png) · [mobile-08-article-understanding-your-eob.png](SCREENSHOTS/final/mobile-08-article-understanding-your-eob.png)

- Catalog shows the medical disclaimer.
- Reader: “On this page” TOC; prose ~606px; **Reviewed by Health Education Review Team · June 11, 2026 · Sources: CDC / NIH MedlinePlus** under the H1; Print / Copy / Share; print-only education footer + date.

### Glossary

**Before:** `desktop-09-glossary.png`, `mobile-09-glossary.png`, `desktop-37-glossary-term-expanded.png` — 26 wrapping **28×28** letter buttons on 390px.

**After:** [desktop-09-glossary.png](SCREENSHOTS/final/desktop-09-glossary.png) · [mobile-09-glossary.png](SCREENSHOTS/final/mobile-09-glossary.png) · [desktop-37-glossary-term-page.png](SCREENSHOTS/final/desktop-37-glossary-term-page.png) · [desktop-37-glossary-term-expanded.png](SCREENSHOTS/final/desktop-37-glossary-term-expanded.png)

- Mobile A–Z is `flex-nowrap` with **44×44** chips (All 48×44). Fade cue on the row. Not a 26-button wrap.
- Term pages (`/glossary/hypertension`) are real pages, not a tap-trap accordion.

### Tools

**Before:** `desktop-10–13`, `mobile-11–13` — 20×20 checkboxes; planner contrast; care guide praised visually but later rewritten for liability.

**After:** [desktop-10-tools-catalog.png](SCREENSHOTS/final/desktop-10-tools-catalog.png) · [desktop-11-tool-visit-planner.png](SCREENSHOTS/final/desktop-11-tool-visit-planner.png) · [desktop-12-tool-visit-checklist.png](SCREENSHOTS/final/desktop-12-tool-visit-checklist.png) · [desktop-13-tool-care-guide.png](SCREENSHOTS/final/desktop-13-tool-care-guide.png) · [desktop-33-tool-visit-planner-step1.png](SCREENSHOTS/final/desktop-33-tool-visit-planner-step1.png) · [desktop-34-tool-visit-planner-step2.png](SCREENSHOTS/final/desktop-34-tool-visit-planner-step2.png) · [desktop-35-tool-visit-checklist-checked.png](SCREENSHOTS/final/desktop-35-tool-visit-checklist-checked.png) · [desktop-36-tool-care-guide-detail.png](SCREENSHOTS/final/desktop-36-tool-care-guide-detail.png) · [mobile-10-tools-catalog.png](SCREENSHOTS/final/mobile-10-tools-catalog.png) · [mobile-11-tool-visit-planner.png](SCREENSHOTS/final/mobile-11-tool-visit-planner.png) · [mobile-12-tool-visit-checklist.png](SCREENSHOTS/final/mobile-12-tool-visit-checklist.png) · [mobile-13-tool-care-guide.png](SCREENSHOTS/final/mobile-13-tool-care-guide.png)

- Checklist rows are **64px** tall, full-row labels, native box 24px (`desktop-35`).
- Planner is a 3-step card flow; step 2 is a question list with Continue/Review (ids survive EN↔ES; not visible in a still).
- Care guide title is “How care settings differ” (education, not triage). Red 911 banner on screen; print CTA in header.

### Legal / contact / a11y

**Before:** `desktop-14–18`, `mobile-14–18` — contact inputs ~29px; terms jump-links 30px tall.

**After:** [desktop-14-about.png](SCREENSHOTS/final/desktop-14-about.png) · [desktop-15-accessibility.png](SCREENSHOTS/final/desktop-15-accessibility.png) · [desktop-16-contact.png](SCREENSHOTS/final/desktop-16-contact.png) · [desktop-17-privacy.png](SCREENSHOTS/final/desktop-17-privacy.png) · [desktop-18-terms.png](SCREENSHOTS/final/desktop-18-terms.png) · [mobile-14-about.png](SCREENSHOTS/final/mobile-14-about.png) · [mobile-15-accessibility.png](SCREENSHOTS/final/mobile-15-accessibility.png) · [mobile-16-contact.png](SCREENSHOTS/final/mobile-16-contact.png) · [mobile-17-privacy.png](SCREENSHOTS/final/mobile-17-privacy.png) · [mobile-18-terms.png](SCREENSHOTS/final/mobile-18-terms.png)

- Contact fields are 48px-class inputs; subject uses `appearance: none` so the target is real (WebKit).
- Privacy/terms copy now describes guest vs account vs analytics honestly (visual: longer, specific sections — not “never leaves the device”).
- About is largely the same editorial page; included because the shell (header, footer tap size) changed around it.

### Auth

**Before:** `desktop-19–21`, `desktop-20b` — signup errors existed; recovery was the bug (not a visual one).

**After:** [desktop-19-auth-login.png](SCREENSHOTS/final/desktop-19-auth-login.png) · [desktop-20-auth-signup.png](SCREENSHOTS/final/desktop-20-auth-signup.png) · [desktop-20b-auth-signup-errors.png](SCREENSHOTS/final/desktop-20b-auth-signup-errors.png) · [desktop-21-auth-forgot-password.png](SCREENSHOTS/final/desktop-21-auth-forgot-password.png) · [desktop-21b-auth-reset-password.png](SCREENSHOTS/final/desktop-21b-auth-reset-password.png) · [mobile-19-auth-login.png](SCREENSHOTS/final/mobile-19-auth-login.png) · [mobile-20-auth-signup.png](SCREENSHOTS/final/mobile-20-auth-signup.png) · [mobile-21-auth-forgot-password.png](SCREENSHOTS/final/mobile-21-auth-forgot-password.png)

- Login/signup sit in the app shell with the 1440 nav. Guest-progress-will-sync line is on signup.
- Empty submit shows field errors (“Please enter your email address.”) without a crash (`desktop-20b`).
- Reset-password is a first-class screen, not a dashboard dump.

### Dashboard (mock guest)

**Before:** `desktop-22-auth-dashboard-*`, `mobile-22-auth-dashboard-overview.png`.

**After:** [desktop-22-auth-dashboard-overview.png](SCREENSHOTS/final/desktop-22-auth-dashboard-overview.png) · [desktop-23-auth-dashboard-progress.png](SCREENSHOTS/final/desktop-23-auth-dashboard-progress.png) · [desktop-24-auth-dashboard-achievements.png](SCREENSHOTS/final/desktop-24-auth-dashboard-achievements.png) · [desktop-25-auth-dashboard-settings.png](SCREENSHOTS/final/desktop-25-auth-dashboard-settings.png) · [mobile-22-auth-dashboard-overview.png](SCREENSHOTS/final/mobile-22-auth-dashboard-overview.png) · [mobile-23-auth-dashboard-progress.png](SCREENSHOTS/final/mobile-23-auth-dashboard-progress.png) · [mobile-24-auth-dashboard-achievements.png](SCREENSHOTS/final/mobile-24-auth-dashboard-achievements.png) · [mobile-25-auth-dashboard-settings.png](SCREENSHOTS/final/mobile-25-auth-dashboard-settings.png)

- Overview still greets and offers export. Minutes learned shows an em dash when time was never recorded (honesty, not “0 min”).
- Achievements empty state points into Learn instead of a blank trophy wall.
- Settings is a real form (display name), not a stray card.

### 404

**Before:** `desktop-26-not-found.png`, `mobile-26-not-found.png` — 59×18 / 67×18 unstyled links, no shell.

**After:** [desktop-26-not-found.png](SCREENSHOTS/final/desktop-26-not-found.png) · [mobile-26-not-found.png](SCREENSHOTS/final/mobile-26-not-found.png) · [desktop-26b-not-found-locale.png](SCREENSHOTS/final/desktop-26b-not-found-locale.png) · [mobile-26b-not-found-locale.png](SCREENSHOTS/final/mobile-26b-not-found-locale.png)

- Buttons meet 44px. Copy is bilingual on the root stub.
- **Shell still missing** for unknown paths (see embarrassing #1). `26b` is the same root stub for a fake lesson slug.

### Search + Display

**Before:** `desktop-27-search-modal-empty.png`, `desktop-28-search-modal-results.png`, `desktop-29-preferences-modal.png` — flat ungrouped hits; duplicate “Display” accessible name.

**After:** [desktop-27-search-modal-empty.png](SCREENSHOTS/final/desktop-27-search-modal-empty.png) · [desktop-28-search-modal-results.png](SCREENSHOTS/final/desktop-28-search-modal-results.png) · [mobile-27-search-modal-results.png](SCREENSHOTS/final/mobile-27-search-modal-results.png) · [desktop-29-preferences-modal.png](SCREENSHOTS/final/desktop-29-preferences-modal.png)

- Empty state is a search field, not a fake “no results.” Query “blood” groups as **Lessons (n)** with `border-l-4` type accents.
- Display dialog: text size, theme, simple mode. One control, not doubled SR text.

### Keyboard

**Before:** `desktop-38–40` — focus already mostly good.

**After:** [desktop-38-keyboard-tab-home.png](SCREENSHOTS/final/desktop-38-keyboard-tab-home.png) · [desktop-39-keyboard-tab-lesson.png](SCREENSHOTS/final/desktop-39-keyboard-tab-lesson.png) · [desktop-40-keyboard-tab-planner.png](SCREENSHOTS/final/desktop-40-keyboard-tab-planner.png)

- Skip link and header controls still show a visible ring. Not a visual redesign; confirmation that the pass did not regress.

---

## Capture notes (for whoever re-runs this)

- Script used: `/tmp/hmc-capture-final.mjs` (not in the repo; product code untouched).
- `hmc_onboarded=true` except `desktop-00` / `mobile-00b`.
- Dashboard: mock `guest@example.com` / `password123`.
- 404 shots skip waiting on `<header>` (there isn’t one).
- Quiz: click radios **inside `main`**, or you hit the EN/ES radiogroup in the header.
- Mobile search: open hamburger first.
- Next.js “1 Issue” overlay will appear on Home in `next dev` without reduced-motion; Playwright captures forced reduce so they stay clean.

---

## After inventory (`SCREENSHOTS/final/`)

| File                                                                                 | What                                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `desktop-00-onboarding.png`                                                          | First-visit welcome (desktop)                           |
| `mobile-00b-onboarding.png`                                                          | First-visit welcome (390)                               |
| `desktop-01-home.png`                                                                | Home EN full page                                       |
| `desktop-01b-home-es.png`                                                            | Home ES (header overflow check)                         |
| `mobile-01-home.png`                                                                 | Home 390                                                |
| `mobile-00-nav-drawer-open.png`                                                      | Accordion open                                          |
| `desktop-02-learn-catalog.png` / `mobile-02-…`                                       | Lesson library                                          |
| `desktop-03-lesson-reading-nutrition-labels.png` / `mobile-03-…`                     | Lesson                                                  |
| `desktop-04-lesson-understanding-prescription-labels.png` / `mobile-04-…`            | Lesson                                                  |
| `desktop-05-learning-paths-catalog.png` / `mobile-05-…`                              | Paths index                                             |
| `desktop-06-learning-path-doctor-visit-prep.png` / `mobile-06-…`                     | Path detail                                             |
| `desktop-07-articles-catalog.png` / `mobile-07-…`                                    | Articles index                                          |
| `desktop-08-article-understanding-your-eob.png` / `mobile-08-…`                      | Article reader                                          |
| `desktop-09-glossary.png` / `mobile-09-…`                                            | Glossary index                                          |
| `desktop-10-tools-catalog.png` / `mobile-10-…`                                       | Tools index                                             |
| `desktop-11-tool-visit-planner.png` / `mobile-11-…`                                  | Planner                                                 |
| `desktop-12-tool-visit-checklist.png` / `mobile-12-…`                                | Checklist                                               |
| `desktop-13-tool-care-guide.png` / `mobile-13-…`                                     | Care guide                                              |
| `desktop-14-about.png` … `desktop-18-terms.png` and mobile twins                     | About, a11y, contact, privacy, terms                    |
| `desktop-19-auth-login.png` … `desktop-21b-auth-reset-password.png` and mobile 19–21 | Auth                                                    |
| `desktop-20b-auth-signup-errors.png`                                                 | Signup validation                                       |
| `desktop-22`–`25` and `mobile-22`–`25`                                               | Dashboard overview / progress / achievements / settings |
| `desktop-26-not-found.png` / `mobile-26-…`                                           | Root 404                                                |
| `desktop-26b-not-found-locale.png` / `mobile-26b-…`                                  | Fake lesson slug (same root 404)                        |
| `desktop-27-search-modal-empty.png`                                                  | Search empty                                            |
| `desktop-28-search-modal-results.png` / `mobile-27-…`                                | Search grouped                                          |
| `desktop-29-preferences-modal.png`                                                   | Display                                                 |
| `desktop-30-lesson-glossary-popover.png`                                             | Inline term                                             |
| `desktop-31-lesson-quiz-question.png` / `mobile-31-…`                                | Quiz                                                    |
| `desktop-32-lesson-quiz-feedback.png`                                                | Quiz feedback slot                                      |
| `desktop-33` / `desktop-34`                                                          | Planner steps 1–2                                       |
| `desktop-35-tool-visit-checklist-checked.png`                                        | Checked row                                             |
| `desktop-36-tool-care-guide-detail.png`                                              | Care guide scrolled to 911                              |
| `desktop-37-glossary-term-expanded.png`                                              | Glossary card                                           |
| `desktop-37-glossary-term-page.png`                                                  | `/glossary/hypertension`                                |
| `desktop-38`–`40`                                                                    | Keyboard focus                                          |

`MANIFEST.txt` in the same folder is the capture log from the first pass (retries not fully appended).
