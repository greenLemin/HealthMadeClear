create table public.quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quiz_id text not null,
  score integer not null,
  max_score integer not null,
  passed boolean not null,
  answers jsonb,
  attempted_at timestamptz default now() not null
);

alter table public.quiz_attempts enable row level security;

create policy "Users can manage their own quiz attempts"
  on public.quiz_attempts for all
  using (auth.uid() = user_id);
