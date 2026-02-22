-- 1) Backfill: create profile + user_progress for any auth.users that don't have a row.
--    Run in SQL Editor (runs as superuser, so RLS doesn't block).
-- 2) RPC: app can call ensure_my_profile() so missing profiles are created on next login.

insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

insert into public.user_progress (user_id, progress)
select u.id, '[]'::jsonb
from auth.users u
where not exists (select 1 from public.user_progress up where up.user_id = u.id);

-- RPC: ensure current user has profile and user_progress (no-op if they already exist)
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
