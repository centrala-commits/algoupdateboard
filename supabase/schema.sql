-- ===========================================================================
--  AG Dispatch — Supabase schema
--  Run this once in your Supabase project: SQL Editor -> New query -> paste -> Run.
-- ===========================================================================

-- ---- Tables ----------------------------------------------------------------
create table if not exists companies (
  id          bigint generated always as identity primary key,
  name        text not null,
  board       text not null check (board in ('A', 'B')),
  created_at  timestamptz default now()
);

create table if not exists updaters (
  id          bigint generated always as identity primary key,
  nickname    text not null,
  shift       text not null check (shift in ('Day', 'Main', 'Night')),
  created_at  timestamptz default now()
);

create table if not exists drivers (
  id            bigint generated always as identity primary key,
  company_id    bigint not null references companies(id) on delete cascade,
  name          text not null,
  truck         text not null,
  eld_id        text,
  status        text not null default 'All good',
  eld_active    boolean not null default false,
  location      text default 'Fetching…',
  delivery_date date,
  is_reviewed   boolean not null default false,
  updated_by    text,
  updated_at    text,
  notes         text default '',
  created_at    timestamptz default now()
);

-- If the table already existed without `notes` (used to store the ELD link),
-- add it. Safe to run repeatedly.
alter table drivers add column if not exists notes text default '';

create index if not exists drivers_company_id_idx on drivers(company_id);

-- ---- Row Level Security ----------------------------------------------------
-- NOTE: these policies let the public "anon" key read AND write. That key ships
-- in the browser bundle, so anyone with the site URL can change data. That is
-- fine for a small private/internal tool, but to truly lock it down later,
-- enable Supabase Auth and replace these with policies keyed to auth.uid().
alter table companies enable row level security;
alter table updaters  enable row level security;
alter table drivers   enable row level security;

drop policy if exists "anon all" on companies;
drop policy if exists "anon all" on updaters;
drop policy if exists "anon all" on drivers;

create policy "anon all" on companies for all using (true) with check (true);
create policy "anon all" on updaters  for all using (true) with check (true);
create policy "anon all" on drivers   for all using (true) with check (true);

-- ---- Seed data (optional — delete this block to start empty) ---------------
insert into companies (name, board) values
  ('FastRoute Logistics', 'A'),
  ('Eagle Transport', 'A'),
  ('Horizon Freight', 'A'),
  ('Atlas Shipping', 'A'),
  ('Summit Carriers', 'B'),
  ('Pacific Movers', 'B'),
  ('Midwest Express', 'B');

insert into updaters (nickname, shift) values
  ('Alex', 'Day'), ('Jordan', 'Day'), ('Taylor', 'Day'), ('Mike O.', 'Day'), ('Sara K.', 'Day'),
  ('Sam', 'Main'), ('Casey', 'Main'), ('Quinn', 'Main'), ('Chris B.', 'Main'),
  ('Riley', 'Night'), ('Morgan', 'Night'), ('Drew', 'Night'), ('Dana W.', 'Night');

-- A few starter drivers (company_id references the order inserted above)
insert into drivers (company_id, name, truck, eld_id, status, eld_active, location) values
  (1, 'Mike Johnson', 'TRK-001', 'ELD-001', 'All good', true, 'Chicago, IL'),
  (1, 'Sarah Williams', 'TRK-002', 'ELD-002', 'Need to check', false, 'Detroit, MI'),
  (1, 'Robert Davis', 'TRK-003', 'ELD-003', 'All good', true, 'Indianapolis, IN'),
  (2, 'James Wilson', 'TRK-010', 'ELD-010', 'All good', true, 'Columbus, OH'),
  (2, 'Linda Martinez', 'TRK-011', 'ELD-011', 'Offline', false, 'Pittsburgh, PA'),
  (3, 'Chris Thompson', 'TRK-020', 'ELD-020', 'Need to check', true, 'St. Louis, MO'),
  (5, 'Kevin Hall', 'TRK-040', 'ELD-040', 'All good', true, 'Denver, CO'),
  (6, 'Michelle Lee', 'TRK-050', 'ELD-050', 'All good', true, 'Los Angeles, CA');
