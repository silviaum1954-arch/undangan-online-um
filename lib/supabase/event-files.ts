import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

/** Deletes every uploaded file (photos, QRIS, music, social image) of an event.
 *  Call after the event row is deleted; failures are non-fatal. */
export async function removeEventFiles(supabase: SupabaseClient<Database>, eventId: string) {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const dir = `${auth.user.id}/${eventId}`;
    const bucket = supabase.storage.from("event-media");
    const { data } = await bucket.list(dir, { limit: 1000 });
    if (data?.length) await bucket.remove(data.map((f) => `${dir}/${f.name}`));
  } catch {
    /* orphaned files are harmless, never block the delete */
  }
}
