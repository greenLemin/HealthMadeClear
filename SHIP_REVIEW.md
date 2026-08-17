# SHIP_REVIEW.md — Final Review, Remediation & Ship

**Mission:** Staff-level final quality gate on three workstreams (audit, de-spaghetti, uiux).
**Branch:** `audit/full-codebase-remediation` (39 commits ahead of `origin/main`)
**Started:** 2026-08-14

---

## Stage 0 — Sync & Changeset Recon

### Ground Truth

- Working tree: clean except `despaghetti/DESPAGHETTI_LOG.md` (uncommitted log append).
- All three workstreams are consolidated onto `audit/full-codebase-remediation`.
- No separate `refactor/de-spaghetti` or `uiux/full-overhaul` branches exist.
- 1 stash: `pre-PR-cleanup: e2e header selectors + playwright viewport + next-env`.
- `origin/main` is at `236508c0` (build(deps): bump react and react-dom to 19 (#416)).
- Local `main` is identical to `origin/main` (no divergence).

### Changeset Inventory (vs `origin/main`)

- 42 added files
- 20 deleted files
- 13 renamed files
- 106 modified files
- Total: 181 files, +36320 / -2914

### Baseline Gate Results (current tree, before review)

| Gate                  | Result                                 |
| --------------------- | -------------------------------------- |
| `tsc --noEmit`        | 0 errors — PASS                        |
| `npm run lint`        | 0 errors, 2 acceptable warnings — PASS |
| `npx vitest run`      | 562 tests pass (84 files) — PASS       |
| `npm run build`       | succeeds, 363 static pages — PASS      |
| `npm audit`           | 0 vulnerabilities — PASS               |
| `npx playwright test` | 313 passed, 2 skipped — PASS           |

### Deferred / Remaining-Items Ledger (extracted from prior reports)

| ID           | Source      | Item                                                            | Disposition                                                                |
| ------------ | ----------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| F-024        | AUDIT       | 2 pre-existing lint warnings (sync script in test, img in Logo) | Acceptable per prior report — verify still only 2 warnings                 |
| F-025        | AUDIT       | Production 403s from Netlify edge bot detection                 | Infrastructure issue, not code-level — verify                              |
| WS-9         | DESPAGHETTI | useProgress Hook Decomposition                                  | Remaining work — accept (hook already well-decomposed)                     |
| Audit Risk 1 | AUDIT       | In-memory rate limit resets on serverless cold start            | Documented limitation — accept                                             |
| Audit Risk 2 | AUDIT       | `'unsafe-inline'` in CSP `script-src`                           | Requires nonce-based CSP refactor — accept (out of scope for quality gate) |
| Audit Risk 3 | AUDIT       | Contact PII/PHI stored plaintext in Supabase                    | Encryption complexity — accept (out of scope)                              |
| Audit Risk 4 | AUDIT       | `markdown-it` loaded eagerly into client bundle                 | Significant refactor — accept (out of scope)                               |

### Claim Verification Tasks

**Audit Workstream (F-001 through F-026)**:

- [ ] F-001: Removed illegal route export from contact/route.ts
- [ ] F-002: Pinned build to webpack via --webpack flag
- [ ] F-003: Added setRequestLocale to 19 page.tsx files
- [ ] F-004: Added CSRF protection to contact endpoint
- [ ] F-005: Compressed homepage video 64MB → 1.3MB. Added poster, preload, dimensions
- [ ] F-006: Replaced 1.2MB JPEG logo with 1.3KB SVG favicon
- [ ] F-007: Removed stitch design artifacts from repo
- [ ] F-008: Added HSTS header to next.config.mjs
- [ ] F-009: Added object-src 'none' to CSP
- [ ] F-010: Added PII scrubbing for Sentry and server logs
- [ ] F-011: Stripped query params from GA page_view events
- [ ] F-012: Added viewport export with themeColor to layout
- [ ] F-013: Fixed quizScores type from any[] to QuizScore[]
- [ ] F-014: Added email format validation to SignupForm
- [ ] F-015: Wrapped auth form Supabase calls in try/catch/finally
- [ ] F-016: Fixed streaks race condition, timezone bug, hardcoded return
- [ ] F-017: Added error logging to auth callback/confirm routes
- [ ] F-018: Added CRLF injection rejection to sanitizeRedirectPath
- [ ] F-019: Added clamping to getCompletedLessonsPaginated
- [ ] F-020: Added error checking to notifications insert operations
- [ ] F-021: Added logger.warn to guest progress storage failure catch blocks
- [ ] F-022: Added sanitizeRedirectPath call to requireAuth
- [ ] F-023: Fixed getCompletedLessonsPaginated return value
- [ ] F-026: Committed a11y/perf improvements

**UIUX Workstream (UIUX-001 through UIUX-010)**:

- [ ] UIUX-001: Fixed failing streak tests
- [ ] UIUX-002: Improved reading progress bar visibility
- [ ] UIUX-003: Replaced hardcoded confetti colors with design tokens
- [ ] UIUX-004: Improved ArticlesClient search input accessibility
- [ ] UIUX-005: Improved DashboardStats icon container consistency
- [ ] UIUX-006: Improved Alert component ARIA semantics
- [ ] UIUX-007: Improved Button loading state accessibility
- [ ] UIUX-008: Improved ProgressBar ARIA and animation
- [ ] UIUX-009: Improved EmptyState component accessibility
- [ ] UIUX-010: Improved Callout component semantic structure

**De-spaghetti Workstream (WS-1 through WS-18)**:

- [ ] WS-1: Cleanup — Dead Code and Config Drift
- [ ] WS-2: Types Consolidation
- [ ] WS-5: MDX Parser Consolidation
- [ ] WS-11: Reveal/Animation Constants Split
- [ ] WS-3: Auth Forms Consolidation
- [ ] WS-4: Dashboard Refactor
- [ ] WS-14: Filter Hook
- [ ] WS-16: Naming and Convention Fixes
- [ ] WS-18: Move **tests**/ to Colocated
- [ ] WS-6: Header Decomposition
- [ ] WS-7: Search Dialog Decomposition
- [ ] WS-8: Quiz Decomposition
- [ ] WS-13: MDX Renderer Split
- [ ] WS-15: Loading Skeletons Consolidation
- [ ] WS-17: Test Mocks Consolidation

---

## Stage 1 — Full Diff Review (every changed file, no sampling)

(Review log appended below as findings are dispositioned.)
