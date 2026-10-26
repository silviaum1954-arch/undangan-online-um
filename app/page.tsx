"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Gift,
  Mail,
  Repeat,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Bug,
  Sparkles,
  Loader2,
  Check,
  AtSign,
  Info,
  MessageSquare,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";


type AuthMode = "login" | "register" | "forgot";

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: FeatureCard[] = [
  {
    icon: CalendarCheck,
    title: "RSVP Rapi & Otomatis",
    description:
      "Pantau konfirmasi kehadiran tamu secara langsung dalam hitungan detik.",
  },
  {
    icon: Gift,
    title: "Ucapan & Angpao Digital",
    description:
      "Terima doa manis dari tamu serta transfer tanda kasih via QRIS & rekening instan.",
  },
  {
    icon: Repeat,
    title: "Bisa Dipakai Berkali-kali",
    description:
      "Kelola multi-acara di bawah satu akun admin tanpa batasan tanggal acara.",
  },
];

export default function Home() {
  const router = useRouter();

  // Mode defaults to "forgot" to immediately reflect the newly requested screen,
  // or user can switch seamlessly between "login", "register", "forgot"
  const [mode, setMode] = useState<AuthMode>("forgot");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@shilvia-birthday.id");
  const [phone, setPhone] = useState("+62 812-3456-7890");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  // UI states
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [accountCheckResult, setAccountCheckResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [testErrorActive, setTestErrorActive] = useState(false);

  // Email validation helper
  const isEmailValid = email.includes("@") && email.includes(".") && email.length > 5;

  function switchMode(next: AuthMode) {
    setMode(next);
    setErrorMessage(null);
    setSuccessMessage(null);
    setAccountCheckResult(null);
    setShowPw(false);
    setShowConfirmPw(false);
  }

  // Toggle demo error state for UI testing
  function toggleTestError() {
    if (testErrorActive) {
      setTestErrorActive(false);
      setErrorMessage(null);
    } else {
      setTestErrorActive(true);
      if (mode === "forgot") {
        setErrorMessage(
          "Alamat email tidak ditemukan dalam basis data sistem. Silakan periksa kembali penulisan email Anda."
        );
      } else if (mode === "register") {
        setErrorMessage(
          "Alamat email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda."
        );
      } else {
        setErrorMessage(
          "Email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali."
        );
      }
    }
  }

  // Check Account action
  function handleCheckAccount() {
    if (!isEmailValid) {
      setErrorMessage("Masukkan format email yang valid sebelum mengecek akun.");
      return;
    }
    setAccountCheckResult("Akun terverifikasi aktif: Shilvia Anisa (Penyelenggara Acara)");
    setErrorMessage(null);
  }

  function handleSendOtp() {
    setOtpLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      setOtpLoading(false);
      setSuccessMessage(
        "Kode OTP 6-digit berhasil dikirimkan ke WhatsApp Anda (+62 812-****-7890). Periksa pesan masuk WhatsApp Anda."
      );
    }, 700);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic validation
    if (mode === "register") {
      if (password.length < 8) {
        setErrorMessage("Kata sandi harus terdiri dari minimal 8 karakter.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Konfirmasi kata sandi tidak cocok dengan kata sandi.");
        return;
      }
      if (!agreeTerms) {
        setErrorMessage(
          "Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi."
        );
        return;
      }
    }

    if (mode === "forgot") {
      if (!isEmailValid) {
        setErrorMessage("Silakan masukkan alamat email yang valid.");
        return;
      }
    }

    setLoading(true);

    // Dummy authentication redirect to portal beranda
    setTimeout(() => {
      setLoading(false);
      if (mode === "forgot") {
        setSuccessMessage(
          "Tautan pengaturan ulang kata sandi telah dikirim ke " +
            email +
            ". Silakan periksa kotak masuk atau spam email Anda."
        );
      } else {
        router.push("/beranda");
      }
    }, 800);
  }

  function handleQuickDemo() {
    setLoading(true);
    setTimeout(() => {
      router.push("/beranda");
    }, 400);
  }

  return (
    <div className="min-h-screen bg-[#f0ecf6] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-brand-500/20 selection:text-brand-900">
      {/* MAIN CONTAINER CARD (Matching 1440x900 reference styling) */}
      <div className="w-full max-w-295 overflow-hidden rounded-4xl bg-white shadow-[0_24px_70px_-20px_rgba(42,27,69,0.20)] ring-1 ring-line grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] transition-all">
        {/* LEFT COLUMN: BRAND SHOWCASE & FEATURE CARDS (Soft Lavender Background) */}
        <aside className="relative order-2 flex flex-col justify-between bg-brand-50 p-8 sm:p-10 lg:order-1 lg:p-12 border-t lg:border-t-0 lg:border-r border-line/80">
          <div>
            {/* Header: Brand Logo & Subtitle */}
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
                <Mail className="size-5" />
              </span>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-ink">
                  UndangKuy
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
                  Portal Undangan Digital
                </p>
              </div>
            </div>

            {/* Platform Pill Badge */}
            <div className="mt-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/80 bg-white/80 px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-brand-600" />
                Platform Undangan Digital
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-4 text-3xl sm:text-[2.2rem] font-extrabold leading-[1.18] tracking-tight text-ink text-balance">
              Kelola Acara Ulang Tahun Lebih Rapi &amp; Elegan.
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Buat undangan ulang tahun digital dalam hitungan menit.
            </p>

            {/* 3 Floating Feature Cards */}
            <div className="mt-8 space-y-3.5">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group flex items-start gap-4 rounded-2xl border border-white/80 bg-white p-4 shadow-[0_4px_16px_-4px_rgba(42,27,69,0.06)] transition hover:shadow-md hover:border-brand-200"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:scale-105 group-hover:bg-brand-100">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-ink">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Left Footer: System Status */}
          <div className="mt-10 flex items-center gap-2 border-t border-line/70 pt-5 text-xs font-medium text-ink-soft">
            <ShieldCheck className="size-4 text-brand-600 shrink-0" />
            <span>
              © 2026 UndangKuy • Sistem Siap Digunakan
            </span>
          </div>
        </aside>

        {/* RIGHT COLUMN: INTERACTIVE AUTH FORM */}
        <section className="order-1 flex flex-col justify-between p-8 sm:p-10 lg:order-2 lg:p-12 bg-white">
          <div>
            {/* TOP NAVIGATION PILL TABS (Exactly matching reference screenshot) */}
            <div className="flex items-center justify-between pb-3 mb-8">
              <div className="flex items-center gap-2">
                {[
                  { id: "login", label: "Masuk" },
                  { id: "register", label: "Buat Akun" },
                  { id: "forgot", label: "Lupa Sandi" },
                ].map((tab) => {
                  const isActive = mode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => switchMode(tab.id as AuthMode)}
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? "bg-[#4c356b] text-white shadow-sm"
                          : "text-ink hover:bg-brand-50 hover:text-brand-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* UJI ERROR TOGGLE BUTTON (Pill with bug icon) */}
              <button
                type="button"
                onClick={toggleTestError}
                title="Klik untuk menguji tampilan error state"
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  testErrorActive
                    ? "bg-rose-600 text-white shadow-sm"
                    : "border border-rose-200 bg-rose-50/70 text-rose-600 hover:bg-rose-100"
                }`}
              >
                <Bug className="size-3.5" />
                <span>Uji Error</span>
              </button>
            </div>

            {/* FORM HEADINGS */}
            {mode === "forgot" ? (
              /* LUPA SANDI HEADER (Matching screenshot) */
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-brand-100/70 text-brand-700">
                    <RotateCcw className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-ink">
                      Atur Ulang Kata Sandi
                    </h2>
                    <p className="text-xs text-ink-soft">
                      Layanan Pemulihan Kredensial Multi-Event
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-ink-soft mt-3">
                  Masukkan alamat email yang terdaftar pada akun UndangKuy Anda.
                  Kami akan mengirimkan tautan verifikasi untuk membuat kata sandi
                  baru.
                </p>
              </div>
            ) : mode === "register" ? (
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink">
                  Buat Akun Baru
                </h2>
                <p className="mt-1.5 text-sm text-ink-soft">
                  Lengkapi formulir di bawah ini untuk memulai membuat undangan
                  digital Anda.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink">
                  Selamat Datang Kembali
                </h2>
                <p className="mt-1.5 text-sm text-ink-soft">
                  Masuk untuk mengelola acara dan memantau kehadiran tamu Anda.
                </p>
              </div>
            )}

            {/* ERROR BANNER NOTIFICATION */}
            {errorMessage && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-900 animate-in fade-in slide-in-from-top-2 duration-150">
                <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* SUCCESS BANNER NOTIFICATION */}
            {successMessage && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-medium text-emerald-900 animate-in fade-in duration-150">
                <Check className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="flex-1 leading-relaxed">{successMessage}</div>
              </div>
            )}

            {/* ACCOUNT CHECK RESULT NOTIFICATION */}
            {accountCheckResult && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs font-semibold text-emerald-800 animate-in fade-in duration-150">
                <Check className="size-4 text-emerald-600 shrink-0" />
                <span>{accountCheckResult}</span>
              </div>
            )}

            {/* THE FORM */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* LUPA SANDI FORM CONTENT */}
              {mode === "forgot" && (
                <>
                  {/* ALAMAT EMAIL TERDAFTAR WITH VALIDATION STATUS & CEK AKUN BUTTON */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="email"
                        className="text-[11px] font-bold uppercase tracking-wider text-ink"
                      >
                        Alamat Email Terdaftar <span className="text-rose-500">*</span>
                      </label>
                      {isEmailValid && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <Check className="size-3.5 stroke-[2.5]" />
                          Format valid
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setAccountCheckResult(null);
                        }}
                        placeholder="admin@shilvia-birthday.id"
                        className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-28 text-xs text-ink placeholder:text-ink-mute outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                      />
                      {/* CEK AKUN BUTTON INSIDE INPUT */}
                      <button
                        type="button"
                        onClick={handleCheckAccount}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg border border-line bg-[#fbfafc] px-2.5 py-1 text-[11px] font-bold text-ink transition hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 cursor-pointer"
                      >
                        <ShieldCheck className="size-3.5 text-brand-600" />
                        <span>Cek Akun</span>
                      </button>
                    </div>
                  </div>

                  {/* INFO CALLOUT / NOTICE BOX (From screenshot) */}
                  <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-[#f8f6fc] p-3.5 text-xs text-ink-soft">
                    <Info className="size-4 shrink-0 text-brand-600 mt-0.5" />
                    <p className="leading-relaxed">
                      Pastikan Anda memeriksa folder{" "}
                      <span className="font-bold text-ink">
                        Kotak Masuk
                      </span>{" "}
                      atau folder{" "}
                      <span className="font-bold text-ink">
                        Spam / Promosi
                      </span>{" "}
                      setelah menekan tombol kirim.
                    </p>
                  </div>

                  {/* PRIMARY ACTION: Kirim Tautan Pemulihan via Email */}
                  <div className="pt-1 space-y-2.5">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5b407a] hover:bg-[#4c356b] px-6 text-xs sm:text-sm font-bold text-white shadow-[0_10px_25px_-8px_rgba(91,64,122,0.5)] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:opacity-70"
                    >
                      {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <span>Kirim Tautan Pemulihan via Email</span>
                          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    {/* SECONDARY ACTION: Kirim Kode OTP via WhatsApp (From screenshot) */}
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-white text-xs font-bold text-ink transition hover:bg-slate-50 hover:border-brand-300"
                    >
                      {otpLoading ? (
                        <Loader2 className="size-4 animate-spin text-brand-600" />
                      ) : (
                        <>
                          <MessageSquare className="size-4 text-emerald-600" />
                          <span>Kirim Kode OTP via WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* REGISTER FORM CONTENT */}
              {mode === "register" && (
                <>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1.5"
                    >
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="contoh: Shilvia Anisa"
                        className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3.5 text-xs text-ink placeholder:text-ink-mute outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="reg-email"
                        className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1.5"
                      >
                        Alamat Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <AtSign className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                        <input
                          id="reg-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@email.com"
                          className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3.5 text-xs text-ink placeholder:text-ink-mute outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="reg-phone"
                        className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1.5"
                      >
                        Nomor WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                        <input
                          id="reg-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+62 812-3456-7890"
                          className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3.5 text-xs text-ink placeholder:text-ink-mute outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="reg-password"
                        className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1.5"
                      >
                        Kata Sandi <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                        <input
                          id="reg-password"
                          type={showPw ? "text" : "password"}
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 8 karakter"
                          className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-10 text-xs text-ink placeholder:text-ink-mute outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 grid size-7 place-items-center text-ink-mute hover:text-ink"
                        >
                          {showPw ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1.5"
                      >
                        Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPw ? "text" : "password"}
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi"
                          className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-10 text-xs text-ink placeholder:text-ink-mute outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 grid size-7 place-items-center text-ink-mute hover:text-ink"
                        >
                          {showConfirmPw ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 text-xs text-ink-soft cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 size-4 rounded border-line text-brand-600 accent-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <span className="leading-snug">
                        Saya menyetujui{" "}
                        <span className="font-bold text-ink hover:underline">
                          Syarat &amp; Ketentuan
                        </span>{" "}
                        serta{" "}
                        <span className="font-bold text-ink hover:underline">
                          Kebijakan Privasi
                        </span>{" "}
                        UndangKuy.
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white shadow-[0_10px_25px_-8px_rgba(101,67,143,0.5)] transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:opacity-70"
                    >
                      {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <span>Daftar Akun Sekarang</span>
                          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* LOGIN FORM CONTENT */}
              {mode === "login" && (
                <>
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1.5"
                    >
                      Alamat Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <AtSign className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3.5 text-xs text-ink placeholder:text-ink-mute outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="text-[11px] font-bold uppercase tracking-wider text-ink"
                      >
                        Kata Sandi <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer"
                      >
                        Lupa kata sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                      <input
                        id="login-password"
                        type={showPw ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi Anda"
                        className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-10 text-xs text-ink placeholder:text-ink-mute outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 grid size-7 place-items-center text-ink-mute hover:text-ink"
                      >
                        {showPw ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2.5 text-xs text-ink-soft cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="size-4 rounded border-line text-brand-600 accent-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <span>Ingat saya di perangkat ini</span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white shadow-[0_10px_25px_-8px_rgba(101,67,143,0.5)] transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:opacity-70"
                    >
                      {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <span>Masuk ke Dashboard</span>
                          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* QUICK DEMO ENTRY (Convenience button for seamless testing) */}
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={loading}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-brand-500/40 bg-brand-50/70 text-xs font-semibold text-brand-700 transition hover:bg-brand-100/70 hover:border-brand-500"
              >
                <Sparkles className="size-3.5 text-brand-600" />
                <span>Masuk Langsung sebagai Shilvia Anisa (Akun Demo)</span>
              </button>
            </form>
          </div>

          {/* BOTTOM FOOTER LINK */}
          <div className="mt-8 pt-4 border-t border-line text-center text-xs text-ink-soft">
            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="inline-flex items-center gap-1.5 font-bold text-ink hover:text-brand-700 hover:underline cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Kembali ke halaman Masuk</span>
              </button>
            )}

            {mode === "register" && (
              <p>
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-bold text-ink hover:text-brand-700 hover:underline cursor-pointer"
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
                  className="font-bold text-ink hover:text-brand-700 hover:underline cursor-pointer"
                >
                  Daftar sekarang
                </button>
              </p>
            )}
          </div>
        </section>
      </div>

      {/* FOOTER CAPTION / WATERMARK (Matching bottom caption in screenshot) */}
      <footer className="mt-6 text-center text-xs text-ink-mute">
        UndangKuy Web Admin • Multi-Event Birthday Invitation System • 1440 x 900
        Desktop Optimized
      </footer>
    </div>
  );
}
