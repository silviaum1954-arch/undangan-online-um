"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  Copy,
  Download,
  FileSpreadsheet,
  MessageCircle,
  Phone,
  Send,
  X,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, guestSlug, type Guest, type RsvpStatus } from "./data";

const field =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-mute focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
const btnGhost =
  "h-10 rounded-xl px-4 text-[13px] font-semibold text-ink-soft hover:bg-brand-50";
const btnPrimary =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-5 text-[13px] font-bold text-white hover:bg-brand-700";

function Modal({
  title,
  subtitle,
  icon: Icon,
  tone = "bg-brand-50 text-brand-600",
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  tone?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ${
          wide ? "max-w-lg" : "max-w-md"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className={`grid size-10 place-items-center rounded-xl ${tone}`}>
                <Icon className="size-[18px]" />
              </span>
            )}
            <div>
              <h2 className="text-base font-bold text-ink">{title}</h2>
              {subtitle && <p className="text-[13px] text-ink-soft">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-mute hover:bg-brand-50"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-ink">
      {children}
    </label>
  );
}

export interface GuestFormValues {
  name: string;
  category: string;
  phone: string;
  quota: number;
  status: RsvpStatus;
}

export function GuestFormModal({
  guest,
  onClose,
  onSubmit,
}: {
  guest: Guest | null;
  onClose: () => void;
  onSubmit: (v: GuestFormValues) => void;
}) {
  const editing = guest !== null;
  const [v, setV] = useState<GuestFormValues>({
    name: guest?.name ?? "",
    category: guest?.category ?? CATEGORIES[0],
    phone: guest?.phone ?? "",
    quota: guest?.quota ?? 2,
    status: guest?.status ?? "pending",
  });
  const set = <K extends keyof GuestFormValues>(k: K, val: GuestFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!v.name.trim()) return;
    onSubmit({ ...v, name: v.name.trim() });
  }

  return (
    <Modal
      wide
      onClose={onClose}
      title={editing ? "Edit data tamu" : "Tambah tamu baru"}
      subtitle={
        editing
          ? "Perbarui informasi dan status kehadiran."
          : "Tautan undangan personal dibuat otomatis."
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="g-name">Nama tamu</Label>
          <input
            id="g-name"
            required
            autoFocus
            value={v.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Contoh: Raditya Dika & Pasangan"
            className={field}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="g-cat">Kategori</Label>
            <select
              id="g-cat"
              value={v.category}
              onChange={(e) => set("category", e.target.value)}
              className={field}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="g-quota">Kuota</Label>
            <select
              id="g-quota"
              value={v.quota}
              onChange={(e) => set("quota", Number(e.target.value))}
              className={field}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} orang
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={editing ? "grid grid-cols-2 gap-3" : ""}>
          <div>
            <Label htmlFor="g-phone">Nomor WhatsApp</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
              <input
                id="g-phone"
                type="tel"
                value={v.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+62 812-xxxx-xxxx"
                className={`${field} pl-10`}
              />
            </div>
          </div>
          {editing && (
            <div>
              <Label htmlFor="g-status">Status RSVP</Label>
              <select
                id="g-status"
                value={v.status}
                onChange={(e) => set("status", e.target.value as RsvpStatus)}
                className={field}
              >
                <option value="fiks">Fiks datang</option>
                <option value="ragu">Belum pasti</option>
                <option value="batal">Berhalangan</option>
                <option value="pending">Belum respons</option>
              </select>
            </div>
          )}
        </div>

        {!editing && (
          <p className="rounded-xl bg-brand-50 px-3.5 py-3 text-xs text-ink-soft">
            Tautan personal:{" "}
            <span className="break-all font-semibold text-brand-700">
              undang.kuy/{guestSlug(v.name || "nama-tamu")}
            </span>
          </p>
        )}

        <div className="flex justify-end gap-2.5 border-t border-line pt-5">
          <button type="button" onClick={onClose} className={btnGhost}>
            Batal
          </button>
          <button type="submit" className={btnPrimary}>
            {editing ? "Simpan perubahan" : "Tambah tamu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const EVENT_TEXT = "Ulang Tahun ke-21 Shilvia Anisa";

export function WhatsAppModal({
  guest,
  onClose,
  onCopied,
}: {
  guest: Guest;
  onClose: () => void;
  onCopied: () => void;
}) {
  const link = `https://undang.kuy/${guest.slug}`;
  const text = `Halo ${guest.name}! Kami mengundang Anda untuk hadir di perayaan ${EVENT_TEXT} pada Kamis, 15 Okt 2026, 16:00 WIB. Buka undangan personal Anda di: ${link}`;
  return (
    <Modal
      onClose={onClose}
      title="Kirim undangan WhatsApp"
      subtitle={`${guest.name} · ${guest.phone}`}
      icon={MessageCircle}
      tone="bg-emerald-50 text-emerald-600"
    >
      <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-[13px] leading-relaxed">
        <p>
          Halo <strong>{guest.name}</strong>! ✨
        </p>
        <p>
          Kami mengundang Anda untuk hadir di perayaan <strong>{EVENT_TEXT}</strong>.
        </p>
        <p className="font-semibold text-brand-700">
          📅 Kamis, 15 Okt 2026 · 16:00 WIB
          <br />
          📍 The Glass House Bistro, Senopati
        </p>
        <p className="break-all rounded-lg bg-white px-2.5 py-2 text-xs text-brand-600">
          {link}
        </p>
        <p className="text-ink-soft">Mohon konfirmasi kehadiran Anda. Terima kasih! 🙏</p>
      </div>
      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(text);
            onCopied();
          }}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line text-[13px] font-semibold hover:bg-brand-50"
        >
          <Copy className="size-4" /> Salin pesan
        </button>
        <a
          href={`https://wa.me/${guest.phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-[13px] font-bold text-white hover:bg-emerald-700"
        >
          <Send className="size-4" /> Buka WhatsApp
        </a>
      </div>
    </Modal>
  );
}

export function BroadcastModal({
  guests,
  onClose,
  onCopy,
}: {
  guests: Guest[];
  onClose: () => void;
  onCopy: () => void;
}) {
  return (
    <Modal
      wide
      onClose={onClose}
      title="Pesan pengingat massal"
      subtitle={`${guests.length} tamu terpilih`}
      icon={Copy}
    >
      <p className="text-[13px] text-ink-soft">
        Teks pengingat disiapkan dengan nama dan tautan masing-masing tamu.
      </p>
      <ul className="mt-3 max-h-52 divide-y divide-line overflow-y-auto rounded-xl border border-line">
        {guests.map((x) => (
          <li key={x.id} className="flex items-center justify-between px-3.5 py-2.5 text-[13px]">
            <span className="font-semibold">{x.name}</span>
            <span className="text-xs text-ink-mute">{x.phone}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex justify-end gap-2.5 border-t border-line pt-5">
        <button type="button" onClick={onClose} className={btnGhost}>
          Tutup
        </button>
        <button type="button" onClick={onCopy} className={btnPrimary}>
          <Copy className="size-4" /> Salin teks ({guests.length})
        </button>
      </div>
    </Modal>
  );
}

export function ExportModal({
  count,
  onClose,
  onExport,
}: {
  count: number;
  onClose: () => void;
  onExport: () => void;
}) {
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");
  const opts = [
    { id: "xlsx" as const, icon: FileSpreadsheet, name: "Excel (.xlsx)", note: "Siap diolah" },
    { id: "csv" as const, icon: Download, name: "CSV (.csv)", note: "Format tabel standar" },
  ];
  return (
    <Modal
      onClose={onClose}
      title="Ekspor daftar tamu"
      subtitle={`${count} tamu akan diunduh`}
      icon={FileSpreadsheet}
      tone="bg-emerald-50 text-emerald-600"
    >
      <div className="grid grid-cols-2 gap-2.5">
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
        {["Sertakan rincian anak & dewasa", "Sertakan tautan personal"].map((t) => (
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
        <button type="button" onClick={onClose} className={btnGhost}>
          Batal
        </button>
        <button type="button" onClick={onExport} className={btnPrimary}>
          <Download className="size-4" /> Unduh
        </button>
      </div>
    </Modal>
  );
}
