"use client";

import { AlertCircle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertCircle className="size-5" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">Terjadi kesalahan</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        Halaman gagal dimuat. Periksa koneksi Anda lalu coba lagi.
      </p>
      {error.digest && <p className="text-xs text-ink-mute">Kode: {error.digest}</p>}
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-11 items-center rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
      >
        Coba lagi
      </button>
    </main>
  );
}
