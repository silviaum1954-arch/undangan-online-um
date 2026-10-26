"use client";

import { useState } from "react";
import {
  ArrowRight,
  Baby,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  ExternalLink,
  Gift,
  Lightbulb,
  MapPin,
  MessageSquare,
  Palette,
  RefreshCw,
  Send,
  UserCheck,
  UserX,
  type LucideIcon,
} from "lucide-react";
import EventShell from "./shell";
import { EVENT } from "./event";
import { InvitationPreview, ReminderDraft } from "./overview-modals";


const RSVP = [
  { key: "hadir", label: "Fiks datang", count: 38, bar: "bg-brand-600", dot: "bg-brand-600" },
  { key: "ragu", label: "Belum pasti", count: 4, bar: "bg-amber-400", dot: "bg-amber-400" },
  { key: "tidak", label: "Berhalangan", count: 3, bar: "bg-rose-400", dot: "bg-rose-400" },
  { key: "belum", label: "Belum respons", count: 3, bar: "bg-slate-300", dot: "bg-slate-300" },
];
const TOTAL = RSVP.reduce((s, r) => s + r.count, 0);
const pct = (n: number) => Math.round((n / TOTAL) * 100);

const ACTIVITIES: {
  icon: LucideIcon;
  tone: string;
  who: string;
  what: React.ReactNode;
  when: string;
}[] = [
  {
    icon: UserCheck,
    tone: "bg-emerald-50 text-emerald-600",
    who: "Budi Pratama",
    what: "Konfirmasi hadir · 2 dewasa, 1 anak",
    when: "12 mnt lalu",
  },
  {
    icon: MessageSquare,
    tone: "bg-brand-50 text-brand-600",
    who: "Clarissa",
    what: "“Happy 21st Shilvia! Can’t wait to see you!”",
    when: "35 mnt lalu",
  },
  {
    icon: Gift,
    tone: "bg-amber-50 text-amber-600",
    who: "Om Dani",
    what: "Angpao Rp 500.000 terverifikasi via BCA",
    when: "1 jam lalu",
  },
  {
    icon: UserX,
    tone: "bg-rose-50 text-rose-600",
    who: "Maya Salsabila",
    what: "Ubah status ke berhalangan hadir",
    when: "3 jam lalu",
  },
];

const card = "rounded-2xl border border-line bg-white p-6";
const cardTitle = "text-[15px] font-bold";

