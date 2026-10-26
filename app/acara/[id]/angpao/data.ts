import type { Database } from "@/lib/database.types";
import { formatDateTimeWib } from "@/lib/format";

type AccountRow = Database["public"]["Tables"]["payment_accounts"]["Row"];
type TransferRow = Database["public"]["Tables"]["gift_confirmations"]["Row"];

export type AccountType = "Bank" | "E-Wallet";

export interface Account {
  id: string;
  bankName: string;
  type: AccountType;
  accountNumber: string;
  accountHolder: string;
  isPrimary?: boolean;
  isActive: boolean;
}

export interface Transfer {
  id: string;
  sender: string;
  destination: string;
  amount: number;
  time: string;
}

export const MAX_ACCOUNTS = 5;

export const BANKS: Record<AccountType, string[]> = {
  Bank: [
    "Bank Central Asia (BCA)",
    "Bank Mandiri",
    "Bank BNI",
    "Bank BRI",
    "Bank Syariah Indonesia (BSI)",
    "Bank Jenius (BTPN)",
    "Bank CIMB Niaga",
  ],
  "E-Wallet": ["GoPay", "ShopeePay", "OVO", "DANA", "LinkAja"],
};

/** Brand tile for known providers; falls back to the product purple. */
export function logoFor(name: string): { bg: string; text: string } {
  const n = name.toLowerCase();
  if (n.includes("bca")) return { bg: "bg-[#003882]", text: "BCA" };
  if (n.includes("mandiri")) return { bg: "bg-[#003d79]", text: "MDR" };
  if (n.includes("bni")) return { bg: "bg-[#f15a24]", text: "BNI" };
  if (n.includes("bri")) return { bg: "bg-[#00529c]", text: "BRI" };
  if (n.includes("gopay")) return { bg: "bg-[#00aed6]", text: "GoPay" };
  if (n.includes("ovo")) return { bg: "bg-[#4c3298]", text: "OVO" };
  if (n.includes("shopee")) return { bg: "bg-[#ee4d2d]", text: "SPay" };
  if (n.includes("dana")) return { bg: "bg-[#118eea]", text: "DANA" };
  return { bg: "bg-brand-700", text: name.slice(0, 3).toUpperCase() };
}

export { rupiah } from "@/lib/format";

export const toDbType = (t: AccountType) => (t === "Bank" ? "bank" : "e_wallet") as "bank" | "e_wallet";

export function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    bankName: row.bank_name,
    type: row.type === "bank" ? "Bank" : "E-Wallet",
    accountNumber: row.account_number,
    accountHolder: row.account_holder,
    isPrimary: row.is_primary,
    isActive: row.is_active,
  };
}

export function toTransfer(row: TransferRow): Transfer {
  return {
    id: row.id,
    sender: row.sender_name,
    destination: row.destination,
    amount: row.amount,
    time: formatDateTimeWib(row.created_at),
  };
}

export interface GiftSettings {
  enabled: boolean;
  personalOnly: boolean;
  transferForm: boolean;
  emailNotify: boolean;
}

export { initials } from "@/lib/format";
