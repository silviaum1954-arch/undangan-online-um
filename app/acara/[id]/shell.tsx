"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useCurrentUser, useSignOut } from "@/lib/supabase/use-user";
import Notifications from "../../notifications";
import type { EventStatus, ShellEvent } from "@/lib/data/events";
import {
  ArrowLeft,
  ChevronDown,
  Gift,
  Layers,
  LogOut,
  Mail,
  MessageSquare,
  Palette,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavId =
  | "ringkasan"
  | "edit"
  | "tamu"
  | "ucapan"
  | "angpao"
  | "pengaturan";

const NAV: { id: NavId; label: string; path: string; icon: LucideIcon }[] = [
  { id: "ringkasan", label: "Ringkasan", path: "", icon: Layers },
  { id: "edit", label: "Edit undangan", path: "/edit", icon: Palette },
  { id: "tamu", label: "Daftar tamu", path: "/tamu", icon: Users },
  { id: "ucapan", label: "Ucapan", path: "/ucapan", icon: MessageSquare },
  { id: "angpao", label: "Angpao", path: "/angpao", icon: Gift },
  { id: "pengaturan", label: "Pengaturan", path: "/pengaturan", icon: Settings },
];

interface Props {
  slug: string;
  active: NavId;
  event: ShellEvent;
  wide?: boolean;
  children: ReactNode;
}

const STATUS_DOT: Record<EventStatus, { label: string; dot: string }> = {
  terbit: { label: "Terbit", dot: "bg-emerald-500" },
  draf: { label: "Draf", dot: "bg-amber-400" },
  selesai: { label: "Selesai", dot: "bg-brand-500" },
  diarsipkan: { label: "Diarsipkan", dot: "bg-slate-400" },
};

const iconBtn =
  "relative grid size-9 place-items-center rounded-lg text-ink-soft transition hover:bg-brand-50 hover:text-brand-700";

export default function EventShell({
  slug,
  active,
  event,
  wide,
  children,
}: Props) {
  const user = useCurrentUser();
  const signOut = useSignOut();
  const [menuOpen, setMenuOpen] = useState(false);
  const base = `/acara/${slug}`;
  const width = wide ? "max-w-7xl" : "max-w-6xl";

  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className={`mx-auto flex h-14 ${width} items-center justify-between gap-4 px-4 sm:px-6 lg:px-8`}>
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link href="/beranda" className="flex shrink-0 items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
                <Mail className="size-[18px]" />
              </span>
              <span className="hidden text-lg font-extrabold tracking-tight sm:block">
                UndangKuy
              </span>
            </Link>

            <span aria-hidden className="h-6 w-px shrink-0 bg-line" />

            <Link
              href="/beranda"
              title="Kembali ke semua acara"
              className="group flex min-w-0 items-center gap-2.5 rounded-lg py-1 pr-2 transition hover:bg-brand-50/60"
            >
              <ArrowLeft className="size-4 shrink-0 text-ink-mute transition group-hover:-translate-x-0.5 group-hover:text-brand-700" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[13px] font-bold">
                  {event.name}
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-ink-mute">
                  <span className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[event.status].dot}`} />
                  <span className="truncate">
                    {STATUS_DOT[event.status].label} · {event.dateLabel}
                  </span>
                </span>
              </span>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Notifications className={iconBtn} />

            <span aria-hidden className="mx-2 hidden h-6 w-px bg-line sm:block" />

            <div className="relative">
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition hover:bg-brand-50"
              >
                <span className="grid size-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {user?.initials ?? ""}
                </span>
                <span className="hidden text-left leading-tight md:block">
                  <span className="block text-[13px] font-semibold">{user?.name ?? ""}</span>
                  <span className="block text-[11px] text-ink-mute">Pemilik acara</span>
                </span>
                <ChevronDown className="hidden size-3.5 text-ink-mute md:block" />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-line bg-white p-1.5 shadow-xl"
                  >
                    <div className="border-b border-line px-2.5 pb-2.5 pt-1.5">
                      <p className="text-[13px] font-semibold">{user?.name ?? ""}</p>
                      <p className="text-xs text-ink-mute">{user?.email ?? ""}</p>
                    </div>
                    <Link
                      href="/beranda"
                      role="menuitem"
                      className="mt-1.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium hover:bg-brand-50"
                    >
                      <Layers className="size-4 text-ink-mute" />
                      Semua acara
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={signOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="size-4" />
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <nav aria-label="Menu acara" className="border-t border-line">
          <div className={`mx-auto flex ${width} gap-1 overflow-x-auto px-1 sm:px-3 lg:px-5`}>
            {NAV.map(({ id, label, path, icon: Icon }) => {
              const on = id === active;
              const badge =
                id === "tamu" ? event.guests : id === "ucapan" ? event.wishes : null;
              return (
                <Link
                  key={id}
                  href={`${base}${path}`}
                  aria-current={on ? "page" : undefined}
                  className={`flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-[13px] font-semibold transition ${
                    on
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                  {badge !== null && badge > 0 && (
                    <span
                      className={`rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                        on ? "bg-brand-100 text-brand-700" : "bg-brand-50 text-ink-mute"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main
        className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 ${width}`}
      >
        {children}
      </main>
    </div>
  );
}
