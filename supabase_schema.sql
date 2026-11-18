-- =====================================================================
-- Smart Virtual Queue — Supabase schema (run once in SQL Editor)
-- Design: ONE public row per queue carries all live state, so every
-- "call next" is a single UPDATE => one realtime event per viewer.
-- =====================================================================

-- ---------- tables ----------
create table if not exists public.queues (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  location         text,
  prefix           text not null default 'A',
  status           text not null default 'open' check (status in ('open','paused','closed')),
  last_issued      int  not null default 0,          -- highest token number handed out
  now_serving      int  not null default 0,          -- number currently / last called
  void_numbers     int[] not null default '{}',      -- cancelled numbers (keeps positions exact)
  avg_service_secs int  not null default 300,        -- EMA of service time
  serving_since    timestamptz,                      -- when now_serving was called
  max_capacity     int,
  created_at       timestamptz not null default now()
);

create table if not exists public.tokens (
  id             uuid primary key default gen_random_uuid(),
  queue_id       uuid not null references public.queues(id) on delete cascade,
  user_id        uuid references auth.users(id) on delete set null,   -- NULL = walk-in / simulated
  number         int  not null,
  display_name   text,
  status         text not null default 'waiting'
                 check (status in ('waiting','serving','done','skipped','cancelled')),
  ahead_at_join  int  not null default 0,
  created_at     timestamptz not null default now(),
  called_at      timestamptz,
  completed_at   timestamptz,
  unique (queue_id, number)
);

-- one active token per user per queue (NULL user_id = walk-ins are exempt)
create unique index if not exists one_active_token
  on public.tokens (queue_id, user_id)
  where status in ('waiting','serving') and user_id is not null;
create index if not exists tokens_q_status_num on public.tokens (queue_id, status, number);
create index if not exists tokens_user on public.tokens (user_id, created_at desc);

-- ---------- row level security ----------
alter table public.queues enable row level security;
alter table public.tokens enable row level security;

drop policy if exists "queues public read" on public.queues;
create policy "queues public read" on public.queues for select using (true);

drop policy if exists "own or owner tokens" on public.tokens;
create policy "own or owner tokens" on public.tokens for select using (
  user_id = auth.uid()
  or exists (select 1 from public.queues q where q.id = queue_id and q.owner_id = auth.uid())
);
-- No insert/update/delete policies on purpose: every write goes through the RPCs below.

-- ---------- internal helper (not callable from the API) ----------
create or replace function public._issue(p_queue uuid, p_user uuid, p_name text)
returns public.tokens
language plpgsql security definer set search_path = public as $$
declare q public.queues; t public.tokens; v_ahead int;
begin
  -- the row lock taken here serialises concurrent joins => gap-free numbers
  update public.queues set last_issued = last_issued + 1
   where id = p_queue and status = 'open'
     and (max_capacity is null or last_issued - now_serving < max_capacity)
  returning * into q;
  if not found then raise exception 'queue_unavailable'; end if;

  select count(*) into v_ahead from public.tokens
   where queue_id = p_queue and status in ('waiting','serving');

  insert into public.tokens (queue_id, user_id, number, display_name, ahead_at_join)
  values (p_queue, p_user, q.last_issued, p_name, v_ahead)
  returning * into t;
  return t;   -- any error (e.g. duplicate active token) rolls the increment back too
end $$;

-- ---------- user RPCs ----------
create or replace function public.join_queue(p_queue uuid, p_name text default null)
returns public.tokens
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  return public._issue(p_queue, auth.uid(), p_name);
end $$;

