"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  ChevronDown,
  Filter,
  HelpCircle,
  LogOut,
  Mail,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import {
  INITIAL_EVENTS,
  THEMES,
  type EventItem,
  type EventStatus,
} from "./data";
import EventCard from "./event-card";
import { CreateEventModal, PreviewModal } from "./modals";

type Tab = "semua" | EventStatus;
type Sort = "terbaru" | "terdekat" | "tamu";

const TABS: { id: Tab; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "terbit", label: "Terbit" },
  { id: "draf", label: "Draf" },
  { id: "selesai", label: "Selesai" },
  { id: "diarsipkan", label: "Diarsipkan" },
];

const iconBtn =
  "relative grid size-9 place-items-center rounded-lg text-ink-soft transition hover:bg-brand-50 hover:text-brand-700";

export default function BerandaPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [tab, setTab] = useState<Tab>("semua");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("terbaru");

  const [menuId, setMenuId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [preview, setPreview] = useState<EventItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  const counts = useMemo(() => {
    const c: Record<Tab, number> = {
      semua: events.length,
      terbit: 0,
      draf: 0,
      selesai: 0,
      diarsipkan: 0,
    };
    for (const e of events) c[e.status]++;
    return c;
  }, [events]);

  const totalConfirmed = useMemo(
    () =>
      events
        .filter((e) => e.status !== "draf")
        .reduce((s, e) => s + e.confirmed, 0),
    [events],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => tab === "semua" || e.status === tab)
      .filter(
        (e) =>
          !q ||
          e.title.toLowerCase().includes(q) ||
          e.dateFormatted.toLowerCase().includes(q) ||
          e.theme.name.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        if (sort === "terdekat") return a.date.localeCompare(b.date);
        if (sort === "tamu") return b.confirmed - a.confirmed;
        return 0;
      });
  }, [events, tab, query, sort]);

  function copyLink(e: EventItem) {
    const link =
      e.status === "draf"
        ? `https://${e.slug}.undang.kuy/draft`
        : `https://${e.url}`;
    navigator.clipboard?.writeText(link);
    showToast(`Tautan "${e.title}" disalin.`);
    setMenuId(null);
  }

  function duplicate(e: EventItem) {
    setEvents([
      {
        ...e,
        id: `evt-${crypto.randomUUID()}`,
        title: `${e.title} (salinan)`,
        status: "draf",
        confirmed: 0,
        stepInfo: "Langkah 1 dari 3",
        archiveNote: undefined,
      },
      ...events,
    ]);
    showToast(`"${e.title}" diduplikasi sebagai draf.`);
    setMenuId(null);
  }

  function toggleArchive(id: string) {
    setEvents(
      events.map((e) =>
        e.id !== id
          ? e
          : e.status === "diarsipkan"
            ? { ...e, status: "selesai" }
            : { ...e, status: "diarsipkan", archiveNote: "Diarsipkan hari ini" },
      ),
    );
    showToast("Status arsip diperbarui.");
    setMenuId(null);
  }

  function remove(e: EventItem) {
    if (confirm(`Hapus undangan "${e.title}"?`)) {
      setEvents(events.filter((x) => x.id !== e.id));
      showToast(`"${e.title}" dihapus.`);
    }
    setMenuId(null);
  }

  function create(v: { title: string; date: string; theme: string }) {
    const slug = v.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const date = v.date || "2026-12-25";
    const item: EventItem = {
      id: `evt-${crypto.randomUUID()}`,
      title: v.title,
      date,
      dateFormatted: new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      status: "draf",
      theme: THEMES[v.theme] ?? THEMES["Pastel Balloon"],
      slug,
      url: `undang.kuy/${slug}`,
      confirmed: 0,
      target: 50,
      stepInfo: "Langkah 1 dari 3",
    };
    setEvents([item, ...events]);
    setCreating(false);
    showToast(`"${item.title}" dibuat sebagai draf.`);
  }

  const stats = [
    { label: "Total acara", value: events.length, note: "undangan dibuat" },
    {
      label: "Terbit",
      value: counts.terbit,
      note: "menerima RSVP",
      dot: "bg-emerald-500",
    },
    {
      label: "Draf",
      value: counts.draf,
      note: "perlu dilengkapi",
      dot: "bg-amber-400",
    },
    { label: "Tamu hadir", value: totalConfirmed, note: "terkonfirmasi" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-brand-900 px-4 py-3 text-sm font-medium text-white shadow-2xl"
        >
          <Check className="size-4 shrink-0 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/beranda" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
              <Mail className="size-[18px]" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              UndangKuy
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Bantuan"
              onClick={() => showToast("Pusat bantuan segera hadir.")}
              className={iconBtn}
            >
              <HelpCircle className="size-[18px]" />
            </button>

            <div className="relative">
              <button
                type="button"
                aria-label="Notifikasi"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className={iconBtn}
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-600 ring-2 ring-white" />
              </button>
              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-line bg-white p-2 shadow-xl">
                    <p className="px-2.5 py-2 text-xs font-semibold text-ink-mute">
                      Terbaru
                    </p>
                    {[
                      ["Dimas & pasangan konfirmasi hadir", "Ulang Tahun ke-2 Clarissa · 5 menit lalu"],
                      ["Ucapan doa baru diterima", "Ulang Tahun Pertama Aira · 1 jam lalu"],
                    ].map(([t, s]) => (
                      <div key={t} className="rounded-lg px-2.5 py-2 hover:bg-brand-50">
                        <p className="text-[13px] font-semibold">{t}</p>
                        <p className="text-xs text-ink-soft">{s}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mx-2 h-6 w-px bg-line" />

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition hover:bg-brand-50"
              >
                <span className="grid size-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  SA
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[13px] font-semibold leading-tight">
                    Shilvia Anisa
                  </span>
                  <span className="block text-[11px] leading-tight text-ink-mute">
                    shilvia@email.com
                  </span>
                </span>
                <ChevronDown className="size-3.5 text-ink-mute" />
              </button>
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-line bg-white p-1.5 shadow-xl">
                    <button
                      type="button"
                      onClick={() => router.push("/")}
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
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
              Acara saya
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Kelola undangan, pantau RSVP, dan atur desain dalam satu tempat.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(101,67,143,0.7)] transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Buat acara baru
          </button>
        </div>

        {/* Stats */}
        <dl className="mt-7 grid grid-cols-2 divide-line rounded-2xl border border-line bg-white sm:grid-cols-4 sm:divide-x">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`px-5 py-4 ${i % 2 === 1 ? "border-l border-line sm:border-l-0" : ""} ${
                i > 1 ? "border-t border-line sm:border-t-0" : ""
              }`}
            >
              <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                {s.dot && <span className={`size-1.5 rounded-full ${s.dot}`} />}
                {s.label}
              </dt>
              <dd className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold tabular-nums">
                  {s.value}
                </span>
                <span className="text-xs text-ink-mute">{s.note}</span>
              </dd>
            </div>
          ))}
        </dl>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col gap-3 border-b border-line lg:flex-row lg:items-end lg:justify-between">
          <div role="tablist" className="-mb-px flex gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={`flex h-11 shrink-0 items-center gap-2 border-b-2 px-3.5 text-sm font-semibold transition ${
                    active
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                      active
                        ? "bg-brand-100 text-brand-700"
                        : "bg-brand-50 text-ink-mute"
                    }`}
                  >
                    {counts[t.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pb-3 lg:pb-2">
            <div className="relative flex-1 lg:w-64 lg:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari acara…"
                aria-label="Cari acara"
                className="h-10 w-full rounded-xl border border-line bg-white pl-9 pr-8 text-sm outline-none transition placeholder:text-ink-mute focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                aria-label="Urutkan"
                className="h-10 cursor-pointer appearance-none rounded-xl border border-line bg-white pl-3.5 pr-9 text-sm font-medium outline-none transition hover:border-brand-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              >
                <option value="terbaru">Terbaru dibuat</option>
                <option value="terdekat">Tanggal terdekat</option>
                <option value="tamu">Tamu terbanyak</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-mute" />
            </div>
          </div>
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Filter className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-bold">Tidak ada acara yang cocok</h3>
            <p className="mt-1 max-w-sm text-sm text-ink-soft">
              Coba ganti tab atau ubah kata kunci pencarian.
            </p>
            <button
              type="button"
              onClick={() => {
                setTab("semua");
                setQuery("");
              }}
              className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[13px] font-semibold text-brand-700 hover:bg-brand-50"
            >
              <RotateCcw className="size-3.5" />
              Reset filter
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                menuOpen={menuId === evt.id}
                onToggleMenu={() => setMenuId(menuId === evt.id ? null : evt.id)}
                onCloseMenu={() => setMenuId(null)}
                onCopyLink={() => copyLink(evt)}
                onPreview={() => {
                  setMenuId(null);
                  setPreview(evt);
                }}
                onDuplicate={() => duplicate(evt)}
                onToggleArchive={() => toggleArchive(evt.id)}
                onDelete={() => remove(evt)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-ink-mute sm:flex-row sm:px-6">
          <span>© 2026 UndangKuy</span>
          <nav className="flex gap-5">
            {["Bantuan", "Privasi", "Syarat & ketentuan"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => showToast(`${l} segera hadir.`)}
                className="hover:text-brand-700"
              >
                {l}
              </button>
            ))}
          </nav>
        </div>
      </footer>

      {preview && (
        <PreviewModal
          event={preview}
          onClose={() => setPreview(null)}
          onRsvp={() => showToast("Pratinjau: formulir RSVP terbuka.")}
        />
      )}
      {creating && (
        <CreateEventModal onClose={() => setCreating(false)} onCreate={create} />
      )}
    </div>
  );
}
