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
import { CATEGORIES, type Guest, type RsvpStatus } from "./data";
import { slugify, waNumber } from "@/lib/format";
import { inviteMessage } from "@/lib/invite";

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
  adults: number;
  children: number;
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
    adults: guest?.dewasa ?? 0,
    children: guest?.anak ?? 0,
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

        {editing && (v.status === "fiks" || v.status === "ragu") && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="g-adults">Dewasa hadir</Label>
              <input
                id="g-adults"
                type="number"
                min={0}
                max={v.quota}
                value={v.adults}
                onChange={(e) => set("adults", Math.max(0, Number(e.target.value) || 0))}
                className={field}
              />
            </div>
            <div>
              <Label htmlFor="g-children">Anak hadir</Label>
              <input
                id="g-children"
                type="number"
                min={0}
                max={v.quota}
                value={v.children}
                onChange={(e) => set("children", Math.max(0, Number(e.target.value) || 0))}
                className={field}
              />
            </div>
          </div>
        )}

        {!editing && (
          <p className="rounded-xl bg-brand-50 px-3.5 py-3 text-xs text-ink-soft">
            Tautan personal:{" "}
            <span className="break-all font-semibold text-brand-700">
              …/e/…?to={slugify(v.name) || "nama-tamu"}
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

export interface InviteInfo {
  title: string;
  dateLabel: string;
  time: string | null;
  venue: string | null;
}

export function WhatsAppModal({
  guest,
  event,
  onClose,
  onCopied,
}: {
  guest: Guest;
  event: InviteInfo;
  onClose: () => void;
  onCopied: () => void;
}) {
  const link = `${window.location.origin}${guest.path}`;
  const text = inviteMessage(event, guest.name, link);
  const number = waNumber(guest.phone);
  return (
    <Modal
      onClose={onClose}
      title="Kirim undangan WhatsApp"
      subtitle={`${guest.name} · ${guest.phone || "nomor belum diisi"}`}
      icon={MessageCircle}
      tone="bg-emerald-50 text-emerald-600"
    >
      <pre className="whitespace-pre-wrap rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 font-sans text-[13px] leading-relaxed">
        {text}
      </pre>
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
        {number ? (
          <a
            href={`https://wa.me/${number}?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-[13px] font-bold text-white hover:bg-emerald-700"
          >
            <Send className="size-4" /> Buka WhatsApp
          </a>
        ) : (
          <span className="flex h-11 flex-1 items-center justify-center rounded-xl bg-slate-100 text-xs text-ink-mute">
            Isi nomor WhatsApp dulu
          </span>
        )}
      </div>
    </Modal>
  );
}

export function BroadcastModal({
  guests,
  event,
  onClose,
  onCopy,
}: {
  guests: Guest[];
  event: InviteInfo;
  onClose: () => void;
  onCopy: (text: string) => void;
}) {
  const buildText = () =>
    guests
      .map((x) => inviteMessage(event, x.name, `${window.location.origin}${x.path}`))
      .join("\n\n———\n\n");
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
        <button type="button" onClick={() => onCopy(buildText())} className={btnPrimary}>
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
  onExport: (opts: { breakdown: boolean; links: boolean }) => void;
}) {
  const [breakdown, setBreakdown] = useState(true);
  const [links, setLinks] = useState(true);
  const opts = [
    { label: "Sertakan rincian anak & dewasa", checked: breakdown, set: setBreakdown },
    { label: "Sertakan tautan undangan personal", checked: links, set: setLinks },
  ];
  return (
    <Modal
      onClose={onClose}
      title="Ekspor daftar tamu"
      subtitle={`${count} tamu diunduh sebagai file CSV, bisa dibuka di Excel.`}
      icon={FileSpreadsheet}
      tone="bg-emerald-50 text-emerald-600"
    >
      <div className="space-y-2.5">
        {opts.map((o) => (
          <label key={o.label} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-soft">
            <input
              type="checkbox"
              checked={o.checked}
              onChange={(e) => o.set(e.target.checked)}
              className="size-4 rounded border-line accent-brand-600"
            />
            {o.label}
          </label>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2.5 border-t border-line pt-5">
        <button type="button" onClick={onClose} className={btnGhost}>
          Batal
        </button>
        <button type="button" onClick={() => onExport({ breakdown, links })} className={btnPrimary}>
          <Download className="size-4" /> Unduh CSV
        </button>
      </div>
    </Modal>
  );
}
