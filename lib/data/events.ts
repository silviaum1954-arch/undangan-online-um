import type { Database } from "../database.types";
import { formatDateLong, formatDateShort } from "../format";
import { themeById, type Theme } from "../themes";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventStatus = Database["public"]["Enums"]["event_status"];

export interface EventItem {
  id: string;
  title: string;
  /** yyyy-mm-dd */
  date: string;
  dateFormatted: string;
  status: EventStatus;
  theme: Theme;
  slug: string;
  url: string;
  confirmed: number;
  target: number;
  stepInfo?: string;
  archiveNote?: string;
}

export const PUBLIC_HOST = "undang.kuy";

export interface GuestAggregate {
  confirmed: number;
  total: number;
}

export function toEventItem(row: EventRow, agg: GuestAggregate): EventItem {
  const hasDesign = Object.keys((row.design as Record<string, unknown>) ?? {}).length > 0;
  const done = (row.venue_name ? 1 : 0) + (hasDesign ? 1 : 0) + (agg.total > 0 ? 1 : 0);
  return {
    id: row.id,
    title: row.title,
    date: row.event_date,
    dateFormatted: formatDateLong(row.event_date),
    status: row.status,
    theme: themeById(row.theme),
    slug: row.slug,
    url: `${PUBLIC_HOST}/${row.slug}`,
    confirmed: agg.confirmed,
    target: row.total_quota,
    stepInfo: row.status === "draf" ? `Langkah ${Math.min(3, 1 + done)} dari 3` : undefined,
    archiveNote: row.archived_at ? `Diarsipkan ${formatDateShort(row.archived_at)}` : undefined,
  };
}

/** Sum of confirmed attendees and guest count per event. */
export function aggregateGuests(
  guests: { event_id: string; status: string; attending: number | null }[],
) {
  const map = new Map<string, GuestAggregate>();
  for (const g of guests) {
    const a = map.get(g.event_id) ?? { confirmed: 0, total: 0 };
    a.total += 1;
    if (g.status === "fiks") a.confirmed += g.attending ?? 0;
    map.set(g.event_id, a);
  }
  return map;
}

/** What the event navbar needs to render. */
export interface ShellEvent {
  name: string;
  dateLabel: string;
  status: EventStatus;
  guests: number;
  wishes: number;
}
