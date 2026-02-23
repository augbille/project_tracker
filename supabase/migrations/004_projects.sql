-- =============================================================================
-- Projects schema — Strava-style project sharing with teams
-- =============================================================================

-- Projects: user shares a project with a team (like Strava activity)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  name text not null,
  description text,
  link text,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_team_id_idx on public.projects(team_id);
create index if not exists projects_created_at_idx on public.projects(created_at desc);

-- RLS
alter table public.projects enable row level security;

-- Users can CRUD own projects
create policy "Users can read own projects"
  on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects"
  on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects"
  on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects"
  on public.projects for delete using (auth.uid() = user_id);

-- Teammates can read projects shared to their teams
create policy "Teammates can read team projects"
  on public.projects for select using (
    team_id is not null
    and exists (
      select 1 from public.team_members tm
      where tm.team_id = projects.team_id
      and tm.user_id = auth.uid()
    )
  );
