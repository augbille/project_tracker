-- Fix: allow team creator to read their own team (so .insert().select() returns the new row).
-- Run this in Supabase SQL Editor if "Create team" was failing.
drop policy if exists "Creator can read own team" on public.teams;
create policy "Creator can read own team"
  on public.teams for select
  using (created_by = auth.uid());
