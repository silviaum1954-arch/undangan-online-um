import { Suspense } from "react";
import { loadEvent } from "@/lib/data/load-event";
import Body from "./body";
import { formFromEvent, type Photo } from "./data";

async function Content({ params }: PageProps<"/acara/[id]/edit">) {
  const { id } = await params;
  const { supabase, event, shell } = await loadEvent(id);

  const { data, error } = await supabase
    .from("event_photos")
    .select("id, storage_path")
    .eq("event_id", event.id)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const photos: Photo[] = (data ?? []).map((p) => ({
    id: p.id,
    path: p.storage_path,
    url: supabase.storage.from("event-media").getPublicUrl(p.storage_path).data.publicUrl,
  }));

  return (
    <Body
      slug={id}
      shell={shell}
      event={{ id: event.id, status: event.status }}
      initialForm={formFromEvent(event)}
      initialPhotos={photos}
    />
  );
}

export default function Page(props: PageProps<"/acara/[id]/edit">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <Content {...props} />
    </Suspense>
  );
}
