-- =====================================================================
-- 001_profiles.sql: User profiles, private contacts, signup trigger, RLS, set_my_roles
-- =====================================================================

-- 1. Profiles table
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text,
  roles            text[] not null default '{}' check (roles <@ array['donor','receiver','verifier']),
  city             text,
  onboarding_step  text not null default 'initial',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2. Private contacts table (never exposed in public directory or anon queries)
create table if not exists public.private_contacts (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  phone            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.private_contacts enable row level security;

-- Profiles RLS policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Hard safety constraint: users cannot alter roles directly via table update
    and roles is not distinct from (select p.roles from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert
  with check (auth.uid() = id);

-- Private contacts RLS policies (Strict owner-only access)
drop policy if exists "private_contacts_select_own" on public.private_contacts;
create policy "private_contacts_select_own" on public.private_contacts
  for select
  using (auth.uid() = user_id);

drop policy if exists "private_contacts_update_own" on public.private_contacts;
create policy "private_contacts_update_own" on public.private_contacts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "private_contacts_insert_own" on public.private_contacts;
create policy "private_contacts_insert_own" on public.private_contacts
  for insert
  with check (auth.uid() = user_id);

-- 3. Signup Trigger on auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_city text;
  v_phone text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_city := new.raw_user_meta_data->>'city';
  v_phone := new.raw_user_meta_data->>'phone';

  insert into public.profiles (id, full_name, city, onboarding_step)
  values (new.id, v_name, v_city, 'initial')
  on conflict (id) do update
  set full_name = coalesce(public.profiles.full_name, excluded.full_name),
      city = coalesce(public.profiles.city, excluded.city),
      updated_at = now();

  if v_phone is not null and length(trim(v_phone)) > 0 then
    insert into public.private_contacts (user_id, phone)
    values (new.id, trim(v_phone))
    on conflict (user_id) do update
    set phone = excluded.phone,
        updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. RPC set_my_roles that strictly rejects 'verifier'
create or replace function public.set_my_roles(p_roles text[])
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_updated_roles text[];
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Strictly reject self-escalation to 'verifier'
  if 'verifier' = any(p_roles) then
    raise exception 'Cannot self-assign verifier role. Verifier access is restricted and granted by administrators only.';
  end if;

  -- Ensure all requested roles are valid
  if not (p_roles <@ array['donor','receiver']) then
    raise exception 'Invalid role requested. Permitted roles are donor and receiver.';
  end if;

  update public.profiles
  set roles = p_roles,
      updated_at = now()
  where id = v_uid
  returning roles into v_updated_roles;

  return v_updated_roles;
end;
$$;

-- 5. RPC update_my_profile (safe profile + contact update)
create or replace function public.update_my_profile(
  p_full_name text default null,
  p_city text default null,
  p_phone text default null,
  p_onboarding_step text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_profile public.profiles;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set full_name = coalesce(p_full_name, full_name),
      city = coalesce(p_city, city),
      onboarding_step = coalesce(p_onboarding_step, onboarding_step),
      updated_at = now()
  where id = v_uid
  returning * into v_profile;

  if p_phone is not null then
    insert into public.private_contacts (user_id, phone)
    values (v_uid, trim(p_phone))
    on conflict (user_id) do update
    set phone = excluded.phone,
        updated_at = now();
  end if;

  return v_profile;
end;
$$;

-- Demo Verifier helper:
-- To grant verifier role to an account (e.g. verifier@raktify.internal):
-- update public.profiles set roles = array_append(roles, 'verifier') where id = '<user-id>';
