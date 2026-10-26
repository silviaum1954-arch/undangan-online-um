"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useSignOut } from "@/lib/supabase/use-user";
import {
  Check,
  ChevronDown,
  Filter,
  LogOut,
  Mail,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Notifications from "../notifications";
import { removeEventFiles } from "@/lib/supabase/event-files";
import { uniqueSlug } from "@/lib/format";
import { toEventItem, type EventItem, type EventStatus } from "@/lib/data/events";
import EventCard from "./event-card";
import { CreateEventModal } from "./modals";

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

export default function BerandaClient({
  initialEvents,
}: {
  initialEvents: EventItem[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const user = useCurrentUser();
  const signOut = useSignOut();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [tab, setTab] = useState<Tab>("semua");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("terbaru");

  const [menuId, setMenuId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
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
    const link = `${window.location.origin}/e/${e.slug}`;
    navigator.clipboard?.writeText(link);
    showToast(`Tautan "${e.title}" disalin.`);
    setMenuId(null);
  }

  async function duplicate(e: EventItem) {
    setMenuId(null);
    const { data: src, error: readError } = await supabase
      .from("events")
      .select("*")
      .eq("id", e.id)
      .single();
    if (readError) return showToast(`Gagal menduplikasi: ${readError.message}`);

    const { data, error } = await supabase
      .from("events")
      .insert({
        title: `${src.title} (salinan)`,
        slug: uniqueSlug(src.title),
        status: "draf",
        event_date: src.event_date,
        event_time: src.event_time,
        venue_name: src.venue_name,
        venue_address: src.venue_address,
        maps_url: src.maps_url,
        theme: src.theme,
        design: src.design,
        auto_close: src.auto_close,
        close_timing: src.close_timing,
        remind_archive: src.remind_archive,
        og_title: src.og_title,
        og_description: src.og_description,
        total_quota: src.total_quota,
        max_pax: src.max_pax,
        wishes_auto_publish: src.wishes_auto_publish,
        wishes_manual_approval: src.wishes_manual_approval,
        wishes_spam_filter: src.wishes_spam_filter,
        wishes_char_limit: src.wishes_char_limit,
        gift_enabled: src.gift_enabled,
        gift_personal_only: src.gift_personal_only,
        gift_transfer_form: src.gift_transfer_form,
        gift_email_notify: src.gift_email_notify,
      })
      .select()
      .single();
    if (error) return showToast(`Gagal menduplikasi: ${error.message}`);

    setEvents((p) => [toEventItem(data, { confirmed: 0, total: 0 }), ...p]);
    showToast(`"${e.title}" diduplikasi sebagai draf.`);
  }

  async function toggleArchive(e: EventItem) {
    setMenuId(null);
    const next = e.status === "diarsipkan" ? "selesai" : "diarsipkan";
    const { data, error } = await supabase
      .from("events")
      .update({
        status: next,
        archived_at: next === "diarsipkan" ? new Date().toISOString() : null,
      })
      .eq("id", e.id)
      .select()
      .single();
    if (error) return showToast(`Gagal memperbarui arsip: ${error.message}`);

    const updated = toEventItem(data, { confirmed: e.confirmed, total: 0 });
    setEvents((p) => p.map((x) => (x.id === e.id ? updated : x)));
    showToast(next === "diarsipkan" ? "Acara diarsipkan." : "Acara dipulihkan dari arsip.");
  }

  async function remove(e: EventItem) {
    setMenuId(null);
    if (!confirm(`Hapus undangan "${e.title}"? Semua tamu, ucapan, dan data angpaonya ikut terhapus.`)) return;
    const { error } = await supabase.from("events").delete().eq("id", e.id);
    if (error) return showToast(`Gagal menghapus: ${error.message}`);
    await removeEventFiles(supabase, e.id);
    setEvents((p) => p.filter((x) => x.id !== e.id));
    showToast(`"${e.title}" dihapus.`);
  }

  async function create(v: { title: string; date: string; theme: string }) {
    const slug = uniqueSlug(v.title);
    const { error } = await supabase
      .from("events")
      .insert({ title: v.title, slug, event_date: v.date, theme: v.theme });
    if (error) return showToast(`Gagal membuat acara: ${error.message}`);
    setCreating(false);
    router.push(`/acara/${slug}/edit`);
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
            <Notifications className={iconBtn} />

            <div className="mx-2 h-6 w-px bg-line" />

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                }}
                className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition hover:bg-brand-50"
              >
                <span className="grid size-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {user?.initials ?? ""}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[13px] font-semibold leading-tight">
                    {user?.name ?? ""}
                  </span>
                  <span className="block text-[11px] leading-tight text-ink-mute">
                    {user?.email ?? ""}
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
        {events.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Mail className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-bold">Belum ada acara</h3>
            <p className="mt-1 max-w-sm text-sm text-ink-soft">
              Buat undangan pertama Anda, lalu undang tamu dan pantau RSVP dari sini.
            </p>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-[13px] font-bold text-white hover:bg-brand-700"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              Buat acara pertama
            </button>
          </div>
        ) : visible.length === 0 ? (
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
                  window.open(`/e/${evt.slug}`, "_blank", "noopener");
                }}
                onDuplicate={() => duplicate(evt)}
                onToggleArchive={() => toggleArchive(evt)}
                onDelete={() => remove(evt)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-ink-mute sm:flex-row sm:px-6">
          <span>© 2026 UndangKuy</span>
          <span>Platform undangan digital untuk acara ulang tahun</span>
        </div>
      </footer>
      {creating && (
        <CreateEventModal onClose={() => setCreating(false)} onCreate={create} />
      )}
    </div>
  );
}
