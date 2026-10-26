export type EventStatus = "terbit" | "draf" | "selesai" | "diarsipkan";

export interface EventTheme {
  name: string;
  description: string;
  /** Tailwind gradient classes for the card cover */
  cover: string;
  isDark?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  dateFormatted: string;
  status: EventStatus;
  theme: EventTheme;
  slug: string;
  url: string;
  confirmed: number;
  target: number;
  stepInfo?: string;
  archiveNote?: string;
}

export const THEMES: Record<string, EventTheme> = {
  "Pastel Blossom": {
    name: "Pastel Blossom",
    description: "Rose gold & floral",
    cover: "from-rose-100 via-pink-50 to-purple-100",
  },
  "Pastel Balloon": {
    name: "Pastel Balloon",
    description: "Cream & peach",
    cover: "from-amber-100 via-orange-50 to-pink-100",
  },
  "Midnight Elegant": {
    name: "Midnight Elegant",
    description: "Deep navy & champagne",
    cover: "from-slate-900 via-indigo-950 to-slate-800",
    isDark: true,
  },
  "Golden Classic": {
    name: "Golden Classic",
    description: "Ivory & gold",
    cover: "from-stone-100 via-amber-100 to-stone-50",
  },
};

export const THEME_OPTIONS = ["Pastel Balloon", "Midnight Elegant", "Golden Classic"];

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    title: "Ulang Tahun ke-2 Clarissa",
    date: "2026-10-15",
    dateFormatted: "15 Oktober 2026",
    status: "terbit",
    theme: THEMES["Pastel Blossom"],
    slug: "clarissa-two",
    url: "undang.kuy/clarissa-two",
    confirmed: 38,
    target: 50,
  },
  {
    id: "evt-2",
    title: "Ulang Tahun Pertama Aira",
    date: "2026-08-28",
    dateFormatted: "28 Agustus 2026",
    status: "selesai",
    theme: THEMES["Pastel Balloon"],
    slug: "aira-one",
    url: "undang.kuy/aira-one",
    confirmed: 32,
    target: 35,
  },
  {
    id: "evt-3",
    title: "Syukuran Rani",
    date: "2026-11-05",
    dateFormatted: "5 November 2026",
    status: "draf",
    theme: THEMES["Midnight Elegant"],
    slug: "syukuran-rani",
    url: "",
    confirmed: 0,
    target: 40,
    stepInfo: "Langkah 2 dari 3",
  },
  {
    id: "evt-4",
    title: "Ulang Tahun Dimas ke-30",
    date: "2026-01-10",
    dateFormatted: "10 Januari 2026",
    status: "diarsipkan",
    theme: THEMES["Golden Classic"],
    slug: "dimas-30",
    url: "undang.kuy/dimas-30",
    confirmed: 54,
    target: 60,
    archiveNote: "Ditutup 11 Jan 2026",
  },
];

export const STATUS_META: Record<
  EventStatus,
  { label: string; badge: string; dot: string; bar: string; action: string }
> = {
  terbit: {
    label: "Terbit",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-brand-600",
    action: "Kelola acara",
  },
  draf: {
    label: "Draf",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
    action: "Lanjut edit",
  },
  selesai: {
    label: "Selesai",
    badge: "bg-brand-50 text-brand-700 ring-brand-200",
    dot: "bg-brand-500",
    bar: "bg-brand-500",
    action: "Buka rekap",
  },
  diarsipkan: {
    label: "Diarsipkan",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
    bar: "bg-slate-400",
    action: "Buka arsip",
  },
};
