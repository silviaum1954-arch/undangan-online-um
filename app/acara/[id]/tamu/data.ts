export type RsvpStatus = "fiks" | "ragu" | "batal" | "pending";

export interface Guest {
  id: string;
  name: string;
  category: string;
  phone: string;
  quota: number;
  status: RsvpStatus;
  anak: number | null;
  dewasa: number | null;
  totalHadir: number | null;
  slug: string;
  /** public invitation path with the guest's personal link */
  path: string;
}

export const CATEGORIES = [
  "Sahabat Kuliah",
  "Teman SMA",
  "Teman Kampus",
  "Rekan Kerja",
  "VIP / Paman",
  "Keluarga Besar",
  "Tetangga",
  "Komunitas",
];

export const STATUS_META: Record<
  RsvpStatus,
  { label: string; badge: string; dot: string; text: string }
> = {
  fiks: {
    label: "Fiks datang",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  ragu: {
    label: "Belum pasti",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-400",
    text: "text-amber-700",
  },
  batal: {
    label: "Berhalangan",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-400",
    text: "text-rose-700",
  },
  pending: {
    label: "Belum respons",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
    text: "text-ink-mute",
  },
};

import type { Database } from "@/lib/database.types";

type GuestRow = Database["public"]["Tables"]["guests"]["Row"];

/** Row from the DB mapped to what the table renders. */
export function toGuest(row: GuestRow, eventSlug: string): Guest {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? "",
    phone: row.phone ?? "",
    quota: row.quota,
    status: row.status,
    anak: row.children,
    dewasa: row.adults,
    totalHadir: row.attending,
    slug: `${eventSlug}/${row.personal_slug}`,
    path: `/e/${eventSlug}?to=${row.personal_slug}`,
  };
}

export { initials } from "@/lib/format";
