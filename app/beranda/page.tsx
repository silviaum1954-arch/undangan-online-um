import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aggregateGuests, toEventItem } from "@/lib/data/events";
import BerandaClient from "./beranda-client";

async function Events() {
  await connection();
  const supabase = await createClient();
  const [events, guests] = await Promise.all([
    supabase.from("events").select("*").order("created_at", { ascending: false }),
    supabase.from("guests").select("event_id, status, attending"),
  ]);

  if (events.error || guests.error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p role="alert" className="max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
          Gagal memuat acara: {(events.error ?? guests.error)?.message}
        </p>
      </main>
    );
  }

  const agg = aggregateGuests(guests.data);
  const items = events.data.map((e) =>
    toEventItem(e, agg.get(e.id) ?? { confirmed: 0, total: 0 }),
  );
  return <BerandaClient initialEvents={items} />;
}

export default function BerandaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <Events />
    </Suspense>
  );
}
