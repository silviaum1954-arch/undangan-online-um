import Link from "next/link";
import { Mail } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-600 text-white">
        <Mail className="size-5" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        Tautan yang Anda buka tidak tersedia, sudah dihapus, atau undangannya belum diterbitkan.
      </p>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
      >
        Kembali ke beranda
      </Link>
    </main>
  );
}
