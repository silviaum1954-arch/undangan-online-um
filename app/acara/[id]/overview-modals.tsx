"use client";

import { MessageCircle, X } from "lucide-react";

export function ReminderDraft({
  text,
  onClose,
  onCopied,
}: {
  text: string;
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
          {text}
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
              navigator.clipboard?.writeText(text);
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
