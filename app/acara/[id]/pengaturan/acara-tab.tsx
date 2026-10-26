"use client";

import {
  AlertTriangle,
  Archive,
  Calendar,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import Switch from "../switch";
import {
  CLOSE_TIMINGS,
  PUBLIC_HOST,
  STATUS_ACTIONS,
  STATUS_ORDER,
  STATUS_STEPS,
  type EventStatus,
  type Settings,
} from "./data";
import { Label, Section, Stepper, btnOutline, field } from "../ui";

const STEP_ICONS: Record<EventStatus, LucideIcon> = {
  draf: FileText,
  terbit: Globe,
  selesai: Calendar,
  diarsipkan: Archive,
};

interface Props {
  form: Settings;
  update: (patch: Partial<Settings>) => void;
  status: EventStatus;
  onStatus: (s: EventStatus) => void;
  onToast: (m: string) => void;
  eventTitle: string;
  usedQuota: number;
  ogImageUrl: string | null;
  onImage: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function AcaraTab({
  form,
  update,
  status,
  onStatus,
  onToast,
  eventTitle,
  usedQuota,
  ogImageUrl,
  onImage,
  onDuplicate,
  onDelete,
}: Props) {
  const [confirmText, setConfirmText] = useState("");
  const path = `/e/${form.slug}`;
  const current = STATUS_ORDER.indexOf(status);
  const quotaPct = Math.min(100, Math.round((usedQuota / form.totalQuota) * 100));
  const slugInvalid = form.slug.length < 3;

  return (
    <div className="space-y-6">
      {/* Public link */}
      <Section
        title="Tautan publik"
        desc="Alamat yang dibagikan ke tamu untuk membuka undangan."
        action={
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Tersedia
          </span>
        }
      >
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div
            className={`flex h-11 flex-1 items-center rounded-xl border bg-white px-3.5 text-sm transition focus-within:ring-4 ${
              slugInvalid
                ? "border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100"
                : "border-line focus-within:border-brand-500 focus-within:ring-brand-100"
            }`}
          >
            <span className="select-none text-ink-mute">/e/</span>
            <input
              aria-label="Slug tautan"
              value={form.slug}
              onChange={(e) =>
                update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })
              }
              className="w-full bg-transparent font-semibold outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(`${window.location.origin}${path}`);
              onToast("Tautan publik disalin.");
            }}
            className={btnOutline}
          >
            <Copy className="size-4 text-ink-mute" /> Salin
          </button>
          <a href={`/e/${form.slug}`} target="_blank" rel="noreferrer" className={btnOutline}>
            <ExternalLink className="size-4 text-ink-mute" /> Buka
          </a>
        </div>
        <p className={`mt-2.5 text-xs ${slugInvalid ? "text-rose-600" : "text-ink-mute"}`}>
          {slugInvalid
            ? "Tautan minimal 3 karakter (huruf kecil, angka, tanda hubung)."
            : "Tautan lama dialihkan otomatis selama 7 hari setelah diganti."}
        </p>
      </Section>

      {/* Status */}
      <Section
        title="Status acara"
        desc="Siklus hidup undangan, dari draf sampai diarsipkan."
      >
        <ol className="grid grid-cols-4">
          {STATUS_STEPS.map((s, i) => {
            const Icon = STEP_ICONS[s.id];
            const done = i < current;
            const on = i === current;
            return (
              <li key={s.id} className="relative flex flex-col items-center text-center">
                {i > 0 && (
                  <span
                    aria-hidden
                    className={`absolute right-1/2 top-5 h-0.5 w-full ${
                      i <= current ? "bg-brand-600" : "bg-line"
                    }`}
                  />
                )}
                <span
                  className={`relative grid size-10 place-items-center rounded-full ${
                    on
                      ? "bg-brand-600 text-white ring-4 ring-brand-100"
                      : done
                        ? "bg-brand-600 text-white"
                        : "border border-line bg-white text-ink-mute"
                  }`}
                >
                  {done ? <Check className="size-5" /> : <Icon className="size-[18px]" />}
                </span>
                <p
                  className={`mt-2 text-[13px] font-semibold ${on ? "text-brand-700" : ""}`}
                >
                  {s.label}
                </p>
                <p className="text-[11px] text-ink-mute">{s.note}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          {STATUS_ORDER.filter((s) => s !== status).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onStatus(s);
                onToast(STATUS_ACTIONS[s].toast);
              }}
              className="h-9 rounded-lg border border-line px-3.5 text-[13px] font-semibold text-ink-soft transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              {STATUS_ACTIONS[s].label}
            </button>
          ))}
        </div>
      </Section>

      {/* Auto close */}
      <Section
        title="Penutupan otomatis"
        desc="Ubah status menjadi Selesai tanpa perlu campur tangan manual."
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold">Tandai selesai otomatis</p>
            <p className="mt-0.5 text-xs text-ink-mute">
              Setelah selesai, form RSVP ditutup dan tamu diarahkan ke galeri serta
              ucapan terima kasih. Rekap tetap tersimpan.
            </p>
          </div>
          <Switch
            checked={form.autoClose}
            onChange={(v) => update({ autoClose: v })}
            label="Tandai selesai otomatis"
          />
        </div>

        {form.autoClose && (
          <div className="mt-4 max-w-md">
            <Label htmlFor="close-timing">Waktu penutupan</Label>
            <div className="relative">
              <select
                id="close-timing"
                value={form.closeTiming}
                onChange={(e) => update({ closeTiming: e.target.value })}
                className={`${field} cursor-pointer appearance-none pr-9`}
              >
                {CLOSE_TIMINGS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
            </div>
          </div>
        )}

        <label className="mt-5 flex cursor-pointer items-start gap-3 border-t border-line pt-4">
          <input
            type="checkbox"
            checked={form.reminderArchive}
            onChange={(e) => update({ reminderArchive: e.target.checked })}
            className="mt-0.5 size-4 rounded accent-brand-600"
          />
          <span>
            <span className="block text-[13px] font-semibold">
              Ingatkan arsipkan 90 hari setelah acara
            </span>
            <span className="block text-xs text-ink-mute">
              Email pengingat dikirim sebelum acara dipindah ke arsip, agar kuota
              aktif Anda kembali.
            </span>
          </span>
        </label>
      </Section>

      {/* OG */}
      <Section
        title="Pratinjau saat dibagikan"
        desc="Judul, deskripsi, dan gambar yang muncul saat tautan dibagikan di WhatsApp atau media sosial."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="og-title" hint={`${form.metaTitle.length}/60`}>
                Judul
              </Label>
              <input
                id="og-title"
                maxLength={60}
                value={form.metaTitle}
                onChange={(e) => update({ metaTitle: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <Label htmlFor="og-desc" hint={`${form.metaDescription.length}/160`}>
                Deskripsi
              </Label>
              <textarea
                id="og-desc"
                rows={3}
                maxLength={160}
                value={form.metaDescription}
                onChange={(e) => update({ metaDescription: e.target.value })}
                className={`${field} h-auto resize-none py-2.5 leading-relaxed`}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-semibold">
                Gambar cuplikan
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-line p-2.5">
                {ogImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ogImageUrl} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600">
                    OG
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{form.ogImagePath ? form.ogImagePath.split("/").pop() : "Belum ada gambar"}</p>
                  <p className="text-xs text-ink-mute">Disarankan 1200 × 630 px</p>
                </div>
                <button
                  type="button"
                  onClick={onImage}
                  className="h-8 shrink-0 rounded-lg border border-line px-3 text-xs font-semibold hover:bg-brand-50"
                >
                  Ubah
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-semibold">Tampilan di WhatsApp</p>
            <div className="rounded-2xl bg-[#efeae2] p-4">
              <div className="ml-auto max-w-xs space-y-2 rounded-2xl rounded-tr-sm bg-white p-2 shadow-sm">
                <div className="flex h-28 flex-col items-center justify-center rounded-xl bg-linear-to-r from-amber-100 via-rose-100 to-amber-200 text-center">
                  <p className="font-serif text-sm font-bold text-amber-900">
                    21st Celebration
                  </p>
                  <p className="text-[10px] font-medium text-amber-800">SHILVIA ANISA</p>
                </div>
                <div className="space-y-0.5 px-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {PUBLIC_HOST}
                  </p>
                  <p className="line-clamp-1 text-xs font-bold">{form.metaTitle}</p>
                  <p className="line-clamp-2 text-[11px] leading-snug text-ink-soft">
                    {form.metaDescription}
                  </p>
                </div>
                <p className="truncate px-1.5 pb-1 text-[10px] text-sky-600 underline">
                  {path}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Quota */}
      <Section
        title="Kuota & alokasi tamu"
        desc="Batasi kapasitas undangan sesuai ruang acara."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line p-4">
            <p className="text-[13px] font-semibold">Total kuota undangan</p>
            <p className="text-xs text-ink-mute">Jumlah tautan tamu yang bisa dibuat.</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <Stepper
                label="kuota"
                value={form.totalQuota}
                min={usedQuota}
                onChange={(n) => update({ totalQuota: n })}
              />
              <p className="text-right text-xs text-ink-soft">
                <span className="font-bold text-ink">{usedQuota}</span> terpakai ·
                sisa {form.totalQuota - usedQuota}
              </p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-50">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-ink-mute">
              Tidak bisa lebih kecil dari jumlah tamu terdaftar.
            </p>
          </div>

          <div className="rounded-xl border border-line p-4">
            <p className="text-[13px] font-semibold">Maksimal orang per undangan</p>
            <p className="text-xs text-ink-mute">
              Batas bawaan pendamping saat menambah tamu.
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <Stepper
                label="maksimal orang"
                value={form.maxPax}
                min={1}
                onChange={(n) => update({ maxPax: n })}
              />
              <p className="text-right text-xs text-ink-soft">
                Bisa diatur per tamu di Daftar tamu
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Duplicate */}
      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-bold">Duplikat acara</h2>
          <p className="mt-0.5 max-w-xl text-[13px] text-ink-soft">
            Pakai tema dan susunan acara ini sebagai template untuk acara baru.
          </p>
        </div>
        <button type="button" onClick={onDuplicate} className={`${btnOutline} shrink-0`}>
          <Copy className="size-4 text-ink-mute" /> Duplikat ke acara baru
        </button>
      </section>

      {/* Danger */}
      <Section
        tone="danger"
        title="Zona bahaya"
        desc="Tindakan ini permanen dan tidak bisa dibatalkan."
        action={<AlertTriangle className="size-5 text-rose-500" />}
      >
        <p className="text-[13px] text-ink-soft">
          Menghapus acara akan menghapus halaman undangan, data RSVP, riwayat angpao,
          dan buku ucapan dari server.
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <input
            aria-label="Ketik nama acara untuk konfirmasi"
            placeholder={`Ketik "${eventTitle}"`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className={`${field} focus:border-rose-400 focus:ring-rose-100`}
          />
          <button
            type="button"
            disabled={confirmText !== eventTitle}
            onClick={onDelete}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-[13px] font-bold text-white transition hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600"
          >
            <Trash2 className="size-4" /> Hapus acara
          </button>
        </div>
      </Section>
    </div>
  );
}
