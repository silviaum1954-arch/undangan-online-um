"use client";

import { useState, type ReactNode } from "react";
import { Upload, X } from "lucide-react";
import { EVENT_TITLE } from "./data";
import { Label, btnGhost, btnPrimary, field } from "./ui";

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-bold">{title}</h2>
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

export function ImageModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: () => void;
}) {
  return (
    <Modal title="Gambar cuplikan tautan" onClose={onClose}>
      <button
        type="button"
        className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-6 py-8 text-center transition hover:bg-brand-50"
      >
        <Upload className="size-7 text-brand-600" />
        <span className="mt-2 text-[13px] font-semibold">Pilih gambar baru</span>
        <span className="mt-1 text-xs text-ink-mute">
          Rasio 1.91:1 (1200 × 630 px), JPG atau PNG
        </span>
      </button>
      <div className="mt-5 flex justify-end gap-2.5 border-t border-line pt-5">
        <button type="button" onClick={onClose} className={btnGhost}>
          Batal
        </button>
        <button type="button" onClick={onPick} className={btnPrimary}>
          Gunakan gambar ini
        </button>
      </div>
    </Modal>
  );
}

export function DuplicateModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [name, setName] = useState(`${EVENT_TITLE} (salinan)`);
  return (
    <Modal title="Duplikat acara" onClose={onClose}>
      <p className="text-[13px] text-ink-soft">
        Acara baru memakai tema, palet warna, dan susunan bagian yang sama.
      </p>
      <div className="mt-4">
        <Label htmlFor="dup-name">Nama acara baru</Label>
        <input
          id="dup-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
        />
      </div>
      <div className="mt-5 flex justify-end gap-2.5 border-t border-line pt-5">
        <button type="button" onClick={onClose} className={btnGhost}>
          Batal
        </button>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={onConfirm}
          className={`${btnPrimary} disabled:opacity-50`}
        >
          Mulai duplikasi
        </button>
      </div>
    </Modal>
  );
}
