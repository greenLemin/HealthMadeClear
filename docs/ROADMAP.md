# Roadmap

Items intentionally deferred after the comprehensive implementation pass.

## Content platform

- **MDX or headless CMS** for lessons, paths, and glossary — reduces duplication between English data files and `localizedContent.ts`
- **Clinical review workflow** — last-reviewed dates, sources, and sign-off process (operational, not only code)

## Internationalization

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