create or replace function public.cancel_token(p_token uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare t public.tokens;
begin
  update public.tokens set status = 'cancelled', completed_at = now()
   where id = p_token and user_id = auth.uid() and status = 'waiting'
  returning * into t;
  if not found then raise exception 'cannot_cancel'; end if;
  update public.queues set void_numbers = array_append(void_numbers, t.number)
   where id = t.queue_id;
end $$;

-- ---------- provider RPCs ----------
create or replace function public.create_queue(
  p_name text, p_location text default null, p_prefix text default 'A', p_capacity int default null)
returns public.queues
language plpgsql security definer set search_path = public as $$
declare q public.queues;
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'provider_login_required';
  end if;
  insert into public.queues (owner_id, name, location, prefix, max_capacity)
  values (auth.uid(), p_name, p_location, upper(left(coalesce(p_prefix,'A'),2)), p_capacity)
  returning * into q;
  return q;
end $$;

-- Complete the serving token (updates EMA), promote the next waiter.
-- Exactly ONE update on `queues` => one realtime event per subscriber.
create or replace function public.call_next(p_queue uuid)
returns public.tokens
language plpgsql security definer set search_path = public as $$
declare q public.queues; cur public.tokens; nxt public.tokens;
        new_avg int; has_next boolean := false;
begin
  select * into q from public.queues where id = p_queue and owner_id = auth.uid() for update;
  if not found then raise exception 'not_authorized'; end if;
  new_avg := q.avg_service_secs;

  update public.tokens set status = 'done', completed_at = now()
   where queue_id = p_queue and status = 'serving'
  returning * into cur;
  if found and cur.called_at is not null then
    new_avg := greatest(30, round(0.7 * q.avg_service_secs
                 + 0.3 * extract(epoch from (cur.completed_at - cur.called_at))))::int;
  end if;

  select * into nxt from public.tokens
   where queue_id = p_queue and status = 'waiting'
   order by number limit 1 for update skip locked;
  if found then
    has_next := true;
    update public.tokens set status = 'serving', called_at = now()
     where id = nxt.id returning * into nxt;
  end if;

  update public.queues
     set now_serving      = case when has_next then nxt.number else now_serving end,
         serving_since    = case when has_next then now() else null end,
         avg_service_secs = new_avg
   where id = p_queue;

  return case when has_next then nxt else null end;
end $$;

-- No-show: mark the serving token skipped (no EMA update) and call the next one.
create or replace function public.skip_current(p_queue uuid)
returns public.tokens
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.queues where id = p_queue and owner_id = auth.uid()) then
    raise exception 'not_authorized';
  end if;
  update public.tokens set status = 'skipped', completed_at = now()
   where queue_id = p_queue and status = 'serving';
  return public.call_next(p_queue);
end $$;

create or replace function public.issue_walkin(p_queue uuid, p_name text default null)
returns public.tokens
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.queues where id = p_queue and owner_id = auth.uid()) then
    raise exception 'not_authorized';
  end if;
  return public._issue(p_queue, null, coalesce(p_name, 'Walk-in'));
end $$;

create or replace function public.set_queue_status(p_queue uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('open','paused','closed') then raise exception 'bad_status'; end if;
  update public.queues set status = p_status where id = p_queue and owner_id = auth.uid();
  if not found then raise exception 'not_authorized'; end if;
end $$;

-- ---------- demo helpers ----------
-- Bulk fake crowd: ONE queue update + one insert => one realtime event, not N.
create or replace function public.simulate_crowd(p_queue uuid, p_n int default 20)
returns int
language plpgsql security definer set search_path = public as $$
declare q public.queues; v_ahead int;
begin
  if p_n < 1 or p_n > 200 then raise exception 'bad_count'; end if;
  select count(*) into v_ahead from public.tokens
   where queue_id = p_queue and status in ('waiting','serving');
  update public.queues set last_issued = last_issued + p_n
   where id = p_queue and owner_id = auth.uid() returning * into q;
  if not found then raise exception 'not_authorized'; end if;
  insert into public.tokens (queue_id, user_id, number, display_name, ahead_at_join)
  select p_queue, null, q.last_issued - p_n + g, 'Guest ' || g, v_ahead + g - 1
    from generate_series(1, p_n) g;
  return p_n;
end $$;

-- Wipe a queue back to zero between demo runs.
create or replace function public.reset_queue(p_queue uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.queues where id = p_queue and owner_id = auth.uid()) then
    raise exception 'not_authorized';
  end if;
  delete from public.tokens where queue_id = p_queue;
  update public.queues
     set last_issued = 0, now_serving = 0, void_numbers = '{}',
         serving_since = null, avg_service_secs = 300, status = 'open'
   where id = p_queue;
end $$;

-- ---------- grants: only signed-in (incl. anonymous) users may call RPCs ----------
revoke all on function public._issue(uuid,uuid,text)            from public, anon, authenticated;
revoke all on function public.join_queue(uuid,text)             from public, anon;
revoke all on function public.cancel_token(uuid)                from public, anon;
revoke all on function public.create_queue(text,text,text,int)  from public, anon;
revoke all on function public.call_next(uuid)                   from public, anon;
revoke all on function public.skip_current(uuid)                from public, anon;
revoke all on function public.issue_walkin(uuid,text)           from public, anon;
revoke all on function public.set_queue_status(uuid,text)       from public, anon;
revoke all on function public.simulate_crowd(uuid,int)          from public, anon;
revoke all on function public.reset_queue(uuid)                 from public, anon;
grant execute on function
  public.join_queue(uuid,text), public.cancel_token(uuid),
  public.create_queue(text,text,text,int), public.call_next(uuid),
  public.skip_current(uuid), public.issue_walkin(uuid,text),
  public.set_queue_status(uuid,text), public.simulate_crowd(uuid,int),
  public.reset_queue(uuid)
to authenticated;

-- ---------- realtime ----------
alter publication supabase_realtime add table public.queues, public.tokens;
