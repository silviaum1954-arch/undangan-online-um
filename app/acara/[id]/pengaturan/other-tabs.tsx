"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Switch from "../switch";
import { Label, Section, btnPrimary, field } from "../ui";
import type { Prefs, ProfileData } from "./data";

export function AkunTab({
  profile,
  onSave,
}: {
  profile: ProfileData;
  onSave: (v: { fullName: string; phone: string }) => Promise<void>;
}) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [saving, setSaving] = useState(false);

  return (
    <Section title="Profil pemilik acara" desc="Informasi akun Anda di UndangKuy.">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await onSave({ fullName: fullName.trim(), phone: phone.trim() });
          setSaving(false);
        }}
      >
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="acc-name">Nama lengkap</Label>
            <input
              id="acc-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <Label htmlFor="acc-email">Email</Label>
            <input
              id="acc-email"
              type="email"
              value={profile.email}
              readOnly
              aria-describedby="acc-email-hint"
              className={`${field} bg-brand-50/50 text-ink-soft`}
            />
            <p id="acc-email-hint" className="mt-1 text-xs text-ink-mute">
              Email dipakai untuk masuk dan tidak bisa diubah di sini.
            </p>
          </div>
          <div>
            <Label htmlFor="acc-phone">Nomor WhatsApp</Label>
            <input
              id="acc-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={field}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end border-t border-line pt-5">
          <button type="submit" disabled={saving} className={`${btnPrimary} disabled:opacity-70`}>
            {saving ? "Menyimpan…" : "Simpan akun"}
          </button>
        </div>
      </form>
    </Section>
  );
}

export function PreferensiTab({
  prefs,
  onSave,
}: {
  prefs: Prefs;
  onSave: (p: Prefs) => Promise<void>;
}) {
  const [p, setP] = useState<Prefs>(prefs);
  const [saving, setSaving] = useState(false);

  const switches = [
    {
      label: "Ringkasan RSVP mingguan",
      desc: "Rekap kehadiran dikirim ke email setiap minggu.",
      checked: p.weekly,
      set: (v: boolean) => setP({ ...p, weekly: v }),
    },
    {
      label: "Ucapan baru",
      desc: "Beri tahu saya saat ada ucapan masuk.",
      checked: p.newWish,
      set: (v: boolean) => setP({ ...p, newWish: v }),
    },
  ];

  return (
    <Section title="Bahasa & notifikasi" desc="Atur bahasa, zona waktu, dan saluran notifikasi.">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await onSave(p);
          setSaving(false);
        }}
        className="max-w-xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pref-lang">Bahasa antarmuka</Label>
            <div className="relative">
              <select
                id="pref-lang"
                value={p.lang}
                onChange={(e) => setP({ ...p, lang: e.target.value })}
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
              <select
                id="pref-tz"
                value={p.tz}
                onChange={(e) => setP({ ...p, tz: e.target.value })}
                className={`${field} cursor-pointer appearance-none pr-9`}
              >
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
          <button type="submit" disabled={saving} className={`${btnPrimary} disabled:opacity-70`}>
            {saving ? "Menyimpan…" : "Simpan preferensi"}
          </button>
        </div>
      </form>
    </Section>
  );
}
