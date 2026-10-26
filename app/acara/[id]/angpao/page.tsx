import { Suspense } from "react";
import { loadEvent } from "@/lib/data/load-event";
import Body from "./body";
import { toAccount, toTransfer } from "./data";

async function Content({ params }: PageProps<"/acara/[id]/angpao">) {
  const { id } = await params;
  const { supabase, event, shell } = await loadEvent(id);

  const [accounts, transfers] = await Promise.all([
    supabase
      .from("payment_accounts")
      .select("*")
      .eq("event_id", event.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("gift_confirmations")
      .select("*")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false }),
  ]);
  const error = accounts.error ?? transfers.error;
  if (error) throw new Error(error.message);

  return (
    <Body
      slug={id}
      shell={shell}
      eventId={event.id}
      initialAccounts={(accounts.data ?? []).map(toAccount)}
      initialTransfers={(transfers.data ?? []).map(toTransfer)}
      initialSettings={{
        enabled: event.gift_enabled,
        personalOnly: event.gift_personal_only,
        transferForm: event.gift_transfer_form,
        emailNotify: event.gift_email_notify,
      }}
      initialQrisPath={event.qris_path}
    />
  );
}

export default function Page(props: PageProps<"/acara/[id]/angpao">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <Content {...props} />
    </Suspense>
  );
}
