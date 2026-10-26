"use client";

import { useState, type FormEvent } from "react";
import { Sparkles, X } from "lucide-react";
import { THEMES } from "@/lib/themes";

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
  const [theme, setTheme] = useState<string>(THEMES[0].id);

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
              {THEMES.slice(0, 3).map((t) => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTheme(t.id)}
                    className={`overflow-hidden rounded-xl border text-left transition ${
                      active
                        ? "border-brand-600 ring-2 ring-brand-200"
                        : "border-line hover:border-brand-200"
                    }`}
                  >
                    <div className={`h-12 bg-linear-to-br ${t.hero}`} />
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
