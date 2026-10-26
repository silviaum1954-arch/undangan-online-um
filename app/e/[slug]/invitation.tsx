"use client";

import { useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  Gift,
  Heart,
  Mail,
  MailOpen,
  MapPin,
  Share2,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { GiftSection, RsvpSection, WishSection } from "./forms";
import { InfoSection, LocationSection } from "./sections";
import { Petals, Sprig } from "./ornaments";
import { bool, paletteFor, storageUrl, str, type PublicEvent } from "./model";

type Tab = "info" | "lokasi" | "rsvp" | "ucapan" | "angpao";

function subscribe(cb: () => void) {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
}
const getNow = () => Math.floor(Date.now() / 1000) * 1000;
const getServerNow = () => 0;

function Envelope({ opening }: { opening: boolean }) {
  return (
    <svg viewBox="0 0 280 200" className="w-[17rem] drop-shadow-[0_18px_30px_rgba(74,37,48,0.25)]" aria-hidden>
      <rect x="0" y="24" width="280" height="172" rx="12" fill="var(--inv-accent)" />
      <path d="M0 34 L140 124 L0 190 Z" fill="#fff" opacity="0.12" />
      <path d="M280 34 L140 124 L280 190 Z" fill="#fff" opacity="0.12" />
      <path d="M0 196 L140 112 L280 196 Z" fill="#000" opacity="0.14" />
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "top",
          transform: opening ? "rotateX(180deg)" : "none",
          transition: "transform 600ms ease",
        }}
      >
        <path d="M0 34 Q0 24 12 24 H268 Q280 24 280 34 L140 128 Z" fill="var(--inv-accent)" />
        <path d="M0 34 Q0 24 12 24 H268 Q280 24 280 34 L140 128 Z" fill="#000" opacity="0.1" />
      </g>
      <g style={{ opacity: opening ? 0 : 1, transition: "opacity 300ms" }}>
        <circle cx="140" cy="118" r="22" fill="#e9a824" />
        <circle cx="140" cy="118" r="17" fill="none" stroke="#fff" strokeOpacity="0.5" />
        <path d="M140 108 c8 0 12 7 9 15 c-2 5 -6 8 -9 8 c-3 0 -7 -3 -9 -8 c-3 -8 1 -15 9 -15Z" fill="#8a4a12" opacity="0.85" />
      </g>
    </svg>
  );
}

