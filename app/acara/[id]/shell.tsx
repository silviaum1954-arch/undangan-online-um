"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Gift,
  HelpCircle,
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

const NAV: { id: NavId; label: string; path: string; icon: LucideIcon; badge?: string }[] = [
  { id: "ringkasan", label: "Ringkasan", path: "", icon: Layers },
  { id: "edit", label: "Edit undangan", path: "/edit", icon: Palette },
  { id: "tamu", label: "Daftar tamu", path: "/tamu", icon: Users, badge: "48" },
  { id: "ucapan", label: "Ucapan", path: "/ucapan", icon: MessageSquare, badge: "12" },
  { id: "angpao", label: "Angpao", path: "/angpao", icon: Gift },
  { id: "pengaturan", label: "Pengaturan", path: "/pengaturan", icon: Settings },
];

interface Props {
  slug: string;
  active: NavId;
  eventName: string;
  eventDate: string;
  wide?: boolean;
  children: ReactNode;
}

export default function EventShell({
  slug,
  active,
  eventName,
  eventDate,
  wide,
  children,
}: Props) {
  const router = useRouter();
  const base = `/acara/${slug}`;
  const current = NAV.find((n) => n.id === active)!;

  return (
    <div className="flex min-h-screen bg-background text-ink">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-line bg-white p-4 lg:flex">
        <div>
          <Link href="/beranda" className="flex items-center gap-2.5 px-2 py-1">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
              <Mail className="size-[18px]" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              UndangKuy
            </span>
          </Link>

          <Link
            href="/beranda"
            className="group mt-6 block rounded-xl border border-line p-3 transition hover:border-brand-200 hover:bg-brand-50/50"
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-mute transition group-hover:text-brand-700">
              <ArrowLeft className="size-3.5" />
              Semua acara
            </span>
            <span className="mt-2 block truncate text-sm font-bold">
              {eventName}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Terbit · {eventDate}
            </span>
          </Link>

          <nav className="mt-6 space-y-0.5" aria-label="Menu acara">
            {NAV.map(({ id: nid, label, path, icon: Icon, badge }) => {
              const on = nid === active;
              return (
                <Link
                  key={nid}
                  href={`${base}${path}`}
                  aria-current={on ? "page" : undefined}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    on
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-soft hover:bg-brand-50/60 hover:text-ink"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className={`size-4 ${on ? "text-brand-600" : "text-ink-mute"}`}
                    />
                    {label}
                  </span>
                  {badge && (
                    <span className="rounded-full bg-white px-2 text-[11px] font-bold text-ink-soft ring-1 ring-line">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center justify-between border-t border-line px-2 pt-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              SA
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold">Shilvia Anisa</p>
              <p className="text-[11px] text-ink-mute">Pemilik acara</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Keluar"
            onClick={() => router.push("/")}
            className="grid size-8 place-items-center rounded-lg text-ink-mute transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-2 text-[13px] text-ink-soft"
            >
              <Link href="/beranda" className="hover:text-brand-700">
                Acara saya
              </Link>
              <span className="text-ink-mute">/</span>
              <span className="hidden truncate sm:inline">{eventName}</span>
              <span className="hidden text-ink-mute sm:inline">/</span>
              <span className="font-semibold text-ink">{current.label}</span>
            </nav>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Bantuan"
                className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-brand-50 hover:text-brand-700"
              >
                <HelpCircle className="size-[18px]" />
              </button>
              <button
                type="button"
                aria-label="Notifikasi"
                className="relative grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-brand-50 hover:text-brand-700"
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-600 ring-2 ring-white" />
              </button>
            </div>
          </div>

          {/* Mobile section nav */}
          <nav
            aria-label="Menu acara"
            className="flex gap-1 overflow-x-auto border-t border-line px-3 lg:hidden"
          >
            {NAV.map(({ id: nid, label, path }) => {
              const on = nid === active;
              return (
                <Link
                  key={nid}
                  href={`${base}${path}`}
                  aria-current={on ? "page" : undefined}
                  className={`shrink-0 border-b-2 px-3 py-3 text-[13px] font-semibold ${
                    on
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-ink-soft"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 ${wide ? "max-w-7xl" : "max-w-5xl"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
