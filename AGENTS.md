# AGENTS.md

Guidance for cloud agents working in this repository.

## Project overview

**Health Made Clear** is a bilingual (English/Spanish) Next.js 14 health-education web app. There is no backend database or auth — user preferences and progress live in the browser (`localStorage` + cookies).

## Cursor Cloud specific instructions

### Services

| Service | Required? | Start command |
|---------|-----------|---------------|
| Next.js dev server | Yes (for manual testing) | `npm run dev` → http://127.0.0.1:3000/en |
| Playwright Chromium | Only for E2E | `npx playwright install chromium --with-deps` |

No Docker, database, or external APIs are needed for local development.

### Standard commands

See `README.md` and `CONTRIBUTING.md` for the canonical list. Common checks:

- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm test` — Vitest unit tests
- `npm run build` — production build (bundles MDX content via `prebuild`)
- `npm run test:e2e` — Playwright (starts dev server automatically)

### Environment

- Copy `.env.example` to `.env.local` for local dev (optional; no secrets required).
- `NEXT_PUBLIC_SITE_URL` is only enforced when `CI=true` during `npm run build`.
- Node **≥20** is required (`package.json` `engines`).

### Gotchas

1. **Do not run `npm run dev` and `npm run build` concurrently.** They share the `.next` cache; parallel use can cause `PageNotFoundError` during build. Stop the dev server and `rm -rf .next` before building if that happens.
2. **Playwright browser install is separate from `npm install`.** Run `npx playwright install chromium --with-deps` once per VM before E2E tests.
3. **Visual E2E snapshots may be missing on Linux.** The repo may not ship baseline PNGs; first Linux runs of `e2e/visual.spec.ts` can fail until baselines are committed or tests are skipped.
4. **Language/accessibility controls use `role="radio"`.** Some E2E selectors expect `button` roles; use `getByRole("radio", { name: /ES/i })` or translated aria-labels when updating tests.
5. **Content edits require rebundling.** After changing MDX under `content/`, run `npm run content:bundle` (or `npm run build`).

### Hello-world verification

1. `npm run dev`
2. Open http://127.0.0.1:3000/en
3. Navigate to **Learn** → open a lesson → visit **Dashboard**

This exercises routing, MDX content, i18n, and client-side state.
