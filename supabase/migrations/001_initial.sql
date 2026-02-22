-- Profiles: one per auth user (display name for team view)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User progress: one row per user, JSON for all 10 weeks
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '[]',
  updated_at timestamptz default now()
);

-- Teams: invite_code is used to join
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Team membership
create table if not exists public.team_members (
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (team_id, user_id)
);

-- Create profile on signup
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

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- Profiles: read own + read teammates
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can read teammates profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.team_members tm
      where tm.user_id = profiles.id
      and tm.team_id in (
        select team_id from public.team_members where user_id = auth.uid()
      )
    )
  );

-- User progress: read/write own; read teammates
create policy "Users can read own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for all
  using (auth.uid() = user_id);

create policy "Users can read teammates progress"
  on public.user_progress for select
  using (
    exists (
      select 1 from public.team_members tm
      where tm.user_id = user_progress.user_id
      and tm.team_id in (
        select team_id from public.team_members where user_id = auth.uid()
      )
    )
  );

-- Teams: members can read their teams
create policy "Members can read team"
  on public.teams for select
  using (
    exists (
      select 1 from public.team_members
      where team_id = teams.id and user_id = auth.uid()
    )
  );

create policy "Anyone can create team"
  on public.teams for insert
  with check (true);

create policy "Creator can update own team"
  on public.teams for update
  using (created_by = auth.uid());

-- Team members: members can read; creator can insert
create policy "Members can read team_members"
  on public.team_members for select
  using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_members.team_id and tm.user_id = auth.uid()
    )
  );

create policy "Team creator can add members"
  on public.team_members for insert
  with check (
    exists (
      select 1 from public.teams t
      where t.id = team_id and t.created_by = auth.uid()
    )
  );

create policy "User can join team by adding self"
  on public.team_members for insert
  with check (user_id = auth.uid());

create policy "User can leave team"
  on public.team_members for delete
  using (user_id = auth.uid());

-- Join team by invite code (returns team id or error)
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
