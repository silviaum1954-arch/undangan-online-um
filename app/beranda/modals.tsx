"use client";

import { useState, type FormEvent } from "react";
import { Sparkles, X } from "lucide-react";
import { THEMES, THEME_OPTIONS, type EventItem } from "./data";

export function PreviewModal({
  event,
  onClose,
  onRsvp,
}: {
  event: EventItem;
  onClose: () => void;
  onRsvp: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xs">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-11 right-0 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/30"
        >
          <X className="size-3.5" /> Tutup
        </button>
        <div className="overflow-hidden rounded-[36px] border-[6px] border-slate-900 bg-white shadow-2xl">
          <div className="flex h-6 items-center justify-center bg-slate-900">
            <div className="h-1.5 w-16 rounded-full bg-slate-700" />
          </div>
          <div className="flex h-[30rem] flex-col justify-between overflow-y-auto bg-brand-50/40 p-6 text-center">
            <div>
              <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-[10px] font-semibold text-brand-700">
                {event.theme.name}
              </span>
              <h2 className="mt-4 font-serif text-2xl font-bold leading-tight text-ink">
                {event.title}
              </h2>
              <p className="mt-2 text-xs text-ink-soft">
                Kami mengundang Anda untuk hadir dalam momen bahagia kami.
              </p>
              <div className="mt-6 rounded-2xl border border-line bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
                  Tanggal
                </p>
                <p className="mt-1 text-sm font-bold text-ink">
                  {event.dateFormatted}
                </p>
                <p className="mt-0.5 text-xs text-brand-700">
                  Pukul 15:00 WIB – selesai
                </p>
              </div>
              <div className="mt-3 rounded-2xl border border-line bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
                  Lokasi
                </p>
                <p className="mt-1 text-xs font-bold text-ink">
                  Grand Ballroom Hotel Jasmine
                </p>
                <p className="text-[11px] text-ink-soft">
                  Jl. Flamboyan No. 24, Jakarta Selatan
                </p>
              </div>
            </div>
            <div className="pt-5">
              <button
                type="button"
                onClick={onRsvp}
                className="h-11 w-full rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-700"
              >
                Konfirmasi kehadiran
              </button>
              <p className="mt-2 text-[10px] text-ink-mute">
                Simulasi tampilan di ponsel tamu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const fieldCls =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-mute focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function CreateEventModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (v: { title: string; date: string; theme: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [theme, setTheme] = useState(THEME_OPTIONS[0]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), date, theme });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">Buat acara baru</h3>
              <p className="text-[13px] text-ink-soft">
                Isi detail awal, desain bisa diubah nanti.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="grid size-8 place-items-center rounded-lg text-ink-mute hover:bg-brand-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="evt-title"
              className="mb-1.5 block text-[13px] font-semibold text-ink"
            >
              Nama acara
            </label>
            <input
              id="evt-title"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Ulang Tahun Kenzo ke-5"
              className={fieldCls}
            />
          </div>
          <div>
            <label
              htmlFor="evt-date"
              className="mb-1.5 block text-[13px] font-semibold text-ink"
            >
              Tanggal acara
            </label>
            <input
              id="evt-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fieldCls}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">
              Tema awal
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {THEME_OPTIONS.map((name) => {
                const t = THEMES[name];
                const active = theme === name;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTheme(name)}
                    className={`overflow-hidden rounded-xl border text-left transition ${
                      active
                        ? "border-brand-600 ring-2 ring-brand-200"
                        : "border-line hover:border-brand-200"
                    }`}
                  >
                    <div className={`h-12 bg-linear-to-br ${t.cover}`} />
                    <div className="p-2.5">
                      <p className="truncate font-serif text-xs font-semibold text-ink">
                        {t.name}
                      </p>
                      <p className="truncate text-[10px] text-ink-mute">
                        {t.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-line pt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl px-4 text-[13px] font-semibold text-ink-soft hover:bg-brand-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-10 rounded-xl bg-brand-600 px-5 text-[13px] font-bold text-white hover:bg-brand-700"
            >
              Simpan &amp; lanjut edit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
