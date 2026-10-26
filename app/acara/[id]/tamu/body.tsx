"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  MessageCircle,
  Pencil,
  Plus,
  RotateCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import EventShell from "../shell";
import { EVENT } from "../event";
import {
  INITIAL_GUESTS,
  STATUS_META,
  guestSlug,
  initials,
  type Guest,
  type RsvpStatus,
} from "./data";
import {
  BroadcastModal,
  ExportModal,
  GuestFormModal,
  WhatsAppModal,
  type GuestFormValues,
} from "./modals";

type Filter = "all" | RsvpStatus;

const PAGE_SIZE = 10;

const iconBtn =
  "grid size-8 place-items-center rounded-lg text-ink-mute transition hover:bg-brand-50 hover:text-brand-700";

export default function DaftarTamuPage({ slug }: { slug: string }) {
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [quota, setQuota] = useState("all");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [waGuest, setWaGuest] = useState<Guest | null>(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showExport, setShowExport] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  const stats = useMemo(() => {
    const by = (s: RsvpStatus) => guests.filter((x) => x.status === s);
    const people = (s: RsvpStatus) =>
      by(s).reduce((n, x) => n + (x.totalHadir ?? 0), 0);
    return {
      all: { count: guests.length, people: null as number | null },
      fiks: { count: by("fiks").length, people: people("fiks") },
      ragu: { count: by("ragu").length, people: people("ragu") },
      batal: { count: by("batal").length, people: null },
      pending: { count: by("pending").length, people: null },
    };
  }, [guests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter(
      (x) =>
        (!q ||
          x.name.toLowerCase().includes(q) ||
          x.phone.includes(q) ||
          x.category.toLowerCase().includes(q)) &&
        (filter === "all" || x.status === filter) &&
        (quota === "all" ||
          (quota === "2" ? x.quota <= 2 : x.quota >= 3)),
    );
  }, [guests, query, filter, quota]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const allSelected = rows.length > 0 && rows.every((x) => selected.includes(x.id));
  const selectedGuests = guests.filter((x) => selected.includes(x.id));

  function toggleAll() {
    setSelected(
      allSelected
        ? selected.filter((id) => !rows.some((x) => x.id === id))
        : [...new Set([...selected, ...rows.map((x) => x.id)])],
    );
  }

  function toggleRow(id: string) {
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function bulkDelete() {
    const n = selected.length;
    setGuests((p) => p.filter((x) => !selected.includes(x.id)));
    setSelected([]);
    showToast(`${n} tamu dihapus dari daftar.`);
  }

  function refresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast("Status RSVP diperbarui.");
    }, 600);
  }

  function copyLink(x: Guest) {
    navigator.clipboard?.writeText(`https://undang.kuy/${x.slug}`);
    showToast(`Tautan ${x.name} disalin.`);
  }

  function saveGuest(v: GuestFormValues) {
    if (editing) {
      setGuests((p) =>
        p.map((x) =>
          x.id !== editing.id
            ? x
            : {
                ...x,
                ...v,
                totalHadir:
                  v.status === "fiks"
                    ? (x.totalHadir ?? v.quota)
                    : v.status === "batal"
                      ? 0
                      : v.status === "ragu"
                        ? 1
                        : null,
              },
        ),
      );
      showToast(`Data "${v.name}" diperbarui.`);
    } else {
      setGuests((p) => [
        {
          id: `g-${crypto.randomUUID()}`,
          ...v,
          phone: v.phone || "+62 812-0000-0000",
          status: "pending",
          anak: null,
          dewasa: null,
          totalHadir: null,
          slug: guestSlug(v.name),
        },
        ...p,
      ]);
      showToast(`"${v.name}" ditambahkan.`);
    }
    setFormOpen(false);
    setEditing(null);
  }

  const tabs: { id: Filter; label: string; dot?: string }[] = [
    { id: "all", label: "Semua tamu" },
    { id: "fiks", label: "Fiks datang", dot: STATUS_META.fiks.dot },
    { id: "ragu", label: "Belum pasti", dot: STATUS_META.ragu.dot },
    { id: "batal", label: "Berhalangan", dot: STATUS_META.batal.dot },
    { id: "pending", label: "Belum respons", dot: STATUS_META.pending.dot },
  ];

  return (
    <>
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-brand-900 px-4 py-3 text-sm font-medium text-white shadow-2xl"
        >
          <Check className="size-4 shrink-0 text-emerald-400" />
          {toast}
        </div>
      )}

      <EventShell
        slug={slug}
        active="tamu"
        eventName={EVENT.name}
        eventDate={EVENT.date}
        wide
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
              Daftar tamu
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Kelola undangan personal dan pantau konfirmasi kehadiran.
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setShowExport(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold transition hover:border-brand-200 hover:bg-brand-50"
            >
              <Download className="size-4 text-ink-mute" />
              Ekspor
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-[13px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(101,67,143,0.7)] transition hover:bg-brand-700"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              Tambah tamu
            </button>
          </div>
        </div>

        {/* Status filter strip */}
        <div
          role="tablist"
          aria-label="Filter status RSVP"
          className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5"
        >
          {tabs.map((t, i) => {
            const s = stats[t.id];
            const on = filter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setFilter(t.id);
                  setPage(1);
                }}
                className={`relative px-5 py-4 text-left transition ${
                  i === tabs.length - 1 ? "col-span-2 lg:col-span-1" : ""
                } ${on ? "bg-brand-50" : "bg-white hover:bg-brand-50/50"}`}
              >
                <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                  {t.dot && <span className={`size-1.5 rounded-full ${t.dot}`} />}
                  {t.label}
                </span>
                <span className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold tabular-nums">
                    {s.count}
                  </span>
                  <span className="text-xs text-ink-mute">
                    {s.people !== null ? `${s.people} orang` : "tamu"}
                  </span>
                </span>
                {on && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama, kategori, atau nomor WhatsApp…"
              aria-label="Cari tamu"
              className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-9 text-sm outline-none transition placeholder:text-ink-mute focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
            {query && (
              <button
                type="button"
                aria-label="Hapus pencarian"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-2.5">
            <div className="relative">
              <select
                value={quota}
                onChange={(e) => {
                  setQuota(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter kuota"
                className="h-10 cursor-pointer appearance-none rounded-xl border border-line bg-white pl-3.5 pr-9 text-sm font-medium outline-none transition hover:border-brand-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              >
                <option value="all">Semua kuota</option>
                <option value="2">1–2 orang</option>
                <option value="4">3+ orang</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-mute" />
            </div>
            <button
              type="button"
              onClick={refresh}
              aria-label="Muat ulang status RSVP"
              className="grid size-10 place-items-center rounded-xl border border-line bg-white text-ink-soft transition hover:border-brand-200 hover:text-brand-700"
            >
              <RotateCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Bulk bar */}
        {selected.length > 0 && (
          <div className="mt-3 flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[13px] font-semibold text-brand-900">
              {selected.length} tamu dipilih
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBroadcast(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-100"
              >
                <Copy className="size-3.5" /> Pesan pengingat
              </button>
              <button
                type="button"
                onClick={bulkDelete}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50"
              >
                <Trash2 className="size-3.5" /> Hapus
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                aria-label="Batal pilih"
                className="grid size-8 place-items-center rounded-lg text-brand-700 hover:bg-brand-100"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-brand-50/50 text-xs font-semibold text-ink-soft">
                  <th className="w-12 py-3 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Pilih semua tamu di halaman ini"
                      className="size-4 cursor-pointer rounded accent-brand-600"
                    />
                  </th>
                  <th className="px-3 py-3 font-semibold">Tamu</th>
                  <th className="px-3 py-3 font-semibold">WhatsApp</th>
                  <th className="px-3 py-3 font-semibold">Kuota</th>
                  <th className="px-3 py-3 font-semibold">Status RSVP</th>
                  <th className="px-3 py-3 font-semibold">Kehadiran</th>
                  <th className="px-3 py-3 pr-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center">
                      <AlertCircle className="mx-auto size-7 text-ink-mute" />
                      <p className="mt-2 text-sm font-semibold">
                        Tidak ada tamu yang cocok
                      </p>
                      <p className="text-[13px] text-ink-soft">
                        Ubah kata kunci atau filter status.
                      </p>
                    </td>
                  </tr>
                ) : (
                  rows.map((x) => {
                    const m = STATUS_META[x.status];
                    const on = selected.includes(x.id);
                    return (
                      <tr
                        key={x.id}
                        className={`transition ${on ? "bg-brand-50/50" : "hover:bg-brand-50/30"}`}
                      >
                        <td className="py-3 pl-4 pr-2">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggleRow(x.id)}
                            aria-label={`Pilih ${x.name}`}
                            className="size-4 cursor-pointer rounded accent-brand-600"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                              {initials(x.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{x.name}</p>
                              <p className="text-xs text-ink-mute">{x.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[13px] tabular-nums text-ink-soft">
                          {x.phone}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[13px] text-ink-soft">
                          {x.quota} orang
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${m.badge}`}
                          >
                            <span className={`size-1.5 rounded-full ${m.dot}`} />
                            {m.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {x.totalHadir === null ? (
                            <span className="text-ink-mute">—</span>
                          ) : (
                            <div>
                              <p className={`text-[13px] font-bold ${m.text}`}>
                                {x.totalHadir} hadir
                              </p>
                              {x.status !== "batal" && (
                                <p className="text-xs text-ink-mute">
                                  {x.dewasa} dewasa · {x.anak} anak
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 pr-4">
                          <div className="flex justify-end gap-0.5">
                            <button
                              type="button"
                              onClick={() => copyLink(x)}
                              title="Salin tautan personal"
                              aria-label={`Salin tautan ${x.name}`}
                              className={iconBtn}
                            >
                              <Copy className="size-4" />
                            </button>
                            <a
                              href={`/e/${slug}?to=${encodeURIComponent(x.name)}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Pratinjau undangan"
                              aria-label={`Pratinjau undangan ${x.name}`}
                              className={iconBtn}
                            >
                              <ExternalLink className="size-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => setWaGuest(x)}
                              title="Kirim via WhatsApp"
                              aria-label={`Kirim WhatsApp ke ${x.name}`}
                              className={`${iconBtn} hover:bg-emerald-50 hover:text-emerald-700`}
                            >
                              <MessageCircle className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditing(x);
                                setFormOpen(true);
                              }}
                              title="Edit tamu"
                              aria-label={`Edit ${x.name}`}
                              className={iconBtn}
                            >
                              <Pencil className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-line px-4 py-3 text-[13px] text-ink-soft sm:flex-row sm:items-center sm:justify-between">
            <p>
              Menampilkan{" "}
              <span className="font-semibold text-ink">
                {filtered.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1}–
                {(current - 1) * PAGE_SIZE + rows.length}
              </span>{" "}
              dari <span className="font-semibold text-ink">{filtered.length}</span>{" "}
              tamu
            </p>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={current === 1}
                  onClick={() => setPage(current - 1)}
                  aria-label="Halaman sebelumnya"
                  className="grid size-8 place-items-center rounded-lg hover:bg-brand-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={n === current ? "page" : undefined}
                    className={`grid size-8 place-items-center rounded-lg text-xs font-semibold ${
                      n === current
                        ? "bg-brand-600 text-white"
                        : "hover:bg-brand-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={current === pages}
                  onClick={() => setPage(current + 1)}
                  aria-label="Halaman berikutnya"
                  className="grid size-8 place-items-center rounded-lg hover:bg-brand-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </EventShell>

      {formOpen && (
        <GuestFormModal
          key={editing?.id ?? "new"}
          guest={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={saveGuest}
        />
      )}
      {waGuest && (
        <WhatsAppModal
          guest={waGuest}
          onClose={() => setWaGuest(null)}
          onCopied={() => showToast("Teks pesan disalin.")}
        />
      )}
      {showBroadcast && (
        <BroadcastModal
          guests={selectedGuests}
          onClose={() => setShowBroadcast(false)}
          onCopy={() => {
            setShowBroadcast(false);
            showToast(`Teks pengingat untuk ${selectedGuests.length} tamu disalin.`);
          }}
        />
      )}
      {showExport && (
        <ExportModal
          count={guests.length}
          onClose={() => setShowExport(false)}
          onExport={() => {
            setShowExport(false);
            showToast(`Data ${guests.length} tamu berhasil diunduh.`);
          }}
        />
      )}
    </>
  );
}
