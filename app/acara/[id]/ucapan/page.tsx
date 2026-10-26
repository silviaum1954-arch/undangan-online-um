import { Suspense } from "react";
import { loadEvent } from "@/lib/data/load-event";
import Body from "./body";
import { nowMs } from "@/lib/format";
import { toWish } from "./data";

async function Content({ params }: PageProps<"/acara/[id]/ucapan">) {
  const { id } = await params;
  const { supabase, event, shell } = await loadEvent(id);
  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const now = nowMs();
  return (
    <Body
      slug={id}
      shell={shell}
      eventId={event.id}
      initialWishes={data.map((r) => toWish(r, now))}
      initialSettings={{
        autoPublish: event.wishes_auto_publish,
        manualApproval: event.wishes_manual_approval,
        closed: event.wishes_closed,
        spamFilter: event.wishes_spam_filter,
        charLimit: event.wishes_char_limit,
      }}
    />
  );
}

export default function Page(props: PageProps<"/acara/[id]/ucapan">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <Content {...props} />
    </Suspense>
  );
}
