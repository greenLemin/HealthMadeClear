# supabase/migrations/

## Responsibility

Database schema migrations for Supabase PostgreSQL.

## Tables

- `profiles`: User profile data (display_name, avatar_url, timestamps)
- `lesson_progress`: Completed lessons per user (lesson_id, completed_at, time_spent)
- `quiz_attempts`: Quiz results per user (quiz_id, score, max_score, passed, answers JSON)
- `achievements`: Earned achievements per user (achievement_id, earned_at)
- `streaks`: Learning streak tracking (current_streak, longest_streak, last_activity_date)
- `daily_log`: Daily activity log (activity_date)
- `notifications`: In-app notifications (type, title, body, read, created_at)

## Integration

- Consumed by: `src/lib/supabase/` clients, `src/lib/dashboard.ts`, `src/lib/achievements.ts`, etc.
- Applied via: `supabase migration up`
