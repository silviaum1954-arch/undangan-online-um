import { Suspense } from "react";
import { CalendarCheck, Gift, Mail, Repeat, ShieldCheck, type LucideIcon } from "lucide-react";
import AuthForm from "./auth-form";

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: CalendarCheck,
    title: "RSVP Rapi & Otomatis",
    description: "Pantau konfirmasi kehadiran tamu secara langsung dalam hitungan detik.",
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
    description: "Kelola multi-acara di bawah satu akun admin tanpa batasan tanggal acara.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f0ecf6] p-4 selection:bg-brand-500/20 selection:text-brand-900 sm:p-6 lg:p-10">
      <div className="grid w-full max-w-295 grid-cols-1 overflow-hidden rounded-4xl bg-white shadow-[0_24px_70px_-20px_rgba(42,27,69,0.20)] ring-1 ring-line lg:grid-cols-[1fr_1.15fr]">
        <aside className="relative order-2 flex flex-col justify-between border-t border-line/80 bg-brand-50 p-8 sm:p-10 lg:order-1 lg:border-r lg:border-t-0 lg:p-12">
          <div>
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

            <div className="mt-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/80 bg-white/80 px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-brand-600" />
                Platform Undangan Digital
              </span>
            </div>

            <h1 className="mt-4 text-balance text-3xl font-extrabold leading-[1.18] tracking-tight text-ink sm:text-[2.2rem]">
              Kelola Acara Ulang Tahun Lebih Rapi &amp; Elegan.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Buat undangan ulang tahun digital dalam hitungan menit.
            </p>

            <div className="mt-8 space-y-3.5">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group flex items-start gap-4 rounded-2xl border border-white/80 bg-white p-4 shadow-[0_4px_16px_-4px_rgba(42,27,69,0.06)] transition hover:border-brand-200 hover:shadow-md"
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

          <div className="mt-10 flex items-center gap-2 border-t border-line/70 pt-5 text-xs font-medium text-ink-soft">
            <ShieldCheck className="size-4 shrink-0 text-brand-600" />
            <span>© 2026 UndangKuy</span>
          </div>
        </aside>

        <Suspense fallback={<section className="order-1 bg-white p-8 lg:order-2" />}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
