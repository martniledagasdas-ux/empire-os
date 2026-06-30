create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  follow_up_date date not null,
  status text not null default 'Scheduled' check (status in ('Scheduled', 'Completed', 'Overdue')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.follow_ups enable row level security;

create policy "Allow read access for authenticated users"
  on public.follow_ups
  for select
  using (auth.role() = 'authenticated');

create policy "Allow insert for authenticated users"
  on public.follow_ups
  for insert
  with check (auth.role() = 'authenticated');

create policy "Allow update for authenticated users"
  on public.follow_ups
  for update
  using (auth.role() = 'authenticated');

create policy "Allow delete for authenticated users"
  on public.follow_ups
  for delete
  using (auth.role() = 'authenticated');
