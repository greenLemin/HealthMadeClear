create table public.streaks (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  current_streak integer default 0 not null,
  longest_streak integer default 0 not null,
  last_activity_date date,
  updated_at timestamptz default now() not null
);

alter table public.streaks enable row level security;

create policy "Users can manage their own streak"
  on public.streaks for all
  using (auth.uid() = user_id);
