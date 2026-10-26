"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  AtSign,
  Check,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
  Phone,
  RotateCcw,
  User,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register" | "forgot";

const TABS: { id: Mode; label: string }[] = [
  { id: "login", label: "Masuk" },
  { id: "register", label: "Buat Akun" },
  { id: "forgot", label: "Lupa Sandi" },
];

const inputCls =
  "h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-mute outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

/** Maps Supabase Auth errors to messages the user can act on. */
function authMessage(error: { code?: string; message: string }) {
  switch (error.code) {
    case "invalid_credentials":
      return "Email atau kata sandi salah. Silakan periksa kembali.";
    case "email_not_confirmed":
      return "Email Anda belum dikonfirmasi. Buka tautan konfirmasi di kotak masuk Anda.";
    case "user_already_exists":
    case "email_exists":
      return "Email ini sudah terdaftar. Silakan masuk atau atur ulang kata sandi.";
    case "weak_password":
      return "Kata sandi terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi yang sulit ditebak.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.";
    case "email_address_not_authorized":
      return "Email ini belum diizinkan menerima pesan dari server email bawaan. Gunakan email anggota tim project, atau pasang SMTP sendiri di pengaturan Supabase.";
    case "email_address_invalid":
      return "Alamat email tidak valid atau domainnya tidak diterima.";
    case "unexpected_failure":
      return "Server gagal mengirim email konfirmasi. Periksa pengaturan email (SMTP) di Supabase, lalu coba lagi.";
    case "signup_disabled":
      return "Pendaftaran akun baru sedang dinonaktifkan.";
    default:
      return `Terjadi kesalahan. Silakan coba lagi.${error.code ? ` (kode: ${error.code})` : ""}`;
  }
}

function Field({
  id,
  label,
  icon: Icon,
  children,
  aside,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink">
          {label}
        </label>
        {aside}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
        {children}
      </div>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <input
        id={id}
        type={show ? "text" : "password"}
        required
        minLength={8}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ink-mute hover:bg-brand-50 hover:text-ink"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </>
  );
}

