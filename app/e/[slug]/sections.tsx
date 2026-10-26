"use client";

import { useState } from "react";
import { CalendarPlus, Clock, Copy, Navigation, Shirt, Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Sprig } from "./ornaments";
import { storageUrl, str, bool, type PublicEvent } from "./model";

export const card = "rounded-2xl border border-(--inv-line) bg-(--inv-surface) shadow-sm";
export const pill =
  "mx-auto inline-flex items-center gap-2 rounded-full bg-(--inv-tint) px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-(--inv-accent)";
export const primaryBtn =
  "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--inv-accent) text-[12px] font-bold uppercase tracking-[0.14em] text-(--inv-on) shadow-[0_10px_24px_-10px_var(--inv-accent)] transition active:scale-[0.99] disabled:opacity-60";
export const softBtn =
  "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--inv-tint) text-[13px] font-semibold text-(--inv-accent) transition active:scale-[0.99]";

export function SectionHeading({
  badge,
  title,
  desc,
}: {
  badge: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="text-center">
      <span className={pill}>{badge}</span>
      <h2 className="mt-3 font-serif text-3xl font-semibold text-(--inv-accent)">{title}</h2>
      {desc && <p className="mx-auto mt-2 max-w-xs text-[13px] text-(--inv-soft)">{desc}</p>}
    </div>
  );
}

/** First HH:MM in a free-text time like "16:00 - 20:00 WIB". */
function times(time: string | null) {
  const found = [...(time ?? "").matchAll(/(\d{1,2})[:.](\d{2})/g)];
  const toMin = (m: RegExpMatchArray | undefined) => (m ? Number(m[1]) * 60 + Number(m[2]) : null);
  return { start: toMin(found[0]) ?? 0, end: toMin(found[1]) };
}

