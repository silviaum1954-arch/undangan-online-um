-- 1) The public invitation also needs the social-preview fields (OG title,
--    description, image) so shared links render properly.
-- 2) Background music: allow MP3/M4A uploads in the event-media bucket.

create or replace function public.get_public_event(p_slug text, p_guest text default null)
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
      'design', e.design,
      'og_title', e.og_title,
      'og_description', e.og_description,
      'og_image_path', e.og_image_path
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

-- CREATE OR REPLACE keeps the existing EXECUTE grants; re-assert them anyway.
revoke execute on function public.get_public_event(text, text) from public;
grant execute on function public.get_public_event(text, text) to anon, authenticated;

update storage.buckets
   set allowed_mime_types = array[
     'image/jpeg', 'image/png', 'image/webp',
     'audio/mpeg', 'audio/mp4', 'audio/x-m4a'
   ]
 where id = 'event-media';
