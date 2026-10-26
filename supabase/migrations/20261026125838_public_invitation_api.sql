-- Public invitation API.
--
-- Guests are not signed in, and the tables are closed to `anon`. These four
-- functions are the only doors: each is SECURITY DEFINER with an empty
-- search_path, validates its inputs, and exposes/accepts only what the public
-- invitation page needs. EXECUTE is revoked from PUBLIC and granted
-- explicitly to anon + authenticated.

------------------------------------------------------------------------------
-- Read: everything the invitation page renders
------------------------------------------------------------------------------
create function public.get_public_event(p_slug text, p_guest text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  e public.events;
  g public.guests;
  show_gift boolean;
begin
  select * into e from public.events where slug = p_slug;
  if not found then
    return null;
  end if;

  -- Published events are public; drafts/archived are visible to their owner only.
  if e.status not in ('terbit', 'selesai')
     and e.owner_id is distinct from (select auth.uid()) then
    return null;
  end if;

  if p_guest is not null then
    select * into g from public.guests
    where event_id = e.id and personal_slug = p_guest;
  end if;

  show_gift := e.gift_enabled and (not e.gift_personal_only or g.id is not null);

  return jsonb_build_object(
    'event', jsonb_build_object(
      'title', e.title,
      'slug', e.slug,
      'status', e.status,
      'event_date', e.event_date,
      'event_time', e.event_time,
      'venue_name', e.venue_name,
      'venue_address', e.venue_address,
      'maps_url', e.maps_url,
      'theme', e.theme,
      'design', e.design
    ),
    'photos', coalesce(
      (select jsonb_agg(p.storage_path order by p.sort_order)
         from public.event_photos p where p.event_id = e.id),
      '[]'::jsonb),
    'guest', case when g.id is not null then jsonb_build_object(
        'name', g.name,
        'quota', g.quota,
        'status', g.status,
        'adults', g.adults,
        'children', g.children
      ) end,
    'rsvp_open', e.status = 'terbit',
    'wishes', coalesce(
      (select jsonb_agg(jsonb_build_object(
                'id', w.id,
                'sender', w.sender_name,
                'message', w.message,
                'created_at', w.created_at) order by w.created_at desc)
         from (select * from public.wishes
                where event_id = e.id and status = 'tampil' and not is_spam
                order by created_at desc limit 50) w),
      '[]'::jsonb),
    'wish_settings', jsonb_build_object(
      'closed', e.wishes_closed or e.status <> 'terbit',
      'char_limit', e.wishes_char_limit,
      'needs_approval', e.wishes_manual_approval or not e.wishes_auto_publish
    ),
    'gift', case when show_gift then jsonb_build_object(
        'qris_path', e.qris_path,
        'transfer_form', e.gift_transfer_form and e.status = 'terbit',
        'accounts', coalesce(
          (select jsonb_agg(jsonb_build_object(
                    'id', a.id,
                    'type', a.type,
                    'bank_name', a.bank_name,
                    'account_number', a.account_number,
                    'account_holder', a.account_holder,
                    'is_primary', a.is_primary) order by a.sort_order)
             from public.payment_accounts a
            where a.event_id = e.id and a.is_active),
          '[]'::jsonb)
      ) end,
    'gift_locked', e.gift_enabled and not show_gift
  );
end;
$$;

------------------------------------------------------------------------------
-- Write: RSVP (needs the guest's personal link)
------------------------------------------------------------------------------
create function public.submit_rsvp(
  p_slug text,
  p_guest text,
  p_status public.rsvp_status,
  p_adults integer,
  p_children integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  e public.events;
  g public.guests;
  a integer := coalesce(p_adults, 0);
  c integer := coalesce(p_children, 0);
begin
  select * into e from public.events where slug = p_slug;
  if not found or e.status <> 'terbit' then
    raise exception 'Konfirmasi kehadiran sudah ditutup' using errcode = 'check_violation';
  end if;

  select * into g from public.guests
  where event_id = e.id and personal_slug = p_guest;
  if not found then
    raise exception 'Tautan undangan tidak valid' using errcode = 'no_data_found';
  end if;

  if p_status = 'pending' then
    raise exception 'Pilih status kehadiran' using errcode = 'check_violation';
  end if;

  if p_status = 'batal' then
    a := 0; c := 0;
  else
    if a < 0 or c < 0 or a + c < 1 or a + c > g.quota then
      raise exception 'Jumlah tamu harus 1 sampai % orang', g.quota
        using errcode = 'check_violation';
    end if;
  end if;

  update public.guests
     set status = p_status, adults = a, children = c, responded_at = now()
   where id = g.id;
end;
$$;

------------------------------------------------------------------------------
-- Write: wishes (open guestbook; personal link optional)
------------------------------------------------------------------------------
create function public.submit_wish(
  p_slug text,
  p_guest text,
  p_sender text,
  p_message text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  e public.events;
  g public.guests;
  sender text := btrim(coalesce(p_sender, ''));
  msg text := btrim(coalesce(p_message, ''));
  spam boolean := false;
  visible boolean;
begin
  select * into e from public.events where slug = p_slug;
  if not found or e.status <> 'terbit' or e.wishes_closed then
    raise exception 'Buku ucapan sedang ditutup' using errcode = 'check_violation';
  end if;

  if char_length(sender) not between 1 and 200 then
    raise exception 'Nama pengirim wajib diisi' using errcode = 'check_violation';
  end if;
  if char_length(msg) not between 1 and 2000
     or (e.wishes_char_limit is not null and char_length(msg) > e.wishes_char_limit) then
    raise exception 'Ucapan terlalu panjang atau kosong' using errcode = 'check_violation';
  end if;

  if p_guest is not null then
    select * into g from public.guests
    where event_id = e.id and personal_slug = p_guest;
  end if;

  if e.wishes_spam_filter
     and msg ~* '(https?://|www\.|wa\.me|pinjaman|judi|slot gacor)' then
    spam := true;
  end if;

  visible := not spam and e.wishes_auto_publish and not e.wishes_manual_approval;

  insert into public.wishes (event_id, guest_id, sender_name, tag, message, status, is_spam)
  values (
    e.id,
    g.id,
    sender,
    g.category,
    msg,
    case when visible then 'tampil'::public.wish_status else 'disembunyikan'::public.wish_status end,
    spam
  );

  return jsonb_build_object('visible', visible);
end;
$$;

------------------------------------------------------------------------------
-- Write: "Saya sudah transfer" confirmation
------------------------------------------------------------------------------
create function public.submit_gift(
  p_slug text,
  p_guest text,
  p_sender text,
  p_amount bigint,
  p_destination text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  e public.events;
  g public.guests;
  sender text := btrim(coalesce(p_sender, ''));
begin
  select * into e from public.events where slug = p_slug;
  if not found or e.status <> 'terbit' or not e.gift_enabled or not e.gift_transfer_form then
    raise exception 'Konfirmasi transfer tidak tersedia' using errcode = 'check_violation';
  end if;

  if p_guest is not null then
    select * into g from public.guests
    where event_id = e.id and personal_slug = p_guest;
  end if;
  if e.gift_personal_only and g.id is null then
    raise exception 'Tautan undangan tidak valid' using errcode = 'no_data_found';
  end if;

  if char_length(sender) not between 1 and 200 then
    raise exception 'Nama pengirim wajib diisi' using errcode = 'check_violation';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 1000000000 then
    raise exception 'Nominal tidak valid' using errcode = 'check_violation';
  end if;
  if char_length(coalesce(p_destination, '')) not between 1 and 200
     or char_length(coalesce(p_note, '')) > 1000 then
    raise exception 'Data tidak valid' using errcode = 'check_violation';
  end if;

  insert into public.gift_confirmations (event_id, guest_id, sender_name, destination, amount, note)
  values (e.id, g.id, sender, p_destination, p_amount, nullif(btrim(p_note), ''));
end;
$$;

------------------------------------------------------------------------------
-- Grants: only the intended roles may execute
------------------------------------------------------------------------------
revoke execute on function public.get_public_event(text, text) from public;
revoke execute on function public.submit_rsvp(text, text, public.rsvp_status, integer, integer) from public;
revoke execute on function public.submit_wish(text, text, text, text) from public;
revoke execute on function public.submit_gift(text, text, text, bigint, text, text) from public;

grant execute on function public.get_public_event(text, text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, public.rsvp_status, integer, integer) to anon, authenticated;
grant execute on function public.submit_wish(text, text, text, text) to anon, authenticated;
grant execute on function public.submit_gift(text, text, text, bigint, text, text) to anon, authenticated;