function remaining(iso: string, time: string | null, now: number) {
  if (!now) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y) return null;
  const { start } = times(time);
  const diff = new Date(y, m - 1, d, Math.floor(start / 60), start % 60).getTime() - now;
  if (diff <= 0) return { over: true, d: 0, h: 0, m: 0, s: 0 };
  return {
    over: false,
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

function downloadCalendar(data: PublicEvent) {
  const e = data.event;
  const { start, end } = times(e.event_time);
  const fin = end ?? Math.min(start + 180, 24 * 60 - 1);
  const stamp = (min: number) =>
    `${e.event_date.replaceAll("-", "")}T${String(Math.floor(min / 60)).padStart(2, "0")}${String(min % 60).padStart(2, "0")}00`;
  const place = [e.venue_name, e.venue_address].filter(Boolean).join(", ");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UndangKuy//ID",
    "BEGIN:VEVENT",
    `UID:${e.slug}-${e.event_date}@undangkuy`,
    `DTSTART;TZID=Asia/Jakarta:${stamp(start)}`,
    `DTEND;TZID=Asia/Jakarta:${stamp(fin)}`,
    `SUMMARY:${e.title}`,
    `LOCATION:${place}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.slug}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function InfoSection({
  data,
  now,
  onMap,
}: {
  data: PublicEvent;
  now: number;
  onMap: () => void;
}) {
  const e = data.event;
  const d = e.design;
  const host = str(d.hostName) || e.title;
  const cd = remaining(e.event_date, e.event_time, now);
  const showCountdown = bool(d.showCountdown);

  return (
    <div className="space-y-4">
      <div className="relative text-center">
        <Sprig className="absolute -left-4 -top-3 size-20 opacity-70" />
        <Sprig className="absolute -right-4 -top-3 size-20 -scale-x-100 opacity-70" />
        <span className={pill}>{str(d.ageMoment) ? `Perayaan ${str(d.ageMoment)}` : "Undangan"}</span>
        <h2 className="mt-3 font-script text-6xl leading-[1.05] text-(--inv-accent)">{host}</h2>
        {str(d.tagline) && (
          <p className="mx-auto mt-2 max-w-xs font-serif text-[15px] italic text-(--inv-soft)">
            {str(d.tagline)}
          </p>
        )}
      </div>

      {data.photos.length > 0 && (
        <div
          className={`grid gap-2 ${
            data.photos.length === 1
              ? "grid-cols-1"
              : data.photos.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {data.photos.slice(0, 6).map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p}
              src={storageUrl(p)}
              alt={`Foto ${i + 1}`}
              className={`rounded-2xl object-cover ${
                data.photos.length === 1 ? "aspect-4/3 w-full" : "aspect-square"
              }`}
            />
          ))}
        </div>
      )}

      <div className={`${card} grid grid-cols-2 divide-x divide-(--inv-line) p-4`}>
        <div className="flex items-start gap-3 pr-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--inv-tint) text-(--inv-accent)">
            <Calendar className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-(--inv-soft)">
              Hari &amp; tanggal
            </p>
            <p className="mt-0.5 text-[13px] font-bold leading-snug">{formatDate(e.event_date)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 pl-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--inv-tint) text-(--inv-accent)">
            <Clock className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-(--inv-soft)">
              Waktu acara
            </p>
            <p className="mt-0.5 text-[13px] font-bold leading-snug">{e.event_time || "—"}</p>
          </div>
        </div>
      </div>

      {showCountdown && (
        <div className={`${card} p-4 text-center`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-(--inv-accent)">
            Menghitung hari bahagia
          </p>
          {cd && !cd.over ? (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {(
                [
                  [cd.d, "Hari"],
                  [cd.h, "Jam"],
                  [cd.m, "Menit"],
                  [cd.s, "Detik"],
                ] as const
              ).map(([n, l]) => (
                <div key={l} className="rounded-xl bg-(--inv-tint) py-3">
                  <p className="font-serif text-2xl font-bold tabular-nums">
                    {String(n).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-(--inv-soft)">{l}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 font-serif text-lg font-semibold">
              {cd?.over ? "Acara sudah berlangsung 🎉" : "—"}
            </p>
          )}
        </div>
      )}

      {e.venue_name && (
        <div className={`${card} flex items-start gap-3 p-4`}>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-(--inv-tint) text-(--inv-accent)">
            <MapPin className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-(--inv-soft)">
                Lokasi perayaan
              </p>
              <button
                type="button"
                onClick={onMap}
                className="shrink-0 text-[11px] font-semibold text-(--inv-accent)"
              >
                Lihat peta →
              </button>
            </div>
            <p className="font-serif text-lg font-bold leading-snug">{e.venue_name}</p>
            {e.venue_address && <p className="text-[13px] text-(--inv-soft)">{e.venue_address}</p>}
          </div>
        </div>
      )}

      {str(d.dressCode) && (
        <div className="flex items-start gap-3 rounded-2xl bg-(--inv-tint) p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-(--inv-accent) text-(--inv-on)">
            <Shirt className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-(--inv-soft)">
              Panduan busana / dress code
            </p>
            <p className="mt-0.5 font-serif text-lg font-bold leading-snug">{str(d.dressCode)}</p>
          </div>
        </div>
      )}

      {bool(d.showCalendar) && (
        <button type="button" onClick={() => downloadCalendar(data)} className={primaryBtn}>
          <CalendarPlus className="size-4" />
          Simpan ke kalender
        </button>
      )}
    </div>
  );
}

export function LocationSection({ data }: { data: PublicEvent }) {
  const e = data.event;
  const [copied, setCopied] = useState(false);
  const place = [e.venue_name, e.venue_address].filter(Boolean).join(", ");
  const mapsUrl =
    e.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(place);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        badge="Petunjuk arah"
        title="Lokasi Acara"
        desc={e.venue_name ?? undefined}
      />
      {place ? (
        <div className="overflow-hidden rounded-2xl border border-(--inv-line) shadow-sm">
          <iframe
            title={`Peta ${e.venue_name ?? "lokasi acara"}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-64 w-full border-0"
          />
        </div>
      ) : (
        <div className={`${card} p-6 text-center text-[13px] text-(--inv-soft)`}>
          Lokasi acara belum diisi.
        </div>
      )}

      {place && (
        <div className={`${card} p-4`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-(--inv-soft)">
            Resepsi &amp; syukuran
          </p>
          <p className="font-serif text-xl font-bold">{e.venue_name}</p>
          {e.venue_address && (
            <p className="mt-2 flex items-start gap-2 text-[13px] text-(--inv-soft)">
              <MapPin className="mt-0.5 size-4 shrink-0 text-(--inv-accent)" />
              {e.venue_address}
            </p>
          )}
          <p className="mt-2 flex items-center gap-2 text-[13px] text-(--inv-soft)">
            <Calendar className="size-4 shrink-0 text-(--inv-accent)" />
            {formatDate(e.event_date)}
            {e.event_time ? ` · ${e.event_time}` : ""}
          </p>
        </div>
      )}

      {place && (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={copy} className={softBtn}>
            <Copy className="size-4" />
            {copied ? "Tersalin" : "Salin alamat"}
          </button>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className={primaryBtn}>
            <Navigation className="size-4" />
            Buka Maps
          </a>
        </div>
      )}
    </div>
  );
}
