-- Coverage for dashboard progress queries joining quiz_attempts by user + quiz.
create index if not exists idx_quiz_attempts_user_quiz
  on public.quiz_attempts(user_id, quiz_id);

-- Activity feed ordering: chronological reads per user.
create index if not exists idx_lesson_progress_user_completed_at
  on public.lesson_progress(user_id, completed_at desc);

-- Streak history: per-user activity date range scans.
create index if not exists idx_daily_log_user_activity_date
  on public.daily_log(user_id, activity_date desc);
