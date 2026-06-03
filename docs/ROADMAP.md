# Roadmap

## Completed

- **MDX lesson content** — `content/lessons/{en,es}/*.mdx` with `:::info` / `:::warning` / `:::success` callouts
- **MDX learning paths** — `content/paths/{en,es}/*.mdx`
- **MDX glossary** — `content/glossary/{en,es}/*.mdx`
- **Locale-prefixed routes** — `/en` and `/es` via `next-intl`, hreflang alternates in metadata and sitemap

Run `npm run content:bundle` after editing MDX (or rely on `prebuild` before production builds).

## Content platform (next)

- **Clinical review workflow** — last-reviewed dates, sources, and sign-off process (operational, not only code)

## Internationalization (next)

- Additional locales beyond English and Spanish
- Optional: migrate UI strings fully to `next-intl` `useTranslations` (messages already loaded in `src/i18n/request.ts`)

## Accounts and sync

- Optional user accounts (e.g. Supabase) to sync progress across devices while keeping PHI out of scope

## Product experiments

- Restored interactive tools from the early Vite prototype (AI companion, cost calculator, etc.) — needs product decision
- Spaced repetition, reminders, and export of learning progress

## Infrastructure

- ~~Visual regression testing for light/dark modes (Playwright snapshots)~~
- ~~Content Security Policy and security headers at the edge~~
- ~~JSON-LD structured data for lessons and glossary terms~~
- Glossary term routes at `/[locale]/glossary/[term]`
- Progress export/import on dashboard (local JSON)
