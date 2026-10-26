import type { Database } from "@/lib/database.types";
import { timeAgo } from "@/lib/format";

type WishRow = Database["public"]["Tables"]["wishes"]["Row"];

export interface Wish {
  id: string;
  sender: string;
  tag: string;
  timeAgo: string;
  createdAt: string;
  /** age in minutes, used for sorting */
  minutes: number;
  message: string;
  status: "tampil" | "disembunyikan";
  isSpam: boolean;
  liked: boolean;
}

export function toWish(row: WishRow, now: number): Wish {
  const created = new Date(row.created_at).getTime();
  return {
    id: row.id,
    sender: row.sender_name,
    tag: row.tag ?? "",
    timeAgo: timeAgo(row.created_at, now),
    createdAt: row.created_at,
    minutes: Math.floor((now - created) / 60000),
    message: row.message,
    status: row.status,
    isSpam: row.is_spam,
    liked: row.liked,
  };
}

export interface WishSettings {
  autoPublish: boolean;
  manualApproval: boolean;
  closed: boolean;
  spamFilter: boolean;
  charLimit: number | null;
}

export { initials } from "@/lib/format";
