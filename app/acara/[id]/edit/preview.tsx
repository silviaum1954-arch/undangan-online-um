"use client";

import { Calendar, MapPin, Mail, Music, Share2, Shirt } from "lucide-react";
import {
  THEMES,
  countdown,
  formatDate,
  initials,
  isHex,
  type InvitationForm,
  type Photo,
} from "./data";

export type PreviewTab = "cover" | "undangan" | "lokasi";

export default function Preview({
  form,
  photos,
  tab,
  now,
  onOpen,
  onDirections,
}: {
  form: InvitationForm;
  photos: Photo[];
  tab: PreviewTab;
  now: number;
  onOpen: () => void;
  onDirections: () => void;
}) {
  const theme = THEMES.find((t) => t.id === form.theme) ?? THEMES[0];
  const accent = isHex(form.accent) ? form.accent : "#634C89";
  const dark = theme.dark;
  const text = dark ? "text-white" : "text-ink";
  const soft = dark ? "text-slate-300" : "text-ink-soft";
  const cardCls = dark
    ? "border-white/10 bg-white/5"
    : "border-line bg-white shadow-sm";
  const cd = form.showCountdown ? countdown(form.eventDate, now, form.eventTime) : null;

  const btn = {
    backgroundColor: accent,
  };

  return (
    <div className="w-full max-w-[19rem] overflow-hidden rounded-[44px] border-[9px] border-slate-900 bg-white shadow-2xl ring-4 ring-black/5">
      <div className="relative flex h-8 items-center justify-between bg-slate-900 px-6 text-[11px] font-bold text-white">
        <span>09:41</span>
        <span className="absolute left-1/2 top-1 h-4 w-20 -translate-x-1/2 rounded-full bg-black" />
        <span className="text-[10px]">100%</span>
      </div>

      <div className={`h-[33rem] overflow-y-auto ${theme.screen} ${text}`}>
        {tab === "cover" && (
          <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
            <span
              className="grid size-20 place-items-center rounded-full text-white shadow-md"
              style={btn}
            >
              <Mail className="size-9" />
            </span>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${soft}`}>
                Undangan eksklusif
              </p>
              <h3 className="mt-1 font-serif text-xl font-bold">{form.hostName}</h3>
              <p className={`mt-1 text-xs ${soft}`}>{form.envelopeText}</p>
            </div>
            <button
              type="button"
              onClick={onOpen}
              className="w-full rounded-2xl py-3 text-xs font-bold text-white shadow-md"
              style={btn}
            >
              {form.openLabel || "Buka Undangan"}
            </button>
          </div>
        )}

        {tab === "undangan" && (
          <div className="space-y-3.5 p-4">
            <div
              className={`relative h-52 overflow-hidden rounded-3xl bg-linear-to-br ${theme.hero}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="grid size-28 place-items-center rounded-full border-4 border-white/90 bg-white/60 font-serif text-3xl font-bold text-brand-900 shadow-lg">
                  {initials(form.hostName)}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent p-4 text-white">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-rose-200">
                  {form.ageMoment}
                </p>
                <h2 className="font-serif text-xl font-bold leading-tight">
                  {form.hostName}
                </h2>
              </div>
            </div>

            <p className={`px-1 text-center text-xs italic ${soft}`}>{form.tagline}</p>

            {form.showCountdown && (
              <div className={`rounded-2xl border p-3.5 text-center ${cardCls}`}>
                <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${soft}`}>
                  Menghitung hari bahagia
                </p>
                {cd && !cd.over ? (
                  <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                    {[
                      [cd.days, "Hari"],
                      [cd.hours, "Jam"],
                      [cd.minutes, "Menit"],
                    ].map(([n, l]) => (
                      <div
                        key={l}
                        className={`rounded-xl p-2 ${dark ? "bg-white/10" : "bg-brand-50"}`}
                      >
                        <p className="text-base font-extrabold tabular-nums">{n}</p>
                        <p className={`text-[9px] font-medium uppercase ${soft}`}>{l}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs font-semibold">
                    {cd?.over ? "Acara sudah berlangsung 🎉" : "—"}
                  </p>
                )}
              </div>
            )}

            <div className={`flex items-start gap-3 rounded-2xl border p-3.5 ${cardCls}`}>
              <span
                className="grid size-9 shrink-0 place-items-center rounded-xl"
                style={{ backgroundColor: `${accent}1f`, color: accent }}
              >
                <Calendar className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold">{formatDate(form.eventDate)}</p>
                <p className={`mt-0.5 text-[11px] ${soft}`}>{form.eventTime}</p>
              </div>
            </div>

            <div className={`flex items-start gap-3 rounded-2xl border p-3.5 ${cardCls}`}>
              <span
                className="grid size-9 shrink-0 place-items-center rounded-xl"
                style={{ backgroundColor: `${accent}1f`, color: accent }}
              >
                <MapPin className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold">{form.venueName}</p>
                <p className={`mt-0.5 text-[11px] ${soft}`}>{form.venueAddress}</p>
              </div>
            </div>

            <div
              className="flex items-start gap-3 rounded-2xl border p-3.5"
              style={{ borderColor: `${accent}40`, backgroundColor: `${accent}12` }}
            >
              <Shirt className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />
              <div>
                <p className="text-xs font-bold">Dress code</p>
                <p className={`text-[11px] ${soft}`}>{form.dressCode}</p>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {photos.slice(0, 6).map((ph, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={ph.id}
                    src={ph.url}
                    alt={`Foto ${i + 1}`}
                    className="aspect-square rounded-xl object-cover"
                  />
                ))}
              </div>
            )}

            {(form.showCalendar || form.showShare) && (
              <div className="flex gap-2">
                {form.showCalendar && (
                  <span
                    className="flex-1 rounded-xl py-2.5 text-center text-[11px] font-bold text-white"
                    style={btn}
                  >
                    Simpan ke kalender
                  </span>
                )}
                {form.showShare && (
                  <span
                    className={`grid place-items-center rounded-xl border px-3 ${cardCls}`}
                    aria-label="Bagikan"
                  >
                    <Share2 className="size-4" style={{ color: accent }} />
                  </span>
                )}
              </div>
            )}

            {form.musicOn && form.musicPath && (
              <p className={`flex items-center justify-center gap-1.5 text-[10px] ${soft}`}>
                <Music className="size-3" /> Musik latar aktif
              </p>
            )}
          </div>
        )}

        {tab === "lokasi" && (
          <div className="space-y-3.5 p-4">
            <div
              className={`flex h-44 items-center justify-center rounded-2xl border ${
                dark ? "border-white/10 bg-white/10" : "border-line bg-slate-200"
              }`}
            >
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${soft}`}>
                <MapPin className="size-4 text-rose-500" />
                Peta {form.venueName}
              </span>
            </div>
            <div className={`rounded-2xl border p-3.5 ${cardCls}`}>
              <p className="text-xs font-bold">{form.venueName}</p>
              <p className={`mt-1 text-[11px] ${soft}`}>{form.venueAddress}</p>
              <button
                type="button"
                onClick={onDirections}
                className="mt-3 w-full rounded-xl py-2 text-xs font-bold text-white"
                style={btn}
              >
                Petunjuk arah Google Maps
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
