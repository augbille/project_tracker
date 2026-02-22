-- =============================================================================
-- AI 10 Workshop — full reset and setup
-- Run this once in Supabase SQL Editor to create (or recreate) the whole schema.
-- =============================================================================

-- 1. Drop existing objects (CASCADE drops policies that reference other tables)
-- -----------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.join_team_by_code(text);
drop function if exists public.ensure_my_profile();
drop function if exists public.is_team_member(uuid);
drop table if exists public.team_members CASCADE;
drop table if exists public.teams CASCADE;
drop table if exists public.user_progress CASCADE;
drop table if exists public.profiles CASCADE;

-- 2. Tables
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '[]',
  updated_at timestamptz default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table public.team_members (
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (team_id, user_id)
);

-- 3. Helper: check team membership without triggering RLS (avoids recursion)
-- -----------------------------------------------------------------------------
create or replace function public.is_team_member(team_uuid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.team_members where team_id = team_uuid and user_id = auth.uid());
$$;

-- 4. Trigger: create profile + progress row on signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_progress (user_id, progress)
  values (new.id, '[]');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. RLS
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- Profiles
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can read teammates profiles"
  on public.profiles for select using (
    exists (
      select 1 from public.team_members tm
      where tm.user_id = profiles.id
      and tm.team_id in (select team_id from public.team_members where user_id = auth.uid())
    )
  );

-- User progress
create policy "Users can read own progress"
  on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can update own progress"
  on public.user_progress for all using (auth.uid() = user_id);
create policy "Users can read teammates progress"
  on public.user_progress for select using (
    exists (
      select 1 from public.team_members tm
      where tm.user_id = user_progress.user_id
      and tm.team_id in (select team_id from public.team_members where user_id = auth.uid())
    )
  );

-- Teams (includes Creator can read own team so .insert().select() works)
create policy "Members can read team"
  on public.teams for select using (public.is_team_member(teams.id));
create policy "Creator can read own team"
  on public.teams for select using (created_by = auth.uid());
create policy "Anyone can create team"
  on public.teams for insert with check (true);
create policy "Creator can update own team"
  on public.teams for update using (created_by = auth.uid());

-- Team members (use helper to avoid recursion: policy on team_members can't query team_members)
create policy "Members can read team_members"
  on public.team_members for select using (public.is_team_member(team_id));
create policy "Team creator can add members"
  on public.team_members for insert with check (
    exists (select 1 from public.teams t where t.id = team_id and t.created_by = auth.uid())
  );
create policy "User can join team by adding self"
  on public.team_members for insert with check (user_id = auth.uid());
create policy "User can leave team"
  on public.team_members for delete using (user_id = auth.uid());

-- 6. Join team by invite code (RPC)
-- -----------------------------------------------------------------------------
create or replace function public.join_team_by_code(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  tid uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  select id into tid from teams where invite_code = trim(lower(code)) limit 1;
  if tid is null then
    raise exception 'Invalid invite code';
  end if;
  insert into team_members (team_id, user_id) values (tid, auth.uid())
  on conflict (team_id, user_id) do nothing;
  return tid;
end;
$$;

-- 7. Ensure profile exists (backfill if trigger missed, or user signed up before trigger)
-- -----------------------------------------------------------------------------
create or replace function public.ensure_my_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  select auth.uid(), coalesce(
    (select raw_user_meta_data->>'display_name' from auth.users where id = auth.uid()),
    split_part((select email from auth.users where id = auth.uid()), '@', 1)
  )
  where auth.uid() is not null
  and not exists (select 1 from public.profiles where id = auth.uid());

  insert into public.user_progress (user_id, progress)
  select auth.uid(), '[]'::jsonb
  where auth.uid() is not null
  and not exists (select 1 from public.user_progress where user_id = auth.uid());
end;
$$;
