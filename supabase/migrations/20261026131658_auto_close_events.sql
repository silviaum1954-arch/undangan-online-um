-- "Tandai selesai otomatis" (Pengaturan): move published events to `selesai`
-- once their closing time has passed. Runs every 15 minutes via pg_cron.
--
-- close_timing values (Asia/Jakarta, WIB):
--   h1_2359  day after the event, 23:59
--   h0_2200  event day, 22:00
--   h2_1200  two days after the event, 12:00

create extension if not exists pg_cron;

create schema if not exists private;

create or replace function private.auto_close_events()
returns integer
language plpgsql
set search_path = ''
as $$
declare
  n integer;
begin
  update public.events e
     set status = 'selesai'
   where e.status = 'terbit'
     and e.auto_close
     and now() >= (
       case e.close_timing
         when 'h0_2200' then (e.event_date::timestamp + interval '22 hours')
         when 'h2_1200' then (e.event_date::timestamp + interval '2 days 12 hours')
         else               (e.event_date::timestamp + interval '1 day 23 hours 59 minutes')
       end
     ) at time zone 'Asia/Jakarta';

  get diagnostics n = row_count;
  return n;
end;
$$;

-- Never callable from the Data API: it lives in a non-exposed schema and only
-- the scheduler (postgres) runs it.
revoke all on function private.auto_close_events() from public, anon, authenticated;

select cron.unschedule('auto-close-events')
 where exists (select 1 from cron.job where jobname = 'auto-close-events');

select cron.schedule(
  'auto-close-events',
  '*/15 * * * *',
  $job$ select private.auto_close_events(); $job$
);
