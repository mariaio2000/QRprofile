-- Add template columns to profiles table
alter table public.profiles
  add column if not exists template_id text,
  add column if not exists template_settings jsonb;

-- Create leads table for "Connect" submissions
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text,
  email text,
  phone text,
  message text,
  source text default 'qr',
  created_at timestamptz default now()
);

-- Enable RLS on leads table
alter table public.leads enable row level security;

-- Create policies for leads table
create policy "Users can view their own leads" on public.leads
  for select using (
    profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  );

create policy "Anyone can create leads" on public.leads
  for insert with check (true);

-- Add indexes for performance
create index if not exists idx_leads_profile_id on public.leads(profile_id);
create index if not exists idx_leads_created_at on public.leads(created_at);
create index if not exists idx_profiles_template_id on public.profiles(template_id);
