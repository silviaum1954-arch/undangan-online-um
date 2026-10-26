"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Switch from "../switch";
import { Label, Section, btnPrimary, field } from "./ui";

export function AkunTab({ onSave }: { onSave: () => void }) {
  return (
    <Section title="Profil pemilik acara" desc="Informasi akun Anda di UndangKuy.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="acc-name">Nama lengkap</Label>
            <input id="acc-name" defaultValue="Shilvia Anisa" className={field} />
          </div>
          <div>
            <Label htmlFor="acc-email">Email</Label>
            <input
              id="acc-email"
              type="email"
              defaultValue="shilvia@gmail.com"
              className={field}
            />
          </div>
          <div>
            <Label htmlFor="acc-phone">Nomor WhatsApp</Label>
            <input
              id="acc-phone"
              type="tel"
              defaultValue="+62 812-3456-7890"
              className={field}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[13px] font-semibold">Paket</span>
            <div className="flex h-11 items-center justify-between rounded-xl bg-brand-50 px-3.5 text-sm">
              <span className="font-semibold text-brand-700">UndangKuy Premium</span>
              <span className="text-xs font-medium text-emerald-700">Aktif</span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end border-t border-line pt-5">
          <button type="submit" className={btnPrimary}>
            Simpan akun
          </button>
        </div>
      </form>
    </Section>
  );
}

export function PreferensiTab({ onSave }: { onSave: () => void }) {
  const [weekly, setWeekly] = useState(true);
  const [newWish, setNewWish] = useState(true);

  const switches = [
    {
      label: "Ringkasan RSVP mingguan",
      desc: "Rekap kehadiran dikirim ke email setiap minggu.",
      checked: weekly,
      set: setWeekly,
    },
    {
      label: "Ucapan baru",
      desc: "Beri tahu saya saat ada ucapan masuk.",
      checked: newWish,
      set: setNewWish,
    },
  ];

  return (
    <Section title="Bahasa & notifikasi" desc="Atur bahasa, zona waktu, dan saluran notifikasi.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="max-w-xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pref-lang">Bahasa antarmuka</Label>
            <div className="relative">
              <select
                id="pref-lang"
                className={`${field} cursor-pointer appearance-none pr-9`}
              >
                <option>Bahasa Indonesia</option>
                <option>English (US)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
            </div>
          </div>
          <div>
            <Label htmlFor="pref-tz">Zona waktu acara</Label>
            <div className="relative">
              <select id="pref-tz" className={`${field} cursor-pointer appearance-none pr-9`}>
                <option>WIB (GMT+07:00)</option>
                <option>WITA (GMT+08:00)</option>
                <option>WIT (GMT+09:00)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
            </div>
          </div>
        </div>

        <ul className="mt-5 divide-y divide-line border-t border-line">
          {switches.map((s) => (
            <li key={s.label} className="flex items-start justify-between gap-4 py-4">
              <div>
                <p className="text-[13px] font-semibold">{s.label}</p>
                <p className="mt-0.5 text-xs text-ink-mute">{s.desc}</p>
              </div>
              <Switch checked={s.checked} onChange={s.set} label={s.label} />
            </li>
          ))}
        </ul>

        <div className="mt-2 flex justify-end border-t border-line pt-5">
          <button type="submit" className={btnPrimary}>
            Simpan preferensi
          </button>
        </div>
      </form>
    </Section>
  );
}
