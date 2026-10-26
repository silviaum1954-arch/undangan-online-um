export type RsvpStatus = "fiks" | "ragu" | "batal" | "pending";

export interface Guest {
  id: string;
  name: string;
  category: string;
  phone: string;
  quota: number;
  status: RsvpStatus;
  anak: number | null;
  dewasa: number | null;
  totalHadir: number | null;
  slug: string;
}

export const CATEGORIES = [
  "Sahabat Kuliah",
  "Teman SMA",
  "Teman Kampus",
  "Rekan Kerja",
  "VIP / Paman",
  "Keluarga Besar",
  "Tetangga",
  "Komunitas",
];

export const STATUS_META: Record<
  RsvpStatus,
  { label: string; badge: string; dot: string; text: string }
> = {
  fiks: {
    label: "Fiks datang",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  ragu: {
    label: "Belum pasti",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-400",
    text: "text-amber-700",
  },
  batal: {
    label: "Berhalangan",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-400",
    text: "text-rose-700",
  },
  pending: {
    label: "Belum respons",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
    text: "text-ink-mute",
  },
};

const g = (
  id: number,
  name: string,
  category: string,
  phone: string,
  quota: number,
  status: RsvpStatus,
  dewasa: number | null,
  anak: number | null,
): Guest => ({
  id: `g-${id}`,
  name,
  category,
  phone,
  quota,
  status,
  dewasa,
  anak,
  totalHadir: dewasa === null || anak === null ? null : dewasa + anak,
  slug: `shilvia/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`,
});

export const INITIAL_GUESTS: Guest[] = [
  g(1, "Budi Pratama", "Sahabat Kuliah", "+62 812-3456-7890", 4, "fiks", 2, 1),
  g(2, "Maya Salsabila", "Rekan Kerja", "+62 813-9876-5432", 2, "batal", 0, 0),
  g(3, "Kevin Sanjaya", "Keluarga Besar", "+62 856-7788-9900", 4, "pending", null, null),
  g(4, "Clarissa & Pasangan", "Teman SMA", "+62 818-4455-6677", 2, "fiks", 2, 0),
  g(5, "Om Dani & Keluarga", "VIP / Paman", "+62 811-2233-4455", 4, "fiks", 2, 2),
  g(6, "Rian Hidayat", "Komunitas", "+62 878-1122-3344", 3, "ragu", 1, 0),
  g(7, "Jessica Tanudjaya", "Teman Kampus", "+62 819-0011-2233", 2, "fiks", 1, 0),
  g(8, "Aris Munandar", "Tetangga", "+62 852-6677-8899", 4, "pending", null, null),
];

export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter((p) => /[a-z0-9]/i.test(p))
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "TM"
  );
}

export function guestSlug(name: string) {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `shilvia/${s || "tamu"}`;
}
