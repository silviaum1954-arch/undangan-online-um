import type { EventStatus } from "@/lib/data/events";

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
