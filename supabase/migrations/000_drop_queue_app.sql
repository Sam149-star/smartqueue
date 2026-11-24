-- =====================================================================
-- 000_drop_queue_app.sql: Cleanly drop old queue tables, triggers and RPCs
-- =====================================================================

drop function if exists public.reset_queue(uuid) cascade;
drop function if exists public.simulate_crowd(uuid, int) cascade;
drop function if exists public.set_queue_status(uuid, text) cascade;
drop function if exists public.issue_walkin(uuid, text) cascade;
drop function if exists public.skip_current(uuid) cascade;
drop function if exists public.call_next(uuid) cascade;
drop function if exists public.create_queue(text, text, text, int, int) cascade;
drop function if exists public.cancel_token(uuid) cascade;
drop function if exists public.join_queue(uuid, text) cascade;
drop function if exists public._issue(uuid, uuid, text) cascade;

drop table if exists public.tokens cascade;
drop table if exists public.queues cascade;
