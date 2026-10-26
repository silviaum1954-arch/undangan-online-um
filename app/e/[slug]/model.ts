import { themeById } from "@/lib/themes";

export interface PublicAccount {
  id: string;
  type: "bank" | "e_wallet";
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_primary: boolean;
}

export interface PublicWish {
  id: string;
  sender: string;
  message: string;
  created_at: string;
}

export interface PublicGuest {
  name: string;
  quota: number;
  status: "fiks" | "ragu" | "batal" | "pending";
  adults: number | null;
  children: number | null;
}

/** Shape returned by the get_public_event() database function. */
export interface PublicEvent {
  event: {
    title: string;
    slug: string;
    status: "draf" | "terbit" | "selesai" | "diarsipkan";
    event_date: string;
    event_time: string | null;
    venue_name: string | null;
    venue_address: string | null;
    maps_url: string | null;
    theme: string;
    design: Record<string, unknown>;
    og_title: string | null;
    og_description: string | null;
    og_image_path: string | null;
  };
  photos: string[];
  guest: PublicGuest | null;
  rsvp_open: boolean;
  wishes: PublicWish[];
  wish_settings: { closed: boolean; char_limit: number | null; needs_approval: boolean };
  gift: {
    qris_path: string | null;
    transfer_form: boolean;
    accounts: PublicAccount[];
  } | null;
  gift_locked: boolean;
}

export interface Palette {
  bg: string;
  surface: string;
  tint: string;
  ink: string;
  soft: string;
  line: string;
  accent: string;
  onAccent: string;
  dark: boolean;
}

const BASE: Record<string, Omit<Palette, "accent" | "onAccent"> & { accent: string }> = {
  flora: { bg: "#fff3f0", surface: "#ffffff", tint: "#fde5e0", ink: "#4a2530", soft: "#8a6670", line: "#f3d3cd", accent: "#8b4558", dark: false },
  noir: { bg: "#0f1220", surface: "#181c30", tint: "#232843", ink: "#f3ecd8", soft: "#aeb3c8", line: "#2c3150", accent: "#d9b86c", dark: true },
  soft: { bg: "#f4f2fc", surface: "#ffffff", tint: "#e6e1f7", ink: "#2b2552", soft: "#6c6791", line: "#ddd8f1", accent: "#6b5bb5", dark: false },
  gold: { bg: "#fbf6ea", surface: "#fffdf7", tint: "#f6ead0", ink: "#4a3a16", soft: "#86744a", line: "#eadcb8", accent: "#a9791f", dark: false },
};

const isHex = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

function onColor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#2b1b12" : "#ffffff";
}

export function paletteFor(themeId: string, designAccent: unknown): Palette {
  const base = BASE[themeById(themeId).id] ?? BASE.flora;
  const accent = isHex(designAccent) ? designAccent : base.accent;
  return { ...base, accent, onAccent: onColor(accent) };
}

export const storageUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-media/${path}`;

export const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
export const bool = (v: unknown, fallback = true) => (typeof v === "boolean" ? v : fallback);