export default function Overview({ slug }: { slug: string }) {
  const [toast, setToast] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function refreshPublish() {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      showToast("Publikasi diperbarui ke versi terbaru.");
    }, 700);
  }

  function sendReminder() {
    setReminderSent(true);
    showToast("Pengingat dikirim ke 3 tamu via WhatsApp.");
  }

  const checklist = [
    { done: true, title: "Lengkapi detail acara & lokasi", note: "The Glass House Bistro, 15 Okt 2026" },
    { done: true, title: "Tambah dan rapikan daftar tamu", note: "48 tamu terdaftar dengan nomor kontak" },
    { done: true, title: "Terbitkan undangan digital", note: "Aktif, tautan siap dibagikan" },
    {
      done: reminderSent,
      title: "Kirim pengingat konfirmasi akhir",
      note: reminderSent ? "Semua pengingat terkirim" : "3 tamu belum merespons",
    },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <EventShell slug={slug} active="ringkasan" eventName={EVENT.name} eventDate={EVENT.date}>
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-brand-900 px-4 py-3 text-sm font-medium text-white shadow-2xl"
        >
          <Check className="size-4 shrink-0 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Heading */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
              {EVENT.name}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Terbit
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-ink-mute" />
              Kamis, 15 Oktober 2026 · 16:00 WIB
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-ink-mute" />
              Kota Malang
            </span>
            <span className="flex items-center gap-1.5">
              <Palette className="size-3.5 text-ink-mute" />
              Strawberry Garden
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2.5">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold transition hover:border-brand-200 hover:bg-brand-50"
          >
            Lihat undangan
            <ExternalLink className="size-3.5 text-ink-mute" />
          </button>
          <button
            type="button"
            onClick={refreshPublish}
            disabled={updating}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-[13px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(101,67,143,0.7)] transition hover:bg-brand-700 disabled:opacity-70"
          >
            <RefreshCw className={`size-3.5 ${updating ? "animate-spin" : ""}`} />
            Perbarui publikasi
          </button>
        </div>
      </div>

      {/* Priority action */}
      {!reminderSent && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-brand-200">
              <Send className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold">
                3 tamu belum merespons RSVP
              </p>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                Kirim pengingat ramah via WhatsApp dalam sekali klik.{" "}
                <button
                  type="button"
                  onClick={() => setShowDraft(true)}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Lihat draf pesan
                </button>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={sendReminder}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-[13px] font-bold text-white transition hover:bg-brand-900"
          >
            Kirim pengingat
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Main column */}
        <div className="space-y-6">
          {/* RSVP */}
          <section className={card}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className={cardTitle}>Status RSVP</h2>
                <p className="mt-0.5 text-[13px] text-ink-soft">
                  {TOTAL} tamu diundang
                </p>
              </div>
              <p className="text-right">
                <span className="text-3xl font-extrabold tabular-nums text-brand-700">
                  {pct(RSVP[0].count)}%
                </span>
                <span className="block text-xs text-ink-mute">konfirmasi hadir</span>
              </p>
            </div>

            <div
              className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-brand-50"
              role="img"
              aria-label={RSVP.map((r) => `${r.label} ${r.count}`).join(", ")}
            >
              {RSVP.map((r) => (
                <div
                  key={r.key}
                  className={r.bar}
                  style={{ width: `${(r.count / TOTAL) * 100}%` }}
                />
              ))}
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {RSVP.map((r) => (
                <div key={r.key}>
                  <dt className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <span className={`size-2 rounded-full ${r.dot}`} />
                    {r.label}
                  </dt>
                  <dd className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold tabular-nums">
                      {r.count}
                    </span>
                    <span className="text-xs text-ink-mute">{pct(r.count)}%</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Catering */}
          <section className={card}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className={cardTitle}>Estimasi katering &amp; meja</h2>
                <p className="mt-0.5 text-[13px] text-ink-soft">
                  Dihitung dari tamu yang sudah konfirmasi hadir
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
              <div>
                <p className="text-4xl font-extrabold tabular-nums text-brand-700">
                  45
                </p>
                <p className="text-xs text-ink-mute">kursi / pax, termasuk pendamping</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-line p-3.5">
                  <UserCheck className="size-4 text-brand-600" />
                  <div>
                    <p className="text-sm font-bold">39 dewasa</p>
                    <p className="text-xs text-ink-mute">Porsi reguler</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-line p-3.5">
                  <Baby className="size-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold">6 anak</p>
                    <p className="text-xs text-ink-mute">Kids meal &amp; high-chair</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-brand-50 p-3.5 text-[13px] leading-relaxed text-ink-soft">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand-600" />
              <span>
                Pesan minimal{" "}
                <strong className="text-ink">48–50 pax</strong> ke vendor sebagai
                cadangan 10% untuk tamu tak terduga.
              </span>
            </p>
          </section>

          {/* Activity */}
          <section className={card}>
            <div className="flex items-center justify-between">
              <h2 className={cardTitle}>Aktivitas terbaru</h2>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                Langsung
              </span>
            </div>
            <ul className="mt-2 divide-y divide-line">
              {ACTIVITIES.map((a) => (
                <li key={a.who} className="flex items-start gap-3.5 py-3.5">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full ${a.tone}`}
                  >
                    <a.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold">{a.who}</p>
                    <p className="text-[13px] text-ink-soft">{a.what}</p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-mute">{a.when}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => showToast("Riwayat aktivitas lengkap segera hadir.")}
              className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:text-brand-900"
            >
              Lihat semua aktivitas
              <ArrowRight className="size-3.5" />
            </button>
          </section>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl bg-brand-900 p-6 text-white">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-brand-500/30 blur-2xl"
            />
            <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">
              Hitung mundur
            </p>
            <p className="relative mt-2 text-3xl font-extrabold">1 hari lagi</p>
            <p className="relative mt-1 text-[13px] text-brand-100/80">
              Mulai besok pukul 16:00 WIB di Glass House Bistro.
            </p>
            <div className="relative mt-5 grid grid-cols-3 gap-2.5">
              {[
                ["01", "Hari"],
                ["14", "Jam"],
                ["22", "Menit"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-white/10 py-3 text-center">
                  <p className="text-xl font-extrabold tabular-nums">{n}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-200">
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={card}>
            <div className="flex items-center justify-between">
              <h2 className={cardTitle}>Kesiapan acara</h2>
              <span className="text-sm font-bold tabular-nums text-brand-700">
                {doneCount}/{checklist.length}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-50">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-500"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
            <ul className="mt-4 space-y-4">
              {checklist.map((c) => (
                <li key={c.title} className="flex items-start gap-3">
                  {c.done ? (
                    <CheckCircle2 className="mt-0.5 size-[18px] shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="mt-0.5 size-[18px] shrink-0 text-ink-mute" />
                  )}
                  <div>
                    <p className="text-[13px] font-semibold">{c.title}</p>
                    <p className="text-xs text-ink-mute">{c.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {showPreview && <InvitationPreview onClose={() => setShowPreview(false)} />}
      {showDraft && (
        <ReminderDraft
          onClose={() => setShowDraft(false)}
          onCopied={() => {
            setShowDraft(false);
            showToast("Draf pesan disalin.");
          }}
        />
      )}
    </EventShell>
  );
}
