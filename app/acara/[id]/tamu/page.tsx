import { Suspense } from "react";
import { loadEvent } from "@/lib/data/load-event";
import Body from "./body";
import { formatDate } from "@/lib/format";
import { toGuest } from "./data";

async function Content({ params }: PageProps<"/acara/[id]/tamu">) {
  const { id } = await params;
  const { supabase, event, shell } = await loadEvent(id);
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <Body
      slug={id}
      shell={shell}
      event={{
        id: event.id,
        slug: event.slug,
        totalQuota: event.total_quota,
        title: event.title,
        dateLabel: formatDate(event.event_date),
        time: event.event_time,
        venue: [event.venue_name, event.venue_address].filter(Boolean).join(", ") || null,
      }}
      initialGuests={data.map((r) => toGuest(r, event.slug))}
    />
  );
}

export default function Page(props: PageProps<"/acara/[id]/tamu">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <Content {...props} />
    </Suspense>
  );
}
