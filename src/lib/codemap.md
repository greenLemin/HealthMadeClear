# src/lib/

## Responsibility

Core business logic and utility library — content loading, i18n utilities, Supabase clients, auth, progress, preferences, analytics.

## Key Files

- `i18n.ts`: Type-safe locale utilities — `Locale` type, formatLevel, getCategoryLabel, formatRelativeDate, formatMemberSince
- `locale.ts`: Locale validation — `parseLocale`, `requireLocale`
- `content.ts`: Content access facade — wraps loaders with filtering, path progress calculations
- `preferences.ts`: User preference management — localStorage read/write, cookie sync, bootstrap script for SSR hydration. Manages theme, textSize, simpleMode, completedLessons, quizScores
- `site.ts`: Returns site URL from `NEXT_PUBLIC_SITE_URL` env var
- `lessonListItem.ts`: Converts Lesson to LessonListItem (subset of fields)
- `localizedContent.ts`: Thin facade over content loaders
- `localizedQuiz.ts`: Quiz loading by locale — `getQuizByLessonId`, `getAllQuizzes`
- `lessonVisuals.ts`: Category-to-emoji/gradient mapping
- `analytics.ts`: Analytics tracking stub (console.log in dev, not wired to production)
- `achievements.ts`: Achievement definitions and check/award logic against Supabase
- `streaks.ts`: Learning streak tracking against Supabase (milestone notifications at 3/7/14/21/30 days)
- `dashboard.ts`: Dashboard data queries — progress summary, learning paths, recent activity, achievements, recommendations, quiz performance, daily logs, paginated lesson history
- `notifications.ts`: In-app notification CRUD against Supabase
- `progressExport.ts`: Progress import/export (JSON format, v1/v2 compatible)
- `guestProgress.ts`: Guest (unauthenticated) progress in sessionStorage + migration to Supabase
- `errorReporting.ts`: Error boundary reporting utility

## Subdirectories

| Directory   | Responsibility                                                                   |
| ----------- | -------------------------------------------------------------------------------- |
| `lessons/`  | Lesson data loading and MDX parsing                                              |
| `paths/`    | Learning path loading and MDX parsing                                            |
| `quizzes/`  | Quiz MDX parsing                                                                 |
| `articles/` | Article loading and MDX parsing                                                  |
| `glossary/` | Glossary loading, MDX parsing, and inline highlighter cache                      |
| `auth/`     | Server-side auth guards and redirect sanitization                                |
| `supabase/` | Supabase client factories (browser, server, middleware), mock client, env config |

## Integration

- Consumed by: All page components, hooks, and scripts
- Depends on: `src/data/` for bundled content, `src/types/` for type definitions
- Depends on: `@supabase/ssr`, `@supabase/supabase-js` for database operations