export default function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "link"
      ? "Tautan tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru."
      : null,
  );
  const [success, setSuccess] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSuccess(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === "register") {
      if (password !== confirm) {
        setError("Konfirmasi kata sandi tidak cocok.");
        return;
      }
      if (!agree) {
        setError("Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi.");
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setError(authMessage(error));
        router.replace("/beranda");
        router.refresh();
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim(), phone: phone.trim() },
            emailRedirectTo: `${origin}/auth/callback`,
          },
        });
        if (error) return setError(authMessage(error));
        // With email confirmation on, an existing address returns a user with
        // no identities instead of an error.
        if (data.user && data.user.identities?.length === 0) {
          return setError(authMessage({ code: "user_already_exists", message: "" }));
        }
        if (data.session) {
          router.replace("/beranda");
          router.refresh();
        } else {
          setSuccess(
            `Akun dibuat. Kami mengirim tautan konfirmasi ke ${email}. Buka tautan itu untuk mengaktifkan akun Anda.`,
          );
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/reset-password`,
        });
        if (error) return setError(authMessage(error));
        // Same message whether or not the address exists.
        setSuccess(
          `Jika ${email} terdaftar, tautan untuk membuat kata sandi baru sudah dikirim. Periksa kotak masuk atau folder spam.`,
        );
      }
    } catch {
      setError("Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const cta =
    mode === "login"
      ? "Masuk ke Dashboard"
      : mode === "register"
        ? "Daftar Akun Sekarang"
        : "Kirim Tautan Pemulihan";

  return (
    <section className="order-1 flex flex-col justify-between bg-white p-8 sm:p-10 lg:order-2 lg:p-12">
      <div>
        <div
          role="tablist"
          aria-label="Masuk, daftar, atau lupa sandi"
          className="mb-8 flex items-center gap-2"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={mode === t.id}
              onClick={() => switchMode(t.id)}
              className={`h-9 rounded-xl px-4 text-xs font-bold transition ${
                mode === t.id
                  ? "bg-[#4c356b] text-white shadow-sm"
                  : "text-ink hover:bg-brand-50 hover:text-brand-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {mode === "forgot" ? (
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-brand-100/70 text-brand-700">
                <RotateCcw className="size-5" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-ink">
                Atur Ulang Kata Sandi
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk
              membuat kata sandi baru.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">
              {mode === "register" ? "Buat Akun Baru" : "Selamat Datang Kembali"}
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              {mode === "register"
                ? "Lengkapi formulir berikut untuk mulai membuat undangan digital Anda."
                : "Masuk untuk mengelola acara dan memantau kehadiran tamu Anda."}
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-[13px] font-medium text-rose-900"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}
        {success && (
          <div
            role="status"
            className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-[13px] font-medium text-emerald-900"
          >
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <div className="flex-1 leading-relaxed">{success}</div>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <Field id="name" label="Nama Lengkap" icon={User}>
              <input
                id="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="contoh: Shilvia Anisa"
                className={inputCls}
              />
            </Field>
          )}

          <div className={mode === "register" ? "grid gap-4 sm:grid-cols-2" : ""}>
            <Field id="email" label="Alamat Email" icon={AtSign}>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className={inputCls}
              />
            </Field>
            {mode === "register" && (
              <Field id="phone" label="Nomor WhatsApp" icon={Phone}>
                <input
                  id="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className={inputCls}
                />
              </Field>
            )}
          </div>

          {mode !== "forgot" && (
            <div className={mode === "register" ? "grid gap-4 sm:grid-cols-2" : ""}>
              <Field
                id="password"
                label="Kata Sandi"
                icon={Lock}
                aside={
                  mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      Lupa kata sandi?
                    </button>
                  )
                }
              >
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={setPassword}
                  placeholder={mode === "login" ? "Masukkan kata sandi" : "Minimal 8 karakter"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </Field>
              {mode === "register" && (
                <Field id="confirm" label="Konfirmasi Kata Sandi" icon={Lock}>
                  <PasswordInput
                    id="confirm"
                    value={confirm}
                    onChange={setConfirm}
                    placeholder="Ulangi kata sandi"
                    autoComplete="new-password"
                  />
                </Field>
              )}
            </div>
          )}

          {mode === "register" && (
            <label className="flex cursor-pointer items-start gap-2.5 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 size-4 rounded accent-brand-600"
              />
              <span className="leading-snug">
                Saya menyetujui{" "}
                <span className="font-bold text-ink">Syarat &amp; Ketentuan</span> serta{" "}
                <span className="font-bold text-ink">Kebijakan Privasi</span> UndangKuy.
              </span>
            </label>
          )}

          {mode === "forgot" && (
            <p className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-[#f8f6fc] p-3.5 text-xs leading-relaxed text-ink-soft">
              <Info className="mt-0.5 size-4 shrink-0 text-brand-600" />
              <span>
                Periksa folder <strong className="text-ink">Kotak Masuk</strong> dan{" "}
                <strong className="text-ink">Spam / Promosi</strong> setelah menekan
                tombol kirim.
              </span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white shadow-[0_10px_25px_-8px_rgba(101,67,143,0.5)] transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                {cta}
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 border-t border-line pt-4 text-center text-xs text-ink-soft">
        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="inline-flex items-center gap-1.5 font-bold text-ink hover:text-brand-700 hover:underline"
          >
            <ArrowLeft className="size-3.5" /> Kembali ke halaman Masuk
          </button>
        )}
        {mode === "register" && (
          <p>
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="font-bold text-ink hover:text-brand-700 hover:underline"
            >
              Masuk di sini
            </button>
          </p>
        )}
        {mode === "login" && (
          <p>
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={() => switchMode("register")}
              className="font-bold text-ink hover:text-brand-700 hover:underline"
            >
              Daftar sekarang
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
