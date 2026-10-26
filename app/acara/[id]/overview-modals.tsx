"use client";

import { MessageCircle, X } from "lucide-react";

export function InvitationPreview({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xs overflow-hidden rounded-[36px] border-[6px] border-slate-900 bg-white shadow-2xl">
        <div className="flex h-6 items-center justify-center bg-slate-900">
          <div className="h-1.5 w-16 rounded-full bg-slate-700" />
        </div>
        <div className="bg-rose-50/50 p-6 text-center">
          <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-[10px] font-semibold text-rose-700">
            Strawberry Garden
          </span>
          <h3 className="mt-4 font-serif text-2xl font-bold">Ulang Tahun ke-21</h3>
          <p className="mt-0.5 text-base font-bold text-brand-700">Shilvia Anisa</p>
          <p className="mt-3 text-xs text-ink-soft">
            Kamis, 15 Oktober 2026 · 16:00 WIB
          </p>
          <p className="text-xs text-ink-soft">
            The Glass House Bistro, Kota Malang
          </p>
          <div className="mt-6 rounded-2xl border border-line bg-white p-4 text-left">
            <p className="text-xs font-bold">Konfirmasi kehadiran</p>
            <p className="mt-1 text-[11px] text-ink-soft">
              Isi kehadiran Anda beserta jumlah pendamping.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 h-11 w-full rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-700"
          >
            Tutup pratinjau
          </button>
        </div>
      </div>
    </div>
  );
}

const DRAFT = `Halo Kak [Nama Tamu]! 👋

Mengingatkan kembali bahwa acara *Ulang Tahun ke-21 Shilvia Anisa* akan berlangsung:

📅 *Kamis, 15 Oktober 2026*
⏰ *Pukul 16:00 WIB*
📍 *The Glass House Bistro, Kota Malang*

Mohon konfirmasi kehadiran Kakak melalui tautan berikut:
🔗 https://undang.kuy/shilvia-21

Terima kasih dan sampai jumpa! ✨`;

export function ReminderDraft({
  onClose,
  onCopied,
}: {
  onClose: () => void;
  onCopied: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <MessageCircle className="size-4" />
            </span>
            <h3 className="text-base font-bold">Draf pesan WhatsApp</h3>
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
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 font-sans text-[13px] leading-relaxed">
          {DRAFT}
        </pre>
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl px-4 text-[13px] font-semibold text-ink-soft hover:bg-brand-50"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(DRAFT);
              onCopied();
            }}
            className="h-10 rounded-xl bg-brand-600 px-5 text-[13px] font-bold text-white hover:bg-brand-700"
          >
            Salin teks
          </button>
        </div>
      </div>
    </div>
  );
}
