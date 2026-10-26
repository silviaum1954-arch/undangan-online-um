import type { EventRow } from "@/lib/data/events";

export type EventStatus = "draf" | "terbit" | "selesai" | "diarsipkan";

export interface Settings {
  slug: string;
  autoClose: boolean;
  closeTiming: string;
  reminderArchive: boolean;
  metaTitle: string;
  metaDescription: string;
  /** storage path in the event-media bucket, empty when unset */
  ogImagePath: string;
  totalQuota: number;
  maxPax: number;
}

export const STATUS_ORDER: EventStatus[] = ["draf", "terbit", "selesai", "diarsipkan"];

export const STATUS_STEPS: { id: EventStatus; label: string; note: string }[] = [
  { id: "draf", label: "Draf", note: "Sedang disiapkan" },
  { id: "terbit", label: "Terbit", note: "Menerima RSVP" },
  { id: "selesai", label: "Selesai", note: "RSVP ditutup" },
  { id: "diarsipkan", label: "Diarsipkan", note: "Disimpan 90 hari" },
];

export const STATUS_ACTIONS: Record<EventStatus, { label: string; toast: string }> = {
  draf: { label: "Kembalikan ke draf", toast: "Status acara diubah menjadi Draf." },
  terbit: { label: "Terbitkan", toast: "Acara diterbitkan dan menerima RSVP." },
  selesai: { label: "Tandai selesai", toast: "Acara ditandai Selesai." },
  diarsipkan: { label: "Arsipkan", toast: "Acara dipindahkan ke arsip." },
};

export const CLOSE_TIMINGS = [
  { value: "h1_2359", label: "H+1 pukul 23:59 WIB (disarankan)" },
  { value: "h0_2200", label: "Hari H pukul 22:00 WIB" },
  { value: "h2_1200", label: "H+2 pukul 12:00 WIB" },
];

export const PUBLIC_HOST = "undang.kuy";

export function settingsFromEvent(e: EventRow): Settings {
  return {
    slug: e.slug,
    autoClose: e.auto_close,
    closeTiming: e.close_timing,
    reminderArchive: e.remind_archive,
    metaTitle: e.og_title ?? "",
    metaDescription: e.og_description ?? "",
    ogImagePath: e.og_image_path ?? "",
    totalQuota: e.total_quota,
    maxPax: e.max_pax,
  };
}

export type Prefs = {
  lang: string;
  tz: string;
  weekly: boolean;
  newWish: boolean;
};

export const DEFAULT_PREFS: Prefs = { lang: "Bahasa Indonesia", tz: "WIB (GMT+07:00)", weekly: true, newWish: true };

export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  prefs: Prefs;
}
