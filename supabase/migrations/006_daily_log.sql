create table public.daily_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_date date not null,
  created_at timestamptz default now() not null,
  unique(user_id, activity_date)
);

alter table public.daily_log enable row level security;

create policy "Users can manage their own daily log"
  on public.daily_log for all
  using (auth.uid() = user_id);
