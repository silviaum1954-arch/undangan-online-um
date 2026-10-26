import { Suspense } from "react";
import { loadEvent } from "@/lib/data/load-event";
import Body from "./body";
import { DEFAULT_PREFS, settingsFromEvent, type Prefs } from "./data";

async function Content({ params }: PageProps<"/acara/[id]/pengaturan">) {
  const { id } = await params;
  const { supabase, event, shell } = await loadEvent(id);

  const { data: auth } = await supabase.auth.getUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, phone, preferences")
    .eq("id", auth.user?.id ?? "")
    .maybeSingle();
  if (error) throw new Error(error.message);

  const raw = (profile?.preferences ?? {}) as Partial<Prefs>;

  return (
    <Body
      slug={id}
      shell={shell}
      event={{ id: event.id, title: event.title, status: event.status, usedQuota: shell.guests }}
      initialSettings={settingsFromEvent(event)}
      profile={{
        fullName: profile?.full_name ?? "",
        email: auth.user?.email ?? "",
        phone: profile?.phone ?? "",
        prefs: { ...DEFAULT_PREFS, ...raw },
      }}
    />
  );
}

export default function Page(props: PageProps<"/acara/[id]/pengaturan">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <Content {...props} />
    </Suspense>
  );
}
