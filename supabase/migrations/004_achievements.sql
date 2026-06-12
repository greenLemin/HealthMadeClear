create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_id text not null,
  earned_at timestamptz default now() not null,
  unique(user_id, achievement_id)
);

alter table public.achievements enable row level security;

create policy "Users can view their own achievements"
  on public.achievements for all
  using (auth.uid() = user_id);
