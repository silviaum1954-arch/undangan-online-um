import type { Json } from "@/lib/database.types";
import type { EventRow } from "@/lib/data/events";
import type { ThemeId } from "@/lib/themes";
import { THEMES } from "@/lib/themes";
export { THEMES, type Theme, type ThemeId } from "@/lib/themes";
export { formatDate, initials } from "@/lib/format";
export { countdown } from "@/lib/format";

export const ACCENTS = ["#8B4558", "#634C89", "#7e57c2", "#5c6bc0", "#ab47bc", "#311b92"];

export const MAX_PHOTOS = 10;

export interface Photo {
  id: string;
  path: string;
  url: string;
}

export interface InvitationForm {
  theme: ThemeId;
  accent: string;
  envelopeText: string;
  openLabel: string;
  hostName: string;
  ageMoment: string;
  tagline: string;
  eventDate: string; // yyyy-mm-dd
  eventTime: string;
  dressCode: string;
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  musicOn: boolean;
  /** storage path of the uploaded audio, empty when none */
  musicPath: string;
  showCountdown: boolean;
  showCalendar: boolean;
  showShare: boolean;
}

export const DEFAULT_FORM: InvitationForm = {
  theme: "flora",
  accent: "#8B4558",
  envelopeText: "Spesial untuk Tamu Terhormat",
  openLabel: "Buka Undangan",
  hostName: "",
  ageMoment: "",
  tagline: "",
  eventDate: "",
  eventTime: "",
  dressCode: "",
  venueName: "",
  venueAddress: "",
  mapsUrl: "",
  musicOn: false,
  musicPath: "",
  showCountdown: true,
  showCalendar: true,
  showShare: true,
};

export const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

/** Keys stored in events.design (everything not mapped to its own column). */
const DESIGN_KEYS = [
  "accent",
  "envelopeText",
  "openLabel",
  "hostName",
  "ageMoment",
  "tagline",
  "dressCode",
  "musicOn",
  "musicPath",
  "showCountdown",
  "showCalendar",
  "showShare",
] as const;

export function formFromEvent(row: EventRow): InvitationForm {
  const design = (row.design && typeof row.design === "object" && !Array.isArray(row.design)
    ? row.design
    : {}) as Record<string, unknown>;
  const pick = <K extends (typeof DESIGN_KEYS)[number]>(k: K) =>
    (design[k] ?? DEFAULT_FORM[k]) as InvitationForm[K];
  const theme = THEMES.some((t) => t.id === row.theme)
    ? (row.theme as ThemeId)
    : DEFAULT_FORM.theme;

  return {
    theme,
    accent: pick("accent"),
    envelopeText: pick("envelopeText"),
    openLabel: pick("openLabel"),
    hostName: pick("hostName"),
    ageMoment: pick("ageMoment"),
    tagline: pick("tagline"),
    dressCode: pick("dressCode"),
    musicOn: pick("musicOn"),
    musicPath: pick("musicPath"),
    showCountdown: pick("showCountdown"),
    showCalendar: pick("showCalendar"),
    showShare: pick("showShare"),
    eventDate: row.event_date,
    eventTime: row.event_time ?? "",
    venueName: row.venue_name ?? "",
    venueAddress: row.venue_address ?? "",
    mapsUrl: row.maps_url ?? "",
  };
}

export function patchFromForm(f: InvitationForm) {
  const design: Record<string, Json> = {};
  for (const k of DESIGN_KEYS) design[k] = f[k];
  return {
    theme: f.theme,
    event_date: f.eventDate,
    event_time: f.eventTime || null,
    venue_name: f.venueName || null,
    venue_address: f.venueAddress || null,
    maps_url: f.mapsUrl || null,
    design: design as Json,
  };
}
