-- UndangKuy: initial schema
-- Owner-side data only. Every table is protected by RLS; guests do not
-- read/write these tables directly (public invitation access comes later via
-- dedicated, narrowly-scoped functions).

------------------------------------------------------------------------------
-- Enums
------------------------------------------------------------------------------
create type public.event_status as enum ('draf', 'terbit', 'selesai', 'diarsipkan');
create type public.rsvp_status  as enum ('fiks', 'ragu', 'batal', 'pending');
create type public.wish_status  as enum ('tampil', 'disembunyikan');
create type public.account_type as enum ('bank', 'e_wallet');

------------------------------------------------------------------------------
-- Shared helpers
------------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

------------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
------------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  phone      text,
  plan       text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Creates the profile row when a user signs up. Lives in a private
-- (non-exposed) schema because SECURITY DEFINER functions in `public` would be
-- callable through the Data API.
create schema if not exists private;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

------------------------------------------------------------------------------
-- events
------------------------------------------------------------------------------
create table public.events (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null default auth.uid()
                     references public.profiles (id) on delete cascade,
  title            text not null check (char_length(title) between 1 and 200),
  slug             text not null unique
                     check (slug ~ '^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$'),
  status           public.event_status not null default 'draf',

  -- schedule & venue
  event_date       date not null,
  event_time       text,
  venue_name       text,
  venue_address    text,
  maps_url         text,

  -- invitation design (Edit undangan): free-form editor content
  theme            text not null default 'flora',
  design           jsonb not null default '{}'::jsonb,

  -- Pengaturan: lifecycle, social preview, quota
  auto_close       boolean not null default true,
  close_timing     text    not null default 'h1_2359',
  remind_archive   boolean not null default true,
  og_title         text,
  og_description   text,
  og_image_path    text,
  total_quota      integer not null default 50 check (total_quota > 0),
  max_pax          integer not null default 4  check (max_pax between 1 and 20),

  -- Ucapan settings
  wishes_auto_publish    boolean not null default true,
  wishes_manual_approval boolean not null default false,
  wishes_closed          boolean not null default false,
  wishes_spam_filter     boolean not null default true,
  wishes_char_limit      integer check (wishes_char_limit is null or wishes_char_limit > 0),

  -- Angpao settings
  gift_enabled        boolean not null default true,
  gift_personal_only  boolean not null default true,
  gift_transfer_form  boolean not null default true,
  gift_email_notify   boolean not null default false,
  qris_path           text,

  published_at     timestamptz,
  archived_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index events_owner_idx on public.events (owner_id, created_at desc);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

------------------------------------------------------------------------------
-- guests
------------------------------------------------------------------------------
create table public.guests (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events (id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 200),
  category       text,
  phone          text,
  quota          smallint not null default 2 check (quota between 1 and 20),
  status         public.rsvp_status not null default 'pending',
  adults         smallint check (adults >= 0),
  children       smallint check (children >= 0),
  -- null until the guest has responded
  attending      smallint generated always as (
                   case when adults is null and children is null then null
                        else coalesce(adults, 0) + coalesce(children, 0) end
                 ) stored,
  personal_slug  text not null,
  responded_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (event_id, personal_slug)
);

create index guests_event_status_idx on public.guests (event_id, status);

create trigger guests_set_updated_at
  before update on public.guests
  for each row execute function public.set_updated_at();

-- Enforce the per-event invitation quota configured in Pengaturan.
create function public.enforce_guest_quota()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  used  integer;
  limit_ integer;
begin
  select total_quota into limit_ from public.events where id = new.event_id;
  select count(*) into used from public.guests where event_id = new.event_id;
  if limit_ is not null and used >= limit_ then
    raise exception 'Kuota undangan penuh (% tamu)', limit_
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger guests_enforce_quota
  before insert on public.guests
  for each row execute function public.enforce_guest_quota();

------------------------------------------------------------------------------
-- wishes (buku ucapan)
------------------------------------------------------------------------------
create table public.wishes (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events (id) on delete cascade,
  guest_id     uuid references public.guests (id) on delete set null,
  sender_name  text not null check (char_length(sender_name) between 1 and 200),
  tag          text,
  message      text not null check (char_length(message) between 1 and 2000),
  status       public.wish_status not null default 'tampil',
  is_spam      boolean not null default false,
  liked        boolean not null default false,
  created_at   timestamptz not null default now()
);

create index wishes_event_created_idx on public.wishes (event_id, created_at desc);
create index wishes_event_status_idx  on public.wishes (event_id, status);
create index wishes_guest_idx         on public.wishes (guest_id);

------------------------------------------------------------------------------
-- payment_accounts (rekening & e-wallet, max 5 per event)
------------------------------------------------------------------------------
create table public.payment_accounts (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events (id) on delete cascade,
  type            public.account_type not null,
  bank_name       text not null check (char_length(bank_name) between 1 and 100),
  account_number  text not null check (char_length(account_number) between 3 and 40),
  account_holder  text not null check (char_length(account_holder) between 1 and 200),
  is_primary      boolean not null default false,
  is_active       boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index payment_accounts_event_idx on public.payment_accounts (event_id, sort_order);
-- at most one primary account per event
create unique index payment_accounts_one_primary_idx
  on public.payment_accounts (event_id) where is_primary;

create trigger payment_accounts_set_updated_at
  before update on public.payment_accounts
  for each row execute function public.set_updated_at();

create function public.enforce_account_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.payment_accounts where event_id = new.event_id) >= 5 then
    raise exception 'Maksimal 5 rekening per acara'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger payment_accounts_enforce_limit
  before insert on public.payment_accounts
  for each row execute function public.enforce_account_limit();

------------------------------------------------------------------------------
-- gift_confirmations ("Saya sudah transfer")
------------------------------------------------------------------------------
create table public.gift_confirmations (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events (id) on delete cascade,
  guest_id     uuid references public.guests (id) on delete set null,
  account_id   uuid references public.payment_accounts (id) on delete set null,
  sender_name  text not null check (char_length(sender_name) between 1 and 200),
  destination  text not null,           -- e.g. "BCA · Shilvia Anisa" or "QRIS"
  amount       bigint not null check (amount > 0),
  note         text,
  created_at   timestamptz not null default now()
);

create index gift_confirmations_event_idx   on public.gift_confirmations (event_id, created_at desc);
create index gift_confirmations_guest_idx   on public.gift_confirmations (guest_id);
create index gift_confirmations_account_idx on public.gift_confirmations (account_id);

------------------------------------------------------------------------------
-- event_photos (gallery, max 10 per event; files live in Storage)
------------------------------------------------------------------------------
create table public.event_photos (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events (id) on delete cascade,
  storage_path  text not null,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index event_photos_event_idx on public.event_photos (event_id, sort_order);

create function public.enforce_photo_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.event_photos where event_id = new.event_id) >= 10 then
    raise exception 'Maksimal 10 foto per acara'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger event_photos_enforce_limit
  before insert on public.event_photos
  for each row execute function public.enforce_photo_limit();

------------------------------------------------------------------------------
-- Row Level Security
-- Owner-only. `(select auth.uid())` is wrapped so Postgres evaluates it once
-- per statement rather than once per row.
------------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.events             enable row level security;
alter table public.guests             enable row level security;
alter table public.wishes             enable row level security;
alter table public.payment_accounts   enable row level security;
alter table public.gift_confirmations enable row level security;
alter table public.event_photos       enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "events: owner full access" on public.events
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Child tables: access follows ownership of the parent event.
create policy "guests: owner full access" on public.guests
  for all to authenticated
  using (exists (select 1 from public.events e
                 where e.id = guests.event_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.events e
                      where e.id = guests.event_id and e.owner_id = (select auth.uid())));

create policy "wishes: owner full access" on public.wishes
  for all to authenticated
  using (exists (select 1 from public.events e
                 where e.id = wishes.event_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.events e
                      where e.id = wishes.event_id and e.owner_id = (select auth.uid())));

create policy "payment_accounts: owner full access" on public.payment_accounts
  for all to authenticated
  using (exists (select 1 from public.events e
                 where e.id = payment_accounts.event_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.events e
                      where e.id = payment_accounts.event_id and e.owner_id = (select auth.uid())));

create policy "gift_confirmations: owner full access" on public.gift_confirmations
  for all to authenticated
  using (exists (select 1 from public.events e
                 where e.id = gift_confirmations.event_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.events e
                      where e.id = gift_confirmations.event_id and e.owner_id = (select auth.uid())));

create policy "event_photos: owner full access" on public.event_photos
  for all to authenticated
  using (exists (select 1 from public.events e
                 where e.id = event_photos.event_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.events e
                      where e.id = event_photos.event_id and e.owner_id = (select auth.uid())));

-- Data API access: signed-in users only; anonymous visitors get nothing.
revoke all on public.profiles, public.events, public.guests, public.wishes,
  public.payment_accounts, public.gift_confirmations, public.event_photos
  from anon;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on
  public.events, public.guests, public.wishes, public.payment_accounts,
  public.gift_confirmations, public.event_photos
  to authenticated;

------------------------------------------------------------------------------
-- Storage: one public-read bucket for invitation images (gallery, QRIS, OG).
-- Files must be uploaded under "<user id>/..." so owners can only write to
-- their own folder.
------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-media', 'event-media', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "event-media: owner can read own files" on storage.objects
  for select to authenticated
  using (bucket_id = 'event-media'
         and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "event-media: owner can upload to own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'event-media'
              and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "event-media: owner can update own files" on storage.objects
  for update to authenticated
  using (bucket_id = 'event-media'
         and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'event-media'
              and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "event-media: owner can delete own files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'event-media'
         and (storage.foldername(name))[1] = (select auth.uid())::text);
