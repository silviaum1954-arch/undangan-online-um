"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Heart,
  MessageSquare,
  RotateCw,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import EventShell from "../shell";
import { EVENT } from "../event";
import Switch from "../switch";
import { INITIAL_WISHES, initials, type Wish } from "./data";

type Tab = "semua" | Wish["status"];
type Sort = "terbaru" | "terlama" | "nama";

const PAGE_SIZE = 10;

const selectCls =
  "h-10 cursor-pointer appearance-none rounded-xl border border-line bg-white pl-3.5 pr-9 text-sm font-medium outline-none transition hover:border-brand-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export default function ModerasiUcapanPage({ slug }: { slug: string }) {
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [tab, setTab] = useState<Tab>("semua");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("terbaru");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  const [autoPublish, setAutoPublish] = useState(true);
  const [manualApproval, setManualApproval] = useState(false);
  const [closeWishes, setCloseWishes] = useState(false);
  const [spamFilter, setSpamFilter] = useState(true);
  const [charLimit, setCharLimit] = useState("300");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  const counts = useMemo(
    () => ({
      semua: wishes.length,
      tampil: wishes.filter((w) => w.status === "tampil").length,
      disembunyikan: wishes.filter((w) => w.status === "disembunyikan").length,
    }),
    [wishes],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return wishes
      .filter(
        (w) =>
          (tab === "semua" || w.status === tab) &&
          (!q ||
            w.sender.toLowerCase().includes(q) ||
            w.message.toLowerCase().includes(q) ||
            w.tag.toLowerCase().includes(q)),
      )
      .sort((a, b) =>
        sort === "terlama"
          ? b.minutes - a.minutes
          : sort === "nama"
            ? a.sender.localeCompare(b.sender)
            : a.minutes - b.minutes,
      );
  }, [wishes, tab, query, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function toggleStatus(w: Wish) {
    const next = w.status === "tampil" ? "disembunyikan" : "tampil";
    setWishes((p) => p.map((x) => (x.id === w.id ? { ...x, status: next } : x)));
    showToast(
      next === "tampil"
        ? `Ucapan "${w.sender}" kini ditampilkan.`
        : `Ucapan "${w.sender}" disembunyikan.`,
    );
  }

  function remove(w: Wish) {
    if (!confirm(`Hapus ucapan dari "${w.sender}"?`)) return;
    setWishes((p) => p.filter((x) => x.id !== w.id));
    showToast(`Ucapan "${w.sender}" dihapus.`);
  }

  function like(id: string) {
    setWishes((p) => p.map((x) => (x.id === id ? { ...x, liked: !x.liked } : x)));
  }

  function refresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast("Daftar ucapan diperbarui.");
    }, 600);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "semua", label: "Semua" },
    { id: "tampil", label: "Tampil" },
    { id: "disembunyikan", label: "Disembunyikan" },
  ];

  const settings = [
    {
      label: "Langsung tampil",
      desc: "Ucapan baru langsung terbit di undangan tanpa persetujuan.",
      checked: autoPublish,
      set: (v: boolean) => {
        setAutoPublish(v);
        if (v) setManualApproval(false);
      },
    },
    {
      label: "Setujui dulu",
      desc: "Ucapan harus Anda setujui sebelum bisa dibaca tamu lain.",
      checked: manualApproval,
      set: (v: boolean) => {
        setManualApproval(v);
        if (v) setAutoPublish(false);
      },
    },
    {
      label: "Tutup kolom ucapan",
      desc: "Matikan form ucapan, misalnya setelah acara selesai.",
      checked: closeWishes,
      set: setCloseWishes,
    },
    {
      label: "Filter spam & kata kasar",
      desc: "Pesan mencurigakan otomatis masuk ke Disembunyikan.",
      checked: spamFilter,
      set: setSpamFilter,
    },
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
        active="ucapan"
        eventName={EVENT.name}
        eventDate={EVENT.date}
        wide
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
              Buku ucapan
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Baca, moderasi, dan kelola doa dari para tamu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowExport(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold transition hover:border-brand-200 hover:bg-brand-50"
          >
            <Download className="size-4 text-ink-mute" />
            Ekspor
          </button>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Feed */}
          <div className="min-w-0">
            <div className="border-b border-line">
              <div role="tablist" className="-mb-px flex gap-1 overflow-x-auto">
                {tabs.map((t) => {
                  const on = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => {
                        setTab(t.id);
                        setPage(1);
                      }}
                      className={`flex h-11 shrink-0 items-center gap-2 border-b-2 px-3.5 text-sm font-semibold transition ${
                        on
                          ? "border-brand-600 text-brand-700"
                          : "border-transparent text-ink-soft hover:text-ink"
                      }`}
                    >
                      {t.label}
                      <span
                        className={`rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                          on ? "bg-brand-100 text-brand-700" : "bg-brand-50 text-ink-mute"
                        }`}
                      >
                        {counts[t.id]}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            <div className="mt-4 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Cari ucapan…"
                    aria-label="Cari ucapan"
                    className="h-10 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-ink-mute focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  />
                </div>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    aria-label="Urutkan ucapan"
                    className={selectCls}
                  >
                    <option value="terbaru">Terbaru</option>
                    <option value="terlama">Terlama</option>
                    <option value="nama">Nama A–Z</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-mute" />
                </div>
                <button
                  type="button"
                  onClick={refresh}
                  aria-label="Muat ulang"
                  className="grid size-10 place-items-center rounded-xl border border-line bg-white text-ink-soft transition hover:border-brand-200 hover:text-brand-700"
                >
                  <RotateCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
                </button>
            </div>

            <ul className="mt-5 space-y-3">
              {rows.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-14 text-center">
                  <MessageSquare className="mx-auto size-7 text-ink-mute" />
                  <p className="mt-2 text-sm font-semibold">Tidak ada ucapan</p>
                  <p className="text-[13px] text-ink-soft">
                    Ganti tab atau kata kunci pencarian.
                  </p>
                </li>
              ) : (
                rows.map((w) => {
                  const hidden = w.status === "disembunyikan";
                  return (
                    <li
                      key={w.id}
                      className={`rounded-2xl border p-5 transition ${
                        hidden
                          ? "border-line bg-white/60"
                          : "border-line bg-white hover:border-brand-200"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                          {initials(w.sender)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h3 className="text-sm font-bold">{w.sender}</h3>
                            {w.isSpam ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
                                <ShieldAlert className="size-3" />
                                {w.tag}
                              </span>
                            ) : (
                              <span className="text-xs text-ink-mute">· {w.tag}</span>
                            )}
                            {hidden && !w.isSpam && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                Disembunyikan
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-ink-mute">{w.timeAgo}</p>
                          <p
                            className={`mt-3 text-sm leading-relaxed ${
                              hidden ? "text-ink-mute" : "text-ink-soft"
                            }`}
                          >
                            {w.message}
                          </p>
                          {hidden && (
                            <p className="mt-2 text-xs text-ink-mute">
                              Tidak terlihat oleh tamu di undangan.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                        <button
                          type="button"
                          onClick={() => like(w.id)}
                          aria-pressed={w.liked}
                          className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition ${
                            w.liked
                              ? "bg-rose-50 text-rose-600"
                              : "text-ink-mute hover:bg-brand-50 hover:text-rose-500"
                          }`}
                        >
                          <Heart className={`size-3.5 ${w.liked ? "fill-current" : ""}`} />
                          {w.liked ? "Disukai" : "Sukai"}
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleStatus(w)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
                          >
                            {hidden ? (
                              <Eye className="size-3.5" />
                            ) : (
                              <EyeOff className="size-3.5" />
                            )}
                            {hidden ? "Tampilkan" : "Sembunyikan"}
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(w)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 className="size-3.5" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>

            {pages > 1 && (
              <div className="mt-4 flex items-center justify-between text-[13px] text-ink-soft">
                <p>
                  Halaman <span className="font-semibold text-ink">{current}</span>{" "}
                  dari {pages}
                </p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={current === 1}
                    onClick={() => setPage(current - 1)}
                    aria-label="Halaman sebelumnya"
                    className="grid size-8 place-items-center rounded-lg hover:bg-brand-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={current === pages}
                    onClick={() => setPage(current + 1)}
                    aria-label="Halaman berikutnya"
                    className="grid size-8 place-items-center rounded-lg hover:bg-brand-50 disabled:opacity-40"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-[15px] font-bold">Pengaturan ucapan</h2>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                Atur bagaimana ucapan tamu diterbitkan.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast("Pengaturan buku ucapan disimpan.");
                }}
                className="mt-5"
              >
                <ul className="divide-y divide-line">
                  {settings.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-start justify-between gap-4 py-3.5 first:pt-0"
                    >
                      <div>
                        <p className="text-[13px] font-semibold">{s.label}</p>
                        <p className="mt-0.5 text-xs leading-snug text-ink-mute">
                          {s.desc}
                        </p>
                      </div>
                      <Switch checked={s.checked} onChange={s.set} label={s.label} />
                    </li>
                  ))}
                </ul>

                <div className="mt-1 border-t border-line pt-4">
                  <label
                    htmlFor="char-limit"
                    className="mb-1.5 block text-[13px] font-semibold"
                  >
                    Batas karakter
                  </label>
                  <div className="relative">
                    <select
                      id="char-limit"
                      value={charLimit}
                      onChange={(e) => setCharLimit(e.target.value)}
                      className={`${selectCls} w-full`}
                    >
                      <option value="150">150 karakter (singkat)</option>
                      <option value="300">300 karakter (disarankan)</option>
                      <option value="500">500 karakter (panjang)</option>
                      <option value="unlimited">Tanpa batas</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-mute" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-4 h-11 w-full rounded-xl bg-brand-600 text-[13px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(101,67,143,0.7)] transition hover:bg-brand-700"
                >
                  Simpan pengaturan
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-line bg-white p-5">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-ink-soft">Rata-rata masuk</dt>
                  <dd className="mt-1">
                    <span className="text-xl font-extrabold tabular-nums">4,8</span>
                    <span className="text-xs text-ink-mute"> / jam</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Spam dicegat</dt>
                  <dd className="mt-1">
                    <span className="text-xl font-extrabold tabular-nums">1</span>
                    <span className="text-xs text-ink-mute"> hari ini</span>
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </EventShell>

      {showExport && (
        <ExportDialog
          count={wishes.length}
          onClose={() => setShowExport(false)}
          onExport={() => {
            setShowExport(false);
            showToast(`${wishes.length} ucapan berhasil diunduh.`);
          }}
        />
      )}
    </>
  );
}

function ExportDialog({
  count,
  onClose,
  onExport,
}: {
  count: number;
  onClose: () => void;
  onExport: () => void;
}) {
  const [format, setFormat] = useState<"xlsx" | "pdf">("xlsx");
  const opts = [
    { id: "xlsx" as const, icon: FileSpreadsheet, name: "Excel (.xlsx)", note: "Data tabel lengkap" },
    { id: "pdf" as const, icon: FileText, name: "Dokumen PDF", note: "Siap dicetak" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ekspor buku ucapan"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">Ekspor buku ucapan</h2>
            <p className="text-[13px] text-ink-soft">{count} ucapan akan diunduh.</p>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-ink-mute hover:bg-brand-50"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {opts.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={format === o.id}
              onClick={() => setFormat(o.id)}
              className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                format === o.id
                  ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100"
                  : "border-line hover:border-brand-200"
              }`}
            >
              <o.icon className="size-5 text-brand-600" />
              <span>
                <span className="block text-[13px] font-bold">{o.name}</span>
                <span className="block text-[11px] text-ink-mute">{o.note}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-2.5">
          {["Sertakan ucapan yang disembunyikan", "Sertakan label status RSVP tamu"].map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-soft">
              <input
                type="checkbox"
                defaultChecked
                className="size-4 rounded border-line accent-brand-600"
              />
              {t}
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2.5 border-t border-line pt-5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl px-4 text-[13px] font-semibold text-ink-soft hover:bg-brand-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-5 text-[13px] font-bold text-white hover:bg-brand-700"
          >
            <Download className="size-4" /> Unduh
          </button>
        </div>
      </div>
    </div>
  );
}
