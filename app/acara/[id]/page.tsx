import { Suspense } from "react";
import { loadEvent } from "@/lib/data/load-event";
import { formatDate, nowMs, rupiah, timeAgo } from "@/lib/format";
import Overview from "./overview";
import type { Activity, OverviewData } from "./overview-data";

async function EventOverview({ params }: PageProps<"/acara/[id]">) {
  const { id } = await params;
  const { supabase, event, shell } = await loadEvent(id);

  const [guests, wishes, gifts] = await Promise.all([
    supabase
      .from("guests")
      .select("name, status, adults, children, attending, responded_at")
      .eq("event_id", event.id),
    supabase
      .from("wishes")
      .select("id, sender_name, message, created_at")
      .eq("event_id", event.id)
      .eq("is_spam", false)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("gift_confirmations")
      .select("id, sender_name, destination, amount, created_at")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const error = guests.error ?? wishes.error ?? gifts.error;
  if (error) throw new Error(error.message);

  const now = nowMs();
  const rsvp = { hadir: 0, ragu: 0, batal: 0, pending: 0 };
  const catering = { pax: 0, adults: 0, children: 0 };
  const activities: (Activity & { at: number })[] = [];

  for (const g of guests.data ?? []) {
    if (g.status === "fiks") {
      rsvp.hadir += 1;
      catering.pax += g.attending ?? 0;
      catering.adults += g.adults ?? 0;
      catering.children += g.children ?? 0;
    } else if (g.status === "ragu") rsvp.ragu += 1;
    else if (g.status === "batal") rsvp.batal += 1;
    else rsvp.pending += 1;

    if (g.responded_at && g.status !== "pending") {
      activities.push({
        key: `g-${g.name}-${g.responded_at}`,
        kind: g.status === "fiks" ? "hadir" : g.status === "ragu" ? "ragu" : "batal",
        who: g.name,
        what:
          g.status === "fiks"
            ? `Konfirmasi hadir · ${g.adults ?? 0} dewasa, ${g.children ?? 0} anak`
            : g.status === "ragu"
              ? "Belum pasti hadir"
              : "Berhalangan hadir",
        when: timeAgo(g.responded_at, now),
        at: new Date(g.responded_at).getTime(),
      });
    }
  }
  for (const w of wishes.data ?? []) {
    activities.push({
      key: `w-${w.id}`,
      kind: "wish",
      who: w.sender_name,
      what: `“${w.message.length > 90 ? `${w.message.slice(0, 90)}…` : w.message}”`,
      when: timeAgo(w.created_at, now),
      at: new Date(w.created_at).getTime(),
    });
  }
  for (const g of gifts.data ?? []) {
    activities.push({
      key: `a-${g.id}`,
      kind: "gift",
      who: g.sender_name,
      what: `Angpao ${rupiah(g.amount)} · ${g.destination}`,
      when: timeAgo(g.created_at, now),
      at: new Date(g.created_at).getTime(),
    });
  }
  activities.sort((a, b) => b.at - a.at);

  const data: OverviewData = {
    event: {
      id: event.id,
      title: event.title,
      slug: event.slug,
      status: event.status,
      dateISO: event.event_date,
      dateLabel: formatDate(event.event_date),
      time: event.event_time,
      venueName: event.venue_name,
      venueAddress: event.venue_address,
      themeId: event.theme,
    },
    rsvp,
    catering,
    activities: activities
      .slice(0, 5)
      .map(({ key, kind, who, what, when }) => ({ key, kind, who, what, when })),
  };

  return <Overview slug={id} shell={shell} data={data} />;
}

export default function Page(props: PageProps<"/acara/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <EventOverview {...props} />
    </Suspense>
  );
}
