create table public.lesson_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text not null,
  completed boolean default false not null,
  completed_at timestamptz,
  time_spent_seconds integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "Users can manage their own lesson progress"
  on public.lesson_progress for all
  using (auth.uid() = user_id);
