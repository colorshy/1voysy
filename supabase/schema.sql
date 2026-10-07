-- ========================================================
-- Supabase PostgreSQL Schema: contact_submissions
-- Enables secure anonymous form submissions with Row Level Security
-- ========================================================

-- 1. Create table
create table if not exists public.contact_submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  telegram_phone text,
  discipline_reason text default 'Freelance project / Collaboration',
  message text not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.contact_submissions enable row level security;

-- 3. Policy: Allow anonymous visitors to INSERT submissions only
drop policy if exists "Allow anonymous insert" on public.contact_submissions;
create policy "Allow anonymous insert"
  on public.contact_submissions
  for insert
  to anon
  with check (true);

-- 4. Note on SELECT / Read access:
-- Because RLS is enabled and NO policy is granted to anon for SELECT,
-- anonymous visitors and frontend clients CANNOT read, list, or inspect submissions.
-- Only authenticated admins or service-role in Supabase dashboard can read submissions.
