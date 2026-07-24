-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)
-- Enables the extension used for UUID generation
create extension if not exists "pgcrypto";

-- Categories: broad buckets like "Cancellations", "Claims", "New business"
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- One row per person. Supabase Auth creates the underlying auth.users row;
-- this table holds the agency-specific profile info (name, role) tied to it.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'staff', -- e.g. 'producer', 'csr', 'admin' — used for onboarding tracks, not access control
  created_at timestamptz not null default now()
);

-- The procedures themselves. `content` always holds the CURRENT version —
-- this is what search and the read view use.
create table procedures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category_id uuid references categories (id) on delete set null,
  aka_terms text, -- comma-separated alternate search terms, e.g. "NOC, non-renewal, cancellation notice"
  created_by uuid references profiles (id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Full-text search index — this is what makes "30 day cancellation notice" fast to find.
-- Weights title + aka_terms higher than body content.
alter table procedures add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(aka_terms, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) stored;

create index procedures_search_idx on procedures using gin (search_vector);

-- Every save creates a row here BEFORE overwriting procedures.content,
-- so you can always see who changed what and revert if needed.
create table procedure_versions (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references procedures (id) on delete cascade,
  content text not null,
  edited_by uuid references profiles (id),
  edited_at timestamptz not null default now()
);

-- Onboarding checklist items, grouped by role, each pointing at a procedure
create table onboarding_steps (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  procedure_id uuid not null references procedures (id) on delete cascade,
  step_order int not null default 0
);

-- Tracks which onboarding steps a given new hire has completed
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  step_id uuid not null references onboarding_steps (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, step_id)
);

-- Row Level Security: everyone who's logged in (any agency employee) can
-- read and write everything. No admin-only gating, per the "anyone can add
-- to it" requirement — the version history is the safety net instead.
alter table profiles enable row level security;
alter table categories enable row level security;
alter table procedures enable row level security;
alter table procedure_versions enable row level security;
alter table onboarding_steps enable row level security;
alter table user_progress enable row level security;

create policy "logged in users can read profiles" on profiles for select using (auth.uid() is not null);
create policy "users can update own profile" on profiles for update using (auth.uid() = id);
create policy "users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "logged in users full access categories" on categories for all using (auth.uid() is not null);
create policy "logged in users full access procedures" on procedures for all using (auth.uid() is not null);
create policy "logged in users full access versions" on procedure_versions for all using (auth.uid() is not null);
create policy "logged in users full access steps" on onboarding_steps for all using (auth.uid() is not null);
create policy "logged in users full access progress" on user_progress for all using (auth.uid() is not null);

-- Seed a few starter categories
insert into categories (name) values
  ('Cancellations'), ('Claims'), ('New business'), ('Renewals'), ('Billing'), ('General');
