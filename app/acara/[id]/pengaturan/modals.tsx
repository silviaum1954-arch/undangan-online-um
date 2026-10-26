"use client";

import { useState, type ReactNode } from "react";
import { Upload, X } from "lucide-react";
import { Label, btnGhost, btnPrimary, field } from "../ui";

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
  onUpload,
}: {
  onClose: () => void;
  onUpload: (file: File) => Promise<boolean>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function pick(f: File | null) {
    setError(null);
    if (f && !["image/png", "image/jpeg", "image/webp"].includes(f.type)) {
      setFile(null);
      return setError("Gunakan file JPG, PNG, atau WebP.");
    }
    if (f && f.size > 5 * 1024 * 1024) {
      setFile(null);
      return setError("Ukuran file maksimal 5 MB.");
    }
    setFile(f);
  }

  async function save() {
    if (!file) return setError("Pilih gambar terlebih dahulu.");
    setBusy(true);
    const ok = await onUpload(file);
    setBusy(false);
    if (!ok) setError("Gagal mengunggah. Silakan coba lagi.");
  }

  return (
    <Modal title="Gambar cuplikan tautan" onClose={onClose}>
      <label className="flex w-full cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-6 py-8 text-center transition hover:bg-brand-50">
        <Upload className="size-7 text-brand-600" />
        <span className="mt-2 text-[13px] font-semibold">{file ? file.name : "Pilih gambar baru"}</span>
        <span className="mt-1 text-xs text-ink-mute">
          Rasio 1.91:1 (1200 × 630 px), JPG, PNG, atau WebP, maksimal 5 MB
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label="File gambar cuplikan"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
      </label>
      {error && (
        <p role="alert" className="mt-3 text-xs text-rose-600">
          {error}
        </p>
      )}
      <div className="mt-5 flex justify-end gap-2.5 border-t border-line pt-5">
        <button type="button" onClick={onClose} className={btnGhost}>
          Batal
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className={`${btnPrimary} disabled:opacity-70`}
        >
          {busy ? "Mengunggah…" : "Gunakan gambar ini"}
        </button>
      </div>
    </Modal>
  );
}

export function DuplicateModal({
  eventTitle,
  onClose,
  onConfirm,
}: {
  eventTitle: string;
  onClose: () => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState(`${eventTitle} (salinan)`);
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
          onClick={() => onConfirm(name.trim())}
          className={`${btnPrimary} disabled:opacity-50`}
        >
          Mulai duplikasi
        </button>
      </div>
    </Modal>
  );
}
