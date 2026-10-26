export type EventStatus = "draf" | "terbit" | "selesai" | "diarsipkan";

export interface Settings {
  slug: string;
  autoClose: boolean;
  closeTiming: string;
  reminderArchive: boolean;
  metaTitle: string;
  metaDescription: string;
  ogImageName: string;
  totalQuota: number;
  maxPax: number;
}

export const DEFAULT_SETTINGS: Settings = {
  slug: "shilvia-21",
  autoClose: true,
  closeTiming: "h1_2359",
  reminderArchive: true,
  metaTitle: "The 21st Sweet Celebration - Shilvia Anisa",
  metaDescription:
    "Dengan penuh rasa syukur dan sukacita, kami mengundang Anda untuk hadir di perayaan ulang tahun ke-21 Shilvia Anisa.",
  ogImageName: "og-banner-shilvia-21st.jpg",
  totalQuota: 50,
  maxPax: 4,
};

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

export const USED_QUOTA = 48;
export const EVENT_TITLE = "Ulang Tahun ke-21 Shilvia Anisa";
export const PUBLIC_HOST = "undang.kuy";
