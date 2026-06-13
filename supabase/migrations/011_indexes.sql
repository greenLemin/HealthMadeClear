create index if not exists idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index if not exists idx_quiz_attempts_user_attempted_at on public.quiz_attempts(user_id, attempted_at desc);
create index if not exists idx_contact_submissions_created_at on public.contact_submissions(created_at desc);