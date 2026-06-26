# src/app/[locale]/dashboard/

## Responsibility

User dashboard pages — progress overview, achievements, settings.

## Sub-routes

- `page.tsx`: Dashboard home — summary stats, recent activity, recommended next lesson
- `progress/page.tsx`: Detailed lesson completion history with pagination
- `achievements/page.tsx`: Achievement gallery (earned/locked)
- `settings/page.tsx`: User profile settings, progress export/import

## Data Flow

1. Server components call `src/lib/dashboard.ts` functions (getUserProgressSummary, getRecentActivity, etc.)
2. Queries read from Supabase tables (lesson_progress, quiz_attempts, streaks, achievements)
3. Client components use `useProgress` hook for marking lessons/quiz completion

## Integration

- Depends on: `src/lib/dashboard.ts`, `src/lib/progressExport.ts`, `src/lib/supabase/`
- Consumed by: Authenticated users navigating to `/dashboard/*`
