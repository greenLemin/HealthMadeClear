# src/app/[locale]/

## Responsibility

Locale-aware pages and layout for Health Made Clear. Dynamic segment `[locale]` enables EN/ES routing.

## Key Files

- `layout.tsx`: Root locale layout — `NextIntlClientProvider`, `AppProviders`, `AuthProvider`, Header, Footer, metadata/SEO, preference bootstrap script
- `page.tsx`: Home page (SSG) — loads lessons, learning paths, renders `HomeClient` + `JsonLd` schema
- `HomeClient.tsx`: Client component for home page interactivity
- `error.tsx`: Locale-aware error boundary
- `not-found.tsx`: Locale-aware 404 page

## Routes

| Route                      | Page                               | Purpose                                                                        |
| -------------------------- | ---------------------------------- | ------------------------------------------------------------------------------ |
| `/`                        | `page.tsx`                         | Home with hero, featured lessons, learning paths                               |
| `/learn`                   | `learn/page.tsx`                   | Lesson catalog                                                                 |
| `/learn/[slug]`            | `learn/[slug]/page.tsx`            | Lesson detail                                                                  |
| `/learn/[slug]/quiz`       | `learn/[slug]/quiz/page.tsx`       | Lesson quiz                                                                    |
| `/articles`                | `articles/page.tsx`                | Article catalog                                                                |
| `/articles/[slug]`         | `articles/[slug]/page.tsx`         | Article detail                                                                 |
| `/glossary`                | `glossary/page.tsx`                | Glossary index                                                                 |
| `/glossary/[term]`         | `glossary/[term]/page.tsx`         | Glossary term detail                                                           |
| `/learning-paths`          | `learning-paths/page.tsx`          | Path catalog                                                                   |
| `/learning-paths/[pathId]` | `learning-paths/[pathId]/page.tsx` | Path detail                                                                    |
| `/dashboard`               | `dashboard/page.tsx`               | User dashboard                                                                 |
| `/dashboard/progress`      | `dashboard/progress/page.tsx`      | Detailed progress                                                              |
| `/dashboard/achievements`  | `dashboard/achievements/page.tsx`  | Achievement list                                                               |
| `/dashboard/settings`      | `dashboard/settings/page.tsx`      | User settings                                                                  |
| `/auth/*`                  | `auth/*/page.tsx`                  | Auth pages (login, signup, callback, forgot-password, reset-password, confirm) |
| `/tools/*`                 | `tools/*/page.tsx`                 | Interactive tools (visit checklist, visit planner, care guide)                 |
| `/about`                   |                                    | Static info page                                                               |
| `/accessibility`           |                                    | Accessibility statement                                                        |
| `/contact`                 |                                    | Contact form                                                                   |
| `/privacy`                 |                                    | Privacy policy                                                                 |
| `/terms`                   |                                    | Terms of service                                                               |

## Data Flow

1. SSG: `generateStaticParams` pre-renders all locales
2. Server components load bundled data from `src/lib/*/load*.ts`
3. Client interactivity via `AppProviders` context (progress, preferences)
4. Auth state via `AuthProvider` -> Supabase session

## Integration

- Depends on: `src/i18n/routing.ts` for locale config, `src/messages/` for translations
- Depends on: `src/lib/lessons/`, `src/lib/paths/`, etc. for content loading
- Depends on: `src/data/` for bundled content arrays
