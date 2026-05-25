# Roadmap

## Completed

- **MDX lesson content** — `content/lessons/{en,es}/*.mdx` with `:::info` / `:::warning` / `:::success` callouts
- **MDX learning paths** — `content/paths/{en,es}/*.mdx` (frontmatter: title, description, lessons, duration, level, icon)
- **MDX glossary** — `content/glossary/{en,es}/*.mdx` (frontmatter + definition body; optional `relatedTerms`)

Run `npm run content:bundle` after editing MDX (or rely on `prebuild` before production builds).

## Content platform (next)

- **Clinical review workflow** — last-reviewed dates, sources, and sign-off process (operational, not only code)

## Internationalization (next)

- **next-intl** with locale-prefixed routes (`/en`, `/es`) and hreflang metadata
- Additional locales beyond English and Spanish

## Accounts and sync

- Optional user accounts (e.g. Supabase) to sync progress across devices while keeping PHI out of scope

## Product experiments

- Restored interactive tools from the early Vite prototype (AI companion, cost calculator, etc.) — needs product decision
- Spaced repetition, reminders, and export of learning progress

## Infrastructure

- Visual regression testing for light/dark/simple/large-text modes
- Content Security Policy and security headers at the edge
- JSON-LD structured data for lessons and glossary terms
