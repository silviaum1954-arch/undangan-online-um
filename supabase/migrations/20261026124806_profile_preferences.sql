-- Account preferences (language, timezone, notification toggles) live on the
-- profile. Existing RLS (own row only) already covers this column.
alter table public.profiles
  add column preferences jsonb not null default '{}'::jsonb;
