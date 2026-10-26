"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-mute outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The recovery link signs the user in via /auth/callback first.
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setReady(!!data.user));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(
        error.code === "same_password"
          ? "Kata sandi baru harus berbeda dari yang lama."
          : error.code === "weak_password"
            ? "Kata sandi terlalu lemah. Gunakan minimal 8 karakter."
            : "Gagal memperbarui kata sandi. Silakan coba lagi.",
      );
      return;
    }
    router.replace("/beranda");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0ecf6] p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_24px_70px_-20px_rgba(42,27,69,0.2)] ring-1 ring-line sm:p-10">
        <span className="grid size-11 place-items-center rounded-2xl bg-brand-600 text-white">
          <Mail className="size-5" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Buat kata sandi baru</h1>

        {ready === false ? (
          <>
            <p className="mt-2 text-sm text-ink-soft">
              Tautan pemulihan tidak valid atau sudah kedaluwarsa.
            </p>
            <Link
              href="/"
              className="mt-6 flex h-11 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white hover:bg-brand-700"
            >
              Minta tautan baru
            </Link>
          </>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[13px] font-medium text-rose-900"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                {error}
              </div>
            )}
            {(
              [
                ["password", "Kata sandi baru", password, setPassword, "Minimal 8 karakter"],
                ["confirm", "Konfirmasi kata sandi", confirm, setConfirm, "Ulangi kata sandi"],
              ] as const
            ).map(([id, label, value, set, ph]) => (
              <div key={id}>
                <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold">
                  {label}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                  <input
                    id={id}
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={ph}
                    className={inputCls}
                  />
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={loading || ready === null}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-[0_10px_25px_-8px_rgba(101,67,143,0.5)] hover:bg-brand-700 disabled:opacity-70"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Simpan kata sandi"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