function Cover({
  data,
  accentVars,
  onOpen,
  onStartAudio,
}: {
  data: PublicEvent;
  accentVars: CSSProperties;
  onOpen: () => void;
  onStartAudio: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const d = data.event.design;
  const host = str(d.hostName) || data.event.title;
  const age = str(d.ageMoment);

  function open() {
    if (opening) return;
    onStartAudio();
    setOpening(true);
    setTimeout(onOpen, 650);
  }

  return (
    <div
      style={accentVars}
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-6 pb-8 pt-10 text-center"
    >
      <Petals />
      <Sprig className="absolute -left-2 -top-2 size-24" />
      <Sprig className="absolute -right-2 -top-2 size-24 -scale-x-100" />
      <Sprig className="absolute -bottom-2 -left-2 size-32 -scale-y-100" />
      <Sprig className="absolute -bottom-2 -right-2 size-32 -scale-100" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-(--inv-tint) blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-16 size-64 rounded-full bg-(--inv-tint) blur-2xl"
      />

      <div className="relative">
        <p className="font-serif text-sm italic text-(--inv-soft)">
          Dengan penuh cinta, kami mengundang Anda ke
        </p>
        <h1 className="mt-1 font-script text-6xl leading-[1.05] text-(--inv-accent)">{host}</h1>
        {age && (
          <p className="mt-4 flex items-center justify-center gap-3 font-serif text-sm font-semibold uppercase tracking-[0.3em] text-(--inv-ink)">
            <span className="h-px w-8 bg-(--inv-line)" />
            {age}
            <span className="h-px w-8 bg-(--inv-line)" />
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={open}
        aria-label="Buka amplop"
        className="relative flex flex-col items-center gap-3 transition active:scale-[0.98]"
      >
        <Envelope opening={opening} />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--inv-accent)">
          Ketuk amplop untuk membuka
        </span>
      </button>

      <div className="relative w-full space-y-4">
        <div className="rounded-2xl border border-(--inv-line) bg-(--inv-surface) px-5 py-4 shadow-sm">
          <p className="font-serif text-xs italic text-(--inv-soft)">Kepada Yth.</p>
          <p className="mt-0.5 font-serif text-xl font-bold text-(--inv-ink)">
            {data.guest?.name ?? "Tamu Undangan"}
          </p>
          <p className="mt-1 text-[11px] text-(--inv-soft)">
            Mohon maaf bila ada kesalahan penulisan nama/gelar
          </p>
        </div>
        <button
          type="button"
          onClick={open}
          className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-(--inv-accent) text-sm font-semibold uppercase tracking-[0.25em] text-(--inv-on) shadow-[0_14px_30px_-10px_var(--inv-accent)]"
        >
          <MailOpen className="size-4" />
          Click to open
        </button>
      </div>
    </div>
  );
}

export default function Invitation({
  data,
  guestSlug,
}: {
  data: PublicEvent;
  guestSlug: string | null;
}) {
  const palette = paletteFor(data.event.theme, data.event.design.accent);
  const vars = {
    "--inv-bg": palette.bg,
    "--inv-surface": palette.surface,
    "--inv-tint": palette.tint,
    "--inv-ink": palette.ink,
    "--inv-soft": palette.soft,
    "--inv-line": palette.line,
    "--inv-accent": palette.accent,
    "--inv-on": palette.onAccent,
  } as CSSProperties;

  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicPath = bool(data.event.design.musicOn, false) ? str(data.event.design.musicPath) : "";

  function startAudio() {
    // called inside the tap on the envelope so browsers allow playback
    audioRef.current?.play().catch(() => setMuted(true));
  }

  function toggleMute() {
    const a = audioRef.current;
    if (!a) return;
    if (muted || a.paused) {
      a.play().then(() => setMuted(false)).catch(() => setMuted(true));
    } else {
      a.pause();
      setMuted(true);
    }
  }
  const [tab, setTab] = useState<Tab>("info");
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);

  const hasGift = data.gift !== null || data.gift_locked;
  const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: "info", label: "Info", icon: Mail },
    { id: "lokasi", label: "Lokasi", icon: MapPin },
    { id: "rsvp", label: "RSVP", icon: CalendarCheck },
    { id: "ucapan", label: "Ucapan", icon: Heart },
    ...(hasGift ? [{ id: "angpao" as const, label: "Angpao", icon: Gift }] : []),
  ];

  const host = str(data.event.design.hostName) || data.event.title;

  async function share() {
    const url = window.location.href.split("?")[0];
    try {
      if (navigator.share) await navigator.share({ title: data.event.title, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <div className="min-h-screen bg-(--inv-tint)" style={vars}>
      {musicPath && (
        <audio ref={audioRef} src={storageUrl(musicPath)} loop preload="auto" />
      )}
      <div className="relative mx-auto min-h-screen w-full max-w-107.5 bg-(--inv-bg) text-(--inv-ink) shadow-2xl">
        {!opened ? (
          <Cover
            data={data}
            accentVars={vars}
            onOpen={() => setOpened(true)}
            onStartAudio={startAudio}
          />
        ) : (
          <>
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-(--inv-line) bg-(--inv-bg)/90 px-4 backdrop-blur">
              <button
                type="button"
                onClick={() => setOpened(false)}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-(--inv-accent)"
              >
                <ArrowLeft className="size-4" /> Amplop
              </button>
              <p className="min-w-0 truncate font-script text-3xl leading-none text-(--inv-accent)">
                {host}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {musicPath && (
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={muted ? "Nyalakan musik" : "Matikan musik"}
                    className="grid size-9 place-items-center rounded-full bg-(--inv-tint) text-(--inv-accent)"
                  >
                    {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={share}
                  aria-label="Bagikan undangan"
                  className="grid size-9 place-items-center rounded-full bg-(--inv-tint) text-(--inv-accent)"
                >
                  <Share2 className="size-4" />
                </button>
              </div>
            </header>

            <main className="px-4 pb-32 pt-6">
              {tab === "info" && (
                <InfoSection data={data} now={now} onMap={() => setTab("lokasi")} />
              )}
              {tab === "lokasi" && <LocationSection data={data} />}
              {tab === "rsvp" && <RsvpSection data={data} guestSlug={guestSlug} />}
              {tab === "ucapan" && <WishSection data={data} guestSlug={guestSlug} now={now} />}
              {tab === "angpao" && <GiftSection data={data} guestSlug={guestSlug} />}
            </main>

            <nav
              aria-label="Menu undangan"
              className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-107.5 -translate-x-1/2 justify-around border-t border-(--inv-line) bg-(--inv-surface)/95 px-2 pb-3 pt-2 backdrop-blur"
            >
              {tabs.map(({ id, label, icon: Icon }) => {
                const on = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={on ? "page" : undefined}
                    onClick={() => {
                      setTab(id);
                      window.scrollTo({ top: 0 });
                    }}
                    className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] transition ${
                      on ? "font-bold text-(--inv-accent)" : "text-(--inv-soft)"
                    }`}
                  >
                    <Icon className="size-5" strokeWidth={on ? 2.4 : 1.8} />
                    {label}
                  </button>
                );
              })}
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
