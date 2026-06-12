create table public.contact_submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text not null default 'general',
  message text not null,
  created_at timestamptz default now() not null
);

alter table public.contact_submissions enable row level security;

create policy "Only service role can read contact submissions"
  on public.contact_submissions for select
  using (false);

create policy "Anyone can insert contact submissions"
  on public.contact_submissions for insert
  with check (true);
