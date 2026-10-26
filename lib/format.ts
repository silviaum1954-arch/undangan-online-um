const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function parts(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return y && m && d ? { y, m, d } : null;
}

/** All formatters are locale-independent so server and client render alike. */
export function formatDate(iso: string) {
  const p = parts(iso);
  if (!p) return "Tanggal belum diisi";
  return `${DAYS[new Date(p.y, p.m - 1, p.d).getDay()]}, ${p.d} ${MONTHS[p.m - 1]} ${p.y}`;
}

export function formatDateLong(iso: string) {
  const p = parts(iso);
  return p ? `${p.d} ${MONTHS[p.m - 1]} ${p.y}` : "—";
}

export function formatDateShort(iso: string) {
  const p = parts(iso);
  return p ? `${p.d} ${MONTHS[p.m - 1].slice(0, 3)} ${p.y}` : "—";
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Slug with a short random suffix so two events never collide. */
export function uniqueSlug(text: string) {
  const base = slugify(text) || "acara";
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base}-${rand}`;
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter((p) => /[a-z0-9]/i.test(p))
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "?"
  );
}

export const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

/** "12 mnt lalu", "3 jam lalu", "Kemarin", "5 hari lalu" */
export function timeAgo(iso: string, now: number) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Baru saja";
  if (min < 60) return `${min} mnt lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  return day === 1 ? "Kemarin" : `${day} hari lalu`;
}

/** Remaining time until the event starts. `time` is free text like
 *  "16:00 - 20:00 WIB"; the first HH:MM is the start (default 00:00). */
export function countdown(iso: string, now: number, time?: string | null) {
  if (!now) return null;
  const p = parts(iso);
  if (!p) return null;
  const m = time?.match(/(\d{1,2})[:.](\d{2})/);
  const start = new Date(p.y, p.m - 1, p.d, m ? Number(m[1]) : 0, m ? Number(m[2]) : 0).getTime();
  const diff = start - now;
  if (diff <= 0) return { over: true, days: 0, hours: 0, minutes: 0 };
  return {
    over: false,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  };
}

/** "27 Okt 2026, 14:20 WIB" — fixed to Asia/Jakarta without relying on Intl. */
export function formatDateTimeWib(iso: string) {
  const d = new Date(new Date(iso).getTime() + 7 * 3600000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} WIB`;
}

/** Current time in ms; call only from server code after a request-time API. */
export const nowMs = () => Date.now();

/** wa.me needs an international number: 0812… → 62812…, +62 812 → 62812… */
export function waNumber(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") ? `62${d.slice(1)}` : d;
}

/** Quote-safe CSV cell. */
export const csvCell = (v: string | number | null | undefined) =>
  `"${String(v ?? "").replace(/"/g, '""')}"`;

/** Download rows as a UTF-8 CSV (BOM so Excel reads accents correctly). */
export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  const body = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
