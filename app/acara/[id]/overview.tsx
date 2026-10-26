"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Users,
  type LucideIcon,
} from "lucide-react";
import EventShell from "./shell";
import { createClient } from "@/lib/supabase/client";
import { countdown } from "@/lib/format";
import { themeById } from "@/lib/themes";
import type { ShellEvent } from "@/lib/data/events";
import { ReminderDraft } from "./overview-modals";
import type { ActivityKind, OverviewData } from "./overview-data";

const ACTIVITY_STYLE: Record<ActivityKind, { icon: LucideIcon; tone: string }> = {
  hadir: { icon: UserCheck, tone: "bg-emerald-50 text-emerald-600" },
  ragu: { icon: UserCheck, tone: "bg-amber-50 text-amber-600" },
  batal: { icon: UserX, tone: "bg-rose-50 text-rose-600" },
  wish: { icon: MessageSquare, tone: "bg-brand-50 text-brand-600" },
  gift: { icon: Gift, tone: "bg-amber-50 text-amber-600" },
};

const STATUS_CHIP = {
  draf: { label: "Draf", cls: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-400" },
  terbit: { label: "Terbit", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  selesai: { label: "Selesai", cls: "bg-brand-50 text-brand-700 ring-brand-200", dot: "bg-brand-500" },
  diarsipkan: { label: "Diarsipkan", cls: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
} as const;

const card = "rounded-2xl border border-line bg-white p-6";
const cardTitle = "text-[15px] font-bold";

/** Minute-resolution clock; 0 on the server so hydration stays consistent. */
function subscribe(cb: () => void) {
  const t = setInterval(cb, 30000);
  return () => clearInterval(t);
}
const getNow = () => Math.floor(Date.now() / 60000) * 60000;
const getServerNow = () => 0;

export default function Overview({
  slug,
  shell,
  data,
}: {
  slug: string;
  shell: ShellEvent;
  data: OverviewData;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);

  const [toast, setToast] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showDraft, setShowDraft] = useState(false);

  const { event, rsvp, catering, activities } = data;
  const status = STATUS_CHIP[event.status];
  const total = rsvp.hadir + rsvp.ragu + rsvp.batal + rsvp.pending;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const cd = countdown(event.dateISO, now, event.time);
  
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  async function publish() {
    setUpdating(true);
    const { error } = await supabase
      .from("events")
      .update({ status: "terbit", published_at: new Date().toISOString() })
      .eq("id", event.id);
    setUpdating(false);
    if (error) return showToast(`Gagal menerbitkan: ${error.message}`);
    showToast(event.status === "draf" ? "Undangan diterbitkan." : "Publikasi diperbarui.");
    router.refresh();
  }

  const buildReminder = (link: string) => [
    "Halo Kak [Nama Tamu]! 👋",
    "",
    `Mengingatkan kembali bahwa acara *${event.title}* akan berlangsung:`,
    "",
    `📅 *${event.dateLabel}*`,
    event.time ? `⏰ *${event.time}*` : null,
    event.venueName
      ? `📍 *${event.venueName}${event.venueAddress ? `, ${event.venueAddress}` : ""}*`
      : null,
    "",
    "Mohon konfirmasi kehadiran Kakak melalui tautan berikut:",
    `🔗 ${link}`,
    "",
    "Terima kasih dan sampai jumpa! ✨",
  ]
    .filter((l) => l !== null)
    .join("\n");

  const checklist = [
    {
      done: !!event.venueName,
      title: "Lengkapi detail acara & lokasi",
      note: event.venueName
        ? `${event.venueName}, ${event.dateLabel}`
        : "Isi nama dan alamat tempat di Edit undangan",
    },
    {
      done: total > 0,
      title: "Tambah dan rapikan daftar tamu",
      note: total > 0 ? `${total} tamu terdaftar` : "Belum ada tamu",
    },
    {
      done: event.status !== "draf",
      title: "Terbitkan undangan digital",
      note: event.status !== "draf" ? "Aktif, tautan siap dibagikan" : "Masih berstatus draf",
    },
    {
      done: total > 0 && rsvp.pending === 0,
      title: "Semua tamu sudah merespons",
      note:
        total === 0
          ? "Menunggu tamu ditambahkan"
          : rsvp.pending === 0
            ? "Semua tamu sudah merespons"
            : `${rsvp.pending} tamu belum merespons`,
    },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  const rsvpRows = [
    { key: "hadir", label: "Fiks datang", count: rsvp.hadir, bar: "bg-brand-600", dot: "bg-brand-600" },
    { key: "ragu", label: "Belum pasti", count: rsvp.ragu, bar: "bg-amber-400", dot: "bg-amber-400" },
    { key: "batal", label: "Berhalangan", count: rsvp.batal, bar: "bg-rose-400", dot: "bg-rose-400" },
    { key: "pending", label: "Belum respons", count: rsvp.pending, bar: "bg-slate-300", dot: "bg-slate-300" },
  ];

  const bannerGuests = total === 0;
  const bannerPending = !bannerGuests && rsvp.pending > 0 && event.status === "terbit";

  return (
    <EventShell slug={slug} active="ringkasan" event={shell}>
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
              {event.title}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${status.cls}`}
            >
              <span className={`size-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-ink-mute" />
              {event.dateLabel}
              {event.time ? ` · ${event.time}` : ""}
            </span>
            {event.venueName && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-ink-mute" />
                {event.venueName}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Palette className="size-3.5 text-ink-mute" />
              {themeById(event.themeId).name}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2.5">
          <a
            href={`/e/${event.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold transition hover:border-brand-200 hover:bg-brand-50"
          >
            Lihat undangan
            <ExternalLink className="size-3.5 text-ink-mute" />
          </a>
          {(event.status === "draf" || event.status === "terbit") && (
            <button
              type="button"
              onClick={publish}
              disabled={updating}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-[13px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(101,67,143,0.7)] transition hover:bg-brand-700 disabled:opacity-70"
            >
              <RefreshCw className={`size-3.5 ${updating ? "animate-spin" : ""}`} />
              {event.status === "draf" ? "Terbitkan undangan" : "Perbarui publikasi"}
            </button>
          )}
        </div>
      </div>

      {/* Priority action */}
      {(bannerGuests || bannerPending) && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-brand-200">
              {bannerGuests ? <Users className="size-4" /> : <Send className="size-4" />}
            </span>
            <div>
              <p className="text-sm font-bold">
                {bannerGuests
                  ? "Belum ada tamu yang diundang"
                  : `${rsvp.pending} tamu belum merespons RSVP`}
              </p>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                {bannerGuests ? (
                  "Tambahkan tamu agar bisa membagikan tautan undangan personal."
                ) : (
                  <>
                    Salin pesan pengingat lalu kirim lewat WhatsApp.{" "}
                    <button
                      type="button"
                      onClick={() => setShowDraft(true)}
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      Lihat draf pesan
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
          <Link
            href={`/acara/${slug}/tamu`}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-[13px] font-bold text-white transition hover:bg-brand-900"
          >
            {bannerGuests ? "Tambah tamu" : "Buka daftar tamu"}
            <ArrowRight className="size-3.5" />
          </Link>
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
                  {total} tamu diundang
                </p>
              </div>
              <p className="text-right">
                <span className="text-3xl font-extrabold tabular-nums text-brand-700">
                  {total ? `${pct(rsvp.hadir)}%` : "—"}
                </span>
                <span className="block text-xs text-ink-mute">konfirmasi hadir</span>
              </p>
            </div>

            <div
              className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-brand-50"
              role="img"
              aria-label={rsvpRows.map((r) => `${r.label} ${r.count}`).join(", ")}
            >
              {total > 0 &&
                rsvpRows.map((r) => (
                  <div
                    key={r.key}
                    className={r.bar}
                    style={{ width: `${(r.count / total) * 100}%` }}
                  />
                ))}
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {rsvpRows.map((r) => (
                <div key={r.key}>
                  <dt className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <span className={`size-2 rounded-full ${r.dot}`} />
                    {r.label}
                  </dt>
                  <dd className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold tabular-nums">{r.count}</span>
                    <span className="text-xs text-ink-mute">{pct(r.count)}%</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Catering */}
          <section className={card}>
            <h2 className={cardTitle}>Estimasi katering &amp; meja</h2>
            <p className="mt-0.5 text-[13px] text-ink-soft">
              Dihitung dari tamu yang sudah konfirmasi hadir
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
              <div>
                <p className="text-4xl font-extrabold tabular-nums text-brand-700">
                  {catering.pax}
                </p>
                <p className="text-xs text-ink-mute">kursi / pax, termasuk pendamping</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-line p-3.5">
                  <UserCheck className="size-4 text-brand-600" />
                  <div>
                    <p className="text-sm font-bold">{catering.adults} dewasa</p>
                    <p className="text-xs text-ink-mute">Porsi reguler</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-line p-3.5">
                  <Baby className="size-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold">{catering.children} anak</p>
                    <p className="text-xs text-ink-mute">Kids meal &amp; high-chair</p>
                  </div>
                </div>
              </div>
            </div>
            {catering.pax > 0 ? (
              <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-brand-50 p-3.5 text-[13px] leading-relaxed text-ink-soft">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand-600" />
                <span>
                  Pesan minimal{" "}
                  <strong className="text-ink">
                    {Math.ceil(catering.pax * 1.05)}–{Math.ceil(catering.pax * 1.1)} pax
                  </strong>{" "}
                  ke vendor sebagai cadangan untuk tamu tak terduga.
                </span>
              </p>
            ) : (
              <p className="mt-5 text-xs text-ink-mute">
                Angka muncul setelah ada tamu yang konfirmasi hadir.
              </p>
            )}
          </section>

          {/* Activity */}
          <section className={card}>
            <h2 className={cardTitle}>Aktivitas terbaru</h2>
            {activities.length === 0 ? (
              <p className="mt-4 text-[13px] text-ink-soft">
                Belum ada aktivitas. Konfirmasi tamu, ucapan, dan angpao akan muncul di sini.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-line">
                {activities.map((a) => {
                  const s = ACTIVITY_STYLE[a.kind];
                  return (
                    <li key={a.key} className="flex items-start gap-3.5 py-3.5">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-full ${s.tone}`}
                      >
                        <s.icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold">{a.who}</p>
                        <p className="text-[13px] text-ink-soft">{a.what}</p>
                      </div>
                      <span className="shrink-0 text-xs text-ink-mute">{a.when}</span>
                    </li>
                  );
                })}
              </ul>
            )}
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
            <p className="relative mt-2 text-3xl font-extrabold">
              {!cd
                ? "—"
                : cd.over
                  ? "Sudah berlangsung"
                  : cd.days === 0
                    ? "Hari ini"
                    : `${cd.days} hari lagi`}
            </p>
            <p className="relative mt-1 text-[13px] text-brand-100/80">
              {event.dateLabel}
              {event.time ? ` · ${event.time}` : ""}
              {event.venueName ? ` di ${event.venueName}` : ""}
            </p>
            {cd && !cd.over && (
              <div className="relative mt-5 grid grid-cols-3 gap-2.5">
                {(
                  [
                    [cd.days, "Hari"],
                    [cd.hours, "Jam"],
                    [cd.minutes, "Menit"],
                  ] as const
                ).map(([n, l]) => (
                  <div key={l} className="rounded-xl bg-white/10 py-3 text-center">
                    <p className="text-xl font-extrabold tabular-nums">
                      {String(n).padStart(2, "0")}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-200">
                      {l}
                    </p>
                  </div>
                ))}
              </div>
            )}
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

      {showDraft && (
        <ReminderDraft
          text={buildReminder(`${window.location.origin}/e/${event.slug}`)}
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
