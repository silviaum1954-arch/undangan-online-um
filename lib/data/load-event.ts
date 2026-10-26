import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatDateShort } from "@/lib/format";
import type { ShellEvent } from "./events";

/** Loads the signed-in user's event by slug (RLS hides other people's events)
 *  plus the counts shown in the navbar. Call inside <Suspense>. */
export async function loadEvent(slug: string) {
  await connection();
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!event) notFound();

  const [guests, wishes] = await Promise.all([
    supabase.from("guests").select("id", { count: "exact", head: true }).eq("event_id", event.id),
    supabase.from("wishes").select("id", { count: "exact", head: true }).eq("event_id", event.id),
  ]);

  const shell: ShellEvent = {
    name: event.title,
    dateLabel: formatDateShort(event.event_date),
    status: event.status,
    guests: guests.count ?? 0,
    wishes: wishes.count ?? 0,
  };

  return { supabase, event, shell };
}
